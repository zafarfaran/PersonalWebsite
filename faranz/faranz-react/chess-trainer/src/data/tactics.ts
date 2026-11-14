/**
 * Tactics: short lessons on reading the other side's move and on the patterns
 * that win material, and the positions for the "judge the move" drills.
 */
import type { EndgameDemo } from './endgames'
import { JUDGE_POSITIONS } from './judge'

export interface TacticLesson {
  id: string
  group: string
  title: string
  summary: string
  text: string[]
  rules: string[]
  demo?: EndgameDemo
}

const START = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

export const TACTIC_GROUPS = ['Reading the other side’s move', 'The patterns that win material']

export const TACTICS: TacticLesson[] = [
  {
    id: 'three-questions',
    group: TACTIC_GROUPS[0],
    title: 'Three questions after every move',
    summary: 'What does it attack, what did it give up, and what would they play next?',
    text: [
      'Most games at club level are not decided by deep plans. They are decided by one side not noticing what the other side’s last move did. The cure is a habit: before you think about your own move, look at theirs.',
      'First, what does the move attack? Look at the piece that moved and at every square it now reaches. Then look behind it: a piece that steps out of the way can open a line for a bishop, rook or queen that was standing behind it.',
      'Second, what did the move give up? A piece that moves stops guarding whatever it guarded before. If that leaves a piece undefended or a square open, the move may be a mistake that you can punish.',
      'Third, if it were their turn again, what would they play? That is the threat. If it would cost you a piece or the game, you have to deal with it now. If it would not, there is nothing to deal with and you can carry on with your own plan.',
    ],
    rules: [
      'What does it attack? Check the piece that moved and the line it opened behind it.',
      'What did it stop guarding?',
      'If they could move again, what would they take, and where would they give check?',
      'A threat can be met in five ways: take the attacker, move the target, block the line, guard the target, or make a bigger threat of your own.',
      'Look at checks, captures and threats first, for both sides.',
    ],
    demo: {
      fen: START,
      intro: 'A beginner’s attack, read one move at a time with the three questions.',
      moves: [
        { san: 'e4' },
        { san: 'e5' },
        { san: 'Bc4', note: 'What does it attack? The bishop looks at the pawn on f7, which only the king guards. Nothing is threatened yet: one attacker against one guard.' },
        { san: 'Nc6' },
        { san: 'Qh5', note: 'What does it attack? The pawn on e5, and with the bishop a second attacker on f7. If White could move again: Qxf7, checkmate. That has to be dealt with now.' },
        { san: 'g6', note: 'The pawn blocks the queen’s line to f7 and attacks the queen. A move that meets a threat and makes one of its own is the best kind.' },
        { san: 'Qf3', note: 'Ask again. The queen has moved to the f-file and looks at f7 once more: Qxf7 mate is threatened a second time.' },
        { san: 'Nf6', note: 'The knight blocks the file and develops. Both threats were seen and met, and White’s queen has only lost time.' },
      ],
    },
  },
  {
    id: 'loose-pieces',
    group: TACTIC_GROUPS[1],
    title: 'Loose pieces drop off',
    summary: 'A piece that nothing guards is a target for every double attack.',
    text: [
      'A loose piece is one that nothing guards. It is safe as long as nothing attacks it, which is why it is so easy to forget. Almost every tactic that wins a piece wins a loose one.',
      'The usual way is a double attack: one move that gives check, or attacks something bigger, and attacks the loose piece as well. The first threat has to be answered, and the loose piece is taken on the next move.',
      'So keep a list in your head, for both sides. When the other side makes a move, ask which of their pieces is now loose, and whether one move can reach it with check. Before your own move, ask the same about your pieces.',
    ],
    rules: [
      'Before every move, count the pieces on both sides that nothing guards.',
      'A check that also attacks a loose piece wins it.',
      'When you develop a piece to a square where it is unguarded, look for the checks the other side has.',
    ],
    demo: {
      fen: START,
      intro: 'A four-move accident. Watch for the loose piece.',
      moves: [
        { san: 'd4' },
        { san: 'Nf6' },
        { san: 'Bg5', note: 'The bishop on g5 is guarded by nothing. Nothing attacks it either, so it is easy to stop thinking about it.' },
        { san: 'c6', note: 'A quiet-looking move. Ask what it opened: the queen on d8 can now reach a5.' },
        { san: 'e3', note: 'White carries on with the plan and does not ask the question. The king on e1 is now open along the diagonal from a5.' },
        { san: 'Qa5+', note: 'Check, and along the fifth rank the queen also attacks the loose bishop. White can answer only one of the two.' },
        { san: 'Nc3' },
        { san: 'Qxg5', note: 'A piece up after four moves. Any move that guarded the bishop, or Bxf6 a move earlier, would have avoided it.' },
      ],
    },
  },
  {
    id: 'fork',
    group: TACTIC_GROUPS[1],
    title: 'The fork',
    summary: 'One piece attacks two things at once, and only one of them can be saved.',
    text: [
      'A fork is one piece attacking two or more things at the same time. The other side can save one of them and loses the other. Every piece can fork, but the knight and the queen do it most often, and pawn forks are the cheapest of all.',
      'Knight forks are hard to see because the knight attacks squares that nothing else does. A useful check: a knight always attacks squares of the opposite colour to the one it stands on. If your king and queen, or king and rook, stand on squares of the same colour and a knight is near, look for the square from which it hits both.',
      'When the other side moves a knight towards your half, work out where it can jump next and what it would attack from there. That jump is the threat.',
    ],
    rules: [
      'When a knight comes close, find its next jump and what it attacks from there.',
      'A fork that includes a check wins the other piece, because the check has to be answered first.',
      'King, queen and rooks on squares of one colour are what a knight is looking for.',
    ],
    demo: {
      fen: START,
      intro: 'The most common fork in the opening, on the weak square f7.',
      moves: [
        { san: 'e4' },
        { san: 'e5' },
        { san: 'Nf3' },
        { san: 'Nc6' },
        { san: 'Bc4' },
        { san: 'Nf6' },
        { san: 'Ng5', note: 'What does it attack? Knight and bishop both hit f7. If White could move again: Nxf7, attacking the queen and the rook together. Black has to stop that now, and d5 is the move.' },
        { san: 'h6', note: 'Black attacks the knight without asking where the knight wants to go.' },
        { san: 'Nxf7', note: 'A fork: the knight attacks the queen on d8 and the rook on h8. The king cannot take it, because the bishop on c4 guards f7.' },
        { san: 'Qe7' },
        { san: 'Nxh8', note: 'The queen stepped away, so the rook goes. A rook and a pawn for nothing.' },
      ],
    },
  },
  {
    id: 'pin',
    group: TACTIC_GROUPS[1],
    title: 'The pin',
    summary: 'A piece that cannot move without exposing something bigger behind it.',
    text: [
      'A piece is pinned when it stands on a line between an attacker and something more valuable. If the piece behind it is the king, the pinned piece may not move at all. If it is a queen or a rook, it can move, but at a price.',
      'A pinned piece is in trouble in two ways. It cannot run away, so anything cheap that attacks it wins it: attack a pinned piece with a pawn whenever you can. And it does not really guard anything, because it cannot leave its line to take back.',
      'When a bishop, rook or queen of the other side lines up with one of your pieces and something bigger behind it, treat it as a threat even if nothing is attacked yet.',
    ],
    rules: [
      'Attack a pinned piece again, with a pawn if possible.',
      'A pinned piece is a bad guard: what it seems to defend is often not defended.',
      'Break a pin early: move the piece behind, block the line, or chase the attacker away.',
    ],
    demo: {
      fen: '4k3/ppp2ppp/3p4/4n3/8/8/PPP2PPP/4R1K1 w - - 0 1',
      intro: 'The black knight on e5 stands between the white rook and its own king. It is pinned: it may not move, because that would put the king in check.',
      moves: [
        { san: 'f4', note: 'Attack the pinned piece with something cheap. The knight cannot run away.' },
        { san: 'Kd7', note: 'The king steps off the file, one move too late: it is White’s turn.' },
        { san: 'fxe5' },
        { san: 'dxe5', note: 'A knight for a pawn.' },
      ],
    },
  },
  {
    id: 'skewer',
    group: TACTIC_GROUPS[1],
    title: 'The skewer',
    summary: 'A pin turned round: the valuable piece is in front and has to step aside.',
    text: [
      'In a skewer two pieces stand on one line, and the more valuable one is in front. It is attacked and has to move, and the piece behind it is taken. The strongest skewers start with a check, because a king always has to move.',
      'Skewers happen most in the endgame, when kings and queens walk around on open lines. Before you put your king on the same file, rank or diagonal as your queen or rook, check whether a bishop, rook or queen of the other side can get onto that line.',
    ],
    rules: [
      'King and queen on one open line: look for the check along it.',
      'In the endgame, keep your king off the lines your other pieces stand on.',
    ],
    demo: {
      fen: 'q7/6pp/8/3k4/8/8/PP5P/5BK1 w - - 0 1',
      intro: 'Black is a queen for a bishop up. But the king on d5 and the queen on a8 stand on the same diagonal.',
      moves: [
        { san: 'Bg2+', note: 'Check along the long diagonal. Nothing can block it, so the king has to step off the line.' },
        { san: 'Ke5' },
        { san: 'Bxa8', note: 'And the queen behind it falls.' },
      ],
    },
  },
  {
    id: 'discovered-attack',
    group: TACTIC_GROUPS[1],
    title: 'The discovered attack',
    summary: 'A piece moves away and uncovers an attack from the piece behind it.',
    text: [
      'A discovered attack is two threats from one move. One piece moves out of the way and uncovers the line of a bishop, rook or queen behind it. The piece that moved makes a threat of its own, most strongly a check, and the other side cannot answer both.',
      'This is the tactic that the first question is for. When a piece moves, do not look only at where it went. Look at the square it left, and at what now sees through that square.',
      'The same goes for your own pieces. Whenever one of your pieces stands between your rook, bishop or queen and a target, look at every move that piece has with check or with a capture.',
    ],
    rules: [
      'When a piece moves, look at the line it opened as well as the square it went to.',
      'A piece of yours standing in front of your own rook, bishop or queen is a loaded tactic.',
      'A discovered attack with check wins whatever the other piece attacks.',
    ],
    demo: {
      fen: 'r5k1/pppb1ppp/8/3q4/8/3B4/PPP1QPPP/3R2K1 w - - 0 1',
      intro: 'The white bishop on d3 stands between the rook on d1 and the black queen. If the bishop moves away, the rook attacks the queen.',
      moves: [
        { san: 'Bxh7+', note: 'The bishop leaves with a check, so Black has no time to move the queen.' },
        { san: 'Kxh7' },
        { san: 'Rxd5', note: 'A queen for a bishop.' },
      ],
    },
  },
  {
    id: 'remove-the-defender',
    group: TACTIC_GROUPS[1],
    title: 'Removing the defender',
    summary: 'If a piece is guarded once, take, chase or pin the guard first.',
    text: [
      'A piece that is attacked once and guarded once looks safe. It is only as safe as its guard. If you can take the guard, chase it away or pin it, the piece behind it is suddenly loose.',
      'This is the second question from the other side. When your opponent takes one of your pieces, or attacks one, do not only count the trade. Ask what that piece was guarding. Very often the capture is not about the piece that was taken but about the one it looked after.',
    ],
    rules: [
      'Before you accept that a piece is defended, ask what defends it.',
      'A guard can be taken, chased away or pinned.',
      'When one of your pieces is taken or attacked, check what it was guarding before you take back.',
    ],
    demo: {
      fen: 'r4rk1/ppp2ppp/5n2/3b2B1/8/2N5/PPP2PPP/R4RK1 w - - 0 1',
      intro: 'The black bishop on d5 is attacked by the knight on c3 and guarded once, by the knight on f6. Taking it straight away is only a trade.',
      moves: [
        { san: 'Bxf6', note: 'Take the guard first.' },
        { san: 'gxf6' },
        { san: 'Nxd5', note: 'Now the bishop goes for nothing. White has won a piece.' },
      ],
    },
  },
  {
    id: 'back-rank',
    group: TACTIC_GROUPS[1],
    title: 'The back-rank mate',
    summary: 'A castled king behind three unmoved pawns has no way out.',
    text: [
      'After castling, the king stands behind its three pawns. They protect it from the front, and they also shut it in. A rook or queen that reaches the back rank with check then gives mate, because the king has no square to step up to.',
      'It decides a great many club games, in both directions. Every time a rook or queen of the other side can reach your back rank, count the guards of the square where it would land. And when your opponent moves the rook or queen that was guarding their own back rank, that is the second question: what did the move stop guarding?',
      'The cure costs one move: push the h-pawn or the g-pawn one square when you have time, so that the king has a square to go to.',
    ],
    rules: [
      'A rook or queen that can reach the back rank: count the guards of the landing square.',
      'When the piece guarding the back rank moves away, look for the mate.',
      'Give your king a way out with h3 or g3 (h6 or g6) when nothing else is urgent.',
    ],
    demo: {
      fen: '6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1',
      intro: 'Level material. The black king is shut in by its own pawns.',
      moves: [{ san: 'Rd8#', note: 'Checkmate. With the pawn on h6 instead of h7 the king would simply step to h7.' }],
    },
  },
]

