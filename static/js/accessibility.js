/* static/js/accessibility.js */
/**
 * CLUBE DA AMIZADE PE. ANTÔNIO GONÇALVES
 * Funcionalidades de Acessibilidade - Simplificado para 60+
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Sistema de Acessibilidade carregado!');
    
    let currentFontSize = 18;
    let isReading = false;
    let currentUtterance = null;
    
    // Referências aos botões
    const themeToggle = document.getElementById('theme-toggle');
    const increaseFontBtn = document.getElementById('increase-font');
    const decreaseFontBtn = document.getElementById('decrease-font');
    const resetFontBtn = document.getElementById('reset-font');
    const contrastToggle = document.getElementById('contrast-toggle');
    
    // ========================================
    // TEMA CLARO/ESCURO
    // ========================================
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            
            localStorage.setItem('clubeAmizadeTheme', isDark ? 'dark' : 'light');
            updateThemeButton();
            
            if (window.showToast) {
                window.showToast(
                    isDark ? 'Modo escuro ativado' : 'Modo claro ativado', 
                    'success'
                );
            }
        });
        
        themeToggle.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    }
    
    function updateThemeButton() {
        if (themeToggle) {
            const isDark = document.body.classList.contains('dark-mode');
            themeToggle.innerHTML = isDark ? '☀️ Claro' : '🌙 Escuro';
            themeToggle.setAttribute('aria-label', 
                isDark ? 'Alternar para modo claro' : 'Alternar para modo escuro'
            );
        }
    }
    
    // Carregar tema salvo
    const savedTheme = localStorage.getItem('clubeAmizadeTheme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }
    updateThemeButton();
    
    // ========================================
    // CONTROLE DE FONTE
    // ========================================
    function applyFontSize(size) {
        document.documentElement.style.setProperty('--font-base', `${size}px`);
        localStorage.setItem('clubeAmizadeFontSize', size);
        
        if (increaseFontBtn) increaseFontBtn.disabled = size >= 24;
        if (decreaseFontBtn) decreaseFontBtn.disabled = size <= 14;
    }
    
    function loadFontSize() {
        const savedSize = localStorage.getItem('clubeAmizadeFontSize');
        if (savedSize) {
            currentFontSize = parseInt(savedSize);
        }
        applyFontSize(currentFontSize);
    }
    
    if (increaseFontBtn) {
        increaseFontBtn.addEventListener('click', () => {
            if (currentFontSize < 24) {
                currentFontSize += 2;
                applyFontSize(currentFontSize);
                
                if (window.showToast) {
                    window.showToast(`Fonte aumentada para ${currentFontSize}px`, 'success');
                }
            }
        });
        
        increaseFontBtn.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    }
    
    if (decreaseFontBtn) {
        decreaseFontBtn.addEventListener('click', () => {
            if (currentFontSize > 14) {
                currentFontSize -= 2;
                applyFontSize(currentFontSize);
                
                if (window.showToast) {
                    window.showToast(`Fonte diminuída para ${currentFontSize}px`, 'success');
                }
            }
        });
        
        decreaseFontBtn.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    }
    
    if (resetFontBtn) {
        resetFontBtn.addEventListener('click', () => {
            currentFontSize = 18;
            applyFontSize(currentFontSize);
            
            if (window.showToast) {
                window.showToast('Fonte restaurada para o tamanho padrão', 'success');
            }
        });
        
        resetFontBtn.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    }
    
    loadFontSize();
    
    // ========================================
    // LEITURA DE TEXTO (TTS)
    // ========================================
    function setupSpeech() {
        if ('speechSynthesis' in window) {
            const mainContent = document.querySelector('main') || 
                               document.querySelector('.main-content');
            
            if (mainContent) {
                const existingButton = document.getElementById('read-page-button');
                if (existingButton) {
                    existingButton.remove();
                }
                
                const readButton = document.createElement('button');
                readButton.id = 'read-page-button';
                readButton.className = 'btn btn-secondary';
                readButton.innerHTML = '🔊 Ler Página';
                readButton.setAttribute('aria-label', 'Ler o conteúdo da página em voz alta');
                readButton.style.position = 'fixed';
                readButton.style.bottom = '20px';
                readButton.style.right = '20px';
                readButton.style.zIndex = '1000';
                
                readButton.addEventListener('click', function() {
                    if (isReading) {
                        stopReading();
                    } else {
                        startReading();
                    }
                });
                
                readButton.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.click();
                    }
                });
                
                document.body.appendChild(readButton);
            }
        }
    }
    
    function startReading() {
        if (!window.speechSynthesis) {
            if (window.showToast) {
                window.showToast('Leitura não suportada neste navegador', 'error');
            }
            return;
        }
        
        window.speechSynthesis.cancel();
        
        const mainContent = document.querySelector('main') || 
                           document.querySelector('.main-content');
        
        if (!mainContent) return;
        
        const clone = mainContent.cloneNode(true);
        const elementsToRemove = clone.querySelectorAll(
            '.accessibility-tools, .nav-toggle, .main-nav, .skip-link, #read-page-button, footer, header, script, style, button, .btn'
        );
        elementsToRemove.forEach(el => el.remove());
        
        const textToRead = (clone.innerText || clone.textContent || '').trim();
        
        if (!textToRead) {
            if (window.showToast) {
                window.showToast('Nenhum texto encontrado para leitura', 'info');
            }
            return;
        }
        
        currentUtterance = new SpeechSynthesisUtterance(textToRead);
        currentUtterance.lang = 'pt-BR';
        currentUtterance.rate = 0.8;
        currentUtterance.pitch = 1;
        currentUtterance.volume = 1;
        
        const voices = window.speechSynthesis.getVoices();
        const ptBrVoice = voices.find(voice => 
            voice.lang.startsWith('pt-BR') || voice.lang.startsWith('pt')
        );
        if (ptBrVoice) {
            currentUtterance.voice = ptBrVoice;
        }
        
        currentUtterance.onstart = function() {
            isReading = true;
            updateReadButton();
            if (window.showToast) {
                window.showToast('Iniciando leitura', 'info');
            }
        };
        
        currentUtterance.onend = function() {
            isReading = false;
            updateReadButton();
            if (window.showToast) {
                window.showToast('Leitura concluída', 'success');
            }
        };
        
        currentUtterance.onerror = function() {
            isReading = false;
            updateReadButton();
            if (window.showToast) {
                window.showToast('Erro na leitura', 'error');
            }
        };
        
        window.speechSynthesis.speak(currentUtterance);
    }
    
    function stopReading() {
        if (window.speechSynthesis && isReading) {
            window.speechSynthesis.cancel();
            isReading = false;
            updateReadButton();
            if (window.showToast) {
                window.showToast('Leitura interrompida', 'info');
            }
        }
    }
    
    function updateReadButton() {
        const readButton = document.getElementById('read-page-button');
        if (readButton) {
            readButton.innerHTML = isReading ? '⏹️ Parar' : '🔊 Ler Página';
            readButton.setAttribute('aria-label', 
                isReading ? 'Parar leitura' : 'Iniciar leitura'
            );
        }
    }
    
    // Configurar leitura quando vozes carregarem
    if (window.speechSynthesis) {
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = setupSpeech;
        } else {
            setupSpeech();
            setTimeout(setupSpeech, 1000);
        }
    }
    
    // ========================================
    // ATALHOS DE TECLADO
    // ========================================
    document.addEventListener('keydown', function(e) {
        // Alt + T: Alternar tema
        if (e.altKey && e.key === 't') {
            e.preventDefault();
            if (themeToggle) themeToggle.click();
        }
        
        // Alt + R: Leitura
        if (e.altKey && e.key === 'r') {
            e.preventDefault();
            const readButton = document.getElementById('read-page-button');
            if (readButton) readButton.click();
        }
        
        // Alt + +: Aumentar fonte
        if (e.altKey && (e.key === '=' || e.key === '+')) {
            e.preventDefault();
            if (increaseFontBtn) increaseFontBtn.click();
        }
        
        // Alt + -: Diminuir fonte
        if (e.altKey && e.key === '-') {
            e.preventDefault();
            if (decreaseFontBtn) decreaseFontBtn.click();
        }
        
        // Alt + 0: Resetar fonte
        if (e.altKey && e.key === '0') {
            e.preventDefault();
            if (resetFontBtn) resetFontBtn.click();
        }
    });
    
    console.log('✅ Sistema de Acessibilidade inicializado!');
    console.log('⌨️ Atalhos disponíveis:');
    console.log('  Alt + T = Alternar tema');
    console.log('  Alt + R = Iniciar/parar leitura');
    console.log('  Alt + + = Aumentar fonte');
    console.log('  Alt + - = Diminuir fonte');
    console.log('  Alt + 0 = Resetar fonte');
});