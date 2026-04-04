// ============================================
// PORTIFY SCRIPT v3.6 - CHROME EXTENSION EDITION
// With Quick Access Dock Feature
// ============================================

'use strict';

const CONFIG = {
    storageKey:   'portify_bookmarks',
    recentKey:    'portify_recent',
    dockKey:      'portify_dock_items',
    maxBookmarks: 100,
    maxRecent:    6,
    maxFileSize:  1024 * 1024,
    version:      '3.6',
    isExtension:  typeof chrome !== 'undefined' && chrome.storage !== undefined,
    useSync:      typeof chrome !== 'undefined' && chrome.storage?.sync !== undefined
};

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
            { name: 'NY Times',  url: 'https://nytimes.com',   category: 'news' },
            { name: 'CNN',       url: 'https://cnn.com',       category: 'news' },
            { name: 'ESPN',      url: 'https://espn.com',      category: 'sports' },
            { name: 'The Verge', url: 'https://theverge.com',  category: 'work' },
            { name: 'Amazon',    url: 'https://amazon.com',    category: 'shopping' },
            { name: 'eBay',      url: 'https://ebay.com',      category: 'shopping' },
            { name: 'Hulu',      url: 'https://hulu.com',      category: 'entertainment' },
            { name: 'Bloomberg', url: 'https://bloomberg.com', category: 'finance' }
        ]
    },
    {
        id: 'gb', flag: '🇬🇧', label: 'UK',
        sites: [
            { name: 'BBC News',    url: 'https://bbc.co.uk/news',  category: 'news' },
            { name: 'The Guardian',url: 'https://theguardian.com', category: 'news' },
            { name: 'Sky Sports',  url: 'https://skysports.com',   category: 'sports' },
            { name: 'The Sun',     url: 'https://thesun.co.uk',    category: 'news' },
            { name: 'Amazon UK',   url: 'https://amazon.co.uk',    category: 'shopping' },
            { name: 'ASOS',        url: 'https://asos.com',        category: 'shopping' },
            { name: 'ITV',         url: 'https://itv.com',         category: 'entertainment' },
            { name: 'Financial T.',url: 'https://ft.com',          category: 'finance' }
        ]
    },
    {
        id: 'de', flag: '🇩🇪', label: 'Deutschland',
        sites: [
            { name: 'Spiegel',     url: 'https://spiegel.de',       category: 'news' },
            { name: 'Zeit Online', url: 'https://zeit.de',          category: 'news' },
            { name: 'Kicker',      url: 'https://kicker.de',        category: 'sports' },
            { name: 'Sport1',      url: 'https://sport1.de',        category: 'sports' },
            { name: 'Amazon DE',   url: 'https://amazon.de',        category: 'shopping' },
            { name: 'Otto',        url: 'https://otto.de',          category: 'shopping' },
            { name: 'ARD',         url: 'https://ard.de',           category: 'entertainment' },
            { name: 'Handelsblatt',url: 'https://handelsblatt.com', category: 'finance' }
        ]
    },
    {
        id: 'fr', flag: '🇫🇷', label: 'France',
        sites: [
            { name: 'Le Monde',  url: 'https://lemonde.fr',  category: 'news' },
            { name: 'Le Figaro', url: 'https://lefigaro.fr', category: 'news' },
            { name: "L'Équipe",  url: 'https://lequipe.fr',  category: 'sports' },
            { name: 'Eurosport', url: 'https://eurosport.fr',category: 'sports' },
            { name: 'Amazon FR', url: 'https://amazon.fr',   category: 'shopping' },
            { name: 'Fnac',      url: 'https://fnac.com',    category: 'shopping' },
            { name: 'TF1',       url: 'https://tf1.fr',      category: 'entertainment' },
            { name: 'Les Echos', url: 'https://lesechos.fr', category: 'finance' }
        ]
    },
    {
        id: 'es', flag: '🇪🇸', label: 'España',
        sites: [
            { name: 'El País',  url: 'https://elpais.com',       category: 'news' },
            { name: 'El Mundo', url: 'https://elmundo.es',       category: 'news' },
            { name: 'Marca',    url: 'https://marca.com',        category: 'sports' },
            { name: 'AS',       url: 'https://as.com',           category: 'sports' },
            { name: 'Amazon ES',url: 'https://amazon.es',        category: 'shopping' },
            { name: 'El Corte', url: 'https://elcorteingles.es', category: 'shopping' },
            { name: 'RTVE',     url: 'https://rtve.es',          category: 'entertainment' },
            { name: 'Expansión',url: 'https://expansion.com',    category: 'finance' }
        ]
    },
    {
        id: 'it', flag: '🇮🇹', label: 'Italia',
        sites: [
            { name: 'Repubblica', url: 'https://repubblica.it',  category: 'news' },
            { name: 'Corriere',   url: 'https://corriere.it',    category: 'news' },
            { name: 'Gazzetta',   url: 'https://gazzetta.it',    category: 'sports' },
            { name: 'Sky Sport',  url: 'https://sport.sky.it',   category: 'sports' },
            { name: 'Amazon IT',  url: 'https://amazon.it',      category: 'shopping' },
            { name: 'Zalando IT', url: 'https://zalando.it',     category: 'shopping' },
            { name: 'RAI',        url: 'https://rai.it',         category: 'entertainment' },
            { name: 'Il Sole 24', url: 'https://ilsole24ore.com',category: 'finance' }
        ]
    }
];

