import { ItemController } from "../controllers/itemController";
import { Router } from "express";
import { asyncHandler } from "../middleware/error";

const router = Router();

router.post("/", asyncHandler(ItemController.createItem));
router.get("/", asyncHandler(ItemController.getItems));
router.get("/:id", asyncHandler(ItemController.getItemById));
router.put("/:id", asyncHandler(ItemController.updateItem));
router.delete("/:id", asyncHandler(ItemController.deleteItem));

export default router;
