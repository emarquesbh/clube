// static/js/main.js
/**
 * CLUBE DA AMIZADE - SCRIPT PRINCIPAL
 * Versão: 1.3 - CORREÇÕES ESPECÍFICAS
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🎉 Site carregado!');
    
    // ========================================
    // 1. GARANTIR TEMA CLARO INICIAL
    // ========================================
    const body = document.body;
    
    // FORÇA TEMA CLARO NO INÍCIO - INCLUINDO ADMIN
    body.classList.remove('dark-mode');
    body.classList.add('admin-theme-override'); // Para páginas admin
    
    // Só aplica tema salvo se for explicitamente escuro E não for página admin
    const isAdminPage = window.location.pathname.includes('/admin/');
    const savedTheme = localStorage.getItem('clubeAmizadeTheme');
    
    if (savedTheme === 'dark' && !isAdminPage) {
        body.classList.add('dark-mode');
        body.classList.remove('admin-theme-override');
    }
    
    // ========================================
    // 2. BOTÃO TEMA ESCURO/CLARO - CORRIGIDO
    // ========================================
    const themeToggle = document.querySelector('#theme-toggle');
    
    function updateThemeButton() {
        if (themeToggle) {
            const isDark = body.classList.contains('dark-mode');
            themeToggle.textContent = isDark ? '☀️ Claro' : '🌙 Escuro';
            themeToggle.setAttribute('aria-label', 
                isDark ? 'Ativar tema claro' : 'Ativar tema escuro'
            );
            console.log('Tema atual:', isDark ? 'escuro' : 'claro');
        }
    }
    
    if (themeToggle && !isAdminPage) {
        themeToggle.addEventListener('click', function() {
            body.classList.toggle('dark-mode');
            const isDark = body.classList.contains('dark-mode');
            
            if (isDark) {
                body.classList.remove('admin-theme-override');
            } else {
                body.classList.add('admin-theme-override');
            }
            
            // Salva no localStorage
            localStorage.setItem('clubeAmizadeTheme', isDark ? 'dark' : 'light');
            
            updateThemeButton();
            console.log('Tema alterado para:', isDark ? 'escuro' : 'claro');
        });
        
        // Navegação por teclado
        themeToggle.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    }
    
    updateThemeButton();
    
    // ========================================
    // 3. MENU MOBILE - SANFONA COM SUBMENU
    // ========================================
    const menuToggle = document.querySelector('.menu-toggle');
    const mainMenu = document.querySelector('.main-menu');
    
    if (menuToggle && mainMenu) {
        menuToggle.addEventListener('click', function() {
            const isActive = mainMenu.classList.contains('active');
            
            if (isActive) {
                // Fechar menu
                closeMenu();
            } else {
                // Abrir menu
                openMenu();
            }
        });
        
        // Navegação por teclado para menu toggle
        menuToggle.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
        
        // Inicializar submenus
        initSubmenus();
        
        // Fechar menu ao clicar fora
        document.addEventListener('click', function(e) {
            if (!menuToggle.contains(e.target) && !mainMenu.contains(e.target)) {
                closeMenu();
            }
        });
        
        // Fechar menu no desktop
        window.addEventListener('resize', function() {
            if (window.innerWidth >= 768) {
                closeMenu();
            }
        });
        
        // Navegação por teclado - ESC para fechar menu
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && mainMenu.classList.contains('active')) {
                closeMenu();
                menuToggle.focus();
            }
        });
    }
    
    function openMenu() {
        mainMenu.classList.add('active');
        menuToggle.classList.add('active');
        menuToggle.setAttribute('aria-expanded', 'true');
        console.log('Menu aberto');
    }
    
    function closeMenu() {
        mainMenu.classList.remove('active');
        menuToggle.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
        
        // Fechar todos os submenus
        const activeSubmenus = mainMenu.querySelectorAll('.menu-item.has-submenu.active');
        activeSubmenus.forEach(item => {
            item.classList.remove('active');
        });
        
        console.log('Menu fechado');
    }
    
    function initSubmenus() {
        const submenuItems = mainMenu.querySelectorAll('.menu-item.has-submenu > a');
        
        submenuItems.forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                const parentItem = this.parentElement;
                const isActive = parentItem.classList.contains('active');
                
                // Fechar outros submenus
                const otherActiveItems = mainMenu.querySelectorAll('.menu-item.has-submenu.active');
                otherActiveItems.forEach(otherItem => {
                    if (otherItem !== parentItem) {
                        otherItem.classList.remove('active');
                    }
                });
                
                // Toggle do submenu atual
                parentItem.classList.toggle('active');
                
                console.log('Submenu', isActive ? 'fechado' : 'aberto');
            });
            
            // Navegação por teclado para submenus
            item.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.click();
                }
            });
        });
    }
    
    // ========================================
    // 4. CONTROLE DE FONTE - CORRIGIDO PARA BODY
    // ========================================
    let currentFontSize = 16; // Tamanho padrão
    const minFontSize = 14;
    const maxFontSize = 20;
    
    const increaseFontBtn = document.querySelector('#increase-font');
    const decreaseFontBtn = document.querySelector('#decrease-font');
    const resetFontBtn = document.querySelector('#reset-font');
    
    // Carrega tamanho salvo
    const savedFontSize = localStorage.getItem('clubeAmizadeFontSize');
    if (savedFontSize) {
        currentFontSize = parseInt(savedFontSize);
    }
    
    function updateFontSize() {
        // APLICA NO BODY INTEIRO
        body.style.fontSize = currentFontSize + 'px';
        
        // Atualiza botões
        if (increaseFontBtn) {
            increaseFontBtn.disabled = currentFontSize >= maxFontSize;
        }
        if (decreaseFontBtn) {
            decreaseFontBtn.disabled = currentFontSize <= minFontSize;
        }
        
        console.log('Fonte alterada para:', currentFontSize + 'px');
    }
    
    if (increaseFontBtn) {
        increaseFontBtn.addEventListener('click', function() {
            if (currentFontSize < maxFontSize) {
                currentFontSize += 1;
                updateFontSize();
                localStorage.setItem('clubeAmizadeFontSize', currentFontSize);
            }
        });
        
        // Navegação por teclado
        increaseFontBtn.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    }
    
    if (decreaseFontBtn) {
        decreaseFontBtn.addEventListener('click', function() {
            if (currentFontSize > minFontSize) {
                currentFontSize -= 1;
                updateFontSize();
                localStorage.setItem('clubeAmizadeFontSize', currentFontSize);
            }
        });
        
        // Navegação por teclado
        decreaseFontBtn.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    }
    
    if (resetFontBtn) {
        resetFontBtn.addEventListener('click', function() {
            currentFontSize = 16;
            updateFontSize();
            localStorage.setItem('clubeAmizadeFontSize', currentFontSize);
        });
        
        // Navegação por teclado
        resetFontBtn.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    }
    
    // Aplica tamanho inicial
    updateFontSize();
    
    // ========================================
    // 5. ALTO CONTRASTE
    // ========================================
    const contrastToggle = document.querySelector('#contrast-toggle');
    
    // Carrega contraste salvo
    const savedContrast = localStorage.getItem('clubeAmizadeContrast');
    if (savedContrast === 'high') {
        body.classList.add('high-contrast');
    }
    
    function updateContrastButton() {
        if (contrastToggle) {
            const isHighContrast = body.classList.contains('high-contrast');
            contrastToggle.textContent = isHighContrast ? '🎨 Normal' : '⚫ Contraste';
            contrastToggle.setAttribute('aria-label', 
                isHighContrast ? 'Desativar alto contraste' : 'Ativar alto contraste'
            );
        }
    }
    
    if (contrastToggle) {
        contrastToggle.addEventListener('click', function() {
            body.classList.toggle('high-contrast');
            const isHighContrast = body.classList.contains('high-contrast');
            
            localStorage.setItem('clubeAmizadeContrast', 
                isHighContrast ? 'high' : 'normal'
            );
            
            updateContrastButton();
            console.log('Contraste:', isHighContrast ? 'alto' : 'normal');
        });
        
        // Navegação por teclado
        contrastToggle.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    }
    
    updateContrastButton();
    
    // ========================================
    // 6. SMOOTH SCROLL
    // ========================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            
            if (target) {
                const headerHeight = document.querySelector('header').offsetHeight;
                const targetPosition = target.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // ========================================
    // 7. NAVEGAÇÃO POR TECLADO - ATALHOS
    // ========================================
    document.addEventListener('keydown', function(e) {
        // Alt + T = Toggle tema (apenas se não for admin)
        if (e.altKey && e.key === 't' && !isAdminPage) {
            e.preventDefault();
            if (themeToggle) themeToggle.click();
        }
        
        // Alt + C = Toggle contraste
        if (e.altKey && e.key === 'c') {
            e.preventDefault();
            if (contrastToggle) contrastToggle.click();
        }
        
        // Alt + M = Toggle menu
        if (e.altKey && e.key === 'm') {
            e.preventDefault();
            if (menuToggle) menuToggle.click();
        }
        
        // Alt + + = Aumentar fonte
        if (e.altKey && e.key === '=') {
            e.preventDefault();
            if (increaseFontBtn) increaseFontBtn.click();
        }
        
        // Alt + - = Diminuir fonte
        if (e.altKey && e.key === '-') {
            e.preventDefault();
            if (decreaseFontBtn) decreaseFontBtn.click();
        }
    });
    
    // ========================================
    // 8. LOG FINAL
    // ========================================
    console.log('✅ Inicialização completa!');
    console.log('Estado:', {
        tema: body.classList.contains('dark-mode') ? 'escuro' : 'claro',
        fonte: currentFontSize + 'px',
        contraste: body.classList.contains('high-contrast') ? 'alto' : 'normal',
        isAdmin: isAdminPage
    });
    
    if (!isAdminPage) {
        console.log('⌨️ Atalhos disponíveis:');
        console.log('Alt + T = Alternar tema');
        console.log('Alt + C = Alternar contraste');
        console.log('Alt + M = Abrir/fechar menu');
        console.log('Alt + + = Aumentar fonte');
        console.log('Alt + - = Diminuir fonte');
    }
});