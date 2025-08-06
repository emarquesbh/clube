/* static/js/main.js */
/**
 * CLUBE DA AMIZADE PE. ANTÔNIO GONÇALVES
 * JavaScript Principal - Otimizado para 60+
 */

class ClubeAmizadeMain {
    constructor() {
        this.isMenuOpen = false;
        this.activeDropdown = null;
        this.init();
    }
    
    init() {
        console.log('🎉 Clube da Amizade - Sistema inicializado!');
        
        // Aguardar DOM estar completamente carregado
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupComponents();
            });
        } else {
            this.setupComponents();
        }
    }
    
    setupComponents() {
        this.initNavigation();
        this.initSmoothScroll();
        this.initAnimations();
        this.initKeyboardNavigation();
        this.initFormEnhancements();
        
        console.log('✅ Todos os componentes carregados com sucesso!');
        
        // Mostrar toast de boas-vindas
        setTimeout(() => {
            this.showToast('Bem-vindo ao Clube da Amizade! Use Alt+H para ver os atalhos.', 'info');
        }, 1000);
    }
    
    // ========================================
    // NAVEGAÇÃO PRINCIPAL
    // ========================================
    
    initNavigation() {
        const navToggle = document.querySelector('.nav-toggle');
        const mainNav = document.querySelector('.main-nav');
        
        if (navToggle && mainNav) {
            // Toggle do menu mobile
            navToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleMobileMenu();
            });
            
            // Fechar menu ao clicar fora
            document.addEventListener('click', (e) => {
                if (!navToggle.contains(e.target) && !mainNav.contains(e.target)) {
                    this.closeMobileMenu();
                }
            });
            
            // Fechar menu ao redimensionar para desktop
            window.addEventListener('resize', () => {
                if (window.innerWidth >= 768) {
                    this.closeMobileMenu();
                }
            });
        }
        
        this.initDropdowns();
    }
    
    toggleMobileMenu() {
        const navToggle = document.querySelector('.nav-toggle');
        const mainNav = document.querySelector('.main-nav');
        
        if (this.isMenuOpen) {
            this.closeMobileMenu();
        } else {
            this.openMobileMenu();
        }
    }
    
    openMobileMenu() {
        const navToggle = document.querySelector('.nav-toggle');
        const mainNav = document.querySelector('.main-nav');
        
        if (navToggle && mainNav) {
            navToggle.classList.add('active');
            mainNav.classList.add('active');
            navToggle.setAttribute('aria-expanded', 'true');
            this.isMenuOpen = true;
            
            // Foco no primeiro link
            const firstLink = mainNav.querySelector('.nav-link');
            if (firstLink) {
                setTimeout(() => firstLink.focus(), 100);
            }
            
            // Prevenir scroll do body
            document.body.style.overflow = 'hidden';
        }
    }
    
    closeMobileMenu() {
        const navToggle = document.querySelector('.nav-toggle');
        const mainNav = document.querySelector('.main-nav');
        
        if (navToggle && mainNav) {
            navToggle.classList.remove('active');
            mainNav.classList.remove('active');
            navToggle.setAttribute('aria-expanded', 'false');
            this.isMenuOpen = false;
            
            // Restaurar scroll do body
            document.body.style.overflow = '';
            
            // Fechar todos os dropdowns
            this.closeAllDropdowns();
        }
    }
    
    // ========================================
    // DROPDOWNS
    // ========================================
    
    initDropdowns() {
        const dropdownItems = document.querySelectorAll('.nav-item.has-dropdown');
        
        dropdownItems.forEach(item => {
            const link = item.querySelector('.nav-link');
            
            if (!link) return;
            
            // Mobile - clique para alternar (accordion)
            link.addEventListener('click', (e) => {
                if (window.innerWidth < 768) {
                    e.preventDefault();
                    this.toggleDropdown(item);
                }
            });
            
            // Desktop - hover
            if (window.innerWidth >= 768) {
                item.addEventListener('mouseenter', () => {
                    this.openDropdown(item);
                });
                
                item.addEventListener('mouseleave', () => {
                    this.closeDropdown(item);
                });
            }
            
            // Navegação por teclado
            link.addEventListener('keydown', (e) => {
                this.handleDropdownKeyboard(e, item);
            });
        });
        
        // Navegação nos itens do dropdown
        document.querySelectorAll('.dropdown-item').forEach((item, index, items) => {
            item.addEventListener('keydown', (e) => {
                this.handleDropdownItemKeyboard(e, item, index, items);
            });
        });
    }
    
    toggleDropdown(item) {
        if (item.classList.contains('active')) {
            this.closeDropdown(item);
        } else {
            this.closeAllDropdowns();
            this.openDropdown(item);
        }
    }
    
    openDropdown(item) {
        item.classList.add('active');
        this.activeDropdown = item;
    }
    
    closeDropdown(item) {
        item.classList.remove('active');
        if (this.activeDropdown === item) {
            this.activeDropdown = null;
        }
    }
    
    closeAllDropdowns() {
        document.querySelectorAll('.nav-item.has-dropdown.active').forEach(item => {
            this.closeDropdown(item);
        });
    }
    
    handleDropdownKeyboard(e, item) {
        switch (e.key) {
            case 'Enter':
            case ' ':
                if (window.innerWidth < 768) {
                    e.preventDefault();
                    this.toggleDropdown(item);
                }
                break;
                
            case 'ArrowDown':
                e.preventDefault();
                const dropdown = item.querySelector('.dropdown-menu');
                if (dropdown) {
                    const firstItem = dropdown.querySelector('.dropdown-item');
                    if (firstItem) {
                        this.openDropdown(item);
                        firstItem.focus();
                    }
                }
                break;
                
            case 'Escape':
                this.closeDropdown(item);
                break;
        }
    }
    
    handleDropdownItemKeyboard(e, item, index, items) {
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                const nextItem = items[index + 1];
                if (nextItem) {
                    nextItem.focus();
                }
                break;
                
            case 'ArrowUp':
                e.preventDefault();
                const prevItem = items[index - 1];
                if (prevItem) {
                    prevItem.focus();
                } else {
                    const parentNav = item.closest('.nav-item');
                    const parentLink = parentNav?.querySelector('.nav-link');
                    if (parentLink) parentLink.focus();
                }
                break;
                
            case 'Escape':
                const parentNav = item.closest('.nav-item');
                if (parentNav) {
                    this.closeDropdown(parentNav);
                    const parentLink = parentNav.querySelector('.nav-link');
                    if (parentLink) parentLink.focus();
                }
                break;
        }
    }
    
    // ========================================
    // ROLAGEM SUAVE
    // ========================================
    
    initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const href = anchor.getAttribute('href');
                if (href === '#') return;
                
                e.preventDefault();
                const target = document.querySelector(href);
                
                if (target) {
                    const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
                    const targetPosition = target.offsetTop - headerHeight - 20;
                    
                    window.scrollTo({
                        top: Math.max(0, targetPosition),
                        behavior: 'smooth'
                    });
                    
                    // Foco no elemento de destino para acessibilidade
                    setTimeout(() => {
                        target.focus();
                    }, 500);
                }
            });
        });
    }
    
    // ========================================
    // ANIMAÇÕES
    // ========================================
    
    initAnimations() {
        // Intersection Observer para animações
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observerCallback = (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                    
                    // Animar cards com delay
                    if (entry.target.classList.contains('category-card')) {
                        const cards = document.querySelectorAll('.category-card');
                        cards.forEach((card, index) => {
                            setTimeout(() => {
                                card.classList.add('slide-in');
                            }, index * 100);
                        });
                    }
                }
            });
        };
        
        const observer = new IntersectionObserver(observerCallback, observerOptions);
        
        // Observar elementos para animação
        const elementsToAnimate = document.querySelectorAll(
            '.category-card, .content-section, .hero-content, .section-title, .page-header'
        );
        
        elementsToAnimate.forEach(el => {
            observer.observe(el);
        });
    }
    
    // ========================================
    // NAVEGAÇÃO POR TECLADO
    // ========================================
    
    initKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Alt + M: Toggle menu mobile
            if (e.altKey && e.key.toLowerCase() === 'm') {
                e.preventDefault();
                const navToggle = document.querySelector('.nav-toggle');
                if (navToggle && window.innerWidth < 768) {
                    navToggle.click();
                }
            }
            
            // Alt + H: Mostrar atalhos
            if (e.altKey && e.key.toLowerCase() === 'h') {
                e.preventDefault();
                this.showKeyboardShortcuts();
            }
            
            // Alt + 1: Ir para o conteúdo principal
            if (e.altKey && e.key === '1') {
                e.preventDefault();
                const mainContent = document.querySelector('#main-content');
                if (mainContent) {
                    mainContent.focus();
                    mainContent.scrollIntoView({ behavior: 'smooth' });
                }
            }
            
            // Escape: Fechar menu e dropdowns
            if (e.key === 'Escape') {
                if (this.isMenuOpen) {
                    this.closeMobileMenu();
                    const navToggle = document.querySelector('.nav-toggle');
                    if (navToggle) navToggle.focus();
                } else {
                    this.closeAllDropdowns();
                }
            }
            
            // Tab: Melhorar navegação
            if (e.key === 'Tab') {
                this.handleTabNavigation(e);
            }
        });
    }
    
    handleTabNavigation(e) {
        // Garantir que elementos focáveis sejam visíveis
        const focusableElements = document.querySelectorAll(
            'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
        );
        
        focusableElements.forEach(el => {
            el.addEventListener('focus', () => {
                // Scroll para elemento focado se necessário
                const rect = el.getBoundingClientRect();
                if (rect.top < 0 || rect.bottom > window.innerHeight) {
                    el.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'center' 
                    });
                }
            });
        });
    }
    
    showKeyboardShortcuts() {
        const shortcuts = [
            'Alt + H: Mostrar atalhos',
            'Alt + M: Abrir/fechar menu (mobile)',
            'Alt + T: Alternar tema claro/escuro',
            'Alt + R: Iniciar/parar leitura',
            'Alt + +: Aumentar fonte',
            'Alt + -: Diminuir fonte',
            'Alt + 0: Resetar fonte',
            'Alt + 1: Ir para conteúdo principal',
            'Tab: Navegar entre elementos',
            'Escape: Fechar menus',
            'Setas: Navegar em dropdowns'
        ];
        
        const message = 'Atalhos de Teclado:\n\n' + shortcuts.join('\n');
        
        // Criar modal simples para atalhos
        this.showModal('Atalhos de Teclado', shortcuts);
    }
    
    // ========================================
    // MELHORIAS EM FORMULÁRIOS
    // ========================================
    
    initFormEnhancements() {
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            // Validação em tempo real
            const inputs = form.querySelectorAll('input, textarea, select');
            
            inputs.forEach(input => {
                // Feedback visual para campos obrigatórios
                if (input.hasAttribute('required')) {
                    input.addEventListener('blur', () => {
                        this.validateField(input);
                    });
                    
                    input.addEventListener('input', () => {
                        if (input.classList.contains('error')) {
                            this.validateField(input);
                        }
                    });
                }
                
                // Melhorar acessibilidade
                input.addEventListener('focus', () => {
                    const label = form.querySelector(`label[for="${input.id}"]`);
                    if (label) {
                        label.style.color = 'var(--primary-color)';
                    }
                });
                
                input.addEventListener('blur', () => {
                    const label = form.querySelector(`label[for="${input.id}"]`);
                    if (label) {
                        label.style.color = '';
                    }
                });
            });
            
            // Submissão do formulário
            form.addEventListener('submit', (e) => {
                if (!this.validateForm(form)) {
                    e.preventDefault();
                    this.showToast('Por favor, corrija os erros no formulário', 'error');
                }
            });
        });
    }
    
    validateField(field) {
        const isValid = field.checkValidity();
        
        if (isValid) {
            field.classList.remove('error');
            field.classList.add('success');
        } else {
            field.classList.remove('success');
            field.classList.add('error');
        }
        
        return isValid;
    }
    
    validateForm(form) {
        const fields = form.querySelectorAll('input[required], textarea[required], select[required]');
        let isValid = true;
        
        fields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });
        
        return isValid;
    }
    
    // ========================================
    // MODAL SIMPLES
    // ========================================
    
    showModal(title, content) {
        // Remover modal existente
        const existingModal = document.querySelector('.simple-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Criar modal
        const modal = document.createElement('div');
        modal.className = 'simple-modal';
        modal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>${title}</h3>
                        <button class="modal-close" aria-label="Fechar modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        ${Array.isArray(content) ? 
                            '<ul>' + content.map(item => `<li>${item}</li>`).join('') + '</ul>' :
                            `<p>${content}</p>`
                        }
                    </div>
                </div>
            </div>
        `;
        
        // Estilos do modal
        const style = document.createElement('style');
        style.textContent = `
            .simple-modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: var(--space-4);
            }
            
            .modal-overlay {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                backdrop-filter: blur(4px);
            }
            
            .modal-content {
                background: var(--bg-color);
                border: 2px solid var(--border-color);
                border-radius: 12px;
                max-width: 500px;
                width: 100%;
                max-height: 80vh;
                overflow-y: auto;
                position: relative;
                z-index: 1;
                box-shadow: var(--shadow-hover);
            }
            
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: var(--space-6);
                border-bottom: 1px solid var(--border-color);
            }
            
            .modal-header h3 {
                margin: 0;
                color: var(--primary-color);
                font-size: var(--font-xl);
            }
            
            .modal-close {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: var(--text-secondary);
                padding: var(--space-2);
                border-radius: 4px;
                transition: var(--transition);
            }
            
            .modal-close:hover,
            .modal-close:focus {
                background: var(--card-bg);
                color: var(--text-color);
                outline: none;
            }
            
            .modal-body {
                padding: var(--space-6);
            }
            
            .modal-body ul {
                list-style: none;
                padding: 0;
            }
            
            .modal-body li {
                padding: var(--space-2) 0;
                border-bottom: 1px solid var(--border-color);
                font-family: monospace;
                font-size: var(--font-small);
            }
            
            .modal-body li:last-child {
                border-bottom: none;
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(modal);
        
        // Event listeners
        const closeBtn = modal.querySelector('.modal-close');
        const overlay = modal.querySelector('.modal-overlay');
        
        const closeModal = () => {
            modal.remove();
            style.remove();
        };
        
        closeBtn.addEventListener('click', closeModal);
        overlay.addEventListener('click', closeModal);
        
        // Fechar com Escape
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        
        document.addEventListener('keydown', handleEscape);
        
        // Foco no botão fechar
        setTimeout(() => closeBtn.focus(), 100);
    }
    
    // ========================================
    // TOAST NOTIFICATIONS
    // ========================================
    
    showToast(message, type = 'info', duration = 4000) {
        // Remover toast existente
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }
        
        // Criar toast
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'polite');
        
        // Ícones para diferentes tipos
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        
        toast.innerHTML = `
            <span class="toast-icon">${icons[type] || icons.info}</span>
            <span class="toast-message">${message}</span>
            <button class="toast-close" aria-label="Fechar notificação">&times;</button>
        `;
        
        // Estilos adicionais para o toast
        const toastStyles = `
            .toast {
                display: flex;
                align-items: center;
                gap: var(--space-3);
                font-size: var(--font-base);
                line-height: 1.4;
            }
            
            .toast-icon {
                font-size: var(--font-large);
                flex-shrink: 0;
            }
            
            .toast-message {
                flex: 1;
            }
            
            .toast-close {
                background: none;
                border: none;
                font-size: var(--font-large);
                cursor: pointer;
                color: var(--text-secondary);
                padding: var(--space-1);
                border-radius: 4px;
                transition: var(--transition);
                flex-shrink: 0;
            }
            
            .toast-close:hover,
            .toast-close:focus {
                background: rgba(0, 0, 0, 0.1);
                color: var(--text-color);
                outline: none;
            }
        `;
        
        // Adicionar estilos se não existirem
        if (!document.querySelector('#toast-styles')) {
            const style = document.createElement('style');
            style.id = 'toast-styles';
            style.textContent = toastStyles;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(toast);
        
        // Mostrar toast
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        // Fechar toast
        const closeToast = () => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }, 300);
        };
        
        // Event listeners
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', closeToast);
        
        // Auto fechar
        if (duration > 0) {
            setTimeout(closeToast, duration);
        }
        
        return toast;
    }
    
    // ========================================
    // UTILITÁRIOS
    // ========================================
    
    // Debounce para otimizar performance
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // Throttle para eventos de scroll
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
}

// Inicializar quando DOM carregar
document.addEventListener('DOMContentLoaded', () => {
    window.clubeAmizadeMain = new ClubeAmizadeMain();
});

// Expor funções globalmente para compatibilidade
window.showToast = function(message, type, duration) {
    if (window.clubeAmizadeMain) {
        return window.clubeAmizadeMain.showToast(message, type, duration);
    }
};

window.showModal = function(title, content) {
    if (window.clubeAmizadeMain) {
        return window.clubeAmizadeMain.showModal(title, content);
    }
};