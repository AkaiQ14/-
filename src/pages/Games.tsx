import { GAME_MODES } from '../data/gameModes'
import FloatingOrbs from '../components/FloatingOrbs'
import GameModeCard from '../components/GameModeCard'
import ScrollReveal from '../components/ScrollReveal'
import './games.css'
import '../styles/pages-shared.css'
import '../styles/game-modes.css'

export default function Games() {
  return (
    <div className="page-shell site-bg games-page">
      <section className="page-hero page-hero--compact site-section site-section--hero">
        <FloatingOrbs />
        <div className="page-hero-inner page-hero-inner--center anim-fade-up">
          <span className="page-tag">🎯 قسم الألعاب</span>
          <h1 className="page-title">
            <span className="text-gradient">اختر لعبتك</span>
          </h1>
          <p className="page-lead">
            منصة لعبتنا تجمع ألعاباً جماعية متنوعة — اختر ما يناسبك وابدأ التحدي
          </p>
        </div>
      </section>

      <div className="page-body games-body">
        <div className="games-grid">
          {GAME_MODES.map((mode, i) => (
            <ScrollReveal key={mode.id} delay={i * 80}>
              <GameModeCard mode={mode} />
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={160}>
          <div className="games-note">
            <p>
              المنصة تضم أكثر من لعبة — <strong>لعبتنا</strong> و<strong>اللاعب الخفي</strong> متاحتان الآن،
              و<strong>خلية الحروف</strong> قيد التطوير.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </div>
  )
}
