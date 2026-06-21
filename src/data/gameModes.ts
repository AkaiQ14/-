import type { GameMode, GameModeId } from '../types/gameMode'

/** أقسام اللعب في الموقع */
export const GAME_MODES: GameMode[] = [
  {
    id: 'laabtna',
    name: 'لعبتنا',
    sectionLabel: 'لعبة ثقافية',
    description: 'تحدي جماعي بين فريقين — فئات متنوعة، لوحة أسئلة، ووسائل مساعدة',
    icon: '🎮',
    available: true,
    setupPath: '/games/laabtna/setup',
    highlights: ['٦ فئات • ٣٦ سؤال', 'فريقان', '٣ وسائل مساعدة'],
  },
  {
    id: 'hidden-player',
    name: 'اللاعب الخفي',
    sectionLabel: 'مزاد كرة قدم',
    description: 'ابنِ فريقك الاقوى من 5 لاعبين عبر مزاد حماسي',
    icon: '🎭',
    available: true,
    setupPath: '/games/hidden-player',
    highlights: ['5 جولات مزاد', 'لاعب خفي', 'تحليل الفريق'],
  },
  {
    id: 'letter-cell',
    name: 'خلية الحروف',
    sectionLabel: 'لعبة حروف',
    description: 'لعبة جديدة قيد الإعداد — تحدي الكلمات والحروف قريباً',
    icon: '🔤',
    available: false,
    comingSoonLabel: 'قريباً',
    highlights: ['قيد التطوير', 'قريباً', 'ترقّب الإطلاق'],
  },
]

export function getGameMode(id: GameModeId): GameMode | undefined {
  return GAME_MODES.find((m) => m.id === id)
}

export function isGameModeAvailable(id: GameModeId): boolean {
  return getGameMode(id)?.available ?? false
}