// ============================================
// QUICK ACCESS DOCK
// 13 apps · 2 rows (7+6)
// ============================================
const QuickDock = {
    items: [],

    defaultItems: [
        // Row 1
        { id: 'whatsapp',  name: 'WhatsApp',  url: 'https://web.whatsapp.com',  icon: '💬', color: '#25d366' },
        { id: 'reddit',    name: 'Reddit',    url: 'https://reddit.com',        icon: '🔴', color: '#ff4500' },
        { id: 'instagram', name: 'Instagram', url: 'https://instagram.com',     icon: '📸', color: '#e4405f' },
        { id: 'facebook',  name: 'Facebook',  url: 'https://facebook.com',      icon: '👤', color: '#1877f2' },
        { id: 'linkedin',  name: 'LinkedIn',  url: 'https://linkedin.com',      icon: '💼', color: '#0a66c2' },
        { id: 'quora',     name: 'Quora',     url: 'https://quora.com',         icon: '❓', color: '#b92b27' },
        { id: 'tiktok',    name: 'TikTok',    url: 'https://tiktok.com',        icon: '🎵', color: '#ff0050' },
        // Row 2
        { id: 'gpt',       name: 'ChatGPT',   url: 'https://chat.openai.com',   icon: '🤖', color: '#10a37f' },
        { id: 'claude',    name: 'Claude',    url: 'https://claude.ai',         icon: '🧠', color: '#d97757' },
        { id: 'spotify',   name: 'Spotify',   url: 'https://open.spotify.com',  icon: '🎧', color: '#1db954' },
        { id: 'twitter',   name: 'Twitter',   url: 'https://twitter.com',       icon: '𝕏',  color: '#1d9bf0' },
        { id: 'gmail',     name: 'Gmail',     url: 'https://gmail.com',         icon: '📧', color: '#ea4335' },
        { id: 'github',    name: 'GitHub',    url: 'https://github.com',        icon: '🐙', color: '#6e40c9' },
    ],

    async init() {
        await this.load();
        this.render();
        this.setupDragDrop();
        this.setupContextMenu();
    },

    async load() {
        try {
            const stored = await Storage.get(CONFIG.dockKey);
            this.items = Array.isArray(stored) && stored.length > 0
                ? stored
                : [...this.defaultItems];
        } catch {
            this.items = [...this.defaultItems];
        }
    },

    async save() {
        try {
            await Storage.set(CONFIG.dockKey, this.items);
        } catch (e) {
            console.error('Failed to save dock:', e);
        }
    },

    render() {
        const container = document.getElementById('quickDock');
        if (!container) return;
        container.innerHTML = '';
        this.items.forEach((item, index) => {
            container.appendChild(this.createDockItem(item, index));
        });
    },

    createDockItem(item, index) {
        const a = document.createElement('a');
        a.className = 'dock-item';
        a.href = item.url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.dataset.index = index;
        a.dataset.app = item.id;
        a.setAttribute('role', 'listitem');
        a.setAttribute('draggable', 'true');
        a.title = item.name;

        const icon = document.createElement('span');
        icon.className = 'dock-icon emoji';
        icon.textContent = item.icon;

        const label = document.createElement('span');
        label.className = 'dock-label';
        label.textContent = item.name;

        a.appendChild(icon);
        a.appendChild(label);
        return a;
    },

    setupDragDrop() {
        const container = document.getElementById('quickDock');
        if (!container) return;
        let draggedIndex = null;

        container.addEventListener('dragstart', (e) => {
            const item = e.target.closest('.dock-item');
            if (!item) return;
            draggedIndex = parseInt(item.dataset.index);
            item.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        });

        container.addEventListener('dragover', (e) => {
            e.preventDefault();
            const item = e.target.closest('.dock-item');
            if (!item || item.classList.contains('dragging')) return;
            container.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
            item.classList.add('drag-over');
        });

        container.addEventListener('drop', async (e) => {
            e.preventDefault();
            const item = e.target.closest('.dock-item');
            if (!item) return;
            const dropIndex = parseInt(item.dataset.index);
            if (draggedIndex === null || draggedIndex === dropIndex) return;
            const [moved] = this.items.splice(draggedIndex, 1);
            this.items.splice(dropIndex, 0, moved);
            await this.save();
            this.render();
            Utils.showToast('Αναδιάταξη dock! 🔀');
        });

        container.addEventListener('dragend', () => {
            container.querySelectorAll('.dragging, .drag-over').forEach(el =>
                el.classList.remove('dragging', 'drag-over'));
            draggedIndex = null;
        });
    },

    setupContextMenu() {
        const container = document.getElementById('quickDock');
        if (!container) return;

        const menu = document.createElement('div');
        menu.className = 'dock-context-menu';
        menu.id = 'dockContextMenu';
        menu.innerHTML = `
            <div class="dock-context-item" data-action="remove">🗑️ Αφαίρεση</div>
            <div class="dock-context-item" data-action="reset">🔄 Επαναφορά</div>
        `;
        document.body.appendChild(menu);

        let contextItemIndex = null;

        container.addEventListener('contextmenu', (e) => {
            const item = e.target.closest('.dock-item');
            if (!item) return;
            e.preventDefault();
            contextItemIndex = parseInt(item.dataset.index);
            const x = Math.min(e.pageX, window.innerWidth - 160);
            const y = Math.min(e.pageY, window.innerHeight - 120);
            menu.style.left = `${x}px`;
            menu.style.top  = `${y}px`;
            menu.classList.add('active');
        });

        menu.addEventListener('click', async (e) => {
            const action = e.target.closest('.dock-context-item')?.dataset.action;
            if (!action || contextItemIndex === null) return;
            menu.classList.remove('active');
            if (action === 'remove') {
                this.items.splice(contextItemIndex, 1);
                await this.save();
                this.render();
                Utils.showToast('Αφαιρέθηκε από το dock! 🗑️');
            } else if (action === 'reset') {
                this.items = [...this.defaultItems];
                await this.save();
                this.render();
                Utils.showToast('Επαναφορά προεπιλογών! 🔄');
            }
            contextItemIndex = null;
        });

        document.addEventListener('click', (e) => {
            if (!menu.contains(e.target)) menu.classList.remove('active');
        });
    }
};

