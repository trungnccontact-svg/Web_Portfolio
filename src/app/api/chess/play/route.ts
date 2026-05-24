import { NextRequest, NextResponse } from "next/server";
import { Chess } from "chess.js";
import { findBestMove } from "@/lib/chess-engine";
import { callAIWithFallback } from "@/lib/ai-fallback";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fen, difficulty, history = [], lessons = [] } = body;

    if (!fen) {
      return NextResponse.json({ error: "Missing FEN string" }, { status: 400 });
    }

    // 1. Initialize chess instance and validate FEN
    let chess;
    try {
      chess = new Chess(fen);
    } catch (e) {
      return NextResponse.json({ error: "Invalid FEN string" }, { status: 400 });
    }

    if (chess.isGameOver()) {
      return NextResponse.json({ error: "Game is already over" }, { status: 400 });
    }

    // 2. Compute local minimax best move as the ultimate legal fallback
    const depth = difficulty === "easy" ? 1 : difficulty === "medium" ? 2 : 3;
    const { bestMoveSan, evalScore } = findBestMove(fen, depth);

    // 3. Craft system prompt and user query for OpenRouter
    const historicalMoves = history.slice(-10).join(", ");
    const accumulatedLessons = lessons.length > 0 
      ? `Lessons learned from previous defeats against Nguyen Chi Trung:\n${lessons.map((l: string, i: number) => ` - ${l}`).join("\n")}`
      : "No previous defeats recorded yet. Analyze Trung's playing style closely!";

    const systemPrompt = `You are a Grandmaster Chess AI playing Black against a human named "Nguyen Chi Trung" (White).
You must analyze the current game state and output your next move in Standard Algebraic Notation (SAN), along with a clever, strategical, and slightly taunting strategic commentary.

CRITICAL RULES:
1. You must respond ONLY with a valid JSON object. No explanations or wrapping before or after the JSON.
2. The JSON object must contain exactly two fields:
   - "move": A string representing your next legal chess move in SAN (e.g. "e5", "Nf3", "O-O", "Qh4+").
   - "commentary": A creative, high-fidelity commentary or taunt (1-3 sentences) detailing the tactics behind your move, addressing "Trung" directly.
3. Every move you suggest must be 100% LEGAL in the current FEN state.
4. Integrate the historical context and the lessons learned to play smarter and taunt Trung dynamically!

${accumulatedLessons}

EXAMPLE JSON OUTPUT format:
{
  "move": "e5",
  "commentary": "Ah, starting with the classic e4, Trung? Standard. I'll meet you in the center with e5. Let's see if your middle game is as solid as your opening."
}`;

    const userMessage = `Current Board FEN: ${fen}
Difficulty Level: ${difficulty} (Minimax Depth: ${depth})
Recent Moves History: [${historicalMoves}]
Your legal fallback move is: "${bestMoveSan}" (Static Evaluation: ${evalScore})

Please choose a legal chess move (feel free to use the fallback "${bestMoveSan}" or make your own legal choice) and provide your tactical commentary.`;

    let aiResponse;
    let selectedMove = bestMoveSan;
    let selectedCommentary = `I have played ${bestMoveSan}. The evaluation stands at ${evalScore}. Let's see your next move, Trung!`;
    let usedModel = "minimax_local";

    try {
      // Get AI response using the fallback pool rotation
      const responseStr = await callAIWithFallback({
        systemPrompt,
        userMessage,
        rawText: false, // Ensure JSON mode / validation
        preferredModel: "deepseek/deepseek-v4-flash:free"
      });

      const parsed = JSON.parse(responseStr);
      const suggestedMove = parsed.move;
      const commentary = parsed.commentary;

      if (suggestedMove && typeof suggestedMove === "string") {
        // Validate if the suggested move is legal
        const legalMoves = chess.moves();
        const cleanSuggested = suggestedMove.trim();

        // Check exact match or try to find a matching legal move
        const isLegal = legalMoves.some(
          m => m === cleanSuggested || 
               m.toLowerCase() === cleanSuggested.toLowerCase() ||
               m.replace(/[\+#]/g, "") === cleanSuggested.replace(/[\+#]/g, "")
        );

        if (isLegal) {
          // If it matches case-insensitively or minor differences, find the exact SAN
          const matchingLegal = legalMoves.find(
            m => m === cleanSuggested || 
                 m.toLowerCase() === cleanSuggested.toLowerCase() ||
                 m.replace(/[\+#]/g, "") === cleanSuggested.replace(/[\+#]/g, "")
          );
          selectedMove = matchingLegal || cleanSuggested;
          selectedCommentary = commentary || selectedCommentary;
          usedModel = "openrouter_hybrid";
        } else {
          console.warn(`[Chess AI] OpenRouter suggested ILLEGAL move: "${suggestedMove}". Falling back to minimax: "${bestMoveSan}"`);
          // We still use the commentary but apply it to the fallback move
          selectedMove = bestMoveSan;
          selectedCommentary = `[Tactical Correction] I originally wanted to play something else, but instead, I'm playing ${bestMoveSan}. ${commentary || ""}`;
        }
      }
    } catch (aiErr: any) {
      console.warn("[Chess AI] OpenRouter rotation failed or rate-limited. Falling back to local minimax.", aiErr.message);
      // Minimax fallback already set
    }

    return NextResponse.json({
      success: true,
      move: selectedMove,
      commentary: selectedCommentary,
      evalScore,
      modelUsed: usedModel
    });

  } catch (error: any) {
    console.error("[Chess API] Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
