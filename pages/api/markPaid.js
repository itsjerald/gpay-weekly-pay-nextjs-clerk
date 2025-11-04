import prisma from '../../lib/db'
import { auth } from '@clerk/nextjs/server'

export default async function handler(req, res) {
  const { userId } = auth(req)
  if (!userId) return res.status(401).json({ error: 'Unauthorized' })

  // IMPORTANT: In production, require a step-up MFA check here (Clerk supports this via server-side session claims)
  // For prototype, we trust the session.

  const { txnIds } = req.body
  if (!Array.isArray(txnIds)) return res.status(400).json({ error: 'txnIds required' })

  const update = await prisma.transaction.updateMany({ 
    where: { id: { in: txnIds }, userId: userId }, 
    data: { paid: true, weekPaid: new Date().toISOString().slice(0,10) } 
  })

  await prisma.payment.create({ 
    data: { 
      payerId: req.body.payerId || 'you', 
      payeeId: userId, 
      amount: parseFloat(req.body.amount || 0) || 0, 
      txnRefs: txnIds 
    } 
  })

  res.json({ message: `Marked ${update.count} transactions as paid.` })
}
