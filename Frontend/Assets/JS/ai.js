// Assets/JS/ai.js

export async function analyzeResumeWithAI(resumeText) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer YOUR_OPENAI_API_KEY",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a professional resume analyzer. Return ONLY valid JSON.",
        },
        {
          role: "user",
          content: `
Analyze this resume and return JSON ONLY in this format:

{
  "skills": [],
  "recommendations": [],
  "careers": []
}

Resume:
${resumeText}
`,
        },
      ],
      temperature: 0.3,
    }),
  });

  const data = await response.json();

  try {
    return JSON.parse(data.choices[0].message.content);
  } catch (err) {
    console.error("AI JSON parsing failed:", err);
    throw new Error("AI returned invalid response.");
  }
}
sk -
  proj -
  V6 -
  AZI8J1rj9nhsPWCI9f0_RBygjyM9bpzAaI7BtTv9BrMH0RncnI1e8cyP0FBfCjWp4BOIwu4T3BlbkFJZQP8Dhdjfk7hmDJ82JrYcaz0VBFTcxZeJqtHkIkQQXg1j4W -
  AOG -
  hfrVIWGAxxpcns7FgOzSIA;
