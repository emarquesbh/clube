# pages/views.py

from django.shortcuts import render, get_object_or_404
from .models import CategoriaMenu, Pagina

# Rotina Documentada: Definição das Views Django

def index(request):
    """
    Renderiza a página inicial.
    Exibe as categorias de menu principais.
    """
    categorias = CategoriaMenu.objects.all().order_by('ordem')
    context = {
        'categorias': categorias,
        'is_home': True, # Para lógica específica da home no template
    }
    return render(request, 'pages/index.html', context)

def pagina_categoria(request, categoria_slug):
    """
    Renderiza a página principal de uma categoria de menu (ex: Atividades Físicas).
    Exibe a categoria e suas páginas associadas (submenus).
    """
    categoria = get_object_or_404(CategoriaMenu, slug=categoria_slug)
    # Pega apenas as páginas publicadas que estão diretamente ligadas a esta categoria.
    paginas_associadas = Pagina.objects.filter(categoria=categoria, publicado=True).order_by('titulo')
    
    context = {
        'categoria': categoria,
        'paginas_associadas': paginas_associadas,
    }
    return render(request, 'pages/pagina_categoria.html', context)

def pagina_detalhe(request, categoria_slug, pagina_slug):
    """
    Renderiza uma página detalhe (um subitem de menu ou uma página específica).
    """
    # Garante que a página pertence à categoria correta
    categoria = get_object_or_404(CategoriaMenu, slug=categoria_slug)
    pagina = get_object_or_404(Pagina, slug=pagina_slug, categoria=categoria, publicado=True)

    context = {
        'pagina': pagina,
        'categoria': categoria,
    }
    return render(request, 'pages/pagina_detalhe.html', context)