// ============================================
// STORAGE ADAPTER
// ============================================
const Storage = {
    _backend(key) {
        if (!CONFIG.isExtension) return null;
        if (key === CONFIG.recentKey) return chrome.storage.local;
        return CONFIG.useSync ? chrome.storage.sync : chrome.storage.local;
    },

    async get(key) {
        const backend = this._backend(key);
        if (backend) {
            try {
                const result = await backend.get(key);
                return result[key] ?? null;
            } catch (e) {
                console.warn(`Storage.get(${key}) failed:`, e);
                if (backend === chrome.storage.sync) {
                    const fallback = await chrome.storage.local.get(key);
                    return fallback[key] ?? null;
                }
                return null;
            }
        }
        try { return JSON.parse(localStorage.getItem(key)); }
        catch { return null; }
    },

    async set(key, value) {
        const backend = this._backend(key);
        if (backend) {
            try {
                await backend.set({ [key]: value });
            } catch (e) {
                if (e.message?.includes('QUOTA_BYTES') || e.message?.includes('quota')) {
                    await chrome.storage.local.set({ [key]: value });
                    Utils.showToast('💡 Αποθηκεύτηκε τοπικά', 'info');
                } else { throw e; }
            }
            return;
        }
        try { localStorage.setItem(key, JSON.stringify(value)); }
        catch (e) {
            if (e.name === 'QuotaExceededError')
                Utils.showToast('⚠️ Ο αποθηκευτικός χώρος είναι γεμάτος!', 'error');
            else throw e;
        }
    },

    async getSyncStatus() {
        if (!CONFIG.isExtension || !CONFIG.useSync) return 'local';
        try { await chrome.storage.sync.get(null); return 'sync'; }
        catch { return 'local'; }
    }
};

