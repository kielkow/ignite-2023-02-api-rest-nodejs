import request from 'supertest'
import { afterAll, beforeAll, expect, test } from 'vitest'

import { app } from '../src/app'

beforeAll(async () => {
  await app.ready()
})

afterAll(async () => {
  await app.close()
})

test('user can create a new transaction', async () => {
  const response = await request(app.server).post('/transactions').send({
    title: 'new_transaction',
    amount: 1000,
    type: 'credit',
  })

  expect(response.statusCode).toEqual(201)
})

test('user can list transactions', async () => {
  const responseCreateTransaction = await request(app.server)
    .post('/transactions')
    .send({
      title: 'new_transaction',
      amount: 1000,
      type: 'credit',
    })

  const sessionId = responseCreateTransaction.headers['set-cookie'][0]

  const response = await request(app.server)
    .get('/transactions')
    .set('Cookie', sessionId)

  expect(response.statusCode).toEqual(200)
  expect(response.body).toBeTruthy()
  expect(response.body.total).toEqual(1)
  expect(response.body.transactions.length).toEqual(1)
})

test('user can get a transaction', async () => {
  const responseCreateTransaction = await request(app.server)
    .post('/transactions')
    .send({
      title: 'new_transaction',
      amount: 1000,
      type: 'credit',
    })

  const sessionId = responseCreateTransaction.headers['set-cookie'][0]

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

test('user can get transactions summary', async () => {
  const transaction1 = await request(app.server).post('/transactions').send({
    title: 'new_transaction',
    amount: 4000,
    type: 'credit',
  })

  const sessionId = transaction1.headers['set-cookie'][0]

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
