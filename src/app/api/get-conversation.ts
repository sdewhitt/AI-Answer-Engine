import { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from '../lib/mongodb';
import Conversation from '../models/Conversations';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();

  const { id } = req.query;

  try {
    const conversation = await Conversation.findOne({ id });
    if (conversation) {
      res.status(200).json({ conversation: conversation.conversation });
    } else {
      res.status(404).json({ message: 'Conversation not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving conversation', error });
  }
}