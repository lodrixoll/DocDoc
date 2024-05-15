import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { messages, model = 'gpt-4o' } = req.body;

    if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'Invalid request body' });
    }

    try {
        const completion = await openai.chat.completions.create({
            messages,
            model,
        });

        res.status(200).json(completion.choices[0].message);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch completion from OpenAI' });
    }
}