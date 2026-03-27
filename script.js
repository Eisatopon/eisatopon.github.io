// ============================================
// PORTIFY SCRIPT v2.1 - Chrome New Tab
// ============================================

// --- CONFIGURATION ---
const CONFIG = {
  storageKey: 'portify_v2_bookmarks',
  maxBookmarks: 100,
  debounceDelay: 150
};

// --- CATEGORIES ---
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

// --- DEFAULT DATA ---
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

// --- STATE MANAGEMENT ---
const State = {
  bookmarks: [],
  draggedItem: null,
  draggedIndex: null,
  filteredBookmarks: null,

  init() {
    this.bookmarks = Storage.get(CONFIG.storageKey) || [];
    this.filteredBookmarks = null;
    this.render();
    this.renderDefaults();
  },

  add(bookmark) {
    if (this.bookmarks.length >= CONFIG.maxBookmarks) {
      Toast.error('Φτάσατε το όριο των 100 bookmarks');
      return false;
    }
    this.bookmarks.unshift(bookmark);
    Storage.set(CONFIG.storageKey, this.bookmarks);
    this.render();
    Toast.success(`Προστέθηκε: ${bookmark.name}`);
    return true;
  },

  remove(index) {
    const removed = this.bookmarks.splice(index, 1)[0];
    Storage.set(CONFIG.storageKey, this.bookmarks);
    this.render();
    Toast.info(`Αφαιρέθηκε: ${removed.name}`);
  },

  edit(index, updates) {
    this.bookmarks[index] = { ...this.bookmarks[index], ...updates };
    Storage.set(CONFIG.storageKey, this.bookmarks);
    this.render();
    Toast.success('Ενημερώθηκε επιτυχώς!');
  },

  reorder(fromIndex, toIndex) {
    const [moved] = this.bookmarks.splice(fromIndex, 1);
    this.bookmarks.splice(toIndex, 0, moved);
    Storage.set(CONFIG.storageKey, this.bookmarks);
    this.render();
  },

  filter(query) {
    if (!query) {
      this.filteredBookmarks = null;
    } else {
      const lower = query.toLowerCase();
      this.filteredBookmarks = this.bookmarks.filter(b => 
        b.name.toLowerCase().includes(lower) || 
        b.url.toLowerCase().includes(lower) ||
        (CATEGORIES[b.category]?.label || '').toLowerCase().includes(lower)
      );
    }
    this.render();
  },

  render() {
    const grid = document.getElementById('favoritesGrid');
    const countEl = document.getElementById('myBookmarksCount');
    const displayBookmarks = this.filteredBookmarks !== null ? this.filteredBookmarks : this.bookmarks;

    countEl.textContent = `${displayBookmarks.length} item${displayBookmarks.length !== 1 ? 's' : ''}`;

    if (displayBookmarks.length === 0) {
      grid.innerHTML = this.filteredBookmarks !== null 
        ? `<div class="empty-state"><div class="empty-state-icon">🔍</div><h3>Δεν βρέθηκαν αποτελέσματα</h3></div>`
        : `<div class="empty-state"><div class="empty-state-icon">📭</div><h3>Κανένα bookmark ακόμα</h3><p>Πρόσθεσε το πρώτο σου παραπάνω!</p></div>`;
      return;
    }

    grid.innerHTML = displayBookmarks.map((bookmark, index) => {
      const actualIndex = this.filteredBookmarks !== null ? this.bookmarks.indexOf(bookmark) : index;
      return this.createCard(bookmark, actualIndex, true);
    }).join('');

    this.attachDragHandlers();
  },

  renderDefaults() {
    document.getElementById('trendingGrid').innerHTML = 
      DEFAULT_BOOKMARKS.trending.map(b => this.createCard(b, null, false)).join('');
    
    document.getElementById('greekGrid').innerHTML = 
      DEFAULT_BOOKMARKS.greek.map(b => this.createCard(b, null, false)).join('');
  },

  createCard(bookmark, index, isDraggable) {
    const domain = Utils.getDomain(bookmark.url);
    const category = CATEGORIES[bookmark.category] || CATEGORIES.other;

    return `
      <div class="card cat-${bookmark.category}" 
           ${isDraggable ? `draggable="true" data-index="${index}"` : ''}
           onclick="${isDraggable ? '' : `window.open('${bookmark.url}', '_blank')`}">

        ${isDraggable ? `
          <div class="card-actions">
            <button class="card-btn edit-btn" onclick="event.stopPropagation(); openEditModal(${index});" title="Επεξεργασία">✎</button>
            <button class="card-btn" onclick="event.stopPropagation(); State.remove(${index});" title="Διαγραφή">×</button>
          </div>
        ` : ''}

        <div class="card-icon-wrapper">
          <img src="https://www.google.com/s2/favicons?sz=64&domain=${domain}" 
               class="card-icon" 
               alt="${bookmark.name}"
               onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>${category.icon}</text></svg>'">
          <div class="card-category-indicator" title="${category.label}"></div>
        </div>

        <div class="card-title">${Utils.escapeHtml(bookmark.name)}</div>
        <div class="card-url">${domain}</div>
      </div>
    `;
  },

  attachDragHandlers() {
    const cards = document.querySelectorAll('#favoritesGrid .card');
    
    cards.forEach(card => {
      card.addEventListener('dragstart', (e) => {
        this.draggedItem = card;
        this.draggedIndex = parseInt(card.dataset.index);
        card.classList.add('dragging');
      });

      card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
        document.querySelectorAll('.card').forEach(c => c.classList.remove('drag-over'));
      });

      card.addEventListener('dragover', (e) => {
        e.preventDefault();
        if (card !== this.draggedItem) card.classList.add('drag-over');
      });

      card.addEventListener('dragleave', () => card.classList.remove('drag-over'));

      card.addEventListener('drop', (e) => {
        e.preventDefault();
        card.classList.remove('drag-over');
        if (card === this.draggedItem) return;
        const toIndex = parseInt(card.dataset.index);
        this.reorder(this.draggedIndex, toIndex);
      });
    });
  }
};

