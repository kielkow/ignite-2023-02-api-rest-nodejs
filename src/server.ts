import fastify from 'fastify'
import cookie from '@fastify/cookie'

import { knex } from './database'
import { env } from './env'
import { transactionRoutes } from './routes/transactions'

const app = fastify()

app.register(cookie)

app.get('/status', () => {
  return 'server is running'
})

app.get('/status-database', () => {
  return knex('sqlite_schema').select('*')
})

app.register(transactionRoutes, { prefix: 'transactions' })

app.listen({ port: env.PORT }).then(() => console.log('[server is running]'))
