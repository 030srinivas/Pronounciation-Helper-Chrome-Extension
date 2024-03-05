// chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
//   if (request.action === "scrapeWebsite") {
//     // Handle the scrapeWebsite action
//     fetch('http://localhost:3000/scrape?url=' + encodeURIComponent(request.url))
//       .then(response => response.json())
//       .then(data => {
//         chrome.storage.local.set({ 'scrapedData': data.matchedWords });
//       })
//       .catch(error => console.error('Error scraping website:', error));
//   }
// });


chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "scrapeWebsite") {
    fetch('http://localhost:3000/scrape?url=' + encodeURIComponent(request.url))
      .then(response => response.json())
      .then(data => {
        // Get existing scraped data
        chrome.storage.local.get('scrapedData', function(existingData) {
          let storedWords = existingData.scrapedData || [];
          // Add new words from the current website, avoiding repetition
          data.matchedWords.forEach(word => {
            if (!storedWords.includes(word)) {
              storedWords.push(word);
            }
          });
          // Update the scrapedData in local storage
          chrome.storage.local.set({ 'scrapedData': storedWords }, function() {
            console.log('Scraped data updated:', storedWords);
          });
          // Set a timeout to delete the stored words after 10 seconds
          setTimeout(function () {
            chrome.storage.local.remove('scrapedData', function () {
              console.log('Stored words deleted after 100 seconds');
            });
          }, 100 * 1000);
        });
      })
      .catch(error => console.error('Error scraping website:', error));
  }
});

// Rest of your existing code remains unchanged


chrome.runtime.onInstalled.addListener(function () {
  chrome.contextMenus.create({
    title: "Quick Pronunciation Search",
    contexts: ["selection"],
    id: "searchGoogle"
  });

  // chrome.contextMenus.create({
  //   title: "Pronunciation",
  //   contexts: ["selection"],
  //   id: "pronounceWord"
  // });
   chrome.contextMenus.create({
    title: "Add to review",
    contexts: ["selection"],
    id: "addToReview"
  });

});

function storeSelectedText(selectedText) {
  chrome.storage.local.get('reviewList', function(data) {
      const reviewList = data.reviewList || [];
      reviewList.push(selectedText);
      chrome.storage.local.set({ 'reviewList': reviewList }, function() {
          console.log('Selected text stored in local storage:', selectedText);
          setTimeout(function() {
              deleteStoredText(selectedText); // Check if deleteStoredText is defined
          }, 30 * 1000); 
      });
  });
}

// Handle context menu click
chrome.contextMenus.onClicked.addListener(function (info, tab) {
  var selectedText = info.selectionText.trim();
  var searchUrl;

  if (info.menuItemId === "searchGoogle") {
    searchUrl = 'https://www.google.com/search?q=' + encodeURIComponent(selectedText + " pronunciation");
  }
  if (info.menuItemId === 'addToReview' && info.selectionText) {
    storeSelectedText(info.selectionText);
  }
  // till here -2
  if (searchUrl) {
    chrome.tabs.create({ url: searchUrl }, function (createdTab) {
      setTimeout(function () {
        chrome.tabs.remove(createdTab.id, function () {
          console.log('Tab closed successfully');
        });
      }, 30 * 1000);
    });
  }
});