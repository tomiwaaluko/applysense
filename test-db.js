import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Testing database connection...");

  try {
    // Test connection
    await prisma.$connect();
    console.log("✅ Database connection successful!");

    // Try to query existing tables
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log("📋 Existing tables:", tables);
  } catch (error) {
    console.error("❌ Database connection failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
