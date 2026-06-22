export default function HeroBoardPreview() {
  const categories = ['جغرافيا', 'كرة قدم', 'انمي', 'ناروتو', 'ون بيس', 'كونان']
  const points = [200, 400, 600]

  return (
    <div className="board-preview">
      <div className="board-preview-header">
        <div className="board-preview-team t1">
          <span className="bp-team-name">الفريق 1</span>
          <span className="bp-team-score">1200</span>
        </div>
        <div className="board-preview-vs">VS</div>
        <div className="board-preview-team t2">
          <span className="bp-team-name">الفريق 2</span>
          <span className="bp-team-score">900</span>
        </div>
      </div>

      <div className="board-preview-grid">
        {categories.map(cat => (
          <div key={cat} className="bp-cat">{cat}</div>
        ))}
        {points.map(pt =>
          categories.map((cat, ci) => {
            const answered = pt === 200 && ci < 2
            return (
              <div
                key={`${cat}-${pt}`}
                className={`bp-cell ${answered ? 'answered' : ''} ${pt === 400 && ci === 1 ? 'highlight' : ''}`}
              >
                {answered ? '✓' : pt}
              </div>
            )
          })
        )}
      </div>

      <div className="board-preview-footer">
        <span className="bp-dot pulse" />
        دور الفريق الأول
      </div>
    </div>
  )
}
