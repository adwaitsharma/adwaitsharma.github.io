// --- SCANDINAVIAN MINIMALIST PUBLICATIONS (Premium Mobile) ---
(function() {
    function renderMobilePublications() {
        const container = document.getElementById('mobile-publications-locked');
        if (!container || typeof publicationsData === 'undefined') return;

        const allPubs = publicationsData.filter(p => p.showInList);

        // Generate refined publication cards
        const publicationsHTML = allPubs.map((pub, idx) => {
            const has = (url) => url && url.trim() !== '' && url !== '#';
            const projectLink = `project-pages/${pub.id}.html`;

            // Build complete button set matching desktop exactly
            let buttons = '';
            if (has(pub.pdf)) buttons += `<a href="${pub.pdf}" class="scandi-pub-link" target="_blank" rel="noopener noreferrer"><i class="fa-regular fa-file-pdf"></i> PDF</a>`;
            buttons += `<a href="${projectLink}" class="scandi-pub-link"><i class="fa-solid fa-arrow-right"></i> DETAILS</a>`;
            if (has(pub.projectUrl)) buttons += `<a href="${pub.projectUrl}" class="scandi-pub-link" target="_blank" rel="noopener noreferrer"><i class="fa-solid fa-globe"></i> WEB</a>`;
            if (has(pub.slides)) buttons += `<a href="${pub.slides}" class="scandi-pub-link" target="_blank" rel="noopener noreferrer"><i class="fa-regular fa-images"></i> SLIDES</a>`;
            if (has(pub.videoUrl)) buttons += `<a href="${pub.videoUrl}" class="scandi-pub-link" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-youtube"></i> VIDEO</a>`;
            if (has(pub.codeUrl)) buttons += `<a href="${pub.codeUrl}" class="scandi-pub-link" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-github"></i> CODE</a>`;
            if (pub.bibtex) buttons += `<button class="scandi-pub-link" onclick="showBibtex('${pub.id}')"><i class="fa-solid fa-quote-right"></i> BIBTEX</button>`;

            return `
                <article class="scandi-pub-card" data-pub-index="${idx}">
                    <a href="${projectLink}" class="scandi-pub-image-wrapper">
                        <img src="${pub.thumb}" alt="${pub.title}" class="scandi-pub-image" loading="lazy">
                    </a>
                    <div class="scandi-pub-content">
                        <span class="scandi-pub-venue">${pub.venue}</span>
                        <h3 class="scandi-pub-title">
                            <a href="${projectLink}">${pub.title}</a>
                        </h3>
                        ${pub.award ? `<div class="scandi-pub-award">${pub.award}</div>` : ''}
                        <p class="scandi-pub-authors">${pub.authors}</p>
                        <p class="scandi-pub-desc">${pub.desc}</p>
                        <div class="scandi-pub-actions">
                            ${buttons}
                        </div>
                    </div>
                </article>
            `;
        }).join('');

        container.innerHTML = `
            <div class="scandi-pub-wrapper">
                <h2 class="scandi-pub-h2">Peer-Reviewed Publications</h2>

                <div class="scandi-pub-note-container">
                    <span class="scandi-pub-note-label">Note on publication venues</span>
                    <p class="scandi-pub-note-text">In my research area of human–computer interaction, ACM CHI, UIST, DIS, and TOCHI are the most influential venues. CHI is consistently ranked #1 by Google Scholar and Microsoft Academic. Each venue follows a multi-stage, highly selective review process, with submissions evaluated by 4–6 international topic experts and program committee members.</p>
                </div>

                <div class="scandi-pub-filters">
                    <button class="scandi-filter-btn active" onclick="filterPubs('all', this)">All</button>
                    <button class="scandi-filter-btn" onclick="filterPubs('Conference', this)">Conference</button>
                    <button class="scandi-filter-btn" onclick="filterPubs('Journal', this)">Journal</button>
                    <button class="scandi-filter-btn" onclick="filterPubs('Thesis', this)">Thesis</button>
                    <button class="scandi-filter-btn" onclick="filterPubs('Interaction Techniques', this)">Interaction Techniques</button>
                    <button class="scandi-filter-btn" onclick="filterPubs('Robotics', this)">Robotics</button>
                    <button class="scandi-filter-btn" onclick="filterPubs('Sensing', this)">Sensing</button>
                    <button class="scandi-filter-btn" onclick="filterPubs('AI & Computational Design', this)">AI & Computational Design</button>
                </div>

                <div class="scandi-pub-list">
                    ${publicationsHTML}
                </div>
            </div>
        `;
    }

    // Initialize mobile publications on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', renderMobilePublications);
    } else {
        renderMobilePublications();
    }

    // Re-render on window resize to handle device switching
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(renderMobilePublications, 150);
    });
})();
