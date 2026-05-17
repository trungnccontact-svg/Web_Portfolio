export async function searchRealJobs(query: string) {
  const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_SEARCH_KEY;
  const CX = process.env.NEXT_PUBLIC_GOOGLE_CX;
  
  if (!API_KEY || !CX) {
    throw new Error("Missing Google Search API Key or CX Engine ID. Vui lòng thêm NEXT_PUBLIC_GOOGLE_SEARCH_KEY và NEXT_PUBLIC_GOOGLE_CX vào .env.local");
  }

  const url = `https://www.googleapis.com/customsearch/v1?key=${API_KEY}&cx=${CX}&q=${encodeURIComponent(query)}&num=10`;
  const res = await fetch(url);
  const data = await res.json();
  
  if (data.error) {
    throw new Error(data.error.message || "Google Custom Search API error");
  }

  return data.items || [];
}
