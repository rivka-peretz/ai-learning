import pool from "../db";
import { SubCategory } from "../models";
import { BadRequestError, ConflictError, NotFoundError } from "../utils/errors";
import { getCategoryById } from "./categoriesService";

const mapRowToSubCategory = (row: Record<string, unknown>): SubCategory => ({
  id: row.id as number,
  name: row.name as string,
  category_id: row.category_id as number,
  created_at: row.created_at as Date,
  updated_at: row.updated_at as Date
});

export interface ListSubCategoriesParams {
  categoryId?: number;
}

// export const listSubCategories = async ({
//   categoryId
// }: ListSubCategoriesParams = {}): Promise<SubCategory[]> => {
//   const params: unknown[] = [];
//   const where: string[] = [];

//   if (categoryId) {
//     params.push(categoryId);
//     where.push(`category_id = $${params.length}`);
//   }

//   const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";

//   const result = await pool.query(
//     `SELECT id, name, category_id, created_at, updated_at
//      FROM sub_categories
//      ${whereClause}
//      ORDER BY name ASC`,
//     params
//   );

//   return result.rows.map(mapRowToSubCategory);
// };

export const getSubCategoryById = async (id: number): Promise<SubCategory> => {
  const result = await pool.query(
    `SELECT id, name, category_id, created_at, updated_at
     FROM sub_categories
     WHERE id = $1`,
    [id]
  );

  if (result.rowCount === 0) {
    throw new NotFoundError("Sub-category not found");
  }

  return mapRowToSubCategory(result.rows[0]);
};

export const createSubCategory = async (
  name: string,
  categoryId: number
): Promise<SubCategory> => {
  const trimmedName = name.trim();
  if (!trimmedName) {
    throw new BadRequestError("Sub-category name is required");
  }

  // Ensure parent category exists
  await getCategoryById(categoryId);

  try {
    const result = await pool.query(
      `INSERT INTO sub_categories (name, category_id)
       VALUES ($1, $2)
       RETURNING id, name, category_id, created_at, updated_at`,
      [trimmedName, categoryId]
    );

    return mapRowToSubCategory(result.rows[0]);
  } catch (error: any) {
    if (error?.code === "23505") {
      throw new ConflictError("Sub-category name already exists for this category");
    }
    throw error;
  }
};

export const updateSubCategory = async (
  id: number,
  name: string,
  categoryId: number
): Promise<SubCategory> => {
  const trimmedName = name.trim();
  if (!trimmedName) {
    throw new BadRequestError("Sub-category name cannot be empty");
  }

  await getCategoryById(categoryId);

  try {
    const result = await pool.query(
      `UPDATE sub_categories
       SET name = $1, category_id = $2, updated_at = NOW()
       WHERE id = $3
       RETURNING id, name, category_id, created_at, updated_at`,
      [trimmedName, categoryId, id]
    );

    if (result.rowCount === 0) {
      throw new NotFoundError("Sub-category not found");
    }

    return mapRowToSubCategory(result.rows[0]);
  } catch (error: any) {
    if (error?.code === "23505") {
      throw new ConflictError("Sub-category name already exists for this category");
    }
    throw error;
  }
};

export const deleteSubCategory = async (id: number): Promise<void> => {
  const result = await pool.query("DELETE FROM sub_categories WHERE id = $1", [id]);

  if (result.rowCount === 0) {
    throw new NotFoundError("Sub-category not found");
  }
};
export const listSubCategories = async ({ categoryId }: { categoryId?: number }) => {
  const result = await pool.query(
    `SELECT id, name, category_id FROM sub_categories WHERE category_id = $1 ORDER BY name ASC`,
    [categoryId]
  );
  return result.rows;
};
