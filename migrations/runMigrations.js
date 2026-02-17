const User = require("../src/models/Users");

const runMigrations = async () => {
  console.log("🚀 Running migrations...");

  // Ensure indexes
  await User.syncIndexes();

  // Seed default user if empty
  const count = await User.countDocuments();

  if (count === 0) {
    console.log("🌱 You don't have any users on your db");
  }

  console.log("✅ Migrations complete");
};

module.exports = runMigrations;
