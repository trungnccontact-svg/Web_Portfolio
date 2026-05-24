"use client";

import * as React from "react";
import { Chess } from "chess.js";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  Sparkles,
  Trophy,
  History,
  RotateCcw,
  Eye,
  Brain,
  Database,
  User,
  Cpu,
  Loader2,
  ChevronRight,
  TrendingUp,
  AlertTriangle
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { evaluateBoard } from "@/lib/chess-engine";

// Styled Modern Minimalist SVG Chess Pieces
// Designed with futuristic glowing gradient fills
const PieceIcon = ({ type, color }: { type: string; color: "w" | "b" }) => {
  const isWhite = color === "w";
  
  // Photographic piece mapping:
  // p -> pawn, r -> rook, n -> knight, b -> bishop, q -> queen, k -> king
  const filename = `${color}_${type.toLowerCase()}`;
  
  return (
    <img
      src={`/images/chess/${filename}.png`}
      alt={`${isWhite ? "White" : "Black"} ${type}`}
      className="w-full h-full object-contain select-none pointer-events-none drop-shadow-[1px_4px_4px_rgba(0,0,0,0.65)] active:scale-105 transition-transform duration-100"
      style={{
        transform: "scale(1.05)",
      }}
    />
  );
};

export function ChessGame() {
  const t = useTranslations("chess");
  const { toast } = useToast();

  const [game, setGame] = React.useState<Chess | null>(null);
  const [board, setBoard] = React.useState<any[][]>([]);
  const [selectedSquare, setSelectedSquare] = React.useState<string | null>(null);
  const [possibleMoves, setPossibleMoves] = React.useState<string[]>([]);
  const [difficulty, setDifficulty] = React.useState<"easy" | "medium" | "hard">("hard");
  const [is3d, setIs3d] = React.useState<boolean>(true);
  const [moveHistory, setMoveHistory] = React.useState<string[]>([]);
  const [aiCommentary, setAiCommentary] = React.useState<string>("");
  const [evalScore, setEvalScore] = React.useState<number>(0);
  const [isAiThinking, setIsAiThinking] = React.useState<boolean>(false);
  const [capturedPieces, setCapturedPieces] = React.useState<{ w: string[]; b: string[] }>({ w: [], b: [] });
  const [gameState, setGameState] = React.useState<"active" | "checkmate_win" | "checkmate_lose" | "draw">("active");
  const [dbStatus, setDbStatus] = React.useState<"connected" | "offline">("offline");
  const [dbLessons, setDbLessons] = React.useState<string[]>([]);
  const [isSavingLesson, setIsSavingLesson] = React.useState<boolean>(false);
  const [isDrawerOpen, setIsDrawerOpen] = React.useState<boolean>(false);
  const [undoneMoves, setUndoneMoves] = React.useState<any[]>([]);

  // Custom Click-and-Hold Drag & Drop States
  const [draggedPiece, setDraggedPiece] = React.useState<{
    type: string;
    color: "w" | "b";
    fromSquare: string;
  } | null>(null);
  const [dragPosition, setDragPosition] = React.useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [dragOverSquare, setDragOverSquare] = React.useState<string | null>(null);

  // Synchronization refs for global event listeners (prevents stale state capture)
  const dragOverSquareRef = React.useRef<string | null>(null);
  const possibleMovesRef = React.useRef<string[]>([]);
  const selectedSquareRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    dragOverSquareRef.current = dragOverSquare;
  }, [dragOverSquare]);

  React.useEffect(() => {
    possibleMovesRef.current = possibleMoves;
  }, [possibleMoves]);

  React.useEffect(() => {
    selectedSquareRef.current = selectedSquare;
  }, [selectedSquare]);

  // Handle global mouse movement and release during drag
  React.useEffect(() => {
    if (!draggedPiece) return;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      setDragPosition({ x: e.clientX, y: e.clientY });

      // Hit-test DOM element directly under the mouse pointer
      const element = document.elementFromPoint(e.clientX, e.clientY);
      if (!element) return;

      // Climb up DOM hierarchy to find square elements labeled with coordinate dataset
      const squareEl = element.closest("[data-square]");
      if (squareEl) {
        const sqName = squareEl.getAttribute("data-square");
        setDragOverSquare(sqName);
      } else {
        setDragOverSquare(null);
      }
    };

    const handleGlobalMouseUp = () => {
      const targetSq = dragOverSquareRef.current;
      const fromSq = selectedSquareRef.current;
      const validMoves = possibleMovesRef.current;

      if (targetSq && fromSq && validMoves.includes(targetSq)) {
        executeMove(fromSq, targetSq);
      }

      setDraggedPiece(null);
      setDragOverSquare(null);
    };

    window.addEventListener("mousemove", handleGlobalMouseMove);
    window.addEventListener("mouseup", handleGlobalMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleGlobalMouseMove);
      window.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [draggedPiece]);

  // Initialize board state
  React.useEffect(() => {
    const c = new Chess();
    setGame(c);
    setBoard(c.board());
    
    // Clear and set welcoming commentary
    setAiCommentary("Ah, Nguyen Chi Trung! Welcome to my Chess Lounge. Go ahead, make your first move. I dare you.");
    
    // Load Wars Database lessons and status
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    try {
      const res = await fetch("/api/chess/learn");
      const data = await res.json();
      if (res.ok && data.success) {
        setDbStatus(data.source === "tidb" ? "connected" : "offline");
        const list = data.lessons.map((l: any) => l.lesson);
        setDbLessons(list);
      }
    } catch (e) {
      console.warn("[Chess Game] Failed to fetch learn history", e);
      setDbStatus("offline");
    }
  };

  const calculateCaptured = (currentChess: Chess) => {
    const defaultPieces = {
      p: 8, n: 2, b: 2, r: 2, q: 1, k: 1
    };
    const currentCounts = {
      w: { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 },
      b: { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 }
    };

    const currentBoard = currentChess.board();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = currentBoard[r][c];
        if (piece) {
          const color = piece.color as "w" | "b";
          const type = piece.type as keyof typeof defaultPieces;
          currentCounts[color][type]++;
        }
      }
    }

    const captured = {
      w: [] as string[],
      b: [] as string[]
    };

    // Captured White pieces (Black took them)
    Object.entries(defaultPieces).forEach(([type, count]) => {
      const remaining = currentCounts.w[type as keyof typeof defaultPieces];
      const lost = count - remaining;
      for (let i = 0; i < lost; i++) {
        captured.w.push(type);
      }
    });

    // Captured Black pieces (White took them)
    Object.entries(defaultPieces).forEach(([type, count]) => {
      const remaining = currentCounts.b[type as keyof typeof defaultPieces];
      const lost = count - remaining;
      for (let i = 0; i < lost; i++) {
        captured.b.push(type);
      }
    });

    setCapturedPieces(captured);
  };

  const makeAIMove = async (currentChess: Chess, history: string[]) => {
    setIsAiThinking(true);
    try {
      const response = await fetch("/api/chess/play", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fen: currentChess.fen(),
          difficulty,
          history,
          lessons: dbLessons
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        // AI returned legal move
        const aiMoveSan = data.move;
        const comment = data.commentary;
        
        currentChess.move(aiMoveSan);
        
        // Refresh local states
        setBoard(currentChess.board());
        setMoveHistory(currentChess.history());
        setAiCommentary(comment);
        setEvalScore(data.evalScore);
        calculateCaptured(currentChess);

        // Check if game is over
        checkGameStatus(currentChess);
      } else {
        toast({
          variant: "destructive",
          title: "AI Tactics Error",
          description: data.error || "Failed to query the grandmaster model."
        });
      }
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Tactical System Malfunction",
        description: "Connection timed out. OpenRouter is currently unresponsive."
      });
    } finally {
      setIsAiThinking(false);
    }
  };

  const checkGameStatus = async (currentChess: Chess) => {
    if (currentChess.isGameOver()) {
      if (currentChess.isCheckmate()) {
        const turn = currentChess.turn();
        if (turn === "b") {
          // White won (Nguyen Chi Trung prevailed!)
          setGameState("checkmate_win");
          toast({
            title: "🏆 Victory Achieved!",
            description: "Trung, you have vanquished the adaptive Grandmaster AI in checkmate!"
          });
        } else {
          // Black won (AI prevailed)
          setGameState("checkmate_lose");
          toast({
            variant: "destructive",
            title: "💀 Defeat Conceded",
            description: "The AI outmaneuvered you. Your king falls."
          });
          // Learn from defeat! Trigger TiDB learning archive
          await archiveLesson("Nguyen Chi Trung was outmaneuvered by AI. Focus on king safety and check the diagonal defense lines.", "defeat");
        }
      } else {
        setGameState("draw");
        toast({
          title: "🤝 Draw Conceded",
          description: "Stalemate, threefold repetition, or insufficient material."
        });
      }
    }
  };

  const archiveLesson = async (lessonText: string, outcome: string) => {
    setIsSavingLesson(true);
    try {
      const res = await fetch("/api/chess/learn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lesson: lessonText, outcome })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast({
          title: data.savedToTiDB ? "🧠 Wars Database Synchronized" : "💾 Local Archive Synchronized",
          description: data.savedToTiDB 
            ? "Your defeat strategy has been logged. The AI will learn and adapt in future matches!"
            : "TiDB was unreachable. Strategy has been logged to local chess memories."
        });
        fetchLessons();
      }
    } catch (e) {
      console.error("[Chess Learn] Failed to archive defeat strategy", e);
    } finally {
      setIsSavingLesson(false);
    }
  };

  const executeMove = (from: string, to: string) => {
    if (!game || isAiThinking || gameState !== "active") return;

    try {
      const currentMoves = game.moves({ square: from as any, verbose: true }) as any[];
      const targetMove = currentMoves.find(m => m.to === to);
      
      if (targetMove) {
        // Clear undone moves on new active play
        setUndoneMoves([]);

        // Make white player move
        game.move({
          from: from as any,
          to: to as any,
          promotion: targetMove.promotion || "q" // Auto promote to Queen for seamless modern gameplay
        });

        // Reset selection
        setSelectedSquare(null);
        setPossibleMoves([]);

        // Update board, history & local evaluations
        setBoard(game.board());
        const history = game.history();
        setMoveHistory(history);
        const score = evaluateBoard(game);
        setEvalScore(score);
        calculateCaptured(game);

        // Check if player's move finished the game
        if (game.isGameOver()) {
          checkGameStatus(game);
        } else {
          // Let AI make its turn
          makeAIMove(game, history);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSquareClick = (square: string) => {
    if (!game || isAiThinking || gameState !== "active") return;

    // 1. If clicking a currently selected square, deselect it
    if (selectedSquare === square) {
      setSelectedSquare(null);
      setPossibleMoves([]);
      return;
    }

    // 2. Try to perform a move if possible
    if (possibleMoves.includes(square)) {
      if (selectedSquare) {
        executeMove(selectedSquare, square);
      }
      return;
    }

    // 3. Highlight potential moves if clicking own white piece
    const squarePiece = game.get(square as any);
    if (squarePiece && squarePiece.color === "w") {
      setSelectedSquare(square);
      const moves = game.moves({ square: square as any, verbose: true }) as any[];
      setPossibleMoves(moves.map(m => m.to));
    } else {
      setSelectedSquare(null);
      setPossibleMoves([]);
    }
  };

  // Handles mouse press down on pieces to initiate standard drag-and-drop
  const handlePieceMouseDown = (e: React.MouseEvent, piece: any, sqName: string) => {
    if (!game || isAiThinking || gameState !== "active" || piece.color !== "w") return;

    setSelectedSquare(sqName);
    const moves = game.moves({ square: sqName as any, verbose: true }) as any[];
    setPossibleMoves(moves.map(m => m.to));

    setDraggedPiece({
      type: piece.type,
      color: piece.color,
      fromSquare: sqName
    });
    setDragPosition({ x: e.clientX, y: e.clientY });
    setDragOverSquare(sqName);

    e.preventDefault(); // Prevent standard visual browser drag shadows
  };

  const resetBoard = () => {
    const c = new Chess();
    setGame(c);
    setBoard(c.board());
    setSelectedSquare(null);
    setPossibleMoves([]);
    setMoveHistory([]);
    setCapturedPieces({ w: [], b: [] });
    setGameState("active");
    setEvalScore(0);
    setAiCommentary("A new game, Trung? Very well. I hope you've practiced since your last defeat.");
    setUndoneMoves([]);
  };

  const handleUndo = () => {
    if (!game || isAiThinking || gameState !== "active") return;
    
    // We undo two moves (AI's move and then White's move) so that it reverts back to White's turn
    const move1 = game.undo();
    if (!move1) {
      toast({
        title: "No moves to undo",
        description: "You are at the starting position."
      });
      return;
    }
    
    const move2 = game.undo();
    const newUndone = [...undoneMoves];
    if (move2) newUndone.push(move2);
    newUndone.push(move1);
    setUndoneMoves(newUndone);
    
    setBoard(game.board());
    setMoveHistory(game.history());
    setEvalScore(evaluateBoard(game));
    calculateCaptured(game);
    
    toast({
      title: "Move Undone",
      description: "Successfully reverted to your previous turn."
    });
  };

  const handleRedo = () => {
    if (!game || isAiThinking || gameState !== "active" || undoneMoves.length === 0) {
      toast({
        title: "No moves to redo",
        description: "No recently undone moves are available."
      });
      return;
    }
    
    const newUndone = [...undoneMoves];
    
    // Redo White's move
    const move1 = newUndone.pop();
    if (move1) {
      game.move(move1);
    }
    
    // Redo AI's move
    const move2 = newUndone.pop();
    if (move2) {
      game.move(move2);
    }
    
    setUndoneMoves(newUndone);
    setBoard(game.board());
    setMoveHistory(game.history());
    setEvalScore(evaluateBoard(game));
    calculateCaptured(game);
    
    toast({
      title: "Move Redone",
      description: "Replayed the undone moves."
    });
  };

  // Convert row, col index to Algebraic chess notation (e.g. 0,0 -> a8)
  const getSquareName = (r: number, c: number): string => {
    const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
    const ranks = ["8", "7", "6", "5", "4", "3", "2", "1"];
    return files[c] + ranks[r];
  };

  // Helper to extract the last move from the game logs
  const getLastMove = () => {
    if (!game) return null;
    const historyVerbose = game.history({ verbose: true }) as any[];
    if (historyVerbose.length === 0) return null;
    return historyVerbose[historyVerbose.length - 1];
  };

  const getDifficultyLabel = () => {
    if (difficulty === "easy") return t("difficultyEasy") || "Novice (Depth 1)";
    if (difficulty === "medium") return t("difficultyMedium") || "Challenger (Depth 2)";
    return t("difficultyHard") || "Grandmaster (Depth 3)";
  };

  // Normalize static evaluation score to percentage (for the bar)
  // Positive favors White (Amber/Gold), Negative favors Black (Purple)
  const getEvaluationPercentage = () => {
    // 0 is equal, +1000 is absolute winning white, -1000 is absolute winning black
    const clampedScore = Math.max(-1500, Math.min(1500, evalScore));
    // map [-1500, 1500] to [5%, 95%]
    const pct = ((clampedScore + 1500) / 3000) * 90 + 5;
    return `${100 - pct}%`; // Percentage of the bar filled by Black (top)
  };

  const currentTurn = game ? game.turn() : "w";
  const isWhitesTurn = currentTurn === "w" && gameState === "active";
  const isBlacksTurn = currentTurn === "b" && gameState === "active";
  const lastMove = getLastMove();

  return (
    <div className="w-full min-h-[calc(100vh-6rem)] flex flex-col items-center justify-start p-4 md:p-8 select-none z-10 relative max-w-[1550px] mx-auto wood-planks overflow-hidden">
      {/* Component Specific Stylings for High Fidelity Wood & Marble table render */}
      <style dangerouslySetInnerHTML={{ __html: `
        .wood-planks {
          background: 
            linear-gradient(to bottom, rgba(0,0,0,0.65), rgba(0,0,0,0.2) 40%, rgba(0,0,0,0.7)),
            repeating-linear-gradient(90deg, 
              #070401 0px, 
              #070401 5px, 
              transparent 5px, 
              transparent 170px),
            repeating-linear-gradient(90deg,
              #2a160a 0px,
              #221107 85px,
              #150903 170px);
          background-size: 100% 100%, 170px 100%, 170px 100%;
        }
        .wood-board-frame {
          background-color: #170d05;
          background-image: 
            repeating-linear-gradient(0deg, rgba(255,255,255,0.01) 0px, rgba(255,255,255,0.01) 1px, transparent 1px, transparent 10px),
            linear-gradient(135deg, #321c10 0%, #170b04 100%);
          border: 24px solid #2c160b;
          border-image: linear-gradient(135deg, #3a1e10 0%, #150904 100%) 24;
          box-shadow: 
            0 50px 100px rgba(0,0,0,0.98),
            inset 0 0 25px rgba(0,0,0,0.95),
            0 0 0 4px #0a0401,
            0 12px 24px rgba(0,0,0,0.9);
          border-radius: 12px;
          transform-style: preserve-3d;
        }
        @media (min-width: 768px) {
          .wood-board-frame {
            border: 36px solid #2c160b;
            border-image: linear-gradient(135deg, #3a1e10 0%, #150904 100%) 36;
          }
        }
        .wood-square-light {
          background-image: 
            url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cpath d='M0,10 C20,13 40,8 60,10 T80,10 M0,40 C30,38 60,42 80,40 M0,70 C20,72 40,68 60,70 T80,70' fill='none' stroke='%238a6a42' stroke-width='0.5' opacity='0.12'/%3E%3C/svg%3E"),
            linear-gradient(135deg, #f2e1c3 0%, #ebd7b5 50%, #dcb88e 100%);
        }
        .wood-square-dark {
          background-image: 
            url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cpath d='M10,0 C12,20 8,40 10,60 T10,80 M40,0 C38,30 42,60 40,80 M70,0 C72,20 68,40 70,60 T70,80' fill='none' stroke='%230b0401' stroke-width='0.6' opacity='0.35'/%3E%3C/svg%3E"),
            linear-gradient(135deg, #382115 0%, #29150c 50%, #1c0c05 100%);
        }
        .wood-btn {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: radial-gradient(circle at 35% 35%, #47291a 0%, #221107 70%, #0d0401 100%);
          border: 4px solid #c59b27;
          box-shadow: 
            0 10px 22px rgba(0,0,0,0.7), 
            inset 0 3px 5px rgba(255,255,255,0.12),
            inset 0 -3px 5px rgba(0,0,0,0.75),
            0 0 0 2px #0f0703;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffd700;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
        }
        .wood-btn:hover {
          transform: translateY(-4px) scale(1.06);
          box-shadow: 
            0 16px 28px rgba(0,0,0,0.8), 
            inset 0 3px 5px rgba(255,255,255,0.22),
            inset 0 -3px 5px rgba(0,0,0,0.65),
            0 0 0 2.5px #e5b839;
          color: #ffffff;
        }
        .wood-btn:active {
          transform: translateY(1px) scale(0.96);
          box-shadow: 
            0 5px 12px rgba(0,0,0,0.6), 
            inset 0 2px 5px rgba(0,0,0,0.9);
        }
        .wood-coordinate {
          color: #d4af37;
          font-family: monospace;
          font-weight: 800;
          opacity: 0.8;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.9);
        }
      `}} />

      {/* Dynamic inline gradient and pattern definitions for SVG pieces */}
      <svg className="hidden">
        <defs>
          {/* Maple Wood Piece Gradient (3D Radial) */}
          <radialGradient id="marbleGrad" cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#fdfbf7" />
            <stop offset="35%" stopColor="#f7ebd9" />
            <stop offset="70%" stopColor="#eacf9f" />
            <stop offset="95%" stopColor="#cca16e" />
            <stop offset="100%" stopColor="#a37644" />
          </radialGradient>

          {/* Walnut/Mahogany Piece Gradient (3D Radial) */}
          <radialGradient id="woodGrad" cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#ab7852" />
            <stop offset="25%" stopColor="#805333" />
            <stop offset="65%" stopColor="#4d2f19" />
            <stop offset="90%" stopColor="#2a170a" />
            <stop offset="100%" stopColor="#120904" />
          </radialGradient>

          {/* Gold Trim Gradient for base highlights */}
          <linearGradient id="goldTrimGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#b8860b" />
            <stop offset="50%" stopColor="#ffd700" />
            <stop offset="100%" stopColor="#b8860b" />
          </linearGradient>

          {/* Fine Wood Grain (For Black Wood Pieces) */}
          <pattern id="fineWoodGrain" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M-10,20 Q10,15 30,20 T70,20 M-10,5 Q15,10 30,5 T70,5" fill="none" stroke="#120501" strokeWidth="1" opacity="0.25" />
          </pattern>

          {/* Light Maple Wood Grain Pattern (For White Pieces) */}
          <pattern id="marbleVeins" width="50" height="50" patternUnits="userSpaceOnUse" patternTransform="rotate(8)">
            <path d="M 0,5 Q 15,2 30,5 T 50,5 M 0,25 Q 20,28 35,25 T 50,25" fill="none" stroke="#8a5e32" strokeWidth="0.8" opacity="0.22" />
          </pattern>

          {/* Specular Gloss Highlight Gradient */}
          <linearGradient id="specularHighlight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.65" />
            <stop offset="30%" stopColor="#ffffff" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      {/* Palm Branch Accent in the Top-Right Corner */}
      <div className="absolute top-0 right-0 w-[240px] h-[240px] md:w-[350px] md:h-[350px] pointer-events-none select-none overflow-hidden z-20">
        <svg viewBox="0 0 100 100" className="w-full h-full text-emerald-950/80 drop-shadow-[4px_12px_8px_rgba(0,0,0,0.65)] origin-top-right scale-110">
          {/* Stalk */}
          <path d="M100,0 C80,18 60,45 40,75" fill="none" stroke="#1b3014" strokeWidth="1.6" strokeLinecap="round" />
          {/* Leaves */}
          <path d="M90,8 C85,2 70,10 65,12 C75,18 85,14 90,8 Z" fill="#2d4a22" />
          <path d="M82,15 C75,10 60,18 55,21 C65,27 75,22 82,15 Z" fill="#3a5f2d" />
          <path d="M74,22 C67,18 52,26 47,30 C56,36 66,30 74,22 Z" fill="#2d4a22" />
          <path d="M66,30 C59,26 44,34 39,39 C48,44 58,38 66,30 Z" fill="#3a5f2d" />
          <path d="M58,39 C51,35 36,43 31,48 C40,52 50,46 58,39 Z" fill="#2d4a22" />
          <path d="M50,49 C43,45 28,53 23,58 C32,62 42,56 50,49 Z" fill="#3a5f2d" />
          {/* Leaves on other side */}
          <path d="M95,3 C92,10 82,25 80,30 C88,22 93,12 95,3 Z" fill="#1b3014" />
          <path d="M88,10 C84,17 74,32 72,37 C80,29 85,19 88,10 Z" fill="#2d4a22" />
          <path d="M80,18 C76,25 66,40 64,45 C72,37 77,27 80,18 Z" fill="#1b3014" />
          <path d="M72,26 C68,33 58,48 56,53 C64,45 69,35 72,26 Z" fill="#2d4a22" />
          <path d="M64,35 C60,42 50,57 48,62 C56,54 61,44 64,35 Z" fill="#1b3014" />
        </svg>
      </div>

      {/* Header Title */}
      <div className="text-center mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full max-w-4xl z-10">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight flex items-center justify-center gap-3 font-heading uppercase bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          <Sparkles className="w-7 h-7 text-amber-400 animate-pulse" />
          {t("title") || "Grandmaster AI Chess Lounge"}
        </h1>
        <p className="text-amber-100/70 mt-2 text-xs md:text-sm font-semibold max-w-xl mx-auto italic drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.9)]">
          {t("subtitle") || "Play against an adaptive AI that learns from defeats and taunts you dynamically in real time."}
        </p>
      </div>

      {/* Main Table Content Panel */}
      <div className="w-full flex flex-col items-center justify-center py-4 md:py-10 z-10">
        
        {/* Core Widescreen Chess Theater Area */}
        <div className="w-full max-w-[1100px] flex flex-col md:flex-row items-center justify-between gap-8 md:gap-14 relative">
          
          {/* LEFT BUTTON CLUSTER (Desktop: Left, Mobile: Hidden) */}
          <div className="hidden md:flex flex-col justify-around h-[340px] shrink-0">
            <button onClick={handleUndo} className="wood-btn" title="Undo Move">
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 14L4 9l5-5" />
                <path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11" />
              </svg>
            </button>
            <button onClick={resetBoard} className="wood-btn" title="Reset Board">
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
              </svg>
            </button>
          </div>

          {/* CENTER COMPONENT: Chess Board with Status Overlays */}
          <div className="flex-1 max-w-[650px] w-full flex flex-col items-center justify-center p-4 rounded-[24px] bg-[#0c0703]/40 border border-white/5 shadow-3xl relative overflow-hidden">
            
            {/* Chess Status overlay */}
            <AnimatePresence>
              {gameState !== "active" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-[#070401]/92 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-6 text-center rounded-[24px] border border-[#c59b27]/30"
                >
                  {gameState === "checkmate_win" && (
                    <div className="space-y-4">
                      <div className="w-20 h-20 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto mb-2 text-4xl animate-bounce">🏆</div>
                      <h2 className="text-2xl font-extrabold text-amber-400 uppercase tracking-wider">VICTORY ACHIEVED!</h2>
                      <p className="text-xs text-amber-100/70 max-w-md">Trung, you have vanquished the adaptive Grandmaster AI in checkmate! Defeat strategy logged successfully.</p>
                    </div>
                  )}
                  {gameState === "checkmate_lose" && (
                    <div className="space-y-4">
                      <div className="w-20 h-20 rounded-full bg-rose-950/20 text-rose-500 border border-rose-950/40 flex items-center justify-center mx-auto mb-2 text-4xl">💀</div>
                      <h2 className="text-2xl font-extrabold text-rose-500 uppercase tracking-wider">DEFEAT CONCEDED</h2>
                      <p className="text-xs text-amber-100/60 max-w-md">The adaptive AI outmaneuvered you this time. Storing strategy lesson to database...</p>
                      {isSavingLesson && (
                        <div className="flex items-center justify-center gap-2 text-xs text-amber-400 animate-pulse">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Synchronizing memory bank...</span>
                        </div>
                      )}
                    </div>
                  )}
                  {gameState === "draw" && (
                    <div className="space-y-4">
                      <div className="w-20 h-20 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto mb-2 text-4xl">🤝</div>
                      <h2 className="text-2xl font-extrabold text-amber-400 uppercase tracking-wider">DRAW MATCH</h2>
                      <p className="text-xs text-amber-100/70 max-w-md">The battle resulted in a draw. Let&apos;s reset the board and go again!</p>
                    </div>
                  )}
                  <button
                    onClick={resetBoard}
                    className="mt-6 py-3 px-8 rounded-full bg-gradient-to-r from-amber-500 to-yellow-600 text-[#0d0703] font-black hover:brightness-110 text-xs tracking-widest uppercase transition-all cursor-pointer shadow-lg active:scale-95 border-2 border-yellow-300/40"
                  >
                    Play Again
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* AI thinking state indicator */}
            {isAiThinking && (
              <div className="absolute top-4 right-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/30 bg-[#170d05]/90 text-amber-400 text-[10px] font-black animate-pulse backdrop-blur-md shadow-lg">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                <span>AI is planning...</span>
              </div>
            )}

            {/* Integrated Vertical Evaluation & Widescreen Board Block */}
            <div className="w-full flex items-stretch gap-5 justify-center">
              
              {/* Position Evaluation Bar */}
              <div className="w-4 rounded-full bg-black/60 border border-[#c59b27]/30 flex flex-col overflow-hidden relative shadow-inner shrink-0" title={t("evaluation") || "Evaluation"}>
                {/* Black score filling down from top */}
                <motion.div
                  animate={{ height: getEvaluationPercentage() }}
                  transition={{ type: "spring", stiffness: 100, damping: 15 }}
                  className="w-full bg-[#1e0f06] relative"
                />
                {/* Equator divider indicator */}
                <div className="absolute top-1/2 left-0 right-0 h-[1.5px] bg-[#c59b27]/60 z-10" />
                <div className="absolute inset-0 flex flex-col justify-between items-center text-[8px] font-mono font-bold text-amber-200/50 py-2 pointer-events-none select-none z-10">
                  <span>B</span>
                  <span>+</span>
                  <span>W</span>
                </div>
              </div>

              {/* Tilted wood tabletop board container */}
              <div
                className="flex-1 transition-all duration-700 aspect-square flex items-center justify-center relative select-none"
                style={{
                  perspective: "1200px",
                  transformStyle: "preserve-3d"
                }}
              >
                <div
                  className="w-full h-full grid grid-cols-8 grid-rows-8 wood-board-frame shadow-3xl relative select-none transition-all duration-700"
                  style={{
                    transform: is3d 
                      ? "rotateX(38deg) rotateY(0deg) rotateZ(0deg) scale(0.96)" 
                      : "rotateX(0deg) rotateZ(0deg) translateZ(0) scale(1)",
                    boxShadow: is3d 
                      ? "0 40px 80px rgba(0,0,0,0.95), inset 0 0 10px rgba(0,0,0,0.8)" 
                      : "0 15px 40px rgba(0,0,0,0.6)",
                    transformStyle: "preserve-3d"
                  }}
                >
                  {/* 3D solid thickness decor sides */}
                  {is3d && (
                    <>
                      <div className="absolute left-0 right-0 bottom-0 h-4 bg-[#0a0502]/98 border-t border-[#281409]/30 origin-bottom transform translate-y-4 rotateX(-90deg) z-0" />
                      <div className="absolute bottom-0 top-0 right-0 w-4 bg-[#0e0703]/98 border-l border-[#281409]/30 origin-right transform translate-x-4 rotateY(90deg) z-0" />
                    </>
                  )}

                  {/* Render Chess Board Squares */}
                  {board.map((row, rIdx) =>
                    row.map((piece, cIdx) => {
                      const sqName = getSquareName(rIdx, cIdx);
                      const isDark = (rIdx + cIdx) % 2 === 1;
                      
                      const isSelected = selectedSquare === sqName;
                      const isMoveTarget = possibleMoves.includes(sqName);
                      const isHoveredTarget = dragOverSquare === sqName && isMoveTarget;
                      
                      // Highlight checked King
                      const isCheckedKing = piece && piece.type === "k" && game?.inCheck() && piece.color === game.turn();

                      // Last move indicators
                      const isLastMoveSource = lastMove && lastMove.from === sqName;
                      const isLastMoveDest = lastMove && lastMove.to === sqName;

                      // Click-and-Hold opacity lift
                      const isBeingDragged = draggedPiece && draggedPiece.fromSquare === sqName;

                      return (
                        <div
                          key={sqName}
                          data-square={sqName}
                          onClick={() => handleSquareClick(sqName)}
                          onMouseDown={(e) => {
                            if (piece) {
                              handlePieceMouseDown(e, piece, sqName);
                            }
                          }}
                          className={cn(
                            "w-full h-full relative flex items-center justify-center transition-all cursor-pointer group select-none",
                            isDark 
                              ? "wood-square-dark hover:brightness-[1.12]" 
                              : "wood-square-light hover:brightness-[1.06]",
                            isSelected && "ring-4 ring-amber-500/60 ring-inset bg-amber-500/15 z-10 shadow-[inset_0_0_12px_rgba(245,158,11,0.5)]",
                            isLastMoveSource && "bg-amber-500/5 shadow-[inset_0_0_8px_rgba(245,158,11,0.15)] border border-amber-500/20 z-0",
                            isLastMoveDest && "bg-amber-500/10 shadow-[inset_0_0_10px_rgba(245,158,11,0.2)] border-2 border-amber-500/30 z-0",
                            isCheckedKing && "bg-rose-900/30 animate-pulse border-2 border-rose-500 z-10",
                            isHoveredTarget && "bg-emerald-500/20 border-2 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.5)] z-10 scale-[0.98]"
                          )}
                          style={{
                            transformStyle: "preserve-3d"
                          }}
                        >
                          {/* Rank Coordinates inside left edge squares */}
                          {cIdx === 0 && (
                            <span className="absolute top-1.5 left-2 text-[10px] font-black select-none pointer-events-none wood-coordinate">
                              {8 - rIdx}
                            </span>
                          )}

                          {/* File Coordinates inside bottom edge squares */}
                          {rIdx === 7 && (
                            <span className="absolute bottom-1.5 right-2 text-[10px] font-black select-none pointer-events-none wood-coordinate">
                              {String.fromCharCode(97 + cIdx)}
                            </span>
                          )}

                          {/* Legal Move Target Dot indicator */}
                          {isMoveTarget && !isHoveredTarget && (
                            <div className={cn(
                              "absolute rounded-full z-20 pointer-events-none",
                              piece 
                                ? "w-7 h-7 border-2 border-emerald-400/80 bg-emerald-500/15 animate-pulse" 
                                : "w-3 h-3 bg-emerald-400"
                            )} />
                          )}

                          {/* Chess Piece with 3D projection on hover */}
                          {piece && (
                            <motion.div
                              layoutId={`piece-${sqName}`}
                              className={cn(
                                "w-[82%] h-[82%] flex items-center justify-center relative select-none transition-all duration-200",
                                isBeingDragged ? "opacity-25 filter grayscale-[0.6] brightness-[0.7]" : ""
                              )}
                              style={{
                                transform: is3d 
                                  ? "rotateX(-38deg) translateY(-14%) translateZ(12px)" 
                                  : "rotateX(0deg) translateY(0) translateZ(0)",
                                transformOrigin: "bottom center",
                                transformStyle: "preserve-3d"
                              }}
                            >
                              <PieceIcon type={piece.type} color={piece.color} />
                            </motion.div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* RIGHT BUTTON CLUSTER (Desktop: Right, Mobile: Hidden) */}
          <div className="hidden md:flex flex-col justify-around h-[340px] shrink-0">
            <button onClick={handleRedo} className="wood-btn" title="Redo Move">
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 14l5-5-5-5" />
                <path d="M20 9H9.5A5.5 5.5 0 0 0 4 14.5v0A5.5 5.5 0 0 0 9.5 20H13" />
              </svg>
            </button>
            <button onClick={() => setIsDrawerOpen(true)} className="wood-btn" title="AI Settings & Insights">
              <svg className="w-7 h-7 animate-[spin_8s_linear_infinite]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </button>
          </div>

        </div>

        {/* MOBILE CONTROLLER ROW (Desktop: Hidden, Mobile: Visible) */}
        <div className="flex md:hidden flex-row gap-5 justify-center mt-6 z-10 shrink-0">
          <button onClick={handleUndo} className="wood-btn w-12 h-12" title="Undo Move">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M9 14L4 9l5-5M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11" />
            </svg>
          </button>
          <button onClick={resetBoard} className="wood-btn w-12 h-12" title="Reset Board">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
          </button>
          <button onClick={handleRedo} className="wood-btn w-12 h-12" title="Redo Move">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M15 14l5-5-5-5M20 9H9.5A5.5 5.5 0 0 0 4 14.5v0A5.5 5.5 0 0 0 9.5 20H13" />
            </svg>
          </button>
          <button onClick={() => setIsDrawerOpen(true)} className="wood-btn w-12 h-12" title="AI Settings & Insights">
            <svg className="w-6 h-6 animate-[spin_10s_linear_infinite]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
        </div>

      </div>

      {/* FIXED POSITION HOLOGRAM OVERLAY FOR PIECE DRAGGING */}
      {draggedPiece && (
        <div
          style={{
            position: "fixed",
            left: dragPosition.x,
            top: dragPosition.y,
            transform: "translate(-50%, -50%) translateZ(60px) rotate(-10deg) scale(1.25)",
            pointerEvents: "none", 
            zIndex: 1000,
            width: "60px",
            height: "60px",
          }}
          className="filter drop-shadow-[0_20px_12px_rgba(0,0,0,0.65)] transition-transform duration-75 animate-in fade-in zoom-in-75 select-none"
        >
          <PieceIcon type={draggedPiece.type} color={draggedPiece.color} />
        </div>
      )}

      {/* SLIDE-OUT RETRO WOODEN COMMAND DRAWER OVERLAY */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            {/* Dark overlay backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.65 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-[#050301] z-45"
            />

            {/* Slide-out drawer panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 180 }}
              className="fixed right-0 top-0 h-full w-[360px] sm:w-[410px] bg-[#1d0f06] border-l-4 border-[#c59b27] shadow-2xl z-50 p-5 overflow-y-auto flex flex-col gap-5 text-amber-100"
              style={{
                background: "linear-gradient(to bottom, #1d0f06, #120904)"
              }}
            >
              
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-[#c59b27]/30 pb-3">
                <span className="text-xs font-black uppercase tracking-widest text-[#ffd700] flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  Tactical Core Panel
                </span>
                <button 
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1 rounded-full border border-[#c59b27]/40 hover:bg-[#c59b27]/10 hover:text-white cursor-pointer active:scale-95"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* AI Battle Status Panel */}
              <div className="rounded-2xl border border-[#c59b27]/25 bg-black/40 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase tracking-wider text-amber-500/70 flex items-center gap-1">
                    <Database className="w-3 h-3" />
                    Memories Database
                  </span>
                  <span className={cn(
                    "flex items-center gap-1 px-2 py-0.5 rounded-full border text-[8px] font-bold select-none",
                    dbStatus === "connected" ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-400" : "bg-amber-950/40 border-amber-500/30 text-amber-400"
                  )}>
                    {dbStatus === "connected" ? "TiDB Synchronized" : "Local Backing"}
                  </span>
                </div>

                {/* User vs Opponent Cards */}
                <div className="flex items-center gap-2 bg-[#26150b]/60 border border-[#c59b27]/15 rounded-xl p-2.5">
                  <div className={cn(
                    "w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-extrabold shadow transition-all duration-300",
                    isWhitesTurn ? "ring-2 ring-amber-400 animate-pulse scale-105" : "opacity-70"
                  )}>
                    <User className="w-4 h-4 text-[#26150b]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold truncate">Chi Trung</p>
                    <p className="text-[8px] text-amber-400 font-bold uppercase tracking-wider">White</p>
                  </div>
                  <span className="text-[8px] font-black text-amber-500/40">VS</span>
                  <div className={cn(
                    "w-8 h-8 rounded-lg bg-gradient-to-br from-[#c59b27] to-[#806010] flex items-center justify-center text-white font-extrabold shadow transition-all duration-300",
                    isBlacksTurn ? "ring-2 ring-yellow-400 animate-pulse scale-105" : "opacity-70"
                  )}>
                    <Cpu className="w-4 h-4 text-amber-100" />
                  </div>
                  <div className="flex-1 min-w-0 text-right">
                    <p className="text-[11px] font-bold truncate">Grandmaster</p>
                    <p className="text-[8px] text-amber-400 font-bold uppercase tracking-wider">Black (AI)</p>
                  </div>
                </div>
              </div>

              {/* Live Strategic commentary */}
              <div className="rounded-2xl border border-[#c59b27]/25 bg-gradient-to-br from-[#2c170a]/40 via-black/40 to-[#2c170a]/40 p-4 space-y-2">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-[#ffd700] flex items-center gap-1.5">
                  <Brain className="w-3.5 h-3.5 text-amber-400" />
                  AI Tactical Thoughts
                </h3>
                <div className="min-h-[70px] flex flex-col justify-center select-text pt-1">
                  <p className="text-xs leading-relaxed text-amber-100/90 italic select-text selection:bg-amber-500/30">
                    &ldquo;{aiCommentary || "Analyzing board position..."}&rdquo;
                  </p>
                </div>
                <div className="flex items-center justify-between border-t border-[#c59b27]/20 pt-2 text-[9px] text-amber-400/60">
                  <span>Threat Score: {evalScore > 0 ? `White +${evalScore}` : `Black ${evalScore}`}</span>
                  <span>Reasoning Engine</span>
                </div>
              </div>

              {/* AI Difficulty selection */}
              <div className="space-y-2">
                <label className="text-[9px] font-black tracking-wider uppercase text-amber-500/70">Engine Settings</label>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-black/40 border border-[#c59b27]/20 rounded-xl">
                  {(["easy", "medium", "hard"] as const).map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setDifficulty(lvl)}
                      className={cn(
                        "py-1.5 rounded-lg text-[9px] font-black uppercase transition-all duration-200 cursor-pointer active:scale-95",
                        difficulty === lvl
                          ? "bg-[#c59b27] text-[#0d0703] shadow-md"
                          : "text-amber-100/60 hover:text-white hover:bg-white/5"
                      )}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
                <p className="text-[8px] text-amber-200/50 text-center font-bold">{getDifficultyLabel()}</p>
              </div>

              {/* View mode toggle */}
              <div className="space-y-2">
                <label className="text-[9px] font-black tracking-wider uppercase text-amber-500/70">Display Settings</label>
                <button
                  onClick={() => setIs3d(!is3d)}
                  className="w-full py-2.5 px-4 rounded-xl border border-[#c59b27]/30 bg-[#26150b]/40 hover:bg-[#c59b27]/10 text-[10px] font-black uppercase transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer text-amber-100"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{is3d ? "Switch to 2D Mode" : "Switch to 3D Mode"}</span>
                </button>
              </div>

              {/* Captured Trophies Panel */}
              <div className="space-y-2">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-[#ffd700] flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  Captured Trophies
                </h3>
                
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <p className="text-[8px] font-bold text-amber-400/70 uppercase tracking-widest">By AI:</p>
                    <div className="flex flex-wrap gap-0.5 min-h-[26px] p-1 rounded-lg bg-black/35 border border-[#c59b27]/15">
                      {capturedPieces.w.length === 0 ? (
                        <span className="text-[8px] text-amber-100/30 italic p-0.5">None</span>
                      ) : (
                        capturedPieces.w.map((p, idx) => (
                          <span key={idx} className="w-4 h-4 block text-amber-500 filter drop-shadow">
                            <PieceIcon type={p} color="w" />
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[8px] font-bold text-amber-400/70 uppercase tracking-widest">By Trung:</p>
                    <div className="flex flex-wrap gap-0.5 min-h-[26px] p-1 rounded-lg bg-black/35 border border-[#c59b27]/15">
                      {capturedPieces.b.length === 0 ? (
                        <span className="text-[8px] text-amber-100/30 italic p-0.5">None</span>
                      ) : (
                        capturedPieces.b.map((p, idx) => (
                          <span key={idx} className="w-4 h-4 block text-amber-900 filter drop-shadow">
                            <PieceIcon type={p} color="b" />
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Move history Chronicle */}
              <div className="space-y-2 flex-1 flex flex-col min-h-[140px]">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-[#ffd700] flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-amber-400" />
                  Chronicle of Moves
                </h3>

                <div className="flex-1 overflow-y-auto bg-black/40 border border-[#c59b27]/25 rounded-xl p-3 font-mono text-[11px] max-h-[160px]">
                  {moveHistory.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-amber-100/20 italic select-none">
                      Waiting for opening play...
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1 select-text">
                      {Array.from({ length: Math.ceil(moveHistory.length / 2) }).map((_, idx) => {
                        const whiteIdx = idx * 2;
                        const blackIdx = whiteIdx + 1;
                        return (
                          <React.Fragment key={idx}>
                            <div className="flex items-center gap-1.5 text-amber-100/80">
                              <span className="text-amber-100/30 text-[9px] w-5">{idx + 1}.</span>
                              <span className="font-bold text-[#ffd700]">{moveHistory[whiteIdx]}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-amber-100/80">
                              {moveHistory[blackIdx] ? (
                                <>
                                  <ChevronRight className="w-2.5 h-2.5 text-[#c59b27]/60" />
                                  <span className="font-bold text-amber-200">{moveHistory[blackIdx]}</span>
                                </>
                              ) : (
                                <span className="text-amber-500/50 animate-pulse text-[9px]">thinking...</span>
                              )}
                            </div>
                          </React.Fragment>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}

