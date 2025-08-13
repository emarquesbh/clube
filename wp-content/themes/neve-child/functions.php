<?php
/**
 * Tema Filho do Neve - Clube da Amizade Pe. Antônio Gonçalves
 * 
 * @package Neve Child
 * @author Eduardo Marques
 * @version 1.0.0
 */

// Prevenir acesso direto
if (!defined('ABSPATH')) {
    exit;
}

/**
 * ==========================================================================
 * CONFIGURAÇÃO BÁSICA DO TEMA FILHO
 * ==========================================================================
 */

/**
 * Enfileirar estilos do tema pai e filho
 */
function neve_child_enqueue_styles() {
    // Versão do tema para cache busting
    $theme_version = wp_get_theme()->get('Version');
    
    // Carregar CSS do tema pai
    wp_enqueue_style(
        'neve-parent-style',
        get_template_directory_uri() . '/style.css',
        array(),
        $theme_version
    );
    
    // Carregar CSS do tema filho
    wp_enqueue_style(
        'neve-child-style',
        get_stylesheet_directory_uri() . '/style.css',
        array('neve-parent-style'),
        $theme_version
    );
    
    // Carregar JavaScript de acessibilidade
    wp_enqueue_script(
        'neve-child-accessibility',
        get_stylesheet_directory_uri() . '/js/accessibility.js',
        array('jquery'),
        $theme_version,
        true
    );
    
    // Localizar script para AJAX
    wp_localize_script('neve-child-accessibility', 'neve_child_ajax', array(
        'ajax_url' => admin_url('admin-ajax.php'),
        'nonce' => wp_create_nonce('neve_child_nonce'),
        'strings' => array(
            'font_increased' => 'Tamanho da fonte aumentado',
            'font_decreased' => 'Tamanho da fonte diminuído',
            'dark_mode_on' => 'Modo escuro ativado',
            'dark_mode_off' => 'Modo escuro desativado',
            'high_contrast_on' => 'Alto contraste ativado',
            'high_contrast_off' => 'Alto contraste desativado'
        )
    ));
}
add_action('wp_enqueue_scripts', 'neve_child_enqueue_styles');

/**
 * ==========================================================================
 * MELHORIAS DE ACESSIBILIDADE
 * ==========================================================================
 */

/**
 * Adicionar suporte a recursos de acessibilidade
 */
function neve_child_accessibility_setup() {
    // Adicionar suporte a acessibilidade
    add_theme_support('accessibility-ready');
    
    // Adicionar suporte a título dinâmico
    add_theme_support('title-tag');
    
    // Adicionar suporte a imagens destacadas
    add_theme_support('post-thumbnails');
    
    // Adicionar suporte a HTML5
    add_theme_support('html5', array(
        'search-form',
        'comment-form',
        'comment-list',
        'gallery',
        'caption',
        'style',
        'script'
    ));
}
add_action('after_setup_theme', 'neve_child_accessibility_setup');

/**
 * Adicionar skip links no início do body
 */
function neve_child_add_skip_links() {
    ?>
    <div class="skip-links">
        <a class="skip-link screen-reader-text" href="#main" tabindex="1">
            <?php esc_html_e('Pular para o conteúdo principal', 'neve-child'); ?>
        </a>
        <a class="skip-link screen-reader-text" href="#primary-menu" tabindex="2">
            <?php esc_html_e('Pular para o menu principal', 'neve-child'); ?>
        </a>
        <a class="skip-link screen-reader-text" href="#footer" tabindex="3">
            <?php esc_html_e('Pular para o rodapé', 'neve-child'); ?>
        </a>
    </div>
    <?php
}
add_action('wp_body_open', 'neve_child_add_skip_links');

/**
 * Adicionar toolbar de acessibilidade
 */
function neve_child_add_accessibility_toolbar() {
    ?>
    <div class="accessibility-toolbar-toggle" id="accessibility-toggle" aria-label="Abrir ferramentas de acessibilidade" tabindex="4">
        <span aria-hidden="true">♿</span>
    </div>
    
    <div class="accessibility-toolbar hidden" id="accessibility-toolbar" role="toolbar" aria-label="Ferramentas de acessibilidade">
        <button id="font-increase" aria-label="Aumentar tamanho da fonte" title="Aumentar fonte">
            <span aria-hidden="true">A+</span>
        </button>
        <button id="font-decrease" aria-label="Diminuir tamanho da fonte" title="Diminuir fonte">
            <span aria-hidden="true">A-</span>
        </button>
        <button id="dark-mode-toggle" aria-label="Alternar modo escuro" title="Modo escuro">
            <span aria-hidden="true">🌙</span>
        </button>
        <button id="high-contrast-toggle" aria-label="Alternar alto contraste" title="Alto contraste">
            <span aria-hidden="true">◐</span>
        </button>
        <button id="reset-accessibility" aria-label="Resetar configurações de acessibilidade" title="Resetar">
            <span aria-hidden="true">↺</span>
        </button>
    </div>
    <?php
}
add_action('wp_footer', 'neve_child_add_accessibility_toolbar');

/**
 * ==========================================================================
 * MELHORIAS PARA ELEMENTOR
 * ==========================================================================
 */

/**
 * Melhorar acessibilidade do Elementor
 */
