// ============================================
// PORTIFY SCRIPT v2.5 - ΑΡΧΙΚΟ ΣΤΥΛ (FULL)
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
  trending: [
    { name: 'Google', url: 'https://google.com', category: 'other' },
    { name: 'YouTube', url: 'https://youtube.com', category: 'entertainment' },
    { name: 'GitHub', url: 'https://github.com', category: 'work' },
    { name: 'Reddit', url: 'https://reddit.com', category: 'social' },
    { name: 'Netflix', url: 'https://netflix.com', category: 'entertainment' },
    { name: 'Gmail', url: 'https://gmail.com', category: 'work' }
  ],
  greek: [
    { name: 'Καθημερινή', url: 'https://kathimerini.gr', category: 'news' },
    { name: 'Πρώτο Θέμα', url: 'https://protothema.gr', category: 'news' },
    { name: 'News247', url: 'https://news247.gr', category: 'news' },
    { name: 'Sport24', url: 'https://sport24.gr', category: 'sports' },
    { name: 'Gazzetta', url: 'https://gazzetta.gr', category: 'sports' },
    { name: 'Skroutz', url: 'https://skroutz.gr', category: 'shopping' },
    { name: 'Public', url: 'https://public.gr', category: 'shopping' }
  ]
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

  render() {
    const grid = document.getElementById('favoritesGrid');
    const countEl = document.getElementById('myBookmarksCount');

    if (this.bookmarks.length === 0) {
      grid.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📭</div>
          <h3>Κανένα bookmark ακόμα</h3>
          <p>Πρόσθεσε το πρώτο σου παραπάνω!</p>
        </div>
      `;
    } else {
      grid.innerHTML = this.bookmarks.map((b, i) => this.createCard(b, i, true)).join('');
    }

    if (countEl) countEl.textContent = `${this.bookmarks.length} items`;
  },

  renderDefaults() {
    document.getElementById('trendingGrid').innerHTML = 
      DEFAULT_BOOKMARKS.trending.map(b => this.createCard(b, null, false)).join('');
    
    document.getElementById('greekGrid').innerHTML = 
      DEFAULT_BOOKMARKS.greek.map(b => this.createCard(b, null, false)).join('');
  },

  createCard(bookmark, index, isDraggable) {
    const domain = this.getDomain(bookmark.url);
    const cat = CATEGORIES[bookmark.category] || CATEGORIES.other;

    return `
      <div class="card cat-${bookmark.category}" onclick="${isDraggable ? '' : `window.open('${bookmark.url}', '_blank')`}">
        
        ${isDraggable ? `
          <div class="card-actions">
            <button class="card-btn" onclick="event.stopPropagation(); State.remove(${index})" title="Διαγραφή">×</button>
          </div>
        ` : ''}

        <div class="card-icon-wrapper">
          <img src="https://www.google.com/s2/favicons?sz=64&domain=${domain}" 
               class="card-icon" 
               alt="${bookmark.name}"
               onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>${cat.icon}</text></svg>'">
        </div>

        <div class="card-title">${this.escapeHtml(bookmark.name)}</div>
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

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
};

// Smart Input
const SmartInput = {
  init() {
    const input = document.getElementById('smartInput');
    const btn = document.getElementById('addBtn');

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.handle();
    });

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
      const hostname = new URL(url).hostname.replace('www.', '');
      return hostname.split('.')[0].charAt(0).toUpperCase() + hostname.split('.')[0].slice(1);
    } catch {
      return url;
    }
  }
};

// Keyboard Shortcuts
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 'k') {
    e.preventDefault();
    document.getElementById('searchInput')?.focus();
  }
  if (e.ctrlKey && e.key === 'n') {
    e.preventDefault();
    document.getElementById('smartInput')?.focus();
  }
});

// Export / Import
function exportData() {
  const data = { bookmarks: State.bookmarks, exportedAt: new Date().toISOString() };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'portify-backup.json';
  a.click();
  URL.revokeObjectURL(url);
  alert('Εξαγωγή επιτυχής!');
}

function importData() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.bookmarks) {
          State.bookmarks = data.bookmarks;
          localStorage.setItem(CONFIG.storageKey, JSON.stringify(State.bookmarks));
          State.render();
          alert('Εισαγωγή επιτυχής!');
        }
      } catch {
        alert('Άκυρο αρχείο!');
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

// INIT
document.addEventListener('DOMContentLoaded', () => {
  State.init();
  SmartInput.init();
});
