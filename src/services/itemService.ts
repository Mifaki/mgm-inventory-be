import type { CreateItemInput, UpdateItemInput } from "../models/schema/item";
import { ItemData, PaginatedItemsResult } from "../models/types/item";
import { count, desc, eq, like } from "drizzle-orm";

import { AppError } from "../middleware/error";
import { PaginationInput } from "../models/schema/general";
import { db } from "../db/connection";
import { generateULID } from "../utils/ulid";
import { items } from "../db/schema";

export class ItemService {
  static async createItem(data: CreateItemInput): Promise<ItemData> {
    const id = generateULID();
    const now = new Date().toISOString();

    const [item] = await db
      .insert(items)
      .values({
        id,
        name: data.name,
        quantity: data.quantity,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    if (!item) {
      throw new AppError("Failed to create item", 500);
    }

    return item;
  }

  static async getItems(
    params: PaginationInput
  ): Promise<PaginatedItemsResult> {
    const { page, limit, search } = params;
    const offset = (page - 1) * limit;

    let whereClause = undefined;
    if (search) {
      whereClause = like(items.name, `%${search}%`);
    }

    const result = await db
      .select({ total: count() })
      .from(items)
      .where(whereClause);

    const total = result[0]?.total ?? 0;

    const itemsList = await db
      .select()
      .from(items)
      .where(whereClause)
      .orderBy(desc(items.createdAt))
      .limit(limit)
      .offset(offset);

    return {
      items: itemsList,
      pagination: {
        page,
        limit,
        total,
      },
    };
  }

  static async getItemById(id: string): Promise<ItemData> {
    const [item] = await db
      .select()
      .from(items)
      .where(eq(items.id, id))
      .limit(1);

    if (!item) {
      throw new AppError("Item not found", 404);
    }

    return item;
  }

  static async updateItem(
    id: string,
    data: UpdateItemInput
  ): Promise<ItemData> {
    await this.getItemById(id);

    const now = new Date().toISOString();
    const updateData = {
      ...data,
      updatedAt: now,
    };

    const [updatedItem] = await db
      .update(items)
      .set(updateData)
      .where(eq(items.id, id))
      .returning();

    if (!updatedItem) {
      throw new AppError("Failed to update item", 500);
    }

    return updatedItem;
  }

  static async deleteItem(id: string): Promise<void> {
    await this.getItemById(id);

    await db.delete(items).where(eq(items.id, id));
  }

  static async checkItemExists(id: string): Promise<boolean> {
    const [item] = await db
      .select({ id: items.id })
      .from(items)
      .where(eq(items.id, id))
      .limit(1);

    return !!item;
  }
}
