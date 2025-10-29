import { config } from "../utils/config";
import { ServiceUnavailableError } from "../utils/errors";

export interface LessonRequest {
  prompt: string;
  topic?: string;
  userName?: string;
  categoryName?: string | null;
  subCategoryName?: string | null;
}

const buildPrompt = (input: LessonRequest) => {
  const parts = [
    `Create a concise learning session for the following prompt: "${input.prompt}".`,
    "The response should include:",
    "- a short introduction (2 sentences max)",
    "- 3-4 bullet points covering the core ideas",
    "- an actionable exercise to practice the material",
    "- a reflective question at the end"
  ];

  if (input.userName) {
    parts.unshift(`The learner's name is ${input.userName}.`);
  }

  if (input.topic) {
    parts.unshift(`The learner is interested in ${input.topic}.`);
  }

  if (input.categoryName) {
    parts.push(`Category of interest: ${input.categoryName}.`);
  }

  if (input.subCategoryName) {
    parts.push(`Sub-category of interest: ${input.subCategoryName}.`);
  }

  return parts.join("\n");
};

const buildFallback = (input: LessonRequest) => {
  const subject = input.topic ?? input.categoryName ?? "the requested topic";
  return [
    `Intro: Here's a quick overview about ${subject}.`,
    "",
    "Key Takeaways:",
    "- Core concept #1",
    "- Core concept #2",
    "- Core concept #3",
    "",
    "Try this: Write a short paragraph explaining the most surprising fact you learned.",
    "",
    "Reflect: Which part of the topic feels unclear and why?"
  ].join("\n");
};

export const generateLesson = async (input: LessonRequest): Promise<string> => {
  if (!config.openAiApiKey) {
    return buildFallback(input);
  }

  const completionRequest = {
    model: config.openAiModel,
    messages: [
      {
        role: "system",
        content: "You are a concise learning coach that produces structured mini-lessons."
      },
      {
        role: "user",
        content: buildPrompt(input)
      }
    ],
    temperature: 0.7,
    max_tokens: 600
  };

  try {
    const response = await fetch(`${config.openAiBaseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.openAiApiKey}`
      },
      body: JSON.stringify(completionRequest)
    });

    if (!response.ok) {
      const errorPayload = await response.json().catch(() => null);
      throw new ServiceUnavailableError("Failed to generate lesson from OpenAI", {
        status: response.status,
        body: errorPayload
      });
    }

    const data = await response.json();
    const choice = data?.choices?.[0]?.message?.content;
    return typeof choice === "string" && choice.trim() ? choice.trim() : buildFallback(input);
  } catch (error) {
    if (error instanceof ServiceUnavailableError) {
      throw error;
    }

    console.error("generateLesson error:", error);
    throw new ServiceUnavailableError("Lesson generation is temporarily unavailable.");
  }
};

