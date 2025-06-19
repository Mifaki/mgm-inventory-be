import { Request, Response } from "express";
import {
  createBorrowSchema,
  updateBorrowStatusSchema,
} from "../models/schema/borrow";
import { sendError, sendSuccess } from "../utils/response";

import { BorrowService } from "../services/borrowService";
import { generateULID } from "../utils/ulid";
import { uploadFileFromBuffer } from "../utils/cloudinary";

function parseDate(dateStr: string): string {
  const [day, month, year] = dateStr.split("/");
  const date = new Date(`${year}-${month}-${day}`);
  return date.toISOString();
}

export class BorrowController {
  static async createBorrow(req: Request, res: Response) {
    const validation = createBorrowSchema.safeParse({
      ...req.body,
      userKTM: req.file,
    });
    if (!validation.success) {
      sendError(res, "Validation error", 400, validation.error.errors);
      return;
    }
    try {
      const imageUrl = await uploadFileFromBuffer(req.file!.buffer, {
        folder: "ktm_images",
        resource_type: "image",
      });

      const id = generateULID();
      const borrowDate = parseDate(validation.data.borrowDate);
      const pickupDate = parseDate(validation.data.pickupDate);
      const returnDate = parseDate(validation.data.returnDate);
      const userId = (req as any).userId;

      const borrow = await BorrowService.createBorrow({
        id,
        userId,
        itemId: validation.data.itemId,
        userName: validation.data.userName,
        userEmail: validation.data.userEmail,
        userNIM: validation.data.userNIM,
        userProgramStudy: validation.data.userProgramStudy,
        userKTMUrl: imageUrl,
        reason: validation.data.reason,
        borrowDate,
        pickupDate,
        returnDate,
      });

      sendSuccess(res, borrow, "Borrow record created successfully", 201);
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  static async updateBorrowStatus(req: Request, res: Response) {
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
      status === "approved" ? "borrow-approved" : "borrow-rejected";
    try {
      const updated = await BorrowService.updateBorrowStatus(
        String(id),
        mappedStatus
      );
      sendSuccess(res, updated, `Borrow ${status} successfully`);
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }
}
