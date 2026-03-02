(function () {
    document.addEventListener("DOMContentLoaded", function (event) {
        if (typeof data === 'undefined' || typeof exclArtists === 'undefined') {
            console.error('Data files not loaded');
            return;
        }

        var SearchEngine = 'https://www.google.com/search?q=';
        var outputdata = '';
        var outputExcluded = '';
        var tags = {};
        var countstyles = 0;

        function removedia(e) {
            return e.normalize('NFD').replace(/\p{Diacritic}/gu, '');
        }

        // Build Listed Artists Table
        outputdata += '<table id="listedartists">';
        outputdata += '<tr><th></th><th>Name</th><th>Born</th><th></th><th>Checkpoint</th><th>Categories</th><th>Extrainfo</th></tr>';

        for (var i = 0; i < data.length; i++) {
            let CurrentArtistName = data[i].Name;
            let currentAnchor = removedia(CurrentArtistName);
            currentAnchor = currentAnchor.replace(/[^a-zA-Z]+/g, '-').replace(/^-+/, '').replace(/-+$/, '');
            let catlist = data[i].Category.replace(/\\/g, '');

            const lookupArray = CurrentArtistName.replace(/ *\([^)]*\) */g, "").split(',').map(item => item.trim());
            let LUPart1 = lookupArray[0];
            let LUPart2 = lookupArray[1];
            let LUArtist = LUPart2 ? SearchEngine + LUPart2 + '%20' + LUPart1 : SearchEngine + LUPart1;

            let index = i + 1;
            outputdata += '<tr>';
            outputdata += '<td><a id="' + currentAnchor + '" href="#' + currentAnchor + '">' + index + '</a></td>';
            outputdata += '<td>' + CurrentArtistName + '</td>';
            outputdata += '<td>' + data[i].Born + '</td>';
            outputdata += '<td>' + data[i].Death + '</td>';
            outputdata += '<td>' + data[i].Checkpoint + '</td>';
            outputdata += '<td>' + catlist + '</td>';
            outputdata += '<td>' + data[i].Extrainfo + '</td>';
            outputdata += '</tr>';

            countstyles++;

            let arrrrr = data[i].Category.split(', ');
            arrrrr.forEach(tag => {
                tags[tag] = tags[tag] ? tags[tag] + 1 : 1;
            });
        }
        outputdata += '</table>';

        var putStyles = document.getElementById('allthestyles');
        if (putStyles) putStyles.innerHTML = outputdata;

        // Checkboxes
        var checkers = document.querySelectorAll('input[type=checkbox]');
        checkers.forEach(checker => {
            checker.addEventListener('change', function (e) {
                let id = e.target.id;
                if (this.checked) document.body.classList.add(id);
                else document.body.classList.remove(id);
            });
        });

        // Build Excluded Artists Table
        outputExcluded += '<table id="excludedartists">';
        outputExcluded += '<tr><th></th><th></th><th>Name</th><th>Prompt used</th><th>Extrainfo</th></tr>';

        const titletexts = {
            404: 'Artist not known',
            304: 'Something is recognized, but it\'s not related to the artist',
            301: 'Something is recognized, but results are too different',
            205: 'Artist is recognized, but difficult to prompt/not flexible',
            204: 'Artist is recognized, but too different/generic',
            500: 'Other'
        };

        for (var i = 0; i < exclArtists.length; i++) {
            let CurrentArtistName = exclArtists[i].Name;
            let CurrentCode = exclArtists[i].Code;

            let CompNameWCom = exclArtists[i].FirstName ? exclArtists[i].Name.replace(/\\/g, '') + ', ' + exclArtists[i].FirstName.replace(/\\/g, '') : exclArtists[i].Name.replace(/\\/g, '');
            let CompNameNCom = exclArtists[i].FirstName ? exclArtists[i].FirstName.replace(/\\/g, '') + ' ' + exclArtists[i].Name.replace(/\\/g, '') : exclArtists[i].Name.replace(/\\/g, '');

            let currentAnchor = removedia(CompNameNCom);
            currentAnchor = currentAnchor.replace(/[^a-zA-Z]+/g, '-').replace(/^-+/, '').replace(/-+$/, '');

            let index = i + 1;
            outputExcluded += '<tr>';
            outputExcluded += '<td><a id="' + currentAnchor + '" href="#' + currentAnchor + '">' + index + '</a></td>';
            outputExcluded += '<td class="style-' + exclArtists[i].Code + '"><span title="' + (titletexts[CurrentCode] || titletexts[500]) + '">&#9608;</span></td>';
            outputExcluded += '<td>' + CompNameWCom + '</td>';
            outputExcluded += '<td>' + CompNameNCom + '</td>';
            outputExcluded += '<td>' + exclArtists[i].Extrainfo.replace(/\\/g, '') + '</td>';
            outputExcluded += '</tr>';
        }
        outputExcluded += '</table>';

        var putExcluded = document.getElementById('excludedArtists');
        if (putExcluded) putExcluded.innerHTML = outputExcluded;
    });
})();
