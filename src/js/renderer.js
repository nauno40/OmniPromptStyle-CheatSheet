window.SDCheatSheet = window.SDCheatSheet || {};
window.SDCheatSheet.Renderer = (function () {
    var SearchEngine = 'https://www.google.com/search?q=';

    function removedia(e) {
        return e.normalize('NFD').replace(/\p{Diacritic}/gu, '');
    }

    function buildStyles(dataList, exclArtistsList) {
        var mystars = window.SDCheatSheet.Storage.getStars();
        var copyCat = window.SDCheatSheet.Storage.getCopyCat();
        var outputdata = '';
        var tags = {};
        var countstyles = 0;
        var searcharray = [];
        var simplearray = [];

        for (var i = 0; i < dataList.length; i++) {
            if (dataList[i].Type == 1) {
                let CurrentArtistName = dataList[i].Name;
                let currentAnchor = removedia(CurrentArtistName);
                currentAnchor = currentAnchor.replace(/[^a-zA-Z]+/g, '-').replace(/^-+/, '').replace(/-+$/, '');
                let catlist = dataList[i].Category.replace(/\\/g, '');

                let buildcatlist = catlist.split(',');
                let buildcatlistoutput = '';
                buildcatlist.forEach(function (value) {
                    buildcatlistoutput += '<span>' + value.trim() + '</span>';
                });

                let deathdate = dataList[i].Death;
                let dagger = deathdate != false ? '<sup> &dagger;</sup>' : '';

                const lookupArray = CurrentArtistName.replace(/ *\([^)]*\) */g, '').split(',').map(item => item.trim());
                let LUPart1 = lookupArray[0];
                let LUPart2 = lookupArray[1];
                let LUArtistURL = LUPart2 ? SearchEngine + LUPart2 + '%20' + LUPart1 : SearchEngine + LUPart1;
                let LUArtistName = LUPart2 ? LUPart2 + ' ' + LUPart1 : LUPart1;

                let stylestar = mystars.includes(dataList[i].Creation) ? ' stared' : '';
                let extraclass = copyCat ? ' copythecats' : '';

                outputdata += '<div id="' + currentAnchor + '" class="stylepod lazy" data-creatime="' + dataList[i].Creation + '" data-bg="./img/' + dataList[i].Image + '">';
                outputdata += '<div class="styleinfo">';
                outputdata += '<h3 title="' + dataList[i].Name + '">' + dataList[i].Name + dagger + '</h3>';
                outputdata += '<div class="more">';
                outputdata += '<p class="category' + extraclass + '" title="' + catlist + '"><span class="checkpointname">' + dataList[i].Checkpoint + '</span>' + buildcatlistoutput + '</p>';
                outputdata += '<span class="clicklinks"><fieldset><legend>Copy Prompt</legend><span class="copyme">' + dataList[i].Prompt + '</span></fieldset>';
                outputdata += '<p class="extralinks"><a class="zoomimg" title="Zoom" href="./img/' + dataList[i].Image + '" target="_blank"><img src="./src/zoom-white.svg" width="25" alt="Zoom"><span class="elsp">Zoom</span></a><a href="' + LUArtistURL + '" title="Look Up Artist" target="_blank" class="lookupartist"><img src="./src/magnifying-glass-white.svg" width="25" alt="Look Up Artist"><span class="elsp">Look Up</span></a><a class="starthis' + stylestar + '" title="Mark as Favorite"><img class="svg" src="./src/heart-outline-white.svg" width="25" title="Mark as Favorite"></a></p></span>';
                outputdata += '</div></div>';
                outputdata += '<div class="gallery"><figure><figcaption></figcaption></figure><figure></figure><figure></figure><figure></figure></div></div>';

                countstyles++;

                let arrrrr = dataList[i].Category.split(', ');
                arrrrr.forEach(tag => {
                    tags[tag] = tags[tag] ? tags[tag] + 1 : 1;
                });

                searcharray.push({ 'ArtistName': LUArtistName, 'Status': 200 });
                simplearray.push(LUArtistName);
            }
        }

        for (var i = 0; i < exclArtistsList.length; i++) {
            let LUPart1 = exclArtistsList[i].Name;
            let LUPart2 = exclArtistsList[i].FirstName;
            let LUArtistName = LUPart2 ? LUPart2 + ' ' + LUPart1 : LUPart1;
            let AStatus = exclArtistsList[i].Code;

            searcharray.push({ 'ArtistName': LUArtistName, 'Status': AStatus });
            simplearray.push(LUArtistName);
        }

        var putStyles = document.getElementById('allthestyles');
        if (putStyles) {
            putStyles.innerHTML = outputdata;
        }

        return { countstyles, tags, searcharray, simplearray };
    }

    function buildFilters(tags) {
        var DontShowAnyCountries = ['Blizzard', 'DC Comics', 'Disney', 'Marvel', 'MTG', 'Tolkien', 'Oil', 'Painting', 'Illustration', 'Portrait', 'Character Design', 'Cover Art', 'Print', 'Concept Art', 'Ireland', 'Scotland', 'Norway', 'Mexico', 'Lithuania', 'Sweden', 'South Korea', 'Portugal', 'Switzerland', 'USA', 'Ukraine', 'Belarus', 'Spain', 'Brazil', 'Denmark', 'Japan', 'Austria', 'France', 'Philippines', 'UK', 'Poland', 'Germany', 'Canada', 'Netherlands', 'Italy', 'Israel', 'Taiwan', 'Belgium', 'Russia', 'Australia', 'Czech Republic', 'Bulgaria', 'Turkey', 'China'];
        var catsbox = document.getElementById('allcats');
        var FilterOutput = '';

        var sortedKeys = Object.keys(tags).sort().reduce((objEntries, key) => {
            objEntries[key] = tags[key];
            return objEntries;
        }, {});

        Object.keys(sortedKeys).forEach(key => {
            if (sortedKeys[key] > 4 && !DontShowAnyCountries.includes(key)) {
                let filtername = key.replace(/\\/g, '');
                FilterOutput += '<span data-srch="' + filtername + '">' + filtername + ' <span>' + sortedKeys[key] + '</span></span>';
            }
        });

        FilterOutput += '<span class="specialfilters" data-srch="Newest Styles">Newest Styles</span><span class="specialfilters" data-srch="New Styles 1.2.0">New with 1.2.0</span><span class="specialfilters" data-srch="New Styles 1.1.0">New with 1.1.0</span><span class="specialfilters" data-srch="Opened Styles">Currently Opened Styles</span><span class="specialfilters" data-srch="Liked">Liked <span><img class="svg" src="./src/heart-outline.svg" width="12"></span></span><span class="specialfilters" data-srch="&dagger;">Only Deceased Artists <span>&dagger;</span></span>';

        if (catsbox) {
            catsbox.innerHTML = FilterOutput;
        }
    }

    return {
        buildStyles,
        buildFilters,
        removedia
    };
})();
