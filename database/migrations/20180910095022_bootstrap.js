exports.up = function(knex) {
  return knex.schema
    .createTable('roles', roles => {
      roles.increments();

      roles
        .string('name', 128)
        .notNullable()
        .unique();
    })
    .createTable('users', users => {
      users.increments();

      users
        .string('username', 128)
        .notNullable()
        .unique();
      users.string('password', 255).notNullable();
    })
    .createTable('user_roles', userRoles => {
      userRoles.increments();

      userRoles
        .integer('user_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('RESTRICT')
        .onUpdate('CASCADE');

      userRoles
        .integer('role_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('roles')
        .onDelete('RESTRICT')
        .onUpdate('CASCADE');
    });
};

exports.down = function(knex, Promise) {
  return knex.schema
    .dropTableIfExists('user_roles')
    .dropTableIfExists('users')
    .dropTableIfExists('roles');
};
