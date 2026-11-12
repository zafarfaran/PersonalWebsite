import { Shell } from '../components/ui'
import { href } from '../router'

interface Row {
  /** What you see on the board. */
  moves: string
  name: string
  /** What to play against it. */
  play: string
  /** Lesson that teaches it, if there is one. */
  lesson?: string
}
interface Block {
  title: string
  lead: string
  /** Opening page to link to from the heading. */
  opening?: string
  rows: Row[]
}

export const GUIDE: { heading: string; intro: string; blocks: Block[] }[] = [
  {
    heading: 'When you have White',
    intro: 'You choose the first move. Play 1. d4 if you want one setup that works against everything. Play 1. e4 if you want open, tactical games, and accept that Black gets a say in which opening it becomes.',
    blocks: [
      {
        title: 'You open 1. d4 and 2. Bf4: the London System',
        lead: 'Your moves barely change. What matters is spotting which setup Black has chosen and making the one or two adjustments that go with it.',
        opening: 'london',
        rows: [
          { moves: '1… d5, then …e6 and …c5', name: 'Classical setup', play: 'The full setup, then a knight to e5.', lesson: 'london-main' },
          { moves: '…c5 and …Qb6', name: 'Attack on b2', play: 'Answer …Qb6 with Qb3.', lesson: 'london-qb6' },
          { moves: '…Bd6', name: 'Bishop trade offer', play: 'Step back to g3 and let Black take.', lesson: 'london-bd6' },
          { moves: '…Bf5 or …Bg4', name: 'Black\'s bishop comes out', play: 'c4 and Qb3, aiming at b7.', lesson: 'london-bf5' },
          { moves: '1… Nf6 and 2… g6, then …d6', name: "King's Indian setup", play: 'Bishop to e2, and h3 for your f4 bishop.', lesson: 'london-kid' },
          { moves: '1… Nf6 and 2… g6, then …d5', name: 'Grünfeld setup', play: 'The same, with h3 before Nbd2.', lesson: 'london-grunfeld' },
          { moves: '…e6 and …b6', name: "Queen's Indian setup", play: 'h3, then take the centre with e4.', lesson: 'london-b6' },
          { moves: '1… Nf6 and 2… c5', name: 'Benoni-style', play: 'e3, and Nc3 if the queen comes to b6.', lesson: 'london-benoni' },
          { moves: '1… f5', name: 'Dutch Defence', play: 'The normal setup, then fight for e4.', lesson: 'london-dutch' },
        ],
      },
      {
        title: 'You open 1. e4 and Black answers 1… e5: the Italian Game',
        lead: 'After 2. Nf3 Nc6 3. Bc4, Black\'s third move decides the line.',
        opening: 'italian',
        rows: [
          { moves: '3… Bc5', name: 'Giuoco Piano', play: 'c3 and d3, then the slow build-up.', lesson: 'italian-main' },
          { moves: '3… Bc5 and a slow …d6', name: 'Giuoco Piano, passive', play: 'Push d4 at once and take the centre.', lesson: 'italian-slow-d6' },
          { moves: '3… Nf6', name: 'Two Knights', play: 'd3, and keep your bishop from being traded.', lesson: 'italian-two-knights' },
          { moves: '3… d6', name: 'Passive setup', play: 'Nc3, then Ng5 or d4 depending on Black\'s next move.', lesson: 'italian-d6-nf6' },
          { moves: '3… h6', name: 'A wasted move', play: 'Open the centre with d4.', lesson: 'italian-h6' },
          { moves: '3… Nd4', name: 'Blackburne Shilling trap', play: 'Take the knight, not the pawn.', lesson: 'italian-nd4' },
        ],
      },
      {
        title: 'You open 1. e4 and Black does not play 1… e5',
        lead: 'There are no lessons for these from White\'s side yet. Each suggestion is the simplest sound line, chosen to stay close to what you already know.',
        rows: [
          { moves: '1… c5', name: 'Sicilian Defence', play: 'The Alapin: 2. c3, then d4. It is the same c3 and d4 idea as in your Italian. The Sicilian lessons show it from Black\'s side.', lesson: 'sicilian-alapin' },
          { moves: '1… c6', name: 'Caro-Kann Defence', play: 'The Exchange: 2. d4 d5 3. exd5 cxd5 4. Bd3, then c3 and Bf4. That is your London setup. The Caro-Kann lessons show it from Black\'s side.', lesson: 'caro-exchange' },
          { moves: '1… e6', name: 'French Defence', play: 'The Exchange: 2. d4 d5 3. exd5 exd5, then Nf3, Bd3 and castle. Symmetrical and easy to play.' },
          { moves: '1… d5', name: 'Scandinavian Defence', play: '2. exd5 Qxd5 3. Nc3. You develop a knight and gain a move by attacking the queen.' },
          { moves: '1… d6 or 1… g6', name: 'Pirc and Modern', play: '2. d4, then Nc3, Nf3, Be2 and castle. Take the big centre and develop simply.' },
          { moves: '1… Nf6', name: "Alekhine's Defence", play: '2. e5 Nd5 3. d4 d6 4. Nf3. Keep the centre and do not over-extend.' },
        ],
      },
    ],
  },
  {
    heading: 'When you have Black',
    intro: 'White chooses the first move and you choose the defence. Against 1. e4 this course teaches two. Pick one and stay with it until it feels natural: the Caro-Kann if you like solid positions and few forcing lines, the Sicilian Dragon if you like sharp games and are happy to learn more.',
    blocks: [
      {
        title: 'White opens 1. e4 and you play 1… c6: the Caro-Kann',
        lead: 'After 2. d4 d5, White\'s third move decides the line.',
        opening: 'caro',
        rows: [
          { moves: '3. Nc3 or 3. Nd2', name: 'Classical', play: 'Take on e4, bishop to f5, and meet h4 with …h6.', lesson: 'caro-classical' },
          { moves: '3. e5', name: 'Advance', play: 'Bishop to f5, …e6, then hit d4 with …c5.', lesson: 'caro-advance' },
          { moves: '3. e5 Bf5 4. h4', name: 'Advance with h4', play: '…h5, or the bishop gets trapped.', lesson: 'caro-advance-h4' },
          { moves: '3. exd5 cxd5 4. Bd3', name: 'Exchange', play: 'Bishop to g4, …e6, and the minority attack.', lesson: 'caro-exchange' },
          { moves: '3. exd5 cxd5 4. c4', name: 'Panov Attack', play: '…Nf6 and …e6, then play against the isolated pawn.', lesson: 'caro-panov' },
          { moves: '3. f3', name: 'Fantasy', play: 'Take on e4 and strike with …e5.', lesson: 'caro-fantasy' },
          { moves: '2. Nc3 and 3. Nf3', name: 'Two Knights', play: '…d5, bishop to g4, and take on f3.', lesson: 'caro-two-knights' },
          { moves: '2. d3', name: "King's Indian Attack", play: 'Take the centre with …d5 and …e5.', lesson: 'caro-kia' },
        ],
      },
      {
        title: 'White opens 1. e4 and you play 1… c5: the Sicilian Dragon',
        lead: 'White\'s second and sixth moves decide the line.',
        opening: 'sicilian',
        rows: [
          { moves: '2. Nf3, 3. d4 and 6. Be2', name: 'Open Sicilian, Classical', play: 'The full Dragon setup.', lesson: 'sicilian-classical' },
          { moves: '2. Nf3, 3. d4 and 6. Be3 with f3', name: 'Yugoslav Attack', play: 'Rook to c8, knight to c4, and …h5 against the h-pawn.', lesson: 'sicilian-yugoslav' },
          { moves: '2. Nf3, 3. d4 and 6. f4', name: 'Levenfish Attack', play: '…Nc6 before …Bg7.', lesson: 'sicilian-levenfish' },
          { moves: '2. Nf3 and 3. Bb5+', name: 'Moscow', play: 'Block with the bishop, then …e6 and …d5.', lesson: 'sicilian-moscow' },
          { moves: '2. c3', name: 'Alapin', play: '…d5, and the queen recaptures.', lesson: 'sicilian-alapin' },
          { moves: '2. d4 cxd4 3. c3', name: 'Smith-Morra Gambit', play: 'Decline with …d5.', lesson: 'sicilian-morra' },
          { moves: '2. Nc3 and 3. g3', name: 'Closed Sicilian', play: 'Dragon setup, then …Rb8 and …b5.', lesson: 'sicilian-closed' },
          { moves: '2. Nc3 and 3. f4', name: 'Grand Prix Attack', play: 'Dragon setup, with …e6 and …Nge7.', lesson: 'sicilian-grand-prix' },
          { moves: '2. Bc4', name: 'Bowdler Attack', play: '…e6 and …d5.', lesson: 'sicilian-bowdler' },
        ],
      },
      {
        title: 'Other Sicilians you can choose instead of the Dragon',
        lead: 'These start with the same first moves and then go their own way. Each has one or two lessons, so you can try them and see which suits you. Pick one system for your real games.',
        opening: 'sicilian',
        rows: [
          { moves: '2… d6 and 5… a6', name: 'Najdorf', play: 'Against 6. Be3: …e5, castle short, and push the b-pawn.', lesson: 'sicilian-najdorf' },
          { moves: '2… d6 and 5… a6, White plays 6. Bg5', name: 'Najdorf, main line', play: '…e6, …Be7, …Qc7 and …b5.', lesson: 'sicilian-najdorf-bg5' },
          { moves: '2… d6 and 5… e6', name: 'Scheveningen', play: 'A small centre on d6 and e6, then wait for a break.', lesson: 'sicilian-scheveningen' },
          { moves: '2… d6 and 5… Nc6', name: 'Classical', play: 'Both knights out; against 6. Bg5 play …e6 and …Be7.', lesson: 'sicilian-classical-rauzer' },
          { moves: '2… Nc6 and 5… e5', name: 'Sveshnikov', play: 'Chase the knights, take the two bishops, break with …f5.', lesson: 'sicilian-sveshnikov' },
          { moves: '2… Nc6 and 4… g6', name: 'Accelerated Dragon', play: 'Dragon setup without …d6, hoping for …d5 in one move.', lesson: 'sicilian-accelerated' },
          { moves: '2… Nc6 and 4… g6, White plays 5. c4', name: 'Maroczy Bind', play: 'Trade pieces and play on the dark squares.', lesson: 'sicilian-maroczy' },
          { moves: '2… e6, 4… Nc6 and 5… Qc7', name: 'Taimanov', play: '…a6, …Nf6 and the bishop out to b4.', lesson: 'sicilian-taimanov' },
        ],
      },
      {
        title: 'White does not open 1. e4',
        lead: 'There are no lessons for these yet. The suggestions reuse the setup you already play against 1. e4.',
        rows: [
          { moves: '1. d4, if you play the Caro-Kann', name: 'Slav Defence', play: '1… d5 and 2… c6. The same pawns on c6 and d5, and the same rule: bishop out to f5 before …e6.' },
          { moves: '1. d4, if you play the Dragon', name: "King's Indian Defence", play: '…Nf6, …g6, …Bg7, …d6 and castle. The same kingside as your Dragon.' },
          { moves: '1. d4 and 2. Bf4', name: 'London System', play: 'You know what bothers it from the White side: …c5 and …Qb6 to attack b2, or …Bd6 to trade the bishop.', lesson: 'london-qb6' },
          { moves: '1. c4 or 1. Nf3', name: 'English and Réti', play: 'The same two setups work: …c6 and …d5, or …Nf6, …g6 and …Bg7.' },
        ],
      },
    ],
  },
]

/** A lookup table: which line to play against each thing the opponent can do. */
export function Guide() {
  return (
    <Shell back={href()} backLabel="Home" title="What to play against what">
      {GUIDE.map(section => (
        <section className="guide" key={section.heading}>
          <h2>{section.heading}</h2>
          <p className="muted">{section.intro}</p>
          {section.blocks.map(block => (
            <div className="card" key={block.title}>
              <div className="guidehead">
                <strong>{block.title}</strong>
                {block.opening && <a className="btn" href={href('o', block.opening)}>All lessons</a>}
              </div>
              <p className="note">{block.lead}</p>
              {block.rows.map(row => (
                <div className="reply" key={row.moves + row.name}>
                  <div className="seen">
                    <b>{row.moves}</b>
                    <small>{row.name}</small>
                  </div>
                  <div className="t">{row.play}</div>
                  {row.lesson ? <a className="btn" href={href('learn', row.lesson)}>Lesson</a> : <span className="pill">No lesson yet</span>}
                </div>
              ))}
            </div>
          ))}
        </section>
      ))}
    </Shell>
  )
}
