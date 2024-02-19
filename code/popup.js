document.addEventListener('DOMContentLoaded', function () {
  chrome.storage.local.get('scrapedData', function (result) {
    const dataContainer = document.getElementById('data-container');
    if (result.scrapedData) {
      const ul = document.createElement('ul');
      result.scrapedData.forEach(word => {
        const li = document.createElement('li');
        li.textContent = word;
        ul.appendChild(li);
      });
      dataContainer.appendChild(ul);
    } else {
      dataContainer.textContent = 'No data available.';
    }
  });
});
