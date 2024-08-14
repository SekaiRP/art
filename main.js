let currentSearch = "";
let currentPage = 1;
let init = "";
const tg = window.Telegram.WebApp;

const setTheme = ()=>{
  tg.setBackgroundColor('rgba(150, 48, 250, 0.05)');
}

document.addEventListener('DOMContentLoaded', function() {
  if (window.Telegram && window.Telegram.WebApp) {
    setTheme
  }
});

tg.onEvent('themeChanged', setTheme);


const loadMoreBtn = document.getElementById("loadMore")
const notFound = document.getElementById("notFound")
const searchBox = document.getElementById('search');
const suggestions = document.getElementById('suggestions');

const row1 = document.getElementById('row1');
const row2 = document.getElementById('row2');


const searchFunc = async (s, p) => {
  try {
    let q = s.trim().replaceAll(" ","+")
    
    const res = await fetch(`https://sekai-art.keyaru909.workers.dev/search?s=${q}&p=${p}&i=${init}`)
    let data = await res.json()
    
    init = data.init
    return data.data
  } catch (e) {
    return []
  }
}

const suggestFunc = async (q) => {
  try {
    const res = await fetch(`https://sekai-art.keyaru909.workers.dev/suggest?q=${q}`)
    let data = await res.json()
    
    return data
  } catch (e) {
    return []
  }
}

function openTgLink(url){
  tg.openTelegramLink(url)
}

const modalElement = document.getElementById('modal')

const download = (src) => {
  tg.openLink(`http://sekai-art.000.pe/download.php/${src}`)
  /*
  const link = document.createElement('a');
  link.href = `http://sekai-art.000.pe/download.php/${src}`;
  link.download = '';
  link.click();
  */
  
  document.getElementById("modal-info").innerText = "Download Started..."
}

const sendPv = (src) => {
  const link = document.createElement('a');
  link.href = `https://telegram.me/HealXObot?start=${src.replaceAll(".","_")}`;
  console.log(src.replaceAll(".","_"))
  link.click();
  document.getElementById("modal-info").innerText = "Send to Your Bot PV..."
}

const openModal = (image) => {
  document.getElementById("modalImg").src = `https://sekai-art.keyaru909.workers.dev/image/thumbnail/${image.thumbnail.replace(".240",".600")}`
  document.getElementById("downloadBtn").onclick = () => download(`https://sekai-art.keyaru909.workers.dev/image/full/${image.full}`)
  
  document.getElementById("sendBtn").onclick = () => sendPv(image.full)
  
  document.getElementById("modal-info").innerText = ""
  modalElement.style.display = "block";
}

// main 
const loadImages = async () => {
  data = await searchFunc(currentSearch, currentPage)
  if (!data) return;

  data.forEach((image, index) => {
    const img = document.createElement('img');
    img.src = `https://sekai-art.keyaru909.workers.dev/image/thumbnail/${image.thumbnail}`;
    img.onclick = () => openModal(image)
    if (index % 2 === 0) {
      row1.appendChild(img);
    } else {
      row2.appendChild(img);
    }
  });
  document.getElementById("getSearch").style.display = "none"
  if (data.length < 40)
    loadMoreBtn.style.display = "none"
  else
    loadMoreBtn.style.display = "block"
  
  if(currentPage == 1 && data.length == 0)
    notFound.style.display = "block"
  else 
    notFound.style.display = "none"
}



const searchRun = async () => {
  row1.innerText = ""
  row2.innerText = ""
  init = ""
  currentSearch = searchBox.value
  if (currentSearch.length < 3) return;
  loadMoreBtn.style.display = "none"
  await loadImages()
  suggestions.style.display = 'none';
}


const loadMore = async () => {
  currentPage += 1;
  await loadImages()
}

document.getElementById("searchBtn").onclick = searchRun

document.getElementById('closeBtn').onclick = function() {
  modalElement.style.display = "none";
}

window.onclick = (event) => {
  if (event.target == modalElement) {
    document.getElementById('modal').style.display = "none";
  }
}


let selectedSuggestions = [];

searchBox.addEventListener('input', async () => {
  const currentText = searchBox.value.split(/(?<!\S)\s+(?!\S)/); 
  
  const query = currentText.filter(word => !selectedSuggestions.includes(word)).pop(); 
  if (query && query.length >= 3) {
    searchBar.style.borderBottomLeftRadius = 0;
    searchBar.style.borderBottomRightRadius = 0;
    suggestions.style.display = 'block';
    const autocompleteSuggestions = await suggestFunc(query);
    
    suggestions.innerHTML = '';
    autocompleteSuggestions.forEach(suggestion => {
      if (!suggestion) return;
      const sugges = suggestion.split("|");
      const suggestionElement = document.createElement('div');
      suggestionElement.classList.add('autocomplete-suggestion');
      suggestionElement.innerHTML = `<span class="sugges-name">${sugges[0]}</span> <span class="sugges-source">${sugges[2]}</span>`;
      suggestionElement.addEventListener('click', () => {
        selectedSuggestions.push(sugges[0]);
        searchBox.value = selectedSuggestions.join(' ') + ' ';
        suggestions.innerHTML = '';
      });
      suggestions.appendChild(suggestionElement);
    });
  } else {
    suggestions.innerHTML = '';
    searchBar.style.borderBottomLeftRadius = "1em";
    searchBar.style.borderBottomRightRadius = "1em";
  }

  if (searchBox.value.trim() === '') {
    selectedSuggestions = [];
  } else {
    selectedSuggestions = selectedSuggestions.filter(word => currentText.includes(word));
  }
});

const searchBar = document.getElementById("searchBar");

searchBox.addEventListener('focus', () => {
  if (searchBox.value.length >= 3) {
    suggestions.style.display = 'block';
  }
});

searchBox.addEventListener('blur', () => {
  setTimeout(() => {
    suggestions.style.display = 'none';
    searchBar.style.borderBottomLeftRadius = "1em";
    searchBar.style.borderBottomRightRadius = "1em";
  }, 200);
});