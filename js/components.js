class BlogHeader extends HTMLElement {
  constructor() {
    super();

    // bound handlers for add/remove
    this._onDocumentClick = this._onDocumentClick.bind(this);
    this._onWindowResize = this._onWindowResize.bind(this);
    this._onMobileToggleClick = this._onMobileToggleClick.bind(this);
    this._onNavLinkClick = this._onNavLinkClick.bind(this);
    this._onNavDelegatedClick = this._onNavDelegatedClick.bind(this);
  }

  connectedCallback() {
    this.render();
    this.cacheElements();
    
    this.initActiveMenu();
    this.initMobileMenu();
    this.initDropdown(); // uses delegated listener
    window.addEventListener('resize', this._onWindowResize);
  }

  disconnectedCallback() {
    // remove global listeners
    document.removeEventListener('click', this._onDocumentClick);
    window.removeEventListener('resize', this._onWindowResize);

    // remove component-scoped listeners
    if (this._mobileNavToggleBtn) {
      this._mobileNavToggleBtn.removeEventListener('click', this._onMobileToggleClick);
    }

    if (this._navLinks && this._navLinks.length) {
      this._navLinks.forEach(link => link.removeEventListener('click', this._onNavLinkClick));
    }

    if (this._navEl) {
      this._navEl.removeEventListener('click', this._onNavDelegatedClick);
    }
  }

  /* -------------------------
     Rendering / Caching
     ------------------------- */

  render() {
    this.innerHTML = `
      <header class="header">
        <div class="header-container">
          <a href="index.html" class="logo">
          <img src="assets/img/favicon.png" alt="logo">
          </a>
          <nav id="navmenu" class="navmenu">
            <ul>
              <li><a href="home.html">Home</a></li>
              <li><a href="pair-info.html">Pair Info</a></li>
              <li class="dropdown">
                <a href="gallery.html"><span>Gallery</span><i class="fa-solid fa-chevron-down toggle-dropdown"></i></a>
                <ul>
                  <li><a href="gallery.html">Main</a></li>
                  <li><a href="gallery.html">AU&IF</a></li>
                  <li><a href="gallery.html">TRPG</a></li>
                  <li><a href="gallery.html">Other</a></li>
                </ul>
              </li>
              <li><a href="archive.html">Library</a></li>
              <li><a href="portal.html">Portal</a></li>
            </ul>
          </nav>
          <div class="header-social-links">
            <a href="support.html"><i class="fa-solid fa-circle-question"></i></a>
            <a href="mypage.html"><i class="fa-solid fa-user-gear"></i></a>
          </div>
          <button class="mobile-nav-toggle" aria-label="Toggle navigation">
            <i class="fa-solid fa-bars"></i>
          </button>
        </div>
      </header>
    `;
  }

  cacheElements() {
    // Cache frequently used elements scoped to this component
    this._headerEl = this.querySelector('.header');
    this._navEl = this.querySelector('#navmenu');
    this._navLinks = Array.from(this.querySelectorAll('#navmenu a'));
    this._mobileNavToggleBtn = this.querySelector('.mobile-nav-toggle');
    this._mobileNavIcon = this._mobileNavToggleBtn?.querySelector('i') || null;
    // dropdown toggles are handled via delegation; no per-toggle caching needed
  }

  /* -------------------------
     Active menu logic
     ------------------------- */

  initActiveMenu() {
    const currentPathRaw = window.location.pathname || '/';
    const currentPath = this._normalizePath(currentPathRaw); // 'home', 'index', 'folder/page', etc.

    // clear existing active classes within this header
    this._navLinks.forEach(l => l.classList.remove('active'));

    for (const link of this._navLinks) {
      // Use browser-resolved URL to handle relative/absolute hrefs
      let linkPathname = link.getAttribute('href') || '';
      try {
        linkPathname = new URL(link.href, window.location.origin).pathname;
      } catch (e) {
        // keep attribute fallback
      }

      const linkPath = this._normalizePath(linkPathname);

      const isMatch =
        linkPath === currentPath ||
        (currentPath === 'index' && linkPath === 'home');

      if (isMatch) {
        link.classList.add('active');
        break;
      }
    }
  }

  _normalizePath(pathname) {
    if (!pathname) return 'index';
    // strip query/hash
    pathname = pathname.split('?')[0].split('#')[0];

    // remove leading/trailing slashes
    pathname = pathname.replace(/^\/+|\/+$/g, '');

    // remove file extension like .html
    pathname = pathname.replace(/\.[a-z0-9]+$/i, '');

    // empty -> index
    if (pathname === '') return 'index';

    return pathname;
  }

  /* -------------------------
     Mobile menu logic
     ------------------------- */

  initMobileMenu() {
    if (this._mobileNavToggleBtn) {
      this._mobileNavToggleBtn.addEventListener('click', this._onMobileToggleClick);
    }

    if (this._navLinks && this._navLinks.length) {
      this._navLinks.forEach(link => link.addEventListener('click', this._onNavLinkClick));
    }

    // document click to detect outside clicks
    document.addEventListener('click', this._onDocumentClick);
  }

  _onMobileToggleClick(e) {
    e.stopPropagation();
    if (!this._headerEl) return;

    const isActive = this._headerEl.classList.toggle('mobile-nav-active');
    this._setMobileIcon(isActive);
  }

  _onNavLinkClick() {
    if (!this._headerEl) return;
    if (this._headerEl.classList.contains('mobile-nav-active')) {
      this._headerEl.classList.remove('mobile-nav-active');
      this._setMobileIcon(false);
    }
  }

  _onDocumentClick(e) {
    if (!this._headerEl) return;
    if (this._headerEl.classList.contains('mobile-nav-active') && !this.contains(e.target)) {
      this._headerEl.classList.remove('mobile-nav-active');
      this._setMobileIcon(false);
    }
  }

  _setMobileIcon(isOpen) {
    if (!this._mobileNavIcon) return;
    // ensure consistent classes: either fa-bars or fa-xmark
    if (isOpen) {
      this._mobileNavIcon.classList.remove('fa-bars');
      this._mobileNavIcon.classList.add('fa-xmark');
    } else {
      this._mobileNavIcon.classList.remove('fa-xmark');
      this._mobileNavIcon.classList.add('fa-bars');
    }
  }

  _onWindowResize() {
    if (!this._headerEl) return;

    // close mobile nav when switching to desktop
    if (window.innerWidth > 1023 && this._headerEl.classList.contains('mobile-nav-active')) {
      this._headerEl.classList.remove('mobile-nav-active');
      this._setMobileIcon(false);
    }

    // remove mobile-only dropdown classes on desktop
    if (window.innerWidth > 1023) {
      const dropdownItems = Array.from(this.querySelectorAll('.dropdown'));
      dropdownItems.forEach(li => {
        li.classList.remove('active');
        const submenu = li.querySelector('ul');
        if (submenu) submenu.classList.remove('dropdown-active');
      });
    }
  }

  /* -------------------------
     Dropdown logic (delegated)
     ------------------------- */

  initDropdown() {
    // Use event delegation on nav element to avoid per-toggle listeners
    if (!this._navEl) return;
    this._navEl.addEventListener('click', this._onNavDelegatedClick);
  }

  _onNavDelegatedClick(e) {
    const toggle = e.target.closest('.toggle-dropdown');
    if (!toggle || !this._navEl.contains(toggle)) return;

    // Only toggle on mobile widths
    if (window.innerWidth <= 1023) {
      e.preventDefault();
      e.stopImmediatePropagation();

      const dropdownLi = toggle.closest('.dropdown');
      if (!dropdownLi) return;

      const submenu = dropdownLi.querySelector('ul');
      dropdownLi.classList.toggle('active');
      if (submenu) submenu.classList.toggle('dropdown-active');
    }
  }
}

/* Footer component (kept simple and unchanged structure) */
class BlogFooter extends HTMLElement {
  connectedCallback() {
    this.render();
  }

  render() {
    this.innerHTML = `
      <footer class="footer">
        <div class="container">
          <div class="credits">
            <p><span>Dear my beloved,</span></p>
            <p>© <span>2026</span> <b>Blog</b> <span>All Rights Reserved</span></p>
          </div>
          <div class="header-social-links">
            <a href="#" target="_blank" rel="noopener noreferrer"><i class="fab fa-instagram"></i></a>
            <a href="https://x.com" target="_blank" rel="noopener noreferrer"><i class="fab fa-x-twitter"></i></a>
            <a href="https://github.com/justthatonegirl0526-eng/Indie-blog" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-github"></i></a>
            <a href="https://dash.cloudflare.com" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-cloudflare"></i></a>
          </div>
        </div>
      </footer>
    `;
  }
}

/* Register custom elements */
customElements.define('blog-header', BlogHeader);
customElements.define('blog-footer', BlogFooter);
