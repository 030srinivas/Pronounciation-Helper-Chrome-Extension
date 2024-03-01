const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());
//from here shreesha -1
// mongoose.connect('mongodb://localhost/wordDatabase', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// });
// const WordSchema = new mongoose.Schema({
//   word1: String
// });
// const WordModel = mongoose.model('Word', WordSchema);

// app.use(bodyParser.json());

//till here -1
app.get('/scrape', async (req, res) => {
  try {
    const url = req.query.url; // Extract the URL parameter from the request query
    console.log('URL:', url);

    // Fetch the list of words from the provided API
    const apiResponse = await axios.get('https://030srinivas.github.io/test_api/word.json');
    console.log('API Response:', apiResponse.data); // Log the entire API response
    const apiWords = apiResponse.data && Array.isArray(apiResponse.data) ? apiResponse.data : [];

    console.log('API Words:', apiWords); // Log the apiWords variable

    if (!apiWords.length) {
      throw new Error('Failed to fetch API words');
    }

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

    // Filter the words array to match words from the API
    const matchedWords = wordsFromWebsite.filter(word => apiWords.includes(word));
    console.log('Matched Words:', matchedWords);

    // Remove repeated words using Set
    const uniqueMatchedWords = [...new Set(matchedWords)];

    // Send the extracted data as the response
    res.json({ matchedWords: uniqueMatchedWords });
  } catch (error) {
    console.error('Error scraping website:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//from here shreesha -2
// app.post('/storeWord', async (req, res) => {
//   const { word1 } = req.body;

//   try {
//     // Create a new document with the provided word
//     const newWord = new WordModel({ word1 });
//     await newWord.save();
//     res.status(200).json({ message: 'Word stored successfully in MongoDB' });
//   } catch (error) {
//     console.error('Error storing word in MongoDB:', error);
//     res.status(500).json({ error: 'Failed to store word in MongoDB' });
//   }
// });
// till here -2

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
