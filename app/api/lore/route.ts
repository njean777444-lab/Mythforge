import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { franchise } = await request.json();

    if (!franchise || typeof franchise !== "string") {
      return NextResponse.json(
        { error: "A non-empty franchise is required." },
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
      tools: [{ type: "web_search_preview" }],
      input: `
Research this fictional universe:
${franchise}

Extract:
- characters
- locations
- factions
- tone
- lore rules

Then summarize it into a RPG campaign setting.
      `,
    });

    const lore =
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

    return NextResponse.json({ lore }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to generate lore.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
