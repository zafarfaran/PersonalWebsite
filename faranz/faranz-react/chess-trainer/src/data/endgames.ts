/**
 * Endgame theory and training positions. Every training position is played
 * out against the engine at full strength: `mate` has to end in checkmate,
 * `win` ends once the rest is a basic mate, `draw` once the draw is safe.
 * You play the side that is to move in the position.
 */
export type Goal = 'mate' | 'win' | 'draw'

export interface EndgameDrill {
  id: string
  title: string
  fen: string
  goal: Goal
  /** What you are asked to do, in one or two sentences. */
  task: string
}

export interface EndgameDemo {
  fen: string
  /** Shown before the first move. */
  intro: string
  moves: { san: string; note?: string }[]
  /** Show the board from Black's side. */
  flip?: true
}

export interface EndgameTopic {
  id: string
  group: string
  title: string
  summary: string
  text: string[]
  rules: string[]
  demo?: EndgameDemo
  drills: EndgameDrill[]
}

export const ENDGAME_GROUPS = ['Checkmates you must know', 'King and pawn', 'Rook endings', 'Queen against pawn', 'Principles']

export const ENDGAMES: EndgameTopic[] = [
  {
    id: 'queen-mate',
    group: 'Checkmates you must know',
    title: 'Queen and king against king',
    summary: 'Shrink the box with the queen, then bring your king. Do not stalemate.',
    text: [
      'A queen cannot mate on her own: she needs the king next to her. The plan has three steps. First the queen pushes the enemy king to the edge of the board. Then your king walks up. Then the queen gives mate, protected by your king or with your king taking away the escape squares.',
      'The quickest way to push the king back needs no checks at all. Put the queen a knight\'s move away from the enemy king. Whenever the king moves, move the queen the same way, so she stays a knight\'s move away. The king is in a box that gets smaller every move.',
      'The one thing that can go wrong is stalemate. When the king is on the edge and has only one or two squares left, stop moving the queen. Leave the king a square to shuffle on and bring your own king up instead.',
    ],
    rules: [
      'Queen a knight\'s move from the king: follow him, no checks needed.',
      'Once he is on the edge, hold the queen one row away from that edge so he cannot come back out.',
      'Before every queen move near the corner, ask: does he still have a legal move?',
      'Walk your king up, then mate with the queen right next to the king or along the edge.',
    ],
    demo: {
      fen: '8/8/3k4/8/8/4Q3/8/4K3 w - - 0 1',
      intro: 'White pushes the king to the edge with the queen alone, then brings the king.',
      moves: [
        { san: 'Qe4', note: 'A knight\'s move away from the king. He cannot cross the e-file or the fourth rank.' },
        { san: 'Kc5' },
        { san: 'Qd3', note: 'He moved one square down and left, so the queen does the same. Still a knight\'s move away, and the box is smaller.' },
        { san: 'Kb6' },
        { san: 'Qc4', note: 'Follow him again.' },
        { san: 'Kb7' },
        { san: 'Qc5' },
        { san: 'Kb8' },
        { san: 'Qe7', note: 'He is on the edge. The queen sits on the seventh rank so he can never leave the eighth. He still has squares to move on, so it is not stalemate.' },
        { san: 'Ka8' },
        { san: 'Kd2', note: 'Careful: Qc7 here would be stalemate. The queen has done her job. Now the king comes.' },
        { san: 'Kb8' },
        { san: 'Kc3' },
        { san: 'Ka8' },
        { san: 'Kb4' },
        { san: 'Kb8' },
        { san: 'Kb5' },
        { san: 'Ka8' },
        { san: 'Kb6', note: 'Close enough. He still has b8, so this is not stalemate.' },
        { san: 'Kb8' },
        { san: 'Qb7#', note: 'Mate: the queen is protected by the king and covers every square around him.' },
      ],
    },
    drills: [
      { id: 'queen-mate-1', title: 'King in the middle', fen: '8/8/8/4k3/8/8/3Q4/4K3 w - - 0 1', goal: 'mate', task: 'Checkmate the king. The computer defends as well as it can, and a stalemate loses the win.' },
      { id: 'queen-mate-2', title: 'Your king far away', fen: '8/8/2k5/8/8/4Q3/8/K7 w - - 0 1', goal: 'mate', task: 'Your king starts in the corner. Box the king in with the queen first, then make the long walk.' },
    ],
  },
  {
    id: 'rook-mate',
    group: 'Checkmates you must know',
    title: 'Rook and king against king',
    summary: 'The rook builds a wall, your king faces his king, and a waiting move does the rest.',
    text: [
      'With a rook the king has to do much more of the work. The rook cuts the board in two: the enemy king cannot cross the row or file the rook stands on. Your king then walks up and takes squares away, and the rook moves the wall one step closer each time the enemy king steps back.',
      'The rook gives a check that gains ground only when the two kings face each other with one square between them (this is called the opposition). Then the check along the row forces the king back, because your king covers all three squares in front of him.',
      'If the kings face each other and it is your move, you cannot make progress by moving the king. Play a waiting move with the rook along its wall. Now he has to move, and he either steps back in front of your king or runs along the edge to be mated.',
      'Keep the rook far from his king. A rook next to the king with no protection is simply taken, and then the game is a draw.',
    ],
    rules: [
      'Rook cuts him off; king walks up; the rook checks only when the kings face each other.',
      'Kings facing each other and it is your move: make a waiting move with the rook.',
      'If the king attacks your rook, move it to the far side of the board on the same row.',
      'The mate is always on the edge: kings facing each other, rook checks along the edge.',
    ],
    demo: {
      fen: '6k1/R7/5K2/8/8/8/8/8 w - - 0 1',
      intro: 'The rook already holds the king on the back row. White only has to get the kings face to face with Black to move.',
      moves: [
        { san: 'Kg6', note: 'The kings face each other. If Black now goes to h8, Ra8 is mate at once.' },
        { san: 'Kf8', note: 'He steps aside. Ra8+ is not mate now: he would escape to e7.' },
        { san: 'Rb7', note: 'The waiting move. The rook stays on the seventh row and Black has to move. Going on to e8 only makes it take longer: White follows with Kf6.' },
        { san: 'Kg8', note: 'He steps back in front of the white king.' },
        { san: 'Rb8#', note: 'Mate. The king covers f7, g7 and h7, the rook covers the back row.' },
      ],
    },
    drills: [
      { id: 'rook-mate-1', title: 'King in the middle', fen: '8/8/8/4k3/8/8/8/R3K3 w - - 0 1', goal: 'mate', task: 'Checkmate the king. It takes around fifteen moves, so be patient and do not leave the rook where it can be taken.' },
      { id: 'rook-mate-2', title: 'From the corner', fen: '8/8/8/8/8/2k5/8/K6R w - - 0 1', goal: 'mate', task: 'His king is close to yours. Cut him off with the rook first.' },
    ],
  },
  {
    id: 'ladder',
    group: 'Checkmates you must know',
    title: 'The ladder: two rooks, or queen and rook',
    summary: 'One piece guards a row, the other checks on the next. No king needed.',
    text: [
      'Two heavy pieces mate without any help from the king. One rook stands on a row and guards it. The other rook checks on the next row, so the king has to step back. Then the first rook checks on the row after that. The rooks climb like the steps of a ladder until the king is on the edge.',
      'The only danger is the king walking up to a rook and attacking it. Do not panic and do not give up the ladder: slide the attacked rook to the other side of the board along the same row. It still guards the row and he is too far away to bother it.',
    ],
    rules: [
      'One rook guards a row, the other checks on the next row. Then swap roles.',
      'King attacks a rook: move it far away along the same row.',
      'Keep the two rooks on different files so they do not get in each other\'s way.',
    ],
    demo: {
      fen: '8/8/8/4k3/8/8/8/RR4K1 w - - 0 1',
      intro: 'White mates with the two rooks alone. The white king never moves.',
      moves: [
        { san: 'Ra4', note: 'The first step: the king cannot come down past the fourth row.' },
        { san: 'Kd5' },
        { san: 'Rb5+', note: 'Check on the next row. He has to go back.' },
        { san: 'Kc6', note: 'He attacks the rook.' },
        { san: 'Rh5', note: 'Far away along the same row. The fifth row is still guarded.' },
        { san: 'Kb6' },
        { san: 'Rg4', note: 'The other rook gets away from the king too before it checks, and stays off the h-file.' },
        { san: 'Kc6' },
        { san: 'Rg6+', note: 'Next step of the ladder.' },
        { san: 'Kd7' },
        { san: 'Rh7+' },
        { san: 'Ke8' },
        { san: 'Rg8#', note: 'Mate. One rook holds the seventh row, the other mates on the eighth.' },
      ],
    },
    drills: [
      { id: 'ladder-1', title: 'Two rooks', fen: '8/8/8/4k3/8/8/8/RR4K1 w - - 0 1', goal: 'mate', task: 'Checkmate with the rooks. Try to do it without moving your king.' },
      { id: 'ladder-2', title: 'Rooks in the corners', fen: '8/8/8/8/3k4/8/8/R3K2R w - - 0 1', goal: 'mate', task: 'Set the ladder up and walk the king to the edge.' },
    ],
  },
  {
    id: 'square',
    group: 'King and pawn',
    title: 'The rule of the square',
    summary: 'Can the king catch a running pawn? Count once, with a square.',
    text: [
      'A passed pawn runs for the last row and the enemy king chases it alone. You do not have to count move by move. Draw a square in your head: one side runs from the pawn to the square where it queens, and the square is as wide as that side is long.',
      'If the king is inside the square, or can step into it on his move, he catches the pawn. If he cannot, the pawn queens.',
      'Two things to remember. A pawn on its starting square can move two squares at once, so draw the square as if it stood one square further up. And the rule only works when nothing else matters: no other pieces in the way, and the pawn\'s own king too far away to help.',
    ],
    rules: [
      'Square from the pawn to its queening square, the same width as its height.',
      'King inside the square (or stepping in on his move): the pawn is caught.',
      'King outside: push the pawn, do not waste a move on anything else.',
    ],
    demo: {
      fen: '8/8/8/P7/4k3/8/8/7K b - - 0 1',
      intro: 'The pawn is on a5, so the square runs from a5 to a8 and across to d8 and d5. Black is to move and his king can step into it.',
      flip: true,
      moves: [
        { san: 'Kd5', note: 'Into the square. That is enough: the pawn is caught.' },
        { san: 'a6' },
        { san: 'Kc6' },
        { san: 'a7' },
        { san: 'Kb7' },
        { san: 'a8=Q+' },
        { san: 'Kxa8', note: 'Just in time. Had it been White\'s move in the first position, the pawn would have queened.' },
      ],
    },
    drills: [
      { id: 'square-1', title: 'Run or wait?', fen: '8/8/8/5k2/P7/8/8/7K w - - 0 1', goal: 'win', task: 'Win the game. Work out with the square whether the black king can catch the pawn, then play your move.' },
      { id: 'square-2', title: 'Catch the pawn', fen: '8/8/8/P7/4k3/8/8/7K b - - 0 1', goal: 'draw', task: 'You are Black. Save the game: the pawn must not become a queen.' },
    ],
  },
  {
    id: 'opposition',
    group: 'King and pawn',
    title: 'King and pawn against king: winning',
    summary: 'King in front of the pawn, and take the opposition.',
    text: [
      'One extra pawn wins only if your king can force the way for it. The pawn cannot do it alone, and a king that walks behind his pawn pushing it along only reaches a draw. The king has to go first.',
      'The fight between the kings is decided by the opposition. When the kings face each other with one square between them, the player who does not have to move has the opposition. The other king has to step aside, and your king then walks forward round him.',
      'From this come the rules for winning. Get your king in front of the pawn. If your king is two squares in front of the pawn, you always win, because you have a spare pawn move to hand the move back to him. If your king is on the sixth row in front of the pawn, you win no matter whose move it is.',
      'Do not push the pawn while your king can still gain ground. Each pawn move uses up a square your king might need, and each pawn move you still have in hand is a waiting move for later.',
    ],
    rules: [
      'King in front of the pawn, never behind it.',
      'Kings face to face and he has to move: you have the opposition and he must give way.',
      'When he steps to one side, go forward on the other side.',
      'A spare pawn move wins the opposition: use it only when you need it.',
      'King on the sixth row in front of the pawn always wins (except with a rook pawn).',
    ],
    demo: {
      fen: '8/8/4k3/8/4K3/4P3/8/8 b - - 0 1',
      intro: 'The kings face each other and Black has to move. White has the opposition and wins.',
      moves: [
        { san: 'Kd6', note: 'He has to step aside.' },
        { san: 'Kf5', note: 'Forward on the other side. The king goes first, the pawn stays at home.' },
        { san: 'Ke7' },
        { san: 'Ke5', note: 'The opposition again.' },
        { san: 'Kd7' },
        { san: 'Kf6', note: 'Round him again. The king has reached the sixth row.' },
        { san: 'Ke8' },
        { san: 'e4', note: 'Only now does the pawn start to move.' },
        { san: 'Kf8' },
        { san: 'e5' },
        { san: 'Ke8' },
        { san: 'Ke6', note: 'King on the sixth in front of the pawn, and Black has to move: this always wins.' },
        { san: 'Kf8' },
        { san: 'Kd7', note: 'The king now covers e6, e7 and e8: the whole road for the pawn.' },
        { san: 'Kf7' },
        { san: 'e6+' },
        { san: 'Kf8' },
        { san: 'e7+' },
        { san: 'Kf7' },
        { san: 'e8=Q+', note: 'The rest is the queen mate.' },
      ],
    },
    drills: [
      { id: 'opposition-1', title: 'King on the sixth', fen: '4k3/8/4K3/4P3/8/8/8/8 w - - 0 1', goal: 'win', task: 'Queen the pawn. Your king is on the sixth row in front of it, so this is a win. The pawn cannot move while your king stands in front of it: step to one side so that it can follow.' },
      { id: 'opposition-2', title: 'Take the opposition', fen: '8/4k3/8/8/4K3/4P3/8/8 w - - 0 1', goal: 'win', task: 'Queen the pawn. Your king has to get in front of it before the black king blocks the way: king first, pawn later.' },
      { id: 'opposition-3', title: 'The spare move', fen: '8/8/3k4/8/3K4/8/3P4/8 w - - 0 1', goal: 'win', task: 'Queen the pawn. The kings face each other and it is your move, but you have something Black does not.' },
    ],
  },
  {
    id: 'defend-pawn',
    group: 'King and pawn',
    title: 'King and pawn against king: holding the draw',
    summary: 'Stay in front of the pawn and step straight back.',
    text: [
      'A pawn down with only kings left is very often a draw, and it is worth half a point every time you know how. Your king belongs on the square in front of the pawn, or the one in front of that. As long as he blocks the way, the pawn is not going anywhere.',
      'When you are forced to step back, go straight back, on the same file as the pawn. Then, when his king comes forward next to the pawn, you step in front of his king and take the opposition. He can only push the pawn with check, you go back in front of it, and his last try is stalemate.',
      'Stepping back to the side instead is the losing mistake. His king takes the opposition and escorts the pawn home.',
    ],
    rules: [
      'King in front of the pawn.',
      'When you have to retreat, retreat straight back.',
      'When his king comes up beside the pawn, face him: take the opposition.',
      'It ends in stalemate, or he gives the pawn up.',
    ],
    demo: {
      fen: '8/4k3/8/4P3/4K3/8/8/8 b - - 0 1',
      intro: 'Black is a pawn down but his king is in front of the pawn. He holds the draw.',
      flip: true,
      moves: [
        { san: 'Kd7' },
        { san: 'Kd5' },
        { san: 'Ke7', note: 'Back in front of the pawn.' },
        { san: 'e6' },
        { san: 'Ke8', note: 'The key move: straight back. Going to d8 or f8 would lose.' },
        { san: 'Kd6' },
        { san: 'Kd8', note: 'His king came up on the d-file, so Black faces him there: the opposition.' },
        { san: 'e7+' },
        { san: 'Ke8' },
        { san: 'Ke6', note: 'Stalemate. Any other move loses the pawn. Draw.' },
      ],
    },
    drills: [
      { id: 'defend-pawn-1', title: 'Hold the draw', fen: '8/4k3/8/4P3/4K3/8/8/8 b - - 0 1', goal: 'draw', task: 'You are Black. Stop the pawn. The computer will try everything.' },
      { id: 'defend-pawn-2', title: 'The only move', fen: '4k3/8/3KP3/8/8/8/8/8 b - - 0 1', goal: 'draw', task: 'You are Black and only one move draws. Which square takes the opposition?' },
    ],
  },
  {
    id: 'rook-pawn',
    group: 'King and pawn',
    title: 'The rook pawn is different',
    summary: 'A pawn on the a-file or h-file: get your king to the corner and it is a draw.',
    text: [
      'A pawn on the edge of the board (the a-file or the h-file) wins far less often than any other pawn. The defending king simply goes to the corner where the pawn wants to queen. He cannot be driven out: there is no room on the far side of the pawn for the attacking king to go round, so the opposition is worth nothing. In the end it is stalemate.',
      'It is also a draw when the attacking king gets shut in on the edge in front of his own pawn, and it is why a bishop and a rook pawn do not win when the bishop does not control the queening corner.',
      'So when you are ahead, keep pawns away from the edge when you choose which ones to trade. When you are behind, a rook pawn is the one you would like him to be left with.',
    ],
    rules: [
      'Defending: run for the queening corner. Once you are there it is a draw.',
      'Attacking: the win needs the enemy king kept out of the corner altogether.',
      'When trading pawns while ahead, keep a pawn that is not on the edge.',
    ],
    demo: {
      fen: '8/1k6/8/PK6/8/8/8/8 b - - 0 1',
      intro: 'With any other pawn this would be lost for Black. With the a-pawn it is a draw.',
      flip: true,
      moves: [
        { san: 'Ka7' },
        { san: 'a6' },
        { san: 'Ka8', note: 'Into the corner.' },
        { san: 'Kb6' },
        { san: 'Kb8' },
        { san: 'a7+' },
        { san: 'Ka8' },
        { san: 'Ka6', note: 'Stalemate. White had nothing better.' },
      ],
    },
    drills: [
      { id: 'rook-pawn-1', title: 'Sit in the corner', fen: '8/1k6/8/PK6/8/8/8/8 b - - 0 1', goal: 'draw', task: 'You are Black. Hold the draw against the a-pawn.' },
    ],
  },
  {
    id: 'pawn-tricks',
    group: 'King and pawn',
    title: 'Passed pawns: the decoy and the breakthrough',
    summary: 'A far-away passed pawn drags his king off. Three pawns against three can break through.',
    text: [
      'A passed pawn far away from the other pawns (an outside passed pawn) usually wins a pawn ending. You push it, his king has to go and catch it, and while he is away your king eats the pawns he left behind. The passed pawn is not there to queen. It is there to be given up at the right moment.',
      'The breakthrough is the other trick worth knowing by heart. Three pawns side by side on the fifth row against three on their starting squares, with the kings far away: push the middle pawn. Whichever way he takes, push the pawn on the other side from the one that took. He has to take again, and your last pawn runs through.',
      'Both tricks come from the same idea. In a pawn ending, count: how many moves does my pawn need, how many does his king need. Whoever queens first, with the other side too slow, wins.',
    ],
    rules: [
      'Outside passed pawn: push it to drag his king away, then take his other pawns with your king.',
      'Three against three on the fifth row: middle pawn first.',
      'In pawn endings, count moves before you choose.',
    ],
    demo: {
      fen: '7k/ppp5/8/PPP5/8/8/8/7K w - - 0 1',
      intro: 'Both kings are too far away. White breaks through by force.',
      moves: [
        { san: 'b6', note: 'The middle pawn. Black has to take, or the pawn takes and queens.' },
        { san: 'cxb6', note: 'If he takes with the a-pawn instead, White pushes the c-pawn: the mirror image.' },
        { san: 'a6', note: 'Now the pawn on the side away from the one that took.' },
        { san: 'bxa6' },
        { san: 'c6', note: 'Nothing can stop this pawn, and it queens long before the black pawns get anywhere.' },
      ],
    },
    drills: [
      { id: 'pawn-tricks-1', title: 'The breakthrough', fen: '7k/ppp5/8/PPP5/8/8/8/7K w - - 0 1', goal: 'win', task: 'Get a queen. Remember which pawn goes first, and which one goes second.' },
      { id: 'pawn-tricks-2', title: 'The outside passed pawn', fen: '8/8/4k3/5p1p/1P3P1P/4K3/8/8 w - - 0 1', goal: 'win', task: 'Win the game. The b-pawn is your decoy: use it to pull the black king away from his pawns.' },
    ],
  },
  {
    id: 'lucena',
    group: 'Rook endings',
    title: 'Rook and pawn: building a bridge',
    summary: 'The winning position. Your king is in front of the pawn on the seventh and needs a way out.',
    text: [
      'Most rook endings come down to rook and one pawn against rook. The side with the pawn wins if it can reach this position (called the Lucena position): the pawn on the seventh row, your king on the queening square in front of it, and his king cut off by your rook, one file or more away from the pawn.',
      'The trouble is that your king is in the way of the pawn, and as soon as he steps out, the enemy rook checks him again and again. The answer is called building a bridge. First check his king one more file away. Then put your rook on the fourth row. Then bring your king out and walk him towards the checking rook. When your king reaches the fifth row, your rook steps in front of him and blocks the check. There are no more checks, and the pawn queens.',
      'The fourth row is the whole point: the rook has to be exactly far enough up the board to shield the king when he arrives.',
    ],
    rules: [
      'Aim for: pawn on the seventh, king in front of it, his king cut off by your rook.',
      'Check his king a file further away, then rook to the fourth row.',
      'King out, walk towards the checks, block the last one with the rook.',
    ],
    demo: {
      fen: '1K6/1P1k4/8/8/8/8/r7/2R5 w - - 0 1',
      intro: 'The king is stuck in front of the pawn. White builds the bridge.',
      moves: [
        { san: 'Rd1+', note: 'First push his king one more file away.' },
        { san: 'Ke7' },
        { san: 'Rd4', note: 'The bridge: the rook goes to the fourth row and waits there.' },
        { san: 'Ra1' },
        { san: 'Kc7', note: 'The king comes out. The checks start.' },
        { san: 'Rc1+' },
        { san: 'Kb6' },
        { san: 'Rb1+' },
        { san: 'Kc6' },
        { san: 'Rc1+' },
        { san: 'Kb5' },
        { san: 'Rb1+' },
        { san: 'Rb4', note: 'The rook blocks the check. Nothing stops the pawn now.' },
      ],
    },
    drills: [
      { id: 'lucena-1', title: 'Build the bridge', fen: '1K6/1P1k4/8/8/8/8/r7/2R5 w - - 0 1', goal: 'win', task: 'Queen the pawn, or win the rook for it. The computer may defend differently from the lesson, so keep the idea in mind: get your king out without running into endless checks.' },
    ],
  },
  {
    id: 'philidor',
    group: 'Rook endings',
    title: 'Rook and pawn: the drawing defence',
    summary: 'King on the queening square, rook on your third row, then check from behind.',
    text: [
      'This is the most useful defence in chess (the Philidor position), because rook endings a pawn down turn up all the time. You need your king on the queening square of the pawn, and your rook on the third row counted from your side, which is the sixth row if you are Black.',
      'On that row the rook stops his king from coming forward. He can only make progress by pushing the pawn onto that row. The moment he does, the pawn takes away the square his king wanted to hide on. So you run your rook to the far end of the board and check his king from behind. He has no shelter from the checks and cannot make progress.',
      'The two halves go together. Rook on the third row until the pawn comes to that row, and not a move sooner. Then, straight away, to the far end for the checks.',
    ],
    rules: [
      'King on the queening square.',
      'Rook on your third row, moving sideways along it, until the pawn steps onto that row.',
      'Then rook to the far end and check from behind, again and again.',
      'If he offers to trade rooks, check first that the pawn ending is a draw.',
    ],
    demo: {
      fen: '4k3/7R/r7/3KP3/8/8/8/8 b - - 0 1',
      intro: 'Black is a pawn down. His king is on the queening square and his rook is on the sixth row.',
      flip: true,
      moves: [
        { san: 'Rb6', note: 'Black just waits on the sixth row. The white king cannot come forward to d6 or e6.' },
        { san: 'e6', note: 'The only way to try for more. But now the white king can no longer hide on e6.' },
        { san: 'Rb1', note: 'Straight to the far end.' },
        { san: 'Kd6', note: 'Threatening mate on h8.' },
        { san: 'Rd1+', note: 'Checks from behind. There is nowhere to hide.' },
        { san: 'Ke5' },
        { san: 'Re1+' },
        { san: 'Kf6' },
        { san: 'Rf1+' },
        { san: 'Ke5' },
        { san: 'Re1+', note: 'And so on. Draw.' },
      ],
    },
    drills: [
      { id: 'philidor-1', title: 'Hold the draw', fen: '4k3/7R/r7/3KP3/8/8/8/8 b - - 0 1', goal: 'draw', task: 'You are Black. Hold the draw for twelve moves. Keep the rook on the sixth row until the pawn gets there.' },
    ],
  },
  {
    id: 'rook-rules',
    group: 'Rook endings',
    title: 'Five rules for rook endings',
    summary: 'Active rook, rook behind the passed pawn, cut the king off.',
    text: [
      'Rook endings are the ones you will play most, and they are drawn far more often than other endings, even a pawn down. What decides them is how active the rooks are. A rook that only defends a pawn is half a rook. A rook that attacks is worth a pawn by itself.',
      'Rooks belong behind passed pawns, yours and his. Behind your own pawn the rook gains room with every step the pawn takes. Behind his pawn it attacks the pawn all the way. A rook stuck in front of a pawn loses room with every step.',
      'A rook on the seventh row attacks pawns that have not moved and shuts his king in on the back row. It is often worth a pawn to get it there.',
      'Use your rook to cut his king off. A king that cannot cross a file cannot help stop a passed pawn or defend his own pawns.',
      'When your rook is being harassed by his king, distance is your friend. Rooks check best from far away, where the king cannot come up to them.',
    ],
    rules: [
      'An active rook is worth a pawn. Do not tie your rook down to defence if there is another way.',
      'Rooks go behind passed pawns: yours to push them, his to stop them.',
      'A rook on the seventh row is a big advantage.',
      'Cut the enemy king off along a file or a row.',
      'Check from a distance.',
    ],
    drills: [],
  },
  {
    id: 'queen-pawn',
    group: 'Queen against pawn',
    title: 'Queen against a pawn on the seventh',
    summary: 'A win against a centre or knight pawn, a draw against a rook or bishop pawn.',
    text: [
      'You have queened first but his pawn is one step from queening too, protected by his king, and your king is far away. Whether you win depends on which file the pawn is on.',
      'Against a pawn on the b, d, e or g file you win, with one idea repeated. Check and attack the pawn until his king has to step in front of it to defend it. While the king blocks his own pawn, the pawn is not queening, so you get a free move and bring your king one step closer. He comes out again, you force him back in front again, and your king takes another step. When your king arrives, you win the pawn or mate.',
      'Against a pawn on the a, c, f or h file it is a draw, because of stalemate. With a rook pawn the king sits in the corner in front of the pawn and has no moves, so you have no time for a king move. With a bishop pawn he does not defend the pawn at all: he goes into the corner, and if you take the pawn it is stalemate.',
      'The draw only holds when your king is far away. If he is close enough to help make a mating net, the queen wins anyway.',
    ],
    rules: [
      'Centre or knight pawn: force his king in front of the pawn, then bring your king a step closer. Repeat.',
      'Rook or bishop pawn with your king far away: draw by stalemate.',
      'Defending with a bishop pawn: go to the corner and let him take the pawn.',
    ],
    demo: {
      fen: '8/8/1K6/8/7Q/8/3kp3/8 w - - 0 1',
      intro: 'White forces the king in front of the pawn twice, and each time the white king comes a step closer.',
      moves: [
        { san: 'Qd4+' },
        { san: 'Kc2' },
        { san: 'Qe3', note: 'Attacking the pawn. He has to come back to defend it.' },
        { san: 'Kd1' },
        { san: 'Qd3+', note: 'Now the only way to keep the pawn is to step in front of it.' },
        { san: 'Ke1' },
        { san: 'Kc5', note: 'The pawn is blocked, so White has a free move. The king comes one step closer.' },
        { san: 'Kf2' },
        { san: 'Qd2', note: 'Pinning the pawn so it cannot queen.' },
        { san: 'Kf1' },
        { san: 'Qf4+' },
        { san: 'Kg2' },
        { san: 'Qe3' },
        { san: 'Kf1' },
        { san: 'Qf3+', note: 'The same thing again: in front of the pawn he goes.' },
        { san: 'Ke1' },
        { san: 'Kd4', note: 'Another step.' },
        { san: 'Kd2' },
        { san: 'Qd3+' },
        { san: 'Ke1' },
        { san: 'Ke3', note: 'The king has arrived.' },
        { san: 'Kf1' },
        { san: 'Qxe2+', note: 'The pawn falls and mate follows.' },
      ],
    },
    drills: [
      { id: 'queen-pawn-1', title: 'Win against the e-pawn', fen: '8/8/1K6/8/7Q/8/3kp3/8 w - - 0 1', goal: 'win', task: 'Win the pawn without letting it queen. Force the king in front of his pawn, then bring your king closer.' },
      { id: 'queen-pawn-2', title: 'Draw with the c-pawn', fen: 'K7/8/8/8/8/1Q6/2p5/1k6 b - - 0 1', goal: 'draw', task: 'You are Black and in check. Hold the draw. Remember what saves you: with your king in the corner on a1, taking the pawn is stalemate.' },
    ],
  },
  {
    id: 'principles',
    group: 'Principles',
    title: 'What changes in the endgame',
    summary: 'The king becomes a fighting piece and passed pawns decide everything.',
    text: [
      'In the opening and middlegame your king hides. Once the queens are off and there is no mating attack left, the king is a strong piece, worth about as much as a knight or bishop. Walk him to the middle of the board straight away. In most endings the side whose king arrives first wins.',
      'Passed pawns are what endgames are about. Make one, push it, and support it. A pawn majority on one side of the board (three pawns against two, say) is a passed pawn waiting to be made: advance the pawn that has no enemy pawn in front of it first.',
      'When you are ahead in material, trade pieces, not pawns. Every piece that comes off makes your extra piece or pawn count for more, and the pawns are what you will queen. When you are behind, do the opposite: trade pawns, keep pieces. With no pawns left, an extra knight or bishop cannot win.',
      'Do not hurry. If your opponent has nothing active to do, improve your king and your worst piece before you push anything. One weakness can usually be defended. Attack a second one on the other side of the board and the defence is stretched too far.',
      'Two things that often save a lost-looking game: bishops on opposite colours draw very often even two pawns down, and a lone rook pawn with a bishop that does not control the queening corner is a draw if the defending king gets to that corner.',
    ],
    rules: [
      'King to the centre as soon as the queens are off.',
      'Make a passed pawn and push it.',
      'Ahead: trade pieces. Behind: trade pawns.',
      'Do not rush. Improve your king first.',
      'Give the defender two weaknesses to look after.',
      'Rooks behind passed pawns.',
    ],
    drills: [],
  },
]

export const endgameById = (id: string) => ENDGAMES.find(t => t.id === id)
export const ENDGAME_DRILLS = ENDGAMES.flatMap(t => t.drills.map(d => ({ topic: t, drill: d })))
