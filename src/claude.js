import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function generateResponse(systemPrompt, userPrompt) {
  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  return response.content[0].text;
}
