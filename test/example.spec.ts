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
