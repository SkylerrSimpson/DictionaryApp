const test = require("node:test");
const assert = require("node:assert/strict");
const { createApp, COOKIE, hash, cookieToken } = require("../server");
const { validateCreate, validateUpdate } = require("../validation");
const KIND = "dictionary";
const PAYLOAD = { _id: "hello", word: "hello" };
const RESOURCE = "/words";
const ORIGIN = "http://localhost:4101";
function memoryStore() {
  const rows = new Map();
  const key = (owner, id) => owner + "|" + id;
  return {
    list: async (owner) =>
      [...rows]
        .filter(([key]) => key.startsWith(owner + "|"))
        .map(([, data]) => data),
    get: async (owner, id) => rows.get(key(owner, id)) || null,
    create: async (owner, id, data) => {
      if (rows.has(key(owner, id)))
        throw Object.assign(new Error("duplicate"), { code: "23505" });
      const row = { _id: id, ...data };
      rows.set(key(owner, id), row);
      return row;
    },
    update: async (owner, id, nextId, data) => {
      const current = rows.get(key(owner, id));
      if (!current) return null;
      if (nextId !== id && rows.has(key(owner, nextId)))
        throw Object.assign(new Error("duplicate"), { code: "23505" });
      rows.delete(key(owner, id));
      const row = { ...current, ...data, _id: nextId };
      rows.set(key(owner, nextId), row);
      return row;
    },
    remove: async (owner, id) => {
      rows.delete(key(owner, id));
    },
  };
}
test("validation rejects malformed values without a database", () => {
  assert.throws(() => validateCreate(null), { status: 400 });
  if (KIND === "todo") {
    assert.throws(() => validateCreate({ item: " ", completed: false }), {
      status: 400,
    });
    assert.throws(() => validateUpdate({ completed: "yes" }, "id"), {
      status: 400,
    });
    assert.throws(() => validateUpdate({ $set: { completed: true } }, "id"), {
      status: 400,
    });
  }
  if (KIND === "dictionary")
    assert.throws(() => validateCreate({ _id: "different", word: "hello" }), {
      status: 400,
    });
  if (KIND === "devfinder")
    assert.throws(
      () => validateCreate({ ...PAYLOAD, avatar_url: "javascript:alert(1)" }),
      { status: 400 },
    );
});
test("HTTP contract, browser ownership, origin protection, and mutation errors", async (t) => {
  const app = createApp({ store: memoryStore(), origin: ORIGIN });
  const server = await new Promise((resolve) => {
    const s = app.listen(0, "127.0.0.1", () => resolve(s));
  });
  t.after(
    () =>
      new Promise((resolve) => {
        server.close(resolve);
        server.closeAllConnections();
      }),
  );
  const base = "http://127.0.0.1:" + server.address().port;
  async function request(
    path = RESOURCE,
    { cookie, method = "GET", body, origin = ORIGIN, headers = {} } = {},
  ) {
    return fetch(base + path, {
      method,
      headers: {
        ...(cookie ? { Cookie: cookie } : {}),
        ...(method !== "GET" ? { Origin: origin } : {}),
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...headers,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  }
  const first = await request();
  assert.equal(first.status, 200);
  assert.deepEqual(await first.json(), []);
  const setCookie = first.headers.get("set-cookie");
  assert.match(setCookie, /HttpOnly/);
  assert.match(setCookie, /SameSite=Strict/);
  assert.equal(first.headers.get("cache-control"), "no-store");
  const a = setCookie.split(";")[0];
  const token = a.split("=")[1];
  assert.equal(token.length, 43);
  assert.equal(hash(token).length, 64);
  assert.notEqual(hash(token), token);
  assert.ok(a.startsWith(COOKIE + "="));
  assert.equal(
    (await request(RESOURCE, { method: "POST", body: PAYLOAD })).status,
    401,
  );
  assert.equal(
    (
      await request(RESOURCE, {
        cookie: a,
        method: "POST",
        body: PAYLOAD,
        origin: "https://attacker.example",
      })
    ).status,
    403,
  );
  assert.equal(
    (
      await request(RESOURCE, {
        cookie: a,
        method: "POST",
        body: PAYLOAD,
        headers: { "Content-Type": "text/plain" },
      })
    ).status,
    415,
  );
  const created = await request(RESOURCE, {
    cookie: a,
    method: "POST",
    body: PAYLOAD,
  });
  assert.equal(created.status, 201);
  const item = await created.json();
  assert.equal(typeof item._id, "string");
  assert.ok(!("owner_hash" in item));
  const b = (await request()).headers.get("set-cookie").split(";")[0];
  assert.deepEqual(await (await request(RESOURCE, { cookie: b })).json(), []);
  const path = RESOURCE + "/" + encodeURIComponent(item._id);
  assert.equal(
    (await request(path, { cookie: b, method: "DELETE" })).status,
    204,
  );
  assert.equal(
    (await (await request(RESOURCE, { cookie: a })).json()).length,
    1,
  );
  if (KIND === "todo") {
    assert.equal((await request(path, { cookie: b })).status, 404);
    assert.equal(
      (
        await request(path, {
          cookie: b,
          method: "PATCH",
          body: { completed: true },
        })
      ).status,
      404,
    );
    assert.equal(
      (
        await request(path, {
          cookie: a,
          method: "PATCH",
          body: { completed: "yes" },
        })
      ).status,
      400,
    );
    const toggled = await request(path, {
      cookie: a,
      method: "PATCH",
      body: { completed: true },
    });
    assert.equal(toggled.status, 200);
    assert.equal((await toggled.json()).completed, true);
  }
  if (KIND === "dictionary") {
    await request(RESOURCE, {
      cookie: a,
      method: "POST",
      body: { _id: "world", word: "world" },
    });
    assert.equal(
      (
        await request(path, {
          cookie: a,
          method: "PATCH",
          body: { _id: "world", word: "world" },
        })
      ).status,
      409,
    );
    assert.ok(
      (await (await request(RESOURCE, { cookie: a })).json()).some(
        (row) => row._id === "hello",
      ),
    );
    const renamed = await request(path, {
      cookie: a,
      method: "PATCH",
      body: { _id: "renamed", word: "renamed" },
    });
    assert.equal(renamed.status, 200);
    assert.equal((await renamed.json()).word, "renamed");
  }
  const delPath = KIND === "dictionary" ? RESOURCE + "/renamed" : path;
  assert.equal(
    (await request(delPath, { cookie: a, method: "DELETE" })).status,
    204,
  );
  assert.ok(
    !(await (await request(RESOURCE, { cookie: a })).json()).some(
      (row) => row._id === item._id,
    ),
  );
});

test("cookies reject ambiguous identities and support host-only production names", () => {
  const token = "a".repeat(43);
  assert.equal(cookieToken(COOKIE + "=" + token), token);
  assert.equal(
    cookieToken(COOKIE + "=" + token + "; " + COOKIE + "=" + token),
    null,
  );
  assert.equal(cookieToken(COOKIE + "=invalid"), null);
  assert.equal(
    cookieToken("__Host-" + COOKIE + "=" + token, "__Host-" + COOKIE),
    token,
  );
  assert.equal(cookieToken(COOKIE + "=" + token, "__Host-" + COOKIE), null);
});
