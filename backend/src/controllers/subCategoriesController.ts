import { Request, Response } from "express";
import * as subCategoriesService from "../services/subCategoriesService";
import { handleControllerError } from "../utils/helpers";

export const listSubCategories = async (req: Request, res: Response) => {
  try {
    let categoryId: number | undefined;
    if (req.query.categoryId !== undefined) {
      const parsed = Number(req.query.categoryId);
      if (!Number.isInteger(parsed) || parsed <= 0) {
        return res.status(400).json({ error: "Invalid category id" });
      }
      categoryId = parsed;
    }

    const subCategories = await subCategoriesService.listSubCategories({
      categoryId
    });
    res.json(subCategories);
  } catch (error) {
    handleControllerError(res, error);
  }
};

export const getSubCategory = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "Invalid sub-category id" });
    }

    const subCategory = await subCategoriesService.getSubCategoryById(id);
    res.json(subCategory);
  } catch (error) {
    handleControllerError(res, error);
  }
};

export const createSubCategory = async (req: Request, res: Response) => {
  try {
    const name = (req.body?.name as string) ?? "";
    const categoryId = Number(req.body?.category_id);

    if (!Number.isInteger(categoryId) || categoryId <= 0) {
      return res.status(400).json({ error: "category_id must be a positive number" });
    }

    const subCategory = await subCategoriesService.createSubCategory(name, categoryId);
    res.status(201).json(subCategory);
  } catch (error) {
    handleControllerError(res, error);
  }
};

export const updateSubCategory = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "Invalid sub-category id" });
    }

    const name = (req.body?.name as string) ?? "";
    const categoryId = Number(req.body?.category_id);
    if (!Number.isInteger(categoryId) || categoryId <= 0) {
      return res.status(400).json({ error: "category_id must be a positive number" });
    }

    const subCategory = await subCategoriesService.updateSubCategory(id, name, categoryId);
    res.json(subCategory);
  } catch (error) {
    handleControllerError(res, error);
  }
};

export const deleteSubCategory = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "Invalid sub-category id" });
    }

    await subCategoriesService.deleteSubCategory(id);
    res.status(204).send();
  } catch (error) {
    handleControllerError(res, error);
  }
};
