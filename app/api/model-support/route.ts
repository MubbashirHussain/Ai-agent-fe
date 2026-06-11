import { NextRequest } from "next/server";
import { getModelCapabilities } from "../services/modelSupport";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const model = searchParams.get("model") || process.env.MODEL;
  const apiKey = process.env.OPENROUTER_API_KEY || "";

  if (!model) {
    return Response.json(
      {
        error:
          "Model identifier is required as query parameter 'model' or via env variable MODEL.",
      },
      { status: 400 },
    );
  }

  try {
    const caps = await getModelCapabilities(model, apiKey);
    if (!caps) {
      return Response.json(
        { error: `Model ${model} not found` },
        { status: 404 },
      );
    }

    return Response.json({
      model: caps.model,
      supportsImageInput: caps.supportsImageInput,
      supportsStreaming: caps.supportsStreaming,
      supportsTools: caps.supportsTools,
      supportsTextInput: caps.supportsTextInput,
      contextLength: caps.contextLength,
      provider: caps.provider,
      architecture: caps.architecture,
      inputModalities: caps.inputModalities,
      outputModalities: caps.outputModalities,
      checkedAt: caps.checkedAt,
    });
  } catch (err: any) {
    console.error("[ModelSupport] Error fetching capabilities:", err);
    return Response.json(
      { error: err?.message ?? "Internal server error" },
      { status: 500 },
    );
  }
}
