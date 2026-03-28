// ============================================
// PORTIFY SCRIPT v3.4 - MULTI-COUNTRY SUPPORT
// ============================================

const CONFIG = {
  storageKey: 'portify_bookmarks',
  maxBookmarks: 100
};

const CATEGORIES = {
  news: { icon: '📰', color: '#ef4444', label: 'News' },
  sports: { icon: '⚽', color: '#22c55e', label: 'Sports' },
  work: { icon: '💼', color: '#3b82f6', label: 'Work' },
  social: { icon: '💬', color: '#8b5cf6', label: 'Social' },
  shopping: { icon: '🛒', color: '#f59e0b', label: 'Shopping' },
  entertainment: { icon: '🎬', color: '#ec4899', label: 'Entertainment' },
  finance: { icon: '💰', color: '#06b6d4', label: 'Finance' },
  other: { icon: '📁', color: '#64748b', label: 'Other' }
};

// Detect current country from filename
function getCurrentCountry() {
  const path = window.location.pathname.toLowerCase();
  if (path.includes('usa')) return 'usa';
  if (path.includes('uk')) return 'uk';
  return 'greece'; // default
}

// Default content per country
const COUNTRY_DATA = {
  greece: {
    title: "🇬🇷 Ελληνικά",
    trending: [
      { name: "Google", url: "https://google.com", category: "other" },
      { name: "YouTube", url: "https://youtube.com", category: "entertainment" },
      { name: "Καθημερινή", url: "https://kathimerini.gr", category: "news" },
      { name: "Πρώτο Θέμα", url: "https://protothema.gr", category: "news" },
      { name: "Sport24", url: "https://sport24.gr", category: "sports" }
    ],
    local: [
      { name: "ERT", url: "https://ert.gr", category: "news" },
      { name: "Skroutz", url: "https://skroutz.gr", category: "shopping" },
      { name: "Public", url: "https://public.gr", category: "shopping" },
      { name: "Gazzetta", url: "https://gazzetta.gr", category: "sports" }
    ]
  },
  usa: {
    title: "🇺🇸 Popular USA Sites",
    trending: [
      { name: "Google", url: "https://google.com", category: "other" },
      { name: "YouTube", url: "https://youtube.com", category: "entertainment" },
      { name: "CNN", url: "https://cnn.com", category: "news" },
      { name: "ESPN", url: "https://espn.com", category: "sports" },
      { name: "Reddit", url: "https://reddit.com", category: "social" },
      { name: "Netflix", url: "https://netflix.com", category: "entertainment" }
    ],
    local: [
      { name: "Amazon", url: "https://amazon.com", category: "shopping" },
      { name: "New York Times", url: "https://nytimes.com", category: "news" },
      { name: "Twitch", url: "https://twitch.tv", category: "entertainment" },
      { name: "Wikipedia", url: "https://wikipedia.org", category: "other" },
      { name: "GitHub", url: "https://github.com", category: "work" }
    ]
  }
};

// --- STATE ---
const State = {
  bookmarks: [],

  init() {
    try {
      this.bookmarks = JSON.parse(localStorage.getItem(CONFIG.storageKey)) || [];
    } catch (e) {
      this.bookmarks = [];
    }
    this.render();
  },

  render() {
    this.renderGrid('favoritesGrid', this.bookmarks);
    this.renderCountryContent();
  },

  renderGrid(gridId, items) {
    const grid = document.getElementById(gridId);
    if (!grid) return;
    grid.innerHTML = '';

    if (items.length === 0 && gridId === 'favoritesGrid') {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: #64748b;">
          <p>Κανένα bookmark ακόμα</p>
          <p style="font-size: 0.9rem; margin-top: 8px;">Πρόσθεσε το πρώτο σου παραπάνω!</p>
        </div>`;
      return;
    }

    items.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <img src="https://www.google.com/s2/favicons?sz=64&domain=${item.url}" 
             class="card-icon" onerror="this.src='https://via.placeholder.com/56?text=🔗'">
        <h3>${item.name}</h3>
        <p>${new URL(item.url).hostname.replace('www.', '')}</p>
      `;
      card.onclick = () => window.open(item.url, '_blank');
      grid.appendChild(card);
    });
  },

  renderCountryContent() {
    const country = getCurrentCountry();
    const data = COUNTRY_DATA[country] || COUNTRY_DATA.greece;

    // Trending
    this.renderGrid('trendingGrid', data.trending);

    // Local sites (Greece or USA)
    const localGridId = country === 'greece' ? 'greekGrid' : 'usaGrid';
    const localGrid = document.getElementById(localGridId);
    if (localGrid) {
      this.renderGrid(localGridId, data.local);
    }
  },

  add(bookmark) {
    if (this.bookmarks.length >= CONFIG.maxBookmarks) {
      alert('Μέγιστος αριθμός bookmarks!');
      return;
    }
    this.bookmarks.unshift(bookmark);
    localStorage.setItem(CONFIG.storageKey, JSON.stringify(this.bookmarks));
    this.render();
  }
};

// Smart Input & other functions (keep the rest of your existing logic here)
// For now we keep it minimal so it works

// INIT
document.addEventListener('DOMContentLoaded', () => {
  State.init();
});
