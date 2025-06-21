import { Request, Response } from "express";
import {
  createReturnSchema,
  updateBorrowStatusSchema,
} from "../models/schema/borrow";
import { sendError, sendSuccess } from "../utils/response";

import { BorrowService } from "../services/borrowService";
import { uploadFileFromBuffer } from "../utils/cloudinary";

function parseDate(dateStr: string): string {
  const [day, month, year] = dateStr.split("/");
  const date = new Date(`${year}-${month}-${day}`);
  return date.toISOString();
}

export class ReturnController {
  static async createReturn(req: Request, res: Response) {
    const validation = createReturnSchema.safeParse({
      ...req.body,
      damagedItem: req.file,
    });
    if (!validation.success) {
      sendError(res, "Validation error", 400, validation.error.errors);
      return;
    }
    try {
      let damagedItemUrl: string | undefined = undefined;
      if (req.file) {
        damagedItemUrl = await uploadFileFromBuffer(req.file.buffer, {
          folder: "damaged_items",
          resource_type: "image",
        });
      }
      const { itemId, borrowDate, returnDate } = validation.data;
      const userId = (req as any).userId;
      const updated = await BorrowService.createReturn({
        userId,
        itemId,
        borrowDate: parseDate(borrowDate),
        returnDate: parseDate(returnDate),
        ...(damagedItemUrl ? { damagedItemUrl } : {}),
      });
      sendSuccess(
        res,
        updated,
        "Return record(s) created and set to return-pending",
        201
      );
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  static async updateReturnStatus(req: Request, res: Response) {
    const { id } = req.params;

    const validation = updateBorrowStatusSchema.safeParse(req.body);

    if (!validation.success) {
      sendError(res, "Validation error", 400, validation.error.errors);
      return;
    }

    const { status } = validation.data;
    if (!["approved", "rejected"].includes(status)) {
      sendError(res, "Invalid status", 400);
      return;
    }
    const mappedStatus =
      status === "approved" ? "return-approved" : "return-rejected";
    try {
      const updated = await BorrowService.updateReturnStatus(
        String(id),
        mappedStatus
      );
      sendSuccess(res, updated, `Return ${status} successfully`);
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }
}
