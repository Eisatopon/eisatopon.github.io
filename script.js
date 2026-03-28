// ============================================
// PORTIFY SCRIPT v2.4 - με μικρές βελτιώσεις
// ============================================

const CONFIG = {
  storageKey: 'portify_v2_bookmarks',
  maxBookmarks: 100
};

const CATEGORIES = {
  news:        { icon: '📰', color: '#ef4444', label: 'Ειδήσεις' },
  sports:      { icon: '⚽', color: '#22c55e', label: 'Αθλητικά' },
  work:        { icon: '💼', color: '#3b82f6', label: 'Εργασία' },
  social:      { icon: '💬', color: '#8b5cf6', label: 'Social' },
  shopping:    { icon: '🛒', color: '#f59e0b', label: 'Shopping' },
  entertainment: { icon: '🎬', color: '#ec4899', label: 'Ψυχαγωγία' },
  finance:     { icon: '💰', color: '#06b6d4', label: 'Οικονομικά' },
  other:       { icon: '📁', color: '#64748b', label: 'Άλλο' }
};

const DEFAULT_BOOKMARKS = {
  trending: [ /* ίδιο όπως πριν */ ],
  greek: [ /* ίδιο όπως πριν */ ]
};

const State = {
  bookmarks: [],

  init() {
    this.bookmarks = JSON.parse(localStorage.getItem(CONFIG.storageKey)) || [];
    this.render();
    this.renderDefaults();
  },

  add(bookmark) {
    if (this.bookmarks.length >= CONFIG.maxBookmarks) {
      alert("Έφτασες το όριο των 100 bookmarks!");
      return false;
    }
    this.bookmarks.unshift(bookmark);
    localStorage.setItem(CONFIG.storageKey, JSON.stringify(this.bookmarks));
    this.render();
    return true;
  },

  remove(index) {
    this.bookmarks.splice(index, 1);
    localStorage.setItem(CONFIG.storageKey, JSON.stringify(this.bookmarks));
    this.render();
  },

  // === ΝΕΟ: Filter Search ===
  filterBookmarks(query) {
    if (!query) return this.bookmarks;
    const q = query.toLowerCase();
    return this.bookmarks.filter(b => 
      b.name.toLowerCase().includes(q) || 
      b.url.toLowerCase().includes(q)
    );
  },

  render() {
    const grid = document.getElementById('favoritesGrid');
    const countEl = document.getElementById('myBookmarksCount');

    if (!grid) return;

    if (this.bookmarks.length === 0) {
      grid.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📭</div>
          <h3>Κανένα bookmark ακόμα</h3>
          <p>Πρόσθεσε το πρώτο σου παραπάνω!</p>
        </div>
      `;
    } else {
      grid.innerHTML = this.bookmarks.map((b, i) => this.createCard(b, i)).join('');
    }

    if (countEl) countEl.textContent = `${this.bookmarks.length} items`;
  },

  createCard(bookmark, index) {
    const domain = this.getDomain(bookmark.url);
    return `
      <div class="card" onclick="window.open('${bookmark.url}', '_blank')">
        <button class="card-btn" onclick="event.stopPropagation(); State.remove(${index})" 
                style="position:absolute;top:8px;right:8px;">×</button>
        
        <img src="https://www.google.com/s2/favicons?sz=64&domain=${domain}" 
             class="card-icon" onerror="this.style.display='none'">
        
        <div class="card-title">${bookmark.name}</div>
        <div class="card-url">${domain}</div>
      </div>
    `;
  },

  getDomain(url) {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  },

  renderDefaults() {
    document.getElementById('trendingGrid').innerHTML = 
      DEFAULT_BOOKMARKS.trending.map(b => this.createCard(b, null)).join('');
    
    document.getElementById('greekGrid').innerHTML = 
      DEFAULT_BOOKMARKS.greek.map(b => this.createCard(b, null)).join('');
  }
};

// === SMART INPUT ===
const SmartInput = {
  init() {
    const input = document.getElementById('smartInput');
    const btn = document.getElementById('addBtn');

    input.addEventListener('keydown', e => { if (e.key === 'Enter') this.handle(); });
    btn.addEventListener('click', () => this.handle());
  },

  handle() {
    const input = document.getElementById('smartInput');
    const value = input.value.trim();
    if (!value) return;

    if (value.includes('.') && !value.includes(' ')) {
      let url = value.startsWith('http') ? value : 'https://' + value;
      const name = this.extractName(url);

      State.add({ name, url, category: 'other' });
    } else {
      window.open(`https://www.google.com/search?q=${encodeURIComponent(value)}`, '_blank');
    }

    input.value = '';
  },

  extractName(url) {
    try {
      const host = new URL(url).hostname.replace('www.', '');
      return host.split('.')[0].charAt(0).toUpperCase() + host.split('.')[0].slice(1);
    } catch {
      return url;
    }
  }
};

// === GLOBAL SEARCH (στο πάνω search bar) ===
document.getElementById('searchInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    const q = e.target.value.trim();
    if (q) window.open(`https://www.google.com/search?q=${encodeURIComponent(q)}`, '_blank');
  }
});

// === INIT ===
document.addEventListener('DOMContentLoaded', () => {
  State.init();
  SmartInput.init();
});
