import { z } from 'zod'
import { randomUUID } from 'crypto'
import { FastifyInstance } from 'fastify'
import { Tables } from 'knex/types/tables'

import { knex } from '../database'
import { checkSessionIdExists } from '../middleware/check-session-id-exists'

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
  app.get<{ Querystring: ITransactionQueryString }>(
    '/',
    { preHandler: [checkSessionIdExists] },
    async (req, res) => {
      const options = {
        ...req.query,
        session_id: req.cookies.sessionId,
      }

      const transactions: Tables['transactions'][] = await knex('transactions')
        .select('*')
        .where(options)

      res.send({ total: transactions.length, transactions })
    },
  )

  app.get('/:id', { preHandler: [checkSessionIdExists] }, async (req, res) => {
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
      .where({ id, session_id: req.cookies.sessionId })
      .first()

    if (!transaction) {
      return res.status(400).send('Transaction not found')
    }

    res.send({ transaction })
  })

  app.get(
    '/summary',
    { preHandler: [checkSessionIdExists] },
    async (req, res) => {
      const summary = await knex('transactions')
        .sum('amount', { as: 'amount' })
        .where({ session_id: req.cookies.sessionId })
        .first()

      res.send({ summary })
    },
  )

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

    let sessionId = req.cookies.sessionId
    if (!sessionId) {
      sessionId = randomUUID()

      res.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      })
    }

    const transaction = await knex('transactions')
      .insert({
        id: randomUUID(),
        title,
        amount: type === 'credit' ? amount : amount * -1,
        session_id: sessionId,
      })
      .returning('*')

    res.send(transaction)
  })
}
