import { getCategory } from '../data/gameData'
import { cellKey } from '../types/game'
import type { GameState } from '../types/game'
import { BOARD_POINT_TIERS } from '../types/boardLayout'
import type { BoardSide } from '../types/boardLayout'

interface PlayBoardProps {
  game: GameState
  onSelectCell: (categoryId: string, points: number, side: BoardSide) => void
}

function PointButton({
  label,
  cell,
  onSelect,
}: {
  label: number
  cell?: { answered: boolean; answeredBy?: string; wasCorrect?: boolean }
  onSelect: () => void
}) {
  const done = cell?.answered
  const noWinner = done && cell.wasCorrect === false
  let stateClass = ''
  if (noWinner) stateClass = 'answered-none'
  else if (done && cell.wasCorrect && cell.answeredBy === 'team1') stateClass = 'won-t1'
  else if (done && cell.wasCorrect && cell.answeredBy === 'team2') stateClass = 'won-t2'

  return (
    <button
      type="button"
      className={`sj-point-btn ${done ? 'answered' : ''} ${stateClass}`}
      disabled={done}
      onClick={onSelect}
    >
      {noWinner ? '✕' : done ? '✓' : label}
    </button>
  )
}

function CategoryModule({
  categoryId,
  game,
  onSelectCell,
}: {
  categoryId: string
  game: GameState
  onSelectCell: (categoryId: string, points: number, side: BoardSide) => void
}) {
  const cat = getCategory(categoryId)

  return (
    <div className={`sj-category ${game.team2Categories.includes(categoryId) ? 'sj-category--t2' : ''}`}>
      <div className="sj-points-col">
        {BOARD_POINT_TIERS.map(({ tier, label }) => {
          const key = cellKey(categoryId, tier, 'left')
          return (
            <PointButton
              key={`l-${key}`}
              label={label}
              cell={game.board[key]}
              onSelect={() => onSelectCell(categoryId, tier, 'left')}
            />
          )
        })}
      </div>

      <div className="sj-category-center">
        <div className="sj-category-image">
          {cat?.image ? (
            <img src={cat.image} alt={cat.name} className="sj-category-img" />
          ) : (
            <span className="sj-category-emoji">{cat?.icon}</span>
          )}
        </div>
        <div className="sj-category-name">{cat?.name}</div>
      </div>

      <div className="sj-points-col">
        {BOARD_POINT_TIERS.map(({ tier, label }) => {
          const key = cellKey(categoryId, tier, 'right')
          return (
            <PointButton
              key={`r-${key}`}
              label={label}
              cell={game.board[key]}
              onSelect={() => onSelectCell(categoryId, tier, 'right')}
            />
          )
        })}
      </div>
    </div>
  )
}

export default function PlayBoard({ game, onSelectCell }: PlayBoardProps) {
  return (
    <div className="sj-board-wrap">
      <div className="sj-board-grid">
        {game.selectedCategoryIds.map(catId => (
          <CategoryModule
            key={catId}
            categoryId={catId}
            game={game}
            onSelectCell={onSelectCell}
          />
        ))}
      </div>
    </div>
  )
}
