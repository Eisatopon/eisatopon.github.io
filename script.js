// ============================================
// PORTIFY SCRIPT v3.5 - CHROME EXTENSION EDITION
// ============================================

'use strict';

/** ============================================
 * CONFIGURATION
 * ============================================ */
const CONFIG = {
    storageKey:      'portify_bookmarks',
    recentKey:       'portify_recent',
    maxBookmarks:    100,
    maxRecent:       6,
    maxFileSize:     1024 * 1024, // 1MB — no magic numbers
    version:         '3.5',
    isExtension:     typeof chrome !== 'undefined' && chrome.storage !== undefined,
    // Use sync storage when available (cross-device sync)
    // Falls back to local if sync quota would be exceeded
    useSync:         typeof chrome !== 'undefined' && chrome.storage?.sync !== undefined
};

/** ============================================
 * CATEGORIES CONFIGURATION
 * ============================================ */
const CATEGORIES = {
    news:          { icon: '📰', color: '#ef4444', label: 'Ειδήσεις' },
    sports:        { icon: '⚽', color: '#22c55e', label: 'Αθλητικά' },
    work:          { icon: '💼', color: '#3b82f6', label: 'Εργασία' },
    social:        { icon: '💬', color: '#8b5cf6', label: 'Social' },
    shopping:      { icon: '🛒', color: '#f59e0b', label: 'Shopping' },
    entertainment: { icon: '🎬', color: '#ec4899', label: 'Ψυχαγωγία' },
    finance:       { icon: '💰', color: '#06b6d4', label: 'Οικονομικά' },
    other:         { icon: '📁', color: '#64748b', label: 'Άλλο' }
};

/** ============================================
 * DEFAULT BOOKMARKS
 * ============================================ */
const DEFAULT_BOOKMARKS = {
    trending: [
        { name: 'Google',  url: 'https://google.com',  category: 'other' },
        { name: 'YouTube', url: 'https://youtube.com', category: 'entertainment' },
        { name: 'GitHub',  url: 'https://github.com',  category: 'work' },
        { name: 'Reddit',  url: 'https://reddit.com',  category: 'social' },
        { name: 'Netflix', url: 'https://netflix.com', category: 'entertainment' },
        { name: 'Gmail',   url: 'https://gmail.com',   category: 'work' }
    ]
};

/** ============================================
 * COUNTRY TABS
 * Each entry: { id, flag, label, sites[] }
 * ============================================ */
