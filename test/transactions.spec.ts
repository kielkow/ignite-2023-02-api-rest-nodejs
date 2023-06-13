import request from 'supertest'
import { execSync } from 'child_process'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { app } from '../src/app'

describe('TRANSACTIONS ROUTES', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  it('should be able create a new transaction', async () => {
    const response = await request(app.server).post('/transactions').send({
      title: 'new_transaction',
      amount: 1000,
      type: 'credit',
    })

    expect(response.statusCode).toEqual(201)
  })

  it('should be able list transactions', async () => {
    const responseCreateTransaction = await request(app.server)
      .post('/transactions')
      .send({
        title: 'new_transaction',
        amount: 1000,
        type: 'credit',
      })

    const sessionId = responseCreateTransaction.get('Set-Cookie')

    const response = await request(app.server)
      .get('/transactions')
      .set('Cookie', sessionId)

    expect(response.statusCode).toEqual(200)
    expect(response.body).toBeTruthy()
    expect(response.body.total).toEqual(1)
    expect(response.body.transactions.length).toEqual(1)
    expect(response.body.transactions).toEqual([
      expect.objectContaining({
        title: 'new_transaction',
        amount: 1000,
      }),
    ])
  })

  it('should be able get a transaction', async () => {
    const responseCreateTransaction = await request(app.server)
      .post('/transactions')
      .send({
        title: 'new_transaction',
        amount: 1000,
        type: 'credit',
      })

    const sessionId = responseCreateTransaction.get('Set-Cookie')

    const { body: transactionsData } = await request(app.server)
      .get('/transactions')
      .set('Cookie', sessionId)

    const transactionId = transactionsData.transactions[0].id

    const response = await request(app.server)
      .get(`/transactions/${transactionId}`)
      .set('Cookie', sessionId)

    expect(response.statusCode).toEqual(200)
    expect(response.body).toBeTruthy()
    expect(response.body.transaction).toBeTruthy()
    expect(response.body.transaction.id).toEqual(transactionId)
  })

  it('should be able get transactions summary', async () => {
    const transaction1 = await request(app.server).post('/transactions').send({
      title: 'new_transaction',
      amount: 4000,
      type: 'credit',
    })

    const sessionId = transaction1.get('Set-Cookie')

    const transaction2 = await request(app.server)
      .post('/transactions')
      .send({
        title: 'new_transaction',
        amount: 2000,
        type: 'debit',
      })
      .set('Cookie', sessionId)

    const amount = transaction1.body[0].amount + transaction2.body[0].amount

    const response = await request(app.server)
      .get('/transactions/summary')
      .set('Cookie', sessionId)

    expect(response.statusCode).toEqual(200)
    expect(response.body).toBeTruthy()
    expect(response.body.summary).toBeTruthy()
    expect(response.body.summary.amount).toEqual(amount)
  })
})
