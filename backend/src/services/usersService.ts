import pool from "../db";
import { User } from "../models";
import { BadRequestError, NotFoundError } from "../utils/errors";

export interface ListUsersParams {
  search?: string;
  limit: number;
  offset: number;
}

export interface ListUsersResult {
  data: User[];
  total: number;
}

const mapRowToUser = (row: Record<string, unknown>): User => ({
  id: row.id as number,
  name: row.name as string,
  phone: row.phone as string,
  created_at: row.created_at as Date,
  updated_at: row.updated_at as Date
});

export const listUsers = async ({
  search,
  limit,
  offset
}: ListUsersParams): Promise<ListUsersResult> => {
  const params: unknown[] = [];
  const where: string[] = [];

  if (search) {
    params.push(`%${search}%`, `%${search}%`);
    where.push(`(name ILIKE $${params.length - 1} OR phone ILIKE $${params.length})`);
  }

  const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const countSql = `SELECT COUNT(*)::int AS total FROM users ${whereClause}`;
  const countResult = await pool.query(countSql, params);
  const total = countResult.rows[0]?.total ?? 0;

  params.push(limit, offset);
  const dataSql = `
    SELECT id, name, phone, created_at, updated_at
    FROM users
    ${whereClause}
    ORDER BY id ASC
    LIMIT $${params.length - 1} OFFSET $${params.length}
  `;
  const dataResult = await pool.query(dataSql, params);

  return {
    data: dataResult.rows.map(mapRowToUser),
    total
  };
};

export const getUserById = async (id: number): Promise<User> => {
  const result = await pool.query(
    `SELECT id, name, phone, created_at, updated_at
     FROM users
     WHERE id = $1`,
    [id]
  );

  if (result.rowCount === 0) {
    throw new NotFoundError("User not found");
  }

  return mapRowToUser(result.rows[0]);
};
export const getUserByPhone = async (phone: string): Promise<User | null> => {
  const result = await pool.query(
    `SELECT id, name, phone, created_at, updated_at FROM users WHERE phone = $1`,
    [phone]
  );

  if (result.rowCount === 0) return null;
  return mapRowToUser(result.rows[0]);
};

export const getUserByNameAndPhone = async (name: string, phone: string): Promise<User | null> => {
  const result = await pool.query(
    `SELECT id, name, phone, created_at, updated_at 
     FROM users 
     WHERE name = $1 AND phone = $2`,
    [name, phone]
  );

  if (result.rowCount === 0) return null;
  return mapRowToUser(result.rows[0]);
};


export const createUser = async (payload: Pick<User, "name" | "phone">): Promise<User> => {
  const { name, phone } = payload;

  const trimmedName = name.trim();
  const trimmedPhone = phone.trim();

  if (!trimmedName) throw new BadRequestError("Name is required");
  if (!trimmedPhone) throw new BadRequestError("Phone is required");

  try {
    const result = await pool.query(
      `INSERT INTO users (name, phone)
       VALUES ($1, $2)
       RETURNING id, name, phone, created_at, updated_at`,
      [trimmedName, trimmedPhone]
    );

    return {
      id: result.rows[0].id,
      name: result.rows[0].name,
      phone: result.rows[0].phone,
      created_at: result.rows[0].created_at,
      updated_at: result.rows[0].updated_at,
    };
  } catch (err) {
    console.error("❌ SQL INSERT ERROR:", err);
    throw err;
  }
};

export const updateUser = async (
  id: number,
  payload: Partial<Pick<User, "name" | "phone">>
): Promise<User> => {
  const fields: string[] = [];
  const params: unknown[] = [];

  if (payload.name !== undefined) {
    const trimmedName = payload.name.trim();
    if (!trimmedName) {
      throw new BadRequestError("Name cannot be empty");
    }
    params.push(trimmedName);
    fields.push(`name = $${params.length}`);
  }

  if (payload.phone !== undefined) {
    const trimmedPhone = payload.phone.trim();
    if (!trimmedPhone) {
      throw new BadRequestError("Phone cannot be empty");
    }
    params.push(trimmedPhone);
    fields.push(`phone = $${params.length}`);
  }

  if (!fields.length) {
    throw new BadRequestError("No fields to update");
  }

  params.push(id);
  const sql = `
    UPDATE users
    SET ${fields.join(", ")}, updated_at = NOW()
    WHERE id = $${params.length}
    RETURNING id, name, phone, created_at, updated_at
  `;
  const result = await pool.query(sql, params);

  if (result.rowCount === 0) {
    throw new NotFoundError("User not found");
  }

  return mapRowToUser(result.rows[0]);
};

export const deleteUser = async (id: number): Promise<void> => {
  const result = await pool.query("DELETE FROM users WHERE id = $1", [id]);
  if (result.rowCount === 0) {
    throw new NotFoundError("User not found");
  }
};

