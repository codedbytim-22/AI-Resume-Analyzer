import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { text } = req.body;

    if (!text || text.length < 50) {
      return res.status(400).json({ error: "Invalid resume text" });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "Missing API key" });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
Return ONLY valid JSON. No markdown. No explanation.

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

    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error("No JSON returned from AI");
    }

    const parsed = JSON.parse(match[0]);
    return res.status(200).json(parsed);
  } catch (error) {
    console.error("AI ERROR:", error);
    return res.status(500).json({ error: "AI analysis failed" });
  }
}
