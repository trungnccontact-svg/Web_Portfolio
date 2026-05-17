export async function callOpenRouter(systemPrompt: string, userMessage: string, model: string = "openrouter/free") {
  const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
  
  if (!apiKey) {
    throw new Error("Missing OpenRouter API Key");
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ]
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || "Failed to call OpenRouter API");
  }

  const data = await response.json();
  let content = data.choices[0]?.message?.content || "";
  
  // 1. Try to extract from markdown code fences first
  const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (jsonMatch) {
    content = jsonMatch[1];
  } else {
    // 2. Fallback: Extract from the first { or [ to the last } or ]
    const firstBrace = content.indexOf('{');
    const firstBracket = content.indexOf('[');
    const lastBrace = content.lastIndexOf('}');
    const lastBracket = content.lastIndexOf(']');

    const firstValidIdx = Math.min(
      firstBrace === -1 ? Infinity : firstBrace,
      firstBracket === -1 ? Infinity : firstBracket
    );
    const lastValidIdx = Math.max(lastBrace, lastBracket);

    if (firstValidIdx !== Infinity && lastValidIdx !== -1) {
      content = content.substring(firstValidIdx, lastValidIdx + 1);
    }
  }

  return content;
}
