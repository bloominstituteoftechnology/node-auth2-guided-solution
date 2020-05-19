const db = require("../database/connection.js");

module.exports = {
  add,
  find,
  findBy,
  findById,
};

function find() {
  return db("users as u")
    .join("roles as r", "u.role", "=", "r.id")
    .select("u.id", "u.username", "r.name as role");
}

function findBy(filter) {
  return db("users")
    .join("roles as r", "u.role", "=", "r.id")
    .select("u.id", "u.username", "r.name as role")
    .where(filter);
}

async function add(user) {
  try {
    const [id] = await db("users").insert(user, "id");

    return findById(id);
  } catch (error) {
    throw error;
  }
}

function findById(id) {
  return db("users")
    .join("roles as r", "u.role", "=", "r.id")
    .select("u.id", "u.username", "r.name as role")
    .where({ id })
    .first();
}
