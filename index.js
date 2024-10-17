var kotoli = {
    kotoli: []
};

var displayMode = undefined;
var currentTheme = undefined;

function levenshteinDistance(a, b){
    let aLen = a.length+1, bLen = b.length+1;
    let board = [];
    for(let i=0;i<aLen*bLen;i++)board.push(0);

    for(let i=1;i<aLen;i++) board[i] = i;
    for(let j=1;j<bLen;j++) board[j*aLen] = j;
  
    for(let i=1;i<aLen;i++) for(let j=1;j<bLen;j++){
        board[i + j*aLen] = Math.min(Math.min(board[i-1 + j*aLen]     + 1,
                                              board[i   + (j-1)*aLen] + 1),
                                              board[i-1 + (j-1)*aLen] + (a[i-1] != b[j-1]));
    }

    return board[aLen-1 + (bLen-1)*aLen];
}

function spawnElements(){
    if ('serviceWorker' in navigator){
        navigator.serviceWorker.register('serviceWorker.js');
    }

    let topBar = document.createElement('div');
    topBar.classList.add("topBar");
    let searchBar = document.createElement('input');
    searchBar.classList.add("searchBar");
    searchBar.placeholder = "Da sukha...";
    searchBar.oninput = updateSearch;
    topBar.appendChild(searchBar);

    document.body.querySelector('#mainContent').appendChild(topBar);

    let noCodeAlert = document.createElement('p');
    noCodeAlert.appendChild(document.createElement('center'));
    noCodeAlert.querySelector('center').innerHTML += 'Da se <a href="https://github.com/Ric3cir121/RicKotoli">Ric3cir121/RicKotoli</a> na Github, os <a href="kotoli.json">kotoli.json</a>';
    document.body.querySelector('#mainContent').appendChild(noCodeAlert);

    let searchResultsContainer = document.createElement('div');
    searchResultsContainer.id = 'searchResultsContainer';
    document.getElementById('mainContent').appendChild(searchResultsContainer);
}
function openKotoba(kotobaId){
    let result = document.getElementById('result');
    if(result){
        result.remove();
    }

    let kotoba = kotoli.kotoli[kotobaId];

    result = document.createElement('div');
    result.id = 'result';

    let alRisonen = '';
    if(kotoba.risonen)
    for(let risonen of kotoba.risonen) alRisonen += risonen;
    let alKotobara = '';
    for(let kotobara of kotoba.kotobara.slice(1)) alKotobara += kotobara + ', ';
    if(alKotobara.length >= 2)alKotobara = alKotobara.slice(0,-2);

    result.innerHTML  = '<div class="resultTop"> <div class="resultTopLeft"> <div class="button closeKotobaButton" onclick="closeKotoba();"><image src="icons/close.svg" class="buttonImage"></div>'
                      + '<div class="resultTitle">' + kotoba.kotobara[0] + '</div> </div> <div class="resultRisonen">' + alRisonen + '</div> </div>';
    result.innerHTML += '<div class="resultKotobara">' + alKotobara + '</div>';

    if(kotoba.mahaNa)  result.innerHTML += '<div class="resultTab">Maha na:</div>' + kotoba.mahaNa.join(' + ');
    if(kotoba.fal)     result.innerHTML += '<div class="resultTab">Fal:</div>' + kotoba.fal;
    if(kotoba.imi)     result.innerHTML += '<div class="resultTab">Imi:</div>' + kotoba.imi.replaceAll('\n','<br>');

    if(kotoba.sama)    result.innerHTML += '<div class="resultTab">= Sama:</div>' + kotoba.sama.join(', ');
    if(kotoba.lik)     result.innerHTML += '<div class="resultTab">≈ Lik:</div>' + kotoba.lik.join(', ');
    if(kotoba.aparLik) result.innerHTML += '<div class="resultTab">Apar lik:</div>' + kotoba.aparLik.join(', ');
    if(kotoba.kundr)   result.innerHTML += '<div class="resultTab">Kundr:</div>' + kotoba.kundr.join(', ');

    if(kotoba.opetara) result.innerHTML += '<div class="resultTab">Opetara:</div> <ul><li>' + kotoba.opetara.join('</li><li>').replaceAll('\n','<br>') + '</li></ul>';
    //if(kotoba.riso)    result.innerHTML += '<div class="resultTab">Riso:</div>' + kotoba.riso;
    if(kotoba.anderKotobara) result.innerHTML += '<div class="resultTab">Ander kotobara:</div>' + kotoba.anderKotobara.join(', ');

    if(displayMode == 'desktop'){
        result.classList.add('resultOnBar');
        document.querySelector('.topBar').appendChild(result);
    }else{
        result.classList.add('resultOnMain');
        document.getElementById('mainContent').prepend(result);
    }
}
function closeKotoba(){
    let result = document.getElementById('result');
    if(result){
        result.remove();
    }
}
function sanitize(text){
    return text.replaceAll('&', '&amp').replaceAll('<', '&lt').replaceAll('>', '&gt')
}
function updateSearch(){
    let input = document.querySelector('.searchBar').value ?? "";
    kotobaraLibre = kotoli.kotoli.slice()
    if(input){
        let kotobaScore = {}
        for(let result of kotobaraLibre){
            score = Infinity;
            for(let kotoba of result.kotobara)
                score = Math.min(score, levenshteinDistance(input.toLowerCase(), kotoba.toLowerCase()) - (kotoba.length - input.length) * .9);
            kotobaScore[result.kotobara[0]] = score;
        }
        kotobaraLibre.sort((a,b) => (kotobaScore[a.kotobara[0]] > kotobaScore[b.kotobara[0]]) -.5);
        let badScore = 0;
        for(badScore=0; badScore<kotobaraLibre.length; badScore++)
            if(kotobaScore[kotobaraLibre[badScore].kotobara[0]] > 3)break;
        kotobaraLibre = kotobaraLibre.slice(0,badScore);
    } else {
        kotobaraLibre.sort((a,b) => (a.kotobara[0].toLowerCase() > b.kotobara[0].toLowerCase()) -.5);
    }
    let searchResultsContainer = document.querySelector('#searchResultsContainer');
    searchResultsContainer.innerHTML = '';
    for(let i=0; i<kotobaraLibre.length; i++){
        let searchResult = document.createElement('div');
        searchResult.classList.add("searchResult");
        searchResult.onclick = ()=>{openKotoba(kotobaraLibre[i].id);};
        let kotoba = sanitize(kotobaraLibre[i].kotobara[0]);
        if(kotobaraLibre[i].fal) kotoba += ' (' + sanitize(kotobaraLibre[i].fal) + ')';
        kotoba = '<div class="kotoba">' + kotoba + '</div>';

        let alRisonen = '';
        if(kotobaraLibre[i].risonen)
        for(let risonen of kotobaraLibre[i].risonen) alRisonen += sanitize(risonen);
        alRisonen = '<div class="risonen">' + alRisonen + '</div>';

        searchResult.innerHTML += '<div class="kotobaTop">' + kotoba + alRisonen + '</div>';

        let alKotobara = '';
        for(let kotobara of kotobaraLibre[i].kotobara.slice(1)) alKotobara += sanitize(kotobara) + ", ";
        if(alKotobara.length >= 2)alKotobara = alKotobara.slice(0,-2);
        searchResult.innerHTML += '<div class="kotobara">' + alKotobara + '</div>';

        let resultExtra = '';

        if(kotobaraLibre[i].mahaNa)  resultExtra += '<b>Maha na:</b> ' + kotobaraLibre[i].mahaNa.join(' + ') + '<br>';
    
        if(kotobaraLibre[i].sama)    resultExtra += '<b>= Sama:</b> ' + kotobaraLibre[i].sama.join(', ') + '<br>';
        if(kotobaraLibre[i].lik)     resultExtra += '<b>≈ Lik:</b> ' + kotobaraLibre[i].lik.join(', ') + '<br>';
        if(kotobaraLibre[i].aparLik) resultExtra += '<b>Apar lik:</b> ' + kotobaraLibre[i].aparLik.join(', ') + '<br>';
        if(kotobaraLibre[i].kundr)   resultExtra += '<b>Kundr:</b> ' + kotobaraLibre[i].kundr.join(', ') + '<br>';

        searchResult.innerHTML += '<div class="resultExtra">' + resultExtra + '</div>';

        searchResultsContainer.appendChild(searchResult);
    }
}
function setViewMode(mode){
    displayMode = mode;
    if(mode == 'desktop'){
        let topBar = document.body.querySelector('.topBar');
        let mainContent = document.getElementById('mainContent');
        topBar.style.width = '4in';
        topBar.style.bottom = '0%';
        document.body.style['margin-left'] = '4in';
        document.body.style.removeProperty('margin-top');
        document.body.height = '100%';
        mainContent.style.width = 'calc(100% - 4in)';
        mainContent.style.height = '100%';
        let result = document.getElementById('result');
        if(result){
            result.classList.add('resultOnBar');
            result.classList.remove('resultOnMain');
            document.querySelector('.topBar').appendChild(result);
        }
    }else if(mode == 'mobile'){
        let topBar = document.querySelector('.topBar');
        let mainContent = document.getElementById('mainContent');
        topBar.style.width = '100%';
        topBar.style.removeProperty('bottom');
        document.body.style.removeProperty('margin-left');
        document.body.style['margin-top'] = '.68in';
        document.body.height = 'calc(100% - .68in)';
        mainContent.style.width = '100%';
        mainContent.style.height = 'calc(100% - .68in)';
        let result = document.getElementById('result');
        if(result){
            result.classList.remove('resultOnBar');
            result.classList.add('resultOnMain');
            document.getElementById('mainContent').prepend(result);
        }
    }
}
function setTheme(theme){
    if(theme == currentTheme)return;
    currentTheme = theme;
    if(theme == 'dark'){
        let stylesheet = document.getElementById('themedStyle');
        if(stylesheet){
            stylesheet.remove();
        }
        stylesheet = document.createElement('style');
        stylesheet.id = 'themedStyle';

        stylesheet.innerHTML = `
        body {
            background-color: #101010;
            color: #ffffff;
        }
        .topBar {
            background-color: #1b1b1b;
            box-shadow: 0in .01in .1in #00000020;
        }
        .resultOnMain {
            background-color: #1b1b1b;
            box-shadow: 0in .01in .1in #00000020;
        }

        .resultTab {
            border-top-color: #303030;
        }
        .buttonImage {
            filter: brightness(1);
        }
        
        .searchBar {
            background-color: #303030;
            color: #ffffff;
            box-shadow: 0in .01in .1in #00000040;
        }

        .searchBar:focus {
            outline-color: #0080ff;
        }

        .searchBar:placeholder {
            color: #ffffff;
        }

        .searchResult{
            background-color: #1b1b1b;
            box-shadow: 0in .01in .1in #00000020;
        }`;

        document.head.append(stylesheet);
    }else if(theme == 'light'){
        let stylesheet = document.getElementById('themedStyle');
        if(stylesheet){
            stylesheet.remove();
        }
        stylesheet = document.createElement('style');
        stylesheet.id = 'themedStyle';

        stylesheet.innerHTML = `
        body {
            background-color: #ffffff;
            color: #101010;
        }
        .topBar {
            background-color: #f0f0f0;
            box-shadow: 0in .01in .1in #00000010;
        }
        .resultOnMain {
            background-color: #f0f0f0;
            box-shadow: 0in .01in .1in #00000010;
        }

        .resultTab {
            border-top-color: #e0e0e0;
        }
        .buttonImage {
            filter: brightness(.08);
        }
        
        .searchBar {
            background-color: #e0e0e0;
            color: #101010;
            box-shadow: 0in .01in .1in #00000020;
        }

        .searchBar:focus {
            outline-color: #0080ff;
        }

        .searchBar:placeholder {
            color: #101010;
        }

        .searchResult{
            background-color: #f0f0f0;
            box-shadow: 0in .01in .1in #00000010;
        }`;

        document.head.append(stylesheet);
    }
}
function addSmoothTheme(){
    let smoothTheme = document.createElement('style');
    smoothTheme.innerHTML = '* {transition: color .4s ease-in-out; transition: background-color .4s ease-in-out;}';
    document.head.appendChild(smoothTheme);
}
function autoSetView(){
    let inchWidth = window.innerWidth / document.querySelector('#inchMeter').offsetWidth;
    if (inchWidth < 11.15){
        setViewMode('mobile');
    } else {
        setViewMode('desktop');
    }
}
function autoSetTheme(){
    if (window.matchMedia("(prefers-color-scheme: dark)").matches){
        setTheme('dark');
    }else{
        setTheme('light');
    }
}
async function updateKotoli(){
    kotoli = await (await fetch('kotoli.json')).json();
    for(let i=0; i<kotoli.kotoli.length; i++){
        kotoli.kotoli[i].id = i;
    }
    updateSearch();
}

addEventListener("load", (event) => {
    spawnElements();
    autoSetView();
    autoSetTheme();
    updateKotoli();

    let interval = 0;
    setInterval(()=>{
        autoSetTheme();
        if(interval == 1){
            addSmoothTheme();
        }
        interval++;
    },100);
});

addEventListener("resize", (event) => {
    autoSetView();
});