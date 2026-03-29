/* script.js */

async function initApp() {
    try {
        const res = await fetch('nav.html');
        const html = await res.text();
        document.body.insertAdjacentHTML('afterbegin', html);
        
        const path = window.location.pathname.split("/").pop() || "index.html";
        
        const splash = document.getElementById('splash-screen');
        if (!sessionStorage.getItem('splashed')) {
            if (splash) {
                splash.style.display = 'flex';
                setTimeout(() => {
                    splash.classList.add('fade-out');
                    setTimeout(() => { splash.style.display = 'none'; }, 1500);
                }, 800);
            }
            sessionStorage.setItem('splashed', 'true');
        } else if (splash) {
            splash.style.display = 'none';
        }

        renderOverlays();
        if (path === "index.html" || path === "") renderHome();
        
        // クローズボタンへのイベントリスナー強制登録（HTMLのonclickが効かない場合の保険）
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('close-btn')) {
                closeAll();
            }
        });
        
    } catch (e) { console.error(e); }
}

let homeSlideIdx = 0;
let homeSlideTimer = null;

/* --- スライドショーの表示順設定 --- */
// 1. まず全データを結合
const rawData = [...PROJECT_DATA.personal, ...PROJECT_DATA.commissioned];

// 2. 先頭に固定したい画像のIDを指定
const firstImageId = 'Stones-4656'; 

// 3. 指定したIDの画像を探し、それ以外と分ける
const firstImg = rawData.find(img => img.id === firstImageId);
const otherImgs = rawData.filter(img => img.id !== firstImageId);

// 4. 配列を再結合（見つからなかった場合の保険付き）
const allImages = firstImg ? [firstImg, ...otherImgs] : rawData;

function renderHome() {
    const main = document.getElementById('main-content');
    if (!main || allImages.length === 0) return;

    main.innerHTML = `
        <div class="hero-wrapper">
            <div class="slide-controls">
                <div class="click-area area-left" id="prev-slide"></div>
                <div class="click-area area-right" id="next-slide"></div>
            </div>
            <img id="home-slide-img" src="${allImages[0].src}" class="hero-image" style="opacity: 1;">
            <p id="home-slide-cap" class="hero-caption" style="opacity: 1;">${allImages[0].cap}</p>
        </div>
    `;

    document.getElementById('prev-slide').addEventListener('click', () => manualChange(-1));
    document.getElementById('next-slide').addEventListener('click', () => manualChange(1));
    startTimer();
}

function startTimer() {
    if (homeSlideTimer) clearInterval(homeSlideTimer);
    homeSlideTimer = setInterval(() => changeSlide(1), 5000);
}

function manualChange(direction) {
    clearInterval(homeSlideTimer);
    
    // 手動クリック時は、アニメーションなしで即座に切り替える
    changeSlide(direction, true); // 第2引数に true を渡す
    
    startTimer();
}

// direction: 進む方向, isManual: 手動かどうか（デフォルトはfalse）
function changeSlide(direction, isManual = false) {
    const imgEl = document.getElementById('home-slide-img');
    const capEl = document.getElementById('home-slide-cap');
    if(!imgEl) return;

    // --- インデックスの更新 (共通) ---
    homeSlideIdx = (homeSlideIdx + direction + allImages.length) % allImages.length;
    const currentItem = allImages[homeSlideIdx];

    // --- ★新しいキャプション生成ロジック ---
    const project = currentItem.project || "Untitled";
    
    // PROJECT_DATA内から、同じプロジェクト名の画像を抽出して順番を計算
    const allData = [...PROJECT_DATA.commissioned, ...PROJECT_DATA.personal];
    const projectImages = allData.filter(item => item.project === project);
    const currentIndex = projectImages.findIndex(item => item.id === currentItem.id) + 1; // 1ベースにする
    const totalImages = projectImages.length;

    // キャプションテキストを作成 "プロジェクト名 — 1/3"
    const newCaption = `${project} - ${currentIndex}/${totalImages}`;


    if (isManual) {
        // --- 手動切り替え (演出なし) ---
        imgEl.style.transition = 'none';
        capEl.style.transition = 'none';
        
        imgEl.src = currentItem.src;
        capEl.innerText = newCaption; // ★新しいキャプションを適用
        
        imgEl.style.opacity = 1;
        capEl.style.opacity = 1;

        setTimeout(() => {
            imgEl.style.transition = 'opacity 0.6s ease-in-out';
            capEl.style.transition = 'opacity 0.6s ease-in-out';
        }, 50);

    } else {
        // --- 自動スライドショー (演出あり) ---
        imgEl.style.opacity = 0;
        capEl.style.opacity = 0;

        setTimeout(() => {
            imgEl.src = currentItem.src;
            capEl.innerText = newCaption; // ★新しいキャプションを適用

            imgEl.style.opacity = 1;
            capEl.style.opacity = 1;
        }, 400); 
    }
}

function renderOverlays() {
    let idxH = ''; let ovH = '';
    for (const sec in PROJECT_DATA) {
        const title = sec.charAt(0).toUpperCase() + sec.slice(1); 
        
        ovH += `<div class="ov-sec"><h3 class="cat-title">${title}</h3><div class="ov-grid">`;
        PROJECT_DATA[sec].forEach(item => {
            const url = `${sec}.html?id=${item.id}`;
            ovH += `
                <a href="${url}" onclick="closeAll()" class="ov-item">
                    <img src="${item.src}">
                    <div class="ov-caption">${item.cap}</div>
                </a>`;
        });
        ovH += `</div></div>`;

        idxH += `<div class="ov-sec"><h3 class="cat-title">${title}</h3><ul class="idx-list">`;
        idxH += genGroupedList(PROJECT_DATA[sec], sec);
        idxH += `</ul></div>`;
    }
    const idxTarget = document.getElementById('index-dynamic-content');
    const ovTarget = document.getElementById('overview-dynamic-content');
    if(idxTarget) idxTarget.innerHTML = idxH;
    if(ovTarget) ovTarget.innerHTML = ovH;
}

function genGroupedList(data, type) {
    const groups = {};
    data.forEach(item => {
        const name = item.project || "Untitled";
        if (!groups[name]) groups[name] = [];
        groups[name].push(item);
    });

    return Object.keys(groups).map(name => {
        const count = groups[name].length;
        const firstId = groups[name][0].id;
        return `
            <li>
                <a href="${type}.html?id=${firstId}" onclick="closeAll()">
                    <span class="idx-name">${name}</span>
                    <span class="idx-count">${count}</span>
                </a>
            </li>`;
    }).join('');
}

function openOverlay(id) { 
    const el = document.getElementById(id);
    if(el) {
        el.style.display = 'block'; 
        document.body.style.overflow = 'hidden'; 
    }
}

function closeAll() { 
    document.querySelectorAll('.overlay-full').forEach(e => e.style.display = 'none'); 
    document.body.style.overflow = 'auto'; 
}

function switchLang(lang) {
    const enContent = document.querySelector('.lang-en');
    const jpContent = document.querySelector('.lang-jp');
    const btnEn = document.getElementById('btn-en');
    const btnJp = document.getElementById('btn-jp');

    if (lang === 'jp') {
        enContent.style.display = 'none';
        jpContent.style.display = 'block';
        btnJp.classList.add('active');
        btnEn.classList.remove('active');
    } else {
        enContent.style.display = 'block';
        jpContent.style.display = 'none';
        btnEn.classList.add('active');
        btnJp.classList.remove('active');
    }
}

window.addEventListener('DOMContentLoaded', initApp);