import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import usersRoutes from "./routes/usersRoutes";
import categoriesRoutes from "./routes/categoriesRoutes";
import subCategoriesRoutes from "./routes/subCategoriesRoutes";
import promptsRoutes from "./routes/promptsRoutes";
import { config } from "./utils/config";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ status: "ok", message: "AI Learning Platform backend is running" });
});

app.use("/api/users", usersRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/sub-categories", subCategoriesRoutes);
app.use("/api/prompts", promptsRoutes);

app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

const start = () => {
  app.listen(config.port, () => {
    console.log(`✅ Server ready on port ${config.port}`);
  });
};

start();
