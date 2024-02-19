
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/wordDatabase', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Failed to connect to MongoDB:', err));

// Define a schema for the words collection
const wordSchema = new mongoose.Schema({
  word: String
});

// Define a model based on the schema
const Word = mongoose.model('Word', wordSchema);

// Middleware to parse JSON bodies
app.use(express.json());

app.get('/scrape', async (req, res) => {
  try {
    const url = req.query.url; // Extract the URL parameter from the request query
    console.log('URL:', url);

    // Fetch words from MongoDB with a timeout mechanism
    let dbWords;
    try {
      const timeoutPromise = new Promise((resolve, reject) => {
        setTimeout(() => {
          reject(new Error('MongoDB operation timed out'));
        }, 10000); // 10 seconds timeout
      });

      const dbWordsPromise = Word.find({}).exec();

      dbWords = await Promise.race([dbWordsPromise, timeoutPromise]);
    } catch (err) {
      console.error('MongoDB operation failed:', err);
      throw new Error('Failed to fetch words from MongoDB');
    }

    const dbWordList = dbWords.map(dbWord => dbWord.word.toLowerCase());
    console.log('Words from MongoDB:', dbWordList);

    // Make a GET request to the specified website
    const response = await axios.get(url);

    // Load the HTML content into Cheerio
    const $ = cheerio.load(response.data);

    // Extract words from the HTML content
    let wordsFromWebsite = [];
    $('body').text().split(/\s+/).forEach(word => {
      word = word.replace(/[^\w\s]/g, ''); // Remove symbols and punctuation
      if (word.trim() !== '') { // Skip empty strings
        wordsFromWebsite.push(word.toLowerCase()); // Convert to lowercase and push to array
      }
    });

    // Filter the words array to match words from MongoDB
    const matchedWordsSet = new Set(wordsFromWebsite.filter(word => dbWordList.includes(word)));

    // Convert Set to array for response
    const matchedWords = Array.from(matchedWordsSet);

    console.log('Matched Words:', matchedWords);

    // Send the extracted data as the response
    res.json({ matchedWords });
  } catch (error) {
    console.error('Error scraping website:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});