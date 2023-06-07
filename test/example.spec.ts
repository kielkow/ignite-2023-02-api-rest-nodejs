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
