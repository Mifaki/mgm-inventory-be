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
}