const COUNTRY_TABS = [
    {
        id: 'gr', flag: '🇬🇷', label: 'Ελλάδα',
        sites: [
            { name: 'Καθημερινή', url: 'https://kathimerini.gr', category: 'news' },
            { name: 'Πρώτο Θέμα', url: 'https://protothema.gr',  category: 'news' },
            { name: 'News247',    url: 'https://news247.gr',      category: 'news' },
            { name: 'In.gr',      url: 'https://in.gr',           category: 'news' },
            { name: 'Sport24',    url: 'https://sport24.gr',      category: 'sports' },
            { name: 'Gazzetta',   url: 'https://gazzetta.gr',     category: 'sports' },
            { name: 'Skroutz',    url: 'https://skroutz.gr',      category: 'shopping' },
            { name: 'Public',     url: 'https://public.gr',       category: 'shopping' }
        ]
    },
    {
        id: 'us', flag: '🇺🇸', label: 'USA',
        sites: [
            { name: 'NY Times',    url: 'https://nytimes.com',       category: 'news' },
            { name: 'CNN',         url: 'https://cnn.com',           category: 'news' },
            { name: 'ESPN',        url: 'https://espn.com',          category: 'sports' },
            { name: 'The Verge',   url: 'https://theverge.com',      category: 'work' },
            { name: 'Amazon',      url: 'https://amazon.com',        category: 'shopping' },
            { name: 'eBay',        url: 'https://ebay.com',          category: 'shopping' },
            { name: 'Hulu',        url: 'https://hulu.com',          category: 'entertainment' },
            { name: 'Bloomberg',   url: 'https://bloomberg.com',     category: 'finance' }
        ]
    },
    {
        id: 'gb', flag: '🇬🇧', label: 'UK',
        sites: [
            { name: 'BBC News',    url: 'https://bbc.co.uk/news',    category: 'news' },
            { name: 'The Guardian',url: 'https://theguardian.com',   category: 'news' },
            { name: 'Sky Sports',  url: 'https://skysports.com',     category: 'sports' },
            { name: 'The Sun',     url: 'https://thesun.co.uk',      category: 'news' },
            { name: 'Amazon UK',   url: 'https://amazon.co.uk',      category: 'shopping' },
            { name: 'ASOS',        url: 'https://asos.com',          category: 'shopping' },
            { name: 'ITV',         url: 'https://itv.com',           category: 'entertainment' },
            { name: 'Financial T.',url: 'https://ft.com',            category: 'finance' }
        ]
    },
    {
        id: 'de', flag: '🇩🇪', label: 'Deutschland',
        sites: [
            { name: 'Spiegel',     url: 'https://spiegel.de',        category: 'news' },
            { name: 'Zeit Online', url: 'https://zeit.de',           category: 'news' },
            { name: 'Kicker',      url: 'https://kicker.de',         category: 'sports' },
            { name: 'Sport1',      url: 'https://sport1.de',         category: 'sports' },
            { name: 'Amazon DE',   url: 'https://amazon.de',         category: 'shopping' },
            { name: 'Otto',        url: 'https://otto.de',           category: 'shopping' },
            { name: 'ARD',         url: 'https://ard.de',            category: 'entertainment' },
            { name: 'Handelsblatt',url: 'https://handelsblatt.com',  category: 'finance' }
        ]
    },
    {
        id: 'fr', flag: '🇫🇷', label: 'France',
        sites: [
            { name: 'Le Monde',    url: 'https://lemonde.fr',        category: 'news' },
            { name: 'Le Figaro',   url: 'https://lefigaro.fr',       category: 'news' },
            { name: 'L\'Équipe',   url: 'https://lequipe.fr',        category: 'sports' },
            { name: 'Eurosport',   url: 'https://eurosport.fr',      category: 'sports' },
            { name: 'Amazon FR',   url: 'https://amazon.fr',         category: 'shopping' },
            { name: 'Fnac',        url: 'https://fnac.com',          category: 'shopping' },
            { name: 'TF1',         url: 'https://tf1.fr',            category: 'entertainment' },
            { name: 'Les Echos',   url: 'https://lesechos.fr',       category: 'finance' }
        ]
    },
    {
        id: 'es', flag: '🇪🇸', label: 'España',
        sites: [
            { name: 'El País',     url: 'https://elpais.com',        category: 'news' },
            { name: 'El Mundo',    url: 'https://elmundo.es',        category: 'news' },
            { name: 'Marca',       url: 'https://marca.com',         category: 'sports' },
            { name: 'AS',          url: 'https://as.com',            category: 'sports' },
            { name: 'Amazon ES',   url: 'https://amazon.es',         category: 'shopping' },
            { name: 'El Corte',    url: 'https://elcorteingles.es',  category: 'shopping' },
            { name: 'RTVE',        url: 'https://rtve.es',           category: 'entertainment' },
            { name: 'Expansión',   url: 'https://expansion.com',     category: 'finance' }
        ]
    },
    {
        id: 'it', flag: '🇮🇹', label: 'Italia',
        sites: [
            { name: 'Repubblica',  url: 'https://repubblica.it',     category: 'news' },
            { name: 'Corriere',    url: 'https://corriere.it',       category: 'news' },
            { name: 'Gazzetta',    url: 'https://gazzetta.it',       category: 'sports' },
            { name: 'Sky Sport',   url: 'https://sport.sky.it',      category: 'sports' },
            { name: 'Amazon IT',   url: 'https://amazon.it',         category: 'shopping' },
            { name: 'Zalando IT',  url: 'https://zalando.it',        category: 'shopping' },
            { name: 'RAI',         url: 'https://rai.it',            category: 'entertainment' },
            { name: 'Il Sole 24',  url: 'https://ilsole24ore.com',   category: 'finance' }
        ]
    }
];

/** ============================================
 * STORAGE ADAPTER
 * Priority: chrome.storage.sync → chrome.storage.local → localStorage
 *
 * chrome.storage.sync  = cross-device sync (extension only, 100KB quota)
 * chrome.storage.local = local only (extension, 10MB quota)
 * localStorage         = web app fallback
 * ============================================ */
