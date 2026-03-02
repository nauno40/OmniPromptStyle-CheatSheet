window.SDCheatSheet = window.SDCheatSheet || {};
window.SDCheatSheet.UI = (function () {
    function showSnackBar() {
        var sb = document.getElementById('snackbar');
        if (sb) {
            sb.className = 'show';
            setTimeout(() => { sb.className = sb.className.replace('show', ''); }, 1500);
        }
    }

    function ratioCalc() {
        let ratioInput = document.getElementById('ratiobox');
        if (!ratioInput) return;
        let imgbasesize = ratioInput.value;
        if (imgbasesize > 0) {
            document.getElementById('ir1b1').innerHTML = imgbasesize + ' &times; ' + imgbasesize;
            document.getElementById('ir2b3').innerHTML = imgbasesize + ' &times; ' + Math.round((imgbasesize / 2) * 3);
            document.getElementById('ir3b4').innerHTML = imgbasesize + ' &times; ' + Math.round((imgbasesize / 3) * 4);
            document.getElementById('ir4b5').innerHTML = imgbasesize + ' &times; ' + Math.round((imgbasesize / 4) * 5);
            document.getElementById('ir16b9').innerHTML = Math.round((imgbasesize / 9) * 16) + ' &times; ' + imgbasesize;
            document.getElementById('ir16b10').innerHTML = Math.round((imgbasesize / 10) * 16) + ' &times; ' + imgbasesize;
            document.getElementById('ir21b9').innerHTML = Math.round((imgbasesize / 9) * 21) + ' &times; ' + imgbasesize;
        }
    }

    function initPageNavigation() {
        var pages = document.querySelectorAll('section');
        var menulinks = document.querySelectorAll('.mbut');
        var searchdiv = document.getElementById('suche');

        function hidepages() {
            if (pages) {
                for (var i = 0; i < pages.length; i++) { pages[i].classList.add('is-hidden'); }
                for (var i = 0; i < menulinks.length; i++) { menulinks[i].classList.remove('active'); }
                if (searchdiv) searchdiv.classList.add('is-hidden');
                let allcats = document.getElementById('allcats');
                if (allcats) allcats.classList.remove('show');
            }
        };

        hidepages();
        if (pages && pages.length > 0) {
            pages[0].classList.remove('is-hidden');
            if (menulinks && menulinks.length > 0) menulinks[0].classList.add('active');
            if (searchdiv) searchdiv.classList.remove('is-hidden');
        };

        if (menulinks) {
            for (var i = 0; i < menulinks.length; i++) {
                menulinks[i].addEventListener('click', function (e) {
                    e.preventDefault();
                    var mldata = this.dataset.page;
                    hidepages();
                    window.scroll(0, 100);
                    let targetPage = document.getElementById(mldata);
                    if (targetPage) targetPage.classList.remove('is-hidden');
                    this.classList.add('active');
                    if (mldata == 'styles' && searchdiv) { searchdiv.classList.remove('is-hidden'); }
                });
            }
        }
        return hidepages;
    }

    function addCopyListener(elements, isTag) {
        for (var i = 0; i < elements.length; i++) {
            elements[i].addEventListener('click', function (e) {
                e.stopPropagation(); // prevent parent clicks like stylepod opening
                var inp = document.createElement('input');
                document.body.appendChild(inp);
                var alttxt = isTag ? this.title : this.innerText;
                inp.value = alttxt;
                inp.select();
                document.execCommand('copy', false);
                inp.remove();
                showSnackBar();
            });
        }
    }

    function hashCheck() {
        if (window.location.hash) {
            let thishash = window.location.hash;
            let thishashnew = thishash.replace('#', '');
            let el = document.getElementById(thishashnew);
            if (el) {
                el.classList.add('active');
                location.hash = thishash;
            }
        }
    }

    return {
        showSnackBar,
        ratioCalc,
        initPageNavigation,
        addCopyListener,
        hashCheck
    };
})();
