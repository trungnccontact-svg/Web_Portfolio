import { Chess } from "chess.js";

// Piece values for board evaluation
const PIECE_VALUES: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000
};

// Piece-Square Tables (PST) from White's perspective.
// Row 0 represents Rank 8 (Black's backline), Row 7 represents Rank 1 (White's backline).
const PAWN_PST = [
  [0,  0,  0,  0,  0,  0,  0,  0],
  [50, 50, 50, 50, 50, 50, 50, 50],
  [10, 10, 20, 30, 30, 20, 10, 10],
  [5,  5, 10, 25, 25, 10,  5,  5],
  [0,  0,  0, 20, 20,  0,  0,  0],
  [5, -5,-10,  0,  0,-10, -5,  5],
  [5, 10, 10,-20,-20, 10, 10,  5],
  [0,  0,  0,  0,  0,  0,  0,  0]
];

const KNIGHT_PST = [
  [-50,-40,-30,-30,-30,-30,-40,-50],
  [-40,-20,  0,  0,  0,  0,-20,-40],
  [-30,  0, 10, 15, 15, 10,  0,-30],
  [-30,  5, 15, 20, 20, 15,  5,-30],
  [-30,  0, 15, 20, 20, 15,  0,-30],
  [-30,  0, 10, 15, 15, 10,  0,-30],
  [-40,-20,  0,  5,  5,  0,-20,-40],
  [-50,-40,-30,-30,-30,-30,-40,-50]
];

const BISHOP_PST = [
  [-20,-10,-10,-10,-10,-10,-10,-20],
  [-10,  0,  0,  0,  0,  0,  0,-10],
  [-10,  0,  5, 10, 10,  5,  0,-10],
  [-10,  5,  5, 10, 10,  5,  5,-10],
  [-10,  0, 10, 10, 10, 10,  0,-10],
  [-10, 10, 10, 10, 10, 10, 10,-10],
  [-10,  5,  0,  0,  0,  0,  5,-10],
  [-20,-10,-10,-10,-10,-10,-10,-20]
];

const ROOK_PST = [
  [ 0,  0,  0,  0,  0,  0,  0,  0],
  [ 5, 10, 10, 10, 10, 10, 10,  5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [ 0,  0,  0,  5,  5,  0,  0,  0]
];

const QUEEN_PST = [
  [-20,-10,-10, -5, -5,-10,-10,-20],
  [-10,  0,  0,  0,  0,  0,  0,-10],
  [-10,  0,  5,  5,  5,  5,  0,-10],
  [ -5,  0,  5,  5,  5,  5,  0, -5],
  [  0,  0,  5,  5,  5,  5,  0, -5],
  [-10,  5,  5,  5,  5,  5,  5,-10],
  [-10,  0,  5,  0,  0,  5,  0,-10],
  [-20,-10,-10, -5, -5,-10,-10,-20]
];

const KING_MIDDLE_PST = [
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-20,-30,-30,-40,-40,-30,-30,-20],
  [-10,-20,-20,-20,-20,-20,-20,-10],
  [ 20, 20,  0,  0,  0,  0, 20, 20],
  [ 20, 30, 10,  0,  0, 10, 30, 20]
];

/**
 * Evaluates the board static score. Positive is good for White, negative is good for Black.
 */
export function evaluateBoard(chess: Chess): number {
  let score = 0;
  const board = chess.board();

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;

      const type = piece.type;
      const color = piece.color;
      let pieceVal = PIECE_VALUES[type] || 0;

      // Get positional value
      let pstVal = 0;
      const row = color === "w" ? r : 7 - r;
      const col = color === "w" ? c : 7 - c;

      switch (type) {
        case "p":
          pstVal = PAWN_PST[row][col];
          break;
        case "n":
          pstVal = KNIGHT_PST[row][col];
          break;
        case "b":
          pstVal = BISHOP_PST[row][col];
          break;
        case "r":
          pstVal = ROOK_PST[row][col];
          break;
        case "q":
          pstVal = QUEEN_PST[row][col];
          break;
        case "k":
          pstVal = KING_MIDDLE_PST[row][col];
          break;
      }

      const totalVal = pieceVal + pstVal;

      if (color === "w") {
        score += totalVal;
      } else {
        score -= totalVal;
      }
    }
  }

  return score;
}

/**
 * Minimax algorithm with Alpha-Beta Pruning
 */
function minimax(
  chess: Chess,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean
): number {
  if (depth === 0 || chess.isGameOver()) {
    return evaluateBoard(chess);
  }

  const moves = chess.moves({ verbose: true });

  // Simple move ordering: prioritize captures
  moves.sort((a, b) => {
    const aCap = a.captured ? 1 : 0;
    const bCap = b.captured ? 1 : 0;
    return bCap - aCap;
  });

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      chess.move(move.san);
      const evaluation = minimax(chess, depth - 1, alpha, beta, false);
      chess.undo();
      maxEval = Math.max(maxEval, evaluation);
      alpha = Math.max(alpha, evaluation);
      if (beta <= alpha) break; // Beta cutoff
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      chess.move(move.san);
      const evaluation = minimax(chess, depth - 1, alpha, beta, true);
      chess.undo();
      minEval = Math.min(minEval, evaluation);
      beta = Math.min(beta, evaluation);
      if (beta <= alpha) break; // Alpha cutoff
    }
    return minEval;
  }
}

/**
 * Finds the absolute best move for the active side.
 * Returns the best move object, its SAN string, and the evaluation score.
 */
export function findBestMove(
  fen: string,
  depth = 3
): { bestMoveSan: string; evalScore: number } {
  const chess = new Chess(fen);
  const moves = chess.moves({ verbose: true });

  if (moves.length === 0) {
    return { bestMoveSan: "", evalScore: evaluateBoard(chess) };
  }

  const isMaximizing = chess.turn() === "w";
  let bestMoveSan = moves[0].san;
  let bestValue = isMaximizing ? -Infinity : Infinity;

  // Simple move ordering: captures and promotions first
  moves.sort((a, b) => {
    const aScore = (a.captured ? 10 : 0) + (a.promotion ? 50 : 0);
    const bScore = (b.captured ? 10 : 0) + (b.promotion ? 50 : 0);
    return bScore - aScore;
  });

  for (const move of moves) {
    chess.move(move.san);
    const value = minimax(chess, depth - 1, -Infinity, Infinity, !isMaximizing);
    chess.undo();

    if (isMaximizing) {
      if (value > bestValue) {
        bestValue = value;
        bestMoveSan = move.san;
      }
    } else {
      if (value < bestValue) {
        bestValue = value;
        bestMoveSan = move.san;
      }
    }
  }

  return {
    bestMoveSan,
    evalScore: bestValue
  };
}
