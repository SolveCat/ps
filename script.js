document.addEventListener('DOMContentLoaded', () => {
    const introScreen = document.getElementById('intro-screen');
    const introLogoContainer = document.getElementById('logo-container');
    const mainContent = document.getElementById('main-content');
    const panelLogoContainer = document.getElementById('panel-logo-container');
    const contentIframe = document.getElementById('content-iframe');
    const placeholder = document.getElementById('placeholder');
    const buttons = document.querySelectorAll('#buttons-container .pill-button');

    const loaderScreen = document.getElementById('loader-screen');
    const progressBar = document.getElementById('progress-bar');
    const loaderText = document.getElementById('loader-text');

    const loaderMessages = [
        "Ładuję karmę dla kotka",
        "Napełnianie miseczki...",
        "Włączam tryb drapania danych...",
        "Sprawdzam, czy nikt nie widzi kota...",
        "Poleruję futerko interfejsu...",
        "Nastrajam głosik na miauczenie...",
    ];

    // Czas trwania ładowania (w milisekundach)
    const totalLoadTime = 5000; 

    function startLoader() {
        let startTime = Date.now();
        let currentMessageIndex = 0;
        const messageInterval = 1000;
        
        loaderText.textContent = loaderMessages[currentMessageIndex];
        
        const messageTimer = setInterval(() => {
            currentMessageIndex = (currentMessageIndex + 1) % loaderMessages.length;
            loaderText.textContent = loaderMessages[currentMessageIndex];
        }, messageInterval);

        const updateProgress = () => {
            const elapsedTime = Date.now() - startTime;
            let progress = Math.min(100, (elapsedTime / totalLoadTime) * 100);
            progressBar.style.width = `${progress}%`;

            if (elapsedTime < totalLoadTime) {
                requestAnimationFrame(updateProgress); 
            } else {
                clearInterval(messageTimer);
                
                loaderScreen.classList.add('fade-out');
                
                document.body.classList.add('loaded');
                
                setTimeout(() => {
                    loaderScreen.remove();
                }, 500); 
            }
        };

        requestAnimationFrame(updateProgress);
    }
    
    startLoader();


    // --- 1. AKTYWACJA: Przejście z ekranu startowego do aplikacji ---
    introLogoContainer.addEventListener('click', () => {
        introLogoContainer.style.opacity = '0';
        setTimeout(() => {
            introScreen.classList.add('hidden');
            mainContent.classList.add('visible');
        }, 200);
    });

    // --- 2. DEZAKTYWACJA: Powrót do ekranu startowego ---
    panelLogoContainer.addEventListener('click', () => {
        panelLogoContainer.classList.add('returning'); 
        setTimeout(() => {
            mainContent.classList.remove('visible');
            introScreen.classList.remove('hidden');
            setTimeout(() => {
                panelLogoContainer.classList.remove('returning');
                introLogoContainer.style.opacity = '1';
                
                // Reset stanu aplikacji
                contentIframe.src = '';
                contentIframe.style.display = 'none';
                placeholder.style.display = 'block';

                // Usuń klasy filtrów po powrocie
                contentIframe.classList.remove('grayscale-filter', 'color-filter');

            }, 800); 
        }, 500); 
    });

    // --- 3. Obsługa ładowania stron (Nowa logika target/filter) ---
    buttons.forEach(button => {
        button.addEventListener('click', (e) => {
            const url = e.currentTarget.getAttribute('data-url');
            const target = e.currentTarget.getAttribute('data-target'); // 'iframe' lub 'tab'
            const filter = e.currentTarget.getAttribute('data-filter'); // 'color' lub 'grayscale'
            
            if (!url) return;
            
            if (target === 'tab') {
                // Opcja A: Otwarcie w nowej karcie (dla stron blokujących iframes)
                window.open(url, '_blank'); 
            } else {
                // Opcja B: Ładowanie w iFrame
                contentIframe.src = url;
                contentIframe.style.display = 'block';
                placeholder.style.display = 'none';
                
                // ZARZĄDZANIE FILTREM
                // 1. Usuń wszystkie poprzednie filtry
                contentIframe.classList.remove('grayscale-filter', 'color-filter');

                // 2. Dodaj wybrany filtr
                if (filter === 'grayscale') {
                    contentIframe.classList.add('grayscale-filter');
                } else if (filter === 'color') {
                    contentIframe.classList.add('color-filter');
                }
            }
        });
    });
});
