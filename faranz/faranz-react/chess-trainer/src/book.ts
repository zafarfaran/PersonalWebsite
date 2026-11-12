import { Chess } from 'chess.js'
import { clean, fenKey } from './chess'
import { sans, type Lesson, type Opening, type Step } from './data'

// Common ways real opponents answer each opening, beyond the lines taught in
// the lessons. Each entry is [weight, moves]; a higher weight is played more
// often. Only the opponent's moves are chosen from here: your side's moves just
// describe how the position is reached, so many of these run into a lesson line
// by a different move order.
const SETUP = 'd4 d5 Bf4 Nf6 e3 e6 Nf3 Be7 Bd3 O-O Nbd2 c5 c3 Nc6 O-O'
const EXTRA: Record<string, [number, string][]> = {
  london: [
    [2, 'd4 d5 Bf4 Nf6 e3 c5 c3 Nc6 Nd2 e6 Ngf3 Bd6 Bg3 O-O Bd3'],
    [2, 'd4 d5 Bf4 Nf6 e3 c5 Nf3 Nc6 c3 e6 Nbd2'],
    [1, 'd4 d5 Bf4 Nf6 e3 c5 c3 Qb6 Qb3 c4 Qc2'],
    [2, 'd4 d5 Bf4 Nf6 e3 Bf5 Nf3 e6 c4 c6 Qb3 Qb6 c5 Qxb3 axb3'],
    [2, 'd4 d5 Bf4 e6 e3 Nf6 Nf3 c5'],
    [1, 'd4 d5 Bf4 e6 e3 Bd6 Bg3 Nf6 Nf3 O-O Bd3'],
    [1, 'd4 d5 Bf4 Nc6 e3 Nf6 Nf3 Bg4'],
    [1, 'd4 d5 Bf4 c6 e3 Nf6 Nf3 Bf5 c4 e6'],
    [3, 'd4 Nf6 Bf4 d5 e3 e6 Nf3 c5'],
    [2, 'd4 Nf6 Bf4 e6 e3 d5 Nf3 Bd6'],
    [1, 'd4 Nf6 Bf4 e6 e3 c5 c3 Nc6 Nf3 d5'],
    [1, 'd4 Nf6 Bf4 e6 e3 b6 Nf3 Bb7 Bd3 c5 c3 Be7 h3 O-O O-O'],
    [1, 'd4 Nf6 Bf4 c5 e3 Qb6'],
    [1, 'd4 Nf6 Bf4 d6 e3 g6 Nf3 Bg7 Be2 O-O h3'],
    [1, 'd4 g6 Bf4 Bg7 e3 d6 Nf3 Nf6 Be2 O-O h3'],
    [1, 'd4 e6 Bf4 d5 e3 Nf6 Nf3 c5'],
    [1, 'd4 f5 Bf4 Nf6 e3 e6 Nf3 Be7 Bd3 O-O'],
    [1, 'd4 d5 Bf4 Nf6 e3 e6 Nf3 Be7 Bd3 c5 c3 Nc6 Nbd2 O-O O-O'],
    [2, `${SETUP} b6 Ne5 Bb7 Qf3`],
    [1, `${SETUP} Qb6 Qb3`],
  ],
  italian: [
    [3, 'e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Nf6 d3 O-O O-O d6 Re1 a6 Bb3 Ba7 h3 h6 Nbd2'],
    [2, 'e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Nf6 d3 a6 O-O d6 Re1 Ba7 Bb3 O-O h3 h6 Nbd2'],
    [1, 'e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Nf6 d3 d6 O-O O-O Re1 Bg4 h3 Bh5 Nbd2'],
    [1, 'e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Nf6 d3 d6 O-O O-O Re1 h6 Bb3 a6 h3 Ba7 Nbd2'],
    [1, 'e4 e5 Nf3 Nc6 Bc4 Bc5 c3 d6 d4 exd4 cxd4 Bb6 Nc3 Nf6'],
    [1, 'e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Qe7 O-O d6 d4 Bb6'],
    [3, 'e4 e5 Nf3 Nc6 Bc4 Nf6 d3 Bc5 c3 d6 O-O O-O Re1 a6 Bb3 Ba7 h3 h6 Nbd2'],
    [2, 'e4 e5 Nf3 Nc6 Bc4 Nf6 d3 Be7 O-O O-O Re1 d6 c3 h6 Nbd2 Re8 Nf1 Bf8 Ng3'],
    [1, 'e4 e5 Nf3 Nc6 Bc4 Nf6 d3 h6 O-O d6 c3 g6 Re1 Bg7'],
    [1, 'e4 e5 Nf3 Nc6 Bc4 Nf6 d3 d5 exd5 Nxd5 O-O Be7 Re1'],
    [1, 'e4 e5 Nf3 Nc6 Bc4 Be7 O-O Nf6 d3 O-O Re1 d6 c3'],
    [2, 'e4 e5 Nf3 Nc6 Bc4 d6 Nc3 Bg4 h3 Bxf3 Qxf3 Nf6 d3'],
    [1, 'e4 e5 Nf3 Nc6 Bc4 d6 Nc3 Nf6 Ng5 d5 exd5 Na5 Bb5+ c6 dxc6 bxc6 Be2'],
    [1, 'e4 e5 Nf3 Nc6 Bc4 Nf6 d3 d5 exd5 Nxd5 O-O Bc5 Re1 O-O Nxe5 Nxe5 Rxe5'],
    [1, 'e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Nf6 d3 d6 O-O Be6 Nbd2 O-O'],
    [1, 'e4 e5 Nf3 Nc6 Bc4 d6 Nc3 Be7 d4 exd4 Nxd4'],
    [2, 'e4 e5 Nf3 Nc6 Bc4 d6 Nc3 Bg4 h3 Bh5 Nxe5 Nxe5 Qxh5 Nxc4 Qb5+ c6 Qxc4'],
  ],
  e4: [
    [2, 'e4 d5 exd5 Qxd5 Nc3 Qa5 d4 Nf6 Nf3 Bg4 h3 Bh5 g4 Bg6 Ne5 e6 Bg2 c6 h4'],
    [2, 'e4 d5 exd5 Qxd5 Nc3 Qd6 d4 Nf6 Nf3 a6 g3 Bg4 Bg2 Nc6 O-O O-O-O Bf4'],
    [1, 'e4 d5 exd5 Qxd5 Nc3 Qd6 d4 Nf6 Nf3 g6 Nb5 Qd8 Bf4 Na6 Bc4'],
    [1, 'e4 d5 exd5 Qxd5 Nc3 Qd8 d4 Nf6 Nf3 c6 Bc4 Bf5 Ne5 e6 g4 Bg6 h4'],
    [1, 'e4 d5 exd5 Nf6 d4 Bg4 Be2 Bxe2 Qxe2 Qxd5 Nf3 e6 O-O Nc6 c3 Be7 Bf4'],
    [1, 'e4 d5 exd5 Nf6 d4 Nxd5 Nf3 g6 c4 Nb6 Nc3 Bg7 h3 O-O Be3 Nc6 Qd2'],
    [2, 'e4 e6 d4 d5 exd5 exd5 Nf3 Nf6 Bd3 Be7 O-O O-O Re1 Bg4 h3 Bh5 Bf4'],
    [1, 'e4 e6 d4 d5 exd5 exd5 Nf3 Nf6 Bd3 c5 O-O c4 Re1+ Be7 Bf1 O-O b3'],
    [1, 'e4 e6 d4 d5 exd5 exd5 Nf3 Nc6 Bb5 Bd6 O-O Ne7 Re1 O-O c3'],
    [1, 'e4 e6 d4 d5 exd5 exd5 Nf3 Bg4 h3 Bh5 Qe2+ Qe7 Be3 Nc6 Nc3'],
    [1, 'e4 e6 d4 d5 exd5 Qxd5 Nc3 Bb4 Nf3 Nf6 Bd3'],
    [1, 'e4 e6 d4 c5 c3 d5 exd5 exd5 Nf3 Nc6 Bb5'],
    [1, 'e4 c6 d4 d5 exd5 cxd5 Bd3 Nc6 c3 e5 dxe5 Nxe5 Nf3 Nxd3+ Qxd3 Nf6 O-O Be7 Bg5'],
    [1, 'e4 c6 d4 d5 exd5 Qxd5 Nc3 Qa5 Nf3 Nf6 Bc4 Bf5 Bd2 e6 Nd5'],
    [1, 'e4 c6 d4 g6 Nc3 Bg7 Be3 d6 Qd2'],
    [2, 'e4 c5 c3 d5 exd5 Qxd5 d4 Nf6 Nf3 Bg4 Be2 e6 h3 Bh5 O-O Nc6 Be3 cxd4 cxd4 Be7 Nc3 Qd6 Qb3'],
    [1, 'e4 c5 c3 d5 exd5 Qxd5 d4 Nc6 Nf3 Bg4 Be2 cxd4 cxd4 e6 Nc3 Qa5 O-O Nf6 h3 Bh5 a3'],
    [1, 'e4 c5 c3 d5 exd5 Qxd5 d4 g6 Nf3 Bg7 Na3 cxd4 Bc4 Qe4+ Be3'],
    [1, 'e4 c5 c3 Nf6 e5 Nd5 d4 cxd4 Nf3 e6 cxd4 d6 Bc4 Nc6 O-O Be7 Qe2 O-O Nc3'],
    [1, 'e4 c5 c3 g6 d4 cxd4 cxd4 d5 e5 Nc6 Nc3 Bg7 Bb5 Nh6 h3 O-O Nf3 f6 O-O'],
    [1, 'e4 c5 c3 e5 Nf3 Nc6 Bc4 Nf6 d3 Be7 O-O O-O'],
    [1, 'e4 d6 d4 Nf6 Nc3 g6 Be3 Bg7 Qd2 O-O O-O-O Nc6 f3 e5 d5 Ne7 g4'],
    [1, 'e4 d6 d4 Nf6 Nc3 g6 Be3 Bg7 Qd2 Ng4 Bg5 h6 Bh4 g5 Bg3'],
    [1, 'e4 d6 d4 Nf6 Nc3 e5 Nf3 Nbd7 Bc4 Be7 O-O O-O Re1 c6 a4'],
    [1, 'e4 d6 d4 Nf6 Nc3 c6 Be3 Qa5 Qd2 e5 Nf3 Nbd7 Bc4'],
    [1, 'e4 g6 d4 Bg7 Nc3 d6 Be3 c6 Qd2 b5 Bd3 Nd7 Nf3 Bb7 O-O'],
    [1, 'e4 g6 d4 Bg7 Nc3 c6 Be3 d5 Qd2 dxe4 Nxe4 Nf6 Nxf6+ exf6 Bc4'],
    [1, 'e4 Nf6 e5 Nd5 d4 d6 Nf3 dxe5 Nxe5 c6 Be2 Bf5 O-O Nd7 Nf3 e6 c4'],
    [1, 'e4 Nf6 e5 Nd5 d4 Nb6 Nf3 d6 Be2 Bg4 O-O e6 c4'],
    [1, 'e4 Nf6 e5 Nd5 d4 e6 Nf3 d6 c4 Nb6 exd6 cxd6 Nc3'],
    [1, 'e4 e5 Nf3 Nf6 Nxe5 d6 Nf3 Nxe4 Nc3 Nf6 d4 Be7 Bd3 O-O O-O'],
    [1, 'e4 e5 Nf3 Nf6 Nxe5 d6 Nf3 Nxe4 Nc3 Nxc3 dxc3 Nc6 Be3 Be7 Qd2 Be6 O-O-O Qd7 Kb1'],
    [1, 'e4 e5 Nf3 Nf6 Nxe5 Qe7 d4 d6 Nf3 Qxe4+ Be2 Bf5 c4'],
    [1, 'e4 e5 Nf3 Nf6 Nxe5 Nxe4 Qe2 Qe7 Qxe4 d6 d4 dxe5 dxe5'],
    [1, 'e4 e5 Nf3 d6 d4 exd4 Nxd4 Nf6 Nc3 Be7 Bf4 O-O Qd2 c6 O-O-O b5 f3'],
    [1, 'e4 e5 Nf3 d6 d4 Nc6 Bb5 Bd7 Nc3 exd4 Nxd4 Nf6 O-O Be7 Re1'],
    [1, 'e4 e5 Nf3 f6 Nxe5 Qe7 Nf3 Qxe4+ Be2 d5 O-O Bd6 Nc3'],
    [1, 'e4 e5 Nf3 f6 Nxe5 fxe5 Qh5+ g6 Qxe5+ Qe7 Qxh8'],
    [1, 'e4 e5 Nf3 f5 Nxe5 fxe4 Qh5+ g6 Nxg6 Nf6 Qe5+ Be7 Nxh8'],
    [1, 'e4 e5 Nf3 d5 exd5 Qxd5 Nc3 Qe6 Bb5+ c6 Ba4 Bd6 O-O'],
    [1, 'e4 b6 d4 Bb7 Bd3 Nf6 Qe2 e6 Nf3 c5 c3 Be7 O-O'],
    [1, 'e4 b6 d4 e6 Bd3 Bb7 Nf3 c5 c3 Nf6 Qe2 d5 e5 Nfd7 O-O'],
    [1, 'e4 Nc6 Nf3 d5 exd5 Qxd5 Nc3 Qa5 d4 Bg4 Bb5 O-O-O Bxc6 bxc6 h3'],
    [1, 'e4 Nc6 Nf3 Nf6 e5 Nd5 d4 d6 c4 Nb6 exd6 exd6 Nc3'],
    [1, 'e4 Nc6 Nf3 e6 d4 d5 e5 f6 Bb5'],
    [1, 'e4 a6 d4 b5 Nf3 Bb7 Bd3 e6 O-O Nf6 Qe2 c5 c3'],
  ],
  caro: [
    [2, 'e4 c6 d4 d5 Nd2 dxe4 Nxe4 Bf5 Ng3 Bg6 Nf3 Nd7 Bd3 Bxd3 Qxd3 e6 O-O Ngf6'],
    [1, 'e4 c6 d4 d5 Nc3 dxe4 Nxe4 Bf5 Ng3 Bg6 Nf3 Nd7 h4 h6 Bd3 Bxd3 Qxd3 e6'],
    [1, 'e4 c6 d4 d5 Nc3 dxe4 Nxe4 Bf5 Ng3 Bg6 Bc4 e6 N1e2 Nf6 O-O Bd6'],
    [2, 'e4 c6 d4 d5 e5 Bf5 Nc3 e6 g4 Bg6 Nge2 c5'],
    [1, 'e4 c6 d4 d5 e5 Bf5 Bd3 Bxd3 Qxd3 e6 Nf3 c5'],
    [1, 'e4 c6 d4 d5 e5 Bf5 c4 e6 Nc3 Ne7'],
    [1, 'e4 c6 d4 d5 exd5 cxd5 Nf3 Nc6 Bf4 Bg4'],
    [1, 'e4 c6 d4 d5 exd5 cxd5 c4 Nf6 Nc3 e6 Nf3 Be7 Bd3 dxc4 Bxc4 O-O O-O Nc6'],
    [1, 'e4 c6 c4 d5 exd5 cxd5 cxd5 Nf6 Nc3 Nxd5 Nf3 Nc6'],
    [1, 'e4 c6 Nf3 d5 Nc3 Bg4 Be2 e6 d4 Nf6'],
  ],
  sicilian: [
    [2, 'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6 Bc4 Bg7 h3 O-O Bb3 Nc6 Be3 Bd7 O-O'],
    [2, 'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6 Bg5 Bg7 Qd2 Nc6 O-O-O Nxd4 Qxd4 O-O'],
    [1, 'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6 g3 Nc6 Nde2 Bg7 Bg2 O-O O-O Rb8'],
    [1, 'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6 h3 Bg7 Be3 O-O Qd2 Nc6 O-O-O Nxd4 Bxd4 Be6'],
    [2, 'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6 Be3 Bg7 f3 O-O Qd2 Nc6 O-O-O d5 exd5 Nxd5 Nxc6 bxc6'],
    [2, 'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6 Be3 Bg7 f3 O-O Qd2 Nc6 g4 Be6'],
    [1, 'e4 c5 Nf3 d6 d4 cxd4 Qxd4 Nc6 Bb5 Bd7 Bxc6 Bxc6 Nc3 Nf6 Bg5 e6'],
    [1, 'e4 c5 Nf3 d6 Bc4 Nf6 d3 e6 O-O Be7 Bb3 O-O'],
    [1, 'e4 c5 c3 d5 exd5 Qxd5 d4 Nf6 Nf3 e6 Bd3 Nc6 O-O cxd4 cxd4 Be7 Nc3 Qd6'],
    [1, 'e4 c5 c3 d5 exd5 Qxd5 d4 Nf6 Nf3 e6 Na3 Nc6 Be3 cxd4 Nb5 Qd8'],
    [1, 'e4 c5 Nc3 d6 Nf3 Nf6 d4 cxd4 Nxd4 g6'],
    [1, 'e4 c5 f4 d5 exd5 Qxd5 Nc3 Qd8'],
    [1, 'e4 c5 d4 cxd4 Qxd4 Nc6 Qa4 Nf6'],
    [1, 'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 a6 Be2 e5 Nb3 Be7 O-O O-O Be3 Be6'],
  ],
  kid: [
    [2, 'd4 Nf6 c4 g6 Nc3 Bg7 e4 d6 Nf3 O-O Be2 e5 O-O Nc6 Be3 Ng4 Bg5 f6 Bc1 f5'],
    [1, 'd4 Nf6 c4 g6 Nc3 Bg7 e4 d6 Nf3 O-O Be2 e5 Be3 Ng4 Bg5 f6 Bh4 Nc6 d5 Ne7 Nd2 Nh6 f3 f5'],
    [1, 'd4 Nf6 c4 g6 Nc3 Bg7 e4 d6 f3 O-O Be3 e5 d5 Nh5 Qd2 f5 O-O-O Nd7 Bd3 Nc5 Bc2 a6'],
    [1, 'd4 Nf6 c4 g6 Nc3 Bg7 e4 d6 f3 O-O Bg5 c5 d5 e6 Qd2 exd5 cxd5 a6'],
    [1, 'd4 Nf6 c4 g6 Nc3 Bg7 e4 d6 f4 O-O Nf3 c5 dxc5 Qa5 Bd3 Qxc5 Qe2 Nc6 Be3 Qa5'],
    [1, 'd4 Nf6 c4 g6 g3 Bg7 Bg2 O-O Nc3 d6 Nf3 Nbd7 O-O e5 e4 c6 h3 Qa5'],
    [1, 'd4 Nf6 c4 g6 Nc3 Bg7 e4 d6 Nf3 O-O h3 e5 d5 a5 Be3 Na6 g4 Nc5 Nd2 c6'],
    [1, 'd4 Nf6 c4 g6 Nc3 Bg7 e4 d6 h3 O-O Nf3 e5 d5 a5 Bg5 Na6 Be2 Qe8'],
    [1, 'd4 Nf6 c4 g6 Nc3 Bg7 e4 d6 Nge2 O-O Ng3 e5 d5 a5 Be2 Na6 h4 h5'],
    [1, 'd4 Nf6 c4 g6 Nc3 Bg7 e4 d6 Bd3 O-O Nge2 e5 d5 Nh5 O-O f5 exf5 gxf5'],
    [1, 'd4 Nf6 c4 g6 Nc3 Bg7 Nf3 O-O Bg5 d6 e3 Nbd7 Be2 h6 Bh4 g5 Bg3 Nh5'],
    [1, 'd4 Nf6 c4 g6 Nc3 Bg7 Nf3 O-O Bf4 d6 h3 Nbd7 e3 b6 Be2 Bb7 O-O Ne4'],
    [2, 'd4 Nf6 Bf4 g6 Nf3 Bg7 e3 O-O h3 d6 Be2 Nbd7 O-O Qe8 c3 e5 Bh2 Qe7'],
    [1, 'd4 Nf6 Bf4 g6 Nc3 Bg7 e4 d6 Qd2 O-O O-O-O c6'],
    [1, 'd4 Nf6 Nf3 g6 Bg5 Bg7 Nbd2 O-O e3 d6 Bd3 Nbd7 O-O e5 c3 h6 Bh4 Qe8'],
    [1, 'd4 Nf6 Nf3 g6 e3 Bg7 Bd3 O-O O-O d6 Nbd2 Nbd7 e4 e5 c3 Re8'],
    [1, 'd4 Nf6 Nc3 g6 e4 d6 Nf3 Bg7 Be2 O-O O-O c6 a4 Nbd7 h3 e5'],
    [1, 'd4 Nf6 Bg5 g6 Bxf6 exf6 e3 Bg7 c4 f5 Nc3 O-O'],
    [1, 'c4 Nf6 Nc3 g6 e4 d6 d4 Bg7 Nf3 O-O Be2 e5'],
    [1, 'Nf3 Nf6 g3 g6 Bg2 Bg7 O-O O-O d3 d6 e4 e5 Nc3 Nc6'],
    [1, 'Nf3 Nf6 c4 g6 Nc3 Bg7 d4 O-O e4 d6 Be2 e5'],
  ],
}

