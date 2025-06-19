import { and, eq, ne, sql } from "drizzle-orm";
import { borrow, items } from "../db/schema";

import { db } from "../db/connection";

export class BorrowService {
  static async createBorrow(
    data: Omit<
      typeof borrow.$inferInsert,
      "damagedItemUrl" | "status" | "createdAt" | "updatedAt" | "userKTM"
    > & { userKTMUrl: string }
  ) {
    const { userKTMUrl, itemId, ...rest } = data;

    const [item] = await db.select().from(items).where(eq(items.id, itemId));
    if (!item) throw new Error("Item not found");

    // count all borrows for this item that are not 'return-approved'
    const countResult = await db
      .select({ count: sql`COUNT(*)` })
      .from(borrow)
      .where(
        and(eq(borrow.itemId, itemId), ne(borrow.status, "return-approved"))
      );
    const count = countResult[0]?.count ? Number(countResult[0].count) : 0;

    if (item.quantity - count <= 0) {
      throw new Error("No available stock for this item.");
    }

    const [created] = await db
      .insert(borrow)
      .values({
        ...rest,
        itemId,
        userKTM: userKTMUrl,
        status: "borrow-pending",
      })
      .returning();
    return created;
  }

  static async updateBorrowStatus(
    id: string,
    status: "borrow-approved" | "borrow-rejected"
  ) {
    const [updated] = await db
      .update(borrow)
      .set({ status })
      .where(eq(borrow.id, id))
      .returning();
    if (!updated) throw new Error("Borrow record not found");
    return updated;
  }

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
