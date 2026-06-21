import https from 'https'

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      let d = ''
      res.on('data', c => { d += c })
      res.on('end', () => resolve(d))
    }).on('error', reject)
  })
}

const html = await fetch('https://www.fut.gg/players/239085-erling-haaland/')
const i = html.indexOf('168011245')
const chunk = html.slice(i, i + 6000)
for (const m of chunk.matchAll(/position[A-Za-z]*:"([^"]+)"/g)) console.log(m[0])
for (const m of chunk.matchAll(/position[A-Za-z]*:([A-Z]+)/g)) console.log(m[0])
console.log('--- roles ---')
for (const m of chunk.matchAll(/role[A-Za-z]*:"([^"]+)"/g)) console.log(m[0])
