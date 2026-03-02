window.SDCheatSheet = window.SDCheatSheet || {};

document.addEventListener('DOMContentLoaded', function (event) {
    if (typeof data === 'undefined' || typeof exclArtists === 'undefined') {
        console.error('Data files not loaded correctly. Ensure data.js and data-excluded-artists.js are included.');
        return;
    }

    // Initialize string-similarity
    window.SDCheatSheet.Search.initStringSimilarity();

    // Fill Export Box
    let starsexport = document.getElementById('starsexport');
    if (starsexport) {
        starsexport.value = window.SDCheatSheet.Storage.getStars();
    }

    // Set CopyCat
    var CopyCatCheckbox = document.getElementById('copycat');
    if (CopyCatCheckbox) {
        if (window.SDCheatSheet.Storage.getCopyCat()) {
            CopyCatCheckbox.checked = true;
        }
        CopyCatCheckbox.addEventListener('click', function (e) {
            window.SDCheatSheet.Storage.setCopyCat(CopyCatCheckbox.checked);
            location.reload();
        });
    }

    // Initialize UI Pages
    var hidepages = window.SDCheatSheet.UI.initPageNavigation();

    // Build Styles
    let { countstyles, tags, searcharray, simplearray } = window.SDCheatSheet.Renderer.buildStyles(data, exclArtists);

    // Build Filters
    window.SDCheatSheet.Renderer.buildFilters(tags);

    // Update Placeholder
    let searchInput = document.getElementById('searchbox');
    if (searchInput) {
        searchInput.placeholder = 'Search ' + countstyles + ' Styles';
    }

    // Setup Copy Listeners
    var spans = document.getElementsByClassName('copyme');
    var categorytags = document.getElementsByClassName('copythecats');
    window.SDCheatSheet.UI.addCopyListener(spans, false);
    window.SDCheatSheet.UI.addCopyListener(categorytags, true);

    // Stylepod active toggles (event delegation could be better, applying directly for now)
    var pods = document.querySelectorAll('.stylepod');
    if (pods) {
        for (var i = 0; i < pods.length; i++) {
            pods[i].addEventListener('click', function (e) {
                var cList = e.target.classList;
                let parentclasses = e.target.parentElement.classList;
                if (cList.contains('copyme') || parentclasses.contains('copythecats') || cList.contains('extralinks') || cList.contains('elsp') || cList.contains('zoomimg') || cList.contains('lookupartist') || cList.contains('starthis') || cList.contains('svg')) { return; }

                this.classList.toggle('active');

                var getnewanker = e.target.id;
                const baseurl = window.location.href.replace(/#.*/, '');
                if (!getnewanker) {
                    history.pushState({}, '', baseurl);
                } else {
                    history.pushState({}, '', baseurl + '#' + getnewanker);
                }

                let thishash = window.location.hash;
                if (thishash) {
                    location.hash = thishash;
                }
            });
        }
    }

    // Star Buts
    function starfunction(e) {
        let stars = window.SDCheatSheet.Storage.getStars();
        if (stars.includes(e)) {
            window.SDCheatSheet.Storage.removeStar(e);
            if (searchInput && searchInput.value == 'Liked') {
                window.SDCheatSheet.Search.liveSearch(searcharray, simplearray);
            }
        } else {
            window.SDCheatSheet.Storage.addStar(e);
        }
        if (starsexport) starsexport.value = window.SDCheatSheet.Storage.getStars();
    }

    var starbuts = document.querySelectorAll('.starthis');
    for (var i = 0; i < starbuts.length; i++) {
        starbuts[i].addEventListener('click', function (e) {
            e.preventDefault();
            let starbutstyledata = this.closest('.stylepod').dataset.creatime;
            starfunction(starbutstyledata);
            this.classList.toggle('stared');
        });
    }

    // Import Styles Logic
    var StyleDialog = document.getElementById('stylesDialog');
    var importBtn = document.getElementById('importstyles');
    var confirmBtn = document.getElementById('stylesDialogConfirm');

    if (importBtn && StyleDialog && confirmBtn) {
        importBtn.addEventListener('click', function (e) {
            StyleDialog.showModal();
        });
        confirmBtn.addEventListener('click', (event) => {
            event.preventDefault();
            StyleDialog.close();
            var eximp = document.getElementById('starsexport').value;
            var sanitizeInput = eximp.replace(/[^\d,]+/g, '');
            var newStyleInputarray = sanitizeInput.split(',').map(n => Number(n)).filter(val => val != 0).map(v => v.toString());
            window.SDCheatSheet.Storage.setStars(newStyleInputarray);
            location.reload();
        });
    }

    // Check Hash
    window.SDCheatSheet.UI.hashCheck();

    // Filters behavior
    var filbut = document.querySelector('.filterbut');
    var catsbox = document.getElementById('allcats');
    if (filbut && catsbox) {
        filbut.onclick = function (e) {
            e.preventDefault();
            filbut.classList.toggle('active');
            catsbox.classList.toggle('show');
        };
    }

    var clearbut = document.getElementById('clearsearch');
    if (clearbut && searchInput) {
        clearbut.onclick = function (e) {
            e.preventDefault();
            searchInput.value = '';
            window.SDCheatSheet.Search.liveSearch(searcharray, simplearray);
        };
    }

    var filters = document.querySelectorAll('#allcats span');
    if (filters) {
        for (var i = 0; i < filters.length; i++) {
            filters[i].addEventListener('click', function (e) {
                if (searchInput) searchInput.value = this.dataset.srch;
                window.SDCheatSheet.Search.liveSearch(searcharray, simplearray);
                if (catsbox) catsbox.classList.toggle('show');
                if (filbut) filbut.classList.toggle('active');
            });
        }
    }

    // LazyLoad
    if (typeof LazyLoad !== 'undefined') {
        window.LL = new LazyLoad({});
    }

    // Search events
    var typingTimer;
    var typeInterval = 500;
    if (searchInput) {
        searchInput.addEventListener('keyup', () => {
            clearTimeout(typingTimer);
            typingTimer = setTimeout(() => { window.SDCheatSheet.Search.liveSearch(searcharray, simplearray); }, typeInterval);
        });
    }

    // Image Ratio Delay
    let ratioInput = document.getElementById('ratiobox');
    if (ratioInput) {
        ratioInput.addEventListener('keyup', () => {
            clearTimeout(typingTimer);
            typingTimer = setTimeout(window.SDCheatSheet.UI.ratioCalc, typeInterval);
        });
    }

    var numlines = document.querySelectorAll('.numberline span');
    if (numlines) {
        for (var i = 0; i < numlines.length; i++) {
            numlines[i].addEventListener('click', function (e) {
                if (ratioInput) ratioInput.value = this.innerText;
                window.SDCheatSheet.UI.ratioCalc();
            });
        }
    }

    // Art History Links
    var artlinks = document.getElementById('arthistory') ? document.getElementById('arthistory').getElementsByTagName('a') : [];
    for (var i = 0; i < artlinks.length; i++) {
        artlinks[i].addEventListener('click', function (e) {
            let lala = this.getAttribute('href');
            let thislalanew = lala.replace('./index.html#', '');
            if (thislalanew) {
                let el = document.getElementById(thislalanew);
                if (el) el.classList.add('active');
            }
            hidepages();
            let stylesLink = document.querySelector('[data-page="styles"]');
            if (stylesLink) stylesLink.classList.add('active');
            let stylesPage = document.getElementById('styles');
            let searchdiv = document.getElementById('suche');
            if (stylesPage) stylesPage.classList.remove('is-hidden');
            if (searchdiv) searchdiv.classList.remove('is-hidden');
        });
    }

    // Init Metadata logic
    window.SDCheatSheet.Metadata.initDragAndDrop();
});