// ============================================
// UTILITIES
// ============================================
const Utils = {
    getDomain(url) {
        try { return new URL(url).hostname.replace(/^www\./, ''); }
        catch { return url; }
    },

    parseUrl(value) {
        if (!value || typeof value !== 'string') return null;
        const trimmed = value.trim();
        if (!trimmed) return null;
        try {
            const u = new URL(trimmed);
            if (u.protocol === 'http:' || u.protocol === 'https:') return u.href;
        } catch {}
        try {
            const u = new URL('https://' + trimmed);
            if (u.hostname.includes('.')) return u.href;
        } catch {}
        return null;
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

    async confirm(message) {
        if (CONFIG.isExtension) return ConfirmModal.show(message);
        return window.confirm(message);
    }
};

// ============================================
// CONFIRM MODAL
// ============================================
const ConfirmModal = {
    _resolve: null,

    show(message) {
        return new Promise((resolve) => {
            this._resolve = resolve;
            let overlay = document.getElementById('confirmOverlay');
            if (!overlay) { overlay = this._build(); document.body.appendChild(overlay); }
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
            </div>`;
        overlay.querySelector('#confirmOk').addEventListener('click', () => this._close(true));
        overlay.querySelector('#confirmCancel').addEventListener('click', () => this._close(false));
        overlay.addEventListener('click', (e) => { if (e.target === overlay) this._close(false); });
        return overlay;
    },

    _close(result) {
        document.getElementById('confirmOverlay')?.classList.remove('active');
        if (this._resolve) { this._resolve(result); this._resolve = null; }
    }
};

// ============================================
// STATE — Bookmarks CRUD
// ============================================
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
            Utils.showToast(`Όριο ${CONFIG.maxBookmarks} bookmarks!`, 'error'); return false;
        }
        if (this.bookmarks.some(b => b.url === bookmark.url)) {
            Utils.showToast('Υπάρχει ήδη!', 'error'); return false;
        }
        this.bookmarks.unshift(bookmark);
        await this.save(); this.render();
        Utils.showToast('Προστέθηκε! ✅');
        return true;
    },

    async remove(index) {
        if (index < 0 || index >= this.bookmarks.length) return;
        this.bookmarks.splice(index, 1);
        await this.save(); this.render();
        Utils.showToast('Διαγράφηκε! 🗑️');
    },

    async update(index, updated) {
        if (index < 0 || index >= this.bookmarks.length) return false;
        this.bookmarks[index] = { ...this.bookmarks[index], ...updated };
        await this.save(); this.render();
        Utils.showToast('Ενημερώθηκε! ✏️');
        return true;
    },

    async save() {
        try { await Storage.set(CONFIG.storageKey, this.bookmarks); }
        catch (e) { console.error('Failed to save:', e); Utils.showToast('Σφάλμα αποθήκευσης!', 'error'); }
    },

    render() {
        const grid    = document.getElementById('favoritesGrid');
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
                </div>`;
            grid.appendChild(empty);
        } else {
            this.bookmarks.forEach((b, i) => grid.appendChild(this._createCard(b, i, true)));
        }

        if (countEl) {
            const n = this.bookmarks.length;
            countEl.textContent = `${n} ${n === 1 ? 'item' : 'items'}`;
        }
        DragDrop.enableCards();
        CategoryFilter.applyToGrid();
    },

    renderDefaults() {
        const g = document.getElementById('trendingGrid');
        if (g) {
            g.innerHTML = '';
            DEFAULT_BOOKMARKS.trending.forEach(b => g.appendChild(this._createCard(b, null, false)));
        }
    },

    _createCard(bookmark, index, isEditable) {
        const domain   = Utils.getDomain(bookmark.url);
        const category = CATEGORIES[bookmark.category] || CATEGORIES.other;
        const favicon  = `https://www.google.com/s2/favicons?sz=64&domain=${encodeURIComponent(domain)}`;

        const card = document.createElement('div');
        card.className = `card cat-${bookmark.category}`;
        card.setAttribute('role', 'listitem');
        card.setAttribute('tabindex', '0');
        card.title = bookmark.name;

        const navigate = () => { Navigator.open(bookmark.url); RecentVisits.track(bookmark); };
        card.addEventListener('click', navigate);
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(); }
        });

        if (isEditable) {
            const actions = document.createElement('div');
            actions.className = 'card-actions';
            const editBtn = document.createElement('button');
            editBtn.className = 'card-action-btn';
            editBtn.textContent = '✏️'; editBtn.title = 'Επεξεργασία';
            editBtn.setAttribute('aria-label', `Επεξεργασία ${bookmark.name}`);
            editBtn.addEventListener('click', (e) => { e.stopPropagation(); this.edit(index); });
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'card-action-btn';
            deleteBtn.textContent = '🗑️'; deleteBtn.title = 'Διαγραφή';
            deleteBtn.setAttribute('aria-label', `Διαγραφή ${bookmark.name}`);
            deleteBtn.addEventListener('click', (e) => { e.stopPropagation(); this.remove(index); });
            actions.appendChild(editBtn);
            actions.appendChild(deleteBtn);
            card.appendChild(actions);
        }

        const img = document.createElement('img');
        img.className = 'card-icon'; img.src = favicon;
        img.alt = bookmark.name; img.width = 56; img.height = 56;
        img.addEventListener('error', () => { img.src = Utils.getFallbackIcon(category.icon); });
        card.appendChild(img);

        const title = document.createElement('h3');
        title.className = 'card-title';
        title.textContent = bookmark.name;
        card.appendChild(title);

        const urlEl = document.createElement('p');
        urlEl.className = 'card-url';
        urlEl.textContent = domain;
        card.appendChild(urlEl);

        return card;
    },

    edit(index) {
        const b = this.bookmarks[index];
        if (!b) return;
        document.getElementById('editIndex').value    = index;
        document.getElementById('editName').value     = b.name;
        document.getElementById('editUrl').value      = b.url;
        document.getElementById('editCategory').value = b.category;
        document.getElementById('editModal')?.classList.add('active');
        document.getElementById('editName')?.focus();
    }
};

