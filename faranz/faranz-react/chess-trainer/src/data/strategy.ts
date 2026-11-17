/**
 * Strategy: lessons on the centre, pawn structure, piece placement and time,
 * each with an example to step through and positions in which you find the move.
 */
import { lastMoveOf, replay, type Square } from '../chess'
import type { EndgameDemo } from './endgames'

/** A position in which one move carries out the idea of the lesson. */
export interface StrategyTask {
  id: string
  /** The position: the moves that lead to it from the start, or a FEN. */
  line?: string
  fen?: string
  ask: string
  /** The moves that count as right, in standard notation. */
  good: string[]
  /** Shown after a wrong move. */
  hint: string
  /** Shown once the move is found. */
  why: string
}

export interface StrategyLesson {
  id: string
  group: string
  title: string
  summary: string
  text: string[]
  rules: string[]
  demo?: EndgameDemo
  tasks: StrategyTask[]
  /** Opening lessons in which the idea comes up. */
  see?: string[]
  /** Another page of the trainer that goes with the lesson. */
  link?: { label: string; to: string[] }
}

const START = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

/** An example from the starting position: the moves, with a note on the ones that matter. */
const line = (moves: string, notes: Record<number, string>) => moves.split(' ').map((san, i) => ({ san, ...(notes[i + 1] ? { note: notes[i + 1] } : {}) }))

export const STRATEGY_GROUPS = ['The centre', 'Pawn structure', 'Where the pieces belong', 'Time and the initiative', 'Putting it together']

