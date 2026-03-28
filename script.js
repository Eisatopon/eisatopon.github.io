// ============================================
// PORTIFY SCRIPT v3.1 - STABLE VERSION
// ============================================

const CONFIG = {
  storageKey: 'portify_v3_bookmarks',
  maxBookmarks: 100
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

      case 'math':
      case 'geometry':
      case 'puzzle':
      case 'olympiad':
        return `https://www.eisatopon.gr/?s=${query}`;

      default:
        if (raw.includes('youtube')) {
          return `https://www.youtube.com/results?search_query=${encodeURIComponent(raw.replace('youtube', ''))}`;
        }

        if (raw.includes('news')) {
          return `https://news.google.com/search?q=${query}`;
        }

        if (raw.includes('map')) {
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

        return `https://www.google.com/search?q=${query}`;
    }
  }
};

// --- STATE ---
const State = {
  bookmarks: [],

  init() {
    try {
      this.bookmarks = JSON.parse(localStorage.getItem(CONFIG.storageKey)) || [];
    } catch {
      this.bookmarks = [];
    }
    this.render();
  },

  add(bookmark) {
    if (this.bookmarks.length >= CONFIG.maxBookmarks) {
      alert('Έφτασες το όριο των 100 bookmarks');
      return;
    }

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

          <img 
            class="card-icon"
            src="https://www.google.com/s2/favicons?sz=64&domain=${domain}"
            alt="${b.name}"
          >

          <div class="card-title">${b.name}</div>
          <div class="card-url">${domain}</div>

          <button 
            style="position:absolute; top:6px; right:6px; background:#ef4444; color:white; border:none; border-radius:50%; width:22px; height:22px; cursor:pointer;"
            onclick="event.stopPropagation();State.remove(${i})"
          >×</button>

        </div>
      `;
    }).join('');

    // count
    const count = document.getElementById('myBookmarksCount');
    if (count) count.textContent = `${this.bookmarks.length} items`;
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

    const isUrl = this.isValidUrl(value);

    if (isUrl) {
      const url = value.startsWith('http') ? value : 'https://' + value;

      const name = this.extractName(url);

      State.add({
        name: name,
        url: url
      });

    } else {
      const url = AISearch.resolve(value);
      window.open(url, '_blank');
    }

    input.value = '';
  },

  isValidUrl(value) {
    return value.includes('.') && !value.includes(' ');
  },

  extractName(url) {
    try {
      return new URL(url)
        .hostname
        .replace('www.', '')
        .split('.')[0]
        .toUpperCase();
    } catch {
      return url;
    }
  }
};

// --- INIT ---
document.addEventListener('DOMContentLoaded', () => {
  State.init();
  SmartInput.init();
});
