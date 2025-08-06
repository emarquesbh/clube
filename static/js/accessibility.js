/* static/js/accessibility.js */
/**
 * CLUBE DA AMIZADE PE. ANTÔNIO GONÇALVES
 * Funcionalidades de Acessibilidade - Otimizado para 60+
 */

class ClubeAmizadeAccessibility {
    constructor() {
        this.currentFontSize = 18;
        this.isReading = false;
        this.currentUtterance = null;
        this.isHighContrast = false;
        this.init();
    }
    
    init() {
        console.log('🔧 Sistema de Acessibilidade carregado!');
        
        // Aguardar DOM estar completamente carregado
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupAccessibility();
            });
        } else {
            this.setupAccessibility();
        }
    }
    
    setupAccessibility() {
        this.initThemeToggle();
        this.initFontControls();
        this.initSpeechSynthesis();
        this.initKeyboardShortcuts();
        this.initContrastToggle();
        this.loadSavedSettings();
        
        console.log('✅ Sistema de Acessibilidade inicializado!');
        this.logKeyboardShortcuts();
    }
    
    // ========================================
    // TEMA CLARO/ESCURO
    // ========================================
    
    initThemeToggle() {
        const themeToggle = document.getElementById('theme-toggle');
        
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
            
            themeToggle.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.toggleTheme();
                }
            });
        }
    }
    
    toggleTheme() {
        const isDark = document.body.classList.toggle('dark-mode');
        
        localStorage.setItem('clubeAmizadeTheme', isDark ? 'dark' : 'light');
        this.updateThemeButton();
        
        if (window.showToast) {
            window.showToast(
                isDark ? '🌙 Modo escuro ativado' : '☀️ Modo claro ativado', 
                'success'
            );
        }
        
        // Anunciar mudança para leitores de tela
        this.announceToScreenReader(
            isDark ? 'Modo escuro ativado' : 'Modo claro ativado'
        );
    }
    
    updateThemeButton() {
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            const isDark = document.body.classList.contains('dark-mode');
            themeToggle.innerHTML = isDark ? '☀️ Claro' : '🌙 Escuro';
            themeToggle.setAttribute('aria-label', 
                isDark ? 'Alternar para modo claro' : 'Alternar para modo escuro'
            );
        }
    }
    
    // ========================================
    // CONTROLE DE FONTE
    // ========================================
    
    initFontControls() {
        const increaseFontBtn = document.getElementById('increase-font');
        const decreaseFontBtn = document.getElementById('decrease-font');
        const resetFontBtn = document.getElementById('reset-font');
        
        if (increaseFontBtn) {
            increaseFontBtn.addEventListener('click', () => {
                this.increaseFontSize();
            });
            
            increaseFontBtn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.increaseFontSize();
                }
            });
        }
        
        if (decreaseFontBtn) {
            decreaseFontBtn.addEventListener('click', () => {
                this.decreaseFontSize();
            });
            
            decreaseFontBtn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.decreaseFontSize();
                }
            });
        }
        
        if (resetFontBtn) {
            resetFontBtn.addEventListener('click', () => {
                this.resetFontSize();
            });
            
            resetFontBtn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.resetFontSize();
                }
            });
        }
    }
    
    increaseFontSize() {
        if (this.currentFontSize < 24) {
            this.currentFontSize += 2;
            this.applyFontSize();
            
            if (window.showToast) {
                window.showToast(`📈 Fonte aumentada para ${this.currentFontSize}px`, 'success');
            }
            
            this.announceToScreenReader(`Fonte aumentada para ${this.currentFontSize} pixels`);
        } else {
            if (window.showToast) {
                window.showToast('⚠️ Tamanho máximo da fonte atingido', 'warning');
            }
        }
    }
    
    decreaseFontSize() {
        if (this.currentFontSize > 14) {
            this.currentFontSize -= 2;
            this.applyFontSize();
            
            if (window.showToast) {
                window.showToast(`📉 Fonte diminuída para ${this.currentFontSize}px`, 'success');
            }
            
            this.announceToScreenReader(`Fonte diminuída para ${this.currentFontSize} pixels`);
        } else {
            if (window.showToast) {
                window.showToast('⚠️ Tamanho mínimo da fonte atingido', 'warning');
            }
        }
    }
    
    resetFontSize() {
        this.currentFontSize = 18;
        this.applyFontSize();
        
        if (window.showToast) {
            window.showToast('🔄 Fonte restaurada para o tamanho padrão (18px)', 'success');
        }
        
        this.announceToScreenReader('Fonte restaurada para o tamanho padrão');
    }
    
    applyFontSize() {
        document.documentElement.style.setProperty('--font-base', `${this.currentFontSize}px`);
        
        // Ajustar outros tamanhos proporcionalmente
        const smallSize = Math.max(14, this.currentFontSize - 2);
        const largeSize = this.currentFontSize + 2;
        const xlSize = this.currentFontSize + 6;
        const xxlSize = this.currentFontSize + 14;
        const xxxlSize = this.currentFontSize + 22;
        
        document.documentElement.style.setProperty('--font-small', `${smallSize}px`);
        document.documentElement.style.setProperty('--font-large', `${largeSize}px`);
        document.documentElement.style.setProperty('--font-xl', `${xlSize}px`);
        document.documentElement.style.setProperty('--font-2xl', `${xxlSize}px`);
        document.documentElement.style.setProperty('--font-3xl', `${xxxlSize}px`);
        
        // Salvar configuração
        localStorage.setItem('clubeAmizadeFontSize', this.currentFontSize);
        
        // Atualizar estado dos botões
        this.updateFontButtons();
    }
    
    updateFontButtons() {
        const increaseFontBtn = document.getElementById('increase-font');
        const decreaseFontBtn = document.getElementById('decrease-font');
        
        if (increaseFontBtn) {
            increaseFontBtn.disabled = this.currentFontSize >= 24;
        }
        
        if (decreaseFontBtn) {
            decreaseFontBtn.disabled = this.currentFontSize <= 14;
        }
    }
    
    // ========================================
    // ALTO CONTRASTE
    // ========================================
    
    initContrastToggle() {
        // Criar botão de contraste se não existir
        let contrastToggle = document.getElementById('contrast-toggle');
        
        if (!contrastToggle) {
            const accessibilityTools = document.querySelector('.accessibility-tools');
            if (accessibilityTools) {
                contrastToggle = document.createElement('button');
                contrastToggle.id = 'contrast-toggle';
                contrastToggle.className = 'accessibility-btn';
                contrastToggle.innerHTML = '⚫ Contraste';
                contrastToggle.setAttribute('aria-label', 'Alternar modo de alto contraste');
                accessibilityTools.appendChild(contrastToggle);
            }
        }
        
        if (contrastToggle) {
            contrastToggle.addEventListener('click', () => {
                this.toggleHighContrast();
            });
            
            contrastToggle.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.toggleHighContrast();
                }
            });
        }
    }
    
    toggleHighContrast() {
        this.isHighContrast = document.body.classList.toggle('high-contrast');
        
        localStorage.setItem('clubeAmizadeHighContrast', this.isHighContrast);
        this.updateContrastButton();
        
        if (window.showToast) {
            window.showToast(
                this.isHighContrast ? '⚫ Alto contraste ativado' : '⚪ Alto contraste desativado', 
                'success'
            );
        }
        
        this.announceToScreenReader(
            this.isHighContrast ? 'Alto contraste ativado' : 'Alto contraste desativado'
        );
    }
    
    updateContrastButton() {
        const contrastToggle = document.getElementById('contrast-toggle');
        if (contrastToggle) {
            contrastToggle.innerHTML = this.isHighContrast ? '⚪ Normal' : '⚫ Contraste';
            contrastToggle.setAttribute('aria-label', 
                this.isHighContrast ? 'Desativar alto contraste' : 'Ativar alto contraste'
            );
        }
    }
    
    // ========================================
    // LEITURA DE TEXTO (TTS)
    // ========================================
    
    initSpeechSynthesis() {
        if ('speechSynthesis' in window) {
            // Aguardar vozes carregarem
            if (window.speechSynthesis.onvoiceschanged !== undefined) {
                window.speechSynthesis.onvoiceschanged = () => {
                    this.setupSpeechButton();
                };
            } else {
                this.setupSpeechButton();
            }
            
            // Fallback caso as vozes não carreguem
            setTimeout(() => {
                this.setupSpeechButton();
            }, 1000);
        } else {
            console.warn('Speech Synthesis não suportado neste navegador');
        }
    }
    
    setupSpeechButton() {
        // Remover botão existente
        const existingButton = document.getElementById('read-page-button');
        if (existingButton) {
            existingButton.remove();
        }
        
        // Criar botão de leitura
        const readButton = document.createElement('button');
        readButton.id = 'read-page-button';
        readButton.className = 'btn btn-primary';
        readButton.innerHTML = '🔊 Ler Página';
        readButton.setAttribute('aria-label', 'Ler o conteúdo da página em voz alta');
        readButton.title = 'Clique para ouvir o conteúdo da página (Alt + R)';
        
        readButton.addEventListener('click', () => {
            if (this.isReading) {
                this.stopReading();
            } else {
                this.startReading();
            }
        });
        
        readButton.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                readButton.click();
            }
        });
        
        document.body.appendChild(readButton);
    }
    
    startReading() {
        if (!window.speechSynthesis) {
            if (window.showToast) {
                window.showToast('❌ Leitura não suportada neste navegador', 'error');
            }
            return;
        }
        
        // Parar qualquer leitura em andamento
        window.speechSynthesis.cancel();
        
        // Obter texto para leitura
        const textToRead = this.getTextToRead();
        
        if (!textToRead.trim()) {
            if (window.showToast) {
                window.showToast('⚠️ Nenhum texto encontrado para leitura', 'warning');
            }
            return;
        }
        
        // Criar utterance
        this.currentUtterance = new SpeechSynthesisUtterance(textToRead);
        this.currentUtterance.lang = 'pt-BR';
        this.currentUtterance.rate = 0.8;
        this.currentUtterance.pitch = 1;
        this.currentUtterance.volume = 1;
        
        // Selecionar voz em português
        const voices = window.speechSynthesis.getVoices();
        const ptBrVoice = voices.find(voice => 
            voice.lang.startsWith('pt-BR') || 
            voice.lang.startsWith('pt') ||
            voice.name.toLowerCase().includes('portuguese')
        );
        
        if (ptBrVoice) {
            this.currentUtterance.voice = ptBrVoice;
        }
        
        // Event listeners
        this.currentUtterance.onstart = () => {
            this.isReading = true;
            this.updateReadButton();
            if (window.showToast) {
                window.showToast('🔊 Iniciando leitura da página', 'info');
            }
        };
        
        this.currentUtterance.onend = () => {
            this.isReading = false;
            this.updateReadButton();
            if (window.showToast) {
                window.showToast('✅ Leitura concluída', 'success');
            }
        };
        
        this.currentUtterance.onerror = (event) => {
            this.isReading = false;
            this.updateReadButton();
            console.error('Erro na leitura:', event);
            if (window.showToast) {
                window.showToast('❌ Erro durante a leitura', 'error');
            }
        };
        
        this.currentUtterance.onpause = () => {
            if (window.showToast) {
                window.showToast('⏸️ Leitura pausada', 'info');
            }
        };
        
        this.currentUtterance.onresume = () => {
            if (window.showToast) {
                window.showToast('▶️ Leitura retomada', 'info');
            }
        };
        
        // Iniciar leitura
        window.speechSynthesis.speak(this.currentUtterance);
    }
    
    stopReading() {
        if (window.speechSynthesis && this.isReading) {
            window.speechSynthesis.cancel();
            this.isReading = false;
            this.updateReadButton();
            
            if (window.showToast) {
                window.showToast('⏹️ Leitura interrompida', 'info');
            }
            
            this.announceToScreenReader('Leitura interrompida');
        }
    }
    
    getTextToRead() {
        const mainContent = document.querySelector('main') || 
                           document.querySelector('.main-content') ||
                           document.querySelector('#main-content');
        
        if (!mainContent) {
            return document.body.innerText || document.body.textContent || '';
        }
        
        // Clonar conteúdo para manipulação
        const clone = mainContent.cloneNode(true);
        
        // Remover elementos desnecessários
        const elementsToRemove = clone.querySelectorAll(
            '.accessibility-tools, .nav-toggle, .main-nav, .skip-link, ' +
            '#read-page-button, footer, header, script, style, button, ' +
            '.btn, .toast, .modal, nav, .navigation'
        );
        
        elementsToRemove.forEach(el => el.remove());
        
        // Obter texto limpo
        let text = (clone.innerText || clone.textContent || '').trim();
        
        // Limpar texto
        text = text
            .replace(/\s+/g, ' ')  // Múltiplos espaços
            .replace(/\n+/g, '. ') // Quebras de linha
            .replace(/\.+/g, '.') // Múltiplos pontos
            .replace(/\s*\.\s*/g, '. ') // Espaçamento dos pontos
            .trim();
        
        return text;
    }
    
    updateReadButton() {
        const readButton = document.getElementById('read-page-button');
        if (readButton) {
            if (this.isReading) {
                readButton.innerHTML = '⏹️ Parar';
                readButton.setAttribute('aria-label', 'Parar leitura');
                readButton.title = 'Clique para parar a leitura (Alt + R)';
                readButton.classList.add('reading');
            } else {
                readButton.innerHTML = '🔊 Ler Página';
                readButton.setAttribute('aria-label', 'Ler página');
                readButton.title = 'Clique para ouvir o conteúdo da página (Alt + R)';
                readButton.classList.remove('reading');
            }
        }
    }
    
    // ========================================
    // ATALHOS DE TECLADO
    // ========================================
    
    initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Alt + T: Alternar tema
            if (e.altKey && e.key.toLowerCase() === 't') {
                e.preventDefault();
                this.toggleTheme();
            }
            
            // Alt + R: Leitura
            if (e.altKey && e.key.toLowerCase() === 'r') {
                e.preventDefault();
                const readButton = document.getElementById('read-page-button');
                if (readButton) {
                    readButton.click();
                }
            }
            
            // Alt + C: Alto contraste
            if (e.altKey && e.key.toLowerCase() === 'c') {
                e.preventDefault();
                this.toggleHighContrast();
            }
            
            // Alt + +: Aumentar fonte
            if (e.altKey && (e.key === '=' || e.key === '+')) {
                e.preventDefault();
                this.increaseFontSize();
            }
            
            // Alt + -: Diminuir fonte
            if (e.altKey && e.key === '-') {
                e.preventDefault();
                this.decreaseFontSize();
            }
            
            // Alt + 0: Resetar fonte
            if (e.altKey && e.key === '0') {
                e.preventDefault();
                this.resetFontSize();
            }
            
            // Ctrl + D: Modo debug (para desenvolvedores)
            if (e.ctrlKey && e.key.toLowerCase() === 'd') {
                e.preventDefault();
                this.toggleDebugMode();
            }
        });
    }
    
    // ========================================
    // CONFIGURAÇÕES SALVAS
    // ========================================
    
    loadSavedSettings() {
        // Carregar tema
        const savedTheme = localStorage.getItem('clubeAmizadeTheme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
        }
        this.updateThemeButton();
        
        // Carregar tamanho da fonte
        const savedFontSize = localStorage.getItem('clubeAmizadeFontSize');
        if (savedFontSize) {
            this.currentFontSize = parseInt(savedFontSize);
            this.applyFontSize();
        }
        
        // Carregar alto contraste
        const savedHighContrast = localStorage.getItem('clubeAmizadeHighContrast');
        if (savedHighContrast === 'true') {
            this.isHighContrast = true;
            document.body.classList.add('high-contrast');
        }
        this.updateContrastButton();
    }
    
    // ========================================
    // UTILITÁRIOS
    // ========================================
    
    announceToScreenReader(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = message;
        
        document.body.appendChild(announcement);
        
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }
    
    toggleDebugMode() {
        const isDebug = document.body.classList.toggle('debug-mode');
        
        if (isDebug) {
            // Adicionar estilos de debug
            const debugStyles = `
                .debug-mode * {
                    outline: 1px solid rgba(255, 0, 0, 0.3) !important;
                }
                
                .debug-mode *:focus {
                    outline: 3px solid red !important;
                }
                
                .debug-mode [tabindex] {
                    background: rgba(0, 255, 0, 0.1) !important;
                }
            `;
            
            const style = document.createElement('style');
            style.id = 'debug-styles';
            style.textContent = debugStyles;
            document.head.appendChild(style);
            
            if (window.showToast) {
                window.showToast('🐛 Modo debug ativado', 'info');
            }
        } else {
            const debugStyles = document.getElementById('debug-styles');
            if (debugStyles) {
                debugStyles.remove();
            }
            
            if (window.showToast) {
                window.showToast('🐛 Modo debug desativado', 'info');
            }
        }
    }
    
    logKeyboardShortcuts() {
        console.log('⌨️ Atalhos de Teclado Disponíveis:');
        console.log('  Alt + T = Alternar tema claro/escuro');
        console.log('  Alt + R = Iniciar/parar leitura');
        console.log('  Alt + C = Alternar alto contraste');
        console.log('  Alt + + = Aumentar fonte');
        console.log('  Alt + - = Diminuir fonte');
        console.log('  Alt + 0 = Resetar fonte');
        console.log('  Alt + H = Mostrar atalhos');
        console.log('  Alt + M = Toggle menu (mobile)');
        console.log('  Alt + 1 = Ir para conteúdo principal');
        console.log('  Tab = Navegar entre elementos');
        console.log('  Escape = Fechar menus/modais');
        console.log('  Ctrl + D = Modo debug (dev)');
    }
}

// Inicializar quando DOM carregar
document.addEventListener('DOMContentLoaded', () => {
    window.clubeAmizadeAccessibility = new ClubeAmizadeAccessibility();
});

// Expor funções globalmente para compatibilidade
window.toggleTheme = function() {
    if (window.clubeAmizadeAccessibility) {
        window.clubeAmizadeAccessibility.toggleTheme();
    }
};

window.increaseFontSize = function() {
    if (window.clubeAmizadeAccessibility) {
        window.clubeAmizadeAccessibility.increaseFontSize();
    }
};

window.decreaseFontSize = function() {
    if (window.clubeAmizadeAccessibility) {
        window.clubeAmizadeAccessibility.decreaseFontSize();
    }
};

window.resetFontSize = function() {
    if (window.clubeAmizadeAccessibility) {
        window.clubeAmizadeAccessibility.resetFontSize();
    }
};

window.startReading = function() {
    if (window.clubeAmizadeAccessibility) {
        window.clubeAmizadeAccessibility.startReading();
    }
};

window.stopReading = function() {
    if (window.clubeAmizadeAccessibility) {
        window.clubeAmizadeAccessibility.stopReading();
    }
};