export const STRATEGY: StrategyLesson[] = [
  {
    id: 'centre',
    group: STRATEGY_GROUPS[0],
    title: 'Why the centre matters',
    summary: 'Pieces in the middle reach both wings, and pawns in the middle take squares away.',
    text: [
      'The centre is the four squares in the middle of the board, e4, d4, e5 and d5, and the squares around them. A knight on one of them reaches eight squares; on the edge it reaches four, in the corner two. A piece in the centre can get to either wing in one or two moves. A piece on the wing can only play on that wing.',
      'Pawns in the centre do something more: they take squares away. A pawn on e4 attacks d5 and f5, so no black piece can settle there. Two pawns side by side on e4 and d4 attack c5, d5, e5 and f5, the whole rank in front of them. Behind such a centre your pieces have room to move; the other side’s pieces are short of squares and get in each other’s way.',
      'There are two ways to fight for the centre. You can occupy it with pawns, as your Italian and London do. Or you can let the other side build a pawn centre and then attack it, as your King’s Indian does. Both work. What does not work is to ignore it.',
      'Whether the centre is open or closed decides what kind of game it is. If the centre pawns have been traded, the lines are open: development and king safety matter most, and tactics are everywhere. If the pawns are locked against each other, the centre is closed: play moves to the wings and there is time for slow plans.',
    ],
    rules: [
      'Open with a centre pawn and develop your pieces towards the middle.',
      'Two pawns side by side in the centre are worth having. Support them, and do not push one of them without a reason.',
      'If the other side has the centre, attack it with a pawn before it is supported from behind.',
      'Open centre: hurry, develop and castle. Closed centre: there is time, play on a wing.',
    ],
    demo: {
      fen: START,
      intro: 'Your Italian, when Black is slow. Watch how White gets two pawns side by side in the centre.',
      moves: line('e4 e5 Nf3 Nc6 Bc4 Bc5 c3 d6 d4 exd4 cxd4 Bb6 Nc3', {
        1: 'The pawn on e4 attacks d5 and f5: no black piece can settle on those squares.',
        2: 'Black takes an equal share of the centre.',
        7: 'A quiet move with one purpose: to support d4. If Black takes on d4, a pawn takes back, and White has two pawns in the centre.',
        8: 'Solid, but slow. The testing move is 4… Nf6, which attacks e4. The next lesson shows what it changes.',
        9: 'The pawn attacks the bishop and the pawn on e5.',
        11: 'The full centre: pawns on e4 and d4, side by side. Between them they attack c5, d5, e5 and f5.',
        12: 'The bishop has to move again.',
        13: 'White develops behind the centre, with room for every piece. Black’s knights have no good squares in the middle of the board, and White can choose the moment to push e5 or d5.',
      }),
    },
    tasks: [
      {
        id: 'centre-take',
        line: 'e4 h6',
        ask: 'Black has spent the first move on the edge of the board. Take the whole centre.',
        good: ['d4'],
        hint: 'Put a second pawn next to the first one.',
        why: 'Two pawns side by side on d4 and e4. They attack c5, d5, e5 and f5, and both of your bishops have an open diagonal. Black’s move did nothing about any of it.',
      },
    ],
    see: ['italian-centre', 'italian-slow-d6'],
  },
  {
    id: 'break-the-centre',
    group: STRATEGY_GROUPS[0],
    title: 'Dismantling a pawn centre',
    summary: 'Hit it with a pawn, take away its guards, and do it before it is supported.',
    text: [
      'A pawn centre is strong while its pawns stand side by side. The aim of the other side is to make one of them move or disappear. Once one pawn is traded or pushed, the squares it guarded are free and the pawn that is left can be attacked.',
      'The main tool is a pawn strike: you put one of your own pawns where it attacks one of theirs. Against pawns on e4 and d4 that means …d5, …c5 or …e5. The attacked pawn has three choices. It can take, and then it is gone from the centre. It can push past, and then the pawns are no longer side by side and the squares behind them are weak. Or it can stay and be defended, and then pieces are tied to guarding it. Work out all three before you strike.',
      'The second tool is to take away the guards. Centre pawns are held up by pieces, usually the knights on c3 and f3. Pin the knight, or trade it off, and the pawn it was guarding is suddenly short of a defender.',
      'The third is timing. A centre that has all of its pieces behind it is very hard to break. A centre that has just been set up, with the pieces still at home, is a target. So strike early, and use checks and threats so that the other side has no free move to support the pawns or to push them forward against your pieces.',
    ],
    rules: [
      'Attack a pawn centre with a pawn. Pieces alone do not break it.',
      'The attacked pawn can take, push or stay. Know your answer to all three.',
      'Pin or trade the knight that guards the centre.',
      'Strike before the centre is supported, and use checks to gain the time.',
      'Do not let the pawns advance with an attack on your pieces.',
    ],
    demo: {
      fen: START,
      intro: 'The same opening as in the last lesson, but this time Black plays 4… Nf6 and takes the centre apart.',
      moves: line('e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Nf6 d4 exd4 cxd4 Bb4+ Bd2 Bxd2+ Nbxd2 d5 exd5 Nxd5', {
        7: 'White wants the big centre with d4, as before.',
        8: 'The difference: Black develops with an attack on e4.',
        11: 'White has the two pawns. But the bishop on c5 is attacked, and if it just steps back to b6, White pushes e5, chases the knight and the centre rolls forward. Black needs a move that leaves White no time for that.',
        12: 'Check. White has to answer it, and so the pawns stay where they are.',
        15: 'The bishops are traded and the pawns still stand side by side. Now the pawn strike.',
        16: 'The move that dismantles the centre. It attacks the pawn on e4 and the bishop on c4 at once, so White has no time to support anything.',
        18: 'The e-pawn is gone. White’s pair has become a single pawn on d4 with no pawn beside it to guard it, and Black’s knight stands on the square in front of it, where no pawn can chase it away. The game is level. This is why your Italian plays 5. d3 and not 5. d4.',
      }),
    },
    tasks: [
      {
        id: 'break-kid',
        line: 'd4 Nf6 c4 g6 Nc3 Bg7 e4 d6 Nf3 O-O Be2',
        ask: 'You have let White build a centre of three pawns, and your pieces are ready behind your own lines. Now strike at d4 with a pawn.',
        good: ['e5', 'c5'],
        hint: 'Two of your pawns can attack d4 in one move. Your King’s Indian uses the e-pawn.',
        why: 'The pawn attacks d4. White has to take, push past or hold the tension, and each choice changes the centre: after d5 it is closed, and you attack on the kingside. Your King’s Indian plays …e5; …c5 strikes the same pawn from the other side.',
      },
    ],
    see: ['italian-main-d5', 'kid-start'],
  },
  {
    id: 'pawn-breaks',
    group: STRATEGY_GROUPS[0],
    title: 'Pawn breaks',
    summary: 'The pawn move that offers a trade and opens a line. Without one there is no plan.',
    text: [
      'A pawn break is a pawn move that puts your pawn in contact with one of theirs, so that one can take the other. It is the only way lines get opened. Rooks need open files and bishops need open diagonals, and in a position where the pawns are locked nothing happens until somebody breaks.',
      'Every pawn structure has its breaks, and finding them is most of what planning is. Look for the places where one of your pawns can move to a square from which it attacks one of theirs. In the Sicilian, Black’s freeing break is …d5. In the French and the Caro-Kann it is …c5. In the King’s Indian it is …f5. In your slow Italian, White prepares d4 with c3.',
      'A break has to be prepared like any other capture: count how many pieces attack the square the pawn is going to, and how many defend it. And put a rook behind the pawn before you push it. When the file opens, the rook is already standing on it.',
      'The other side has breaks too. If you can take one away, by controlling the square the pawn needs, their position has no plan left in it. That is often worth more than a move of your own.',
    ],
    rules: [
      'In a quiet position, find your pawn break before anything else.',
      'Count attackers and defenders of the square before you push.',
      'Put a rook on the file that is going to open.',
      'Open the position when your pieces are better placed. Keep it closed when theirs are.',
      'Find their break as well, and stop it if it is cheap to do.',
    ],
    demo: {
      fen: START,
      intro: 'The Sicilian is one pawn break answered by another. This is the Classical line from your repertoire.',
      moves: line('e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6 Be2 Bg7 O-O O-O Be3 Nc6 Nb3 Be6', {
        2: 'Black does not put a pawn on e5. The c-pawn is waiting to be traded for White’s d-pawn.',
        5: 'White’s break. It opens the d-file for the queen and rooks and the diagonal for the bishop on c1.',
        7: 'The trade has changed the position for good. Black has two centre pawns, d and e, against White’s one. White has a half-open d-file and Black a half-open c-file: that is where each side’s rooks will go.',
        8: 'Development with an attack on e4.',
        18: 'Both sides have developed around the open lines. Black’s next break is …d5: if it can be played safely, every black piece comes to life and the game is level. White will try to stop it, or to get f4 and f5 in first. From here on, each side is playing for its next pawn break.',
      }),
    },
    tasks: [
      {
        id: 'breaks-alapin',
        line: 'e4 c5 c3',
        ask: 'White’s last move prepares d4, to take back with a pawn and keep two pawns in the centre. Hit the centre with a pawn before it is built.',
        good: ['d5'],
        hint: 'The pawn on e4 is not guarded, and the knight cannot come to c3 to guard it: White’s own pawn has taken that square.',
        why: '2… d5 attacks e4 before d4 arrives. After 3. exd5 Qxd5 the queen cannot be chased by Nc3, because White’s own pawn stands there. This is the line in your Sicilian.',
      },
      {
        id: 'breaks-open',
        line: 'e4 c5 Nf3 d6',
        ask: 'Your pieces want open lines. Play the pawn break that opens a file and a diagonal at once.',
        good: ['d4'],
        hint: 'Which pawn can move to a square where Black’s c-pawn can take it?',
        why: 'After …cxd4 and Nxd4 the d-file is half-open for your queen and rooks, the bishop on c1 can see out, and your knight stands in the centre.',
      },
    ],
    see: ['sicilian-classical', 'sicilian-alapin'],
  },
  {
    id: 'pawn-chain',
    group: STRATEGY_GROUPS[1],
    title: 'Building a pawn chain',
    summary: 'Pawns on a diagonal, each guarding the next. The chain gives you space on the side it points to.',
    text: [
      'A pawn chain is a line of pawns on a diagonal, each one guarding the pawn in front of it: c3, d4 and e5, for example. The pawn at the back is the base. It is the only one that no pawn guards. The pawn at the front is the head.',
      'Chains appear when a centre pawn is attacked and pushes past instead of trading: e5 in answer to …d5, or d5 in answer to …e5. The centre is then blocked. Nothing can be traded there for a long time, so the game moves to the wings.',
      'The chain tells you which wing. It points, like an arrow, towards the side where its head is, and on that side you have more room. With pawns on d4 and e5 White has more space on the kingside: the pawn on e5 takes f6 away from Black’s knight, and White’s pieces can gather there. So the rule is simple: play on the side your chain points to.',
      'A chain has a price. Its pawns all stand on squares of one colour, so the squares of the other colour between them are weak, and your own bishop of the chain’s colour is blocked by them. And the base is a target that cannot run away. Support it before it is attacked: with c3 behind d4, a pawn takes back when the base is traded and the chain is still standing.',
    ],
    rules: [
      'Your chain points to the side where you have more space. Attack there.',
      'Guard the base with a pawn if you can, so that a pawn takes back.',
      'Count attackers and defenders of the base, as for any capture.',
      'Your bishop on the colour of the chain is the bad one. Get it outside the chain or trade it.',
      'Do not push to make a chain if you cannot hold both its base and its head.',
    ],
    demo: {
      fen: START,
      intro: 'The French Defence, Advance Variation: the plainest pawn chain there is.',
      moves: line('e4 e6 d4 d5 e5 c5 c3 Nc6 Nf3 Qb6 Be2 cxd4 cxd4 Nge7 Na3 Nf5 Nc2', {
        4: 'Black attacks e4. White can trade, defend, or push past.',
        5: 'White pushes past, and a chain is made: d4 guards e5. The centre is blocked. The chain points to the kingside, and that is where White has more room: the pawn on e5 takes f6 away from Black’s knight.',
        6: 'Black goes straight for the base. The pawn on d4 is the one pawn in the chain that no pawn guards.',
        7: 'Now one does. If Black takes on d4, the c-pawn takes back and the chain is still standing.',
        10: 'Black adds attackers to d4: pawn, knight, queen. White has added defenders: pawn, knight, queen. Count them, as you would for any capture.',
        13: 'The c-pawns are gone. The chain is d4 and e5 again, and d4 is the base, with only pieces to guard it.',
        16: 'A third attacker on d4.',
        17: 'And a third defender, just in time. Three against three: the chain holds. White keeps the space, Black keeps the pressure. Look at Black’s bishop on c8, shut in behind the pawn on e6. That is the price of 1… e6, and the reason your Caro-Kann plays 1… c6 and brings the bishop out first.',
      }),
    },
    tasks: [
      {
        id: 'chain-caro',
        line: 'e4 c6 d4 d5 e5 Bf5 Nf3 e6 Be2',
        ask: 'White has a chain: d4 and e5. Your bishop is already outside your own pawns. Attack the base of the chain with a pawn.',
        good: ['c5'],
        hint: 'The base is the pawn at the back of the chain, the one that no pawn guards: d4.',
        why: '…c5 hits d4. If White takes, the chain has lost its base and the pawn on e5 becomes weak. If White supports it with c3, you add the knight from c6 and the queen from b6. This is the main line of your Caro-Kann.',
      },
    ],
    see: ['caro-french', 'caro-advance'],
  },
  {
    id: 'attack-the-chain',
    group: STRATEGY_GROUPS[1],
    title: 'Attacking a pawn chain',
    summary: 'Go for the base with a pawn break, on the side where your own chain points.',
    text: [
      'You cannot attack the middle of a chain: every pawn in it is guarded by the one behind. There are two places to hit it. The base, which no pawn guards, and the head, which can be challenged by a pawn from the side.',
      'The base is the usual target. A pawn break against it, like …c5 against d4, forces a decision. If the base is traded off, the next pawn becomes the base and the chain is one link shorter. If it is supported by another pawn, the chain is longer but its new base is further back, and you go after that one.',
      'When the centre is blocked, both sides usually have a chain, and the two chains point in opposite directions. Then each side attacks on its own wing, with a pawn break against the other side’s base, and the game becomes a race. The King’s Indian is the best-known example: White breaks with c5 on the queenside, Black with …f5 on the kingside.',
      'In a race, speed counts for more than pawns. Do not stop to defend on the wing where you are weaker unless you have to; every move spent there is a move the other side’s attack gains. And remember what is at the end of each attack. A breakthrough on the queenside wins material. A breakthrough on the kingside wins the king.',
    ],
    rules: [
      'Find the base, the last pawn of the chain, and attack it with a pawn.',
      'Attack on the side your own chain points to.',
      'When the base is guarded by a pawn, push past it and go for the new base.',
      'In a race on opposite wings, count moves, not pawns.',
      'If your own base is attacked, guard it with a pawn so that the chain survives a trade.',
    ],
    demo: {
      fen: START,
      intro: 'The main line of your King’s Indian: two chains and a race.',
      moves: line('d4 Nf6 c4 g6 Nc3 Bg7 e4 d6 Nf3 O-O Be2 e5 O-O Nc6 d5 Ne7 Ne1 Nd7 Nd3 f5 Bd2 Nf6 f3 f4 c5 g5', {
        12: 'The pawn strike at d4.',
        15: 'White pushes past, with an attack on the knight. Two chains now face each other. White’s, e4 and d5, points to the queenside. Black’s, d6 and e5, points to the kingside.',
        17: 'The knight steps back to free the f-pawn, and heads for d3 to support the break c5.',
        18: 'Black does the same: the knight makes way for the f-pawn.',
        20: 'Black’s break, against e4, the base of White’s chain.',
        23: 'White guards the base with a pawn. The chain is one link longer, and its base is now f3.',
        24: 'Black does not trade. The pawn pushes past, and Black’s own chain now reaches f4, deep in White’s kingside. Next comes …g5 and …g4, to hit the new base.',
        25: 'White’s break on the other wing, against the pawn on d6.',
        26: 'Each side attacks where its own chain points and spends as few moves as it can on the other wing. White wants to break through on the c-file. Black wants to open the g-file in front of White’s king. The computer prefers White by about half a pawn, but Black is the one attacking a king, and that makes the line dangerous to face.',
      }),
    },
    tasks: [
      {
        id: 'chain-kid',
        line: 'd4 Nf6 c4 g6 Nc3 Bg7 e4 d6 Nf3 O-O Be2 e5 O-O Nc6 d5 Ne7 Ne1 Nd7 Be3',
        ask: 'The centre is closed. Your chain, d6 and e5, points to the kingside. Play the pawn break that attacks the base of White’s chain.',
        good: ['f5'],
        hint: 'White’s chain is e4 and d5. Its base is e4. Which of your pawns can attack it?',
        why: '…f5 attacks e4. If White guards it with f3, you push on with …f4, with an attack on the bishop, and start the pawn storm with …g5.',
      },
    ],
    see: ['kid-classical', 'kid-samisch'],
  },
  {
    id: 'isolated-pawn',
    group: STRATEGY_GROUPS[1],
    title: 'The isolated pawn',
    summary: 'A pawn with no neighbours: active pieces for its owner, a target for the other side.',
    text: [
      'A pawn is isolated when there are no pawns of its own colour on the files next to it. No pawn can ever guard it, so pieces have to. The most common one is an isolated d-pawn, left behind when the pawns around it have been traded, as in the lesson on dismantling the centre.',
      'It is a weakness in two ways. The pawn itself can be attacked along the file and has to be guarded by pieces. And the square in front of it can never be attacked by a pawn, so the other side can put a piece there for good, usually a knight. That piece blocks the pawn and cannot be chased away.',
      'It is also a strength. The pawn takes space in the centre and guards two squares in the other side’s half, which make good posts for knights. Its owner has open or half-open files on both sides of it and pieces that come out easily. With plenty of pieces on the board, the side with the isolated pawn is the one attacking.',
      'So everything depends on how many pieces are left. In the middlegame the isolated pawn is often an advantage. In the endgame it is just a weak pawn. That gives both sides their plan.',
    ],
    rules: [
      'Against an isolated pawn: block it first, then trade pieces, then attack it.',
      'The best blocker is a knight on the square in front of the pawn.',
      'With an isolated pawn: keep the pieces on, use the open files and attack the king.',
      'With an isolated pawn, look for the moment to push it and open the position.',
      'Every trade of pieces makes an isolated pawn weaker.',
    ],
    demo: {
      fen: START,
      intro: 'Your line against the Sicilian with 2. c3. White ends up with an isolated d-pawn and uses it.',
      moves: line('e4 c5 c3 d5 exd5 Qxd5 d4 Nf6 Nf3 e6 Bd3 Nc6 O-O cxd4 cxd4 Be7 Nc3 Qd6 Re1 O-O a3 b6 Bc2 Bb7 Qd3', {
        15: 'White’s pawn on d4 has no pawn on the c-file or the e-file beside it. It is isolated: only pieces can guard it. But look at what it gives. It attacks c5 and e5, and White has a half-open e-file and easy squares for every piece.',
        17: 'Development with an attack on the queen.',
        19: 'The rook takes the half-open file.',
        21: 'A small move that keeps Black’s knight out of b4, from where it would trade off the bishop or go to d5.',
        25: 'Bishop and queen line up against h7. This is what the owner of an isolated pawn plays for: active pieces and an attack while there are plenty of pieces on the board. Black wants the opposite: a knight on d5, in front of the pawn, and trades. If the minor pieces come off, the pawn on d4 is only a weakness.',
      }),
    },
    tasks: [
      {
        id: 'isolated-panov',
        line: 'e4 c6 d4 d5 exd5 cxd5 c4 Nf6 Nc3 e6 Nf3 Be7 cxd5',
        ask: 'White has just taken on d5. Take back so that White is left with an isolated pawn and you have a piece on the square in front of it.',
        good: ['Nxd5'],
        hint: 'If you take back with the pawn, both sides have a d-pawn and neither is weak. Use a piece.',
        why: 'The pawn on d4 is now isolated, and your knight stands on d5 in front of it, where no white pawn can attack it. The pawn cannot advance, and every trade of pieces from here makes it weaker.',
      },
    ],
    see: ['e4-sicilian-d5', 'caro-panov'],
  },
  {
    id: 'weak-pawns',
    group: STRATEGY_GROUPS[1],
    title: 'Weak pawns and holes',
    summary: 'Doubled pawns, backward pawns, and the squares that pawn moves leave behind.',
    text: [
      'Pawns never move backwards. Every pawn move gives up, for good, the squares that pawn used to guard. Most weaknesses in a position are the result of a pawn move, or of a capture that changed the pawns.',
      'Doubled pawns are two pawns of one colour on the same file. They cannot guard each other, and the one in front blocks the one behind. They are not always bad: taking towards the centre with a pawn can open a file for a rook and add a guard to the centre squares. They are bad when they are isolated as well, and worst when the capture tears open the pawns in front of your king.',
      'A backward pawn is one whose neighbours have moved on ahead of it. No pawn can guard it, and it cannot advance because the square in front of it is attacked. If it stands on a file that is half-open for the other side’s rooks, it is a target that cannot move.',
      'A hole is a square that none of your pawns can ever attack again. The square in front of a backward or isolated pawn is always one. Holes matter because the other side’s pieces, knights above all, can settle on them. And a weakness of any kind only matters if it can be attacked: a backward pawn with enough guards, on a file the enemy rooks cannot use, costs nothing.',
    ],
    rules: [
      'Before a pawn move, ask which squares it stops guarding for good.',
      'Take back towards the centre with a pawn, unless that opens up your king.',
      'Attack a weak pawn along its file: rooks first, then more pieces than can guard it.',
      'Keep the pieces that cover your weak squares, and trade the ones that cover theirs.',
      'A weakness that cannot be attacked is not a weakness.',
    ],
    demo: {
      fen: START,
      intro: 'The Najdorf Sicilian. Black takes on a backward pawn and a hole on purpose, and builds the whole setup around them.',
      moves: line('e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 a6 Be2 e5 Nb3 Be7 O-O O-O Be3 Be6', {
        12: 'Black gains time on the knight and takes space. The cost is permanent. The d-pawn is now backward: the c-pawn is gone and the e-pawn has passed it, so no pawn can ever guard it, and it stands on a file that is half-open for White’s rooks. The square in front of it, d5, is a hole.',
        14: 'This bishop guards the pawn on d6.',
        18: 'And this one watches d5. Black guards the pawn, covers the hole, and hopes one day to push …d5 and be rid of both. With enough guards, the weakness costs nothing. But if the bishop on e6 and the knight on f6 were traded off, a white knight on d5 would run the game.',
      }),
    },
    tasks: [
      {
        id: 'weak-recapture',
        line: 'e4 e5 Nf3 Nc6 Bc4 Bc5 Nc3 Nf6 d3 d6 Bg5 h6 Bxf6',
        ask: 'White has taken your knight. Take back without damaging your pawns.',
        good: ['Qxf6'],
        hint: 'Taking with the g-pawn doubles your f-pawns and tears open the side where your king wants to castle.',
        why: 'Your pawns are untouched. After …gxf6 you would have doubled f-pawns, an isolated h-pawn and no safe home for the king on the kingside. If the knight comes to d5 to attack the queen, she steps back to d8 and nothing is lost.',
      },
    ],
    see: ['sicilian-najdorf'],
  },
  {
    id: 'outpost',
    group: STRATEGY_GROUPS[2],
    title: 'Outposts',
    summary: 'A square in their half that no pawn can attack is a permanent home for a knight.',
    text: [
      'An outpost is a square in the other side’s half of the board that none of their pawns can attack, best of all one that is guarded by a pawn of yours. A piece on an outpost cannot be driven away. It can only be traded off, and if you have a second piece ready to take its place, not even that helps.',
      'Knights gain the most. A knight moves a short way, so it has to stand close to the action, and close to the action it is usually chased off by a pawn. On an outpost on the fifth rank it attacks squares deep in the other camp for the rest of the game. On the sixth rank it is often worth a rook.',
      'Outposts come from holes, and holes come from pawn moves. When the other side pushes a pawn past a square, ask whether one of your knights can get there. Then look at which of their pieces still cover the square, and trade those pieces off. A bishop given up for the knight that guards the hole is usually a good trade.',
      'To defend, do not make the hole in the first place. If it is there, keep a piece that can trade off whatever lands on it, and do not let that piece be exchanged.',
    ],
    rules: [
      'Before you push a pawn past a square, check whether a knight can use it.',
      'A square no pawn can attack, guarded by your own pawn: put a knight on it.',
      'Trade off the pieces that guard the square before you jump in.',
      'Bring a second piece that can take over the square if the first one is traded.',
    ],
    demo: {
      fen: START,
      intro: 'A Sicilian in which Black plays …e5 early. Follow White’s knights.',
      moves: line('e4 c5 Nf3 Nc6 d4 cxd4 Nxd4 e5 Nb5 d6 N1c3 a6 Na3 b5 Nd5', {
        8: 'Black gains time on the knight. The price is the hole from the last lesson: no black pawn can ever attack d5 again.',
        9: 'The knight threatens a check on d6.',
        10: 'Stopped.',
        11: 'The second knight sets off for the hole.',
        13: 'One knight has been pushed to the edge of the board, the worst square it could have.',
        14: 'Black takes space and threatens …b4.',
        15: 'But the other knight has arrived. On d5 it is guarded by the pawn on e4 and no pawn can attack it. From here it reaches b6, c7, e7 and f6, all inside Black’s camp. Black can only get rid of it by giving up a piece for it.',
      }),
    },
    tasks: [
      {
        id: 'outpost-guard',
        fen: 'r4rk1/1pq1bppp/p2p1n2/4p1B1/4P3/2N5/PPP1QPPP/3R1RK1 w - - 0 1',
        ask: 'The square d5 is a hole: no black pawn can attack it. Your knight wants to live there, but one black piece guards the square. Remove the guard.',
        good: ['Bxf6'],
        hint: 'If the knight jumps in at once, Black trades knights. Which black piece covers d5?',
        why: 'Bishop takes knight, and after Black takes back your knight goes to d5 with an attack on the queen. It can never be driven away, and Black’s remaining bishop is shut in by its own pawns on d6 and e5: a good knight against a bad bishop.',
      },
    ],
    see: ['sicilian-sveshnikov'],
  },
  {
    id: 'bishops',
    group: STRATEGY_GROUPS[2],
    title: 'Good and bad bishops',
    summary: 'A bishop blocked by its own pawns is a bad one. Get it outside them, or trade it.',
    text: [
      'A bishop stays on squares of one colour for the whole game. If your centre pawns are fixed on that colour, they stand in its way and it has nothing to attack: that is a bad bishop. If your pawns are on the other colour, the bishop moves freely between them and guards the squares they do not: that is a good bishop.',
      'To tell which is which, look at your d-pawn and e-pawn once they have stopped moving. Pawns on dark squares: your light-squared bishop is the good one. Pawns on light squares: the dark-squared bishop is.',
      'There are three cures for a bad bishop. Bring it out in front of the pawns before you close the door: your London plays Bf4 before e3, and your Caro-Kann plays …Bf5 before …e6, for exactly this reason. Or trade it, for their good bishop or for a knight. Or change the pawns with a pawn break, so that its diagonal opens.',
      'The same idea decides between bishop and knight. Bishops need open diagonals, so they are better when the pawns have been traded and the position is open. Knights need squares that pawns cannot attack, so they are better when the position is blocked. Two bishops together, in an open position, are worth more than a bishop and a knight or two knights.',
    ],
    rules: [
      'Put your pawns on the colour your bishop does not use.',
      'Bring the bishop out before the pawn move that would shut it in.',
      'Trade your bad bishop. Keep your good one.',
      'Do not trade your good bishop for their bad one.',
      'Open position: bishops. Blocked position: knights.',
    ],
    demo: {
      fen: START,
      intro: 'Your London. Both sides play the same pawn moves, but only one of them brings the bishop out first.',
      moves: line('d4 d5 Bf4 Nf6 e3 e6 Nf3 c5 c3 Nc6 Nbd2 Bd6 Bg3 O-O Bd3 b6', {
        3: 'The bishop comes out before the e-pawn moves.',
        5: 'Now the door closes behind it. White’s pawns on d4 and e3 stand on dark squares, but the dark-squared bishop is in front of them, where they do not get in its way.',
        6: 'Black closes the same door with the bishop still inside. The pawns on d5 and e6 stand on light squares, and the light-squared bishop on c8 is behind them. That is a bad bishop.',
        12: 'Black challenges the London bishop.',
        13: 'White keeps it. If Black takes on g3, the h-pawn takes back and the rook on h1 has an open file.',
        15: 'White’s other bishop is the good one by the rule: the pawns are on dark squares, it runs on light ones, and it points at h7.',
        16: 'The bad bishop looks for another way out, through b7. It will get there, but it will still be looking at its own pawn on d5.',
      }),
    },
    tasks: [
      {
        id: 'bishop-caro',
        line: 'e4 c6 d4 d5 e5',
        ask: 'The centre is closed, and your next pawn move will be …e6. Which piece has to come out first?',
        good: ['Bf5'],
        hint: 'After …e6 your pawns stand on c6, d5 and e6, all light squares. Which bishop would be shut in behind them?',
        why: 'The light-squared bishop is outside the pawns before the door closes. Now …e6 is safe to play, and you have the French pawn structure without the French bad bishop.',
      },
    ],
    see: ['london-bishop', 'caro-french'],
  },
  {
    id: 'rooks',
    group: STRATEGY_GROUPS[2],
    title: 'Rooks: open files and the seventh rank',
    summary: 'A rook behind its own pawns does nothing. Give it a file, then a way in.',
    text: [
      'A rook moves in straight lines, and at the start of the game every line it has is blocked by its own pawns. It only starts to work when a file opens. An open file has no pawns on it. A half-open file has only an enemy pawn on it, and that pawn is something to attack.',
      'The plan with rooks has three steps. Put a rook on the open file. Put the second rook behind it, so that they cannot be challenged without a trade that leaves you still holding the file. Then go in: to the seventh rank if you can.',
      'On the seventh rank a rook attacks the other side’s pawns from the side, where pawns cannot guard each other, and it keeps the king on its back rank. The pieces that have to guard those pawns stop doing anything else. A rook on the seventh is usually worth a pawn, and two of them often decide the game.',
      'If there is no open file, put the rooks where one is going to appear: behind the pawn you intend to break with. And connect them early. Castle, bring the queen off the back rank, and the two rooks guard each other and can go to any file together.',
    ],
    rules: [
      'Rooks belong on open files. If there is none, on the file that will open next.',
      'Double the rooks before you allow a trade on the file.',
      'A rook on the seventh rank ties the other side down. Get one there.',
      'Connect your rooks: castle and move the queen off the back rank.',
      'If the other side holds the only open file, cover the squares where the rook would come in.',
    ],
    demo: {
      fen: 'r5k1/pp3ppp/2p5/8/8/2P5/PP3PPP/3R2K1 w - - 0 1',
      intro: 'Level material. The d-file is the only open file, White’s rook is already on it, and it is White’s move.',
      moves: [
        { san: 'Rd7', note: 'The seventh rank. From here the rook attacks pawns from the side, where other pawns cannot guard them: b7 now, and a7 or f7 as soon as anything moves.' },
        { san: 'Rb8', note: 'Black’s rook has to guard b7. One rook is attacking and the other is a guard. That is the whole difference between the two positions.' },
        { san: 'Kf1' },
        { san: 'Kf8' },
        { san: 'Ke2' },
        { san: 'Ke8', note: 'The king tries to chase the rook away.' },
        { san: 'Rc7', note: 'The rook stays on the rank, and the king can go no further: …Kd8 would let the rook take on f7. White’s king is free to walk up the board while Black’s pieces are tied down. White is not winning yet, but only White can.' },
      ],
    },
    tasks: [
      {
        id: 'rooks-file',
        fen: 'r4rk1/ppp2ppp/2n5/8/8/2N5/PPP2PPP/R4RK1 w - - 0 1',
        ask: 'The d-file and the e-file are open: there are no pawns on them. Put a rook on an open file.',
        good: ['Rfd1', 'Rad1', 'Rfe1', 'Rae1'],
        hint: 'A rook behind its own pawns attacks nothing. Find a file with no pawns on it.',
        why: 'The rook now looks all the way down the file to Black’s back rank. The second rook comes next, and then a rook goes to the seventh rank if Black allows it.',
      },
      {
        id: 'rooks-seventh',
        fen: 'r5k1/pp3ppp/2n5/8/8/2N5/PP3PPP/3R2K1 w - - 0 1',
        ask: 'Your rook holds the open file. Take the next step.',
        good: ['Rd7'],
        hint: 'Which rank are Black’s pawns standing on?',
        why: 'The rook on the seventh attacks b7, and Black has to defend instead of doing anything active.',
      },
    ],
  },
  {
    id: 'worst-piece',
    group: STRATEGY_GROUPS[2],
    title: 'Improve your worst piece, and when to trade',
    summary: 'What to do when there is nothing to do, and which trades help you.',
    text: [
      'Most moves in a game are not attacks. Nothing is hanging, there is no tactic, and the pawn break is not ready yet. The best use of such a move is to find the piece of yours that is doing the least and move it towards a square where it does more.',
      'The worst piece is easy to find. It is the knight on the edge, the bishop behind its own pawns, the rook on a closed file, or the piece that has not moved yet. Ask where it would like to stand, and then how many moves it takes to get there. A knight often needs three moves to reach its square, and they are well spent.',
      'A trade is never neutral: it helps the side whose piece was doing less. So before you trade, compare the two pieces. Trade your bad bishop for their good one, your passive rook for their active one, the knight on the edge for the knight in the centre. Do not give up a piece that is doing a job for one that is doing nothing.',
      'The position decides too. If you are ahead in material, trade pieces: the fewer pieces there are, the more the extra one counts, and the fewer tricks are left for the other side. If you are short of space, trade: fewer pieces need fewer squares. If you have more space, or you are attacking, keep the pieces on.',
    ],
    rules: [
      'No threat and no tactic: improve your worst piece.',
      'Ahead in material: trade pieces, keep pawns. Behind: trade pawns, keep pieces.',
      'Short of space: trade. More space or an attack: do not.',
      'Trade your worst piece for their best one.',
      'Before any trade, ask whose piece was doing more.',
    ],
    demo: {
      fen: START,
      intro: 'Your slow Italian. Nothing is attacked for a long time, so both sides improve their pieces. Follow White’s knight from b1.',
      moves: line('e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Nf6 d3 d6 O-O O-O Re1 a6 Bb3 Ba7 h3 h6 Nbd2 Re8 Nf1 Be6 Ng3', {
        9: 'The slow Italian. Nothing will be traded for a while, so both sides spend the next moves putting each piece on its best square.',
        13: 'The rook leaves f1. Remember that square.',
        16: 'Both bishops step back along their diagonals, out of reach of the pawns, before they are attacked. They lose nothing by it: each still looks down the same line.',
        18: 'Each side takes a square away from the other side’s pieces.',
        19: 'White’s worst piece is the knight on b1. On d2 it is no better yet, but it is on its way.',
        21: 'Through the square the rook left.',
        23: 'Three moves, and the knight that was doing nothing guards e4 and looks at f5 and h5, next to Black’s king. No threat was made and nothing was won, but White’s position is better than it was. This is what to do when there is nothing to do.',
      }),
    },
    tasks: [
      {
        id: 'trade-ahead',
        fen: '5rk1/ppp2ppp/3q4/8/8/2N5/PPP2PPP/3Q1RK1 w - - 0 1',
        ask: 'You are a knight up. What is the simplest way to make it count?',
        good: ['Qxd6'],
        hint: 'With the queens on, Black can still hope for checks and tricks. What happens to those hopes if the queens come off?',
        why: 'With the queens gone Black has no attack and no tricks, and an extra knight in an ending wins without risk. When you are ahead in material, trade pieces.',
      },
    ],
    see: ['italian-main'],
  },
  {
    id: 'development',
    group: STRATEGY_GROUPS[3],
    title: 'Development and tempo',
    summary: 'Each move is a unit of time. The side with more pieces out wins the fight that starts next.',
    text: [
      'A move is a unit of time, called a tempo. In the opening the two sides spend their moves bringing pieces out, and whoever has more pieces out when the fighting starts has more pieces in the fight. Three pieces against one wins, whatever the pieces are.',
      'You lose time by moving the same piece twice, by bringing the queen out where she can be chased, by taking pawns on the edge while your pieces sit at home, and by pawn moves that do not help a piece get out. You gain time by developing with a threat: the other side has to answer the threat, and the answer is often a move they did not want to make.',
      'A lead in development does not last. If nothing happens, the other side catches up in two or three moves and the lead is gone. So the side that is ahead has to open the position at once, with a pawn break or even a sacrifice, while the lead is still there. The side that is behind should keep the position closed, trade pieces and get the king castled.',
      'This is why the first aim of every opening is the same: both knights and both bishops out, the king castled, the rooks connected. Until that is done, think twice about any move that does not help it.',
    ],
    rules: [
      'Count the pieces each side has developed. Castling counts as one.',
      'Develop with a threat when you can.',
      'Do not move a piece twice in the opening unless it wins something or meets a threat.',
      'Ahead in development: open the position now.',
      'Behind in development: keep it closed, do not take pawns, and castle.',
    ],
    demo: {
      fen: START,
      intro: 'Paul Morphy against the Duke of Brunswick and Count Isouard, Paris 1858. The most famous lesson in development ever played.',
      moves: line('e4 e5 Nf3 d6 d4 Bg4 dxe5 Bxf3 Qxf3 dxe5 Bc4 Nf6 Qb3 Qe7 Nc3 c6 Bg5 b5 Nxb5 cxb5 Bxb5+ Nbd7 O-O-O Rd8 Rxd7 Rxd7 Rd1 Qe6 Bxd7+ Nxd7 Qb8+ Nxb8 Rd8#', {
        6: 'A pin. But Black brings the bishop out before the knights, and will have to give it up.',
        8: 'Forced: taking back on e5 with the pawn would lose a pawn after the queens are traded.',
        10: 'Black has traded off the only piece that was developed. White has a queen out and Black has nothing.',
        11: 'Development with a threat: mate on f7.',
        13: 'A second attack on f7, and one on b7. The queen has moved twice, but each time with a threat that had to be answered.',
        14: 'This guards f7, and blocks the bishop on f8. Black’s kingside cannot come out any more.',
        15: 'Morphy could take a pawn on b7. He brings out another piece instead.',
        17: 'White has four pieces out. Black has a knight and a queen.',
        18: 'A pawn move with a threat, at a moment when Black needed to develop. It is punished at once.',
        19: 'A sacrifice to open lines while Black’s king is still in the middle. A lead in development is only worth something if the position opens.',
        22: 'The knight is pinned against the king.',
        23: 'The king is safe and a rook is on the d-file, in one move.',
        25: 'The pinned knight’s guard is removed.',
        27: 'The last piece arrives. White is a rook down for two pawns and it does not matter: Black’s rook on h8 and bishop on f8 have never moved.',
        31: 'A queen sacrifice, to pull the knight away from d7.',
        33: 'Checkmate, with White’s last two pieces. Black’s rook and bishop are still on the squares they started on.',
      }),
    },
    tasks: [
      {
        id: 'tempo-scandi',
        line: 'e4 d5 exd5 Qxd5',
        ask: 'Black’s queen has come out early. Develop a piece with a threat.',
        good: ['Nc3'],
        hint: 'Which of your pieces can come out to a square from which it attacks the queen?',
        why: 'The knight is developed and the queen has to move a second time. You have gained a move for nothing: that is a tempo.',
      },
      {
        id: 'tempo-queen',
        line: 'e4 e5 Qh5',
        ask: 'White’s queen attacks the pawn on e5. Guard it with a move that develops a piece.',
        good: ['Nc6'],
        hint: 'A pawn move or a queen move would guard it too, but would not bring a piece out.',
        why: 'The pawn is guarded and a knight is out. White’s queen is the piece that is out of place: once f7 is safe you will gain more time on her with …Nf6.',
      },
    ],
    see: ['e4-scandi-qa5'],
  },
  {
    id: 'initiative',
    group: STRATEGY_GROUPS[3],
    title: 'The initiative, and what a gambit buys',
    summary: 'Material, time and position can be traded for one another.',
    text: [
      'The side that is making threats has the initiative. The other side has to answer them, and a player who is answering threats cannot carry out a plan. The initiative is not something you can see on the board, but it is often worth more than a pawn.',
      'A position has three kinds of value: material, time and structure. They can be exchanged. A gambit gives up material, usually a pawn, to buy time: faster development and open lines. Whether it is a good deal depends on one thing: can the time be turned into something lasting, an attack on the king or the material won back with interest, before the other side catches up?',
      'With the initiative, every move has to add to it: a new threat, or a new piece brought into the attack. Do not stop to win the pawn back if that gives the other side a free move. An initiative that pauses for one move is usually gone.',
      'Against the initiative, the defender has three tools. Give material back at the right moment, to finish development: a pawn you return is a move you gain. Trade pieces, the queens above all, because an attack needs attackers. And do not take a second pawn when your pieces are still at home.',
    ],
    rules: [
      'With the initiative: every move a threat or a new piece.',
      'Against a gambit: take the first pawn, think hard about the second.',
      'Be ready to give the pawn back to finish your development.',
      'Under attack and ahead in material: trade queens.',
      'A gambit that wins neither the king nor the material back is just a lost pawn.',
    ],
    demo: {
      fen: START,
      intro: 'The Danish Gambit, and the old way to take the sting out of it.',
      moves: line('e4 e5 d4 exd4 c3 dxc3 Bc4 cxb2 Bxb2 d5 Bxd5 Nf6 Bxf7+ Kxf7 Qxd8 Bb4+ Qd2 Bxd2+ Nxd2', {
        5: 'A gambit: White offers a pawn to get the pieces out fast.',
        7: 'And a second one.',
        9: 'Black is two pawns up and has not developed a piece. White has both bishops aimed at Black’s kingside and will bring out a piece with every move. With exact defence Black can keep a pawn, but one slip loses quickly. There is a simpler way.',
        10: 'Black gives a pawn back, to open lines for the queen and the bishop on c8.',
        12: 'Development with an attack on the bishop.',
        13: 'White finds a trick that wins the queen …',
        16: '… and Black wins her back: the bishop’s check uncovers the rook on h8, which attacks the queen on d8.',
        19: 'Count the pieces. Material is level, the queens are off and the attack is over. Black gave back both extra pawns and got a safe game for them. White paid pawns for time; Black paid them back to take the time away.',
      }),
    },
    tasks: [
      {
        id: 'initiative-liver',
        line: 'e4 e5 Nf3 Nc6 Bc4 Nf6 Ng5 d5 exd5 Nxd5 Nxf7 Kxf7',
        ask: 'You have given up a knight to pull the king out. The initiative only lasts while every move makes a threat. Keep it going.',
        good: ['Qf3+'],
        hint: 'Look for a check that also attacks something.',
        why: 'Check, and a second attack on the pinned knight on d5. The king has to walk to e6 to hold it, into the middle of the board, and you bring the next piece with Nc3. This is the Fried Liver in your Italian.',
      },
    ],
    see: ['italian-fried-liver', 'sicilian-morra'],
    link: { label: 'The gambits in your openings', to: ['gambits'] },
  },
  {
    id: 'king-attack',
    group: STRATEGY_GROUPS[3],
    title: 'Attacking the king',
    summary: 'More attackers than defenders, open lines, and a hook for the pawns.',
    text: [
      'An attack on the king works when you have more pieces near it than the defender has, and open lines for them to get there. Before you start one, and before you sacrifice anything, count: how many of your pieces can reach the king’s side of the board in a move or two, and how many of theirs are guarding it?',
      'The target is the pawns in front of the king. While they stand unmoved on their starting squares they are hard to attack. A pawn that has moved is a hook: one of your pawns can run up to it and trade itself, and the file behind your pawn opens for a rook. A pawn on h6 is a hook for a g-pawn, and a pawn on g6 for an h-pawn.',
      'Where the kings stand decides how you attack. If both have castled on the same side, attack with pieces: pushing the pawns in front of your own king exposes it. If they have castled on opposite sides, each side can throw its pawns at the other king without weakening its own, and the game is a race to open a file first.',
      'The defender should trade off attackers, the queen first, and keep the pawns in front of the king still unless there is no choice. And the old rule holds: an attack on the wing is best met by a strike in the centre. If the centre opens, the attacker’s pieces are needed there. That is also why wing attacks are safest when the centre is closed.',
    ],
    rules: [
      'Count attackers and defenders near the king before you commit.',
      'A pawn that has moved in front of the king is a hook. Run a pawn at it.',
      'Kings on opposite sides: push the pawns in front of their king, and be first.',
      'Kings on the same side: attack with pieces, not with your king’s pawns.',
      'Meet an attack on the wing with a break in the centre.',
    ],
    demo: {
      fen: START,
      intro: 'The Yugoslav Attack against your Dragon: the kings on opposite sides, and both sides attacking.',
      moves: line('e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6 Be3 Bg7 f3 O-O Qd2 Nc6 Bc4 Bd7 O-O-O Rc8 Bb3 Ne5 h4 h5 Kb1 Nc4 Bxc4 Rxc4', {
        10: 'The pawn on g6 makes room for the bishop. It is also a hook: a pawn in front of the king’s future home that an enemy pawn can reach.',
        13: 'This guards e4 and g4, and gets ready to push the g-pawn.',
        15: 'Queen and bishop line up, to trade off the bishop on g7 with Bh6. That bishop is the best defender Black’s king has.',
        19: 'The kings are on opposite sides. Each side can now throw pawns at the other king without weakening its own.',
        20: 'Black’s attack runs down the half-open c-file.',
        23: 'The h-pawn heads for h5, to trade itself for the hook on g6 and open the h-file for the rook.',
        24: 'Black blocks it. White now needs g4 as well to break through, and that costs time.',
        25: 'A safety move: the king steps off the c-file.',
        28: 'Black has traded a knight for one of White’s bishops and the rook has arrived on c4. Both attacks are running. In a position like this, count moves and not pawns: the side that opens a file in front of the enemy king first usually wins.',
      }),
    },
    tasks: [
      {
        id: 'attack-hook',
        line: 'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6 Be3 Bg7 f3 O-O Qd2 Nc6 Bc4 Bd7 O-O-O Rc8 Bb3 Ne5',
        ask: 'The kings are on opposite sides, and Black’s pawn on g6 is a hook. Start the pawn storm against it.',
        good: ['h4'],
        hint: 'Which pawn can reach h5 and offer itself for the pawn on g6?',
        why: 'The pawn goes to h5 next. If it is traded for the g-pawn, the h-file opens for your rook, straight at the king. Your own king is on the other side, so the pawns in front of it have not moved.',
      },
    ],
    see: ['sicilian-yugoslav', 'london-hfile-mate'],
  },
  {
    id: 'plan',
    group: STRATEGY_GROUPS[4],
    title: 'How to find a plan',
    summary: 'Six questions that turn the other lessons into a move.',
    text: [
      'A plan is not a long calculation. It is the answer to one question: what does this position want me to do? The pawns answer it, because the pawns are the part of the position that changes least.',
      'Safety comes first, always. Ask the three questions from the Tactics section about the other side’s last move. A plan is for the moves when nothing is hanging and nothing is threatened.',
      'Then read the pawns. Is the centre open or blocked? If it is open, the pieces matter most: develop, take the open files, keep the king safe. If it is blocked, look at where your pawn chain points. You have more room on that side, and that is where you play. Find your pawn break on that side and prepare it.',
      'Then look for targets: a pawn that no pawn can guard, a square that no pawn can attack, a king with a moved pawn in front of it. And look at your own pieces. Which one is doing the least? Very often the whole plan is to get that piece to the square from which it attacks the target.',
      'When the other side moves, ask the same questions for them. What is their break, and what are they aiming at? One quiet move that stops their plan is often worth more than a move for your own.',
    ],
    rules: [
      'Is anything attacked or threatened, for either side? Deal with that first.',
      'Is the centre open or closed? Open: develop and use the files. Closed: play on the side your pawns point to.',
      'What is my pawn break, and is it ready?',
      'What can I attack: a weak pawn, a hole, the king?',
      'Which is my worst piece, and where does it want to be?',
      'What does the other side want, and can I stop it cheaply?',
    ],
    tasks: [],
    link: { label: 'The three questions after every move', to: ['tactic', 'three-questions'] },
  },
]

export const strategyById = (id: string) => STRATEGY.find(l => l.id === id)

/** Every position, with the lesson it belongs to. */
export const STRATEGY_TASKS = STRATEGY.flatMap(lesson => lesson.tasks.map(task => ({ lesson, task })))

/** The position of a task, and the move that led to it when it comes from an opening line. */
export function taskStart(task: StrategyTask): { fen: string; moves: string[]; last: { from: Square; to: Square } | null } {
  if (task.fen) return { fen: task.fen, moves: [], last: null }
  const moves = task.line!.split(' ')
  const c = replay(moves)
  return { fen: c.fen(), moves, last: lastMoveOf(c) }
}
