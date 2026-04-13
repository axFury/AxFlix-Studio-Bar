/* ============================================================
   AxFlix Studios - Studio Showcase Row
   Jellyfin Plugin - Client-side JavaScript
   Compatible Jellyfin 10.11.x (React SPA)
   ============================================================ */

(function () {
    'use strict';

    const AXFLIX_VERSION = '1.0.0';
    const HOVER_DELAY = 400;
    let isInitialized = false;

    // ── Utility ─────────────────────────────────────────────

    function sEndsWith(str, suffix) {
        if (!str || !suffix) return false;
        return str.toLowerCase().indexOf(suffix.toLowerCase(), str.length - suffix.length) !== -1;
    }

    // ── CSS Injection ───────────────────────────────────────

    function injectStyles() {
        if (document.getElementById('axflix-studios.css&v=3')) return;
        const link = document.createElement('link');
        link.id = 'axflix-studios.css&v=3';
        link.rel = 'stylesheet';
        link.href = '/web/configurationpage?name=axflix-studios.css&v=3';
        document.head.appendChild(link);
    }

    // ── Auth helpers ────────────────────────────────────────

    function getToken() {
        // Try window.ApiClient first (Jellyfin 10.11.x)
        try {
            if (window.ApiClient && window.ApiClient._serverInfo && window.ApiClient._serverInfo.AccessToken) {
                return window.ApiClient._serverInfo.AccessToken;
            }
            if (window.ApiClient && typeof window.ApiClient.accessToken === 'function') {
                return window.ApiClient.accessToken();
            }
        } catch (e) {}

        // Fallback: read from credentials in localStorage
        try {
            const creds = JSON.parse(localStorage.getItem('jellyfin_credentials') || '{}');
            const servers = creds.Servers || [];
            if (servers.length > 0 && servers[0].AccessToken) {
                return servers[0].AccessToken;
            }
        } catch (e) {}

        // Fallback: scan all localStorage keys
        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.includes('token')) {
                    const val = localStorage.getItem(key);
                    if (val && val.length > 10 && !val.startsWith('{') && !val.startsWith('[')) {
                        return val;
                    }
                }
            }
        } catch (e) {}

        return '';
    }

    function getServerId() {
        try {
            if (window.ApiClient && window.ApiClient._serverInfo) {
                return window.ApiClient._serverInfo.Id || '';
            }
            const creds = JSON.parse(localStorage.getItem('jellyfin_credentials') || '{}');
            return (creds.Servers || [])[0]?.Id || '';
        } catch (e) {
            return '';
        }
    }

    function getUserId() {
        try {
            if (window.ApiClient && typeof window.ApiClient.getCurrentUserId === 'function') {
                return window.ApiClient.getCurrentUserId();
            }
            if (window.ApiClient && window.ApiClient._serverInfo && window.ApiClient._serverInfo.UserId) {
                return window.ApiClient._serverInfo.UserId;
            }
            var creds = JSON.parse(localStorage.getItem('jellyfin_credentials') || '{}');
            var servers = creds.Servers || [];
            if (servers.length > 0 && servers[0].UserId) {
                return servers[0].UserId;
            }
        } catch (e) {}
        return '';
    }

    function getHeaders() {
        const token = getToken();
        if (!token) return {};
        return {
            'Authorization': 'MediaBrowser Token="' + token + '"',
        };
    }

    // ── API Calls ───────────────────────────────────────────

    async function fetchStudios() {
        try {
            var token = getToken();
            var userId = getUserId();
            if (!token) {
                console.warn('[AxFlix] No auth token available');
                return [];
            }
            
            var url = '/Studios?Recursive=true&SortBy=SortName&SortOrder=Ascending';
            if (userId) {
                url += '&UserId=' + userId;
            }
            
            var resp = await fetch(url, {
                headers: getHeaders()
            });
            if (!resp.ok) {
                console.warn('[AxFlix] Studios API returned', resp.status);
                return [];
            }
            var data = await resp.json();
            return (data.Items || []).filter(function(s) { return s.Id; });
        } catch (e) {
            console.warn('[AxFlix] Error fetching studios:', e);
            return [];
        }
    }

    async function fetchPluginConfig() {
        try {
            const resp = await fetch('/axflix/config');
            if (!resp.ok) return { Enabled: true, MaxStudios: 30, IntrosFolderExists: false };
            return await resp.json();
        } catch (e) {
            return { Enabled: true, MaxStudios: 30, IntrosFolderExists: false };
        }
    }

    async function fetchAvailableIntros() {
        try {
            const resp = await fetch('/axflix/intros');
            if (!resp.ok) return [];
            return await resp.json();
        } catch (e) {
            return [];
        }
    }

    // ── Build Studio Row ────────────────────────────────────

    function buildStudioRow(studios, intros, config) {
        var maxStudios = config.MaxStudios || 30;
        var displayStudios = [];
        if (config.SelectedStudioNames && config.SelectedStudioNames.trim() !== '') {
            var selectedNames = config.SelectedStudioNames.toLowerCase().split(',').map(function(n) { return n.trim(); }).filter(function(n) { return n.length > 0; });
            
            var groups = {};
            studios.forEach(function(s) { 
                var name = (s.Name || '').toLowerCase();
                var matchedKeyword = selectedNames.find(function(sel) { return name.indexOf(sel) !== -1; });
                
                if (matchedKeyword) {
                    if (!groups[matchedKeyword]) {
                        groups[matchedKeyword] = s;
                        groups[matchedKeyword]._displayName = matchedKeyword.replace(/\b\w/g, function(l){ return l.toUpperCase(); });
                    } else {
                        // Prefer a studio that has a primary image or shorter name
                        var current = groups[matchedKeyword];
                        if (!current.ImageTags || !current.ImageTags.Primary) {
                            if (s.ImageTags && s.ImageTags.Primary) {
                                s._displayName = groups[matchedKeyword]._displayName;
                                groups[matchedKeyword] = s;
                            }
                        }
                    }
                }
            });
            
            // Convert to array in the order of selectedNames
            displayStudios = selectedNames.map(function(name) { return groups[name]; }).filter(function(s) { return !!s; });
        } else {
            displayStudios = studios;
        }
        
        displayStudios = displayStudios.slice(0, maxStudios);

        // Map intros by lowercase studio name. Allow array to store images AND video.
        var introMap = {};
        intros.forEach(function(intro) {
            var n = (intro.StudioName || '').toLowerCase();
            if (!introMap[n]) introMap[n] = [];
            introMap[n].push(intro);
        });

        var container = document.createElement('div');
        container.id = 'axflix-studio-showcase';
        container.className = 'axflix-studio-showcase';

        // Header
        var header = document.createElement('div');
        header.className = 'axflix-header';
        header.innerHTML = '<h2 class="axflix-title"><span class="axflix-title-icon">\uD83C\uDFAC</span> Studios</h2>';
        container.appendChild(header);

        // Scroll wrapper
        var scrollWrapper = document.createElement('div');
        scrollWrapper.className = 'axflix-scroll-wrapper';

        // Left arrow
        var leftArrow = document.createElement('button');
        leftArrow.className = 'axflix-arrow axflix-arrow-left';
        leftArrow.innerHTML = '\u2039';
        leftArrow.setAttribute('aria-label', 'Scroll left');
        scrollWrapper.appendChild(leftArrow);

        // Scroll track
        var scrollTrack = document.createElement('div');
        scrollTrack.className = 'axflix-scroll-track';

        displayStudios.forEach(function(studio) {
            var card = createStudioCard(studio, introMap);
            scrollTrack.appendChild(card);
        });

        scrollWrapper.appendChild(scrollTrack);

        // Right arrow
        var rightArrow = document.createElement('button');
        rightArrow.className = 'axflix-arrow axflix-arrow-right';
        rightArrow.innerHTML = '\u203A';
        rightArrow.setAttribute('aria-label', 'Scroll right');
        scrollWrapper.appendChild(rightArrow);

        // Arrow click handlers
        leftArrow.addEventListener('click', function() {
            scrollTrack.scrollBy({ left: -400, behavior: 'smooth' });
        });
        rightArrow.addEventListener('click', function() {
            scrollTrack.scrollBy({ left: 400, behavior: 'smooth' });
        });

        // Arrow visibility
        function updateArrows() {
            var sl = scrollTrack.scrollLeft;
            var max = scrollTrack.scrollWidth - scrollTrack.clientWidth;
            leftArrow.classList.toggle('axflix-arrow-hidden', sl <= 10);
            rightArrow.classList.toggle('axflix-arrow-hidden', sl >= max - 10);
        }
        scrollTrack.addEventListener('scroll', updateArrows);
        setTimeout(updateArrows, 200);

        container.appendChild(scrollWrapper);
        return container;
    }

    function createStudioCard(studio, introMap) {
        var card = document.createElement('div');
        card.className = 'axflix-studio-card';

        // Image container
        var imgContainer = document.createElement('div');
        imgContainer.className = 'axflix-studio-img-container';

        var lowerName = (studio.Name || '').toLowerCase();
        var introFiles = introMap[studio._displayName ? studio._displayName.toLowerCase() : lowerName] || [];
        
        var customImage = introFiles.find(function(f) { return sEndsWith(f.Url, '.png') || sEndsWith(f.Url, '.jpg') || sEndsWith(f.Url, '.svg') || sEndsWith(f.Url, '.webp'); });
        var introVideo = introFiles.find(function(f) { return sEndsWith(f.Url, '.mp4') || sEndsWith(f.Url, '.webm') || sEndsWith(f.Url, '.mkv'); });

        var img = document.createElement('img');
        
        // Try Jellyfin Primary image first, but append a token to ensure it doesn't fail due to auth if required
        var imgUrl = '/Items/' + studio.Id + '/Images/Primary?quality=90&maxHeight=200';
        var token = getToken();
        if (token) imgUrl += '&api_key=' + token; // api_key helps bypass some strict cookie policies
        
        img.src = imgUrl;

        img.alt = studio.Name;
        img.className = 'axflix-studio-logo';
        img.loading = 'lazy';
        img.onerror = function() {
            var fallbackImg = null;
            if (customImage) {
                fallbackImg = customImage.Url;
            } else if (introFiles.length === 0 && introMap[lowerName]) {
                // Check if they named it exactly like the ID or some generic fallback logic
                var extFiles = introMap[lowerName];
                var fImg = extFiles.find(function(f) { return sEndsWith(f.Url, '.png') || sEndsWith(f.Url, '.svg'); });
                if (fImg) fallbackImg = fImg.Url;
            }
            
            if (fallbackImg) {
                this.src = fallbackImg;
                this.onerror = function() {
                    this.style.display = 'none';
                    var fallback = document.createElement('div');
                    fallback.className = 'axflix-studio-fallback';
                    fallback.textContent = (studio._displayName || studio.Name || '??').substring(0, 2).toUpperCase();
                    imgContainer.appendChild(fallback);
                };
            } else {
                this.style.display = 'none';
                var fallback = document.createElement('div');
                fallback.className = 'axflix-studio-fallback';
                fallback.textContent = (studio._displayName || studio.Name || '??').substring(0, 2).toUpperCase();
                imgContainer.appendChild(fallback);
            }
        };
        imgContainer.appendChild(img);

        // Video overlay (if intro exists)
        if (introVideo) {
            var videoOverlay = document.createElement('div');
            videoOverlay.className = 'axflix-video-overlay';

            var video = document.createElement('video');
            video.className = 'axflix-intro-video';
            video.muted = true;
            video.loop = true;
            video.playsInline = true;
            video.preload = 'none';
            video.src = introVideo.Url;

            videoOverlay.appendChild(video);
            imgContainer.appendChild(videoOverlay);

            var hoverTimeout = null;
            card.addEventListener('mouseenter', function() {
                hoverTimeout = setTimeout(function() {
                    videoOverlay.classList.add('axflix-video-active');
                    video.currentTime = 0;
                    video.play().catch(function() {});
                }, HOVER_DELAY);
            });
            card.addEventListener('mouseleave', function() {
                clearTimeout(hoverTimeout);
                videoOverlay.classList.remove('axflix-video-active');
                video.pause();
                video.currentTime = 0;
            });
        }

        card.appendChild(imgContainer);

        // Label
        var label = document.createElement('div');
        label.className = 'axflix-studio-label';
        label.textContent = studio._displayName || studio.Name;
        card.appendChild(label);

        // Click to navigate directly to the native Studio Details page
        card.addEventListener('click', function() {
            var serverId = getServerId();
            window.location.href = '/web/#/details?id=' + studio.Id + '&serverId=' + serverId;
        });

        return card;
    }

    // ── DOM Injection ───────────────────────────────────────

    function isHomePage() {
        var path = window.location.pathname || '';
        var hash = window.location.hash || '';
        // Home page patterns
        if (path.endsWith('/web/') || path.endsWith('/web/index.html')) {
            if (!hash || hash === '#' || hash === '#/' || hash.includes('/home')) {
                return true;
            }
            // No specific route = home
            if (!hash.includes('list') && !hash.includes('details') &&
                !hash.includes('settings') && !hash.includes('playback') &&
                !hash.includes('configurationpage') && !hash.includes('dashboard') &&
                !hash.includes('search') && !hash.includes('video') &&
                !hash.includes('music') && !hash.includes('livetv')) {
                return true;
            }
        }
        return false;
    }

    function removeStudioRow() {
        var el = document.getElementById('axflix-studio-showcase');
        if (el) el.remove();
    }

    async function initStudioRow() {
        if (!isHomePage()) {
            removeStudioRow();
            return;
        }

        // Already injected
        if (document.getElementById('axflix-studio-showcase')) return;

        // Check token
        var token = getToken();
        if (!token) {
            console.log('[AxFlix] Waiting for authentication...');
            return;
        }

        console.log('[AxFlix] Initializing studio row...');

        var config = await fetchPluginConfig();
        if (!config.Enabled) {
            console.log('[AxFlix] Plugin disabled in config');
            return;
        }

        console.log('[AxFlix] Fetching studios...');
        var results = await Promise.all([fetchStudios(), fetchAvailableIntros()]);
        var studios = results[0];
        var intros = results[1];

        if (studios.length === 0) {
            console.warn('[AxFlix] No studios found (API returned empty list) - Check UserId or permissions');
            return;
        }

        console.log('[AxFlix] Found ' + studios.length + ' studios in total, ' + intros.length + ' intros');

        var row = buildStudioRow(studios, intros, config);

        // Find injection point - look for home sections or main content
        var target = null;
        var selectors = [
            '.homeSections',
            '.view-home-page .sections',
            '#homeTab .sections',
            '.section0',
            '[data-type="CollectionFolder"]',
            '#homeTab',
            '.tabContent[data-index="0"]',
            '.mainAnimatedPages .page:not(.hide)',
            '#indexPage',
            'main',
            '.mainDrawerContent'
        ];

        for (var i = 0; i < selectors.length; i++) {
            target = document.querySelector(selectors[i]);
            if (target) break;
        }

        if (target) {
            target.insertBefore(row, target.firstChild);
            console.log('[AxFlix] Studio row injected into: ' + target.className);
        } else {
            console.warn('[AxFlix] Could not find injection point, retrying...');
        }
    }

    // ── Navigation & Observer ───────────────────────────────

    function setupWatcher() {
        var lastUrl = '';
        var debounceTimer = null;

        function check() {
            var url = window.location.href;
            if (url !== lastUrl) {
                lastUrl = url;
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(function() {
                    if (isHomePage()) {
                        initStudioRow();
                    } else {
                        removeStudioRow();
                    }
                }, 1000);
            }
        }

        window.addEventListener('hashchange', check);
        window.addEventListener('popstate', check);

        // Also observe DOM changes for SPA transitions
        var observer = new MutationObserver(function() {
            if (isHomePage() && !document.getElementById('axflix-studio-showcase')) {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(initStudioRow, 1200);
            }
        });

        // Wait for main content area then observe
        var observeTarget = function() {
            var el = document.querySelector('.mainDrawerContent') ||
                     document.querySelector('#reactRoot') ||
                     document.body;
            observer.observe(el, { childList: true, subtree: true });
        };

        setTimeout(observeTarget, 2000);
    }

    // ── Bootstrap ───────────────────────────────────────────

    function bootstrap() {
        if (isInitialized) return;
        isInitialized = true;

        console.log('[AxFlix] Studios v' + AXFLIX_VERSION + ' loading...');
        injectStyles();
        setupWatcher();

        // Poll until we have auth, then init
        var attempts = 0;
        var maxAttempts = 40; // 40 x 1.5s = 60 seconds
        var pollTimer = setInterval(function() {
            attempts++;
            var token = getToken();
            if (token) {
                clearInterval(pollTimer);
                console.log('[AxFlix] Auth ready after ' + attempts + ' attempts');
                setTimeout(initStudioRow, 500);
            } else if (attempts >= maxAttempts) {
                clearInterval(pollTimer);
                console.warn('[AxFlix] Timed out waiting for auth');
            }
        }, 1500);
    }

    // Start
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bootstrap);
    } else {
        bootstrap();
    }
})();
