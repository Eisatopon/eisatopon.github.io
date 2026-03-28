// ============================================
// PORTIFY SCRIPT v3.0 - CHROME EXTENSION EDITION
// ============================================

'use strict';

/** ============================================
 * CONFIGURATION
 * ============================================ */
const CONFIG = {
    storageKey: 'portify_bookmarks',
    maxBookmarks: 100,
    version: '3.0',
    isExtension: typeof chrome !== 'undefined' && chrome.storage !== undefined
};

/** ============================================
 * CATEGORIES CONFIGURATION
 * ============================================ */
const CATEGORIES = {
    news: { icon: '📰', color: '#ef4444', label: 'Ειδήσεις' },
    sports: { icon: '⚽', color: '#22c55e', label: 'Αθλητικά' },
    work: { icon: '💼', color: '#3b82f6', label: 'Εργασία' },
    social: { icon: '💬', color: '#8b5cf6', label: 'Social' },
    shopping: { icon: '🛒', color: '#f59e0b', label: 'Shopping' },
    entertainment: { icon: '🎬', color: '#ec4899', label: 'Ψυχαγωγία' },
    finance: { icon: '💰', color: '#06b6d4', label: 'Οικονομικά' },
    other: { icon: '📁', color: '#64748b', label: 'Άλλο' }
};

/** ============================================
 * DEFAULT BOOKMARKS
 * ============================================ */
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

/** ============================================
 * STORAGE ADAPTER (Browser + Extension)
 * ============================================ */
const Storage = {
    async get(key) {
        if (CONFIG.isExtension) {
            const result = await chrome.storage.local.get(key);
            return result[key];
        }
        return JSON.parse(localStorage.getItem(key));
    },

    async set(key, value) {
        if (CONFIG.isExtension) {
            await chrome.storage.local.set({ [key]: value });
        } else {
            localStorage.setItem(key, JSON.stringify(value));
        }
    }
};

/** ============================================
 * UTILITY FUNCTIONS
 * ============================================ */
