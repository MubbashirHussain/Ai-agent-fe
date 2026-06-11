import { NextRequest } from "next/server";
import { OpenAI } from "openai";

const defaultOpenai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL:
    process.env.OPENAI_API_BASE_URL || "https://openrouter.ai/api/v1",
});

export async function POST(req: NextRequest) {
  const { prompt, customApiKey, customBaseUrl, customModel, imageBase64 } =
    await req.json();

  if (!prompt || typeof prompt !== "string") {
    return Response.json(
      { error: "A valid prompt string is required." },
      { status: 400 },
    );
  }

  // Use custom client if overrides provided, otherwise default
  let activeOpenai = defaultOpenai;
  if (customApiKey || customBaseUrl) {
    activeOpenai = new OpenAI({
      apiKey: customApiKey || process.env.OPENROUTER_API_KEY,
      baseURL: customBaseUrl || process.env.OPENAI_API_BASE_URL,
    });
  }

  const model = customModel || process.env.MODEL;
  console.log(`Generating output using model: ${model}`);

  const abortController = new AbortController();

  // Build message content — supports multimodal if imageBase64 provided
  let messageContent: any = prompt;
  if (imageBase64) {
    messageContent = [
      { type: "text", text: prompt },
      { type: "image_url", image_url: { url: imageBase64 } },
    ];
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const openaiStream =
          await activeOpenai.chat.completions.create(
            {
              model: model!,
              messages: [{ role: "user", content: messageContent }],
              stream: true,
            },
            { signal: abortController.signal },
          ) as AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>;

        let finalText = "";

        for await (const chunk of openaiStream) {
          const delta = chunk?.choices?.[0]?.delta?.content || "";
          if (delta) {
            finalText += delta;
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ text: delta })}\n\n`,
              ),
            );
          }
        }

        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              final: finalText || "No textual description generated.",
            })}\n\n`,
          ),
        );
        controller.close();
      } catch (error: any) {
        const errMsg =
          error?.response?.data?.error ||
          error.message ||
          "An error occurred during generation.";
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ error: errMsg })}\n\n`,
          ),
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