/** How often the opponent heads for a lesson's line, by chapter. */
const LESSON_WEIGHT = { main: 4, idea: 2, replies: 2, traps: 1, variations: 1 }

export const extraLines = (o: Opening) => (EXTRA[o.id] ?? []).map(([weight, text]) => ({ weight, moves: text.split(' ') }))

export interface Book {
  /** The opponent's options in a position, with how often each is played. */
  replies: Map<string, Map<string, number>>
  /** The moves this course teaches for your side in a position: the recommended one first, then other variations. */
  repertoire: Map<string, { step: Step; lesson: Lesson }[]>
}

const cache = new Map<string, Book>()

export function bookFor(o: Opening): Book {
  const cached = cache.get(o.id)
  if (cached) return cached
  const book: Book = { replies: new Map(), repertoire: new Map() }
  const guided = o.lessons.filter(l => l.kind === 'guided')
  const lines = [...guided.map(l => ({ weight: LESSON_WEIGHT[l.chapter], moves: sans(l) })), ...extraLines(o)]
  for (const { weight, moves } of lines) {
    const c = new Chess()
    for (const san of moves) {
      if (c.turn() !== o.side) {
        const key = fenKey(c.fen())
        const options = book.replies.get(key) ?? new Map<string, number>()
        options.set(clean(san), (options.get(clean(san)) ?? 0) + weight)
        book.replies.set(key, options)
      }
      c.move(san)
    }
  }
  // recommended lines first, so that their move is the first one listed for a position
  for (const lesson of [...guided].sort((a, b) => +(a.chapter === 'variations') - +(b.chapter === 'variations'))) {
    const c = new Chess()
    lesson.moves.forEach(step => {
      if (c.turn() === o.side) {
        const known = book.repertoire.get(fenKey(c.fen())) ?? []
        if (!known.some(k => clean(k.step.san) === clean(step.san))) book.repertoire.set(fenKey(c.fen()), [...known, { step, lesson }])
      }
      c.move(step.san)
    })
  }
  cache.set(o.id, book)
  return book
}

/** A move for the opponent from the book, chosen in proportion to how common it is. Null once the game has left the book. */
export function bookReply(o: Opening, fen: string, random = Math.random): string | null {
  const options = bookFor(o).replies.get(fenKey(fen))
  if (!options) return null
  let r = random() * [...options.values()].reduce((a, b) => a + b, 0)
  for (const [san, weight] of options) {
    r -= weight
    if (r <= 0) return san
  }
  return null
}
