# clube_da_amizade/context_processors.py

# Importa os modelos CategoriaMenu e Pagina da sua aplicação 'pages'
from pages.models import CategoriaMenu, Pagina

# Importa o módulo 'models' do Django.db, necessário para usar models.Prefetch
from django.db import models

def menu_categorias(request):
    
    # Busca todas as categorias de menu.
    # O prefetch_related otimiza a busca, carregando as páginas relacionadas
    # de uma vez, evitando múltiplas consultas ao banco de dados.
    categorias = CategoriaMenu.objects.prefetch_related(
        # models.Prefetch permite filtrar as páginas relacionadas.
        # Aqui, estamos pegando apenas as páginas que estão marcadas como publicadas.
        models.Prefetch(
            'paginas',  # O nome do related_name definido no ForeignKey de Pagina para CategoriaMenu
            queryset=Pagina.objects.filter(publicado=True),
            to_attr='paginas_publicadas'  # O nome do atributo que conterá as páginas filtradas
        )
    ).order_by('ordem') # Ordena as categorias pela ordem definida no modelo

    # Retorna um dicionário que será mesclado com o contexto de todos os templates.
    # A chave 'categorias_globais' estará disponível em todos os seus templates.
    return {'categorias_globais': categorias}
