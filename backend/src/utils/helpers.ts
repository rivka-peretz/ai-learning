import { Request, Response } from "express";
import { AppError, isAppError } from "./errors";

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
  search?: string;
}

interface PaginationOptions {
  defaultPage?: number;
  defaultLimit?: number;
  maxLimit?: number;
  searchKey?: string;
}

export const parsePagination = (
  req: Request,
  options: PaginationOptions = {}
): PaginationParams => {
  const {
    defaultPage = 1,
    defaultLimit = 10,
    maxLimit = 100,
    searchKey = "q"
  } = options;

  const pageParam = Number(req.query.page ?? defaultPage);
  const limitParam = Number(req.query.limit ?? defaultLimit);
  const page = Number.isFinite(pageParam) && pageParam > 0 ? Math.floor(pageParam) : defaultPage;
  const rawLimit = Number.isFinite(limitParam) && limitParam > 0 ? Math.floor(limitParam) : defaultLimit;
  const limit = Math.min(rawLimit, maxLimit);
  const offset = (page - 1) * limit;
  const search = typeof req.query[searchKey] === "string" ? req.query[searchKey]?.trim() : undefined;

  return { page, limit, offset, search };
};



export const ensureTrimmedString = (value: unknown, field: string): string => {
  if (typeof value !== "string") {
    throw new AppError(`${field} must be a string`, 400);
  }

  const trimmed = value.trim();
  if (!trimmed) {
    throw new AppError(`${field} cannot be empty`, 400);
  }

  return trimmed;
};

export const toOptionalNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};
export const handleControllerError = (res: Response, error: unknown) => {
  console.error("❌ Controller error:", error); // ← שורה חשובה! שתהיה שם
  res.status(500).json({ error: "Internal server error" });
};
