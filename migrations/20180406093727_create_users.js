
exports.up = function(knex, Promise) {
  return knex.schema.createTable('users', (table) => {
    table.increments('id');
    table.string('email');
    table.string('password');
    table.dateTime('lastLogin');
    table.timestamps();
    table.unique('email');
  });  
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('users'); 
};
