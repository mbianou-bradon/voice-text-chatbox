import OpenAI from "openai";
// import { OpenAIStream, StreamingTextResponse } from "ai";

/** Creating a new OpenAI API client */
const openai = new OpenAI({
  apiKey: process.env.NEXT_APP_OPEN_AI_API_KEY || "",
});

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { messages, text, audio } = await req.json();

    let base64Audio = "";
    if (audio) {
      // Ensure the audio is a base64 string
      base64Audio = audio.startsWith("data:") ? audio.split(",")[1] : audio;
    }

    console.log({ messages: messages, text: text, audio: base64Audio });

    const response = await openai.chat.completions.create({
      model: "gpt-4o-audio-preview",
      modalities: ["text", "audio"],
      audio: { voice: "alloy", format: "pcm16" },
      messages: [
        {
          role: "system",
          content: [
            {
              type: "text",
              text: "You are an AI assistant that helps users determine their AI score by asking a series of dynamically generated questions. Each question should be based on the user's previous answer, ensuring a logical progression. The AI should engage users effectively and maintain clarity in phrasing.",
            },
          ],
        },
        {
          role: "user",
          content: [
            text ? { type: "text", text } : null,
            base64Audio
              ? {
                  type: "input_audio",
                  input_audio: { data: base64Audio, format: "wav" },
                }
              : null,
          ].filter(Boolean),
        },
        ...messages,
      ],
      store: true,
      stream: true,
      temperature: 1,
    });

    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of response) {
          controller.enqueue(
            new TextEncoder().encode(chunk.choices[0]?.delta?.content || "")
          );
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error: unknown) {
    let errorMessage = "An unexpected error occurred.";

    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
