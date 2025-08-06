# pages/admin.py

from django.contrib import admin
from .models import CategoriaMenu, Pagina

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