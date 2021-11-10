const db = require("../../database/db-config")

module.exports = {
  add,
  find,
  findBy,
  findById,
}

function find() {
  return db("roles").select("id", "name")
}

function findBy(filter) {
  return db("roles").where(filter)
}

async function add(role) {
  const [id] = await db("roles").insert(role)

  return findById(id)
}

function findById(id) {
  return db("roles").where({ id }).first()
}
