/**
 * The middlegame: lessons on how to think once the opening is over, and the
 * sets the puzzles are practised in.
 */
import type { EndgameDemo } from './endgames'
import { PUZZLES, type Puzzle, type PuzzleTheme } from './puzzles'

/** A page of the app, as the router takes it: the Tactics lesson on forks is ['tactic', 'fork']. */
type Page = [string, string]

/** What is said about a puzzle of each kind. */
export const THEMES: Record<PuzzleTheme, { name: string; ask: string; hint: string; lesson: Page }> = {
  fork: {
    name: 'a fork',
    ask: 'There is a fork in this position. Find it.',
    hint: 'Look for one move that attacks two things at once. Checks first.',
    lesson: ['tactic', 'fork'],
  },
  pin: {
    name: 'a pin',
    ask: 'A pin decides this position. Find the move that uses it.',
    hint: 'One of the pieces cannot move, or cannot take back, because of what stands behind it.',
    lesson: ['tactic', 'pin'],
  },
  skewer: {
    name: 'a skewer',
    ask: 'There is a skewer in this position. Find it.',
    hint: 'Two pieces stand on one line. Attack the one in front.',
    lesson: ['tactic', 'skewer'],
  },
  discovered: {
    name: 'a discovered attack',
    ask: 'There is a discovered attack in this position. Find it.',
    hint: 'One of your pieces stands in front of another. Move it out of the way with a threat.',
    lesson: ['tactic', 'discovered-attack'],
  },
  defender: {
    name: 'removing the defender',
    ask: 'Something is guarded by a piece that can be removed. Win material.',
    hint: 'Find the piece that is guarded only once. Then take its guard, or lure the guard away.',
    lesson: ['tactic', 'remove-the-defender'],
  },
  trapped: {
    name: 'a trapped piece',
    ask: 'One of the pieces has no way out. Win it.',
    hint: 'Look for a piece with no safe square to go to, and attack it with something cheap.',
    lesson: ['middlegame', 'trapped'],
  },
  loose: {
    name: 'a loose piece',
    ask: 'Something can simply be taken. Find it.',
    hint: 'Go through your captures one by one, and count the attackers and the guards.',
    lesson: ['middlegame', 'count'],
  },
  mate1: {
    name: 'a mate in one',
    ask: 'Give checkmate in one move.',
    hint: 'Go through every check you can give.',
    lesson: ['middlegame', 'mates'],
  },
  mate2: {
    name: 'a mate in two',
    ask: 'Give checkmate in two moves.',
    hint: 'Start with a check, and look at what each reply allows.',
    lesson: ['middlegame', 'mates'],
  },
  backrank: {
    name: 'a back-rank mate',
    ask: 'The king is shut in on the back rank. Give checkmate.',
    hint: 'The king has no way out behind its own pawns. Get a rook or queen to the back rank.',
    lesson: ['tactic', 'back-rank'],
  },
}

/** How many moves you have to find. */
const length = (p: Puzzle) => (p.moves.length + 1) / 2

export const PUZZLE_SETS = {
  mixed: { title: 'Find the win', summary: 'All the patterns in random order, and you are not told which one it is. This is the one that is like a real game.', lessons: [] as Page[], has: (_: Puzzle) => true },
  fork: { title: 'Forks', summary: 'One piece attacks two things at once.', lessons: [['tactic', 'fork']] as Page[], has: (p: Puzzle) => p.theme === 'fork' },
  pins: { title: 'Pins and skewers', summary: 'Two pieces on one line, and a bishop, rook or queen to aim along it.', lessons: [['tactic', 'pin'], ['tactic', 'skewer']] as Page[], has: (p: Puzzle) => p.theme === 'pin' || p.theme === 'skewer' },
  discovered: { title: 'Discovered attacks', summary: 'Move one piece and attack with the one behind it.', lessons: [['tactic', 'discovered-attack']] as Page[], has: (p: Puzzle) => p.theme === 'discovered' },
  defender: { title: 'Removing the defender', summary: 'Take the guard, or lure it away, and the piece it guarded falls.', lessons: [['tactic', 'remove-the-defender']] as Page[], has: (p: Puzzle) => p.theme === 'defender' },
  trapped: { title: 'Trapped pieces', summary: 'A piece with no safe square is lost to the first thing that attacks it.', lessons: [['middlegame', 'trapped']] as Page[], has: (p: Puzzle) => p.theme === 'trapped' },
  loose: { title: 'Loose pieces', summary: 'Something can simply be taken: unguarded, guarded too few times, or guarded by a piece that is pinned.', lessons: [['middlegame', 'count'], ['tactic', 'loose-pieces']] as Page[], has: (p: Puzzle) => p.theme === 'loose' },
  mate1: { title: 'Mate in one', summary: 'One move ends the game. Look at every check.', lessons: [['middlegame', 'mates']] as Page[], has: (p: Puzzle) => ['mate1', 'backrank'].includes(p.theme) && length(p) === 1 },
  mate2: { title: 'Mate in two', summary: 'A first move that leaves no defence, then the mate.', lessons: [['middlegame', 'mates'], ['tactic', 'back-rank']] as Page[], has: (p: Puzzle) => ['mate2', 'backrank'].includes(p.theme) && length(p) === 2 },
}
export type PuzzleSet = keyof typeof PUZZLE_SETS

