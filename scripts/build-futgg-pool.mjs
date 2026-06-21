import https from 'https'
import fs from 'fs'

const POSITION_GROUPS = {
  GK: ['GK'],
  DEF: ['CB', 'LB', 'RB'],
  MID: ['CAM', 'CM', 'CDM', 'RM', 'LM'],
  ST: ['ST', 'CF', 'LW', 'RW'],
}

const SITEMAP_URL = 'https://www.fut.gg/sitemap-player-detail-26.xml'
const OUTPUT = 'src/data/futggPlayers.json'
const SLUGS_CACHE = 'src/data/futggSlugs.json'

/** slugs احتياطية إذا فشل الاكتشاف */
const SEED_SLUGS = [
  '212831-alisson', '210257-ederson', '192119-thibaut-courtoa', '203376-virgil-van-dijk',
  '239053-ruben-dias', '192985-kevin-de-bruyne', '256630-jude-bellingham', '239085-erling-haaland',
  '231747-kylian-mbappe', '158023-lionel-messi', '209331-mohamed-salah', '234396-florian-wirtz',
]

function parseArgs(argv) {
  const opts = {
    minOvr: 80,
    concurrency: 6,
    delayMs: 200,
    maxSlugs: 0,
    allCards: true,
    useSitemap: true,
  }
  for (const arg of argv) {
    if (arg === '--best-only') opts.allCards = false
    if (arg === '--manual') opts.useSitemap = false
    if (arg.startsWith('--min-ovr=')) opts.minOvr = Number(arg.split('=')[1]) || 80
    if (arg.startsWith('--concurrency=')) opts.concurrency = Number(arg.split('=')[1]) || 6
    if (arg.startsWith('--delay=')) opts.delayMs = Number(arg.split('=')[1]) || 200
    if (arg.startsWith('--max-slugs=')) opts.maxSlugs = Number(arg.split('=')[1]) || 0
  }
  return opts
}

function fetchText(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        fetchText(new URL(res.headers.location, url).href).then(resolve, reject)
        return
      }
      let d = ''
      res.on('data', c => { d += c })
      res.on('end', () => {
        if (res.statusCode >= 400) reject(new Error(`${url} → HTTP ${res.statusCode}`))
        else resolve(d)
      })
    }).on('error', reject)
  })
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

function groupForPosition(pos) {
  for (const [group, positions] of Object.entries(POSITION_GROUPS)) {
    if (positions.includes(pos)) return group
  }
  return null
}

function shuffle(arr) {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

async function discoverSlugsFromSitemap() {
  console.log('Discovering player slugs from FUT.GG sitemap…')
  const xml = await fetchText(SITEMAP_URL)
  const slugs = [...new Set([...xml.matchAll(/players\/(\d+-[a-z0-9-]+)/g)].map(m => m[1]))]
  console.log(`Found ${slugs.length} slugs in sitemap`)
  fs.writeFileSync(SLUGS_CACHE, JSON.stringify(slugs, null, 2))
  return slugs
}

function parseFc26Cards(html, slug) {
  const urlMap = new Map()
  for (const m of html.matchAll(/https:\/\/game-assets\.fut\.gg\/cdn-cgi\/image\/quality=85,format=auto,width=300\/2026\/futgg-player-item-card\/26-(\d+)\.([a-f0-9]+)\.webp/g)) {
    urlMap.set(m[1], m[0])
  }

  const cards = []
  for (const part of html.split('game:"26",eaId:').slice(1)) {
    const eaId = part.match(/^(\d+)/)?.[1]
    if (!eaId || !urlMap.has(eaId)) continue

    const overall = Number(part.match(/overall:(\d+)/)?.[1])
    const firstName = part.match(/firstName:"([^"]+)"/)?.[1]
    const lastName = part.match(/lastName:"([^"]+)"/)?.[1]
    const position = part.match(/position:"([A-Z]+)"/)?.[1]
    const rarityName = part.match(/rarityName:"([^"]+)"/)?.[1] || ''
    const nation = part.match(/uniqueNation:\$R\[\d+\]=\{[^}]*name:"([^"]+)"/)?.[1]
      || part.match(/nationName:"([^"]+)"/)?.[1]
      || ''
    const club = part.match(/uniqueClub:\$R\[\d+\]=\{[^}]*name:"([^"]+)"/)?.[1] || ''
    const stats = part.match(/faceStatsV2:\$R\[\d+\]=\{facePace:(\d+),faceShooting:(\d+),facePassing:(\d+),faceDribbling:(\d+),faceDefending:(\d+),facePhysicality:(\d+)/)

    if (!overall || !firstName || !position) continue

    const group = groupForPosition(position)
    if (!group) continue

    cards.push({
      id: `fut26-${eaId}`,
      name: `${firstName} ${lastName}`.trim(),
      futPosition: position,
      position: group,
      club,
      nation,
      overall,
      attack: stats ? Number(stats[2]) : Math.round(overall * 0.85),
      midfield: stats ? Math.round((Number(stats[3]) + Number(stats[4])) / 2) : Math.round(overall * 0.82),
      defense: stats ? Number(stats[5]) : Math.round(overall * 0.4),
      cardImageUrl: urlMap.get(eaId),
      futggUrl: `https://www.fut.gg/players/${slug}/`,
      ...(rarityName ? { rarityName } : {}),
    })
  }

  return cards.sort((a, b) => b.overall - a.overall)
}

