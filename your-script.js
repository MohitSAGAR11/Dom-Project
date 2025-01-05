const apiKey = "f350bf5caaa24e278cc578fcf7a23f6a"; // Replace with your NewsAPI key

document.addEventListener("DOMContentLoaded", () => {
  const searchForm = document.getElementById("search-form");
  const articlesContainer = document.getElementById("articles-container");
  const showBookmarkedBtn = document.getElementById("show-bookmarked-btn");

  // Create a floating bookmarks container
  const bookmarksContainer = document.createElement("div");
  bookmarksContainer.id = "bookmarks-container";
  bookmarksContainer.style.display = "none";
  bookmarksContainer.style.position = "absolute";
  bookmarksContainer.style.top = "10px";
  bookmarksContainer.style.right = "10px";
  bookmarksContainer.style.width = "300px";
  bookmarksContainer.style.maxHeight = "80vh";
  bookmarksContainer.style.overflowY = "auto";
  bookmarksContainer.style.backgroundColor = "#fff";
  bookmarksContainer.style.border = "1px solid #ccc";
  bookmarksContainer.style.borderRadius = "8px";
  bookmarksContainer.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
  bookmarksContainer.style.padding = "10px";
  bookmarksContainer.style.zIndex = "1000";

  document.body.appendChild(bookmarksContainer);

  searchForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const category = document.getElementById("category").value;
    articlesContainer.innerHTML = "<p>Loading articles...</p>";

    try {
      const articles = await fetchNews(category);
      articlesContainer.innerHTML = "";
      articles.forEach((article) => {
        const articleElement = document.createElement("div");
        articleElement.className = "article";
        articleElement.innerHTML = `
          <h3>${article.title}</h3>
          <p>${article.description || "No description available."}</p>
          <p>Sentiment: <strong>${article.sentiment}</strong></p>
          <a href="${article.url}" target="_blank">Read more</a>
          <button class="bookmark-btn" data-url="${article.url}">Bookmark</button>
        `;
        articlesContainer.appendChild(articleElement);

        // Add event listener to bookmark the article
        articleElement.querySelector(".bookmark-btn").addEventListener("click", () => {
          bookmarkArticle(article);
        });
      });
    } catch (error) {
      articlesContainer.innerHTML = `<p>Error: ${error.message}</p>`;
    }
  });

  showBookmarkedBtn.addEventListener("click", () => {
    toggleBookmarksPanel();
  });

  function toggleBookmarksPanel() {
    if (bookmarksContainer.style.display === "none") {
      populateBookmarksPanel();
      bookmarksContainer.style.display = "block";
    } else {
      bookmarksContainer.style.display = "none";
    }
  }

  function populateBookmarksPanel() {
    const bookmarks = JSON.parse(localStorage.getItem("bookmarks")) || [];
    bookmarksContainer.innerHTML = `<h3>Bookmarked Articles</h3>`;

    if (bookmarks.length === 0) {
      bookmarksContainer.innerHTML += "<p>No bookmarked articles.</p>";
      return;
    }

    bookmarks.forEach((article) => {
      const articleElement = document.createElement("div");
      articleElement.className = "article";
      articleElement.style.marginBottom = "10px";
      articleElement.style.paddingBottom = "10px";
      articleElement.style.borderBottom = "1px solid #eee";
      articleElement.innerHTML = `
        <h4>${article.title}</h4>
        <p>${article.description || "No description available."}</p>
        <a href="${article.url}" target="_blank">Read more</a>
      `;
      bookmarksContainer.appendChild(articleElement);
    });
  }
});

async function fetchNews(category) {
  const newsResponse = await fetch(
    `https://newsapi.org/v2/top-headlines?category=${category}&apiKey=${apiKey}`
  );
  const newsData = await newsResponse.json();

  if (!newsData.articles) {
    throw new Error("No articles found.");
  }

  const articlesWithSentiment = await Promise.all(
    newsData.articles.map(async (article) => {
      const sentiment = await analyzeSentiment(article.description);
      return { ...article, sentiment };
    })
  );

  return articlesWithSentiment;
}

async function analyzeSentiment(text) {
  if (!text) return "neutral";

  try {
    const response = await fetch("https://sentim-api.herokuapp.com/api/v1/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ text })
    });

    const data = await response.json();
    return data.result.polarity; // Returns "positive", "negative", or "neutral"
  } catch (error) {
    console.error("Error analyzing sentiment:", error);
    return "neutral"; // Default sentiment if there's an error
  }
}

function bookmarkArticle(article) {
  let bookmarks = JSON.parse(localStorage.getItem("bookmarks")) || [];

  // Check if the article is already bookmarked
  if (!bookmarks.some((bookmark) => bookmark.url === article.url)) {
    bookmarks.push(article);
    localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
    alert("Article bookmarked!");
  } else {
    alert("This article is already bookmarked.");
  }
}