export const puzzlesIn = (set: PuzzleSet) => PUZZLES.filter(PUZZLE_SETS[set].has)

/** What a puzzle asks for when you are told its pattern. */
export const askFor = (p: Puzzle) =>
  p.theme === 'backrank' ? `The king is shut in on the back rank. Give checkmate in ${length(p) === 1 ? 'one move' : 'two moves'}.` : THEMES[p.theme].ask

/** A line with move numbers, starting from the move number of the position: "24… Rd6 25. Re8#". */
export function lineText(fen: string, moves: string[]): string {
  const parts = fen.split(' ')
  let n = +parts[5]
  let white = parts[1] === 'w'
  return moves
    .map((san, i) => {
      const text = white ? `${n}. ${san}` : i === 0 ? `${n}… ${san}` : san
      if (!white) n++
      white = !white
      return text
    })
    .join(' ')
}

export interface MiddlegameLesson {
  id: string
  group: string
  title: string
  summary: string
  text: string[]
  rules: string[]
  demo?: EndgameDemo
  /** The puzzles to practise it on. */
  set: PuzzleSet
  /** Opening lessons in which the idea comes up. */
  see?: string[]
  /** Another page that carries on from here. */
  link?: { label: string; to: Page | [string] }
}

export const MIDDLEGAME_GROUPS = ['How to think', 'What to look for']