// ============================================
// SMART INPUT
// ============================================
const SmartInput = {
    input: null, button: null, preview: null, status: null,

    init() {
        this.input   = document.getElementById('smartInput');
        this.button  = document.getElementById('addBtn');
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
        if (!value) { this.hidePreview(); this.button.disabled = true; this.status.textContent = ''; return; }
        this.button.disabled = false;
        const url = Utils.parseUrl(value);
        if (url) {
            this.status.textContent = '🔗 URL αναγνωρίστηκε';
            this.status.style.color = 'var(--accent-green)';
            this.updatePreview(url);
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
        document.getElementById('previewUrl').textContent  = domain;
        this.preview?.classList.add('visible');
    },

    hidePreview() { this.preview?.classList.remove('visible'); },

    async handleSubmit() {
        const value = this.input.value.trim();
        if (!value) return;
        const url = Utils.parseUrl(value);
        if (url) {
            const category = document.getElementById('customCategory')?.value || 'other';
            const success  = await State.add({ name: this._extractName(Utils.getDomain(url)), url, category });
            if (success) { this.input.value = ''; this.hidePreview(); this.button.disabled = true; this.status.textContent = ''; }
        } else {
            Navigator.open(`https://www.google.com/search?q=${encodeURIComponent(value)}`);
            this.input.value = ''; this.status.textContent = '';
        }
    },

    _extractName(domain) {
        const n = domain.split('.')[0];
        return n.charAt(0).toUpperCase() + n.slice(1);
    }
};

// ============================================
// AI PATTERNS
// ============================================
const AI_PATTERNS = [
    { pattern: /^(yt|youtube)\s+(.+)$/i,      url: q => `https://www.youtube.com/results?search_query=${encodeURIComponent(q[2])}`, label: '▶️ YouTube' },
    { pattern: /^(maps?|χάρτης?)\s+(.+)$/i,   url: q => `https://www.google.com/maps/search/${encodeURIComponent(q[2])}`,          label: '🗺️ Maps' },
    { pattern: /^(weather|καιρός?)\s*(.*)$/i,  url: q => `https://www.google.com/search?q=weather+${encodeURIComponent(q[2]||'')}`, label: '🌤️ Weather' },
    { pattern: /^(wiki|wikipedia)\s+(.+)$/i,   url: q => `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(q[2])}`, label: '📖 Wikipedia' },
    { pattern: /^(reddit|r\/)\s*(.+)$/i,       url: q => `https://www.reddit.com/search/?q=${encodeURIComponent(q[2])}`,            label: '👽 Reddit' },
    { pattern: /^(gh|github)\s+(.+)$/i,        url: q => `https://github.com/search?q=${encodeURIComponent(q[2])}`,                 label: '🐙 GitHub' },
    { pattern: /^(translate|μετάφρ[α-ω]+)\s+(.+)$/i, url: q => `https://translate.google.com/?text=${encodeURIComponent(q[2])}`,  label: '🌐 Translate' },
    { pattern: /^(news|ειδήσεις?)\s*(greece|ελλ[α-ω]+)?$/i, url: () => `https://news.google.com/search?q=Ελλάδα&hl=el`,          label: '📰 News GR' },
    { pattern: /^(amazon|amz)\s+(.+)$/i,       url: q => `https://www.amazon.com/s?k=${encodeURIComponent(q[2])}`,                  label: '🛒 Amazon' },
    { pattern: /^(skroutz)\s+(.+)$/i,          url: q => `https://www.skroutz.gr/search?keyphrase=${encodeURIComponent(q[2])}`,     label: '🛒 Skroutz' },
    { pattern: /^(gmail|mail|email)$/i,         url: () => `https://mail.google.com`,                                               label: '📧 Gmail' },
    { pattern: /^[\d\s\+\-\*\/\(\)\.]+[=?]?\s*$/, url: q => `https://www.google.com/search?q=${encodeURIComponent(q[0])}`,        label: '🔢 Calculator' },
];

// ============================================
// SEARCH
// ============================================
const Search = {
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
                Navigator.open(this._resolveUrl(term));
                input.value = '';
                this._clearHint();
                this.filter('');
            }
            if (e.key === 'Escape') { input.value = ''; this._clearHint(); this.filter(''); }
        });
    },

    _resolveUrl(term) {
        for (const p of AI_PATTERNS) {
            const m = term.match(p.pattern);
            if (m) return p.url(m);
        }
        return `https://www.google.com/search?q=${encodeURIComponent(term)}`;
    },

    _updateHint(_term) { /* ai-hints element removed from UI */ },
    _clearHint()       { /* ai-hints element removed from UI */ },

    _normalize(str) {
        return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    },

    _fuzzy(needle, haystack) {
        if (!needle) return true;
        const n = this._normalize(needle), h = this._normalize(haystack);
        let ni = 0;
        for (let hi = 0; hi < h.length && ni < n.length; hi++) { if (h[hi] === n[ni]) ni++; }
        return ni === n.length;
    },

    filter(term) {
        ['favoritesGrid', 'trendingGrid', 'countryGrid'].forEach(id => {
            const grid = document.getElementById(id);
            if (!grid) return;
            grid.querySelectorAll('.card').forEach(card => {
                const title   = card.querySelector('.card-title')?.textContent || '';
                const url     = card.querySelector('.card-url')?.textContent   || '';
                const matches = !term.trim() || this._fuzzy(term, title) || this._fuzzy(term, url);
                card.style.display = matches ? '' : 'none';
            });
        });
        CategoryFilter.applyToGrid();
    }
};

