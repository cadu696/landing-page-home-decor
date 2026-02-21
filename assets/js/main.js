document.addEventListener('DOMContentLoaded', () => {
    const mobileToggle = document.getElementById('mobile-toggle');
    const nav = document.getElementById('nav');

    if (mobileToggle && nav) {
        mobileToggle.addEventListener('click', () => {
            nav.classList.toggle('active');
        });

        // Fecha o menu ao clicar em um link
        document.querySelectorAll('.nav__link').forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('active');
            });
        });
    }

    // Carrega contatos e sites da API e renderiza no rodapé
    loadFooterContacts();

    // Carrega produtos da API na grid da home
    loadProductsGrid();

    // Carrega projetos na galeria da home
    loadProjectsGrid();
});

function formatPhone(number) {
    // Converte "5547999140885" em "(47) 99914-0885"
    const clean = number.replace(/\D/g, '');
    if (clean.length === 13) {
        return `(${clean.slice(2, 4)}) ${clean.slice(4, 9)}-${clean.slice(9)}`;
    }
    if (clean.length === 12) {
        return `(${clean.slice(2, 4)}) ${clean.slice(4, 8)}-${clean.slice(8)}`;
    }
    return number;
}

const phoneSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>';

// Ícones SVG para redes sociais
const siteIcons = {
    instagram: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>',
    'google maps': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>',
    facebook: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>',
    default: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>'
};

function getSiteIcon(label) {
    const key = (label || '').toLowerCase();
    return siteIcons[key] || siteIcons.default;
}

async function loadProductsGrid() {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    try {
        const res = await fetch('/api/public/products');
        if (!res.ok) return;
        const products = await res.json();
        grid.innerHTML = '';
        products.forEach(function(prod) {
            var imgSrc = prod.image || '';
            if (imgSrc && !imgSrc.startsWith('http') && !imgSrc.startsWith('/')) imgSrc = '/' + imgSrc;
            var isPhoto = imgSrc && !imgSrc.endsWith('.svg');
            var imgClass = isPhoto ? 'product-card__photo' : '';
            var a = document.createElement('a');
            a.href = 'produto.html?id=' + encodeURIComponent(prod.id);
            a.className = 'product-card-link';
            a.innerHTML =
                '<article class="product-card">' +
                    '<div class="product-card__image-wrapper">' +
                        (imgSrc ? '<img class="' + imgClass + '" src="' + imgSrc + '" alt="' + (prod.title || '') + '">' : '') +
                    '</div>' +
                    '<h3 class="product-card__title">' + (prod.title || '') + '</h3>' +
                    '<p class="product-card__desc">' + (prod.desc || '') + '</p>' +
                '</article>';
            grid.appendChild(a);
        });
    } catch (e) {
        // fallback silencioso
    }
}

async function loadProjectsGrid() {
    var grid = document.getElementById('projectsGrid');
    var emptyMsg = document.getElementById('projectsEmpty');
    if (!grid) return;
    try {
        var res = await fetch('/api/public/projects');
        if (!res.ok) return;
        var projects = await res.json();
        grid.innerHTML = '';
        if (!projects || projects.length === 0) {
            if (emptyMsg) emptyMsg.style.display = 'block';
            return;
        }
        if (emptyMsg) emptyMsg.style.display = 'none';
        projects.forEach(function(proj) {
            var imgSrc = proj.image || '';
            if (imgSrc && !imgSrc.startsWith('http') && !imgSrc.startsWith('/')) imgSrc = '/' + imgSrc;
            var a = document.createElement('a');
            a.href = 'projeto-galeria.html?id=' + encodeURIComponent(proj.id);
            a.className = 'gallery__item gallery__project-card';
            if (imgSrc) {
                a.innerHTML = '<img src="' + imgSrc + '" alt="' + (proj.title || '') + '">' +
                    '<div class="gallery__project-overlay"><span>' + (proj.title || '') + '</span></div>';
            } else {
                a.innerHTML = '<div class="gallery__project-overlay gallery__project-overlay--empty"><span>' + (proj.title || '') + '</span></div>';
            }
            grid.appendChild(a);
        });
    } catch (e) {
        // fallback silencioso
    }
}