// --- STORAGE ---
const Storage = {
  get(key) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      return null;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      Toast.error('Αποτυχία αποθήκευσης');
      return false;
    }
  }
};

// --- UTILITIES ---
const Utils = {
  getDomain(url) {
    try {
      return new URL(url.startsWith('http') ? url : 'https://' + url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  },

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }
};

// --- TOAST NOTIFICATIONS ---
const Toast = {
  container: null,

  init() {
    this.container = document.getElementById('toastContainer');
  },

  show(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icons = { success: '✓', error: '✕', info: 'ℹ' };

    toast.innerHTML = `
      <span style="font-size: 1.25rem;">${icons[type]}</span>
      <span>${message}</span>
    `;

    this.container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast-exit');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  success(msg) { this.show(msg, 'success'); },
  error(msg)   { this.show(msg, 'error', 5000); },
  info(msg)    { this.show(msg, 'info'); }
};

// --- SMART INPUT HANDLER ---
const SmartInput = {
  init() {
    const input = document.getElementById('smartInput');
    const status = document.getElementById('inputStatus');
    const previewCard = document.getElementById('previewCard');
    const previewIcon = document.getElementById('previewIcon');
    const previewName = document.getElementById('previewName');
    const previewUrl = document.getElementById('previewUrl');
    const addBtn = document.getElementById('addBtn');
    const categorySelect = document.getElementById('customCategory');

    let currentState = { isUrl: false, url: '', name: '' };

    const handleInput = Utils.debounce(() => {
      const value = input.value.trim();
      if (!value) {
        reset();
        return;
      }

      const isUrl = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\.[a-z]{2,})/i.test(value);

      if (isUrl) {
        let url = value.startsWith('http') ? value : 'https://' + value;
        let name = Utils.getDomain(url)
          .replace(/^www\./, '')
          .replace(/\.[^.]+$/, '')
          .replace(/[-_]/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase());

        currentState = { isUrl: true, url, name };

        input.classList.add('valid');
        input.classList.remove('search');
        status.innerHTML = '<span style="background:#22c55e;color:white">✓</span>';

        previewIcon.src = `https://www.google.com/s2/favicons?sz=64&domain=${Utils.getDomain(url)}`;
        previewName.textContent = name;
        previewUrl.textContent = Utils.getDomain(url);
        previewCard.classList.add('show');
        addBtn.disabled = false;
        addBtn.textContent = '+ Προσθήκη';
      } else {
        currentState = { isUrl: false, url: '', name: '' };
        input.classList.add('search');
        input.classList.remove('valid');
        status.innerHTML = '<span style="background:#f59e0b;color:white">🔍</span>';
        previewCard.classList.remove('show');
        addBtn.disabled = false;
        addBtn.textContent = '🔍 Αναζήτηση';
      }
    }, 280);

    input.addEventListener('input', handleInput);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleAdd();
    });

    addBtn.addEventListener('click', handleAdd);

    function handleAdd() {
      if (!currentState.isUrl) {
        // Search mode
        const query = encodeURIComponent(input.value.trim());
        window.open(`https://www.google.com/search?q=${query}`, '_blank');
        reset();
        return;
      }

      // URL mode
      const domain = Utils.getDomain(currentState.url).toLowerCase();
      let category = categorySelect.value;

      // Auto category detection
      const categoryMap = {
        news: ['news', 'cnn', 'bbc', 'reuters', 'kathimerini', 'protothema'],
        sports: ['sport', 'espn', 'gazzetta', 'sport24'],
        entertainment: ['netflix', 'youtube', 'spotify', 'twitch'],
        social: ['facebook', 'instagram', 'twitter', 'reddit', 'tiktok'],
        shopping: ['amazon', 'skroutz', 'public', 'ebay'],
        finance: ['bank', 'paypal', 'crypto'],
        work: ['github', 'notion', 'slack', 'drive']
      };

      for (const [cat, keywords] of Object.entries(categoryMap)) {
        if (keywords.some(k => domain.includes(k))) {
          category = cat;
          break;
        }
      }

      const bookmark = {
        name: currentState.name,
        url: currentState.url,
        category: category,
        createdAt: Date.now()
      };

      if (State.add(bookmark)) {
        reset();
        categorySelect.value = 'other';
      }
    }

    function reset() {
      input.value = '';
      input.classList.remove('valid', 'search');
      status.innerHTML = '';
      previewCard.classList.remove('show');
      addBtn.disabled = true;
      addBtn.textContent = '+ Προσθήκη';
      currentState = { isUrl: false, url: '', name: '' };
    }
  }
};

