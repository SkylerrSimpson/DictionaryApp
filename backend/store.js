const postgres = require("postgres");

function connect(url) {
  if (!url)
    throw new Error(
      "DATABASE_URL is required; use an isolated original database.",
    );
  return postgres(url, { max: 5, idle_timeout: 20, connect_timeout: 10 });
}
function createStore(sql) {
  const table = sql("dictionary_original.items");
  const shape = (row) => (row ? { _id: row.id, ...row.data } : null);
  return {
    async list(owner) {
      return (
        await sql`SELECT id, data FROM ${table} WHERE owner_hash = ${owner} ORDER BY created_at, id`
      ).map(shape);
    },
    async get(owner, id) {
      return shape(
        (
          await sql`SELECT id, data FROM ${table} WHERE owner_hash = ${owner} AND id = ${id}`
        )[0],
      );
    },
    async create(owner, id, data) {
      return shape(
        (
          await sql`INSERT INTO ${table} (owner_hash,id,data) VALUES (${owner},${id},${sql.json(data)}) RETURNING id,data`
        )[0],
      );
    },
    async update(owner, id, nextId, data) {
      return shape(
        (
          await sql`UPDATE ${table} SET id = ${nextId}, data = data || ${sql.json(data)} WHERE owner_hash = ${owner} AND id = ${id} RETURNING id,data`
        )[0],
      );
    },
    async remove(owner, id) {
      await sql`DELETE FROM ${table} WHERE owner_hash = ${owner} AND id = ${id}`;
    },
  };
}
module.exports = { connect, createStore };
