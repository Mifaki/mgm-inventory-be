import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { relations } from "drizzle-orm";
import { sql } from "drizzle-orm";

const statusEnum = [
  "borrow-pending",
  "borrow-approved",
  "borrow-rejected",
  "return-pending",
  "return-approved",
  "return-rejected",
] as const;

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  nim: text("nim").notNull().unique(),
  password: text("password").notNull(),
  createdAt: text("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: text("updated_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const items = sqliteTable("items", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  quantity: integer("quantity").notNull().default(0),
  createdAt: text("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: text("updated_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const borrow = sqliteTable("borrows", {
  id: text("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  itemId: text("item_id")
    .notNull()
    .references(() => items.id, { onDelete: "cascade" }),
  userName: text("user_name").notNull(),
  userEmail: text("user_email").notNull(),
  userNIM: text("user_nim").notNull(),
  userProgramStudy: text("user_program_study").notNull(),
  userKTM: text("user_ktm").notNull(),
  reason: text("reason").notNull(),
  borrowDate: text("borrow_date").notNull(),
  pickupDate: text("pickup_date").notNull(),
  returnDate: text("return_date").notNull(),
  status: text("status", { enum: statusEnum }).notNull(),
  damagedItem: text("damaged_item"),
  createdAt: text("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: text("updated_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  borrows: many(borrow),
}));

export const itemsRelations = relations(items, ({ many }) => ({
  borrows: many(borrow),
}));

export const borrowRelations = relations(borrow, ({ one }) => ({
  item: one(items, {
    fields: [borrow.itemId],
    references: [items.id],
  }),
  user: one(users, {
    fields: [borrow.userId],
    references: [users.id],
  }),
}));
