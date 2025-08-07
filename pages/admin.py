# pages/admin.py

from django.contrib import admin
from .models import CategoriaMenu, Pagina, ContatoMensagem
from django.utils.html import format_html
from django.urls import reverse
from django.utils import timezone

# Rotina Documentada: Registro dos Modelos no Django Admin

@admin.register(CategoriaMenu)
class CategoriaMenuAdmin(admin.ModelAdmin):
    """
    Configuração do painel administrativo para CategoriaMenu.
    """
    list_display = ('nome', 'ordem', 'slug')
    prepopulated_fields = {'slug': ('nome',)} # Preenche o slug automaticamente
    search_fields = ('nome',)
    list_editable = ('ordem',) # Permite editar a ordem diretamente na lista

@admin.register(Pagina)
class PaginaAdmin(admin.ModelAdmin):
    """
    Configuração do painel administrativo para Pagina.
    """
    list_display = ('titulo', 'categoria', 'publicado', 'data_criacao', 'data_atualizacao')
    list_filter = ('publicado', 'categoria')
    search_fields = ('titulo', 'conteudo')
    prepopulated_fields = {'slug': ('titulo',)}
    date_hierarchy = 'data_criacao' # Adiciona um filtro de data
    # fields = ('titulo', 'slug', 'categoria', 'conteudo', 'publicado') # Define a ordem dos campos

@admin.register(ContatoMensagem)
class ContatoMensagemAdmin(admin.ModelAdmin):
    """
    Configuração do painel administrativo para ContatoMensagem.
    """
    list_display = (
        'nome', 'email', 'assunto_truncado', 'status_colorido', 
        'data_envio', 'botao_responder'
    )
    list_filter = ('status', 'data_envio', 'data_leitura')
    search_fields = ('nome', 'email', 'assunto', 'mensagem')
    readonly_fields = (
        'data_envio', 'ip_address', 'user_agent', 
        'data_leitura', 'data_resposta'
    )
    date_hierarchy = 'data_envio'
    list_per_page = 25
    
    fieldsets = (
        ('Informações do Remetente', {
            'fields': ('nome', 'email', 'telefone')
        }),
        ('Mensagem', {
            'fields': ('assunto', 'mensagem')
        }),
        ('Status e Controle', {
            'fields': ('status', 'respondida_por', 'observacoes_admin')
        }),
        ('Dados Técnicos', {
            'fields': ('data_envio', 'data_leitura', 'data_resposta', 'ip_address', 'user_agent'),
            'classes': ('collapse',)
        })
    )
    
    actions = ['marcar_como_lida', 'marcar_como_respondida', 'arquivar_mensagens']
    
    def assunto_truncado(self, obj):
        """Exibe assunto truncado na lista"""
        if len(obj.assunto) > 50:
            return obj.assunto[:50] + '...'
        return obj.assunto
    assunto_truncado.short_description = 'Assunto'
    
    def status_colorido(self, obj):
        """Exibe status com cores"""
        cores = {
            'nova': '#dc2626',      # Vermelho
            'lida': '#d97706',      # Laranja
            'respondida': '#16a34a', # Verde
            'arquivada': '#6b7280'   # Cinza
        }
        cor = cores.get(obj.status, '#6b7280')
        return format_html(
            '<span style="color: {}; font-weight: bold;">●</span> {}',
            cor,
            obj.get_status_display()
        )
    status_colorido.short_description = 'Status'
    
    def botao_responder(self, obj):
        """Botão para responder via email"""
        if obj.email:
            subject = f"Re: {obj.assunto}"
            body = f"""Olá {obj.nome},

Obrigado por entrar em contato com o Clube da Amizade.

Em resposta à sua mensagem:
"{obj.mensagem[:100]}..."

[Digite sua resposta aqui]

Atenciosamente,
Equipe Clube da Amizade Pe. Antônio Gonçalves
"""
            mailto_url = f"mailto:{obj.email}?subject={subject}&body={body}"
            return format_html(
                '<a href="{}" class="button" target="_blank">📧 Responder</a>',
                mailto_url
            )
        return '-'
    botao_responder.short_description = 'Ações'
    
    def marcar_como_lida(self, request, queryset):
        """Ação para marcar mensagens como lidas"""
        updated = 0
        for mensagem in queryset:
            if mensagem.status == 'nova':
                mensagem.marcar_como_lida()
                updated += 1
        
        self.message_user(
            request,
            f'{updated} mensagem(ns) marcada(s) como lida(s).'
        )
    marcar_como_lida.short_description = 'Marcar como lida'
    
    def marcar_como_respondida(self, request, queryset):
        """Ação para marcar mensagens como respondidas"""
        updated = 0
        for mensagem in queryset:
            if mensagem.status in ['nova', 'lida']:
                mensagem.marcar_como_respondida(request.user.get_full_name() or request.user.username)
                updated += 1
        
        self.message_user(
            request,
            f'{updated} mensagem(ns) marcada(s) como respondida(s).'
        )
    marcar_como_respondida.short_description = 'Marcar como respondida'
    
    def arquivar_mensagens(self, request, queryset):
        """Ação para arquivar mensagens"""
        updated = queryset.update(status='arquivada')
        self.message_user(
            request,
            f'{updated} mensagem(ns) arquivada(s).'
        )
    arquivar_mensagens.short_description = 'Arquivar mensagens'
    
    def save_model(self, request, obj, form, change):
        """Personalizar salvamento"""
        if change:  # Se está editando
            if obj.status == 'lida' and not obj.data_leitura:
                obj.data_leitura = timezone.now()
            elif obj.status == 'respondida' and not obj.data_resposta:
                obj.data_resposta = timezone.now()
                if not obj.respondida_por:
                    obj.respondida_por = request.user.get_full_name() or request.user.username
        
        super().save_model(request, obj, form, change)