const Utils = {
    getDomain(url) {
        try {
            return new URL(url).hostname.replace(/^www\./, '');
        } catch {
            return url;
        }
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    getFallbackIcon(icon) {
        return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">${icon}</text></svg>`)}`;
    },

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    showToast(message, type = 'success') {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
};

/** ============================================
 * BOOKMARKS STATE MANAGEMENT
 * ============================================ */
const State = {
    bookmarks: [],

    async init() {
        try {
            const stored = await Storage.get(CONFIG.storageKey);
            this.bookmarks = stored || [];
        } catch (e) {
            console.error('Failed to load bookmarks:', e);
            this.bookmarks = [];
        }
        
        this.render();
        this.renderDefaults();
    },

    async add(bookmark) {
        if (this.bookmarks.length >= CONFIG.maxBookmarks) {
            Utils.showToast(`Όριο ${CONFIG.maxBookmarks} bookmarks!`, 'error');
            return false;
        }

        const exists = this.bookmarks.some(b => b.url === bookmark.url);
        if (exists) {
            Utils.showToast('Υπάρχει ήδη!', 'error');
            return false;
        }

        this.bookmarks.unshift(bookmark);
        await this.save();
        this.render();
        Utils.showToast('Προστέθηκε! ✅');
        return true;
    },

    async remove(index) {
        if (index < 0 || index >= this.bookmarks.length) return;
        
        this.bookmarks.splice(index, 1);
        await this.save();
        this.render();
        Utils.showToast('Διαγράφηκε! 🗑️');
    },

    async update(index, updatedBookmark) {
        if (index < 0 || index >= this.bookmarks.length) return false;
        
        this.bookmarks[index] = { ...this.bookmarks[index], ...updatedBookmark };
        await this.save();
        this.render();
        Utils.showToast('Ενημερώθηκε! ✏️');
        return true;
    },

    async save() {
        try {
            await Storage.set(CONFIG.storageKey, this.bookmarks);
        } catch (e) {
            console.error('Failed to save:', e);
            Utils.showToast('Σφάλμα αποθήκευσης!', 'error');
        }
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
            grid.innerHTML = this.bookmarks.map((bookmark, index) => 
                this.createCard(bookmark, index, true)
            ).join('');
        }

        if (countEl) {
            countEl.textContent = `${this.bookmarks.length} ${this.bookmarks.length === 1 ? 'item' : 'items'}`;
        }
    },

    renderDefaults() {
        const trendingGrid = document.getElementById('trendingGrid');
        const greekGrid = document.getElementById('greekGrid');

        if (trendingGrid) {
            trendingGrid.innerHTML = DEFAULT_BOOKMARKS.trending
                .map(b => this.createCard(b, null, false))
                .join('');
        }

        if (greekGrid) {
            greekGrid.innerHTML = DEFAULT_BOOKMARKS.greek
                .map(b => this.createCard(b, null, false))
                .join('');
        }
    },

    createCard(bookmark, index, isEditable) {
        const domain = Utils.getDomain(bookmark.url);
        const category = CATEGORIES[bookmark.category] || CATEGORIES.other;
        const faviconUrl = `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;

        return `
            <div class="card cat-${bookmark.category}" 
                 ${!isEditable ? `onclick="window.open('${bookmark.url}', '_blank')"` : ''}>
                
                ${isEditable ? `
                    <div class="card-actions">
                        <button class="card-action-btn" onclick="event.stopPropagation(); State.edit(${index})" title="Επεξεργασία">✏️</button>
                        <button class="card-action-btn" onclick="event.stopPropagation(); State.remove(${index})" title="Διαγραφή">🗑️</button>
                    </div>
                ` : ''}

                <img src="${faviconUrl}"
                     class="card-icon"
                     alt="${Utils.escapeHtml(bookmark.name)}"
                     onerror="this.src='${Utils.getFallbackIcon(category.icon)}'">
                
                <h3 class="card-title">${Utils.escapeHtml(bookmark.name)}</h3>
                <p class="card-url">${domain}</p>
            </div>
        `;
    },

    edit(index) {
        const bookmark = this.bookmarks[index];
        if (!bookmark) return;

        const modal = document.getElementById('editModal');
        
        document.getElementById('editIndex').value = index;
        document.getElementById('editName').value = bookmark.name;
        document.getElementById('editUrl').value = bookmark.url;
        document.getElementById('editCategory').value = bookmark.category;

        modal?.classList.add('active');
    }
};

/** ============================================
 * SMART INPUT HANDLER
 * ============================================ */
const SmartInput = {
    input: null,
    button: null,
    preview: null,
    status: null,

    init() {
        this.input = document.getElementById('smartInput');
        this.button = document.getElementById('addBtn');
        this.preview = document.getElementById('previewCard');
        this.status = document.getElementById('inputStatus');

        if (!this.input || !this.button) return;

        this.input.addEventListener('input', Utils.debounce(() => this.handleInput(), 300));
        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.handleSubmit();
        });
        this.button.addEventListener('click', () => this.handleSubmit());

        document.getElementById('customCategory')?.addEventListener('change', () => {
            if (this.input.value.trim()) this.updatePreview();
        });
    },

    handleInput() {
        const value = this.input.value.trim();
        
        if (!value) {
            this.hidePreview();
            this.button.disabled = true;
            return;
        }

        this.button.disabled = false;

        if (this.isValidUrl(value)) {
            this.status.textContent = '🔗 URL αναγνωρίστηκε';
            this.status.style.color = 'var(--accent-green)';
            this.updatePreview(value);
        } else {
            this.status.textContent = '🔍 Θα γίνει αναζήτηση';
            this.status.style.color = 'var(--accent-blue)';
            this.hidePreview();
        }
    },

    isValidUrl(value) {
        return value.includes('.') && !value.includes(' ') && value.length > 3;
    },

    updatePreview(url = null) {
        const value = url || this.input.value.trim();
        if (!this.isValidUrl(value)) return;

        const fullUrl = value.startsWith('http') ? value : `https://${value}`;
        const domain = Utils.getDomain(fullUrl);

        document.getElementById('previewIcon').src = 
            `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
        document.getElementById('previewName').textContent = this.extractName(domain);
        document.getElementById('previewUrl').textContent = domain;

        this.preview?.classList.add('visible');
    },

    hidePreview() {
        this.preview?.classList.remove('visible');
    },

    async handleSubmit() {
        const value = this.input.value.trim();
        if (!value) return;

        if (this.isValidUrl(value)) {
            let url = value.startsWith('http') ? value : `https://${value}`;
            const category = document.getElementById('customCategory')?.value || 'other';
            
            const success = await State.add({
                name: this.extractName(Utils.getDomain(url)),
                url: url,
                category: category
            });

            if (success) {
                this.input.value = '';
                this.hidePreview();
                this.button.disabled = true;
                this.status.textContent = '';
            }
        } else {
            window.open(`https://www.google.com/search?q=${encodeURIComponent(value)}`, '_blank');
            this.input.value = '';
        }
    },

    extractName(domain) {
        const parts = domain.split('.');
        const name = parts[0];
        return name.charAt(0).toUpperCase() + name.slice(1);
    }
};

