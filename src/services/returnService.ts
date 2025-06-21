import { and, eq } from "drizzle-orm";

import { borrow } from "../db/schema";
import { db } from "../db/connection";

export class ReturnService {
  static async createReturn({
    userId,
    itemId,
    borrowDate,
    returnDate,
    damagedItemUrl,
  }: {
    userId: number;
    itemId: string;
    borrowDate: string;
    returnDate: string;
    damagedItemUrl?: string;
  }) {
    const updated = await db
      .update(borrow)
      .set({
        status: "return-pending",
        ...(damagedItemUrl ? { damagedItem: damagedItemUrl } : {}),
      })
      .where(
        and(
          eq(borrow.userId, userId),
          eq(borrow.itemId, itemId),
          eq(borrow.borrowDate, borrowDate),
          eq(borrow.returnDate, returnDate),
          eq(borrow.status, "borrow-approved")
        )
      )
      .returning();
    if (!updated.length) throw new Error("No matching borrow records found");
    return updated;
  }

  static async updateReturnStatus(
    id: string,
    status: "return-approved" | "return-rejected"
  ) {
    const [updated] = await db
      .update(borrow)
      .set({ status })
      .where(and(eq(borrow.id, id), eq(borrow.status, "return-pending")))
      .returning();
    if (!updated)
      throw new Error("Return record not found or not in return-pending state");
    return updated;
  }
}
