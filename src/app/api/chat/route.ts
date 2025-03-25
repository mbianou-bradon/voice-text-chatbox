import OpenAI from "openai";

/** Creating a new OpenAI API client */
const openai = new OpenAI({
  apiKey: process.env.NEXT_APP_OPEN_AI_API_KEY,
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

    // console.log({ messages: messages, text: text, audio: base64Audio });

    const response = await openai.chat.completions.create({
      model: audio ? "gpt-4o-audio-preview" : "gpt-4o", // Use appropriate model for audio input
      audio: { voice: "alloy", format: "wav" },
      modalities: ["text", "audio"],
      messages: [
        {
          role: "system",
          content:
            "You are an AI assistant that helps users determine their AI score by asking a series of dynamically generated questions. Each question should be based on the user's previous answer, ensuring a logical progression. The AI should engage users effectively and maintain clarity in phrasing.",
        },
        {
          role: "user",
          content: text
            ? text
            : base64Audio
            ? [
                {
                  type: "input_audio",
                  input_audio: { data: base64Audio, format: "wav" },
                },
              ]
            : null,
        },
        ...messages,
      ].filter(Boolean),
      temperature: 1,
      store: true,
    });

    return new Response(response.choices[0]?.message?.content, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    // console.log("error message", error.message);
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
