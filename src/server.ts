import fastify from 'fastify'
import { knex } from './database'

const app = fastify()

app.get('/status', () => {
  return 'server is running'
})

app.get('/status-database', () => {
  return knex('sqlite_schema').select('*')
})

app.listen({ port: 3333 }).then(() => console.log('[server is running]'))
