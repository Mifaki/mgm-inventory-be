import { ItemController } from "../controllers/itemController";
import { Router } from "express";
import { asyncHandler } from "../middleware/error";

const router = Router();

// POST /api/items - Create new item
router.post("/", asyncHandler(ItemController.createItem));

// GET /api/items - Get all items with pagination and search
router.get("/", asyncHandler(ItemController.getItems));

// GET /api/items/:id - Get item by ID
router.get("/:id", asyncHandler(ItemController.getItemById));

// PUT /api/items/:id - Update item
router.put("/:id", asyncHandler(ItemController.updateItem));

// DELETE /api/items/:id - Delete item
router.delete("/:id", asyncHandler(ItemController.deleteItem));

export default router;
