import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("Missing GEMINI_API_KEY");
    }

    const { text } = req.body;

    if (!text || text.length < 50) {
      return res.status(400).json({ error: "Invalid resume text" });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
Return ONLY valid JSON in this exact format:

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
    if (!match) throw new Error("AI did not return JSON");

    return res.status(200).json(JSON.parse(match[0]));
  } catch (err) {
    console.error("AI ERROR:", err);
    return res.status(500).json({ error: "AI analysis failed" });
  }
}
