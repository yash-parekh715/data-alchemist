import { NextRequest } from "next/server";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

export const dynamic = "force-dynamic";

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-pro";

export async function POST(req: NextRequest) {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "Missing GOOGLE_API_KEY" }), {
      status: 400,
    });
  }

  const { task, text, schema } = (await req.json()) as {
    task: "nlToDsl" | "nlToRule";
    text: string;
    schema?: any;
  };

  const genAI = new GoogleGenerativeAI(apiKey);

  const responseSchema: any =
    task === "nlToDsl"
      ? {
          type: SchemaType.OBJECT,
          properties: { dsl: { type: SchemaType.STRING } },
          required: ["dsl"],
        }
      : {
          type: SchemaType.OBJECT,
          properties: {
            rule: {
              type: SchemaType.OBJECT,
              properties: {
                type: {
                  type: SchemaType.STRING,
                  enum: [
                    "coRun",
                    "slotRestriction",
                    "loadLimit",
                    "phaseWindow",
                    "patternMatch",
                    "precedenceOverride",
                  ],
                },
                tasks: {
                  type: SchemaType.ARRAY,
                  items: { type: SchemaType.STRING },
                },
                workerGroup: { type: SchemaType.STRING },
                maxSlotsPerPhase: { type: SchemaType.NUMBER },
                taskId: { type: SchemaType.STRING },
                phases: {
                  type: SchemaType.ARRAY,
                  items: { type: SchemaType.NUMBER },
                },
                regex: { type: SchemaType.STRING },
                template: { type: SchemaType.STRING },
                priority: { type: SchemaType.NUMBER },
                enabled: { type: SchemaType.BOOLEAN },
              },
              required: ["type"],
              // additionalProperties is not supported by Gemini responseSchema → removed
            },
          },
          required: ["rule"],
        };

  const systemInstruction =
    task === "nlToDsl"
      ? "Translate the user query into a tiny, auditable DSL using only: includes(field,value), numeric comparisons (>, <, >=, <=, ==) on numeric fields, and AND/OR. Return JSON { dsl: string }."
      : "Produce a strict JSON object { rule: <Rule> } matching the provided union types. No prose or comments.";

  const model = genAI.getGenerativeModel({
    model: MODEL,
    systemInstruction,
    generationConfig: {
      temperature: 0,
      responseMimeType: "application/json",
      responseSchema,
    },
  });

  const prompt = { text, schema: schema ?? {} };
  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: JSON.stringify(prompt) }] }],
  });

  const textOut = result.response.text() || "{}";
  return new Response(textOut, {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
