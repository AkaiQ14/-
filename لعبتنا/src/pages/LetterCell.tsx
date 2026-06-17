import { Link } from 'react-router-dom'
import FloatingOrbs from '../components/FloatingOrbs'
import './letter-cell.css'
import '../styles/pages-shared.css'

export default function LetterCell() {
  return (
    <div className="page-shell letter-cell-page site-bg">
      <section className="page-hero page-hero--compact site-section site-section--hero">
        <FloatingOrbs />
        <div className="page-hero-inner page-hero-inner--center anim-fade-up">
          <span className="page-tag">🔤 خلية الحروف</span>
          <h1 className="page-title">
            <span className="text-gradient">قريباً</span>
          </h1>
          <p className="page-lead">
            لعبة حروف جديدة ضمن منصة لعبتنا — قيد الإعداد
          </p>
        </div>
      </section>

      <div className="page-body">
        <div className="letter-cell-empty page-empty">
          <div className="page-empty-icon">🔤</div>
          <h3>خلية الحروف</h3>
          <p>لا توجد فئات أو أسئلة بعد — ترقّب الإطلاق قريباً</p>
          <div className="page-empty-actions">
            <Link to="/games" className="btn btn-primary btn-shimmer">← العودة لقسم الألعاب</Link>
            <Link to="/" className="btn btn-secondary">الرئيسية</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
