// TODO: Implement the chat API with Groq and web scraping with Cheerio and Puppeteer
// Refer to the Next.js Docs on how to read the Request body: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
// Refer to the Groq SDK here on how to use an LLM: https://www.npmjs.com/package/groq-sdk
// Refer to the Cheerio docs here on how to parse HTML: https://cheerio.js.org/docs/basics/loading
// Refer to Puppeteer docs here: https://pptr.dev/guides/what-is-puppeteer

import Groq from 'groq-sdk';
import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';


const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function POST(req: Request) {
  try {
    //console.log('POST request received:', req);

    // Read and parse the request body
    const body = await req.json();
    console.log('Request body:', body);

    const {message, url} = body;
    // Check if the message is empty
    if (!message) {
      return new Response(JSON.stringify({ error: 'Message is empty' }), { status: 400 });
    }

    let scrapedData: any[] = [];
    if (url) {
      scrapedData = await scrapeTopWebsites(url);
      if (scrapedData.length === 0) {
        return new Response(JSON.stringify({ error: 'Failed to extract content from the websites' }), { status: 500 });
      }
    } else {
      console.log('No URL provided');
    }


    // LLM Response
    const systemPrompt = 'Be clear and concise, but not as robotic.';
    const userPrompt = `${message}\n\nScraped Data:\n${scrapedData.map(data => `Source: ${data.link}\nContent: ${data.content}`).join('\n\n')}`;
    const llmResponse = await client.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt } // content used to be body.message
      ],
      model: 'llama3-8b-8192',
    });

    let response = llmResponse.choices[0].message.content;
    response = response ? response.trim() : '';

    console.log('Chat completion:', response);

    return new Response(JSON.stringify({ message: response }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in POST request:', error);
    return new Response(JSON.stringify({ error: error }), { status: 500 });
  }
}

async function scrapeTopWebsites(query: string) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(`https://www.google.com/search?q=${encodeURIComponent(query)}`);

  const links = await page.evaluate(() => {
    const anchors = Array.from(document.querySelectorAll('a'));
    return anchors.map(anchor => anchor.href).slice(0, 5);
  });

  const scrapedData = [];
  for (const link of links) {
    await page.goto(link);
    const content = await page.evaluate(() => document.body.innerText);
    scrapedData.push({ link, content });
  }

  await browser.close();
  return scrapedData;
}





// Caching
export const dynamic = 'force-static'
 
export async function GET() {
  const res = await fetch('https://data.mongodb-api.com/...', {
    headers: new Headers([
      ['Content-Type', 'application/json'],
      ['API-Key', process.env.DATA_API_KEY || ''],
    ]),
  })
  const data = await res.json()
 
  return Response.json({ data })
}
