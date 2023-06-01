import { z } from 'zod'
import { randomUUID } from 'crypto'
import { FastifyInstance } from 'fastify'

import { knex } from '../database'
import { Tables } from 'knex/types/tables'

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
  app.get<{ Querystring: ITransactionQueryString }>('/', async (req, res) => {
    const { title, amount } = req.query

    let transactions: Tables['transactions'][] = []

    if (title && !amount) {
      transactions = await knex('transactions')
        .select('*')
        .where('title', title)
    }
    if (!title && amount) {
      transactions = await knex('transactions')
        .select('*')
        .where('amount', amount)
    }
    if (title && amount) {
      transactions = await knex('transactions').select('*').where({
        title,
        amount,
      })
    }
    if (!title && !amount) {
      transactions = await knex('transactions').select('*')
    }

    return { total: transactions.length, transactions }
  })

  app.get('/:id', async (req, res) => {
    const paramSchema = z.object({
      id: z.string().uuid(),
    })

    let id: string
    try {
      const params = paramSchema.parse(req.params)
      id = params.id
    } catch (error) {
      return res.status(400).send(JSON.parse(String(error)))
    }

    const transaction: Tables['transactions'] | undefined = await knex(
      'transactions',
    )
      .select('*')
      .where('id', id)
      .first()

    if (!transaction) {
      return res.status(400).send('Transaction not found')
    }

    return { transaction }
  })

  app.get('/summary', async () => {
    const summary = await knex('transactions')
      .sum('amount', { as: 'amount' })
      .first()

    return { summary }
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