const Storage = {
    /**
     * Get the best available storage backend.
     * Bookmarks use sync for cross-device support.
     * Recent visits use local only (device-specific makes more sense).
     */
    _backend(key) {
        if (!CONFIG.isExtension) return null; // use localStorage
        // Recent visits are device-local by design
        if (key === CONFIG.recentKey) return chrome.storage.local;
        // Bookmarks sync across devices when possible
        return CONFIG.useSync ? chrome.storage.sync : chrome.storage.local;
    },

    async get(key) {
        const backend = this._backend(key);
        if (backend) {
            try {
                const result = await backend.get(key);
                return result[key] ?? null;
            } catch (e) {
                console.warn(`Storage.get(${key}) failed, falling back:`, e);
                // Fallback to local if sync fails
                if (backend === chrome.storage.sync) {
                    const fallback = await chrome.storage.local.get(key);
                    return fallback[key] ?? null;
                }
                return null;
            }
        }
        try {
            return JSON.parse(localStorage.getItem(key));
        } catch {
            return null;
        }
    },

    async set(key, value) {
        const backend = this._backend(key);
        if (backend) {
            try {
                await backend.set({ [key]: value });
            } catch (e) {
                // chrome.storage.sync has a 100KB quota per item
                // If exceeded, fall back to local storage silently
                if (e.message?.includes('QUOTA_BYTES') || e.message?.includes('quota')) {
                    console.warn('Sync quota exceeded, falling back to local storage');
                    await chrome.storage.local.set({ [key]: value });
                    Utils.showToast('💡 Το όριο sync ξεπεράστηκε — αποθηκεύτηκε τοπικά', 'info');
                } else {
                    throw e;
                }
            }
            return;
        }
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            if (e.name === 'QuotaExceededError') {
                Utils.showToast('⚠️ Ο αποθηκευτικός χώρος είναι γεμάτος!', 'error');
            } else {
                throw e;
            }
        }
    },

    /** Show sync status in UI — called once on init */
    async getSyncStatus() {
        if (!CONFIG.isExtension || !CONFIG.useSync) return 'local';
        try {
            await chrome.storage.sync.get(null); // test access
            return 'sync';
        } catch {
            return 'local';
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

    /**
     * Robust URL validation using the URL constructor.
     * Accepts bare domains like "netflix.com" by prepending https://.
     */
    parseUrl(value) {
        if (!value || typeof value !== 'string') return null;
        const trimmed = value.trim();
        if (!trimmed) return null;

        // Try as-is first (handles http:// and https:// inputs)
        try {
            const u = new URL(trimmed);
            if (u.protocol === 'http:' || u.protocol === 'https:') return u.href;
        } catch { /* not a full URL */ }

        // Try prepending https:// for bare domains like "netflix.com"
        try {
            const u = new URL('https://' + trimmed);
            // Must have at least one dot in hostname (avoids single words)
            if (u.hostname.includes('.')) return u.href;
        } catch { /* not a URL */ }

        return null; // It's a search query, not a URL
    },

    getFallbackIcon(icon) {
        return `data:image/svg+xml,${encodeURIComponent(
            `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">${icon}</text></svg>`
        )}`;
    },

    debounce(func, wait) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
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
    },

    /**
     * Safe confirm dialog — falls back to true in extension context
     * where window.confirm() is unavailable.
     * Returns a Promise for consistent async usage.
     */
    async confirm(message) {
        if (CONFIG.isExtension) {
            // In extension pages confirm() always returns false; use a custom modal instead.
            return ConfirmModal.show(message);
        }
        return window.confirm(message);
    }
};

/** ============================================
 * LIGHTWEIGHT CONFIRM MODAL
 * (replaces window.confirm() in extension context)
 * ============================================ */
const ConfirmModal = {
    _resolve: null,

    show(message) {
        return new Promise((resolve) => {
            this._resolve = resolve;

            let overlay = document.getElementById('confirmOverlay');
            if (!overlay) {
                overlay = this._build();
                document.body.appendChild(overlay);
            }

            overlay.querySelector('.confirm-message').textContent = message;
            overlay.classList.add('active');
        });
    },

    _build() {
        const overlay = document.createElement('div');
        overlay.id = 'confirmOverlay';
        overlay.className = 'modal-overlay';
        overlay.setAttribute('role', 'alertdialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.innerHTML = `
            <div class="modal">
                <p class="confirm-message"></p>
                <div class="modal-buttons">
                    <button id="confirmCancel">Ακύρωση</button>
                    <button id="confirmOk">OK</button>
                </div>
            </div>
        `;

        overlay.querySelector('#confirmOk').addEventListener('click', () => this._close(true));
        overlay.querySelector('#confirmCancel').addEventListener('click', () => this._close(false));
        overlay.addEventListener('click', (e) => { if (e.target === overlay) this._close(false); });

        return overlay;
    },

    _close(result) {
        const overlay = document.getElementById('confirmOverlay');
        overlay?.classList.remove('active');
        if (this._resolve) {
            this._resolve(result);
            this._resolve = null;
        }
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
            this.bookmarks = Array.isArray(stored) ? stored : [];
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

        grid.innerHTML = '';

        if (this.bookmarks.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'empty-state';
            empty.innerHTML = `
                <div class="empty-state-icon">🚀</div>
                <h3>Καλώς ήρθες στο Portify!</h3>
                <p>Πρόσθεσε το πρώτο σου αγαπημένο site παραπάνω.</p>
                <div class="onboarding-tips">
                    <div class="onboarding-tip">💡 Γράψε <b>netflix.com</b> στο Smart Add</div>
                    <div class="onboarding-tip">🔍 Στο Search γράψε <b>youtube cats</b> + Enter</div>
                    <div class="onboarding-tip">🌍 Δες sites από <b>7 χώρες</b> παρακάτω</div>
                </div>
            `;
            grid.appendChild(empty);
        } else {
            this.bookmarks.forEach((bookmark, index) => {
                grid.appendChild(this._createCard(bookmark, index, true));
            });
        }

        if (countEl) {
            const n = this.bookmarks.length;
            countEl.textContent = `${n} ${n === 1 ? 'item' : 'items'}`;
        }

        DragDrop.enableCards();
        CategoryFilter.applyToGrid();
    },

    renderDefaults() {
        const trendingGrid = document.getElementById('trendingGrid');
        if (trendingGrid) {
            trendingGrid.innerHTML = '';
            DEFAULT_BOOKMARKS.trending.forEach(b => trendingGrid.appendChild(this._createCard(b, null, false)));
        }
    },

    /**
     * Creates card DOM nodes safely — NO innerHTML with user data,
     * eliminating the XSS vector from the previous version.
     */
    _createCard(bookmark, index, isEditable) {
        const domain = Utils.getDomain(bookmark.url);
        const category = CATEGORIES[bookmark.category] || CATEGORIES.other;
        const faviconUrl = `https://www.google.com/s2/favicons?sz=64&domain=${encodeURIComponent(domain)}`;

        const card = document.createElement('div');
        card.className = `card cat-${bookmark.category}`;
        card.setAttribute('role', 'listitem');
        card.setAttribute('tabindex', '0');
        card.title = bookmark.name;

        // Navigate on click / Enter / Space
        const navigate = () => {
            RecentVisits.track(bookmark);
            window.open(bookmark.url, '_blank', 'noopener,noreferrer');
        };
        card.addEventListener('click', navigate);
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(); }
        });

        // Edit / Delete buttons (only for user bookmarks)
        if (isEditable) {
            const actions = document.createElement('div');
            actions.className = 'card-actions';

            const editBtn = document.createElement('button');
            editBtn.className = 'card-action-btn';
            editBtn.textContent = '✏️';
            editBtn.title = 'Επεξεργασία';
            editBtn.setAttribute('aria-label', `Επεξεργασία ${bookmark.name}`);
            editBtn.addEventListener('click', (e) => { e.stopPropagation(); this.edit(index); });

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'card-action-btn';
            deleteBtn.textContent = '🗑️';
            deleteBtn.title = 'Διαγραφή';
            deleteBtn.setAttribute('aria-label', `Διαγραφή ${bookmark.name}`);
            deleteBtn.addEventListener('click', (e) => { e.stopPropagation(); this.remove(index); });

            actions.appendChild(editBtn);
            actions.appendChild(deleteBtn);
            card.appendChild(actions);
        }

        // Favicon
        const img = document.createElement('img');
        img.className = 'card-icon';
        img.src = faviconUrl;
        img.alt = bookmark.name;
        img.width = 56;
        img.height = 56;
        img.addEventListener('error', () => { img.src = Utils.getFallbackIcon(category.icon); });
        card.appendChild(img);

        // Title
        const title = document.createElement('h3');
        title.className = 'card-title';
        title.textContent = bookmark.name; // textContent = safe, no XSS
        card.appendChild(title);

        // URL label
        const urlEl = document.createElement('p');
        urlEl.className = 'card-url';
        urlEl.textContent = domain;
        card.appendChild(urlEl);

        return card;
    },

    edit(index) {
        const bookmark = this.bookmarks[index];
        if (!bookmark) return;

        document.getElementById('editIndex').value = index;
        document.getElementById('editName').value = bookmark.name;
        document.getElementById('editUrl').value = bookmark.url;
        document.getElementById('editCategory').value = bookmark.category;

        document.getElementById('editModal')?.classList.add('active');
        document.getElementById('editName')?.focus();
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
        this.input  = document.getElementById('smartInput');
        this.button = document.getElementById('addBtn');
        this.preview = document.getElementById('previewCard');
        this.status  = document.getElementById('inputStatus');

        if (!this.input || !this.button) return;

        this.input.addEventListener('input', Utils.debounce(() => this.handleInput(), 300));
        this.input.addEventListener('keydown', (e) => { if (e.key === 'Enter') this.handleSubmit(); });
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
            this.status.textContent = '';
            return;
        }

        this.button.disabled = false;
        const parsedUrl = Utils.parseUrl(value);

        if (parsedUrl) {
            this.status.textContent = '🔗 URL αναγνωρίστηκε';
            this.status.style.color = 'var(--accent-green)';
            this.updatePreview(parsedUrl);
        } else {
            this.status.textContent = '🔍 Θα γίνει αναζήτηση';
            this.status.style.color = 'var(--accent-blue)';
            this.hidePreview();
        }
    },

    updatePreview(url = null) {
        const raw = url || Utils.parseUrl(this.input.value.trim());
        if (!raw) return;

        const domain = Utils.getDomain(raw);

        document.getElementById('previewIcon').src =
            `https://www.google.com/s2/favicons?sz=64&domain=${encodeURIComponent(domain)}`;
        document.getElementById('previewName').textContent = this._extractName(domain);
        document.getElementById('previewUrl').textContent = domain;

        this.preview?.classList.add('visible');
    },

    hidePreview() {
        this.preview?.classList.remove('visible');
    },

    async handleSubmit() {
        const value = this.input.value.trim();
        if (!value) return;

        const parsedUrl = Utils.parseUrl(value);

        if (parsedUrl) {
            const category = document.getElementById('customCategory')?.value || 'other';
            const domain = Utils.getDomain(parsedUrl);

            const success = await State.add({
                name: this._extractName(domain),
                url: parsedUrl,
                category
            });

            if (success) {
                this.input.value = '';
                this.hidePreview();
                this.button.disabled = true;
                this.status.textContent = '';
            }
        } else {
            window.open(`https://www.google.com/search?q=${encodeURIComponent(value)}`, '_blank', 'noopener,noreferrer');
            this.input.value = '';
            this.status.textContent = '';
        }
    },

    _extractName(domain) {
        const name = domain.split('.')[0];
        return name.charAt(0).toUpperCase() + name.slice(1);
    }
};

