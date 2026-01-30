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

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    const prompt = `
You are an ATS resume analyzer.

Return ONLY valid JSON in the exact format below.
Do NOT add explanations, markdown, or extra text.

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

    // 🔒 SAFELY extract JSON
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");

    if (start === -1 || end === -1) {
      throw new Error("Invalid AI response format");
    }

    const jsonString = raw.substring(start, end + 1);
    const parsed = JSON.parse(jsonString);

    return res.status(200).json(parsed);
  } catch (error) {
    console.error("ANALYZE ERROR:", error);
    return res.status(500).json({ error: "AI analysis failed" });
  }
}
