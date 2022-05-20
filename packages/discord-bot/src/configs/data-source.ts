import { DataSource, type DataSourceOptions } from 'typeorm'
import dotenv from 'dotenv'

dotenv.config()

const baseConfig: DataSourceOptions = {
  type: 'postgres',
  port: 5432,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  entities: ['dist/entities/**/*.js'],
  migrations: ['dist/migrations/**/*.js'],
  subscribers: ['dist/subscribers/**/*.js']
}

const dataSource = new DataSource({
  development: {
    ...baseConfig,
    host: '127.0.0.1',
    database: 'arora_discord_development',
    logging: true
  },
  production: {
    ...baseConfig,
    host: process.env.POSTGRES_HOST,
    database: 'arora_discord_production'
  },
  staging: {
    ...baseConfig,
    host: process.env.POSTGRES_HOST,
    database: 'arora_discord_staging'
  }
}[process.env.NODE_ENV ?? 'development'] as DataSourceOptions)

export default dataSource
