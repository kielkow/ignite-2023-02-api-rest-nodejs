import fastify from 'fastify'

const app = fastify()

app.get('/status', () => {
  return 'server is running'
})

app.listen({ port: 3333 }).then(() => console.log('[server is running]'))
