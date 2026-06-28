const express = require('express');
const app = express();
const port = 3000;
const Groq = require('groq-sdk');
const cors = require('cors');
require('dotenv').config();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const chunkDelayMs = Number(10);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello World!');
});
app.post('/api/chat', async (req, res) => {
  try {
    const stream = await groq.chat.completions.create({
      messages: req.body.messages,
      model: "llama-3.3-70b-versatile",
      stream: true,
    });
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Transfer-Encoding', 'chunked');
    for await (const chunk of stream) {
      const data = chunk.choices[0].delta?.content;
      if (data) {
        res.write(data);
        if (chunkDelayMs > 0) {
          await sleep(chunkDelayMs);
        }
      }
    }
    res.end();

  }

  catch (error) {
    console.error('Error setting headers:', error);
    res.status(500).send('Internal Server Error');
    return;
  }

});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
