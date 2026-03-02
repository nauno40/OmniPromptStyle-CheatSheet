window.SDCheatSheet = window.SDCheatSheet || {};
window.SDCheatSheet.Metadata = (function () {
    function initDragAndDrop() {
        var dropArea = document.getElementById('drop-area');
        if (!dropArea) return;

        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, preventDefaults, false);
            document.body.addEventListener(eventName, preventDefaults, false);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            dropArea.addEventListener(eventName, () => dropArea.classList.add('highlight'), false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, () => dropArea.classList.remove('active'), false);
            dropArea.classList.remove('highlight');
        });

        dropArea.addEventListener('drop', handleDrop, false);

        var fileInput = document.getElementById('fileElem');
        if (fileInput) {
            fileInput.addEventListener('change', function () {
                handleFiles(this.files);
            });
        }

        // Remove Metadata Image
        var clearImageBtn = document.getElementById('clearimage');
        if (clearImageBtn) {
            clearImageBtn.addEventListener('click', function (e) {
                let myForm = document.getElementById('my-form');
                if (myForm) myForm.reset();
                let allMetaData = document.getElementById('allMetaData');
                if (allMetaData) allMetaData.innerHTML = '';
                let gallery = document.getElementById('gallery');
                if (gallery) gallery.innerHTML = '';
                let metaBoxes = document.getElementById('metadataboxes');
                if (metaBoxes) metaBoxes.classList.remove('hasimg');
            });
        }
    }

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    function handleDrop(e) {
        var dt = e.dataTransfer;
        var files = dt.files;
        handleFiles(files);
    }

    function handleFiles(files) {
        files = [...files];
        files.forEach(previewFile);
    }

    async function previewFile(file) {
        let reader = new FileReader();
        reader.readAsDataURL(file);

        let metadatawrapper = document.getElementById('metadataboxes');
        let allMetaData = document.getElementById('allMetaData');

        reader.onloadend = function () {
            let img = document.createElement('img');
            img.setAttribute('id', 'thisimg');
            img.src = reader.result;
            let gallery = document.getElementById('gallery');
            if (gallery) {
                gallery.innerHTML = '';
                gallery.appendChild(img);
            }
            if (metadatawrapper) metadatawrapper.classList.add('hasimg');
        };

        if (window.ExifReader) {
            const tags = await ExifReader.load(file).catch(error => {
                if (allMetaData) allMetaData.innerHTML = '<p>No EXIF data detected</p>';
            });
            if (tags) { getComment(tags); }
        } else {
            if (allMetaData) allMetaData.innerHTML = '<p>ExifReader logic is missing</p>';
        }

        function Encode(string) {
            var i = string.length, a = [];
            while (i--) {
                var iC = string[i].charCodeAt();
                if (iC < 65 || iC > 127 || (iC > 90 && iC < 97)) {
                    a[i] = '&#' + iC + ';';
                } else {
                    a[i] = string[i];
                }
            }
            return a.join('');
        }

        function getComment(tags) {
            let com = '';
            if (tags.UserComment) {
                com = decodeUnicode(tags.UserComment.value);
                extractPrompt(com);
                return;
            }
            if (tags.parameters) {
                com = tags.parameters.description;
                extractPrompt(com);
                return;
            }
            if (tags.prompt) {
                com = JSON.parse(tags.prompt.value);
                extractComfyPrompt(com);
                return;
            }

            if (tags && (tags.UserComment === undefined) && (tags.parameters === undefined) && (tags.prompt === undefined)) {
                let tagoutput = '';
                function printValues(obj) {
                    for (var k in obj) {
                        if (!(k == 'value' || k == 'Thumbnail' || k == 'Special Instructions' || k == 'Padding')) {
                            if (obj[k] instanceof Object) {
                                tagoutput = tagoutput + '<br>' + k + ': ';
                                printValues(obj[k]);
                            } else {
                                tagoutput = tagoutput + obj[k] + ' ';
                            }
                        }
                    }
                }
                var test1 = JSON.stringify(tags).replace(/(^,)|(,$)/g, "");
                var tagsobj = JSON.parse(test1);
                printValues(tagsobj);
                if (allMetaData) allMetaData.innerHTML = '<p>No Stable Diffusion EXIF data detected</p><p>' + tagoutput + '</p>';
            }
        }

        function decodeUnicode(array) {
            const plain = array.map(t => t.toString(16).padStart(2, '0')).join('');
            if (!plain.match(/^554e49434f44450/)) {
                return;
            }
            const hex = plain.replace(/^554e49434f44450[0-9]/, '').replace(/[0-9a-f]{4}/g, ',0x$&').replace(/^,/, '');
            const arhex = hex.split(',');
            let decode = '';
            arhex.forEach(v => {
                decode += String.fromCodePoint(v);
            });
            return decode;
        }

        function extractComfyPrompt(com) {
            const noduplicates = [];
            let MDOut = '<p><span><strong>UI</strong> ComfyUI</span>';
            const isObject = (val) => {
                if (val === null) { return false; }
                return typeof val === 'object';
            };

            const nestedObject = (obj) => {
                for (const key in obj) {
                    if (isObject(obj[key])) {
                        nestedObject(obj[key]);
                    } else {
                        if ((isNaN(key) == true) && !noduplicates.includes(key)) {
                            MDOut = MDOut + '<span><strong>' + key + '</strong> ' + obj[key] + '</span>';
                            noduplicates.push(key);
                        }
                    }
                }
            };
            nestedObject(com);
            MDOut += '</p>';
            if (allMetaData) allMetaData.innerHTML = MDOut;
        }

        function extractPrompt(com) {
            const positive = Encode(extractPositivePrompt(com));
            const negative = Encode(extractNegativePrompt(com));
            const others = extractOthers(com);
            const PluginMetaData = Encode(extractPluginData(com));

            if (!positive && !negative && !others) return;
            const prompt = {
                positive: positive,
                negative: negative,
                others: others,
                PMother: PluginMetaData,
                originalMD: com
            };
            makeData(prompt);
        }

        function makeData(prompt) {
            const positive = prompt.positive;
            const negative = prompt.negative;
            const others = prompt.others;
            const PluginMetaData = prompt.PMother;
            const Allothers = others.split(', ');
            let NewOthers = '';
            let UpscaledTo = '';
            const UpscaleFound = Allothers.find(v => v.includes('upscale'));

            for (var i = 0; i < Allothers.length; i++) {
                let oother = Allothers[i].split(':');
                let escapedsecondpart = '';
                if (oother[1]) { escapedsecondpart = Encode(oother[1]); } else { escapedsecondpart = oother[1]; }

                let imgEl = document.getElementById('thisimg');
                let IMGOW = imgEl ? imgEl.naturalWidth : 0;
                let IMGOH = imgEl ? imgEl.naturalHeight : 0;
                if (oother[0] == 'Size' && UpscaleFound) { UpscaledTo = ' <span>[&nearr; ' + IMGOW + 'x' + IMGOH + ']</span>'; } else { UpscaledTo = ''; }

                NewOthers += '<span><strong>' + oother[0] + '</strong>' + escapedsecondpart + UpscaledTo + '</span>';
            }

            let MDOut = '';
            if (positive) MDOut += '<p><strong>Prompt</strong><br>' + positive + '</p>';
            if (negative) MDOut += '<p><strong>Negative Prompt</strong><br>' + negative + '</p>';
            if (NewOthers) MDOut += '<p>' + NewOthers + '</p>';
            if (PluginMetaData) MDOut += '<p><strong>Other Metadata</strong><br>' + PluginMetaData + '</p>';

            let copymetadataprompt = '<span id="copyprompt">' + Encode(prompt.originalMD) + '</span><button id="copypromptbutton">Copy Prompt</button>';

            if (allMetaData) {
                allMetaData.innerHTML = MDOut + copymetadataprompt;
                let copyBtn = document.getElementById('copypromptbutton');
                if (copyBtn) {
                    copyBtn.addEventListener('click', function (e) {
                        var inp = document.createElement('textarea');
                        var cpPrompt = document.getElementById('copyprompt');
                        var txt = cpPrompt ? cpPrompt.innerText : '';
                        document.body.appendChild(inp);
                        inp.value = txt;
                        inp.select();
                        document.execCommand('copy', false);
                        inp.remove();
                        if (window.SDCheatSheet.UI && window.SDCheatSheet.UI.showSnackBar) {
                            window.SDCheatSheet.UI.showSnackBar();
                        }
                    });
                }
            }
        }

        function extractPositivePrompt(text) {
            try {
                let matchtext = text.match(/([^]+)Negative prompt: /) || text.match(/([^]+)Steps: /) || text.match(/([^]+){"steps"/) || text.match(/([^]+)\[[^[]+\]/);
                return matchtext[1];
            } catch (e) {
                return '';
            }
        }

        function extractNegativePrompt(text) {
            try {
                let matchtext = text.match(/Negative prompt: ([^]+)Steps: /) || text.match(/"uc": "([^]+)"}/);
                return matchtext ? matchtext[1] : '';
            } catch (e) {
                return '';
            }
        }

        function extractOthers(text) {
            try {
                let matchtext = text.match(/(Steps: [^]+)/) || text.match(/{("steps"[^]+)"uc": /) || text.match(/\]([^]+)/);
                var separateLines = matchtext[1].match(/[^\r\n]+/g);
                return separateLines[0];
            } catch (e) {
                return text;
            }
        }

        function extractPluginData(text) {
            try {
                let matchtext = text.match(/(Steps: [^]+)/) || text.match(/{("steps"[^]+)"uc": /) || text.match(/\]([^]+)/);
                var separateLines = matchtext[1].match(/[^\r\n]+/g);
                let returnthis = '';
                separateLines.slice(1).forEach(function (value) {
                    returnthis += value;
                });
                return returnthis;
            } catch (e) {
                return text;
            }
        }
    }

    return {
        initDragAndDrop
    };
})();
