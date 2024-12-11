// FILE: api/data.ts

import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const response = await fetch('https://data.mongodb-api.com/...', {
      headers: new Headers([
        ['Content-Type', 'application/json'],
        ['API-Key', process.env.DATA_API_KEY || ''],
      ]),
    })

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`)
    }

    const data = await response.json()
    res.status(200).json({ data })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}