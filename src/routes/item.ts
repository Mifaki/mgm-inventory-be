import { ItemController } from "../controllers/itemController";
import { Router } from "express";
import { asyncHandler } from "../middleware/error";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.post("/", requireAuth, asyncHandler(ItemController.createItem));
router.get("/", requireAuth, asyncHandler(ItemController.getItems));
router.get("/:id", requireAuth, asyncHandler(ItemController.getItemById));
router.put("/:id", requireAuth, asyncHandler(ItemController.updateItem));
router.delete("/:id", requireAuth, asyncHandler(ItemController.deleteItem));

export default router;
