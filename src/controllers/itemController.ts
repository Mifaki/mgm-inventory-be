import type { Request, Response } from "express";
import { createItemSchema, updateItemSchema } from "../models/schema/item";
import {
  sendError,
  sendPaginatedResponse,
  sendSuccess,
} from "../utils/response";

import { ItemService } from "../services/itemService";
import { isValidULID } from "../utils/ulid";
import { paginationSchema } from "@/models/schema/general";

export class ItemController {
  static async createItem(req: Request, res: Response): Promise<void> {
    const validation = createItemSchema.safeParse(req.body);

    if (!validation.success) {
      sendError(res, "Validation error", 400, validation.error.errors);
      return;
    }

    const item = await ItemService.createItem(validation.data);
    sendSuccess(res, item, "Item created successfully", 201);
  }

  static async getItems(req: Request, res: Response): Promise<void> {
    const queryParams =
      Object.keys(req.query).length === 0
        ? { page: "1", limit: "10" }
        : req.query;

    const validation = paginationSchema.safeParse(queryParams);

    if (!validation.success) {
      sendError(
        res,
        "Invalid pagination parameters",
        400,
        validation.error.errors
      );
      return;
    }

    const result = await ItemService.getItems(validation.data);

    sendPaginatedResponse(
      res,
      result.items,
      result.pagination,
      "Items retrieved successfully"
    );
  }

  static async getItemById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    if (!isValidULID(id ?? "")) {
      sendError(res, "Invalid item ID format", 400);
      return;
    }

    const item = await ItemService.getItemById(id ?? "");
    sendSuccess(res, item, "Item retrieved successfully");
  }

  static async updateItem(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    if (!isValidULID(id ?? "")) {
      sendError(res, "Invalid item ID format", 400);
      return;
    }

    const validation = updateItemSchema.safeParse(req.body);

    if (!validation.success) {
      sendError(res, "Validation error", 400, validation.error.errors);
      return;
    }

    if (Object.keys(validation.data).length === 0) {
      sendError(res, "No fields to update", 400);
      return;
    }

    const item = await ItemService.updateItem(id ?? "", validation.data);
    sendSuccess(res, item, "Item updated successfully");
  }

  static async deleteItem(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    if (!isValidULID(id ?? "")) {
      sendError(res, "Invalid item ID format", 400);
      return;
    }

    await ItemService.deleteItem(id ?? "");
    sendSuccess(res, null, "Item deleted successfully");
  }
}
