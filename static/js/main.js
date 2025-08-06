/* static/js/main.js */
/**
 * CLUBE DA AMIZADE PE. ANTÔNIO GONÇALVES
 * JavaScript Principal - Simplificado para 60+
 */

class ClubeAmizade {
    constructor() {
        this.isMenuOpen = false;
        this.init();
    }
    
    init() {
        console.log('🎉 Clube da Amizade - Sistema inicializado!');
        
        this.initNavigation();
        this.initSmoothScroll();
        this.initAnimations();
        this.initKeyboardNavigation();
        
        console.log('✅ Sistema carregado com sucesso!');
    }
    
    // Navegação principal
    initNavigation() {
        const navToggle = document.querySelector('.nav-toggle');
        const mainNav = document.querySelector('.main-nav');
        
        if (navToggle && mainNav) {
            navToggle.addEventListener('click', () => this.toggleMenu());
            
            // Fecha menu ao clicar fora
            document.addEventListener('click', (e) => {
                if (!navToggle.contains(e.target) && !mainNav.contains(e.target)) {
                    this.closeMenu();
                }
            });
            
            // Fecha menu ao redimensionar
            window.addEventListener('resize', () => {
                if (window.innerWidth >= 768) {
                    this.closeMenu();
                }
            });
        }
        
        this.initDropdowns();
    }
    
    toggleMenu() {
        if (this.isMenuOpen) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }
    
    openMenu() {
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
        }
    }
    
    closeMenu() {
        const navToggle = document.querySelector('.nav-toggle');
        const mainNav = document.querySelector('.main-nav');
        
        if (navToggle && mainNav) {
            navToggle.classList.remove('active');
            mainNav.classList.remove('active');
            navToggle.setAttribute('aria-expanded', 'false');
            this.isMenuOpen = false;
            
            // Fecha dropdowns
            document.querySelectorAll('.nav-item.has-dropdown.active').forEach(item => {
                item.classList.remove('active');
            });
        }
    }
    
    // Dropdowns
    initDropdowns() {
        const dropdownItems = document.querySelectorAll('.nav-item.has-dropdown');
        
        dropdownItems.forEach(item => {
            const link = item.querySelector('.nav-link');
            
            // Mobile - clique para alternar
            link.addEventListener('click', (e) => {
                if (window.innerWidth < 768) {
                    e.preventDefault();
                    
                    // Fecha outros dropdowns
                    document.querySelectorAll('.nav-item.has-dropdown.active').forEach(otherItem => {
                        if (otherItem !== item) {
                            otherItem.classList.remove('active');
                        }
                    });
                    
                    item.classList.toggle('active');
                }
            });
            
            // Navegação por teclado
            link.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    if (window.innerWidth < 768) {
                        e.preventDefault();
                        item.classList.toggle('active');
                    }
                }
                
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
        
        // Navegação nos itens do dropdown
        document.querySelectorAll('.dropdown-item').forEach((item, index, items) => {
            item.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    const nextItem = items[index + 1];
                    if (nextItem) nextItem.focus();
                }
                
                if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    const prevItem = items[index - 1];
                    if (prevItem) {
                        prevItem.focus();
                    } else {
                        const parentNav = item.closest('.nav-item');
                        const parentLink = parentNav.querySelector('.nav-link');
                        if (parentLink) parentLink.focus();
                    }
                }
            });
        });
    }
    
    // Rolagem suave
    initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                
                if (target) {
                    const headerHeight = document.querySelector('.header').offsetHeight;
                    const targetPosition = target.offsetTop - headerHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
    
    // Animações
    initAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observerCallback = (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                    observer.unobserve(entry.target);
                }
            });
        };
        
        const observer = new IntersectionObserver(observerCallback, observerOptions);
        
        document.querySelectorAll('.category-card, .content-section, .hero-content, .section-title, .page-header').forEach(el => {
            observer.observe(el);
        });
    }
    
    // Navegação por teclado
    initKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Alt + M: Toggle menu mobile
            if (e.altKey && e.key === 'm') {
                e.preventDefault();
                const navToggle = document.querySelector('.nav-toggle');
                if (navToggle) navToggle.click();
            }
            
            // Alt + H: Ir para o topo
            if (e.altKey && e.key === 'h') {
                e.preventDefault();
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
                this.showToast('Indo para o topo da página', 'info');
            }
            
            // Escape: Fechar menu
            if (e.key === 'Escape' && this.isMenuOpen) {
                this.closeMenu();
                document.querySelector('.nav-toggle').focus();
            }
        });
    }
    
    // Toast notifications
    showToast(message, type = 'info') {
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'polite');
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
}

// Inicializar quando DOM carregar
document.addEventListener('DOMContentLoaded', () => {
    window.clubeAmizade = new ClubeAmizade();
});

// Expor função showToast globalmente
window.showToast = function(message, type) {
    if (window.clubeAmizade) {
        window.clubeAmizade.showToast(message, type);
    }
};