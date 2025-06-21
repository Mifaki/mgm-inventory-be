import { BorrowController } from "../controllers/borrowController";
import { Router } from "express";
import multer from "multer";
import { requireAuth } from "../middleware/auth";

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

router.post(
  "/",
  requireAuth,
  upload.single("userKTM"),
  BorrowController.createBorrow
);

router.post("/:id/status", requireAuth, BorrowController.updateBorrowStatus);

router.get("/", requireAuth, BorrowController.getBorrows);

export default router;
