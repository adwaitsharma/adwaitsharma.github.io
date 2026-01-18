/**
 * js/main.js
 * Main UI logic for adwaitsharma.github.io
 * Handles Navigation, Mobile Menu, Render Publications, BibTeX, and Filters.
 */

document.addEventListener('DOMContentLoaded', () => {

    // 1. Initialize AOS (Animate On Scroll)
    if (typeof AOS !== 'undefined') {
        AOS.init({ duration: 800, offset: 50, once: true });
    }

    // 2. Mobile Menu Toggle
    const mobileMenu = document.getElementById('mobileMenu');
    const menuToggle = document.getElementById('mobile-menu-trigger');
    window.toggleMenu = function () { // Expose to window for onclick
        mobileMenu.classList.toggle('active');
        menuToggle.classList.toggle('active');
    };

    // 3. Render Publications if data exists
    if (typeof renderPublications === 'function') {
        renderPublications();
    }

    // 4. Typewriter Effect
    (function () {
        const el = document.getElementById('lab-typewriter');
        if (!el) return;
        const items = ['Design.', 'Sensing.', 'Human-Centered AI.'];
        let i = 0, j = 0, isDel = false;
        function loop() {
            const current = items[i];
            el.innerHTML = isDel ? current.substring(0, j - 1) : current.substring(0, j + 1);
            j = isDel ? j - 1 : j + 1;
            if (!isDel && j === current.length) { isDel = true; setTimeout(loop, 3000); }
            else if (isDel && j === 0) { isDel = false; i = (i + 1) % items.length; setTimeout(loop, 600); }
            else { setTimeout(loop, isDel ? 40 : 80); }
        }
        loop();
    })();
});


// --- SCROLL SPY LOGIC ---
window.addEventListener('scroll', () => {
    let scrollY = window.pageYOffset;
    let current = '';

    if (scrollY < 200) {
        current = 'about';
    } else {
        const sections = document.querySelectorAll('section, #ais-lab');
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (scrollY >= sectionTop - 180) {
                current = section.getAttribute('id');
            }
        });
    }

    const aisLabSubSections = ['research', 'scandi-feature-v1', 'featured-projects-section', 'aislab-hero'];

    document.querySelectorAll('.nav-link').forEach(li => {
        li.classList.remove('active');
        const href = li.getAttribute('href').substring(1);

        if (href === current) {
            li.classList.add('active');
        }
        else if (href === 'ais-lab' && (current === 'ais-lab' || aisLabSubSections.includes(current))) {
            li.classList.add('active');
        }
        else if (href === 'teams' && current === 'teams') {
            li.classList.add('active');
        }
    });
});


// --- RENDER PUBLICATIONS & FILTERS ---
// (Moved from index.html inline script)
function renderPublications() {
    const container = document.getElementById('publications-list-container');
    if (!container) return;

    if (typeof publicationsData === 'undefined') {
        console.warn('publicationsData is not defined. Make sure js/data.js is loaded.');
        return;
    }

    const listItems = publicationsData.filter(p => p.showInList);

    container.innerHTML = listItems.map(pub => {
        const catStr = Array.isArray(pub.type) ? pub.type.join(',') : pub.type;
        const projectLink = `project-pages/${pub.id}.html`;

        const has = (url) => url && url.trim() !== '' && url !== '#';

        let btns = '';
        if (has(pub.pdf)) btns += `<a href="${pub.pdf}" class="btn-sm" target="_blank"><i class="fa-regular fa-file-pdf"></i> PDF</a>`;

        btns += `<a href="${projectLink}" class="btn-sm"><i class="fa-solid fa-arrow-right"></i> DETAILS</a>`;

        if (has(pub.projectUrl)) btns += `<a href="${pub.projectUrl}" class="btn-sm" target="_blank"><i class="fa-solid fa-globe"></i> WEB</a>`;
        if (has(pub.slides)) btns += `<a href="${pub.slides}" class="btn-sm" target="_blank"><i class="fa-regular fa-images"></i> SLIDES</a>`;
        if (has(pub.videoUrl)) btns += `<a href="${pub.videoUrl}" class="btn-sm" target="_blank"><i class="fa-brands fa-youtube"></i> VIDEO</a>`;
        if (has(pub.codeUrl)) btns += `<a href="${pub.codeUrl}" class="btn-sm" target="_blank"><i class="fa-brands fa-github"></i> CODE</a>`;

        if (pub.bibtex) btns += `<button class="btn-sm" onclick="showBibtex('${pub.id}')"><i class="fa-solid fa-quote-right"></i> BIBTEX</button>`;

        return `
        <article class="pub-row" data-category="${catStr}" data-venue="${pub.venue}">
            <a href="${projectLink}" class="pub-thumb">
                <img src="${pub.thumb}" width="320" height="220" loading="lazy" alt="${pub.title}">
            </a>
            <div>
                <span class="pub-venue">${pub.venue}</span>
                <h3 class="pub-title">
                    <a href="${projectLink}">${pub.title}</a>
                </h3>
                ${pub.award ? `<div class="pub-award-row">${pub.award}</div>` : ''}
                <p class="pub-authors">${pub.authors}</p>
                <p class="pub-desc">${pub.desc}</p>
                <div class="pub-actions">
                    ${btns}
                </div>
            </div>
        </article>
    `}).join('');
}

