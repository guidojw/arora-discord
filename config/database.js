'use strict'
require('dotenv').config()

module.exports = {
  development: {
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    host: '127.0.0.1',
    database: 'nsadmin_discord_development',

    dialect: 'postgres',
    operatorsAliases: '0',
    define: {
      timestamps: false,
      underscored: true
    }
  },

  production: {
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    host: process.env.POSTGRES_HOST,
    database: 'nsadmin_discord_production',

    dialect: 'postgres',
    operatorsAliases: '0',
    define: {
      timestamps: false,
      underscored: true
    },
    logging: false
  }
}
