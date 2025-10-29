import { Request, Response } from "express";
import * as promptsService from "../services/promptsService";
import { handleControllerError, parsePagination } from "../utils/helpers";

/**
 * Create a new prompt and send it to OpenAI for processing
 * Validates required fields and category/subcategory relationships
 */
export const createPrompt = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate user ID
    const userId = Number(req.body?.user_id);
    if (!Number.isInteger(userId) || userId <= 0) {
      res.status(400).json({ error: "user_id must be a positive number" });
      return;
    }

    // Validate category ID (optional)
    const categoryId =
      req.body?.category_id !== undefined ? Number(req.body.category_id) : null;
    if (categoryId !== null && (!Number.isInteger(categoryId) || categoryId <= 0)) {
      res.status(400).json({ error: "category_id must be a positive number" });
      return;
    }

    // Validate subcategory ID (optional)
    const subCategoryId =
      req.body?.sub_category_id !== undefined ? Number(req.body.sub_category_id) : null;
    if (
      subCategoryId !== null &&
      (!Number.isInteger(subCategoryId) || subCategoryId <= 0)
    ) {
      res.status(400).json({ error: "sub_category_id must be a positive number" });
      return;
    }

    const prompt = await promptsService.createPrompt({
      userId,
      categoryId,
      subCategoryId,
      prompt: (req.body?.prompt as string) ?? ""
    });

    res.status(201).json(prompt);
  } catch (error) {
    console.error("❌ Error in createPrompt:", error);
    handleControllerError(res, error);
  }
};

/**
 * List prompts with optional pagination and user filtering
 */
export const listPrompts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { limit, offset } = parsePagination(req, { defaultLimit: 20, maxLimit: 50 });

    let userId: number | undefined;
    if (req.query.userId !== undefined) {
      const parsed = Number(req.query.userId);
      if (!Number.isInteger(parsed) || parsed <= 0) {
        res.status(400).json({ error: "Invalid user id" });
        return;
      }
      userId = parsed;
    }

    const prompts = await promptsService.listPrompts({ userId, limit, offset });
    res.json(prompts);
  } catch (error) {
    handleControllerError(res, error);
  }
};

/**
 * List all prompts with detailed user and category information
 * Used by admin dashboard for comprehensive system overview
 */
export const listAllPromptsWithDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const prompts = await promptsService.listAllPromptsWithDetails();
    res.json(prompts);
  } catch (error) {
    handleControllerError(res, error);
  }
};

/**
 * Get a specific prompt by ID
 */
export const getPrompt = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ error: "Invalid prompt id" });
      return;
    }

    const prompt = await promptsService.getPromptById(id);
    res.json(prompt);
  } catch (error) {
    handleControllerError(res, error);
  }
};
