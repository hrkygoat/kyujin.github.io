document.addEventListener('DOMContentLoaded', function() {
    // === コンテンツのフェードイン処理 ===
    const jobBoxes = document.querySelectorAll('.job-box');
    const observerOptions = {
        root: null, // ビューポートをルートとする
        rootMargin: '0px',
        threshold: 0.1 // 10%が見えたら発火
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // 要素がビューポートに入ったらフェードインクラスを追加
                entry.target.classList.add('fade-in');
                // 一度表示されたら監視を停止（繰り返さないため）
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
        const slides = slider.querySelectorAll('.slides img');
        const prevButton = slider.querySelector('.prev-slide');
        const nextButton = slider.querySelector('.next-slide');
        const dotsContainer = slider.querySelector('.dots');

        let currentIndex = 0;
        let slideInterval; // 自動スライドのインターバルID

        // ドットインジケーターの生成
        function createDots() {
            dotsContainer.innerHTML = ''; // 既存のドットをクリア
            slides.forEach((_, i) => {
                const dot = document.createElement('span');
                dot.classList.add('dot');
                if (i === 0) {
                    dot.classList.add('active');
                }
                dot.addEventListener('click', () => {
                    goToSlide(i);
                    resetAutoSlide(); // 手動操作したら自動スライドをリセット
                });
                dotsContainer.appendChild(dot);
            });
        }

        // スライドの表示を更新
        function updateSlide() {
            slidesContainer.style.transform = `translateX(${-currentIndex * 100}%)`;
            updateDots();
        }

        // ドットのアクティブ状態を更新
        function updateDots() {
            const dots = dotsContainer.querySelectorAll('.dot');
            dots.forEach((dot, i) => {
                if (i === currentIndex) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        }

        // 指定したインデックスのスライドへ移動
        function goToSlide(index) {
            currentIndex = index;
            if (currentIndex >= slides.length) {
                currentIndex = 0;
            } else if (currentIndex < 0) {
                currentIndex = slides.length - 1;
            }
            updateSlide();
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
            // スライドが1枚だけの場合は自動スライドしない
            if (slides.length <= 1) return;
            slideInterval = setInterval(nextSlide, 3000); // 3秒ごとにスライド
        }

        // 自動スライドをリセット (手動操作後など)
        function resetAutoSlide() {
            clearInterval(slideInterval);
            startAutoSlide();
        }

        // イベントリスナー
        nextButton.addEventListener('click', () => {
            nextSlide();
            resetAutoSlide(); // 手動操作したら自動スライドをリセット
        });

        prevButton.addEventListener('click', () => {
            prevSlide();
            resetAutoSlide(); // 手動操作したら自動スライドをリセット
        });

        // 初期化
        createDots();
        startAutoSlide(); // ページ読み込み時に自動スライドを開始
    });
});