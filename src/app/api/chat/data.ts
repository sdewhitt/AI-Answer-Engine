// FILE: api/data.ts


import { NextApiRequest, NextApiResponse } from 'next'
import { MongoClient } from 'mongodb'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
    }
    const client = await MongoClient.connect(uri)
    const db = client.db('your-database-name')

    const data = await db.collection('your-collection-name').find({}).toArray()

    res.status(200).json({ data })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data' })
  }
}