import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { theme } = await request.json();

    if (!theme || typeof theme !== "string") {
      return NextResponse.json(
        { error: "A non-empty theme is required." },
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
Describe a detailed fantasy map for:
${theme}

Include:
- towns
- forests
- dungeons
- castles
- atmosphere
- geography layout

Make it usable for a D&D campaign.
      `,
    });

    const map =
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

    return NextResponse.json({ map }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to generate map description.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
