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
Return ONLY valid JSON. No markdown. No explanations.

Format:
{
  "skills": ["skill1", "skill2"],
  "recommendations": ["rec1", "rec2"],
  "careers": ["career1", "career2"]
}

Resume text:
${text}
`;

    const result = await model.generateContent(prompt);
    const raw = result.response.text().trim();

    // HARD SAFETY CHECK
    if (!raw.startsWith("{") || !raw.endsWith("}")) {
      console.error("Invalid AI response:", raw);
      return res.status(500).json({ error: "AI returned invalid JSON" });
    }

    const parsed = JSON.parse(raw);
    return res.status(200).json(parsed);
  } catch (err) {
    console.error("Analyze error:", err);
    return res.status(500).json({ error: "AI analysis failed" });
  }
}
