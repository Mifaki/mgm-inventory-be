import { dateRegex } from "../../utils/regex";
import { z } from "zod";

export const createBorrowSchema = z.object({
  itemId: z.string().min(1, "Item ID is required"),
  userName: z.string().min(1, "User name is required"),
  userEmail: z.string().email("Invalid email format"),
  userNIM: z.string().min(1, "NIM is required"),
  userProgramStudy: z.string().min(1, "Program study is required"),
  userKTM: z
    .any()
    .refine(
      (file) =>
        file &&
        typeof file === "object" &&
        file.mimetype &&
        file.mimetype.startsWith("image/"),
      {
        message: "KTM must be an image file",
      }
    ),
  reason: z.string().min(1, "Reason is required"),
  borrowDate: z
    .string()
    .regex(dateRegex, "Borrow date must be in DD/MM/YYYY format"),
  pickupDate: z
    .string()
    .regex(dateRegex, "Pickup date must be in DD/MM/YYYY format"),
  returnDate: z
    .string()
    .regex(dateRegex, "Return date must be in DD/MM/YYYY format"),
});

export type CreateBorrowInput = z.infer<typeof createBorrowSchema>;
