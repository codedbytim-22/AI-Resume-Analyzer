import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "No resume text provided" });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "Missing API key" });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
Return ONLY valid JSON. No text. No markdown.

{
  "skills": [],
  "recommendations": [],
  "careers": []
}

Resume:
${text}
`;

    const result = await model.generateContent(prompt);
    const raw = result.response.text();

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return res.status(500).json({
        error: "Invalid JSON from AI",
        raw,
      });
    }

    return res.status(200).json(parsed);
  } catch (err) {
    console.error("ANALYZE ERROR:", err);
    return res.status(500).json({ error: "AI analysis failed" });
  }
}
