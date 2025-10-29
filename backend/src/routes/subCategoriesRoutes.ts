import { Router } from "express";
import {
  listSubCategories,
  getSubCategory,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory
} from "../controllers/subCategoriesController";

const router = Router();

router.get("/", listSubCategories);
router.get("/:id", getSubCategory);
router.post("/", createSubCategory);
router.patch("/:id", updateSubCategory);
router.delete("/:id", deleteSubCategory);

export default router;
