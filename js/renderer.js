/**
 * js/renderer.js
 * Handles dynamic content injection for Project Pages with Enhanced SEO.
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
        document.body.innerHTML = '<div style="padding:50px;text-align:center;"><h1>Project Not Found</h1><a href="../index.html">Back</a></div>';
        return;
    }

    // 3. Update Meta & Title
    const pageTitle = `${currentProject.title} | Adwait Sharma`;
    document.title = pageTitle;
    
    // --- SEO FIX START: Auto-Generate Tags ---
    
    // Helper to set meta tags dynamically
    const setMeta = (attrName, attrVal, content) => {
        let el = document.querySelector(`meta[${attrName}='${attrVal}']`);
        if (!el) {
            el = document.createElement('meta');
            el.setAttribute(attrName, attrVal);
            document.head.appendChild(el);
        }
        el.content = content;
    };

    // 3.1 Meta Description (Use Abstract or Desc)
    const seoDesc = currentProject.desc.length > 150 
        ? currentProject.desc 
        : (currentProject.fullAbstract ? currentProject.fullAbstract.substring(0, 155) + '...' : currentProject.title);
    setMeta('name', 'description', seoDesc);

    // 3.2 Open Graph Tags
    setMeta('property', 'og:title', pageTitle);
    setMeta('property', 'og:description', seoDesc);
    setMeta('property', 'og:image', `https://www.adwaitsharma.com/${currentProject.thumb}`);
    setMeta('property', 'og:url', window.location.href);
    setMeta('property', 'og:type', 'article');

    // 3.3 Twitter Card
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', pageTitle);
    setMeta('name', 'twitter:description', seoDesc);
    setMeta('name', 'twitter:image', `https://www.adwaitsharma.com/${currentProject.thumb}`);
    setMeta('name', 'twitter:site', '@adwait_sharma');

    // 3.4 Inject Canonical Tag (Fixes "Page with redirect" issues)
    const cleanUrl = window.location.href.split('?')[0].split('#')[0];
    let linkCan = document.querySelector("link[rel='canonical']");
    if (!linkCan) {
        linkCan = document.createElement('link');
        linkCan.rel = 'canonical';
        document.head.appendChild(linkCan);
    }
    linkCan.href = cleanUrl;

    // 3.5 Inject Robots Tag (Fixes "Excluded by noindex" issues)
    setMeta('name', 'robots', 'index, follow');

    // 3.6 Structured Data (JSON-LD) for Google Scholar
    const yearMatch = currentProject.venue.match(/\d{4}/);
    const pubYear = yearMatch ? yearMatch[0] : new Date().getFullYear().toString();
    
    const schemaData = {
        "@context": "https://schema.org",
        "@type": "ScholarlyArticle",
        "headline": currentProject.title,
        "image": `https://www.adwaitsharma.com/${currentProject.thumb}`,
        "description": seoDesc,
        "abstract": currentProject.fullAbstract || currentProject.desc,
        "author": currentProject.authors.split(', ').map(name => ({
            "@type": "Person",
            "name": name.trim()
        })),
        "datePublished": pubYear,
        "publication": {
            "@type": "PublicationEvent",
            "name": currentProject.venue
        }
    };
    if (currentProject.pdf && currentProject.pdf !== '#') schemaData.url = currentProject.pdf;
    
    const scriptSchema = document.createElement('script');
    scriptSchema.type = 'application/ld+json';
    scriptSchema.text = JSON.stringify(schemaData);
    document.head.appendChild(scriptSchema);

    // --- SEO FIX END ---
    
    // 4. Inject Header Content
    const venueEl = document.getElementById('pp-venue');
    if (venueEl) venueEl.textContent = currentProject.venue;
    
    const titleEl = document.getElementById('pp-title');
    if (titleEl) titleEl.textContent = currentProject.title;

    const awardContainer = document.getElementById('pp-award-container');
    if (awardContainer && currentProject.award) {
        awardContainer.innerHTML = currentProject.award; 
    }

    // 5. Inject Abstract
    const abstractEl = document.getElementById('pp-abstract');
    if (abstractEl) {
        abstractEl.textContent = currentProject.fullAbstract || currentProject.desc;
    }

    // 6. Inject Media (Embed Video or Thumbnail)
    const mediaContainer = document.getElementById('pp-media');
    if (mediaContainer) {
        if (currentProject.modalVideo && currentProject.modalVideo !== '#') {
            mediaContainer.innerHTML = `<iframe src="${currentProject.modalVideo}" title="${currentProject.title} Video" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
        } else {
            // Handle relative path for images from project-pages/ folder
            const imgPath = `../${currentProject.thumb}`;
            mediaContainer.innerHTML = `<img src="${imgPath}" alt="${currentProject.title} project visualization">`;
        }
    }

    // 7. Inject All Action Buttons
    const btnContainer = document.getElementById('pp-buttons');
    if (btnContainer) {
        const buttons = [];
        
        // Helper: Only returns HTML if url exists and isn't a placeholder
        const createBtn = (label, iconClass, url, onclick = null) => {
            if (onclick) {
                 return `<button onclick="${onclick}" class="pp-btn" aria-label="${label}"><i class="${iconClass}"></i> ${label}</button>`;
            }
            if (!url || url.trim() === '' || url === '#') return '';
            return `<a href="${url}" target="_blank" class="pp-btn" rel="noopener noreferrer" aria-label="${label}"><i class="${iconClass}"></i> ${label}</a>`;
        };

        // Add all supported buttons
        buttons.push(createBtn('Paper (PDF)', 'fa-regular fa-file-pdf', currentProject.pdf));
        buttons.push(createBtn('Video', 'fa-brands fa-youtube', currentProject.videoUrl));
        buttons.push(createBtn('Code / Repo', 'fa-brands fa-github', currentProject.codeUrl));
        buttons.push(createBtn('Slides', 'fa-regular fa-images', currentProject.slides));
        buttons.push(createBtn('External Website', 'fa-solid fa-globe', currentProject.projectUrl));
        
        // BibTeX Button (Conditional)
        if (currentProject.bibtex) {
            buttons.push(createBtn('BibTeX', 'fa-solid fa-quote-right', null, 'showBibtex()'));
        }

        btnContainer.innerHTML = buttons.join('');
    }

    // 8. Inject Tags
    const tagContainer = document.getElementById('pp-tags');
    if (tagContainer && currentProject.type) {
        const tags = Array.isArray(currentProject.type) ? currentProject.type : [currentProject.type];
        tagContainer.innerHTML = tags.map(t => `<span style="display:block; border-bottom:1px solid #eee; padding:4px 0;">${t}</span>`).join('');
    }

    // 9. Generate Related Projects
    renderRelatedProjects(currentProject);
});

/**
 * Related Projects Logic
 */