function neve_child_elementor_accessibility() {
    // Remover animações desnecessárias para melhor performance
    add_action('elementor/frontend/after_enqueue_styles', function() {
        if (!is_admin() && !wp_is_mobile()) {
            wp_dequeue_style('elementor-animations');
        }
    });
    
    // Adicionar atributos ARIA aos widgets do Elementor
    add_filter('elementor/widget/render_content', function($content, $widget) {
        // Melhorar headings
        if ($widget->get_name() === 'heading') {
            $content = str_replace('<h', '<h role="heading" ', $content);
        }
        
        // Melhorar botões
        if ($widget->get_name() === 'button') {
            $content = str_replace('<a class="elementor-button', '<a role="button" class="elementor-button', $content);
        }
        
        return $content;
    }, 10, 2);
}
add_action('init', 'neve_child_elementor_accessibility');

/**
 * ==========================================================================
 * AJAX HANDLERS PARA ACESSIBILIDADE
 * ==========================================================================
 */

/**
 * Salvar preferências de acessibilidade do usuário
 */
function neve_child_save_accessibility_preferences() {
    // Verificar nonce
    if (!wp_verify_nonce($_POST['nonce'], 'neve_child_nonce')) {
        wp_die('Erro de segurança');
    }
    
    $user_id = get_current_user_id();
    $preferences = sanitize_text_field($_POST['preferences']);
    
    if ($user_id) {
        update_user_meta($user_id, 'accessibility_preferences', $preferences);
    } else {
        // Para usuários não logados, usar cookies
        setcookie('accessibility_preferences', $preferences, time() + (86400 * 30), '/');
    }
    
    wp_send_json_success();
}
add_action('wp_ajax_save_accessibility_preferences', 'neve_child_save_accessibility_preferences');
add_action('wp_ajax_nopriv_save_accessibility_preferences', 'neve_child_save_accessibility_preferences');

/**
 * ==========================================================================
 * MELHORIAS DE SEO E PERFORMANCE
 * ==========================================================================
 */

/**
 * Adicionar meta tags para melhor acessibilidade
 */
function neve_child_add_accessibility_meta() {
    ?>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5">
    <meta name="theme-color" content="#005fcc">
    <meta name="msapplication-TileColor" content="#005fcc">
    <?php
}
add_action('wp_head', 'neve_child_add_accessibility_meta');

/**
 * Melhorar alt text de imagens automaticamente
 */
function neve_child_improve_image_alt($attr, $attachment, $size) {
    if (empty($attr['alt'])) {
        $alt_text = get_post_meta($attachment->ID, '_wp_attachment_image_alt', true);
        if (empty($alt_text)) {
            $attr['alt'] = $attachment->post_title;
        }
    }
    return $attr;
}
add_filter('wp_get_attachment_image_attributes', 'neve_child_improve_image_alt', 10, 3);

/**
 * ==========================================================================
 * CUSTOMIZAÇÕES ESPECÍFICAS DO CLUBE DA AMIZADE
 * ==========================================================================
 */

/**
 * Adicionar opções personalizadas no Customizer
 */
function neve_child_customize_register($wp_customize) {
    // Seção do Clube da Amizade
    $wp_customize->add_section('clube_amizade_section', array(
        'title' => 'Clube da Amizade',
        'priority' => 30,
        'description' => 'Configurações específicas do Clube da Amizade Pe. Antônio Gonçalves'
    ));
    
    // Configuração de cores
    $wp_customize->add_setting('clube_primary_color', array(
        'default' => '#005fcc',
        'sanitize_callback' => 'sanitize_hex_color'
    ));
    
    $wp_customize->add_control(new WP_Customize_Color_Control($wp_customize, 'clube_primary_color', array(
        'label' => 'Cor Principal',
        'section' => 'clube_amizade_section',
        'settings' => 'clube_primary_color'
    )));
}
add_action('customize_register', 'neve_child_customize_register');

/**
 * ==========================================================================
 * FUNÇÕES AUXILIARES
 * ==========================================================================
 */

/**
 * Função para debug (remover em produção)
 */
function neve_child_debug_log($message) {
    if (WP_DEBUG === true) {
        error_log(print_r($message, true));
    }
}

/**
 * Verificar se é mobile
 */
function neve_child_is_mobile() {
    return wp_is_mobile();
}

/**
 * Obter preferências de acessibilidade do usuário
 */
function neve_child_get_accessibility_preferences() {
    $user_id = get_current_user_id();
    
    if ($user_id) {
        return get_user_meta($user_id, 'accessibility_preferences', true);
    } else {
        return isset($_COOKIE['accessibility_preferences']) ? $_COOKIE['accessibility_preferences'] : '';
    }
}

/**
 * ==========================================================================
 * HOOKS DE ATIVAÇÃO/DESATIVAÇÃO
 * ==========================================================================
 */

/**
 * Executar quando o tema for ativado
 */
function neve_child_activation() {
    // Flush rewrite rules
    flush_rewrite_rules();
    
    // Criar opções padrão
    add_option('neve_child_version', '1.0.0');
    add_option('neve_child_activation_date', current_time('mysql'));
}
add_action('after_switch_theme', 'neve_child_activation');

// Fim do arquivo - não adicionar PHP de fechamento ?>