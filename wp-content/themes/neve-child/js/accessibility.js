/**
 * Script de Acessibilidade - Clube da Amizade
 * @author Eduardo Marques
 * @version 1.0.0
 */

(function($) {
    'use strict';

    /**
     * ==========================================================================
     * INICIALIZAÇÃO
     * ==========================================================================
     */
    
    $(document).ready(function() {
        AccessibilityManager.init();
    });

    /**
     * ==========================================================================
     * GERENCIADOR DE ACESSIBILIDADE
     * ==========================================================================
     */
    
    const AccessibilityManager = {
        
        // Configurações padrão
        settings: {
            fontSize: 'medium',
            darkMode: false,
            highContrast: false,
            keyboardNavigation: false
        },
        
        // Elementos DOM
        elements: {
            body: $('body'),
            toolbar: $('#accessibility-toolbar'),
            toggle: $('#accessibility-toggle'),
            fontIncrease: $('#font-increase'),
            fontDecrease: $('#font-decrease'),
            darkModeToggle: $('#dark-mode-toggle'),
            highContrastToggle: $('#high-contrast-toggle'),
            resetButton: $('#reset-accessibility')
        },
        
        /**
         * Inicializar o gerenciador de acessibilidade
         */
        init: function() {
            this.loadPreferences();
            this.bindEvents();
            this.setupKeyboardNavigation();
            this.setupScreenReader();
            this.applyInitialSettings();
            
            console.log('✅ Gerenciador de Acessibilidade inicializado');
        },
        
        /**
         * ==========================================================================
         * EVENTOS
         * ==========================================================================
         */
        
        /**
         * Vincular eventos aos elementos
         */
        bindEvents: function() {
            const self = this;
            
            // Toggle da toolbar
            this.elements.toggle.on('click', function() {
                self.toggleToolbar();
            });
            
            // Controles de fonte
            this.elements.fontIncrease.on('click', function() {
                self.increaseFontSize();
            });
            
            this.elements.fontDecrease.on('click', function() {
                self.decreaseFontSize();
            });
            
            // Modo escuro
            this.elements.darkModeToggle.on('click', function() {
                self.toggleDarkMode();
            });
            
            // Alto contraste
            this.elements.highContrastToggle.on('click', function() {
                self.toggleHighContrast();
            });
            
            // Reset
            this.elements.resetButton.on('click', function() {
                self.resetSettings();
            });
            
            // Navegação por teclado
            $(document).on('keydown', function(e) {
                self.handleKeyboardNavigation(e);
            });
            
            // Detectar uso do mouse
            $(document).on('mousedown', function() {
                self.elements.body.removeClass('keyboard-navigation');
            });
        },
        
        /**
         * ==========================================================================
         * CONTROLES DE FONTE
         * ==========================================================================
         */
        
        /**
         * Aumentar tamanho da fonte
         */
        increaseFontSize: function() {
            const sizes = ['small', 'medium', 'large', 'xl'];
            const currentIndex = sizes.indexOf(this.settings.fontSize);
            
            if (currentIndex < sizes.length - 1) {
                this.setFontSize(sizes[currentIndex + 1]);
                this.announceToScreenReader(neve_child_ajax.strings.font_increased);
            }
        },
        
        /**
         * Diminuir tamanho da fonte
         */
        decreaseFontSize: function() {
            const sizes = ['small', 'medium', 'large', 'xl'];
            const currentIndex = sizes.indexOf(this.settings.fontSize);
            
            if (currentIndex > 0) {
                this.setFontSize(sizes[currentIndex - 1]);
                this.announceToScreenReader(neve_child_ajax.strings.font_decreased);
            }
        },
        
        /**
         * Definir tamanho da fonte
         */
        setFontSize: function(size) {
            // Remover classes anteriores
            this.elements.body.removeClass('font-size-small font-size-medium font-size-large font-size-xl');
            
            // Adicionar nova classe
            this.elements.body.addClass('font-size-' + size);
            
            // Atualizar configuração
            this.settings.fontSize = size;
            
            // Salvar preferência
            this.savePreferences();
        },
        
        /**
         * ==========================================================================
         * MODO ESCURO
         * ==========================================================================
         */
        
        /**
         * Alternar modo escuro
         */
        toggleDarkMode: function() {
            this.settings.darkMode = !this.settings.darkMode;
            
            if (this.settings.darkMode) {
                this.elements.body.addClass('dark-mode');
                this.announceToScreenReader(neve_child_ajax.strings.dark_mode_on);
            } else {
                this.elements.body.removeClass('dark-mode');
                this.announceToScreenReader(neve_child_ajax.strings.dark_mode_off);
            }
            
            this.savePreferences();
        },
        
        /**
         * ==========================================================================
         * ALTO CONTRASTE
         * ==========================================================================
         */
        
        /**
         * Alternar alto contraste
         */
        toggleHighContrast: function() {
            this.settings.highContrast = !this.settings.highContrast;
            
            if (this.settings.highContrast) {
                this.elements.body.addClass('high-contrast');
                this.announceToScreenReader(neve_child_ajax.strings.high_contrast_on);
            } else {
                this.elements.body.removeClass('high-contrast');
                this.announceToScreenReader(neve_child_ajax.strings.high_contrast_off);
            }
            
            this.savePreferences();
        },
        
        /**
         * ==========================================================================
         * NAVEGAÇÃO POR TECLADO
         * ==========================================================================
         */
        
        /**
         * Configurar navegação por teclado
         */
        setupKeyboardNavigation: function() {
            // Adicionar indicadores visuais quando usar Tab
            $(document).on('keydown', (e) => {
                if (e.key === 'Tab') {
                    this.elements.body.addClass('keyboard-navigation');
                    this.settings.keyboardNavigation = true;
                }
            });
        },
        
        /**
         * Gerenciar navegação por teclado
         */
        handleKeyboardNavigation: function(e) {
            // Esc para fechar toolbar
            if (e.key === 'Escape') {
                if (!this.elements.toolbar.hasClass('hidden')) {
                    this.toggleToolbar();
                }
            }
            
            // Alt + A para abrir toolbar de acessibilidade
            if (e.altKey && e.key === 'a') {
                e.preventDefault();
                this.toggleToolbar();
                this.elements.toggle.focus();
            }
            
            // Alt + 1 para ir ao conteúdo principal
            if (e.altKey && e.key === '1') {
                e.preventDefault();
                $('#main').focus();
            }
            
            // Alt + 2 para ir ao menu
            if (e.altKey && e.key === '2') {
                e.preventDefault();
                $('#primary-menu').focus();
            }
        },
        
        /**
         * ==========================================================================
         * TOOLBAR
         * ==========================================================================
         */
        
        /**
         * Alternar visibilidade da toolbar
         */
        toggleToolbar: function() {
            this.elements.toolbar.toggleClass('hidden');
            
            // Atualizar ARIA
            const isHidden = this.elements.toolbar.hasClass('hidden');
            this.elements.toggle.attr('aria-expanded', !isHidden);
            
            // Focar no primeiro botão quando abrir
            if (!isHidden) {
                this.elements.toolbar.find('button:first').focus();
            }
        },
        
        /**
         * ==========================================================================
         * SCREEN READER
         * ==========================================================================
         */
        
        /**
         * Configurar anúncios para leitores de tela
         */
        setupScreenReader: function() {
            // Criar região para anúncios
            if ($('#accessibility-announcer').length === 0) {
                $('body').append('<div id="accessibility-announcer" aria-live="polite" aria-atomic="true" class="screen-reader-text"></div>');
            }
        },
        
        /**
         * Anunciar mensagem para leitores de tela
         */
        announceToScreenReader: function(message) {
            const announcer = $('#accessibility-announcer');
            announcer.text(message);
            
            // Limpar após 1 segundo
            setTimeout(() => {
                announcer.text('');
            }, 1000);
        },
        
        /**
         * ==========================================================================
         * PERSISTÊNCIA
         * ==========================================================================
         */
        
        /**
         * Salvar preferências
         */
        savePreferences: function() {
            const preferences = JSON.stringify(this.settings);
            
            // Salvar no localStorage
            localStorage.setItem('neve_child_accessibility', preferences);
            
            // Salvar no servidor via AJAX
            $.post(neve_child_ajax.ajax_url, {
                action: 'save_accessibility_preferences',
                nonce: neve_child_ajax.nonce,
                preferences: preferences
            });
        },
        
        /**
         * Carregar preferências
         */
        loadPreferences: function() {
            // Tentar carregar do localStorage primeiro
            const stored = localStorage.getItem('neve_child_accessibility');
            
            if (stored) {
                try {
                    this.settings = { ...this.settings, ...JSON.parse(stored) };
                } catch (e) {
                    console.warn('Erro ao carregar preferências de acessibilidade:', e);
                }
            }
        },
        
        /**
         * Aplicar configurações iniciais
         */
        applyInitialSettings: function() {
            // Aplicar tamanho da fonte
            this.setFontSize(this.settings.fontSize);
            
            // Aplicar modo escuro
            if (this.settings.darkMode) {
                this.elements.body.addClass('dark-mode');
            }
            
            // Aplicar alto contraste
            if (this.settings.highContrast) {
                this.elements.body.addClass('high-contrast');
            }
        },
        
        /**
         * Resetar todas as configurações
         */
        resetSettings: function() {
            // Resetar para padrão
            this.settings = {
                fontSize: 'medium',
                darkMode: false,
                highContrast: false,
                keyboardNavigation: false
            };
            
            // Remover todas as classes
            this.elements.body.removeClass('font-size-small font-size-medium font-size-large font-size-xl dark-mode high-contrast keyboard-navigation');
            
            // Aplicar configurações padrão
            this.applyInitialSettings();
            
            // Limpar localStorage
            localStorage.removeItem('neve_child_accessibility');
            
            // Anunciar reset
            this.announceToScreenReader('Configurações de acessibilidade resetadas');
        }
    };

    /**
     * ==========================================================================
     * MELHORIAS ADICIONAIS
     * ==========================================================================
     */
    
    /**
     * Melhorar foco em elementos Elementor
     */
    $(document).ready(function() {
        // Adicionar tabindex em elementos que precisam
        $('.elementor-button').attr('tabindex', '0');
        
        // Melhorar navegação em carrosséis
        $('.elementor-carousel').attr('role', 'region').attr('aria-label', 'Carrossel de conteúdo');
        
        // Adicionar labels em formulários
        $('.elementor-field-group input, .elementor-field-group textarea').each(function() {
            const $this = $(this);
            const $label = $this.siblings('label');
            
            if ($label.length && !$this.attr('aria-labelledby')) {
                const labelId = 'label-' + Math.random().toString(36).substr(2, 9);
                $label.attr('id', labelId);
                $this.attr('aria-labelledby', labelId);
            }
        });
    });
    
    /**
     * Melhorar performance em dispositivos móveis
     */
    if (window.innerWidth <= 768) {
        // Desabilitar animações em mobile para melhor performance
        $('*').css({
            'animation-duration': '0s !important',
            'animation-delay': '0s !important',
            'transition-duration': '0s !important',
            'transition-delay': '0s !important'
        });
    }

})(jQuery);