document.addEventListener('DOMContentLoaded', function () {
  chrome.storage.local.get('scrapedData', function (result) {
    const dataContainer = document.getElementById('data-container');
    if (result.scrapedData) {
      const ul = document.createElement('ul');
      const currentTime = Date.now();

      result.scrapedData.forEach(word => {
        const li = document.createElement('li');
        li.textContent = word;
        li.classList.add('word-list-item');

        // Add a timestamp to the word in local storage
        const wordData = { word, timestamp: currentTime };
        saveWordToStorage(wordData);

        // Add click event listener to each li element
        li.addEventListener('click', function () {
          searchGoogleForPronunciation(word);
        });

        ul.appendChild(li);
      });
      dataContainer.appendChild(ul);
    } else {
      dataContainer.textContent = 'No data available.';
    }
  });

  // Function to open a new tab and search Google for pronunciation
  function searchGoogleForPronunciation(word) {
    const searchUrl = `https://www.google.com/search?q=pronunciation+of+${encodeURIComponent(word)}`;
    
    // Open a new tab with the Google search URL
    chrome.tabs.create({ url: searchUrl }, function (newTab) {
      // Close the tab after 30 seconds
      setTimeout(function () {
        chrome.tabs.remove(newTab.id);
      }, 30000); // 30 seconds in milliseconds
    });
  }

  // Function to save the word and timestamp to local storage
  function saveWordToStorage(wordData) {
    chrome.storage.local.get('wordList', function (result) {
      let wordList = result.wordList || [];

      // Add the word data to the list
      wordList.push(wordData);

      // Remove words older than 5 hours
      // wordList = wordList.filter(item => (currentTime - item.timestamp) <= 5 * 60 * 60 * 1000);

      // Save the updated word list to local storage
      chrome.storage.local.set({ 'wordList': wordList }, function () {
        console.log('Word added to the list:', wordData.word);
      });
    });
  }
//from here shreeshau -3
  //till here -3
});

// from here -3
document.addEventListener('DOMContentLoaded', function() {
  chrome.storage.local.get('reviewList', function(data) {
    const reviewList = data.reviewList || [];
    const uniqueWords = new Set(reviewList); // Use a Set to store unique words
    const reviewListElement = document.getElementById('reviewList');
    reviewListElement.innerHTML = ''; // Clear existing content
    uniqueWords.forEach(function(word) {
      const li = document.createElement('li');
      li.textContent = word;
      reviewListElement.appendChild(li);
    });
  });
});

//till here -3