async function loadFooterContacts() {
    try {
        const res = await fetch('/api/public/contacts');
        if (!res.ok) return;
        const data = await res.json();

        // Renderiza números de telefone
        const numbersContainer = document.getElementById('footer-numbers');
        if (numbersContainer && Array.isArray(data.numbers)) {
            numbersContainer.innerHTML = '';
            data.numbers.forEach((item, idx) => {
                const a = document.createElement('a');
                a.href = '#';
                a.className = 'footer__contact-link js-open-lead-modal';
                a.setAttribute('aria-label', 'WhatsApp ' + formatPhone(item.number));
                if (idx > 0) a.style.marginTop = '10px';
                a.innerHTML = phoneSvg + ' ' + formatPhone(item.number);
                numbersContainer.appendChild(a);
            });
        }

        // Renderiza sites/redes sociais
        const sitesContainer = document.getElementById('footer-sites');
        if (sitesContainer && Array.isArray(data.sites)) {
            sitesContainer.innerHTML = '';
            data.sites.forEach(site => {
                const a = document.createElement('a');
                a.href = site.url;
                a.target = '_blank';
                a.setAttribute('aria-label', site.label);
                a.innerHTML = getSiteIcon(site.label);
                sitesContainer.appendChild(a);
            });
        }
    } catch (e) {
        // Se a API não estiver disponível, mantém o rodapé vazio
    }
}

// ════════════════════════════════════════
// ——  LIGHTBOX (visualização ampliada)
// ════════════════════════════════════════
(function() {
    // Criar elemento do lightbox
    var lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML =
        '<button class="lightbox__close">&times;</button>' +
        '<button class="lightbox__nav lightbox__nav--prev">&#8249;</button>' +
        '<button class="lightbox__nav lightbox__nav--next">&#8250;</button>' +
        '<div class="lightbox__content-wrap"></div>';
    document.body.appendChild(lightbox);

    var contentWrap = lightbox.querySelector('.lightbox__content-wrap');
    var btnClose = lightbox.querySelector('.lightbox__close');
    var btnPrev = lightbox.querySelector('.lightbox__nav--prev');
    var btnNext = lightbox.querySelector('.lightbox__nav--next');
    var currentItems = [];
    var currentIndex = 0;

    function showMedia(src) {
        var isVideo = /\.(mp4|webm|ogg|mov)$/i.test(src);
        contentWrap.innerHTML = '';
        if (isVideo) {
            var video = document.createElement('video');
            video.src = src;
            video.controls = true;
            video.autoplay = true;
            video.className = 'lightbox__content';
            video.style.maxWidth = '90vw';
            video.style.maxHeight = '90vh';
            contentWrap.appendChild(video);
        } else {
            var img = document.createElement('img');
            img.src = src;
            img.className = 'lightbox__content';
            contentWrap.appendChild(img);
        }
        // Mostrar/ocultar setas
        btnPrev.style.display = currentItems.length > 1 ? 'flex' : 'none';
        btnNext.style.display = currentItems.length > 1 ? 'flex' : 'none';
    }

    function openLightbox(items, index) {
        currentItems = items;
        currentIndex = index;
        showMedia(currentItems[currentIndex]);
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
        // Parar vídeo se estiver tocando
        var video = contentWrap.querySelector('video');
        if (video) video.pause();
        contentWrap.innerHTML = '';
    }

    function navigate(dir) {
        // Parar vídeo atual
        var video = contentWrap.querySelector('video');
        if (video) video.pause();
        currentIndex = (currentIndex + dir + currentItems.length) % currentItems.length;
        showMedia(currentItems[currentIndex]);
    }

    btnClose.addEventListener('click', function(e) { e.stopPropagation(); closeLightbox(); });
    btnPrev.addEventListener('click', function(e) { e.stopPropagation(); navigate(-1); });
    btnNext.addEventListener('click', function(e) { e.stopPropagation(); navigate(1); });
    lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox) closeLightbox();
    });

    // Teclado: Esc fecha, setas navegam
    document.addEventListener('keydown', function(e) {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') navigate(-1);
        if (e.key === 'ArrowRight') navigate(1);
    });

    // Delegação de eventos: clicar em imagem/vídeo dentro de .collection__grid ou .gallery__grid
    document.addEventListener('click', function(e) {
        var mediaEl = e.target.closest('.collection__item img, .collection__item video');
        if (!mediaEl) return;
        e.preventDefault();
        e.stopPropagation();

        var grid = mediaEl.closest('.collection__grid, .gallery__grid');
        if (!grid) return;

        // Coletar todas as mídias da grid
        var allMedia = [];
        var clickedIdx = 0;
        grid.querySelectorAll('.collection__item img, .collection__item video').forEach(function(el, i) {
            allMedia.push(el.src);
            if (el === mediaEl) clickedIdx = i;
        });

        if (allMedia.length > 0) openLightbox(allMedia, clickedIdx);
    });
})();