/** ============================================
 * AI SEARCH PATTERNS
 * Maps typed queries to direct URLs
 * ============================================ */
const AI_PATTERNS = [
    // YouTube
    { pattern: /^(yt|youtube)\s+(.+)$/i,      url: q => `https://www.youtube.com/results?search_query=${encodeURIComponent(q[2])}`, label: '▶️ YouTube' },
    // Google Maps
    { pattern: /^(maps?|χάρτης?)\s+(.+)$/i,   url: q => `https://www.google.com/maps/search/${encodeURIComponent(q[2])}`,          label: '🗺️ Maps' },
    // Weather
    { pattern: /^(weather|καιρός?)\s*(.*)$/i,  url: q => `https://www.google.com/search?q=weather+${encodeURIComponent(q[2]||'')}`, label: '🌤️ Weather' },
    // Wikipedia
    { pattern: /^(wiki|wikipedia)\s+(.+)$/i,   url: q => `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(q[2])}`, label: '📖 Wikipedia' },
    // Reddit
    { pattern: /^(reddit|r\/)\s*(.+)$/i,       url: q => `https://www.reddit.com/search/?q=${encodeURIComponent(q[2])}`,            label: '👽 Reddit' },
    // GitHub
    { pattern: /^(gh|github)\s+(.+)$/i,        url: q => `https://github.com/search?q=${encodeURIComponent(q[2])}`,                 label: '🐙 GitHub' },
    // Translate
    { pattern: /^(translate|μετάφρ[α-ω]+)\s+(.+)$/i, url: q => `https://translate.google.com/?text=${encodeURIComponent(q[2])}`,   label: '🌐 Translate' },
    // News Greece
    { pattern: /^(news|ειδήσεις?)\s*(greece|ελλ[α-ω]+)?$/i, url: () => `https://news.google.com/search?q=Ελλάδα&hl=el`,           label: '📰 News GR' },
    // Amazon
    { pattern: /^(amazon|amz)\s+(.+)$/i,       url: q => `https://www.amazon.com/s?k=${encodeURIComponent(q[2])}`,                  label: '🛒 Amazon' },
    // Skroutz
    { pattern: /^(skroutz)\s+(.+)$/i,          url: q => `https://www.skroutz.gr/search?keyphrase=${encodeURIComponent(q[2])}`,     label: '🛒 Skroutz' },
    // Gmail
    { pattern: /^(gmail|mail|email)$/i,         url: () => `https://mail.google.com`,                                                label: '📧 Gmail' },
    // Math (simple)
    { pattern: /^[\d\s\+\-\*\/\(\)\.]+[=?]?\s*$/,url: q => `https://www.google.com/search?q=${encodeURIComponent(q[0])}`,          label: '🔢 Calculator' },
];

