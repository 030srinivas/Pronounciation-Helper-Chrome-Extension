chrome.runtime.sendMessage({
    action: "scrapeWebsite",
    url: window.location.href
  });
  