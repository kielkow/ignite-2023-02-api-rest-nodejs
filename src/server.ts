import 'dotenv/config'

import fastify from 'fastify'
import { randomUUID } from 'crypto'

import { knex } from './database'

interface ITransactionBody {
  title: string
  amount: number
}

interface ITransactionQueryString {
  title: string
  amount: number
}

const app = fastify()

app.get('/status', () => {
  return 'server is running'
})

app.get('/status-database', () => {
  return knex('sqlite_schema').select('*')
})

app.get<{ Querystring: ITransactionQueryString }>(
  '/transactions',
  (req, res) => {
    const { title, amount } = req.query

    if (title && !amount) {
      return knex('transactions').select('*').where('title', title)
    }

    if (amount && !title) {
      return knex('transactions').select('*').where('amount', amount)
    }

    if (title && amount) {
      return knex('transactions').select('*').where({
        title,
        amount,
      })
    }

    return knex('transactions').select('*')
  },
)

app.post<{ Body: ITransactionBody }>('/transactions', {}, async (req, res) => {
  const { title, amount } = req.body

  const transaction = await knex('transactions')
    .insert({
      id: randomUUID(),
      title,
      amount,
    })
    .returning('*')

  res.send(transaction)
})

app.listen({ port: 3333 }).then(() => console.log('[server is running]'))
