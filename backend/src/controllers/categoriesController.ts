import { Request, Response } from "express";
import * as categoriesService from "../services/categoriesService";
import * as subCategoriesService from "../services/subCategoriesService";
import { handleControllerError } from "../utils/helpers";

export const listCategories = async (_req: Request, res: Response) => {
  try {
    const categories = await categoriesService.listCategories();
    res.json(categories);
  } catch (error) {
    console.error("❌ Error in listCategories:", error); // <–– הדפסה למסוף
    res.status(500).json({ error: "Internal server error" });
  }
};


export const getCategory = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "Invalid category id" });
    }

    const category = await categoriesService.getCategoryById(id);
    res.json(category);
  } catch (error) {
    handleControllerError(res, error);
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const category = await categoriesService.createCategory(
      (req.body?.name as string) ?? ""
    );
    res.status(201).json(category);
  } catch (error) {
    handleControllerError(res, error);
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "Invalid category id" });
    }

    const category = await categoriesService.updateCategory(
      id,
      (req.body?.name as string) ?? ""
    );
    res.json(category);
  } catch (error) {
    handleControllerError(res, error);
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "Invalid category id" });
    }

    await categoriesService.deleteCategory(id);
    res.status(204).send();
  } catch (error) {
    handleControllerError(res, error);
  }
};

export const listCategorySubCategories = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "Invalid category id" });
    }

    const subCategories = await subCategoriesService.listSubCategories({
      categoryId: id
    });
    res.json(subCategories);
  } catch (error) {
    handleControllerError(res, error);
  }
};
