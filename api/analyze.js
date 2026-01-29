import OpenAI from "openai";

const openai = new OpenAI({
  apiKey:
    process.env.sk -
    proj -
    tIr8bdWYFVuVG8Kc2Z8Ra8KUgd0U -
    OhlY3ADLnesokgn3bPIt3f3vZM0pM7NrvBWOkklfz3aA8T3BlbkFJaqlbHAe25DlWkK7p7ObbsdelDNvLrecPqWDQiIrbebCQjXHl4sk19RNNgOjLwPsh6SEwENbIQA,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { text } = req.body;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a resume analysis assistant." },
        { role: "user", content: text },
      ],
      temperature: 0.7,
    });

    const analysis = {
      skills: ["HTML", "CSS", "JS"], // extract from AI output ideally
      recommendations: ["Learn React"],
      careers: ["Frontend Developer"],
    };

    return res.status(200).json(analysis);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "AI request failed" });
  }
}