export const MIDDLEGAME: MiddlegameLesson[] = [
  {
    id: 'routine',
    group: MIDDLEGAME_GROUPS[0],
    title: 'What to do when the opening ends',
    summary: 'Four questions, in the same order, before every move.',
    text: [
      'The opening gives you moves to play. The middlegame does not, and that is where most of your games are decided: usually by a piece left hanging or a simple tactic that one side saw and the other did not, rarely by a deep plan. So the first thing to learn is not more knowledge. It is a routine: the same few questions before every move, asked in the same order.',
      'First, their move. What does it attack, what did it stop guarding, and what would it do next? That is the three-question habit from the Tactics page, and it comes first because a threat you have not seen makes everything else pointless.',
      'Second, your chances. Go through every check you can give, every capture you can make and every threat you can make. Most of them are bad, and seeing that takes seconds. The few that are not bad win games.',
      'Third, if nothing is hanging on either side, improve something: the piece that is doing least, a rook that could stand on an open file, a pawn break that would open the position for you. The Strategy page is about this step.',
      'Last, before you let go of the piece: picture your move made, and look at the checks and captures it allows. This one question would save you more games than anything else on this site.',
    ],
    rules: [
      'Their move: what does it attack, and what did it give up?',
      'My chances: checks, captures, threats, in that order.',
      'Nothing there: improve your worst piece, or prepare a pawn break.',
      'Before you let go: what checks and captures does my move allow?',
    ],
    set: 'mixed',
    link: { label: 'How to find a plan', to: ['strategy', 'plan'] },
  },
  {
    id: 'cct',
    group: MIDDLEGAME_GROUPS[0],
    title: 'Checks, captures, threats',
    summary: 'How to find a tactic: look at the forcing moves first, even the ones that look silly.',
    text: [
      'A check has to be answered. A capture usually has to be answered by taking back. A threat has to be met. These are forcing moves: they leave the other side only a few replies, and that is what makes it possible to see ahead at all. After a quiet move anything can happen. After a check you may have only one or two replies to think about.',
      'So look at the forcing moves first, in that order, on every move. Do it even when the check looks pointless or the capture seems to lose a piece. Tactics hide in exactly those moves: the ones you throw out without looking. A queen sacrifice is a capture that most players never considered.',
      'For each forcing move, find the reply that is forced. Then look again from the new position: checks, captures, threats. Two rounds of that find nearly every tactic in the puzzles here.',
    ],
    rules: [
      'On every move, list your checks, then your captures, then your threats.',
      'Do not throw out a forcing move before you have seen the reply to it.',
      'After the forced reply, look again: checks, captures, threats.',
      'Then do the same for the other side.',
    ],
    demo: {
      fen: '2rqkb1r/pp1bp1pp/5p2/n2pB2n/3P4/2NBP3/PPQ2PPP/R3K1NR w KQk - 0 12',
      intro: 'From a Slav Defence. Black has just attacked your bishop on e5 with a pawn. The natural reaction is to move the bishop away. Look at the checks first.',
      moves: [
        { san: 'Bg6+', note: 'There is one check on the board, and it puts a bishop where a pawn can take it. Do not throw it out: find the reply. The king has no square and nothing can block, so the pawn has to take.' },
        { san: 'hxg6', note: 'Forced. Now look again from the new position: checks, captures, threats.' },
        { san: 'Qxg6#', note: "A capture with check, and it is mate. The pawn that guarded g6 has been pulled away, the queen covers f7, and the king's own pieces stand on every other square around it." },
      ],
    },
    set: 'mixed',
  },
  {
    id: 'safe',
    group: MIDDLEGAME_GROUPS[0],
    title: 'The blunder check',
    summary: 'Ten seconds before you let go of the piece.',
    text: [
      'Most pieces are not lost to brilliant play. They are lost one move after you put them somewhere, or one move after you moved the piece that was guarding them. The cure is a check that you make after you have chosen your move and before you play it.',
      'Picture the move made. Then look at the board as the other side would. Is the piece I moved safe on its new square? What was it guarding on the square it left? Which checks do they have now, and which captures?',
      'It takes ten seconds. If any answer is bad, choose another move. A player who does this on every move stops giving pieces away, and at club level that alone decides a large share of the games.',
    ],
    rules: [
      'Choose your move, then check it before you play it.',
      'Is the piece safe on the square it is going to?',
      'What was it guarding on the square it is leaving?',
      'What checks and captures does the other side have afterwards?',
    ],
    demo: {
      fen: 'r3kb1r/pp1q1ppp/2n1p3/3pP3/3Pn3/5N2/PP3PPP/RNBQR1K1 w kq - 1 11',
      intro: 'White is fine here and wants to tuck the king into the corner before starting anything. It looks like the safest move on the board. Run the check on it.',
      moves: [
        { san: 'Kh1', note: 'Is the king safe on h1? Yes. What was it guarding on g1? The pawn on f2. What checks does Black have now? A knight can take on f2 with check. That is the question White did not ask.' },
        { san: 'Nxf2+', note: 'The knight takes the pawn the king has just stopped guarding. It gives check and attacks the queen on d1.' },
        { san: 'Kg1', note: 'The check has to be answered first.' },
        { san: 'Nxd1', note: 'And the queen goes. Any developing move on move eleven would have been fine: the one "safe" king move lost the game.' },
      ],
    },
    set: 'mixed',
    link: { label: 'Drill: judge the move', to: ['judge', 'mixed'] },
  },
  {
    id: 'count',
    group: MIDDLEGAME_GROUPS[1],
    title: 'Count before you take',
    summary: 'Attackers against guards, and the cheapest piece takes first.',
    text: [
      'A great many middlegame decisions are arithmetic. A piece or a pawn is attacked a number of times and guarded a number of times. If there are more attackers than guards, something can be won. If not, starting the captures loses material.',
      'Count the pieces that are lined up behind each other as well: a rook behind a rook on the same file, or a queen behind a bishop on the same diagonal, joins in once the piece in front has taken. And do not count a guard that is pinned, because it cannot take back.',
      'Then look at the order. Take with the cheapest piece first and keep the expensive ones for last, because the piece that takes first is the first to be taken back. Look at the values too, not only at the numbers: a single pawn guarding a square keeps queens and rooks off it, however many of them attack.',
    ],
    rules: [
      'Count the attackers and the guards of the square, including pieces lined up behind others.',
      'More attackers than guards: you win something. The same number or fewer: you do not.',
      'Take with the cheapest piece first.',
      'A guard that is pinned does not count.',
      'One pawn guarding a piece is enough to stop a queen or a rook taking it.',
    ],
    demo: {
      fen: 'r4rk1/pp2qppp/4bn2/3p4/8/1BN1P3/PP2QPPP/R2R2K1 w - - 0 1',
      intro: 'Can White take the pawn on d5? Count. Attackers: the knight on c3, the bishop on b3 and the rook on d1. Guards: the knight on f6 and the bishop on e6. Three against two.',
      moves: [
        { san: 'Nxd5', note: 'Three attackers against two guards, so the pawn can be taken. Start with a minor piece and keep the rook for last.' },
        { san: 'Nxd5', note: 'The first guard takes back.' },
        { san: 'Bxd5', note: 'The second attacker.' },
        { san: 'Bxd5', note: 'The second guard takes back. Black has no guards left.' },
        { san: 'Rxd5', note: 'The third attacker takes, and nothing can take it back. Two minor pieces have gone each way and White has won a pawn. If the rook had taken first, White would have lost a rook for a knight.' },
      ],
    },
    set: 'loose',
    link: { label: 'Loose pieces drop off', to: ['tactic', 'loose-pieces'] },
  },
  {
    id: 'trapped',
    group: MIDDLEGAME_GROUPS[1],
    title: 'Trapped pieces',
    summary: 'A piece with no safe square is lost to the first cheap thing that attacks it.',
    text: [
      'A piece is trapped when it has no safe square to move to. It does not even have to be attacked yet. The moment something cheaper attacks it, it is lost, because it cannot run.',
      'Bishops and knights get trapped on the edge of the board or deep in the other half, where pawns take their squares away. Queens get trapped when they go hunting pawns far from home, most often the pawn on b2 or b7. Rooks get shut in behind their own pieces.',
      'The habit to learn is counting squares. When a piece of the other side goes somewhere unusual, ask how it gets back. When one of your own is about to, ask the same before you send it.',
    ],
    rules: [
      'When a piece has gone far forward or to the edge, count its safe squares.',
      'No safe squares: attack it with the cheapest thing you have.',
      'Sometimes the move is to take away its last square first, and attack it after.',
      'Before you take a pawn deep in the other half, find the way back.',
    ],
    demo: {
      fen: 'r1b1k2r/p1ppn1p1/1p5p/b7/8/P1N1B3/1PP1NPPP/R3K2R w KQ - 0 14',
      intro: "From an Italian Game. Black's bishop on a5 had one way home, the square b6, and Black has just put a pawn on it. Count the bishop's safe squares now.",
      moves: [
        { san: 'b4', note: 'None. So attack it with the cheapest thing you have. The pawn also shuts the diagonal to c3, so the bishop cannot even take a knight on its way out.' },
        { san: 'Bxb4', note: 'The best the bishop can do is take a pawn with it.' },
        { san: 'axb4', note: 'A bishop for a pawn. White never had to calculate anything: the bishop had no squares, so any attack won it.' },
      ],
    },
    set: 'trapped',
    see: ['caro-bishop-trap', 'london-poisoned-pawn', 'caro-advance-h4'],
  },
  {
    id: 'mates',
    group: MIDDLEGAME_GROUPS[1],
    title: 'Checkmates to know by sight',
    summary: 'The queen next to the king with a helper behind her, and a king with no way out.',
    text: [
      'In the middlegame a queen almost never gives mate alone. She needs a helper: a second piece that guards the square she lands on, so that the king cannot take her. Queen next to the king, guarded by a bishop, a knight, a rook or even a pawn: that one picture covers most of the checkmates you will ever give.',
      'So whenever your queen can reach a square next to their king, count. Who guards that square for you? What could take the queen there, apart from the king? If you have a guard and they have no taker, it is mate, or very close to it. Against a castled king the usual squares are h7 and g7. Before castling it is f7.',
      'The second picture is a king with no way out. A castled king behind three unmoved pawns has no square to step to, so any check along the back rank that cannot be blocked or taken is mate. The same goes for a king hemmed in by its own pieces anywhere on the board.',
      "A mate in two is one of these pictures with a move in front of it. The first move usually takes away the king's last escape square, removes the last guard, or forces the king onto the square where the mate works. It is nearly always a check.",
    ],
    rules: [
      'Queen next to the king, guarded by one more piece.',
      'Count what guards the landing square, and what can take there.',
      'A king with no escape square: any safe check is mate.',
      'Mate in two: start with the checks, and ask what each reply allows.',
    ],
    demo: {
      fen: '1rbq1rk1/p1p1bppp/np2p3/3nP3/3P4/2NQ1N2/PP3PPP/RBB2RK1 w - - 2 12',
      intro: "From a Queen's Gambit. Your queen on d3 and the bishop behind her on b1 stand on one diagonal, and it ends on h7. Black's knight has left f6, the square from which it guarded h7. Count: who guards h7 now?",
      moves: [
        { san: 'Qxh7#', note: 'Only the king, and he cannot take: the bishop on b1 guards the queen. She covers h8, the rook stands on f8, and the pawns on f7 and g7 block the rest. Queen next to the king with a helper behind her.' },
      ],
    },
    set: 'mate1',
    link: { label: 'The back-rank mate', to: ['tactic', 'back-rank'] },
  },
]

export const middlegameById = (id: string) => MIDDLEGAME.find(l => l.id === id)
