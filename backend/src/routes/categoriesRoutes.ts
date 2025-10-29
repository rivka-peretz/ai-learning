import { Router } from "express";
import {
  listCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  listCategorySubCategories
} from "../controllers/categoriesController";

const router = Router();

router.get("/", listCategories);
router.get("/:id", getCategory);
router.get("/:id/sub-categories", listCategorySubCategories);
router.post("/", createCategory);
router.patch("/:id", updateCategory);
router.delete("/:id", deleteCategory);

export default router;
