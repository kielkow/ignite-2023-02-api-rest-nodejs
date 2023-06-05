import { FastifyReply, FastifyRequest } from 'fastify'

export function checkSessionIdExists(req: FastifyRequest, res: FastifyReply) {
  const { sessionId } = req.cookies

  if (!sessionId) {
    return res.status(401).send({
      error: 'Unauthorized',
    })
  }
}
