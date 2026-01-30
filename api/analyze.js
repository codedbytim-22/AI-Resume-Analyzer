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

    // Check if API key exists
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY not set!");
      // TEMP fallback response for testing
      return res.status(200).json({
        skills: ["JavaScript", "HTML", "CSS"],
        recommendations: ["Improve formatting", "Add projects"],
        careers: ["Frontend Developer", "Web Developer"],
      });
    }

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
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

    // Call Gemini
    const result = await model.generateContent(prompt);

    // Some safety checks
    const rawResponse = result?.response?.text?.() || "";
    const match = rawResponse.match(/\{[\s\S]*\}/);
    if (!match) {
      console.error("AI returned invalid JSON:", rawResponse);
      return res.status(500).json({
        error: "AI returned invalid response",
        raw: rawResponse,
      });
    }

    const json = JSON.parse(match[0]);
    return res.status(200).json(json);
  } catch (error) {
    console.error("AI analyze error:", error);
    // Return fallback response if AI fails
    return res.status(200).json({
      skills: ["JavaScript", "HTML", "CSS"],
      recommendations: ["Improve formatting", "Add projects"],
      careers: ["Frontend Developer", "Web Developer"],
    });
  }
}
