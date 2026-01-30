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

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
Analyze this resume and return JSON ONLY in this format:

{
  "skills": [],
  "recommendations": [],
  "careers": []
}

Resume:
${text}
`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    const json = response.match(/\{[\s\S]*\}/)[0];

    return res.status(200).json(JSON.parse(json));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "AI analysis failed" });
  }
}