/** ============================================
 * SEARCH — fuzzy, accent-insensitive,
 *          AI patterns, Enter → smart open
 * ============================================ */
const Search = {
    _hint: null,

    init() {
        const input = document.getElementById('searchInput');
        if (!input) return;

        input.addEventListener('input', Utils.debounce((e) => {
            this._updateHint(e.target.value);
            this.filter(e.target.value);
        }, 200));

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const term = input.value.trim();
                if (!term) return;
                const url = this._resolveUrl(term);
                window.open(url, '_blank', 'noopener,noreferrer');
                input.value = '';
                this._clearHint();
                this.filter('');
            }
            if (e.key === 'Escape') {
                input.value = '';
                this._clearHint();
                this.filter('');
            }
        });
    },

    /** Resolve a query to the best URL */
    _resolveUrl(term) {
        for (const p of AI_PATTERNS) {
            const m = term.match(p.pattern);
            if (m) return p.url(m);
        }
        return `https://www.google.com/search?q=${encodeURIComponent(term)}`;
    },

    /** Show AI hint below search bar */
    _updateHint(term) {
        const hintsEl = document.querySelector('.ai-hints');
        if (!hintsEl) return;

        if (!term.trim()) {
            this._clearHint();
            return;
        }

        for (const p of AI_PATTERNS) {
            if (term.match(p.pattern)) {
                hintsEl.innerHTML = `<span style="color:var(--accent-green)">⚡ Enter → ${p.label}</span>`;
                return;
            }
        }
        hintsEl.innerHTML = `<span style="color:var(--accent-blue)">🔍 Enter → Google: <b>${term}</b></span>`;
    },

    _clearHint() {
        const hintsEl = document.querySelector('.ai-hints');
        if (hintsEl) hintsEl.innerHTML = `Δοκίμασε: <b>youtube cats</b> · <b>maps athens</b> · <b>weather</b>`;
    },

    _normalize(str) {
        return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    },

    _fuzzy(needle, haystack) {
        if (!needle) return true;
        const n = this._normalize(needle);
        const h = this._normalize(haystack);
        let ni = 0;
        for (let hi = 0; hi < h.length && ni < n.length; hi++) {
            if (h[hi] === n[ni]) ni++;
        }
        return ni === n.length;
    },

    filter(term) {
        const grids = ['favoritesGrid', 'trendingGrid', 'countryGrid'];
        grids.forEach(gridId => {
            const grid = document.getElementById(gridId);
            if (!grid) return;
            grid.querySelectorAll('.card').forEach(card => {
                const title = card.querySelector('.card-title')?.textContent || '';
                const url   = card.querySelector('.card-url')?.textContent || '';
                const matches = !term.trim() || this._fuzzy(term, title) || this._fuzzy(term, url);
                card.style.display = matches ? '' : 'none';
            });
        });
        CategoryFilter.applyToGrid();
    }
};

