import { Link } from 'react-router-dom'
import { GAME_MODES } from '../data/gameModes'
import FloatingOrbs from '../components/FloatingOrbs'
import GameModeCard from '../components/GameModeCard'
import ScrollReveal from '../components/ScrollReveal'
import SiteLogo from '../components/SiteLogo'
import './home.css'
import '../styles/pages-shared.css'
import '../styles/game-modes.css'

const PLATFORM_FEATURES = [
  {
    icon: '🎮',
    title: 'ألعاب متعددة',
    desc: 'منصة واحدة تجمع ألعاباً مختلفة — ثقافية، حروف، والمزيد قريباً',
  },
  {
    icon: '👥',
    title: 'لعب جماعي',
    desc: 'مثالية للجمعات والدواوين — تحدّي الأصدقاء والعائلة في نفس الغرفة',
  },
  {
    icon: '💾',
    title: 'حفظ تلقائي',
    desc: 'ألعابك محفوظة محلياً — ارجع وكمّل من حيث توقفت في أي وقت',
  },
]

const HOW_IT_WORKS = [
  { num: '١', icon: '🎯', text: 'اختر اللعبة من قسم الألعاب' },
  { num: '٢', icon: '⚙️', text: 'جهّز الفرق والإعدادات' },
  { num: '٣', icon: '🏆', text: 'العب واجمع النقاط' },
]

export default function Home() {
  return (
    <div className="home-page site-bg">
      {/* ── HERO ── */}
      <section className="home-hero site-section site-section--hero">
        <FloatingOrbs />

        <div className="home-hero-container">
          <div className="home-hero-text">
            <span className="home-tag anim-fade-down">🌐 منصة ألعاب جماعية</span>

            <h1 className="home-hero-title anim-fade-up">
              مرحباً في <span className="text-gradient">لعبتنا</span>
            </h1>

            <p className="home-lead anim-fade-up anim-delay-1">
              منصة عربية للألعاب الجماعية — اختر لعبتك، جمّع فريقك، وابدأ التحدي
              بدون تسجيل ومجاناً
            </p>

            <div className="btn-group btn-group--hero anim-fade-up anim-delay-2">
              <Link to="/games" className="btn btn-primary btn-lg btn-shimmer">
                🎯 استكشف الألعاب
              </Link>
              <Link to="/my-games" className="btn btn-secondary btn-lg">
                📂 ألعابي
              </Link>
            </div>

            <div className="home-quick-steps anim-fade-up anim-delay-3">
              {HOW_IT_WORKS.map((s, i) => (
                <div key={s.num} className="home-quick-step">
                  {i > 0 && <span className="home-step-arrow">←</span>}
                  <span className="home-step-num">{s.num}</span>
                  <span className="home-step-icon">{s.icon}</span>
                  <span className="home-step-text">{s.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="home-hero-visual anim-fade-up anim-delay-1">
            <div className="home-hero-logo-title">
              <SiteLogo variant="hero-feature" />
            </div>
          </div>
        </div>
      </section>

      {/* ── GAMES ── */}
      <section className="home-games site-section section-wrap">
        <ScrollReveal>
          <div className="home-section-head home-section-head--center">
            <span className="section-label">قسم الألعاب</span>
            <h2 className="section-title">اختر لعبتك</h2>
            <p className="section-desc section-desc--center">
              كل لعبة لها أسلوبها الخاص — ابدأ بالمتاحة الآن أو تابع الجديد
            </p>
          </div>
        </ScrollReveal>

        <div className="home-games-grid">
          {GAME_MODES.map((mode, i) => (
            <ScrollReveal key={mode.id} delay={i * 100}>
              <GameModeCard mode={mode} compact />
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={200}>
          <div className="home-games-more">
            <Link to="/games" className="btn btn-cta-outline">
              عرض كل الألعاب ←
            </Link>
          </div>
        </ScrollReveal>
      </section>

      {/* ── PLATFORM FEATURES ── */}
      <section className="home-features site-section site-section--alt section-wrap">
        <ScrollReveal>
          <div className="home-section-head home-section-head--center">
            <span className="section-label">المنصة</span>
            <h2 className="section-title">لماذا لعبتنا؟</h2>
            <p className="section-desc section-desc--center">
              أكثر من لعبة واحدة — تجربة موحّدة للعب الجماعي
            </p>
          </div>
        </ScrollReveal>

        <div className="home-features-grid">
          {PLATFORM_FEATURES.map((f, i) => (
            <ScrollReveal key={f.title} delay={i * 100}>
              <article className="home-feature-card">
                <div className="home-feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="home-cta site-section site-section--cta">
        <div className="cta-bg-orbs" aria-hidden="true">
          <div className="cta-orb" />
          <div className="cta-orb cta-orb-2" />
        </div>

        <div className="home-cta-inner section-wrap">
          <ScrollReveal direction="scale">
            <div className="home-cta-content">
              <h2>جاهز للعب؟</h2>
              <p>استكشف قسم الألعاب واختر التحدي الذي يناسبك</p>
              <div className="btn-group btn-group--center home-cta-actions">
                <Link to="/games" className="btn btn-gold btn-lg btn-shimmer">
                  🚀 ابدأ الآن
                </Link>
                <Link to="/my-games" className="btn btn-cta-outline btn-lg">
                  استرجع ألعابي
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  )
}
