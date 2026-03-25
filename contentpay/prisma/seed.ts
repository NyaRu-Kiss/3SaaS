import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "demo@contentpay.com";
  const password = "demo123";
  
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (!existingUser) {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: "Demo Creator",
        slug: "demo",
        bio: "This is a demo account showcasing ContentPay features.",
        role: "CREATOR",
      },
    });
    
    console.log("Demo user created:");
    console.log("  Email: demo@contentpay.com");
    console.log("  Password: demo123");
    console.log("  Profile: http://localhost:3000/demo");
  } else {
    console.log("Demo user already exists");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
