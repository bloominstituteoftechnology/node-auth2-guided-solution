const db = require("../../database/connection.js");

module.exports = {
  add,
  find,
  findBy,
  findById,
};

function find() {
  return db("roles").select("id", "name");
}

function findBy(filter) {
  return db("roles").where(filter);
}

async function add(role) {
  const [id] = await db("roles").insert(role, "id");

  return findById(id);
}

function findById(id) {
  return db("roles").where({ id }).first();
}
