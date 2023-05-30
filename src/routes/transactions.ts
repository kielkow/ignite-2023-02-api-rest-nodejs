import { z } from 'zod'
import { randomUUID } from 'crypto'
import { FastifyInstance } from 'fastify'

import { knex } from '../database'

interface ITransactionBody {
  title: string
  amount: number
  type: 'credit' | 'debit'
}

interface ITransactionQueryString {
  title: string
  amount: number
}

export async function transactionRoutes(app: FastifyInstance) {
  app.get<{ Querystring: ITransactionQueryString }>('/', (req, res) => {
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
  })

  app.post<{ Body: ITransactionBody }>('/', {}, async (req, res) => {
    const transactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['credit', 'debit']),
    })

    let transactionBody: ITransactionBody
    try {
      transactionBody = transactionBodySchema.parse(req.body)
    } catch (error) {
      return res.status(400).send(JSON.parse(String(error)))
    }

    const { title, amount, type } = transactionBody

    const transaction = await knex('transactions')
      .insert({
        id: randomUUID(),
        title,
        amount: type === 'credit' ? amount : amount * -1,
      })
      .returning('*')

    res.send(transaction)
  })
}
