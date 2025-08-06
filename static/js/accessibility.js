<!-- clube_da_amizade/static/js/accessibility.js -->
/**
 * CLUBE DA AMIZADE PE. ANTÔNIO GONÇALVES
 * Funcionalidades de Acessibilidade
 * Versão: 3.0 - Reconstrução Completa
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Sistema de Acessibilidade carregado!');
    
    const body = document.body;
    let currentFontSizePx = 16; // Tamanho da fonte em pixels
    let isReading = false;      // Estado da leitura de texto
    let currentUtterance = null; // Objeto SpeechSynthesisUtterance para controle da leitura
    
    // Referências aos botões de acessibilidade
    const themeToggle = document.getElementById('theme-toggle');
    const increaseFontBtn = document.getElementById('increase-font');
    const decreaseFontBtn = document.getElementById('decrease-font');
    const resetFontBtn = document.getElementById('reset-font');
    const contrastToggle = document.getElementById('contrast-toggle');
    
    // ========================================
    // 1. TEMA CLARO/ESCURO
    // ========================================
    // Garante que a página inicie no modo claro, a menos que o localStorage diga o contrário
    body.classList.remove('dark-mode'); 
    
    if (themeToggle) {
        // Evento de clique para alternar o tema
        themeToggle.addEventListener('click', function() {
            body.classList.toggle('dark-mode'); // Adiciona/remove a classe dark-mode
            const newTheme = body.classList.contains('dark-mode') ? 'dark' : 'light';
            localStorage.setItem('clubeAmizadeTheme', newTheme); // Salva a preferência no localStorage
            
            updateThemeButton(); // Atualiza o texto/ícone do botão
            
            // Mostra um toast de confirmação
            if (window.showToast) {
                window.showToast(
                    newTheme === 'dark' ? 'Tema escuro ativado' : 'Tema claro ativado', 
                    'success'
                );
            }
        });
        
        // Suporte a teclado para o botão de tema (Enter/Espaço)
        themeToggle.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click(); // Simula um clique
            }
        });
    }
    
    // Função para atualizar o texto e o atributo ARIA do botão de tema
    function updateThemeButton() {
        if (themeToggle) {
            const isDark = body.classList.contains('dark-mode');
            themeToggle.innerHTML = isDark ? '☀️ Claro' : '🌙 Escuro';
            themeToggle.setAttribute('aria-label', 
                isDark ? 'Alternar para modo claro' : 'Alternar para modo escuro'
            );
        }
    }
    
    // Carrega a preferência de tema salva ao carregar a página
    const savedTheme = localStorage.getItem('clubeAmizadeTheme');
    if (savedTheme === 'dark') {
        body.classList.add('dark-mode');
    }
    updateThemeButton(); // Garante que o botão esteja correto na inicialização
    
    // ========================================
    // 2. CONTROLE DE FONTE (Aumentar, Diminuir, Resetar)
    // ========================================
    // Aplica o tamanho da fonte ao <body> e salva no localStorage
    function applyFontSize(sizePx) {
        body.style.fontSize = `${sizePx}px`;
        localStorage.setItem('clubeAmizadeFontSize', sizePx);
        
        // Atualiza o estado dos botões de aumentar/diminuir (desabilita se atingir limites)
        if (increaseFontBtn) {
            increaseFontBtn.disabled = sizePx >= 24; // Limite máximo 24px
        }
        if (decreaseFontBtn) {
            decreaseFontBtn.disabled = sizePx <= 14; // Limite mínimo 14px
        }
    }
    
    // Carrega o tamanho da fonte salvo ou define o padrão
    function loadFontSize() {
        const savedFontSizePx = localStorage.getItem('clubeAmizadeFontSize');
        if (savedFontSizePx) {
            currentFontSizePx = parseFloat(savedFontSizePx);
        } else {
            currentFontSizePx = parseFloat(getComputedStyle(body).fontSize) || 16; // Pega o padrão do CSS ou 16
        }
        applyFontSize(currentFontSizePx);
    }
    
    if (increaseFontBtn) {
        increaseFontBtn.addEventListener('click', () => {
            if (currentFontSizePx < 24) {
                currentFontSizePx += 1; // Aumenta em 1px
                applyFontSize(currentFontSizePx);
                
                if (window.showToast) {
                    window.showToast(`Fonte aumentada para ${currentFontSizePx}px`, 'success');
                }
            } else {
                if (window.showToast) {
                    window.showToast('Tamanho máximo da fonte atingido', 'info');
                }
            }
        });
        // Suporte a teclado
        increaseFontBtn.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    }
    
    if (decreaseFontBtn) {
        decreaseFontBtn.addEventListener('click', () => {
            if (currentFontSizePx > 14) {
                currentFontSizePx -= 1; // Diminui em 1px
                applyFontSize(currentFontSizePx);
                
                if (window.showToast) {
                    window.showToast(`Fonte diminuída para ${currentFontSizePx}px`, 'success');
                }
            } else {
                if (window.showToast) {
                    window.showToast('Tamanho mínimo da fonte atingido', 'info');
                }
            }
        });
        // Suporte a teclado
        decreaseFontBtn.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    }
    
    if (resetFontBtn) {
        resetFontBtn.addEventListener('click', () => {
            currentFontSizePx = 16; // Reseta para o tamanho base
            applyFontSize(currentFontSizePx);
            
            if (window.showToast) {
                window.showToast('Fonte restaurada para o tamanho padrão', 'success');
            }
        });
        // Suporte a teclado
        resetFontBtn.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    }
    
    // Carrega o tamanho da fonte ao iniciar o script
    loadFontSize();
    
    // ========================================
    // 3. ALTO CONTRASTE
    // ========================================
    if (contrastToggle) {
        contrastToggle.addEventListener('click', function() {
            body.classList.toggle('high-contrast'); // Adiciona/remove a classe high-contrast
            const isHighContrast = body.classList.contains('high-contrast');
            
            localStorage.setItem('clubeAmizadeContrast', 
                isHighContrast ? 'high' : 'normal' // Salva a preferência
            );
            
            updateContrastButton(); // Atualiza o texto/ícone do botão
            
            if (window.showToast) {
                window.showToast(
                    isHighContrast ? 'Alto contraste ativado' : 'Contraste normal ativado', 
                    'success'
                );
            }
        });
        
        // Suporte a teclado
        contrastToggle.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    }
    
    // Função para atualizar o texto e o atributo ARIA do botão de contraste
    function updateContrastButton() {
        if (contrastToggle) {
            const isHighContrast = body.classList.contains('high-contrast');
            contrastToggle.innerHTML = isHighContrast ? '🎨 Normal' : '⚫ Contraste';
            contrastToggle.setAttribute('aria-label', 
                isHighContrast ? 'Desativar modo de alto contraste' : 'Ativar modo de alto contraste'
            );
        }
    }
    
    // Carrega a preferência de contraste salva
    const savedContrast = localStorage.getItem('clubeAmizadeContrast');
    if (savedContrast === 'high') {
        body.classList.add('high-contrast');
    }
    updateContrastButton(); // Garante que o botão esteja correto na inicialização
    
    // ========================================
    // 4. LEITURA DE TEXTO (TEXT-TO-SPEECH - TTS)
    // ========================================
    function setupSpeech() {
        if ('speechSynthesis' in window) { // Verifica se a API de síntese de voz é suportada
            // Tenta encontrar o contêiner principal do conteúdo a ser lido (priorizando .main-content)
            const mainContentContainer = document.querySelector('main') || 
                                         document.querySelector('.main-content');
            
            if (mainContentContainer) {
                // Remove botão existente para evitar duplicação em caso de múltiplas chamadas
                const existingButton = document.getElementById('read-page-button');
                if (existingButton) {
                    existingButton.remove();
                }
                
                const readPageButton = document.createElement('button');
                readPageButton.id = 'read-page-button';
                readPageButton.className = 'btn btn-success'; // Usa a classe de botão verde
                readPageButton.innerHTML = '🔊 Ler Conteúdo'; // Ícone e texto inicial
                readPageButton.setAttribute('aria-label', 'Ler o conteúdo da página em voz alta');
                // Estilos para posicionamento do botão (centralizado e com margem)
                readPageButton.style.marginTop = '20px';
                readPageButton.style.display = 'block';
                readPageButton.style.marginLeft = 'auto';
                readPageButton.style.marginRight = 'auto';
                
                // Alterna entre iniciar e parar a leitura ao clicar
                readPageButton.addEventListener('click', function() {
                    if (isReading) {
                        stopReading();
                    } else {
                        startReading();
                    }
                });
                
                // Suporte a teclado
                readPageButton.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.click();
                    }
                });
                
                // Adiciona o botão ao final do contêiner de conteúdo principal
                mainContentContainer.appendChild(readPageButton);
                
                console.log('Botão de leitura criado.');
            } else {
                 console.warn('Contêiner principal para leitura não encontrado. O botão de leitura não será adicionado.');
            }
        } else {
            console.warn('Speech Synthesis API não é suportada neste navegador. O botão de leitura não estará disponível.');
        }
    }
    
    function startReading() {
        if (!window.speechSynthesis) {
            if (window.showToast) {
                window.showToast('Leitura de texto não suportada neste navegador.', 'error');
            }
            return;
        }
        
        // Cancela qualquer leitura em andamento antes de iniciar uma nova
        window.speechSynthesis.cancel();
        
        // Seleciona o elemento cujo texto será lido
        const mainContentElement = document.querySelector('main') || 
                                   document.querySelector('.main-content');
        
        if (!mainContentElement) {
            if (window.showToast) {
                window.showToast('Nenhum conteúdo principal encontrado para leitura.', 'error');
            }
            return;
        }
        
        // Clona o elemento principal para remover elementos que não devem ser lidos
        const cloneContent = mainContentElement.cloneNode(true);
        // Lista de seletores de elementos que devem ser ignorados pela leitura
        const elementsToRemove = cloneContent.querySelectorAll(
            '.accessibility-tools, .nav-toggle, .main-nav, .skip-link, #read-page-button, footer, header, script, style, button, .btn, .category-icon'
        );
        elementsToRemove.forEach(el => el.remove()); // Remove os elementos do clone
        
        // Extrai o texto limpo do clone
        const textToRead = (cloneContent.innerText || cloneContent.textContent || '').trim();
        
        if (!textToRead) {
            if (window.showToast) {
                window.showToast('Nenhum texto relevante encontrado para leitura nesta página.', 'info');
            }
            return;
        }
        
        currentUtterance = new SpeechSynthesisUtterance(textToRead);
        currentUtterance.lang = 'pt-BR'; // Define o idioma para português do Brasil
        currentUtterance.rate = 0.9;     // Velocidade da fala (0.1 a 10, 1 é normal)
        currentUtterance.pitch = 1;      // Tom da fala (0 a 2, 1 é normal)
        currentUtterance.volume = 1;     // Volume da fala (0 a 1)
        
        // Tenta encontrar uma voz em português do Brasil, se disponível
        const voices = window.speechSynthesis.getVoices();
        const ptBrVoice = voices.find(voice => 
            voice.lang.startsWith('pt-BR') || (voice.name.includes('Brazil') && voice.lang.startsWith('pt'))
        );
        if (ptBrVoice) {
            currentUtterance.voice = ptBrVoice;
        }
        
        // Eventos da fala
        currentUtterance.onstart = function() {
            isReading = true;
            updateReadButton(); // Altera o botão para "Parar Leitura"
            if (window.showToast) {
                window.showToast('Iniciando leitura do texto.', 'info');
            }
            console.log('Leitura iniciada.');
        };
        
        currentUtterance.onend = function() {
            isReading = false;
            updateReadButton(); // Altera o botão de volta para "Ler Conteúdo"
            if (window.showToast) {
                window.showToast('Leitura concluída.', 'success');
            }
            console.log('Leitura concluída.');
        };
        
        currentUtterance.onerror = function(event) {
            isReading = false;
            updateReadButton();
            if (window.showToast) {
                window.showToast('Erro na leitura do texto. Tente novamente ou verifique as configurações do seu navegador.', 'error');
            }
            console.error('Erro na leitura:', event.error);
        };
        
        window.speechSynthesis.speak(currentUtterance); // Inicia a leitura
    }
    
    function stopReading() {
        if (window.speechSynthesis && isReading) {
            window.speechSynthesis.cancel(); // Para a leitura imediatamente
            isReading = false;
            updateReadButton();
            if (window.showToast) {
                window.showToast('Leitura interrompida.', 'info');
            }
            console.log('Leitura interrompida.');
        }
    }
    
    // Atualiza o texto e o atributo ARIA do botão de leitura
    function updateReadButton() {
        const readButton = document.getElementById('read-page-button');
        if (readButton) {
            readButton.innerHTML = isReading ? '⏹️ Parar Leitura' : '🔊 Ler Conteúdo';
            readButton.setAttribute('aria-label', 
                isReading ? 'Parar leitura do texto' : 'Iniciar leitura do texto'
            );
        }
    }
    
    // Garante que setupSpeech() seja chamado apenas quando as vozes estiverem carregadas
    if (window.speechSynthesis) {
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = setupSpeech;
        } else {
            // Fallback para navegadores que não disparam onvoiceschanged imediatamente
            setupSpeech(); 
            // Tenta novamente após um pequeno delay para garantir que as vozes foram carregadas
            setTimeout(setupSpeech, 1000); 
        }
    }
    
    // ========================================
    // 5. ATALHOS DE TECLADO (Funcionalidades de Acessibilidade)
    // ========================================
    // Estes atalhos são específicos para as funções de acessibilidade e não conflitam com main.js
    document.addEventListener('keydown', function(e) {
        // Alt + T: Alternar tema (Claro/Escuro)
        if (e.altKey && e.key === 't') {
            e.preventDefault();
            if (themeToggle) themeToggle.click();
        }
        
        // Alt + C: Alternar modo de alto contraste
        if (e.altKey && e.key === 'c') {
            e.preventDefault();
            if (contrastToggle) contrastToggle.click();
        }
        
        // Alt + R: Iniciar/parar leitura do conteúdo principal
        if (e.altKey && e.key === 'r') {
            e.preventDefault();
            const readButton = document.getElementById('read-page-button');
            if (readButton) readButton.click();
        }
        
        // Alt + + (ou Alt + =): Aumentar tamanho da fonte
        if (e.altKey && (e.key === '=' || e.key === '+')) {
            e.preventDefault();
            if (increaseFontBtn) increaseFontBtn.click();
        }
        
        // Alt + -: Diminuir tamanho da fonte
        if (e.altKey && e.key === '-') {
            e.preventDefault();
            if (decreaseFontBtn) decreaseFontBtn.click();
        }
        
        // Alt + 0: Resetar tamanho da fonte para o padrão
        if (e.altKey && e.key === '0') {
            e.preventDefault();
            if (resetFontBtn) resetFontBtn.click();
        }
    });
    
    // ========================================
    // 6. LOG FINAL (Mensagens de console para depuração)
    // ========================================
    console.log('✅ Sistema de Acessibilidade inicializado com sucesso!');
    console.log('⌨️ Atalhos de Teclado para Acessibilidade:');
    console.log('  Alt + T = Alternar tema (Claro/Escuro)');
    console.log('  Alt + C = Alternar alto contraste (Ligado/Desligado)');
    console.log('  Alt + R = Iniciar/parar leitura do conteúdo principal');
    console.log('  Alt + + = Aumentar tamanho da fonte');
    console.log('  Alt + - = Diminuir tamanho da fonte');
    console.log('  Alt + 0 = Resetar tamanho da fonte para o padrão');
    console.log('  (Outros atalhos de navegação no arquivo main.js)');
});