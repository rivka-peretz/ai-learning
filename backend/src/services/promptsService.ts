import pool from "../db";
import OpenAI from "openai";
import { BadRequestError } from "../utils/errors";
import { config } from "../utils/config";

const openai = new OpenAI({
  apiKey: config.openAiApiKey,
  baseURL: "https://api.openai.com/v1",
});
interface CreatePromptParams {
  userId: number;
  categoryId: number | null;
  subCategoryId: number | null;
  prompt: string;
}

/**
 * יצירת פרומפט חדש + קריאה ל־OpenAI + שמירה במסד הנתונים
 */
export const createPrompt = async ({
  userId,
  categoryId,
  subCategoryId,
  prompt,
}: CreatePromptParams) => {
  if (!prompt.trim()) {
    throw new BadRequestError("Prompt text is required");
  }

  let aiResponseText = "";

  try {
    console.log("🚀 שולח בקשה ל־OpenAI עם הטקסט:", prompt);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an AI tutor that answers educational questions clearly, simply, and accurately.",
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 400,
      temperature: 0.7,
    });

    console.log(
      "✅ קיבלתי תשובה מ־OpenAI:",
      completion.choices[0]?.message?.content
    );

    aiResponseText = completion.choices[0]?.message?.content?.trim() || "";
  } catch (error: any) {
    console.error("⚠️ OpenAI API error:", {
      name: error.name,
      message: error.message,
      code: error.code,
      status: error.status,
    });

    aiResponseText =
      "⚠️ (Mock response) לא ניתן להתחבר ל־OpenAI כרגע. זו תשובה מדומה שנוצרה ל־demo.";
  }



  const result = await pool.query(
    `INSERT INTO prompts (user_id, category_id, sub_category_id, prompt, response)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, user_id, category_id, sub_category_id, prompt, response, created_at`,
    [userId, categoryId, subCategoryId, prompt, aiResponseText]
  );

  return result.rows[0];
};

/**
 * שליפת כל הפרומפטים עם הגבלת מספר לפי המשתמש
 */
export const listPrompts = async ({
  userId,
  limit = 20,
  offset = 0,
}: {
  userId?: number;
  limit?: number;
  offset?: number;
}) => {
  const query = userId
    ? `SELECT * FROM prompts WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`
    : `SELECT * FROM prompts ORDER BY created_at DESC LIMIT $1 OFFSET $2`;

  const values = userId
    ? [userId, limit, offset]
    : [limit, offset];

  const result = await pool.query(query, values);
  return result.rows;
};

export const listAllPromptsWithDetails = async () => {
  const query = `
    SELECT 
      p.id,
      p.user_id,
      p.category_id,
      p.sub_category_id,
      p.prompt,
      p.response,
      p.created_at,
      u.name as user_name,
      u.phone as user_phone,
      c.name as category_name,
      sc.name as sub_category_name
    FROM prompts p
    LEFT JOIN users u ON p.user_id = u.id
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN sub_categories sc ON p.sub_category_id = sc.id
    ORDER BY p.created_at DESC
  `;

  const result = await pool.query(query);
  return result.rows;
};

/**
 * שליפת פרומפט בודד לפי מזהה
 */
export const getPromptById = async (id: number) => {
  const result = await pool.query(
    `SELECT * FROM prompts WHERE id = $1`,
    [id]
  );
  return result.rows[0];
};
