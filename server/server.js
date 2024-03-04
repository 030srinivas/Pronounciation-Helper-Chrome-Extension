const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

class TrieNode {
    constructor() {
        this.children = new Map();
        this.isEndOfWord = false;
    }
}

class Trie {
    constructor() {
        this.root = new TrieNode();
    }

    insert(word) {
        let current = this.root;
        for (let char of word) {
            if (!current.children.has(char)) {
                current.children.set(char, new TrieNode());
            }
            current = current.children.get(char);
        }
        current.isEndOfWord = true;
    }

    search(word) {
        let current = this.root;
        for (let char of word) {
            if (!current.children.has(char)) {
                return false;
            }
            current = current.children.get(char);
        }
        return current.isEndOfWord;
    }
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

app.get('/scrape', async (req, res) => {
    try {
        const url = req.query.url; // Extract the URL parameter from the request query
        console.log('URL:', url);

        // Fetch the list of words from the provided API
        const apiResponse = await axios.get('https://030srinivas.github.io/Misspelledwords-api/words.json');
        console.log('API Response:', apiResponse.data); // Log the entire API response
        const apiWords = apiResponse.data && Array.isArray(apiResponse.data) ? apiResponse.data : [];

        console.log('API Words:', apiWords); // Log the apiWords variable

        if (!apiWords.length) {
            throw new Error('Failed to fetch API words');
        }

        // Build a Trie from the API words
        const trie = new Trie();
        apiWords.forEach(word => trie.insert(word.toLowerCase()));

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

        // Filter the words array to match words from the API using Trie
        const matchedWords = wordsFromWebsite.filter(word => trie.search(word));
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

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
