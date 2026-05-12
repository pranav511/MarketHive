const cron = require("node-cron");
const { cleanupDeletedProducts } = require("../services/cleanupService");

cron.schedule("0 2 * * *", async () => {
  console.log("Running cleanup job...");
  await cleanupDeletedProducts();
});