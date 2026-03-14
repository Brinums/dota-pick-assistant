import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { prisma } from "../src/lib/prisma.js";

dotenv.config();

const demoUsers = [
  {
    username: "admin",
    email: "admin@dpa.local",
    password: "Admin123!",
    role: "ADMIN",
  },
  {
    username: "user",
    email: "user@dpa.local",
    password: "User123!",
    role: "USER",
  },
];

async function main() {
  for (const demoUser of demoUsers) {
    const passwordHash = await bcrypt.hash(demoUser.password, 10);

    await prisma.user.upsert({
      where: { email: demoUser.email },
      update: {
        username: demoUser.username,
        passwordHash,
        role: demoUser.role,
      },
      create: {
        username: demoUser.username,
        email: demoUser.email,
        passwordHash,
        role: demoUser.role,
      },
    });
  }

  // eslint-disable-next-line no-console
  console.log("Demo users are created/updated:");
  // eslint-disable-next-line no-console
  console.log("ADMIN -> admin@dpa.local / Admin123!");
  // eslint-disable-next-line no-console
  console.log("USER  -> user@dpa.local / User123!");
}

main()
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error("Failed to create demo users:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
