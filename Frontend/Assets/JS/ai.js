export async function analyzeResumeWithAI(resumeText) {
  console.log("🧠 AI analysis started");
  console.log("📄 Resume length:", resumeText.length);

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a professional resume analyst.",
          },
          {
            role: "user",
            content: resumeText,
          },
        ],
      }),
    });

    console.log("📡 OpenAI response status:", response.status);

    const data = await response.json();
    console.log("📦 OpenAI raw response:", data);

    return {
      summary: data.choices?.[0]?.message?.content || "No response",
    };
  } catch (error) {
    console.error("❌ AI ERROR:", error);
    throw error;
  }
}
