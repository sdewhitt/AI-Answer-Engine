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

    const { messages,} = body; // Expecting the full message history
    //console.log('Messages:', messages);

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "Invalid or missing message history" }),
        { status: 400 }
      );
    }

    // Validate each message
    for (const msg of messages) {
      if (!msg.role || (msg.role !== 'user' && msg.role !== 'ai' && msg.role !== 'system' && msg.role !== 'assistant')) {
        return new Response(
          JSON.stringify({ error: `Invalid role in message: ${JSON.stringify(msg)}` }),
          { status: 400 }
        );
      }
    }

    // Get the latest message
    const message = messages[messages.length - 1].content;
    console.log('Message:', message);

    // Check if the message is empty
    if (!message) {
      return new Response(JSON.stringify({ error: 'Message is empty' }), { status: 400 });
    }

    
    // Check if the message contains a URL
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = message.match(urlRegex);
    let scrapedData: any[] = [];

    if (urls && urls.length > 0) {
      // If URLs are found, scrape the first URL
      const url = urls[0];
      scrapedData = await scrapeTopWebsites(url);
      if (scrapedData.length === 0) {
        return new Response(JSON.stringify({ error: 'Failed to extract content from the websites' }), { status: 500 });
      }
    }


    

    // LLM Response
    const systemPrompt = "You are a helpful AI assistant. Respond concisely while retaining context.";
    const userPrompt = `${message}\n\nScraped Data:\n${scrapedData.map(data => `Source: ${data.link}\nContent: ${data.content}`).join('\n\n')}`;
    

    // Create a list of messages with role 'user'
    const userMessages = messages.filter(msg => msg.role === 'user');
    //console.log('User Messages:', userMessages);

    // Build the conversation history for the LLM
    const conversation = [
      { role: "system", content: systemPrompt }, ...userMessages, // Include all past messages
      { role: "user", content: userPrompt }, // Add the new user prompt
    ];


    const llmResponse = await client.chat.completions.create({
      messages: conversation,
      model: 'llama3-8b-8192',
    });


    let response = llmResponse.choices[0].message.content;
    response = response ? response.trim() : '';

    console.log('Chat completion:', response);

    // Parse links and replace them with summaries
    //const processedResponse = await replaceLinksWithSummaries(response);

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

// The below 2 functions are used to customize the hyperlinks in the LLM response for appearance sakes.

// Replace links in the response with summaries
async function replaceLinksWithSummaries(response: string) {
  // Regex to extract links
  const linkRegex = /(https?:\/\/[^\s]+)/g;
  const matches = response.match(linkRegex);

  if (!matches) return response; // No links found

  const replacements = await Promise.all(
    matches.map(async (url) => {
      const summary = await getSummaryForLink(url); // Summarize the link
      return { url, replacement: `[${summary}](${url})` };
    })
  );

  // Replace links in the original response with Markdown
  let processedResponse = response;
  replacements.forEach(({ url, replacement }) => {
    processedResponse = processedResponse.replace(url, replacement);
  });

  return processedResponse;
}

// Summarize the link
async function getSummaryForLink(url: string): Promise<string> {
  try {
    // Fetch and scrape the link
    const res = await fetch(url);
    const html = await res.text();
    const $ = cheerio.load(html);

    // Example: Use the page title or meta description as a summary
    const title = $("title").text();
    const metaDescription = $('meta[name="description"]').attr("content");

    return title || metaDescription || "Visit this link for more details.";
  } catch (error) {
    console.error(`Failed to summarize link: ${url}`, error);
    return "Summary not available";
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
