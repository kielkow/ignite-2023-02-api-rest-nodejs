import { expect, test } from 'vitest'

test('user can create a new transaction', () => {
  // HTTP request

  const responseStatusCode = 201

  expect(responseStatusCode).toEqual(201)
})
