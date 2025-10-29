import { Router } from "express";
import {
  listUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  loginUser, // ✅ תוודאי שזה פה
} from "../controllers/usersController";

const router = Router();

router.get("/", listUsers);
router.get("/:id", getUser);
router.post("/", createUser);
router.post("/login", loginUser); // ✅ שורה חשובה מאוד!
router.patch("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;