function selectCards(cards, allCards) {
  if (allCards) return cards
  const bestByGroup = new Map()
  for (const card of cards) {
    const key = `${card.position}:${card.futPosition}`
    if (!bestByGroup.has(key) || card.overall > bestByGroup.get(key).overall) {
      bestByGroup.set(key, card)
    }
  }
  return [...bestByGroup.values()]
}

async function fetchPlayerCards(slug, opts) {
  await sleep(opts.delayMs)
  const html = await fetchText(`https://www.fut.gg/players/${slug}/`)
  const cards = parseFc26Cards(html, slug)
  return selectCards(cards, opts.allCards).filter(c => c.overall >= opts.minOvr)
}

async function runPool(slugs, opts) {
  const pool = { GK: [], DEF: [], MID: [], ST: [] }
  const seenIds = new Set()
  let done = 0
  let okPlayers = 0
  let failPlayers = 0

  async function worker(batch) {
    for (const slug of batch) {
      try {
        const cards = await fetchPlayerCards(slug, opts)
        if (!cards.length) {
          failPlayers++
        } else {
          okPlayers++
          for (const card of cards) {
            if (seenIds.has(card.id)) continue
            seenIds.add(card.id)
            pool[card.position].push(card)
          }
        }
      } catch (e) {
        failPlayers++
        console.warn('FAIL', slug, e.message)
      }
      done++
      if (done % 25 === 0 || done === slugs.length) {
        const total = Object.values(pool).reduce((n, g) => n + g.length, 0)
        console.log(`Progress ${done}/${slugs.length} | cards ${total} | players OK ${okPlayers}`)
      }
    }
  }

  const chunkSize = Math.ceil(slugs.length / opts.concurrency)
  const batches = []
  for (let i = 0; i < slugs.length; i += chunkSize) {
    batches.push(slugs.slice(i, i + chunkSize))
  }
  await Promise.all(batches.map(worker))
  return { pool, okPlayers, failPlayers }
}

const opts = parseArgs(process.argv.slice(2))

let slugs = opts.useSitemap ? await discoverSlugsFromSitemap() : [...SEED_SLUGS]
if (opts.maxSlugs > 0 && slugs.length > opts.maxSlugs) {
  slugs = shuffle(slugs).slice(0, opts.maxSlugs)
  console.log(`Limited to ${slugs.length} random slugs`)
}

console.log(`Fetching FC 26 cards (allCards=${opts.allCards}, minOvr=${opts.minOvr}, concurrency=${opts.concurrency})…`)

const { pool, okPlayers, failPlayers } = await runPool(slugs, opts)

for (const group of Object.keys(pool)) {
  pool[group].sort((a, b) => b.overall - a.overall)
}

fs.writeFileSync(OUTPUT, JSON.stringify(pool, null, 2))

const counts = Object.fromEntries(Object.entries(pool).map(([k, v]) => [k, v.length]))
const total = Object.values(counts).reduce((a, b) => a + b, 0)
const uniqueNames = new Set(Object.values(pool).flat().map(c => c.name)).size

console.log('\nDone!')
console.log('Players OK:', okPlayers, '| failed/empty:', failPlayers)
console.log('Cards by position:', counts, '| total:', total, '| unique names:', uniqueNames)
console.log('Saved →', OUTPUT)
