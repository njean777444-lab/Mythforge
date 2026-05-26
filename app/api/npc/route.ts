import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { archetype, setting } = await request.json();

    if (!archetype || typeof archetype !== "string") {
      return NextResponse.json(
        { error: "A non-empty archetype is required." },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not configured." },
        { status: 500 }
      );
    }

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: `
You are an expert RPG creator.

Generate a memorable NPC based on this archetype:
- Archetype: ${archetype}
${setting ? `- Setting: ${setting}` : ""}

Include:
- name
- role
- personality
- goals
- appearance
- a twist or secret
- suggested quest hook
      `,
    });

    const npc =
      typeof response.output_text === "string"
        ? response.output_text
        : Array.isArray(response.output)
        ? response.output
            .map((item) =>
              item?.content
                ?.map((block) => block?.text ?? "")
                .join("")
            )
            .join("")
        : "";

    return NextResponse.json({ npc }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to generate NPC.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
