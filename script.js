/* script.js */
/* script.js の initApp 関数を以下に書き換え */

async function initApp() {
    try {
        const res = await fetch('nav.html');
        const html = await res.text();
        document.body.insertAdjacentHTML('afterbegin', html);
        
        const path = window.location.pathname.split("/").pop() || "index.html";
        
        // --- スプラッシュ画面の制御 ---
        const splash = document.getElementById('splash-screen');
        // セッション（ブラウザを閉じるまで）で一度も見ていない場合のみ実行
        if (!sessionStorage.getItem('splashed')) {
            splash.style.display = 'flex';
            
            setTimeout(() => {
                splash.classList.add('fade-out');
                // アニメーションが終わったら要素を完全に消す
                setTimeout(() => { splash.style.display = 'none'; }, 800);
            }, 600); // 0.6秒間表示

            sessionStorage.setItem('splashed', 'true'); // 見たことを記録
        } else {
            splash.style.display = 'none'; // 2回目以降は即座に非表示
        }
        // ----------------------------

        // 既存のナビ色・ホーム描画・オーバーレイ処理
        if(path.includes("commissioned")) document.getElementById('link-commissioned')?.classList.add('active');
        if(path.includes("personal")) document.getElementById('link-personal')?.classList.add('active');
        if(path.includes("info")) document.getElementById('link-info')?.classList.add('active');

        renderOverlays();
        if (path === "index.html" || path === "") renderHome();
        
    } catch (e) { console.error(e); }
}

// ホーム画面(index.html)のスライドショー制御
let homeSlideIdx = 0;
let homeSlideTimer = null;

function renderHome() {
    const main = document.getElementById('main-content');
    if (!main) return;

    // 全カテゴリの画像を一つのリストに統合
    const allImages = [...PROJECT_DATA.commissioned, ...PROJECT_DATA.personal];
    
    if (allImages.length === 0) return;

    // スライドショーの土台を作成
    main.innerHTML = `
        <div class="hero-wrapper">
            <img id="home-slide-img" src="${allImages[0].src}" class="hero-image" style="transition: opacity 1.0s ease-in-out;">
            <p id="home-slide-cap" class="hero-caption" style="transition: opacity 1.0s ease-in-out;">${allImages[0].cap}</p>
        </div>
    `;

    const imgEl = document.getElementById('home-slide-img');
    const capEl = document.getElementById('home-slide-cap');

    // 3秒ごとに切り替えるタイマーを設定
    if (homeSlideTimer) clearInterval(homeSlideTimer);
    
    homeSlideTimer = setInterval(() => {
        // フェードアウト
        imgEl.style.opacity = 0;
        capEl.style.opacity = 0;

        setTimeout(() => {
            homeSlideIdx = (homeSlideIdx + 1) % allImages.length;
            imgEl.src = allImages[homeSlideIdx].src;
            capEl.innerText = allImages[homeSlideIdx].cap;

            // フェードイン
            imgEl.style.opacity = 1;
            capEl.style.opacity = 1;
        }, 1000); // 1秒かけて入れ替え
    }, 4000); // 切り替え間隔（4秒ごとに次の画像へ）
}

function renderOverlays() {
    let idxH = ''; let ovH = '';
    for (const sec in PROJECT_DATA) {
        // 全大文字ではなく、頭文字だけ大文字にする (例: Commissioned)
        const title = sec.charAt(0).toUpperCase() + sec.slice(1); 
        
        idxH += `<div class="ov-sec"><h3 class="cat-title">${title}</h3><ul class="idx-list">`;
        ovH += `<div class="ov-sec"><h3 class="cat-title">${title}</h3><div class="ov-grid">`;
        
        PROJECT_DATA[sec].forEach(item => {
            const url = `${sec}.html#${item.id}`;
            idxH += `<li><a href="${url}" onclick="closeAll()">${item.cap}</a></li>`;
            ovH += `<a href="${url}" onclick="closeAll()"><img src="${item.src}"></a>`;
        });
        idxH += `</ul></div>`; ovH += `</div></div>`;
    }
    document.getElementById('index-dynamic-content').innerHTML = idxH;
    document.getElementById('overview-dynamic-content').innerHTML = ovH;
}

function openOverlay(id) { document.getElementById(id).style.display = 'block'; document.body.style.overflow = 'hidden'; }
function closeOverlay(id) { document.getElementById(id).style.display = 'none'; document.body.style.overflow = 'auto'; }
function closeAll() { document.querySelectorAll('.overlay-full').forEach(e => e.style.display = 'none'); document.body.style.overflow = 'auto'; }

window.addEventListener('DOMContentLoaded', initApp);