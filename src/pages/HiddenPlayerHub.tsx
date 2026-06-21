import { Link } from 'react-router-dom'
import FloatingOrbs from '../components/FloatingOrbs'
import ScrollReveal from '../components/ScrollReveal'

export default function HiddenPlayerHub() {
  return (
    <div className="page-shell site-bg hp-shell">
      <section className="page-hero page-hero--compact site-section site-section--hero">
        <FloatingOrbs />
        <div className="page-hero-inner page-hero-inner--center anim-fade-up">
          <Link to="/games" className="hp-back-link">← العودة للألعاب</Link>
          <span className="page-tag">⚽ مزاد اللاعبين</span>
          <h1 className="page-title">
            <span className="text-gradient">اللاعب الخفي</span>
          </h1>
          <p className="page-lead">
            ابنِ فريقك من 5 بطاقات EA FC 26 عبر مزاد حماسي — الفائز يحصل على البطاقة الظاهرة،
            والخاسر يحصل على البديل المخفي تلقائياً! البطاقات من{' '}
            <a href="https://www.fut.gg/" target="_blank" rel="noopener noreferrer">FUT.GG</a>.
          </p>
        </div>
      </section>

      <div className="hp-body">
        <div className="hp-features">
          <ScrollReveal>
            <div className="hp-feature-card">
              <span>🎭</span>
              <h3>اللاعب الخفي</h3>
              <p>كل لاعب له بديل مخفي — مفاجأة بعد كل جولة</p>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={80}>
            <div className="hp-feature-card">
              <span>💰</span>
              <h3>ميزانية قابلة للتخصيص</h3>
              <p>حدّد مبلغ المزاد لكل لاعب وقدّم عروضك بحرية</p>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={160}>
            <div className="hp-feature-card">
              <span>📊</span>
              <h3>تحليل الفريق</h3>
              <p>تقييم شامل بعد المزاد مع تنبؤ بالفائز</p>
            </div>
          </ScrollReveal>
        </div>

        <div className="hp-modes">
          <Link to="/games/hidden-player/lobby?mode=casual" className="hp-mode-card">
            <span>🎮</span>
            <div>
              <strong>وضع عادي</strong>
              <small>لعب محلي لفريقين</small>
            </div>
          </Link>
          <div className="hp-mode-card hp-mode-card--soon" aria-disabled>
            <span>🏅</span>
            <div>
              <strong>وضع ترتيبي</strong>
              <small>قريباً</small>
            </div>
          </div>
        </div>

        <div className="hp-chips">
          <span className="hp-chip">🃏 بطاقات EA FC 26 من FUT.GG</span>
          <span className="hp-chip">🎲 اختيار عشوائي كل مزاد</span>
          <span className="hp-chip">🏆 لوحة المتصدرين — قريباً</span>
        </div>

        <div className="hp-cta-wrap">
          <Link to="/games/hidden-player/lobby" className="btn btn-primary btn-lg btn-shimmer">
            ▶ ابدأ المزاد
          </Link>
        </div>
      </div>
    </div>
  )
}
