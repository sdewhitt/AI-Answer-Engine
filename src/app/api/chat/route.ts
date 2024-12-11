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

    if (url) {
      // Scrape relevant websites
      const scrapedData = await scrapeWebsite(url);
  
      if (!scrapedData.content) {
        return new Response(JSON.stringify({ error: 'Failed to extract content from the website' }), { status: 500 });
      }
    }


    // LLM Response
    const systemPrompt = 'Be concise.';
    const llmResponse = await client.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: body.message }
      ],
      model: 'llama3-8b-8192',
    });

    const response = llmResponse.choices[0].message.content;

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

// Function to scrape website content
async function scrapeWebsite(url: string) {
  // Launch Puppeteer
  const browser = await puppeteer.launch({
    headless: true, // Run in headless mode
    args: ['--no-sandbox', '--disable-setuid-sandbox'], // Necessary for certain hosting environments
  });

  try {
    const page = await browser.newPage();

    // Navigate to the provided URL
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    // Get the HTML content of the page
    const html = await page.content();

    // Parse the HTML using Cheerio
    const $ = cheerio.load(html);

    // Extract the title and main content
    const title = $('title').text();
    const content = $('p')
      .map((i, el) => $(el).text())
      .get()
      .join(' ');

    return { title, content };
  } catch (error) {
    console.error('Error during web scraping:', error);
    throw new Error('Failed to scrape website');
  } finally {
    await browser.close();
  }
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
