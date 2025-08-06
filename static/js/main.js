<!-- clube_da_amizade/static/js/main.js -->
/**
 * CLUBE DA AMIZADE PE. ANTÔNIO GONÇALVES
 * Sistema Principal de Navegação e Interface
 * Versão: 3.0 - Reconstrução Completa
 */

class ClubeAmizade {
    constructor() {
        this.body = document.body;
        this.isMenuOpen = false; // Estado do menu mobile
        
        // Inicializa todas as funcionalidades ao carregar a classe
        this.init();
    }
    
    init() {
        console.log('🎉 Clube da Amizade - Sistema principal inicializado!');
        
        this.initNavigation();     // Gerencia o menu e dropdowns
        this.initSmoothScroll();   // Rolagem suave para links internos
        this.initAnimations();     // Efeitos de animação ao rolar
        this.initKeyboardNavigation(); // Navegação aprimorada via teclado
        
        console.log('✅ Sistema principal carregado e pronto para uso!');
    }
    
    // ========================================
    // NAVEGAÇÃO PRINCIPAL (Menu Hamburger e Dropdowns)
    // ========================================
    initNavigation() {
        const navToggle = document.querySelector('.nav-toggle'); // Botão Hamburger
        const mainNav = document.querySelector('.main-nav');     // Contêiner da navegação
        
        if (navToggle && mainNav) {
            // Evento de clique para abrir/fechar o menu mobile
            navToggle.addEventListener('click', () => this.toggleMenu());
            // Suporte a teclado para o botão hamburger (Enter/Espaço)
            navToggle.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.toggleMenu();
                }
            });
            
            // Fecha o menu mobile se clicar fora dele
            document.addEventListener('click', (e) => {
                if (!navToggle.contains(e.target) && !mainNav.contains(e.target)) {
                    this.closeMenu();
                }
            });
            
            // Fecha o menu mobile se redimensionar para desktop
            window.addEventListener('resize', () => {
                if (window.innerWidth >= 992) { // '992px' é o breakpoint definido no CSS para mobile
                    this.closeMenu();
                }
            });
            
            // Fecha o menu mobile com a tecla ESC
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.isMenuOpen) {
                    this.closeMenu();
                    navToggle.focus(); // Retorna o foco para o botão hamburger
                }
            });
        }
        
        // Inicializa a lógica dos dropdowns (submenus)
        this.initDropdowns();
    }
    
    // Alterna o estado do menu (aberto/fechado)
    toggleMenu() {
        if (this.isMenuOpen) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }
    
    // Abre o menu mobile
    openMenu() {
        const navToggle = document.querySelector('.nav-toggle');
        const mainNav = document.querySelector('.main-nav');
        
        navToggle.classList.add('active'); // Ativa a animação do hamburger
        mainNav.classList.add('active');   // Expande o menu
        navToggle.setAttribute('aria-expanded', 'true'); // Atualiza atributo ARIA
        this.isMenuOpen = true;
        
        // Move o foco para o primeiro link do menu para acessibilidade
        const firstLink = mainNav.querySelector('.nav-link');
        if (firstLink) {
            setTimeout(() => firstLink.focus(), 100);
        }
        
        console.log('Menu mobile aberto.');
    }
    
    // Fecha o menu mobile
    closeMenu() {
        const navToggle = document.querySelector('.nav-toggle');
        const mainNav = document.querySelector('.main-nav');
        
        if (navToggle && mainNav) {
            navToggle.classList.remove('active'); // Desativa a animação do hamburger
            mainNav.classList.remove('active');   // Recolhe o menu
            navToggle.setAttribute('aria-expanded', 'false'); // Atualiza atributo ARIA
            this.isMenuOpen = false;
            
            // Fecha todos os dropdowns abertos no mobile ao fechar o menu principal
            const activeDropdowns = document.querySelectorAll('.nav-item.has-dropdown.active');
            activeDropdowns.forEach(item => {
                item.classList.remove('active');
            });
            
            console.log('Menu mobile fechado.');
        }
    }
    
    // Gerencia a lógica dos submenus (dropdowns)
    initDropdowns() {
        const dropdownItems = document.querySelectorAll('.nav-item.has-dropdown');
        
        dropdownItems.forEach(item => {
            const link = item.querySelector('.nav-link'); // O link principal que ativa o dropdown
            
            // Lógica para mobile (clique para alternar dropdown)
            link.addEventListener('click', (e) => {
                if (window.innerWidth < 992) { // Apenas em telas menores que desktop
                    e.preventDefault(); // Impede a navegação para #
                    
                    // Fecha outros dropdowns abertos para evitar múltiplos abertos
                    const otherDropdowns = document.querySelectorAll('.nav-item.has-dropdown.active');
                    otherDropdowns.forEach(otherItem => {
                        if (otherItem !== item) { // Se não for o item clicado
                            otherItem.classList.remove('active');
                        }
                    });
                    
                    // Alterna a classe 'active' para abrir/fechar o dropdown atual
                    item.classList.toggle('active');
                    
                    console.log('Dropdown mobile', item.classList.contains('active') ? 'aberto' : 'fechado');
                }
            });
            
            // Lógica para desktop (hover para abrir dropdown)
            if (window.innerWidth >= 992) {
                item.addEventListener('mouseenter', () => {
                    item.classList.add('active');
                });
                
                item.addEventListener('mouseleave', () => {
                    item.classList.remove('active');
                });
            }
            
            // Suporte a teclado para links de dropdown
            link.addEventListener('keydown', (e) => {
                // Abre/fecha dropdown com Enter/Espaço no mobile
                if (e.key === 'Enter' || e.key === ' ') {
                    if (window.innerWidth < 992) {
                        e.preventDefault();
                        item.classList.toggle('active');
                    }
                }
                
                // Navega para o primeiro item do dropdown com Seta para Baixo
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    const dropdown = item.querySelector('.dropdown-menu');
                    if (dropdown) {
                        const firstItem = dropdown.querySelector('.dropdown-item');
                        if (firstItem) firstItem.focus();
                    }
                }
            });
        });
        
        // Navegação por teclado dentro dos itens do dropdown
        const dropdownItems2 = document.querySelectorAll('.dropdown-item');
        dropdownItems2.forEach((item, index, items) => {
            item.addEventListener('keydown', (e) => {
                // Navega para o próximo item do dropdown com Seta para Baixo
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    const nextItem = items[index + 1];
                    if (nextItem) nextItem.focus();
                }
                
                // Navega para o item anterior do dropdown com Seta para Cima
                if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    const prevItem = items[index - 1];
                    if (prevItem) {
                        prevItem.focus();
                    } else {
                        // Se for o primeiro item, volta para o link principal do dropdown
                        const parentNav = item.closest('.nav-item');
                        const parentLink = parentNav.querySelector('.nav-link');
                        if (parentLink) parentLink.focus();
                    }
                }
            });
        });
    }
    
    // ========================================
    // NAVEGAÇÃO SUAVE (Smooth Scroll)
    // ========================================
    initSmoothScroll() {
        // Seleciona todos os links que começam com "#" (links de âncora)
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault(); // Previne o comportamento padrão do link
                const target = document.querySelector(anchor.getAttribute('href')); // Encontra o elemento alvo
                
                if (target) {
                    const headerHeight = document.querySelector('.header').offsetHeight; // Altura do cabeçalho fixo
                    // Calcula a posição do alvo, descontando a altura do cabeçalho e um pequeno offset
                    const targetPosition = target.offsetTop - headerHeight - 20;
                    
                    // Rola a página suavemente para a posição calculada
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
    
    // ========================================
    // ANIMAÇÕES (Intersection Observer para efeitos de fade-in)
    // ========================================
    initAnimations() {
        // Opções para o Intersection Observer
        const observerOptions = {
            threshold: 0.1, // Elemento visível em 10% para ativar
            rootMargin: '0px 0px -50px 0px' // Margem para carregar antes de realmente entrar na viewport
        };
        
        // Callback que será executado quando um elemento observado entra/sai da viewport
        const observerCallback = (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) { // Se o elemento está visível
                    entry.target.classList.add('fade-in'); // Adiciona a classe de animação
                    observer.unobserve(entry.target); // Deixa de observar (anima uma vez só)
                }
            });
        };
        
        const observer = new IntersectionObserver(observerCallback, observerOptions);
        
        // Observa elementos específicos para aplicar animações
        document.querySelectorAll('.category-card, .content-section, .hero-content, .section-title, .page-header').forEach(el => {
            observer.observe(el);
        });
    }
    
    // ========================================
    // NAVEGAÇÃO POR TECLADO (Aprimoramentos de foco e atalhos)
    // ========================================
    initKeyboardNavigation() {
        // Atalhos de teclado específicos do main.js (evita conflitos com accessibility.js)
        document.addEventListener('keydown', (e) => {
            // Alt + M: Alternar o menu mobile (hamburger)
            if (e.altKey && e.key === 'm') {
                e.preventDefault(); // Previne o comportamento padrão do navegador
                const navToggle = document.querySelector('.nav-toggle');
                if (navToggle) navToggle.click();
            }
            
            // Alt + H: Ir para o topo da página
            if (e.altKey && e.key === 'h') {
                e.preventDefault();
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
                this.showToast('Rolando para o topo da página', 'info');
            }
        });
        
        // Adiciona/remove uma classe ao <body> para indicar que o usuário está navegando via teclado.
        // Isso permite aplicar estilos de foco diferentes para navegação por teclado vs. mouse.
        document.body.addEventListener('focusin', function(e) {
            // Verifica se o foco foi dado por um clique do mouse ou por tab/teclado
            if (e.detail === 0) { // e.detail é 0 para foco via teclado, >0 para foco via mouse click
                document.body.classList.add('keyboard-nav-active');
            }
        });
        
        document.body.addEventListener('mousedown', function() {
            // Remove a classe se o usuário clicar com o mouse, assumindo que a navegação por teclado foi interrompida.
            document.body.classList.remove('keyboard-nav-active');
        });
        
        console.log('⌨️ Atalhos de Navegação Adicionais (main.js):');
        console.log('  Alt + M = Abrir/fechar menu mobile');
        console.log('  Alt + H = Ir para o topo da página');
    }
    
    // ========================================
    // UTILITÁRIOS (Função para mostrar toasts/mensagens)
    // ========================================
    showToast(message, type = 'info') {
        // Remove qualquer toast existente para evitar sobreposição
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`; // Adiciona classes de estilo e tipo (success, error, info)
        toast.textContent = message; // Define o texto da mensagem
        toast.setAttribute('role', 'alert'); // Para leitores de tela
        toast.setAttribute('aria-live', 'polite'); // Informa ao leitor de tela para anunciar a mensagem suavemente
        
        document.body.appendChild(toast); // Adiciona o toast ao corpo do documento
        
        // Força o reflow para garantir a animação
        void toast.offsetWidth; 
        
        // Mostra o toast (adiciona a classe 'show' que inicia a transição CSS)
        toast.classList.add('show');
        
        // Remove o toast após 3 segundos
        setTimeout(() => {
            toast.classList.remove('show'); // Inicia a transição de saída
            // Remove o elemento do DOM após a transição de saída (0.3s definido no CSS)
            setTimeout(() => {
                if (document.body.contains(toast)) { // Verifica se ainda está no DOM
                    document.body.removeChild(toast);
                }
            }, 300); 
        }, 3000); // Duração total em que o toast fica visível
    }
}

// Inicializa a classe principal quando o DOM estiver completamente carregado
document.addEventListener('DOMContentLoaded', () => {
    window.clubeAmizade = new ClubeAmizade(); // Instancia o objeto principal
});

// Expõe a função showToast globalmente para que outros scripts (como accessibility.js) possam usá-la
window.showToast = function(message, type) {
    if (window.clubeAmizade) {
        window.clubeAmizade.showToast(message, type);
    }
};