import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "A non-empty message is required." },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not configured." },
        { status: 500 }
      );
    }

    const res = await client.responses.create({
      model: "gpt-4.1-mini",
      input: `
You are a cinematic Dungeon Master.

Rules:
- Describe scenes vividly
- Track story continuity
- Create NPCs, quests, combat
- Match fantasy or TV show tone
- Stay consistent with lore

Player action:
${message}
      `,
    });

    const reply =
      typeof res.output_text === "string"
        ? res.output_text
        : Array.isArray(res.output)
        ? res.output
            .map((item) =>
              item?.content
                ?.map((block) => block?.text ?? "")
                .join("")
            )
            .join("")
        : "";

    return NextResponse.json({ reply }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "OpenAI request failed.", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
