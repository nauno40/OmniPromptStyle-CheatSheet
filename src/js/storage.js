window.SDCheatSheet = window.SDCheatSheet || {};
window.SDCheatSheet.Storage = (function () {
    function getStars() {
        var mystars = localStorage.getItem('mystars');
        return mystars == null ? [] : JSON.parse(mystars);
    }

    function setStars(stars) {
        localStorage.setItem('mystars', JSON.stringify(stars));
    }

    function addStar(star) {
        var stars = getStars();
        if (!stars.includes(star)) {
            stars.push(star);
            setStars(stars);
        }
    }

    function removeStar(star) {
        var stars = getStars();
        if (stars.includes(star)) {
            let starindex = stars.indexOf(star);
            stars.splice(starindex, 1);
            setStars(stars);
        }
    }

    function getCopyCat() {
        return localStorage.getItem('copycat');
    }

    function setCopyCat(enabled) {
        if (enabled) {
            localStorage.setItem('copycat', '1');
        } else {
            localStorage.removeItem('copycat');
        }
    }

    return {
        getStars,
        setStars,
        addStar,
        removeStar,
        getCopyCat,
        setCopyCat
    };
})();
