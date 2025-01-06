const url = 'https://real-time-news-data.p.rapidapi.com/topic-news-by-section?topic=TECHNOLOGY&section=CAQiW0NCQVNQZ29JTDIwdk1EZGpNWFlTQW1WdUdnSlZVeUlQQ0FRYUN3b0pMMjB2TURKdFpqRnVLaGtLRndvVFIwRkVSMFZVWDFORlExUkpUMDVmVGtGTlJTQUJLQUEqKggAKiYICiIgQ0JBU0Vnb0lMMjB2TURkak1YWVNBbVZ1R2dKVlV5Z0FQAVAB&limit=500&country=US&lang=en';
const options = {
  method: 'GET',
  headers: {
    'x-rapidapi-key': '648010dcdfmsh36268f042517036p153de9jsnbc1642c9d808',
    'x-rapidapi-host': 'real-time-news-data.p.rapidapi.com'
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const fetchNewsBtn = document.getElementById("fetch-news-btn");
  const articlesContainer = document.getElementById("articles-container");

  fetchNewsBtn.addEventListener("click", async () => {
    articlesContainer.innerHTML = "<p>Loading articles...</p>";

    try {
      const articles = await fetchNews();
      articlesContainer.innerHTML = "";
      articles.forEach((article) => {
        const articleElement = document.createElement("div");
        articleElement.className = "article";
        articleElement.innerHTML = `
          <h3>${article.title}</h3>
          <p>${article.description || "No description available."}</p>
          <a href="${article.url}" target="_blank">Read more</a>
        `;
        articlesContainer.appendChild(articleElement);
      });
    } catch (error) {
      articlesContainer.innerHTML = `<p>Error: ${error.message}</p>`;
    }
  });

  async function fetchNews() {
    const response = await fetch(url, options);
    const data = await response.json();

    if (!data || !data.articles) {
      throw new Error("No articles found.");
    }

    return data.articles;
  }
});
