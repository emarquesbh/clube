// static/js/accessibility.js
// Rotina Documentada: Funcionalidades de Acessibilidade
document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('theme-toggle');
    const increaseFontBtn = document.getElementById('increase-font');
    const decreaseFontBtn = document.getElementById('decrease-font');
    const body = document.body;
    let currentFontSizePx;

    // Funções auxiliares para gerenciar o tamanho da fonte
    const getRootFontSize = () => {
        return parseFloat(getComputedStyle(document.documentElement).fontSize);
    };

    const applyFontSize = (sizePx) => {
        body.style.fontSize = `${sizePx}px`;
        localStorage.setItem('fontSizePx', sizePx);
    };

    const loadFontSize = () => {
        const savedFontSizePx = localStorage.getItem('fontSizePx');
        if (savedFontSizePx) {
            currentFontSizePx = parseFloat(savedFontSizePx);
            applyFontSize(currentFontSizePx);
        } else {
            currentFontSizePx = parseFloat(getComputedStyle(body).fontSize);
        }
    };

    // 1. Modo Claro/Escuro
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            body.classList.toggle('dark-mode');
            const newTheme = body.classList.contains('dark-mode') ? 'dark' : 'light';
            localStorage.setItem('theme', newTheme);
            this.setAttribute('aria-label', newTheme === 'dark' ? 'Alternar para modo claro' : 'Alternar para modo escuro');
        });

        // Carrega a preferência de tema ao carregar a página
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            body.classList.add('dark-mode');
            themeToggle.setAttribute('aria-label', 'Alternar para modo claro');
        } else {
            themeToggle.setAttribute('aria-label', 'Alternar para modo escuro');
        }
    }

    // 2. Aumento/Diminuição de Fonte
    loadFontSize();

    if (increaseFontBtn) {
        increaseFontBtn.addEventListener('click', () => {
            if (currentFontSizePx < 24) {
                currentFontSizePx += 1;
                applyFontSize(currentFontSizePx);
            }
        });
    }

    if (decreaseFontBtn) {
        decreaseFontBtn.addEventListener('click', () => {
            if (currentFontSizePx > 14) {
                currentFontSizePx -= 1;
                applyFontSize(currentFontSizePx);
            }
        });
    }

    // 3. Leitura de Texto por Voz (Text-to-Speech - TTS)
    const setupSpeech = () => {
        if ('speechSynthesis' in window) {
            const mainContent = document.querySelector('main #main-content') || 
                               document.querySelector('main') ||
                               document.querySelector('.content-section');
            
            if (mainContent) {
                const readPageButton = document.createElement('button');
                readPageButton.id = 'read-page-button';
                readPageButton.textContent = '🔊 Ler Conteúdo';
                readPageButton.setAttribute('aria-label', 'Ler o conteúdo da página em voz alta');
                readPageButton.style.marginTop = '20px';
                readPageButton.style.padding = '10px 15px';
                readPageButton.style.backgroundColor = '#28a745';
                readPageButton.style.color = 'white';
                readPageButton.style.border = 'none';
                readPageButton.style.borderRadius = '5px';
                readPageButton.style.cursor = 'pointer';
                readPageButton.style.fontSize = '0.9rem';
                readPageButton.style.display = 'block';
                readPageButton.style.marginLeft = 'auto';
                readPageButton.style.marginRight = 'auto';
                readPageButton.style.opacity = '0.9';
                readPageButton.style.transition = 'opacity 0.2s ease';

                readPageButton.addEventListener('click', function() {
                    window.speechSynthesis.cancel();
                    const contentToRead = mainContent.innerText;
                    const utterance = new SpeechSynthesisUtterance(contentToRead);
                    utterance.lang = 'pt-BR';

                    const voices = window.speechSynthesis.getVoices();
                    const ptBrVoice = voices.find(voice => voice.lang === 'pt-BR' && voice.name.includes('Brazil'));
                    if (ptBrVoice) {
                        utterance.voice = ptBrVoice;
                    }

                    window.speechSynthesis.speak(utterance);
                });

                // Navegação por teclado
                readPageButton.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.click();
                    }
                });

                mainContent.appendChild(readPageButton);
            }
        } else {
            console.warn('Speech Synthesis API não é suportada neste navegador.');
        }
    };

    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = setupSpeech;
    } else {
        setupSpeech();
    }
});