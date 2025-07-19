document.addEventListener('DOMContentLoaded', function() {
    // === コンテンツのフェードイン処理 ===
    const jobBoxes = document.querySelectorAll('.job-box');
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    jobBoxes.forEach(box => {
        observer.observe(box);
    });


    // === 求人ボックス内の画像スライダー処理 ===
    const sliders = document.querySelectorAll('.job-image-slider');

    sliders.forEach(slider => {
        const slidesContainer = slider.querySelector('.slides');
        const originalSlides = Array.from(slider.querySelectorAll('.slides img')); // 元々のスライド画像 (NodeListをArrayに変換)
        const realSlidesCount = originalSlides.length; // 本物のスライド数

        // スライドが1枚だけの場合は、無限ループやスワイプ操作は不要
        if (realSlidesCount <= 1) {
            slider.querySelector('.prev-slide').style.display = 'none';
            slider.querySelector('.next-slide').style.display = 'none';
            slider.querySelector('.dots').style.display = 'none';
            return; // スライダー処理を終了
        }

        // 無限ループのために最初と最後のスライドを複製して追加
        // 最後のスライドを先頭に追加
        const lastSlideClone = originalSlides[realSlidesCount - 1].cloneNode(true);
        slidesContainer.insertBefore(lastSlideClone, slidesContainer.firstChild);
        // 最初のスライドを最後に追加
        const firstSlideClone = originalSlides[0].cloneNode(true);
        slidesContainer.appendChild(firstSlideClone);

        // クローンを含めたすべてのスライドを再取得
        const allSlides = slider.querySelectorAll('.slides img');
        // 初期表示は本物の最初のスライド (クローン含めた配列ではインデックス1)
        let currentIndex = 1;

        // 初期位置を設定 (本物の最初のスライドを表示)
        slidesContainer.style.transform = `translateX(${-currentIndex * 100}%)`;

        const prevButton = slider.querySelector('.prev-slide');
        const nextButton = slider.querySelector('.next-slide');
        const dotsContainer = slider.querySelector('.dots');

        let slideInterval;
        let startX = 0; // タッチ開始時のX座標
        let isDragging = false; // ドラッグ中かどうか
        let prevTranslate = 0; // 前回のtranslateX値 (ピクセル単位)

        // ドットインジケーターの生成
        function createDots() {
            dotsContainer.innerHTML = '';
            // ドットは本物のスライドの数だけ作成
            for (let i = 0; i < realSlidesCount; i++) {
                const dot = document.createElement('span');
                dot.classList.add('dot');
                if (i === 0) {
                    dot.classList.add('active');
                }
                dot.addEventListener('click', () => {
                    goToSlide(i + 1); // ドットクリック時は本物のスライドのインデックスに合わせる (クローン分を考慮)
                    resetAutoSlide();
                });
                dotsContainer.appendChild(dot);
            }
        }

        // スライドの表示を更新
        function updateSlide(smoothTransition = true) {
            slidesContainer.style.transition = smoothTransition ? 'transform 0.5s ease-in-out' : 'none';
            slidesContainer.style.transform = `translateX(${-currentIndex * 100}%)`;
            updateDots();
        }

        // ドットのアクティブ状態を更新
        function updateDots() {
            const dots = dotsContainer.querySelectorAll('.dot');
            dots.forEach((dot, i) => {
                // 現在のcurrentIndex (クローン含む) を本物のスライドのインデックスにマッピング
                let realIndexForDot = currentIndex - 1;
                if (realIndexForDot === -1) { // クローンされた最後のスライド (インデックス0) の場合
                    realIndexForDot = realSlidesCount - 1;
                } else if (realIndexForDot === realSlidesCount) { // クローンされた最初のスライド (インデックス realSlidesCount + 1) の場合
                    realIndexForDot = 0;
                }

                if (i === realIndexForDot) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        }

        // 指定したインデックスのスライドへ移動
        function goToSlide(index, smoothTransition = true) {
            currentIndex = index;
            updateSlide(smoothTransition);
        }

        // 次のスライドへ
        function nextSlide() {
            goToSlide(currentIndex + 1);
        }

        // 前のスライドへ
        function prevSlide() {
            goToSlide(currentIndex - 1);
        }

        // 自動スライドを開始
        function startAutoSlide() {
            slideInterval = setInterval(nextSlide, 5000); // 3秒ごとにスライド
        }

        // 自動スライドをリセット (手動操作後など)
        function resetAutoSlide() {
            clearInterval(slideInterval);
            startAutoSlide();
        }

        // === スワイプ操作のためのイベントリスナー ===

        // タッチ開始時
        slidesContainer.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX; // タッチ開始X座標を記録
            isDragging = true; // ドラッグ開始
            slidesContainer.style.transition = 'none'; // スワイプ中はトランジションを一時的に無効化
            clearInterval(slideInterval); // 自動スライドを停止

            // 現在のスライドのtranslateX値 (ピクセル単位) を取得
            const currentTransformMatrix = window.getComputedStyle(slidesContainer).transform;
            const matrix = new DOMMatrix(currentTransformMatrix);
            prevTranslate = matrix.m41;
        });

        // タッチ移動時
        slidesContainer.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            const currentX = e.touches[0].clientX; // 現在のX座標
            const diffX = currentX - startX; // 移動距離
            // スライドコンテナを直接移動させる (ピクセル単位)
            slidesContainer.style.transform = `translateX(${prevTranslate + diffX}px)`;
            e.preventDefault(); // 垂直スクロールを防ぐ
        });

        // タッチ終了時
        slidesContainer.addEventListener('touchend', (e) => {
            if (!isDragging) return;
            isDragging = false;

            const movedBy = e.changedTouches[0].clientX - startX; // 最終的な移動距離
            const slideWidth = allSlides[0].offsetWidth; // 1枚のスライドの幅 (ピクセル単位)

            // スワイプの閾値 (例: スライダー幅の20%以上移動したらスワイプと判断)
            const swipeThreshold = slideWidth * 0.2;

            if (movedBy < -swipeThreshold) { // 左方向へのスワイプ (次のスライドへ)
                nextSlide();
            } else if (movedBy > swipeThreshold) { // 右方向へのスワイプ (前のスライドへ)
                prevSlide();
            } else {
                // 閾値に満たない場合は現在のスライドに戻る
                goToSlide(currentIndex); // goToSlideを呼び出し、スムーズなトランジションを適用
            }
            resetAutoSlide(); // 自動スライドをリセット
        });

        // === 無限ループのための transitionend イベントリスナー ===
        // スライドのトランジションが終了した際に、クローンと本物のスライド間で瞬時にジャンプする
        slidesContainer.addEventListener('transitionend', () => {
            // クローンされた最後のスライド (インデックス0) に到達した場合
            if (currentIndex === 0) {
                goToSlide(realSlidesCount, false); // 本物の最後のスライドに瞬時にジャンプ
            }
            // クローンされた最初のスライド (インデックス realSlidesCount + 1) に到達した場合
            else if (currentIndex === realSlidesCount + 1) {
                goToSlide(1, false); // 本物の最初のスライドに瞬時にジャンプ
            }
        });

        // イベントリスナー (ボタンクリック)
        nextButton.addEventListener('click', () => {
            nextSlide();
            resetAutoSlide();
        });

        prevButton.addEventListener('click', () => {
            prevSlide();
            resetAutoSlide();
        });

        // スライダーの初期化処理
        createDots(); // ドットを生成
        startAutoSlide(); // 自動スライドを開始
    });
});