// ============================================
// MODALS
// ============================================
const Modals = {
    init() {
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) overlay.classList.remove('active');
            });
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape')
                document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
        });
        document.getElementById('editForm')?.addEventListener('submit', (e) => this.saveEdit(e));
        document.getElementById('cancelEditBtn')?.addEventListener('click', () => this.hideEdit());
    },

    hideEdit() { document.getElementById('editModal')?.classList.remove('active'); },

    async saveEdit(e) {
        e.preventDefault();
        const index    = parseInt(document.getElementById('editIndex').value, 10);
        const name     = document.getElementById('editName').value.trim();
        const url      = document.getElementById('editUrl').value.trim();
        const category = document.getElementById('editCategory').value;
        if (!name || !url) { Utils.showToast('Συμπλήρωσε όλα τα πεδία!', 'error'); return; }
        const parsed = Utils.parseUrl(url);
        if (!parsed) { Utils.showToast('Μη έγκυρο URL!', 'error'); return; }
        const ok = await State.update(index, { name, url: parsed, category });
        if (ok) this.hideEdit();
    }
};

// ============================================
// KEYBOARD SHORTCUTS
// ============================================
const Shortcuts = {
    init() {
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault(); document.getElementById('searchInput')?.focus();
            }
            if (e.altKey && e.key === 'a') {
                e.preventDefault(); document.getElementById('smartInput')?.focus();
            }
            if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '9') {
                e.preventDefault();
                const b = State.bookmarks[parseInt(e.key, 10) - 1];
                if (b) Navigator.open(b.url);
            }
        });
    }
};