/** ============================================
 * MODAL HANDLERS
 * ============================================ */
const Modals = {
    init() {
        // Close on backdrop click
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) overlay.classList.remove('active');
            });
        });

        // Close on Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
            }
        });

        // Edit form submit (no inline onsubmit in HTML)
        document.getElementById('editForm')?.addEventListener('submit', (e) => this.saveEdit(e));

        // Cancel button (no inline onclick in HTML)
        document.getElementById('cancelEditBtn')?.addEventListener('click', () => this.hideEdit());
    },

    hideEdit() {
        document.getElementById('editModal')?.classList.remove('active');
    },

    async saveEdit(e) {
        e.preventDefault();

        const index    = parseInt(document.getElementById('editIndex').value, 10);
        const name     = document.getElementById('editName').value.trim();
        const url      = document.getElementById('editUrl').value.trim();
        const category = document.getElementById('editCategory').value;

        if (!name || !url) {
            Utils.showToast('Συμπλήρωσε όλα τα πεδία!', 'error');
            return;
        }

        // Validate the edited URL too
        const parsedUrl = Utils.parseUrl(url);
        if (!parsedUrl) {
            Utils.showToast('Μη έγκυρο URL!', 'error');
            return;
        }

        const success = await State.update(index, { name, url: parsedUrl, category });
        if (success) this.hideEdit();
    }
};

/** ============================================
 * KEYBOARD SHORTCUTS
 * ============================================ */
const Shortcuts = {
    init() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K → focus search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                document.getElementById('searchInput')?.focus();
            }

            // Alt + A → focus smart add input (Ctrl+N conflicts with new window)
            if (e.altKey && e.key === 'a') {
                e.preventDefault();
                document.getElementById('smartInput')?.focus();
            }

            // Ctrl/Cmd + 1-9 → open bookmark by position
            if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '9') {
                e.preventDefault();
                const bookmark = State.bookmarks[parseInt(e.key, 10) - 1];
                if (bookmark) window.open(bookmark.url, '_blank', 'noopener,noreferrer');
            }
        });
    }
};

/** ============================================
 * EXPORT / IMPORT
 * ============================================ */
const DataManager = {
    export() {
        const data = {
            bookmarks: State.bookmarks,
            exportedAt: new Date().toISOString(),
            version: CONFIG.version
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url  = URL.createObjectURL(blob);

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
        input.type   = 'file';
        input.accept = '.json,application/json';

        input.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            if (file.size > CONFIG.maxFileSize) {
                Utils.showToast('Το αρχείο είναι πολύ μεγάλο (max 1MB)', 'error');
                return;
            }

            const reader = new FileReader();

            reader.addEventListener('load', async (event) => {
                try {
                    const data = JSON.parse(event.target.result);

                    if (!data.bookmarks || !Array.isArray(data.bookmarks)) {
                        throw new Error('Invalid format');
                    }

                    const validBookmarks = data.bookmarks.filter(b =>
                        b && typeof b.name === 'string' &&
                        typeof b.url  === 'string' &&
                        typeof b.category === 'string' &&
                        Utils.parseUrl(b.url) !== null
                    );

                    if (validBookmarks.length === 0) {
                        throw new Error('No valid bookmarks');
                    }

                    // ← replaces window.confirm() — works in extensions too
                    if (State.bookmarks.length > 0) {
                        const ok = await Utils.confirm(
                            `Βρέθηκαν ${validBookmarks.length} bookmarks. Να αντικαταστήσω τα υπάρχοντα;`
                        );
                        if (!ok) return;
                    }

                    State.bookmarks = validBookmarks.slice(0, CONFIG.maxBookmarks);
                    await State.save();
                    State.render();

                    Utils.showToast(`✅ Εισαγωγή ${validBookmarks.length} bookmarks!`);

                } catch (err) {
                    console.error('Import error:', err);
                    Utils.showToast('❌ Άκυρο αρχείο!', 'error');
                }
            });

            reader.addEventListener('error', () => {
                Utils.showToast('❌ Σφάλμα ανάγνωσης!', 'error');
            });

            reader.readAsText(file);
        });

        input.click();
    }
};

/** ============================================
 * CATEGORY FILTER (for favorites grid)
 * ============================================ */
