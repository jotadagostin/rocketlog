import { AppError } from "@/utils/AppError";
import { Request, Response } from "express";
import { prisma } from "@/database/prisma";
import { compare } from "bcrypt";
import { sign } from "jsonwebtoken";
import { z } from "zod";
import { authConfig } from "@/configs/auth";

class SessionsController {
  async create(request: Request, response: Response) {
    const bodySchema = z.object({
      email: z.string().email(),
      password: z.string().min(6),
    });

    const { email, password } = bodySchema.parse(request.body);

    const user = await prisma.user.findFirst({
      where: { email },
    });

    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    const passworMatched = await compare(password, user.password);

    if (!passworMatched) {
      throw new AppError("Invalid email or password", 401);
    }

    const { secret, expiresIn } = authConfig.jwt;

    const token = sign({ role: user.role ?? "customer" }, secret, {
      subject: user.id,
      expiresIn,
    });

    const { password: hashedPassword, ...userWithouthPassword } = user;

    return response.json({ token, user: userWithouthPassword });
  }
}

export { SessionsController };
