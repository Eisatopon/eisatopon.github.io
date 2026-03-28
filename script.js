// ============================================
// PORTIFY SCRIPT v3.0 - AI UPGRADE
// ============================================

const CONFIG = {
  storageKey: 'portify_v3_bookmarks',
  maxBookmarks: 100,
  debounceDelay: 150
};

// --- AI SEARCH ENGINE ---
const AISearch = {
  resolve(input) {
    const raw = input.trim().toLowerCase();
    const parts = raw.split(' ');
    const command = parts[0];
    const rest = parts.slice(1).join(' ');
    const query = encodeURIComponent(rest || raw);

    switch (command) {
      case 'youtube':
      case 'yt':
        return `https://www.youtube.com/results?search_query=${query}`;

      case 'news':
        return `https://news.google.com/search?q=${query}`;

      case 'translate':
        return `https://translate.google.com/?sl=auto&tl=en&text=${query}&op=translate`;

      case 'maps':
        return `https://www.google.com/maps/search/${query}`;

      case 'reddit':
        return `https://www.reddit.com/search/?q=${query}`;

      case 'github':
        return `https://github.com/search?q=${query}`;

      // 💥 YOUR ADVANTAGE
      case 'math':
      case 'geometry':
      case 'puzzle':
      case 'olympiad':
        return `https://www.eisatopon.gr/?s=${query}`;

      default:
        // Smart detection
        if (raw.includes('youtube')) {
          return `https://www.youtube.com/results?search_query=${encodeURIComponent(raw.replace('youtube', ''))}`;
        }

        if (raw.includes('news')) {
          return `https://news.google.com/search?q=${query}`;
        }

        if (raw.includes('map') || raw.includes('maps')) {
          return `https://www.google.com/maps/search/${query}`;
        }

        if (raw.includes('translate')) {
          return `https://translate.google.com/?sl=auto&tl=en&text=${query}&op=translate`;
        }

        if (raw.includes('reddit')) {
          return `https://www.reddit.com/search/?q=${query}`;
        }

        if (raw.includes('github')) {
          return `https://github.com/search?q=${query}`;
        }

        // Default
        return `https://www.google.com/search?q=${query}`;
    }
  }
};

// --- CATEGORIES ---
const CATEGORIES = {
  news: { icon: '📰' },
  sports: { icon: '⚽' },
  work: { icon: '💼' },
  social: { icon: '💬' },
  shopping: { icon: '🛒' },
  entertainment: { icon: '🎬' },
  finance: { icon: '💰' },
  other: { icon: '📁' }
};

// --- STATE ---
const State = {
  bookmarks: [],

  init() {
    this.bookmarks = JSON.parse(localStorage.getItem(CONFIG.storageKey)) || [];
    this.render();
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

    grid.innerHTML = this.bookmarks.map((b, i) => `
      <div class="card" onclick="window.open('${b.url}','_blank')">
        <img src="https://www.google.com/s2/favicons?sz=64&domain=${new URL(b.url).hostname}">
        <div>${b.name}</div>
        <button onclick="event.stopPropagation();State.remove(${i})">×</button>
      </div>
    `).join('');
  }
};

// --- SMART INPUT ---
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

    const isUrl = value.includes('.') && !value.includes(' ');

    if (isUrl) {
      const url = value.startsWith('http') ? value : 'https://' + value;

      State.add({
        name: url.replace('https://', '').split('.')[0],
        url: url
      });

    } else {
      const url = AISearch.resolve(value);
      window.open(url, '_blank');
    }

    input.value = '';
  }
};

// --- INIT ---
document.addEventListener('DOMContentLoaded', () => {
  State.init();
  SmartInput.init();
});
