/* script.js */

async function initApp() {
    try {
        const res = await fetch('nav.html');
        const html = await res.text();
        document.body.insertAdjacentHTML('afterbegin', html);
        
        const path = window.location.pathname.split("/").pop() || "index.html";
        
        // --- スプラッシュ画面の制御 ---
        const splash = document.getElementById('splash-screen');
        if (!sessionStorage.getItem('splashed')) {
            splash.style.display = 'flex';
            setTimeout(() => {
                splash.classList.add('fade-out');
                setTimeout(() => { splash.style.display = 'none'; }, 1500);
            }, 800);
            sessionStorage.setItem('splashed', 'true');
        } else {
            splash.style.display = 'none';
        }

        renderOverlays();
        if (path === "index.html" || path === "") renderHome();
        
    } catch (e) { console.error(e); }
}

// --- ホーム画面(index.html)のスライドショー制御 ---
let homeSlideIdx = 0;
let homeSlideTimer = null;
const allImages = [...PROJECT_DATA.commissioned, ...PROJECT_DATA.personal];

function renderHome() {
    const main = document.getElementById('main-content');
    if (!main || allImages.length === 0) return;

    // クリックエリア（左右）をHTMLに追加
    main.innerHTML = `
        <div class="hero-wrapper">
            <div class="slide-controls">
                <div class="click-area area-left" id="prev-slide"></div>
                <div class="click-area area-right" id="next-slide"></div>
            </div>
            <img id="home-slide-img" src="${allImages[0].src}" class="hero-image" style="opacity: 1; transition: opacity 1.0s ease-in-out;">
            <p id="home-slide-cap" class="hero-caption" style="opacity: 1; transition: opacity 1.0s ease-in-out;">${allImages[0].cap}</p>
        </div>
    `;

    // イベントリスナー登録
    document.getElementById('prev-slide').addEventListener('click', () => manualChange(-1));
    document.getElementById('next-slide').addEventListener('click', () => manualChange(1));

    startTimer();
}

function startTimer() {
    if (homeSlideTimer) clearInterval(homeSlideTimer);
    homeSlideTimer = setInterval(() => changeSlide(1), 5000); // 5秒ごとに自動切り替え
}

function manualChange(direction) {
    clearInterval(homeSlideTimer); // 手動クリック時はタイマーをリセット
    changeSlide(direction);
    startTimer(); // 再開
}

function changeSlide(direction) {
    const imgEl = document.getElementById('home-slide-img');
    const capEl = document.getElementById('home-slide-cap');
    if(!imgEl) return;

    // 1. まず完全に透明にする（0.6sのTransitionが効く）
    imgEl.style.opacity = 0;
    capEl.style.opacity = 0;

    // 2. CSSのtransition時間（0.6s）と同じタイミングで中身を入れ替える
    setTimeout(() => {
        homeSlideIdx = (homeSlideIdx + direction + allImages.length) % allImages.length;
        
        // 画像を差し替え
        imgEl.src = allImages[homeSlideIdx].src;
        capEl.innerText = allImages[homeSlideIdx].cap;

        // 3. 差し替えた瞬間に不透明度を1に戻す
        imgEl.style.opacity = 1;
        capEl.style.opacity = 1;
    }, 600); // ここをCSSのtransition(0.6s)と完全に一致させるのがポイント
}

// --- オーバーレイ表示（Overviewにホバー用の構造を追加） ---
function renderOverlays() {
    let idxH = ''; let ovH = '';
    for (const sec in PROJECT_DATA) {
        const title = sec.charAt(0).toUpperCase() + sec.slice(1); 
        
        idxH += `<div class="ov-sec"><h3 class="cat-title">${title}</h3><ul class="idx-list">`;
        ovH += `<div class="ov-sec"><h3 class="cat-title">${title}</h3><div class="ov-grid">`;
        
        PROJECT_DATA[sec].forEach(item => {
            const url = `${sec}.html#${item.id}`;
            idxH += `<li><a href="${url}" onclick="closeAll()">${item.cap}</a></li>`;
            
            // Overviewの画像をコンテナで囲む（キャプションホバー用）
            ovH += `
                <a href="${url}" onclick="closeAll()" class="ov-item">
                    <img src="${item.src}">
                    <div class="ov-caption">${item.cap}</div>
                </a>`;
        });
        idxH += `</ul></div>`; ovH += `</div></div>`;
    }
    const idxTarget = document.getElementById('index-dynamic-content');
    const ovTarget = document.getElementById('overview-dynamic-content');
    if(idxTarget) idxTarget.innerHTML = idxH;
    if(ovTarget) ovTarget.innerHTML = ovH;
}

function openOverlay(id) { document.getElementById(id).style.display = 'block'; document.body.style.overflow = 'hidden'; }
function closeOverlay(id) { document.getElementById(id).style.display = 'none'; document.body.style.overflow = 'auto'; }
function closeAll() { document.querySelectorAll('.overlay-full').forEach(e => e.style.display = 'none'); document.body.style.overflow = 'auto'; }

window.addEventListener('DOMContentLoaded', initApp);