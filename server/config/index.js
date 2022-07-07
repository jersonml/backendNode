require('dotenv').config('');

const config = {
  server: {
    port: process.env.SERVER_PORT || 4001,
  },
  database: {
    dbname: process.env.DATABASE_DBNAME,
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    host: process.env.DATABASE_HOST,
    dialect: 'postgres',
  },
  pagination: {
    limit: 10,
    offset: 0,
    page: 1,
  },
  token: {
    secret: process.env.TOKEN_SECRET,
  },
  mercadopago: {
    "client_id": "3069754945804033",
    "client_secret": "k11ODjweI4vEc1AcQYMtZ1Zvme3eySZO",
    "access_token": "TEST-3069754945804033-011520-6828382dbe4b7480241a768143c18900-436472912",
  }
};

module.exports = config;
