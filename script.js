// ============================================
// PORTIFY SCRIPT v3.2 - FULL WORKING FIX
// ============================================

const CONFIG = {
  storageKey: 'portify_v3_bookmarks',
  maxBookmarks: 100
};

// DEFAULT DATA
const DEFAULT = {
  trending: [
    { name: 'Google', url: 'https://google.com' },
    { name: 'YouTube', url: 'https://youtube.com' },
    { name: 'GitHub', url: 'https://github.com' },
    { name: 'Reddit', url: 'https://reddit.com' }
  ],
  greek: [
    { name: 'Καθημερινή', url: 'https://kathimerini.gr' },
    { name: 'Πρώτο Θέμα', url: 'https://protothema.gr' },
    { name: 'News247', url: 'https://news247.gr' },
    { name: 'Sport24', url: 'https://sport24.gr' }
  ]
};

// --- AI SEARCH ---
const AISearch = {
  resolve(input) {
    const raw = input.toLowerCase();

    if (raw.startsWith('yt ') || raw.includes('youtube')) {
      return `https://www.youtube.com/results?search_query=${encodeURIComponent(raw.replace('yt ', '').replace('youtube', ''))}`;
    }

    if (raw.startsWith('news')) {
      return `https://news.google.com/search?q=${encodeURIComponent(raw)}`;
    }

    if (raw.includes('maps')) {
      return `https://www.google.com/maps/search/${encodeURIComponent(raw)}`;
    }

    if (raw.includes('reddit')) {
      return `https://www.reddit.com/search/?q=${encodeURIComponent(raw)}`;
    }

    if (raw.includes('github')) {
      return `https://github.com/search?q=${encodeURIComponent(raw)}`;
    }

    if (raw.includes('math') || raw.includes('geometry')) {
      return `https://www.eisatopon.gr/?s=${encodeURIComponent(raw)}`;
    }

    return `https://www.google.com/search?q=${encodeURIComponent(raw)}`;
  }
};

// --- STATE ---
const State = {
  bookmarks: [],

  init() {
    this.bookmarks = JSON.parse(localStorage.getItem(CONFIG.storageKey)) || [];
    this.render();
    this.renderDefaults();
  },

  add(bookmark) {
    this.bookmarks.unshift(bookmark);
    localStorage.setItem(CONFIG.storageKey, JSON.stringify(this.bookmarks));
    this.render();
  },

  remove(index) {
    this.bookmarks.splice(index, 1);
    localStorage.setItem(CONFIG.storageKey, JSON.stringify(this.bookmarks));
    this.render();
  },

  render() {
    const grid = document.getElementById('favoritesGrid');
    if (!grid) return;

    grid.innerHTML = this.bookmarks.map((b, i) => {
      let domain = '';

      try {
        domain = new URL(b.url).hostname;
      } catch {
        domain = b.url;
      }

      return `
        <div class="card" onclick="window.open('${b.url}','_blank')">
          <img class="card-icon" src="https://www.google.com/s2/favicons?sz=64&domain=${domain}">
          <div class="card-title">${b.name}</div>
          <div class="card-url">${domain}</div>
          <button onclick="event.stopPropagation();State.remove(${i})" style="position:absolute;top:5px;right:5px;">×</button>
        </div>
      `;
    }).join('');

    document.getElementById('myBookmarksCount').textContent = `${this.bookmarks.length} items`;
  },

  renderDefaults() {
    document.getElementById('trendingGrid').innerHTML =
      DEFAULT.trending.map(b => this.card(b)).join('');

    document.getElementById('greekGrid').innerHTML =
      DEFAULT.greek.map(b => this.card(b)).join('');
  },

  card(b) {
    let domain = '';
    try {
      domain = new URL(b.url).hostname;
    } catch {
      domain = b.url;
    }

    return `
      <div class="card" onclick="window.open('${b.url}','_blank')">
        <img class="card-icon" src="https://www.google.com/s2/favicons?sz=64&domain=${domain}">
        <div class="card-title">${b.name}</div>
        <div class="card-url">${domain}</div>
      </div>
    `;
  }
};

// --- INPUT ---
const SmartInput = {
  init() {
    const input = document.getElementById('smartInput');
    const btn = document.getElementById('addBtn');

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.handle(input);
    });

    btn.addEventListener('click', () => this.handle(input));
  },

  handle(input) {
    const value = input.value.trim();
    if (!value) return;

    if (value.includes('.') && !value.includes(' ')) {
      const url = value.startsWith('http') ? value : 'https://' + value;

      State.add({
        name: url.split('.')[0].replace('https://', ''),
        url: url
      });

    } else {
      window.open(AISearch.resolve(value), '_blank');
    }

    input.value = '';
  }
};

// --- SEARCH BAR (TOP) ---
const TopSearch = {
  init() {
    const input = document.getElementById('searchInput');

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        window.open(AISearch.resolve(input.value), '_blank');
      }
    });
  }
};

// --- INIT ---
document.addEventListener('DOMContentLoaded', () => {
  State.init();
  SmartInput.init();
  TopSearch.init();
});
