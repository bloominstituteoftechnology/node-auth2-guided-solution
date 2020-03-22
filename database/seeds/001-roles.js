exports.seed = function(knex) {
  return knex('roles').insert([
    { name: 'root' }, // 1
    { name: 'staff' }, // 1
    { name: 'student' }, // 1
  ]);
};
