import bcrypt from "bcryptjs";
import { db } from "../db/connection";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { users } from "../db/schema";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!;

export async function register({
  name,
  email,
  nim,
  password,
}: {
  name: string;
  email: string;
  nim: string;
  password: string;
}) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const [user] = await db
    .insert(users)
    .values({ name, email, nim, password: hashedPassword })
    .returning();
  return { id: user?.id, name: user?.name, nim: user?.nim, email: user?.email };
}

export async function login({
  nim,
  password,
}: {
  nim: string;
  password: string;
}) {
  const [user] = await db.select().from(users).where(eq(users.nim, nim));
  if (!user) throw new Error("Invalid credentials");
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error("Invalid credentials");
  const accessToken = jwt.sign({ userId: user.id }, ACCESS_TOKEN_SECRET, {
    expiresIn: "20m",
  });
  const refreshToken = jwt.sign({ userId: user.id }, REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
  return {
    accessToken,
    refreshToken,
    user: { id: user.id, name: user.name, email: user.email },
  };
}

export async function refreshToken(token: string) {
  try {
    const payload = jwt.verify(token, REFRESH_TOKEN_SECRET) as any;
    const accessToken = jwt.sign(
      { userId: payload.userId },
      ACCESS_TOKEN_SECRET,
      { expiresIn: "20m" }
    );
    return { accessToken };
  } catch {
    throw new Error("Invalid refresh token");
  }
}
