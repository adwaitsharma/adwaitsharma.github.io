/**
 * js/renderer.js
 * Handles dynamic content injection for Project Pages.
 * * UPDATES:
 * - Dynamic "Related Projects" logic using tag-based scoring and randomization.
 * - SEO: Dynamic injection of Meta Title, Description, and Open Graph tags.
 * - SEO: Dynamic generation of JSON-LD Structured Data (ScholarlyArticle).
 * - Performance: Explicit width/height attributes to reduce Cumulative Layout Shift (CLS).
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Verify Environment
    if (typeof publicationsData === 'undefined' || typeof window.projectID === 'undefined') {
        console.error('Error: Data or Project ID missing.');
        return;
    }

    // 2. Find Current Project Data
    const currentProject = publicationsData.find(p => p.id === window.projectID);

    if (!currentProject) {
        document.querySelector('.project-wrapper').innerHTML = `
            <div style="padding:100px 0; text-align:center;">
                <h1>Project Not Found</h1>
                <p>The project ID "${window.projectID}" does not exist in data.js.</p>
                <a href="../index.html" class="pp-btn" style="display:inline-block; margin-top:20px;">Back to Home</a>
            </div>`;
        return;
    }

    // 3. Update SEO (Head Tags & Schema)
    updateSEOMetadata(currentProject);

    // 4. Render Body Content (Visible Elements)
    renderProjectContent(currentProject);
    renderRelatedProjects(currentProject);
});

/**
 * Updates Head elements for SEO: Title, Meta Tags, Canonical, and JSON-LD
 */
function updateSEOMetadata(p) {
    // A. Page Title
    document.title = `${p.title} | Adwait Sharma`;

    // B. Meta Description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", p.desc);

    // C. Open Graph Tags (Social Sharing)
    const setMeta = (prop, val) => {
        const el = document.querySelector(`meta[property="${prop}"]`);
        if (el) el.setAttribute("content", val);
    };

    setMeta("og:title", p.title);
    setMeta("og:description", p.desc);
    setMeta("og:image", `https://www.adwaitsharma.com/${p.thumb}`);
    setMeta("og:url", `https://www.adwaitsharma.com/project-pages/${p.id}.html`);

    // D. Canonical Link
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
        canonical.setAttribute('href', `https://www.adwaitsharma.com/project-pages/${p.id}.html`);
    }

    // E. JSON-LD Structured Data (ScholarlyArticle)
    const existingScript = document.getElementById('dynamic-schema');
    if (existingScript) existingScript.remove();

    const authorList = p.authors ? p.authors.split(',').map(name => ({
        "@type": "Person",
        "name": name.trim()
    })) : [{ "@type": "Person", "name": "Adwait Sharma" }];

    const script = document.createElement('script');
    script.id = 'dynamic-schema';
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "ScholarlyArticle",
        "headline": p.title,
        "image": `https://www.adwaitsharma.com/${p.thumb}`,
        "author": authorList,
        "description": p.desc,
        "publisher": {
            "@type": "Organization",
            "name": "AIS Lab - University of Bath",
            "logo": {
                "@type": "ImageObject",
                "url": "https://www.adwaitsharma.com/images/bath-logo4.webp"
            }
        }
    });
    document.head.appendChild(script);
}

/**
 * Populates the main HTML structure with data from data.js
 */
