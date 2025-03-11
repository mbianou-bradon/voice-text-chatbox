import OpenAI from "openai";
import { OpenAIStream, StreamingTextResponse } from "ai";

/** Creating a new OpenAI API client */
const openai = new OpenAI({
  apiKey: process.env.NEXT_APP_OPEN_AI_API_KEY || "",
});

export const runtime = "edge";

export async function POST(req: Request, res: Response) {
  const { messages } = await req.json();

  // const audioResponse = await fetch(url);
  // const buffer = await audioResponse.arrayBuffer();
  // const base64str = Buffer.from(buffer).toString("base64");

  const response = await openai.chat.completions.create({
    model: "gpt-4o-audio-preview",
    modalities: ["text", "audio"],
    audio: { voice: "alloy", format: "wav" },
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: "What is in this recording?" },
          {
            type: "input_audio",
            input_audio: { data: base64str, format: "wav" },
          },
        ],
      },
      ...messages,
    ],
    store: true,
    stream: true,
    temperature: 1,
  });

  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);
}