function renderRelatedProjects(current) {
    const grid = document.getElementById('related-projects-grid');
    if (!grid) return;

    const currentTags = Array.isArray(current.type) ? current.type : [current.type];
    const related = publicationsData.filter(p => {
        if (p.id === current.id || !p.showInList) return false;
        const pTags = Array.isArray(p.type) ? p.type : [p.type];
        // Overlap check
        return pTags.some(tag => currentTags.includes(tag));
    });

    // Take top 4
    const top4 = related.slice(0, 4);

    if (top4.length === 0) {
        document.querySelector('.related-section').style.display = 'none';
        return;
    }

    grid.innerHTML = top4.map(p => {
        return `
            <a href="./${p.id}.html" class="related-card">
                <img src="../${p.thumb}" class="related-thumb" alt="${p.title}" loading="lazy">
                <span class="related-venue">${p.venue}</span>
                <div class="related-title">${p.title}</div>
            </a>
        `;
    }).join('');
}

// --- BIBTEX UTILITIES ---
window.showBibtex = function() {
    const id = window.projectID;
    const data = publicationsData.find(p => p.id === id);
    if (!data || !data.bibtex) return;
    
    const modal = document.getElementById('bibtex-modal');
    const textArea = document.getElementById('bibtex-text');
    if(modal && textArea) {
        textArea.value = data.bibtex;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
};

window.closeBibtex = function() {
    document.getElementById('bibtex-modal').classList.remove('active');
    document.body.style.overflow = 'auto';
};

window.copyBibtex = function() {
    const copyText = document.getElementById("bibtex-text");
    copyText.select();
    navigator.clipboard.writeText(copyText.value).then(() => {
        const btn = document.querySelector('.btn-copy');
        const original = btn.innerText;
        btn.innerText = "Copied!";
        setTimeout(() => btn.innerText = original, 2000);
    });
};