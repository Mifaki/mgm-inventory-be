import { ReturnController } from "../controllers/returnController";
import { Router } from "express";
import multer from "multer";
import { requireAuth } from "../middleware/auth";

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

router.post(
  "/return",
  requireAuth,
  upload.single("damagedItem"),
  ReturnController.createReturn
);

router.post(
  "/return/:id/status",
  requireAuth,
  ReturnController.updateReturnStatus
);

export default router;
