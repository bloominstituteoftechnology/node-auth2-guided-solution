module.exports = {
  JWT_SECRET: process.env.JWT_SECRET || 'add a third table for many to many',
  BCRYPT_ROUNDS: process.env.BCRYPT_ROUNDS || 8,
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 9000,
}