window.filterPubs = function (cat, btn) {
    // Remove active class from ALL filter buttons (desktop + mobile)
    document.querySelectorAll('.filter-btn, .scandi-filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Filter desktop publications
    document.querySelectorAll('.pub-row').forEach(row => {
        const cats = (row.getAttribute('data-category') || '').split(',').map(s => s.trim());
        const venue = (row.getAttribute('data-venue') || '');
        if (cat === 'all' || cats.includes(cat) || venue.includes(cat)) {
            row.classList.remove('hidden');
        } else {
            row.classList.add('hidden');
        }
    });

    // Filter mobile publications
    if (typeof publicationsData !== 'undefined') {
        document.querySelectorAll('.scandi-pub-card').forEach((card, idx) => {
            const pub = publicationsData[idx];
            if (!pub) return;

            const cats = Array.isArray(pub.type) ? pub.type : [pub.type];
            const venue = pub.venue || '';

            if (cat === 'all' || cats.includes(cat) || venue.includes(cat)) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    }
};


// --- BIBTEX Utilities ---
window.showBibtex = function (id) {
    const data = publicationsData.find(p => p.id === id);
    if (!data || !data.bibtex) return;
    const modal = document.getElementById('bibtex-modal');
    const textArea = document.getElementById('bibtex-text');
    if (modal && textArea) {
        textArea.value = data.bibtex;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
};

window.closeBibtex = function () {
    const modal = document.getElementById('bibtex-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
};

window.copyBibtex = function () {
    const copyText = document.getElementById("bibtex-text");
    copyText.select();
    navigator.clipboard.writeText(copyText.value).then(() => {
        const btn = document.querySelector('.btn-copy');
        const original = btn.innerText;
        btn.innerText = "Copied!";
        setTimeout(() => btn.innerText = original, 2000);
    });
};

window.copyPageLink = function (btn) {
    navigator.clipboard.writeText(window.location.href).then(() => {
        const original = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
        setTimeout(() => btn.innerHTML = original, 2000);
    });
};

document.addEventListener('click', (e) => {
    const modal = document.getElementById('bibtex-modal');
    if (e.target === modal) window.closeBibtex();
});

// Re-render publications on window resize to handle device switching
let pubResizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(pubResizeTimeout);
    pubResizeTimeout = setTimeout(() => {
        if (typeof renderPublications === 'function') {
            renderPublications();
        }
    }, 150);
});

// --- RESEARCH AREAS CAROUSEL NAVIGATION ---
(function () {
    const grid = document.getElementById('research-grid');
    const prevBtn = document.getElementById('ra-nav-prev');
    const nextBtn = document.getElementById('ra-nav-next');
    const counterCurrent = document.querySelector('.ra-current');
    const counterTotal = document.querySelector('.ra-total');

    if (!grid || !prevBtn || !nextBtn) return;

    // Calculate scroll distance (80vw + 16px gap)
    const getScrollDistance = () => {
        const cardWidth = window.innerWidth * 0.80;
        const gap = 16;
        return cardWidth + gap;
    };

    // Get current card index based on scroll position
    const getCurrentIndex = () => {
        const scrollDistance = getScrollDistance();
        return Math.round(grid.scrollLeft / scrollDistance) + 1;
    };

    // Get total number of cards
    const getTotalCards = () => {
        return grid.querySelectorAll('.ra-card').length;
    };

    // Update counter display (1/4 format)
    const updateCounter = () => {
        if (counterCurrent) {
            counterCurrent.textContent = getCurrentIndex();
        }
        if (counterTotal) {
            counterTotal.textContent = getTotalCards();
        }
    };

    // Update button states based on scroll position
    const updateButtonStates = () => {
        const scrollLeft = grid.scrollLeft;
        const maxScroll = grid.scrollWidth - grid.clientWidth;

        // Check if at start (allow 5px tolerance for rounding)
        if (scrollLeft <= 5) {
            prevBtn.classList.add('disabled');
            prevBtn.setAttribute('aria-disabled', 'true');
        } else {
            prevBtn.classList.remove('disabled');
            prevBtn.removeAttribute('aria-disabled');
        }

        // Check if at end (allow 5px tolerance for rounding)
        if (scrollLeft >= maxScroll - 5) {
            nextBtn.classList.add('disabled');
            nextBtn.setAttribute('aria-disabled', 'true');
        } else {
            nextBtn.classList.remove('disabled');
            nextBtn.removeAttribute('aria-disabled');
        }

        // Update counter
        updateCounter();
    };

    // Initialize button states and counter
    updateButtonStates();

    // Update button states and counter on scroll
    grid.addEventListener('scroll', updateButtonStates);

    // Update button states on resize
    window.addEventListener('resize', updateButtonStates);

    // Navigation handlers
    prevBtn.addEventListener('click', () => {
        if (!prevBtn.classList.contains('disabled')) {
            grid.scrollBy({
                left: -getScrollDistance(),
                behavior: 'smooth'
            });
        }
    });

    nextBtn.addEventListener('click', () => {
        if (!nextBtn.classList.contains('disabled')) {
            grid.scrollBy({
                left: getScrollDistance(),
                behavior: 'smooth'
            });
        }
    });
})();

// --- ALWAYS-AVAILABLE COMPUTING ACCORDION ---
window.toggleAppAccordion = function (index) {
    const content = document.getElementById(`app-content-${index}`);
    const toggle = document.getElementById(`app-toggle-${index}`);

    if (!content || !toggle) return;

    // Close all other accordions
    for (let i = 0; i < 4; i++) {
        if (i !== index) {
            const otherContent = document.getElementById(`app-content-${i}`);
            const otherToggle = document.getElementById(`app-toggle-${i}`);
            if (otherContent && otherToggle) {
                otherContent.classList.remove('active');
                otherToggle.classList.remove('active');
            }
        }
    }

    // Toggle current accordion
    content.classList.toggle('active');
    toggle.classList.toggle('active');
};

// --- FEATURED PROJECTS NATIVE SCROLL CAROUSEL (MOBILE ONLY) ---
(function () {
    const track = document.getElementById('carousel-track');
    const dots = document.querySelectorAll('.carousel-dot');
    const playPauseBtn = document.getElementById('carousel-play-pause');
    const pauseIcon = document.getElementById('pause-icon');
    const playIcon = document.getElementById('play-icon');
    const counterCurrent = document.querySelector('.carousel-current');
    const counterTotal = document.querySelector('.carousel-total');

    if (!track || !dots.length || !playPauseBtn) return;

    let currentIndex = 0;
    let isPlaying = true;
    let isUserScrolling = false;
    let isAutoScrolling = false; // Prevents scroll listener from conflicting during auto-play glide
    // Note: AUTO_PLAY_DURATION is now controlled by CSS animation (5s in @keyframes progressFill)

    // Get card width (85vw + 16px gap)
    function getCardWidth() {
        return window.innerWidth * 0.85 + 16;
    }

    // --- CUSTOM EASE SCROLL HELPER (The "Heavy" Apple Feel) ---
    // easeInOutQuart: starts slow, accelerates, lands gently - feels "expensive"
    const easeInOutQuart = (t) => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t;

    const smoothScrollTo = (element, target, duration) => {
        const start = element.scrollLeft;
        const change = target - start;
        const startTime = performance.now();

        // CRITICAL: Disable scroll-snap and mark as auto-scrolling
        element.style.scrollSnapType = 'none';
        isAutoScrolling = true; // Prevent scroll listener from interfering

        const animateScroll = (currentTime) => {
            const elapsed = currentTime - startTime;
            if (elapsed < duration) {
                const progress = easeInOutQuart(elapsed / duration);
                element.scrollLeft = start + change * progress;
                requestAnimationFrame(animateScroll);
            } else {
                element.scrollLeft = target; // Ensure perfect final snap
                // Re-enable scroll-snap and clear auto-scroll flag
                element.style.scrollSnapType = 'x mandatory';
                isAutoScrolling = false;
            }
        };
        requestAnimationFrame(animateScroll);
    };

    // Update dot visual states (active class + paused state)
    function updateDotStates() {
        dots.forEach((dot, idx) => {
            const progressBar = dot.querySelector('.carousel-progress');

            if (idx === currentIndex) {
                dot.classList.add('active');
                if (!isPlaying) {
                    dot.classList.add('paused');
                    if (progressBar) progressBar.style.width = '0%';
                } else {
                    dot.classList.remove('paused');
                }
            } else {
                dot.classList.remove('active', 'paused');
                if (progressBar) progressBar.style.width = '0%';
            }
        });
    }

    // Start CSS-driven progress animation (GPU-accelerated, jitter-free)
    function startProgressAnimation() {
        stopProgressAnimation(); // Reset first

        const activeDot = dots[currentIndex];
        const progressBar = activeDot?.querySelector('.carousel-progress');
        if (!progressBar || !isPlaying) return;

        // Trigger CSS animation by adding class
        progressBar.classList.add('filling');

        // Listen for animation end to advance slide
        progressBar.onanimationend = () => {
            if (isPlaying) {
                nextSlide();
            }
        };
    }

    // Stop progress animation (HARD RESET - prevents reverse playback glitch)
    function stopProgressAnimation() {
        // Reset all progress bars with proper animation reset
        dots.forEach(dot => {
            const progressBar = dot.querySelector('.carousel-progress');
            if (progressBar) {
                // 1. Remove the event listener first
                progressBar.onanimationend = null;

                // 2. Remove animation class
                progressBar.classList.remove('filling');

                // 3. Force DOM reflow (critical for animation restart)
                void progressBar.offsetWidth;

                // 4. Explicitly reset width to 0 (prevents reverse animation)
                progressBar.style.width = '0%';
            }
        });
    }

    // Update dots based on scroll position (ONLY for manual user scrolling)
    function updateDotsFromScroll() {
        // Skip if auto-scrolling (prevents conflict with auto-play glide)
        if (isAutoScrolling) return;

        const scrollLeft = track.scrollLeft;
        const cardWidth = getCardWidth();
        const index = Math.round(scrollLeft / cardWidth);

        if (index !== currentIndex && index >= 0 && index < dots.length) {
            currentIndex = index;
            updateDotStates();
            if (isPlaying) {
                startProgressAnimation();
            }
        }
    }

    // Scroll to specific slide (1600ms duration for ultra-luxurious glide)
    function scrollToSlide(index) {
        const cardWidth = getCardWidth();
        smoothScrollTo(track, index * cardWidth, 1600);
    }

    // Go to next slide (with smart loop handling)
    function nextSlide() {
        const totalSlides = dots.length;
        const nextIndex = (currentIndex + 1) % totalSlides;

        // --- THE "UNPROFESSIONAL REWIND" FIX ---
        if (nextIndex === 0) {
            // Looping back to start: Instant snap (no dizzy rewind animation)
            track.scrollTo({ left: 0, behavior: 'instant' });
            currentIndex = 0;
        } else {
            // Normal slide: Luxurious 1200ms animated scroll
            currentIndex = nextIndex;
            scrollToSlide(nextIndex);
        }

        updateDotStates();
        if (isPlaying) {
            startProgressAnimation();
        }
    }

    // Start auto-play
    function startAutoPlay() {
        isPlaying = true;
        pauseIcon.style.display = 'block';
        playIcon.style.display = 'none';
        playPauseBtn.setAttribute('aria-label', 'Pause auto-play');

        updateDotStates();
        startProgressAnimation();
    }

    // Stop auto-play
    function stopAutoPlay() {
        isPlaying = false;
        pauseIcon.style.display = 'none';
        playIcon.style.display = 'block';
        playPauseBtn.setAttribute('aria-label', 'Play auto-play');

        stopProgressAnimation();
        updateDotStates();
    }

    // Toggle play/pause
    playPauseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (isPlaying) {
            stopAutoPlay();
        } else {
            startAutoPlay();
        }
    });

    // Dot navigation
    dots.forEach((dot) => {
        dot.addEventListener('click', (e) => {
            e.stopPropagation();
            const index = parseInt(dot.getAttribute('data-index'));
            currentIndex = index;
            scrollToSlide(index);
            updateDotStates();

            // Restart progress if playing
            if (isPlaying) {
                startProgressAnimation();
            }
        });
    });

    // Pause on user touch/scroll
    let scrollTimeout;
    track.addEventListener('touchstart', () => {
        isUserScrolling = true;
        stopAutoPlay();
    });

    // Track scroll to update dots
    track.addEventListener('scroll', () => {
        updateDotsFromScroll();

        // Debounce scroll end detection
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            isUserScrolling = false;
        }, 150);
    });

    // Initialize - only start autoplay on mobile
    updateDotStates();
    if (window.innerWidth <= 600) {
        startAutoPlay();
    }

    // Handle resize - properly start/stop autoplay based on viewport
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (window.innerWidth > 600) {
                // Desktop: stop autoplay
                if (isPlaying) {
                    stopAutoPlay();
                }
            } else if (window.innerWidth <= 600) {
                // Mobile: start autoplay if not already playing
                if (!isPlaying && !isUserScrolling) {
                    startAutoPlay();
                } else {
                    updateDotStates();
                }
            }
        }, 150);
    });
})();

