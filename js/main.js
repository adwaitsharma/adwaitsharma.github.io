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
    window.toggleMenu = function () { // Expose to window for onclick
        mobileMenu.classList.toggle('active');
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
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.pub-row').forEach(row => {
        const cats = (row.getAttribute('data-category') || '').split(',').map(s => s.trim());
        const venue = (row.getAttribute('data-venue') || '');
        if (cat === 'all' || cats.includes(cat) || venue.includes(cat)) {
            row.classList.remove('hidden');
        } else {
            row.classList.add('hidden');
        }
    });
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
