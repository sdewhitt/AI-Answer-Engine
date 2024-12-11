// FILE: api/data.ts


import { NextApiRequest, NextApiResponse } from 'next'
import clientPromise from '../../lib/mongodb'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const client = await clientPromise
    const db = client.db('your-database-name')

    const data = await db.collection('your-collection-name').find({}).toArray()

    res.status(200).json({ data })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data' })
  }
}