const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { randomBytes } = require("node:crypto");
const { connect, createStore } = require("../store");
const url = process.env.ORIGINAL_TEST_DATABASE_URL;
test(
  "PostgreSQL isolates identical IDs and preserves atomic rename on conflict",
  { skip: !url },
  async () => {
    const target = new URL(url);
    assert.ok(
      ["localhost", "127.0.0.1", "[::1]"].includes(target.hostname),
      "Tests require a local disposable database",
    );
    assert.ok(
      target.pathname.endsWith("_test"),
      "Test database name must end in _test",
    );
    const sql = connect(url),
      store = createStore(sql),
      a = randomBytes(32).toString("hex"),
      b = randomBytes(32).toString("hex");
    try {
      await sql.unsafe(
        fs.readFileSync(path.join(__dirname, "../schema.sql"), "utf8"),
      );
      await store.create(a, "one", { word: "one" });
      await store.create(b, "one", { word: "private" });
      assert.deepEqual(await store.list(a), [{ _id: "one", word: "one" }]);
      await store.remove(b, "absent");
      assert.equal((await store.list(a)).length, 1);
      await store.create(a, "two", { word: "two" });
      await assert.rejects(store.update(a, "one", "two", { word: "two" }), {
        code: "23505",
      });
      assert.equal((await store.get(a, "one")).word, "one");
      await store.remove(b, "one");
      assert.equal((await store.get(a, "one")).word, "one");
    } finally {
      await sql`DELETE FROM dictionary_original.items WHERE owner_hash IN (${a},${b})`;
      await sql.end();
    }
  },
);