const CategoryFilter = {
    active: 'all',

    init() {
        const bar = document.getElementById('categoryFilterBar');
        if (!bar) return;

        const filters = [
            { id: 'all', icon: '⭐', label: 'Όλα' },
            ...Object.entries(CATEGORIES).map(([id, cat]) => ({
                id, icon: cat.icon, label: cat.label
            }))
        ];

        filters.forEach(f => {
            const btn = document.createElement('button');
            btn.className = 'cat-filter-btn' + (f.id === 'all' ? ' active' : '');
            btn.dataset.cat = f.id;
            btn.setAttribute('aria-label', f.label);
            btn.innerHTML = `<span>${f.icon}</span><span class="cat-filter-label">${f.label}</span>`;
            btn.addEventListener('click', () => this.activate(f.id));
            bar.appendChild(btn);
        });
    },

    activate(id) {
        this.active = id;
        document.querySelectorAll('.cat-filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.cat === id);
        });
        this.applyToGrid();
    },

    applyToGrid() {
        const grid = document.getElementById('favoritesGrid');
        if (!grid) return;
        grid.querySelectorAll('.card').forEach(card => {
            if (this.active === 'all') {
                card.style.display = '';
                return;
            }
            card.style.display = card.classList.contains(`cat-${this.active}`) ? '' : 'none';
        });
    }
};

/** ============================================
 * DRAG & DROP (favorites reorder)
 * ============================================ */
const DragDrop = {
    dragIndex: null,
    dragEl: null,

    init() {
        const grid = document.getElementById('favoritesGrid');
        if (!grid) return;

        grid.addEventListener('dragstart', (e) => this._onDragStart(e));
        grid.addEventListener('dragover',  (e) => this._onDragOver(e));
        grid.addEventListener('drop',      (e) => this._onDrop(e));
        grid.addEventListener('dragend',   (e) => this._onDragEnd(e));

        // Touch support
        grid.addEventListener('touchstart', (e) => this._onTouchStart(e), { passive: true });
        grid.addEventListener('touchmove',  (e) => this._onTouchMove(e),  { passive: false });
        grid.addEventListener('touchend',   (e) => this._onTouchEnd(e));
    },

    enableCards() {
        document.getElementById('favoritesGrid')
            ?.querySelectorAll('.card')
            .forEach((card, i) => {
                card.setAttribute('draggable', 'true');
                card.dataset.index = i;
            });
    },

    _getCard(el) { return el.closest('.card[draggable]'); },

    _onDragStart(e) {
        const card = this._getCard(e.target);
        if (!card) return;
        this.dragIndex = parseInt(card.dataset.index, 10);
        this.dragEl = card;
        card.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
    },

    _onDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        const card = this._getCard(e.target);
        if (!card || card === this.dragEl) return;
        document.querySelectorAll('.card.drag-over').forEach(c => c.classList.remove('drag-over'));
        card.classList.add('drag-over');
    },

    async _onDrop(e) {
        e.preventDefault();
        const card = this._getCard(e.target);
        if (!card || card === this.dragEl) return;
        const toIndex = parseInt(card.dataset.index, 10);
        if (this.dragIndex === toIndex) return;
        const items = [...State.bookmarks];
        const [moved] = items.splice(this.dragIndex, 1);
        items.splice(toIndex, 0, moved);
        State.bookmarks = items;
        await State.save();
        State.render();
        Utils.showToast('Αναδιάταξη! 🔀');
    },

    _onDragEnd() {
        document.querySelectorAll('.card.dragging, .card.drag-over')
            .forEach(c => c.classList.remove('dragging', 'drag-over'));
        this.dragEl = null;
        this.dragIndex = null;
    },

    // Touch drag
    _touch: { startX: 0, startY: 0, el: null, clone: null, fromIndex: null },

    _onTouchStart(e) {
        const card = this._getCard(e.target);
        if (!card) return;
        const t = e.touches[0];
        this._touch = { startX: t.clientX, startY: t.clientY, el: card,
                        clone: null, fromIndex: parseInt(card.dataset.index, 10) };
    },

    _onTouchMove(e) {
        if (!this._touch.el) return;
        const dx = Math.abs(e.touches[0].clientX - this._touch.startX);
        const dy = Math.abs(e.touches[0].clientY - this._touch.startY);
        if (dx < 8 && dy < 8) return;
        e.preventDefault();

        if (!this._touch.clone) {
            const clone = this._touch.el.cloneNode(true);
            clone.style.cssText = `position:fixed;opacity:0.75;pointer-events:none;z-index:9999;width:${this._touch.el.offsetWidth}px`;
            document.body.appendChild(clone);
            this._touch.clone = clone;
            this._touch.el.classList.add('dragging');
        }

        const t = e.touches[0];
        this._touch.clone.style.left = `${t.clientX - this._touch.el.offsetWidth / 2}px`;
        this._touch.clone.style.top  = `${t.clientY - this._touch.el.offsetHeight / 2}px`;

        document.querySelectorAll('.card.drag-over').forEach(c => c.classList.remove('drag-over'));
        const under = document.elementFromPoint(t.clientX, t.clientY)?.closest('.card[draggable]');
        if (under && under !== this._touch.el) under.classList.add('drag-over');
    },

    async _onTouchEnd(e) {
        if (!this._touch.el) return;
        const t = e.changedTouches[0];
        const under = document.elementFromPoint(t.clientX, t.clientY)?.closest('.card[draggable]');

        if (under && under !== this._touch.el) {
            const toIndex = parseInt(under.dataset.index, 10);
            const items = [...State.bookmarks];
            const [moved] = items.splice(this._touch.fromIndex, 1);
            items.splice(toIndex, 0, moved);
            State.bookmarks = items;
            await State.save();
            State.render();
            Utils.showToast('Αναδιάταξη! 🔀');
        }

        this._touch.clone?.remove();
        document.querySelectorAll('.card.dragging, .card.drag-over')
            .forEach(c => c.classList.remove('dragging', 'drag-over'));
        this._touch = { startX: 0, startY: 0, el: null, clone: null, fromIndex: null };
    }
};