// ============================================
// DATA MANAGER — Export / Import
// ============================================
const DataManager = {
    export() {
        const data = {
            bookmarks:  State.bookmarks,
            dock:       QuickDock.items,
            exportedAt: new Date().toISOString(),
            version:    CONFIG.version
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href = url;
        a.download = `portify-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a); a.click();
        document.body.removeChild(a); URL.revokeObjectURL(url);
        Utils.showToast('✅ Εξαγωγή επιτυχής!');
    },

    import() {
        const input = document.createElement('input');
        input.type = 'file'; input.accept = '.json,application/json';
        input.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            if (file.size > CONFIG.maxFileSize) { Utils.showToast('Αρχείο πολύ μεγάλο (max 1MB)', 'error'); return; }
            const reader = new FileReader();
            reader.addEventListener('load', async (ev) => {
                try {
                    const data = JSON.parse(ev.target.result);
                    if (data.dock && Array.isArray(data.dock)) {
                        QuickDock.items = data.dock;
                        await Storage.set(CONFIG.dockKey, QuickDock.items);
                        QuickDock.render();
                    }
                    if (data.bookmarks && Array.isArray(data.bookmarks)) {
                        const valid = data.bookmarks.filter(b =>
                            b && typeof b.name === 'string' && typeof b.url === 'string' &&
                            typeof b.category === 'string' && Utils.parseUrl(b.url) !== null);
                        if (valid.length > 0) {
                            if (State.bookmarks.length > 0) {
                                const ok = await Utils.confirm(`Βρέθηκαν ${valid.length} bookmarks. Να αντικαταστήσω τα υπάρχοντα;`);
                                if (!ok) return;
                            }
                            State.bookmarks = valid.slice(0, CONFIG.maxBookmarks);
                            await State.save(); State.render();
                        }
                    }
                    Utils.showToast('✅ Εισαγωγή επιτυχής!');
                } catch (err) {
                    console.error('Import error:', err);
                    Utils.showToast('❌ Άκυρο αρχείο!', 'error');
                }
            });
            reader.addEventListener('error', () => Utils.showToast('❌ Σφάλμα ανάγνωσης!', 'error'));
            reader.readAsText(file);
        });
        input.click();
    }
};

// ============================================
// CATEGORY FILTER
// ============================================
const CategoryFilter = {
    active: 'all',

    init() {
        const bar = document.getElementById('categoryFilterBar');
        if (!bar) return;
        const filters = [
            { id: 'all', icon: '⭐', label: 'Όλα' },
            ...Object.entries(CATEGORIES).map(([id, cat]) => ({ id, icon: cat.icon, label: cat.label }))
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
        document.querySelectorAll('.cat-filter-btn').forEach(btn =>
            btn.classList.toggle('active', btn.dataset.cat === id));
        this.applyToGrid();
    },

    applyToGrid() {
        const grid = document.getElementById('favoritesGrid');
        if (!grid) return;
        grid.querySelectorAll('.card').forEach(card => {
            if (this.active === 'all') { card.style.display = ''; return; }
            card.style.display = card.classList.contains(`cat-${this.active}`) ? '' : 'none';
        });
    }
};

// ============================================
// DRAG & DROP (bookmarks grid)
// ============================================
const DragDrop = {
    dragIndex: null, dragEl: null,

    init() {
        const grid = document.getElementById('favoritesGrid');
        if (!grid) return;
        grid.addEventListener('dragstart', (e) => this._onDragStart(e));
        grid.addEventListener('dragover',  (e) => this._onDragOver(e));
        grid.addEventListener('drop',      (e) => this._onDrop(e));
        grid.addEventListener('dragend',   (e) => this._onDragEnd(e));
        grid.addEventListener('touchstart', (e) => this._onTouchStart(e), { passive: true });
        grid.addEventListener('touchmove',  (e) => this._onTouchMove(e),  { passive: false });
        grid.addEventListener('touchend',   (e) => this._onTouchEnd(e));
    },

    enableCards() {
        document.getElementById('favoritesGrid')
            ?.querySelectorAll('.card')
            .forEach((card, i) => { card.setAttribute('draggable', 'true'); card.dataset.index = i; });
    },

    _getCard(el) { return el.closest('.card[draggable]'); },

    _onDragStart(e) {
        const card = this._getCard(e.target);
        if (!card) return;
        this.dragIndex = parseInt(card.dataset.index, 10);
        this.dragEl = card; card.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
    },

    _onDragOver(e) {
        e.preventDefault(); e.dataTransfer.dropEffect = 'move';
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
        await State.save(); State.render();
        Utils.showToast('Αναδιάταξη! 🔀');
    },

    _onDragEnd() {
        document.querySelectorAll('.card.dragging, .card.drag-over')
            .forEach(c => c.classList.remove('dragging', 'drag-over'));
        this.dragEl = null; this.dragIndex = null;
    },

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
            await State.save(); State.render();
            Utils.showToast('Αναδιάταξη! 🔀');
        }
        this._touch.clone?.remove();
        document.querySelectorAll('.card.dragging, .card.drag-over')
            .forEach(c => c.classList.remove('dragging', 'drag-over'));
        this._touch = { startX: 0, startY: 0, el: null, clone: null, fromIndex: null };
    }
};

// ============================================
// NAVIGATOR
// ============================================
const Navigator = {
    open(url) { window.open(url, '_blank', 'noopener,noreferrer'); }
};

// ============================================
// RECENT VISITS
// ============================================
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
        const now = Date.now();
        const existing = this.visits.find(v => v.url === bookmark.url);
        if (existing) {
            existing.freq  = (existing.freq || 1) + 1;
            existing.ts    = now;
            existing.score = this._score(existing.freq, now);
        } else {
            this.visits.push({ name: bookmark.name, url: bookmark.url, category: bookmark.category,
                               freq: 1, ts: now, score: this._score(1, now) });
        }
        this.visits.sort((a, b) => b.score - a.score);
        this.visits = this.visits.slice(0, CONFIG.maxRecent);
        try { await Storage.set(CONFIG.recentKey, this.visits); } catch {}
        this.render();
    },

    _score(freq, ts) {
        const freqWeight = Math.min(freq / 50, 1);
        const recWeight  = Math.max(0, 1 - (Date.now() - ts) / (7 * 24 * 60 * 60 * 1000));
        return freqWeight * 0.6 + recWeight * 0.4;
    },

    render() {
        const grid    = document.getElementById('recentGrid');
        const section = document.getElementById('recentSection');
        if (!grid || !section) return;
        if (this.visits.length === 0) { section.style.display = 'none'; return; }
        section.style.display = '';
        grid.innerHTML = '';
        this.visits.forEach(v => {
            const card = State._createCard(v, null, false);
            if (v.freq > 1) {
                const badge = document.createElement('div');
                badge.className = 'freq-badge';
                badge.textContent = v.freq > 99 ? '99+' : v.freq;
                badge.title = `Επισκέφτηκες ${v.freq} φορές`;
                card.appendChild(badge);
            }
            grid.appendChild(card);
        });
    }
};

// ============================================
// COUNTRY TABS
// ============================================
const CountryTabs = {
    activeId: 'gr',

    init() {
        const tabBar = document.getElementById('countryTabBar');
        const grid   = document.getElementById('countryGrid');
        if (!tabBar || !grid) return;

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
        document.querySelectorAll('.country-tab').forEach(btn => {
            const active = btn.dataset.country === id;
            btn.classList.toggle('active', active);
            btn.setAttribute('aria-selected', active ? 'true' : 'false');
        });
        const grid = document.getElementById('countryGrid');
        if (grid) {
            grid.style.opacity = '0';
            setTimeout(() => { this.renderGrid(id); grid.style.opacity = '1'; }, 150);
        }
    },

    renderGrid(id) {
        const country = COUNTRY_TABS.find(c => c.id === id);
        const grid    = document.getElementById('countryGrid');
        if (!country || !grid) return;
        grid.innerHTML = '';
        country.sites.forEach(site => grid.appendChild(State._createCard(site, null, false)));
        const term = document.getElementById('searchInput')?.value?.trim();
        if (term) Search.filter(term);
    }
};

// ============================================
// SUGGESTIONS (search bar)
// ============================================
function initSuggestions() {
    const input          = document.getElementById('searchInput');
    const suggestionsBox = document.getElementById('suggestions');
    if (!input || !suggestionsBox) return;

    let currentIndex = -1;

    const commands = [
        { key: 'youtube',  label: 'YouTube search', action: q => `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}` },
        { key: 'maps',     label: 'Google Maps',    action: q => `https://www.google.com/maps/search/${encodeURIComponent(q)}` },
        { key: 'wiki',     label: 'Wikipedia',      action: q => `https://en.wikipedia.org/wiki/${encodeURIComponent(q)}` },
        { key: 'weather',  label: 'Weather',        action: q => `https://www.google.com/search?q=weather+${encodeURIComponent(q)}` }
    ];

    input.addEventListener('input', () => {
        const value = input.value.toLowerCase().trim();
        currentIndex = -1;
        if (!value) { suggestionsBox.style.display = 'none'; return; }
        const matches = commands.filter(c => value.includes(c.key));
        if (matches.length === 0) { suggestionsBox.style.display = 'none'; return; }
        suggestionsBox.innerHTML = matches.map((c, i) =>
            `<div class="suggestion-item" data-index="${i}" data-key="${c.key}">🔎 ${c.label}</div>`
        ).join('');
        suggestionsBox.style.display = 'block';
    });

    input.addEventListener('keydown', (e) => {
        const items = suggestionsBox.querySelectorAll('.suggestion-item');
        if (!items.length) return;
        if (e.key === 'ArrowDown') { currentIndex = (currentIndex + 1) % items.length; updateActive(items); e.preventDefault(); }
        if (e.key === 'ArrowUp')   { currentIndex = (currentIndex - 1 + items.length) % items.length; updateActive(items); e.preventDefault(); }
        if (e.key === 'Enter' && currentIndex >= 0) { runCommand(items[currentIndex].dataset.key); e.preventDefault(); }
    });

    function updateActive(items) {
        items.forEach(el => el.classList.remove('active'));
        if (currentIndex >= 0) items[currentIndex].classList.add('active');
    }

    suggestionsBox.addEventListener('click', (e) => {
        const item = e.target.closest('.suggestion-item');
        if (item) runCommand(item.dataset.key);
    });

    function runCommand(key) {
        const value   = input.value;
        const command = commands.find(c => c.key === key);
        if (!command) return;
        const query = value.replace(new RegExp(key, 'i'), '').trim();
        window.open(command.action(query), '_blank');
        suggestionsBox.style.display = 'none';
    }
}

// ============================================
// INIT
// ============================================
document.addEventListener('DOMContentLoaded', async () => {
    await State.init();
    await RecentVisits.init();
    await QuickDock.init();
    SmartInput.init();
    Search.init();
    Modals.init();
    Shortcuts.init();
    CategoryFilter.init();
    DragDrop.init();
    CountryTabs.init();
    initSuggestions();

    document.getElementById('exportBtn')?.addEventListener('click', () => DataManager.export());
    document.getElementById('importBtn')?.addEventListener('click', () => DataManager.import());

    const syncStatus = await Storage.getSyncStatus();
    const footer = document.querySelector('.footer p');
    if (footer && CONFIG.isExtension) {
        const badge = document.createElement('span');
        badge.style.cssText = 'margin-left:8px;font-size:0.8rem;opacity:0.5;';
        badge.textContent = syncStatus === 'sync' ? '☁️ Sync on' : '💾 Local';
        footer.appendChild(badge);
    }

    console.log(`🚀 Portify v${CONFIG.version} [${CONFIG.isExtension ? 'Extension' : 'Web'}] [Storage: ${syncStatus ?? 'localStorage'}]`);

}, { once: true });
