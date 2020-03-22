const db = require('../database/dbConfig.js');

module.exports = {
  add,
  find,
  findBy,
  findById,
  addRoles,
};

function find() {
  return db('users as u')
    .join('roles as r', 'u.role_id', '=', 'r.id')
    .select('u.id', 'u.username', 'r.name as role');
}

function findBy(filter) {
  return db('users')
    .join('roles as r', 'u.role_id', '=', 'r.id')
    .select('u.id', 'u.username', 'r.name as role')
    .where(filter);
}

async function add(user) {
  const [id] = await db('users').insert(user);
  const roles = [{ user_id: id, role_id: 3 }];
  if (user.roles && user.roles.length) {
    roles = user.roles.map(roleId => {
      return { user_id: id, role_id: roleId };
    });
    await db('user_roles').insert(roles, 'id');
  }

  return findById(id);
}

function findById(id) {
  return db('users')
    .join('roles as r', 'u.role_id', '=', 'r.id')
    .select('u.id', 'u.username', 'r.name as role')
    .where({ id })
    .first();
}

function addRoles(userId, roles) {
  if (userId && Array.isArray(roles) && roles.length) {
    const roles = roles.map(roleId => {
      return { user_id: id, role_id: roleId };
    });
    db('user_roles').insert(roles, 'id');
  }

  return findById(userId);
}
