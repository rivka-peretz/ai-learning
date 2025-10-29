import pool from "../db";
import { Category } from "../models";
import { BadRequestError, ConflictError, NotFoundError } from "../utils/errors";

const mapRowToCategory = (row: Record<string, unknown>): Category => ({
  id: row.id as number,
  name: row.name as string,
  created_at: row.created_at as Date,
  updated_at: row.updated_at as Date
});

export const listCategories = async (): Promise<Category[]> => {
  const result = await pool.query(
    `SELECT id, name FROM categories ORDER BY name ASC`
  );
  return result.rows.map((row) => ({
    id: row.id,
    name: row.name,
  }));
};


export const getCategoryById = async (id: number): Promise<Category> => {
  const result = await pool.query(
    `SELECT id, name, created_at, updated_at
     FROM categories
     WHERE id = $1`,
    [id]
  );

  if (result.rowCount === 0) {
    throw new NotFoundError("Category not found");
  }

  return mapRowToCategory(result.rows[0]);
};

export const createCategory = async (name: string): Promise<Category> => {
  const trimmedName = name.trim();
  if (!trimmedName) {
    throw new BadRequestError("Category name is required");
  }

  try {
    const result = await pool.query(
      `INSERT INTO categories (name)
       VALUES ($1)
       RETURNING id, name, created_at, updated_at`,
      [trimmedName]
    );
    return mapRowToCategory(result.rows[0]);
  } catch (error: any) {
    if (error?.code === "23505") {
      throw new ConflictError("Category name already exists");
    }
    throw error;
  }
};

export const updateCategory = async (id: number, name: string): Promise<Category> => {
  const trimmedName = name.trim();
  if (!trimmedName) {
    throw new BadRequestError("Category name cannot be empty");
  }

  try {
    const result = await pool.query(
      `UPDATE categories
       SET name = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING id, name, created_at, updated_at`,
      [trimmedName, id]
    );

    if (result.rowCount === 0) {
      throw new NotFoundError("Category not found");
    }

    return mapRowToCategory(result.rows[0]);
  } catch (error: any) {
    if (error?.code === "23505") {
      throw new ConflictError("Category name already exists");
    }
    throw error;
  }
};

export const deleteCategory = async (id: number): Promise<void> => {
  const result = await pool.query("DELETE FROM categories WHERE id = $1", [id]);

  if (result.rowCount === 0) {
    throw new NotFoundError("Category not found");
  }
};
