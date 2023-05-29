import { randomUUID } from 'crypto'
import { FastifyInstance } from 'fastify'

import { knex } from '../database'

interface ITransactionBody {
  title: string
  amount: number
}

interface ITransactionQueryString {
  title: string
  amount: number
}

export async function transactionRoutes(app: FastifyInstance) {
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

  app.post<{ Body: ITransactionBody }>(
    '/transactions',
    {},
    async (req, res) => {
      const { title, amount } = req.body

      const transaction = await knex('transactions')
        .insert({
          id: randomUUID(),
          title,
          amount,
        })
        .returning('*')

      res.send(transaction)
    },
  )
}