// --- EDIT MODAL ---
function openEditModal(index) {
  const bookmark = State.bookmarks[index];
  document.getElementById('editIndex').value = index;
  document.getElementById('editName').value = bookmark.name;
  document.getElementById('editUrl').value = bookmark.url;
  document.getElementById('editCategory').value = bookmark.category;
  document.getElementById('editModal').classList.add('active');
}

function hideEditModal() {
  document.getElementById('editModal').classList.remove('active');
}

function saveEdit(e) {
  e.preventDefault();
  const index = parseInt(document.getElementById('editIndex').value);
  const updates = {
    name: document.getElementById('editName').value.trim(),
    url: document.getElementById('editUrl').value.trim(),
    category: document.getElementById('editCategory').value
  };

  if (!updates.name || !updates.url) {
    Toast.error('Συμπλήρωσε όλα τα πεδία');
    return;
  }

  if (!updates.url.startsWith('http')) {
    updates.url = 'https://' + updates.url;
  }

  State.edit(index, updates);
  hideEditModal();
}

// --- KEYBOARD SHORTCUTS ---
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      document.getElementById('searchInput').focus();
    }

    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
      e.preventDefault();
      document.getElementById('smartInput').focus();
    }

    if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '9') {
      e.preventDefault();
      const index = parseInt(e.key) - 1;
      const list = State.filteredBookmarks !== null ? State.filteredBookmarks : State.bookmarks;
      if (list[index]) window.open(list[index].url, '_blank');
    }

    if (e.key === 'Escape') {
      hideShortcutsModal();
      hideEditModal();
    }
  });
}

// --- MODALS ---
function showShortcutsModal() {
  document.getElementById('shortcutsModal').classList.add('active');
}

function hideShortcutsModal() {
  document.getElementById('shortcutsModal').classList.remove('active');
}

function exportData() {
  const data = {
    bookmarks: State.bookmarks,
    exportedAt: new Date().toISOString(),
    version: '2.1'
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `portify-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);

  Toast.success('Εξαγωγή επιτυχής!');
}

function importData() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.bookmarks && Array.isArray(data.bookmarks)) {
          State.bookmarks = data.bookmarks;
          Storage.set(CONFIG.storageKey, State.bookmarks);
          State.render();
          Toast.success('Εισαγωγή επιτυχής!');
        } else {
          throw new Error();
        }
      } catch {
        Toast.error('Άκυρο αρχείο');
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
  Toast.init();
  State.init();
  SmartInput.init();
  setupKeyboardShortcuts();

  // Global Search
  const searchInput = document.getElementById('searchInput');
  searchInput.addEventListener('input', Utils.debounce((e) => {
    State.filter(e.target.value.trim());
  }, 200));

  // Close modals when clicking overlay
  document.getElementById('shortcutsModal').addEventListener('click', (e) => {
    if (e.target.id === 'shortcutsModal') hideShortcutsModal();
  });

  document.getElementById('editModal').addEventListener('click', (e) => {
    if (e.target.id === 'editModal') hideEditModal();
  });
});
