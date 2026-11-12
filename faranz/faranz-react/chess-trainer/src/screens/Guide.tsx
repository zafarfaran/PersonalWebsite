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
    intro: 'You choose the first move. Play 1. d4 if you want one setup that works against everything. Play 1. e4 if you want open, tactical games, and accept that Black gets a say in which opening it becomes. The Italian covers 1… e5, and the other blocks below cover everything else.',
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
        lead: 'Each defence gets one simple, sound answer, chosen to stay close to what you already know. The first four are the ones you will meet most.',
        opening: 'e4',
        rows: [
          { moves: '1… d5 and 3… Qa5', name: 'Scandinavian Defence', play: 'Take on d5, Nc3 to hit the queen, then Bd2 and Nd5.', lesson: 'e4-scandi-qa5' },
          { moves: '1… d5 and 3… Qd6', name: 'Scandinavian, queen to d6', play: 'Ne5, Nc4 and Bf4, each with an attack on the queen.', lesson: 'e4-scandi-qd6' },
          { moves: '1… d5, 3… Qd6 and …a6', name: 'Scandinavian with …a6', play: 'g3 and Bg2, then Bf4.', lesson: 'e4-scandi-qd6-a6' },
          { moves: '1… d5 and 3… Qd8', name: 'Scandinavian, queen goes home', play: 'd4, Nf3, and h3 against the pin.', lesson: 'e4-scandi-qd8' },
          { moves: '1… d5 and 3… Qe5+', name: 'Scandinavian, the check', play: 'Block with Be2, then Nf3 hits the queen.', lesson: 'e4-scandi-qe5' },
          { moves: '1… d5 and 2… Nf6', name: 'Scandinavian with …Nf6', play: 'd4, let Black take the pawn back, then c4.', lesson: 'e4-scandi-nf6' },
          { moves: '1… c5, then 2… d5', name: 'Sicilian Defence', play: 'The Alapin: 2. c3 and d4, then the battery with Bc2 and Qd3.', lesson: 'e4-sicilian-d5' },
          { moves: '1… c5, then 2… Nf6', name: 'Sicilian, knight attacks e4', play: 'Push e5, then d4.', lesson: 'e4-sicilian-nf6' },
          { moves: '1… c5, then 2… d6', name: 'Sicilian, Dragon setup', play: 'd4 and Bd3: the full pawn centre.', lesson: 'e4-sicilian-d6' },
          { moves: '1… c5, then 2… Nc6', name: 'Sicilian, knight first', play: 'd4, and defend it with Nf3 before Nc3.', lesson: 'e4-sicilian-nc6' },
          { moves: '1… c5, then 2… e6', name: 'Sicilian with …e6', play: 'Trade on d5, then take on c5 to isolate Black\'s pawn.', lesson: 'e4-sicilian-e6' },
          { moves: '1… c6', name: 'Caro-Kann Defence', play: 'The Exchange: trade on d5, then Bd3, c3 and Bf4. Your London setup.', lesson: 'e4-caro' },
          { moves: '1… c6, then …Qc7', name: 'Caro-Kann, Bf4 is stopped', play: 'h3 and Nf3, then Na3.', lesson: 'e4-caro-qc7' },
          { moves: '1… c6, then …g6', name: 'Caro-Kann with …g6', play: 'The same setup, and take on f5 if the bishop comes there.', lesson: 'e4-caro-g6' },
          { moves: '1… e6, then …Nf6', name: 'French Defence', play: 'The Exchange: trade on d5, then Nf3, Bd3, castle and Bg5.', lesson: 'e4-french' },
          { moves: '1… e6, then …Ne7', name: 'French with …Ne7', play: 'The same, and watch for the sacrifice on h7.', lesson: 'e4-french-ne7' },
        ],
      },
      {
        title: 'Rarer defences to 1. e4',
        lead: 'You will meet these less often, and several are simply bad moves that beginners play a lot. One lesson each is enough.',
        opening: 'e4',
        rows: [
          { moves: '1… d6 and …g6', name: 'Pirc Defence', play: 'Be3, Qd2, castle long, Bh6 and push the h-pawn.', lesson: 'e4-pirc' },
          { moves: '1… d6, …g6 and …c6', name: 'Pirc, Black delays castling', play: 'Bh6 anyway: the queen on h6 stops Black castling.', lesson: 'e4-pirc-c6' },
          { moves: '1… g6', name: 'Modern Defence', play: 'The same setup as against the Pirc.', lesson: 'e4-modern' },
          { moves: '1… Nf6', name: "Alekhine's Defence", play: 'e5, d4 and Nf3. Castle before you chase the knight with c4.', lesson: 'e4-alekhine' },
          { moves: '1… Nf6, then …g6', name: "Alekhine's with …g6", play: 'Bc4, Bb3 and Qe2 to hold e5.', lesson: 'e4-alekhine-g6' },
          { moves: '1… b6', name: "Owen's Defence", play: 'd4 and Bd3, then c3 and Qe2 to hold e4.', lesson: 'e4-owen' },
          { moves: '1… Nc6', name: 'Nimzowitsch Defence', play: '2. Nf3. If Black plays …e5 you are in the Italian.', lesson: 'e4-nimzowitsch' },
          { moves: '1… e5 2. Nf3 Nf6', name: 'Petrov Defence', play: 'Take on e5, then Nc3 and castle long.', lesson: 'e4-petrov' },
          { moves: '1… e5 2. Nf3 Nf6 3. Nxe5 Nxe4', name: 'Petrov, Black copies', play: 'Qe2 wins a pawn, or the queen.', lesson: 'e4-petrov-trap' },
          { moves: '1… e5 2. Nf3 d6, then …exd4', name: 'Philidor Defence', play: 'd4, then Bf4, Qd2 and castle long.', lesson: 'e4-philidor' },
          { moves: '1… e5 2. Nf3 d6, then …Nf6 and …Nbd7', name: 'Philidor, Hanham setup', play: 'Nc3, Bc4, castle, and a4 against …c6.', lesson: 'e4-philidor-hanham' },
          { moves: '1… e5 2. Nf3 d6 3. d4 Bg4', name: 'Philidor with the pin', play: 'Take on e5, then Bc4 and Qb3.', lesson: 'e4-philidor-bg4' },
          { moves: '1… e5 2. Nf3 d6 3. d4 Nd7', name: 'Philidor, wrong move order', play: 'Bc4, take on e5, and Qd5 wins a piece.', lesson: 'e4-philidor-trap' },
          { moves: '1… e5 2. Nf3 f6', name: "Damiano's Defence", play: 'Sacrifice the knight on e5, then Qh5+.', lesson: 'e4-damiano' },
          { moves: '1… e5 2. Nf3 f5', name: 'Latvian Gambit', play: 'Take on e5 and bring the knight round to e3.', lesson: 'e4-latvian' },
          { moves: '1… e5 2. Nf3 d5', name: 'Elephant Gambit', play: 'Take on d5, and answer …e4 with Qe2.', lesson: 'e4-elephant' },
        ],
      },
    ],
  },
  {
    heading: 'When you have Black',
    intro: 'White chooses the first move and you choose the defence. Against 1. e4 this course teaches two, and against 1. d4 it teaches the King\'s Indian. Pick one and stay with it until it feels natural: the Caro-Kann if you like solid positions and few forcing lines, the Sicilian Dragon if you like sharp games and are happy to learn more.',
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
        title: "White opens 1. d4 and you play the King's Indian",
        lead: 'Your first five moves are always the same: …Nf6, …g6, …Bg7, …d6 and castle. What White does with the centre decides the rest.',
        opening: 'kid',
        rows: [
          { moves: 'Nf3, Be2 and 9. Ne1', name: 'Classical, main line', play: '…e5, …Nc6, knight to e7, then …f5 and …f4.', lesson: 'kid-classical' },
          { moves: 'Nf3, Be2 and 9. b4', name: 'Bayonet Attack', play: '…Nh5 and …f5.', lesson: 'kid-bayonet' },
          { moves: '7. dxe5', name: 'Exchange', play: 'Take back, trade queens, and answer Bg5 with …Re8.', lesson: 'kid-exchange' },
          { moves: '7. dxe5 and 9. Nxe5', name: 'White grabs the pawn', play: '…Nxe4 wins it back.', lesson: 'kid-pawn-trap' },
          { moves: '7. d5', name: 'Petrosian', play: '…a5 and …Na6, then …Qe8 to break the pin.', lesson: 'kid-petrosian' },
          { moves: '7. Be3', name: 'Gligoric', play: 'Trade on d4, then …Re8, …c6 and …d5.', lesson: 'kid-gligoric' },
          { moves: '5. f3 and 7. d5', name: 'Sämisch', play: '…c6, open the c-file, and meet g4 with …h5.', lesson: 'kid-samisch' },
          { moves: '5. f3 and 7. Nge2', name: 'Sämisch, White castles long', play: '…c6, …a6 and …b5.', lesson: 'kid-samisch-nge2' },
          { moves: '5. f4', name: 'Four Pawns Attack', play: '…c5 and …e6, then trade off the f3 knight.', lesson: 'kid-four-pawns' },
          { moves: 'g3 and Bg2', name: 'Fianchetto', play: '…Nbd7, …e5, …c6 and …Qb6.', lesson: 'kid-fianchetto' },
          { moves: '5. Be2 and 6. Bg5', name: 'Averbakh', play: '…Na6 before …e5.', lesson: 'kid-averbakh' },
          { moves: '5. h3', name: 'Makogonov', play: '…e5, then the knight to c5 by way of a6.', lesson: 'kid-h3' },
          { moves: '2. Bf4', name: 'London System', play: '…Nbd7, …Qe8 and …e5.', lesson: 'kid-london' },
          { moves: '2. Nf3 and 3. Bg5', name: 'Torre Attack', play: '…h6, …Nbd7, …e5 and …Qe8.', lesson: 'kid-torre' },
          { moves: '1. c4 or 1. Nf3', name: 'English and Réti', play: 'The same five moves, then …e5.', lesson: 'kid-english' },
        ],
      },
      {
        title: 'Another way to meet 1. d4',
        lead: 'If the King\'s Indian is sharper than you like, there is a quieter choice that has no lessons here yet.',
        rows: [
          { moves: '1. d4, if you play the Caro-Kann', name: 'Slav Defence', play: '1… d5 and 2… c6. The same pawns on c6 and d5, and the same rule: bishop out to f5 before …e6.' },
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
