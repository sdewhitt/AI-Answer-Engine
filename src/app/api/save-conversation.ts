import { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from '../lib/mongodb';
import Conversation from '../models/Conversations';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();

  if (req.method === 'POST') {
    const { id, conversation } = req.body;

    try {
      const newConversation = new Conversation({ id, conversation });
      await newConversation.save();
      res.status(200).json({ message: 'Conversation saved' });
    } catch (error) {
      res.status(500).json({ message: 'Error saving conversation', error });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}