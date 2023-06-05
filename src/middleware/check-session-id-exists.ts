import { FastifyReply, FastifyRequest } from 'fastify'

export async function checkSessionIdExists(
  req: FastifyRequest,
  res: FastifyReply,
) {
  const { sessionId } = req.cookies

  if (!sessionId) {
    return res.status(401).send({
      error: 'Unauthorized',
    })
  }

  console.log('REQUEST:', {
    method: req.method,
    url: req.url,
    body: req.body,
    params: req.params,
    query: req.query,
    session_id: sessionId,
  })
}