/** ============================================
 * SEARCH FUNCTIONALITY
 * ============================================ */
const Search = {
    init() {
        const input = document.getElementById('searchInput');
        if (!input) return;

        input.addEventListener('input', Utils.debounce((e) => {
            this.filter(e.target.value);
        }, 200));
    },

    filter(term) {
        const cards = document.querySelectorAll('#favoritesGrid .card');
        const lowerTerm = term.toLowerCase();

        cards.forEach(card => {
            const title = card.querySelector('.card-title')?.textContent.toLowerCase() || '';
            const url = card.querySelector('.card-url')?.textContent.toLowerCase() || '';
            
            const matches = title.includes(lowerTerm) || url.includes(lowerTerm);
            card.style.display = matches ? '' : 'none';
        });
    }
};

/** ============================================
 * MODAL HANDLERS
 * ============================================ */
const Modals = {
    init() {
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) overlay.classList.remove('active');
            });
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
            }
        });
    },

    hideEdit() {
        document.getElementById('editModal')?.classList.remove('active');
    },

    async saveEdit(e) {
        e.preventDefault();
        
        const index = parseInt(document.getElementById('editIndex').value);
        const name = document.getElementById('editName').value.trim();
        const url = document.getElementById('editUrl').value.trim();
        const category = document.getElementById('editCategory').value;

        if (!name || !url) {
            Utils.showToast('Συμπλήρωσε όλα τα πεδία!', 'error');
            return;
        }

        await State.update(index, { name, url, category });
        this.hideEdit();
    }
};

/** ============================================
 * KEYBOARD SHORTCUTS
 * ============================================ */
const Shortcuts = {
    init() {
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                document.getElementById('searchInput')?.focus();
            }
            
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                document.getElementById('smartInput')?.focus();
            }

            if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '9') {
                e.preventDefault();
                const index = parseInt(e.key) - 1;
                const bookmark = State.bookmarks[index];
                if (bookmark) {
                    window.open(bookmark.url, '_blank');
                }
            }
        });
    }
};

/** ============================================
 * EXPORT / IMPORT
 * ============================================ */
const DataManager = {
    async export() {
        const data = {
            bookmarks: State.bookmarks,
            exportedAt: new Date().toISOString(),
            version: CONFIG.version
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `portify-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
        Utils.showToast('✅ Εξαγωγή επιτυχής!');
    },

    import() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json,application/json';
        
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            if (file.size > 1024 * 1024) {
                Utils.showToast('Το αρχείο είναι πολύ μεγάλο (max 1MB)', 'error');
                return;
            }

            const reader = new FileReader();
            
            reader.onload = async (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    
                    if (!data.bookmarks || !Array.isArray(data.bookmarks)) {
                        throw new Error('Invalid format');
                    }

                    const validBookmarks = data.bookmarks.filter(b => 
                        b.name && b.url && b.category
                    );

                    if (validBookmarks.length === 0) {
                        throw new Error('No valid bookmarks');
                    }

                    if (State.bookmarks.length > 0) {
                        if (!confirm(`Βρέθηκαν ${validBookmarks.length} bookmarks. Να αντικαταστήσω τα υπάρχοντα;`)) {
                            return;
                        }
                    }

                    State.bookmarks = validBookmarks.slice(0, CONFIG.maxBookmarks);
                    await State.save();
                    State.render();
                    
                    Utils.showToast(`✅ Εισαγωγή ${validBookmarks.length} bookmarks!`);
                    
                } catch (err) {
                    console.error('Import error:', err);
                    Utils.showToast('❌ Άκυρο αρχείο!', 'error');
                }
            };

            reader.onerror = () => {
                Utils.showToast('❌ Σφάλμα ανάγνωσης!', 'error');
            };

            reader.readAsText(file);
        };

        input.click();
    }
};

/** ============================================
 * GLOBAL FUNCTIONS
 * ============================================ */
window.State = State;
window.Modals = Modals;
window.DataManager = DataManager;

window.exportData = () => DataManager.export();
window.importData = () => DataManager.import();
window.hideEditModal = () => Modals.hideEdit();
window.saveEdit = (e) => Modals.saveEdit(e);

/** ============================================
 * INITIALIZATION
 * ============================================ */
document.addEventListener('DOMContentLoaded', async () => {
    await State.init();
    SmartInput.init();
    Search.init();
    Modals.init();
    Shortcuts.init();
    
    console.log(`🚀 Portify v${CONFIG.version} loaded! [${CONFIG.isExtension ? 'Extension' : 'Web'}]`);
}, { once: true });
