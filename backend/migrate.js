const fs = require("node:fs");
const path = require("node:path");
const { connect } = require("./store");
(async () => {
  const sql = connect(process.env.DATABASE_URL);
  try {
    await sql.begin((tx) =>
      tx.unsafe(fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8")),
    );
    console.log("Original schema ready.");
  } finally {
    await sql.end();
  }
})().catch(() => {
  console.error(
    "Migration failed. Check the isolated original DATABASE_URL and role permissions.",
  );
  process.exitCode = 1;
});
