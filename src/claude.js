import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.XAI_API_KEY,
  baseURL: "https://api.x.ai/v1",
});

export async function generateResponse(systemPrompt, userPrompt) {
  const response = await client.chat.completions.create({
    model: "grok-4",
    max_tokens: 1024,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  return response.choices[0].message.content;
}
