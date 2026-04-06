// prisma.config.ts - Configuration for Prisma Migrate connection
module.exports = {
  migrations: {
    datasourceUrl: process.env.DATABASE_URL || "file:./dev.db"
  }
}

