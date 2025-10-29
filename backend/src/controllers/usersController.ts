import { Request, Response } from "express";
import * as usersService from "../services/usersService";
import { handleControllerError, parsePagination } from "../utils/helpers";

/**
 * Validate Israeli phone number format
 */
const validateIsraeliPhone = (phone: string): boolean => {
  if (!phone || typeof phone !== 'string') return false;
  
  const cleanPhone = phone.replace(/[\s-]/g, '');
  const phonePattern = /^(0?5[0-9]|0?[2-4]|0?7[0-9]|0?8|0?9)[0-9]{7,8}$/;
  
  return phonePattern.test(cleanPhone) && cleanPhone.length >= 9 && cleanPhone.length <= 10;
};

/**
 * Get all users with optional pagination
 */
export const listUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { limit, offset } = parsePagination(req);
    const users = await usersService.listUsers({ limit, offset });
    res.json(users);
  } catch (error) {
    handleControllerError(res, error);
  }
};

/**
 * Get a specific user by ID
 */
export const getUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ error: "Invalid user id" });
      return;
    }

    const user = await usersService.getUserById(id);
    res.json(user);
  } catch (error) {
    handleControllerError(res, error);
  }
};

/**
 * Create a new user with validation and duplicate checking
 * Prevents registration of users with same name+phone combination
 */
export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const name = (req.body?.name as string) ?? "";
    const phone = (req.body?.phone as string) ?? "";

    // Validate required fields
    if (!name.trim()) {
      res.status(400).json({ error: "Name is required" });
      return;
    }

    if (!phone.trim()) {
      res.status(400).json({ error: "Phone number is required" });
      return;
    }

    // Validate phone format
    if (!validateIsraeliPhone(phone)) {
      res.status(400).json({ 
        error: "Invalid Israeli phone number format. Example: 050-1234567" 
      });
      return;
    }

    // Check for existing user
    const existingUser = await usersService.getUserByNameAndPhone(name.trim(), phone);
    if (existingUser) {
      res.status(409).json({ 
        error: "משתמש עם השם והפלאפון הזה כבר קיים במערכת", 
        userExists: true 
      });
      return;
    }

    const user = await usersService.createUser({ name, phone });
    
    // Determine role based on admin phone
    const adminPhone = process.env.ADMIN_PHONE || '0504111781';
    const normalizedUserPhone = phone.replace(/[\s-]/g, '');
    const normalizedAdminPhone = adminPhone.replace(/[\s-]/g, '');
    const role = normalizedUserPhone === normalizedAdminPhone ? "admin" : "student";
    
    res.status(201).json({ ...user, role });
  } catch (error) {
    console.error("❌ Error creating user:", error);
    handleControllerError(res, error);
  }
};

/**
 * User login with name and phone verification
 * Supports admin role detection based on specific phone number
 */
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, phone } = req.body;

    // Validate required fields
    if (!name || typeof name !== "string" || !name.trim()) {
      res.status(400).json({ error: "Full name is required" });
      return;
    }

    if (!phone || typeof phone !== "string") {
      res.status(400).json({ error: "Phone number is required" });
      return;
    }

    // Validate phone format
    if (!validateIsraeliPhone(phone)) {
      res.status(400).json({ 
        error: "Invalid Israeli phone number format" 
      });
      return;
    }

    // Find user by name and phone
    const user = await usersService.getUserByNameAndPhone(name.trim(), phone);
    
    if (!user) {
      res.status(401).json({ error: "Full name or phone number not found in system" });
      return;
    }

    // Admin role detection
    const adminPhone = process.env.ADMIN_PHONE || '0504111781';
    const normalizedUserPhone = user.phone.replace(/[\s-]/g, '');
    const normalizedAdminPhone = adminPhone.replace(/[\s-]/g, '');
    
    const role = normalizedUserPhone === normalizedAdminPhone ? "admin" : "student";

    res.json({ ...user, role });
  } catch (error) {
    console.error("❌ Error in loginUser:", error);
    handleControllerError(res, error);
  }
};

/**
 * Update an existing user
 */
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ error: "Invalid user id" });
      return;
    }

    const updatedUser = await usersService.updateUser(id, {
      name: req.body?.name,
      phone: req.body?.phone
    });
    res.json(updatedUser);
  } catch (error) {
    handleControllerError(res, error);
  }
};

/**
 * Delete a user by ID
 */
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ error: "Invalid user id" });
      return;
    }

    await usersService.deleteUser(id);
    res.status(204).send();
  } catch (error) {
    handleControllerError(res, error);
  }
};