/** ============================================
 * RECENT VISITS
 * ============================================ */
const RecentVisits = {
    visits: [],

    async init() {
        try {
            const stored = await Storage.get(CONFIG.recentKey);
            this.visits = Array.isArray(stored) ? stored : [];
        } catch { this.visits = []; }
        this.render();
    },

    async track(bookmark) {
        this.visits = this.visits.filter(v => v.url !== bookmark.url);
        this.visits.unshift({ name: bookmark.name, url: bookmark.url, category: bookmark.category, ts: Date.now() });
        this.visits = this.visits.slice(0, CONFIG.maxRecent);
        try { await Storage.set(CONFIG.recentKey, this.visits); } catch {}
        this.render();
    },

    render() {
        const grid    = document.getElementById('recentGrid');
        const section = document.getElementById('recentSection');
        if (!grid || !section) return;

        if (this.visits.length === 0) {
            section.style.display = 'none';
            return;
        }

        section.style.display = '';
        grid.innerHTML = '';
        this.visits.forEach(v => {
            const card = State._createCard(v, null, false);
            grid.appendChild(card);
        });
    }
};

/** ============================================
 * COUNTRY TABS
 * ============================================ */
const CountryTabs = {
    activeId: 'gr',

    init() {
        const tabBar = document.getElementById('countryTabBar');
        const grid   = document.getElementById('countryGrid');
        if (!tabBar || !grid) return;

        // Build tab buttons
        COUNTRY_TABS.forEach(country => {
            const btn = document.createElement('button');
            btn.className = 'country-tab' + (country.id === this.activeId ? ' active' : '');
            btn.setAttribute('aria-selected', country.id === this.activeId ? 'true' : 'false');
            btn.setAttribute('role', 'tab');
            btn.setAttribute('data-country', country.id);
            btn.setAttribute('aria-label', country.label);
            btn.innerHTML = `<span class="tab-flag">${country.flag}</span><span class="tab-label">${country.label}</span>`;
            btn.addEventListener('click', () => this.activate(country.id));
            tabBar.appendChild(btn);
        });

        this.renderGrid(this.activeId);
    },

    activate(id) {
        this.activeId = id;

        // Update tab button states
        document.querySelectorAll('.country-tab').forEach(btn => {
            const isActive = btn.dataset.country === id;
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });

        // Render the grid with a quick fade
        const grid = document.getElementById('countryGrid');
        if (grid) {
            grid.style.opacity = '0';
            setTimeout(() => {
                this.renderGrid(id);
                grid.style.opacity = '1';
            }, 150);
        }
    },

    renderGrid(id) {
        const country = COUNTRY_TABS.find(c => c.id === id);
        const grid = document.getElementById('countryGrid');
        if (!country || !grid) return;

        grid.innerHTML = '';
        country.sites.forEach(site => {
            grid.appendChild(State._createCard(site, null, false));
        });
    }
};

/** ============================================
 * INITIALIZATION
 * ============================================ */
document.addEventListener('DOMContentLoaded', async () => {
    await State.init();
    await RecentVisits.init();
    SmartInput.init();
    Search.init();
    Modals.init();
    Shortcuts.init();
    CategoryFilter.init();
    DragDrop.init();
    CountryTabs.init();

    document.getElementById('exportBtn')?.addEventListener('click', () => DataManager.export());
    document.getElementById('importBtn')?.addEventListener('click', () => DataManager.import());

    // Show sync status
    const syncStatus = await Storage.getSyncStatus();
    const footer = document.querySelector('.footer p');
    if (footer && CONFIG.isExtension) {
        const syncBadge = document.createElement('span');
        syncBadge.style.cssText = 'margin-left:8px;font-size:0.8rem;opacity:0.5;';
        syncBadge.textContent = syncStatus === 'sync' ? '☁️ Sync on' : '💾 Local';
        syncBadge.title = syncStatus === 'sync'
            ? 'Τα bookmarks συγχρονίζονται σε όλες τις συσκευές'
            : 'Τα bookmarks αποθηκεύονται τοπικά';
        footer.appendChild(syncBadge);
    }

    console.log(`🚀 Portify v${CONFIG.version} [${CONFIG.isExtension ? 'Extension' : 'Web'}] [Storage: ${syncStatus ?? 'localStorage'}]`);
}, { once: true });