export const tacticById = (id: string) => TACTICS.find(t => t.id === id)

/** What the other side's last move was: a mistake you can punish, a threat you have to meet, or neither. */
export type Verdict = 'mistake' | 'threat' | 'quiet'

/**
 * A position with you to move, straight after the other side's move.
 * All moves are in standard notation for the position they are played in.
 */
export interface JudgePosition {
  id: string
  kind: Verdict
  fen: string
  /** The move that was just played, and its squares. */
  last: string
  from: string
  to: string
  /** The engine's first choice for you. */
  best: string
  /** The moves that count as right: the ones that punish a mistake or meet a threat. */
  good?: string[]
  /** How play goes on after the best move. */
  line?: string[]
  /** A threat: the moves that carry it out if you do nothing, and how that goes on. */
  threats?: string[]
  threatLine?: string[]
  /** What the mistake loses or the threat would win, in hundredths of a pawn. */
  gain?: number
}

export const JUDGE: JudgePosition[] = JUDGE_POSITIONS

export const JUDGE_MODES = {
  mixed: { title: 'Judge the move', kinds: ['mistake', 'threat', 'quiet'] as Verdict[], summary: 'Mistake, threat or nothing special? Decide, then prove it on the board.' },
  threats: { title: 'Find the threat', kinds: ['threat'] as Verdict[], summary: 'Every move here threatens something. Show what, then stop it.' },
  punish: { title: 'Punish the mistake', kinds: ['mistake'] as Verdict[], summary: 'Every move here is a mistake. Find the move that wins.' },
}
export type JudgeMode = keyof typeof JUDGE_MODES

/** The same position with the other side to move: what would they do with a free move? */
export function passed(fen: string): string {
  const p = fen.split(' ')
  p[1] = p[1] === 'w' ? 'b' : 'w'
  p[3] = '-'
  return p.join(' ')
}
