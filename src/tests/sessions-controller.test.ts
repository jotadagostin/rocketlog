import request from "supertest";
import { app } from "@/app";
import { prisma } from "@/database/prisma";

describe("SessionsController", () => {
  let user_id: string;

  afterAll(async () => {
    await prisma.user.delete({ where: { id: user_id } });
  });

  it("should authenticate a and get acces token", async () => {
    const response = await request(app).post("/users").send({
      name: "Test user",
      email: "Invalid-email",
      password: "password123",
    });

    user_id = response.body.id;

    const sessionResponse = await request(app).post("/sessions").send({
      email: "testuser@example.com",
      password: "password123",
    });

    expect(sessionResponse.status).toBe(200);
    expect(sessionResponse.body.token).toEqual(expect.any(String));
  });
});
