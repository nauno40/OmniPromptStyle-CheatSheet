window.SDCheatSheet = window.SDCheatSheet || {};
window.SDCheatSheet.Search = (function () {
    var lateststyles = 202310230000;
    var EndOfLastVer120 = 202306072133;
    var EndOfLastVer110 = 202305050000;

    const titletexts = {
        404: 'Artist not known',
        304: 'Something is recognized, but it\'s not related to the artist',
        301: 'Something is recognized, but results are too different',
        205: 'Artist is recognized, but difficult to prompt/not flexible',
        204: 'Artist is recognized, but too different/generic',
        500: 'Other'
    };

    function initStringSimilarity() {
        !function (t, e) { "object" == typeof exports && "object" == typeof module ? module.exports = e() : "function" == typeof define && define.amd ? define([], e) : "object" == typeof exports ? exports.stringSimilarity = e() : t.stringSimilarity = e() }(window, (function () { return t = { 138: t => { function e(t, e) { if ((t = t.replace(/\s+/g, "")) === (e = e.replace(/\s+/g, ""))) return 1; if (t.length < 2 || e.length < 2) return 0; let r = new Map; for (let e = 0; e < t.length - 1; e++) { const n = t.substring(e, e + 2), o = r.has(n) ? r.get(n) + 1 : 1; r.set(n, o) } let n = 0; for (let t = 0; t < e.length - 1; t++) { const o = e.substring(t, t + 2), s = r.has(o) ? r.get(o) : 0; s > 0 && (r.set(o, s - 1), n++) } return 2 * n / (t.length + e.length - 2) } t.exports = { compareTwoStrings: e, findBestMatch: function (t, r) { if (!function (t, e) { return "string" == typeof t && !!Array.isArray(e) && !!e.length && !e.find((function (t) { return "string" != typeof t })) }(t, r)) throw new Error("Bad arguments: First argument should be a string, second should be an array of strings"); const n = []; let o = 0; for (let s = 0; s < r.length; s++) { const i = r[s], f = e(t, i); n.push({ target: i, rating: f }), f > n[o].rating && (o = s) } return { ratings: n, bestMatch: n[o], bestMatchIndex: o } } } } }, e = {}, function r(n) { if (e[n]) return e[n].exports; var o = e[n] = { exports: {} }; return t[n](o, o.exports, r), o.exports }(138); var t, e }));
    }

    function liveSearch(searcharray, simplearray) {
        let searchInput = document.getElementById('searchbox');
        let clearbut = document.getElementById('clearsearch');
        if (!searchInput) return;

        let search_query = searchInput.value;
        let stylebegindate; let styleenddate;
        if (search_query == 'New Styles 1.1.0') { stylebegindate = EndOfLastVer110; styleenddate = EndOfLastVer120; }
        if (search_query == 'New Styles 1.2.0') { stylebegindate = EndOfLastVer120; styleenddate = lateststyles; }
        if (search_query == 'Newest Styles') { stylebegindate = lateststyles; styleenddate = 999999999999; }

        let pods = document.querySelectorAll('.stylepod');
        let mystars = window.SDCheatSheet.Storage.getStars();
        let removedia = window.SDCheatSheet.Renderer.removedia;

        for (var i = 0; i < pods.length; i++) {
            if ((search_query == 'New Styles 1.1.0') || (search_query == 'New Styles 1.2.0') || (search_query == 'Newest Styles')) {
                let currentstyledate = pods[i].dataset.creatime;
                if ((currentstyledate > stylebegindate) && (currentstyledate < styleenddate)) {
                    pods[i].classList.remove('is-hidden');
                    if (clearbut) clearbut.classList.remove('show');
                } else {
                    pods[i].classList.add('is-hidden');
                }
            } else if (search_query == 'Opened Styles') {
                let currentclasses = pods[i].classList.contains('active');
                if (currentclasses) {
                    pods[i].classList.remove('is-hidden');
                    if (clearbut) clearbut.classList.remove('show');
                } else {
                    pods[i].classList.add('is-hidden');
                }
            } else if (search_query == 'Liked') {
                let currentstyledate = pods[i].dataset.creatime;
                if (mystars.includes(currentstyledate)) {
                    pods[i].classList.remove('is-hidden');
                    if (clearbut) clearbut.classList.remove('show');
                } else {
                    pods[i].classList.add('is-hidden');
                }
            } else {
                if (removedia(pods[i].textContent.toLowerCase()).includes(removedia(search_query.toLowerCase()))) {
                    pods[i].classList.remove('is-hidden');
                    if (clearbut) clearbut.classList.remove('show');
                } else {
                    pods[i].classList.add('is-hidden');
                }
            }
            if (search_query && clearbut) { clearbut.classList.add('show'); }
        }

        let countshownstyles = 0;
        let currentpods = document.querySelectorAll('.stylepod');
        for (var i = 0; i < currentpods.length; i++) {
            if (!currentpods[i].classList.contains('is-hidden')) { countshownstyles++; }
        }

        var searchinfo = document.getElementById('searchinfo');
        var notavail = document.getElementById('notavail');
        var matches = window.stringSimilarity ? window.stringSimilarity.findBestMatch(search_query, simplearray) : null;

        var allarrayresults = '';
        var onlyavailable = '';

        if (matches) {
            var getSimilar = [];
            for (var i in matches.ratings) {
                if (matches.ratings[i].rating > 0.4) {
                    getSimilar.push(matches.ratings[i].target);
                }
            }

            for (var i = 0; i < getSimilar.length; i++) {
                var thisperson = searcharray.filter(function (person) { return person.ArtistName == getSimilar[i] });
                if (thisperson.length > 0) {
                    let currentAnchor = removedia(thisperson[0].ArtistName);
                    currentAnchor = currentAnchor.replace(/[^a-zA-Z]+/g, '-').replace(/^-+/, '').replace(/-+$/, '');

                    if (thisperson[0].Status != 200) {
                        let title = titletexts[thisperson[0].Status] || titletexts[500];
                        allarrayresults += '<a href="./only-data.html#' + currentAnchor + '" target="_onlydata" class="ASearchStatus' + thisperson[0].Status + '" title="' + title + '">' + thisperson[0].ArtistName + '</a>';
                    } else {
                        onlyavailable += '<span class="ASearchStatus' + thisperson[0].Status + '">' + thisperson[0].ArtistName + '</span>';
                    }
                }
            }
        }

        if ((countshownstyles != 0) && (search_query != 0)) {
            if (searchinfo) searchinfo.innerHTML = ' - ' + search_query + ' (' + countshownstyles + ')';
            if (notavail) {
                notavail.innerHTML = '';
                if (allarrayresults) notavail.innerHTML = 'Similar names of <a href="./only-data.html#notavailable" class="internal">artists that are unavailable</a>: <span id="naaresults">' + allarrayresults + '</span>';
            }
        } else if ((countshownstyles == 0) && (search_query != 0)) {
            if (searchinfo) searchinfo.innerHTML = '';
            if (notavail) {
                notavail.innerHTML = '';
                if (allarrayresults || onlyavailable) notavail.innerHTML = 'Checking for similar names and <a href="./only-data.html#notavailable" class="internal">artists that are unavailable</a>: <span id="naaresults">' + onlyavailable + allarrayresults + '</span>';
            }
        } else {
            if (searchinfo) searchinfo.innerHTML = '';
            if (notavail) notavail.innerHTML = '';
        }

        var similars = document.getElementsByClassName('ASearchStatus200');
        if (similars) {
            for (var i = 0; i < similars.length; i++) {
                similars[i].addEventListener('click', function () {
                    document.getElementById('searchbox').value = this.innerText;
                    liveSearch(searcharray, simplearray);
                });
            }
        }
    }

    return {
        liveSearch,
        initStringSimilarity
    };
})();