function renderProjectContent(p) {
    const titleEl = document.getElementById('pp-title');
    const venueEl = document.getElementById('pp-venue');
    const awardContainer = document.getElementById('pp-award-container');

    if (titleEl) titleEl.textContent = p.title;

    if (venueEl) {
        const yearMatch = p.venue.match(/\b(19|20)\d{2}\b/);
        const year = yearMatch ? yearMatch[0] : '';
        venueEl.innerHTML = year ? `<time datetime="${year}">${p.venue}</time>` : p.venue;
    }

    if (awardContainer && p.award) {
        awardContainer.innerHTML = p.award;
    }

    const mediaContainer = document.getElementById('pp-media');
    if (mediaContainer) {
        let mediaHTML = '';
        if (p.videoUrl && (p.videoUrl.includes('youtube') || p.videoUrl.includes('youtu.be'))) {
            const videoId = p.videoUrl.split('v=')[1] || p.videoUrl.split('/').pop();
            const cleanId = videoId.split('&')[0];
            mediaHTML = `<div class="video-responsive"><iframe src="https://www.youtube.com/embed/${cleanId}" title="${p.title}" frameborder="0" allowfullscreen></iframe></div>`;
        } else if (p.modalVideo) {
            mediaHTML = `<video controls autoplay muted loop class="pp-featured-media" poster="../${p.thumb}"><source src="../${p.modalVideo}" type="video/mp4"></video>`;
        } else {
            mediaHTML = `<img src="../${p.thumb}" class="pp-featured-media" alt="${p.title}" loading="eager" width="1000" height="562">`;
        }
        mediaContainer.innerHTML = mediaHTML;
    }

    const abstractEl = document.getElementById('pp-abstract');
    if (abstractEl) abstractEl.innerHTML = p.fullAbstract || p.desc;

    const btnContainer = document.getElementById('pp-buttons');
    if (btnContainer) {
        const buttons = [];
        if (p.pdf && p.pdf !== "#") buttons.push(`<a href="${p.pdf}" target="_blank" class="pp-btn"><i class="fa-regular fa-file-pdf"></i> PDF</a>`);
        if (p.codeUrl && p.codeUrl !== "#") buttons.push(`<a href="${p.codeUrl}" target="_blank" class="pp-btn"><i class="fa-brands fa-github"></i> Code</a>`);
        if (p.slides && p.slides !== "#") buttons.push(`<a href="${p.slides}" target="_blank" class="pp-btn"><i class="fa-brands fa-slideshare"></i> Slides</a>`);
        if (p.bibtex) buttons.push(`<button onclick="showBibtex()" class="pp-btn"><i class="fa-solid fa-quote-right"></i> BibTeX</button>`);
        btnContainer.innerHTML = buttons.join('');
    }

    const tagsContainer = document.getElementById('pp-tags');
    if (tagsContainer && p.type) {
        const tags = Array.isArray(p.type) ? p.type : [p.type];
        tagsContainer.innerHTML = tags.join('<span class="pp-tag-separator">, </span>');
    }
}

/**
 * Renders the "Related Projects" section dynamically.
 * Logic: Filters out current project, scores others based on shared tags, 
 * adds randomization to break ties, and selects the top 4.
 */
function renderRelatedProjects(currentProject) {
    const grid = document.getElementById('related-projects-grid');
    if (!grid) return;

    // 1. Exclude current project and only include those marked for the list
    const otherProjects = publicationsData.filter(p => p.id !== currentProject.id && p.showInList);

    // 2. Score based on category/tag overlap
    const currentTags = Array.isArray(currentProject.type) ? currentProject.type : [currentProject.type];

    const scoredProjects = otherProjects.map(p => {
        const pTags = Array.isArray(p.type) ? p.type : [p.type];
        // Calculate intersection of tags
        const commonTags = pTags.filter(tag => currentTags.includes(tag)).length;

        return {
            data: p,
            // The score is (number of matching tags) + (random decimal 0-1)
            // This ensures relevant projects rise to top, but the order changes on refresh
            score: commonTags + Math.random()
        };
    });

    // 3. Sort by score descending and take top 4
    const top4 = scoredProjects
        .sort((a, b) => b.score - a.score)
        .slice(0, 4)
        .map(wrapper => wrapper.data);

    if (top4.length === 0) {
        const section = document.querySelector('.related-section');
        if (section) section.style.display = 'none';
        return;
    }

    grid.innerHTML = top4.map(p => `
        <a href="./${p.id}.html" class="related-card">
            <img src="../${p.thumb}" class="related-thumb" alt="${p.title}" width="320" height="220" loading="lazy">
            <span class="related-venue">${p.venue}</span>
            <div class="related-title">${p.title}</div>
        </a>
    `).join('');
}

// --- BIBTEX UTILITIES ---
window.showBibtex = function () {
    const id = window.projectID;
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
    if (!copyText) return;
    copyText.select();
    navigator.clipboard.writeText(copyText.value).then(() => {
        const btn = document.querySelector('.btn-copy');
        if (btn) {
            const originalText = btn.textContent;
            btn.textContent = "Copied!";
            setTimeout(() => { btn.textContent = originalText; }, 2000);
        }
    });
};

document.addEventListener('click', (e) => {
    const modal = document.getElementById('bibtex-modal');
    if (e.target === modal) window.closeBibtex();
});