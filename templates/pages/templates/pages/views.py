from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse

def pagina_categoria(request, categoria_slug):
    """
    View para exibir atividades de uma categoria específica
    
    Args:
        request: Objeto de requisição HTTP
        categoria_slug: Slug da categoria (ex: 'atividades-fisicas')
    
    Returns:
        HttpResponse: Página renderizada com as atividades da categoria
    """
    
    # Dados mockados para teste - substitua pela consulta ao banco de dados
    categorias_mock = {
        'atividades-fisicas': {
            'nome': 'Atividades Físicas',
            'descricao': 'Mantenha-se ativo e saudável com nossas atividades físicas',
            'atividades': [
                {
                    'id': 1,
                    'nome': 'Ginástica',
                    'descricao': 'Turma 01',
                    'horario': 'Terça e Quinta',
                    'local': 'Praça Central',
                    'instrutor': 'Prof. Maria Silva'
                },
                {
                    'id': 2,
                    'nome': 'Hidroginástica',
                    'descricao': 'Exercícios aquáticos para todas as idades',
                    'horario': 'Terça e Quinta - 09:00',
                    'local': 'Piscina do Clube',
                    'instrutor': 'Prof. João Santos'
                },
                {
                    'id': 3,
                    'nome': 'Yoga',
                    'descricao': 'Relaxamento e fortalecimento corporal',
                    'horario': 'Quarta e Sexta - 18:00',
                    'local': 'Sala de Atividades',
                    'instrutor': 'Profa. Ana Costa'
                }
            ]
        }
    }
    
    # Busca a categoria pelo slug
    categoria_data = categorias_mock.get(categoria_slug)
    
    if not categoria_data:
        # Se a categoria não existir, retorna erro 404
        return HttpResponse("Categoria não encontrada", status=404)
    
    # Prepara o contexto para o template
    context = {
        'categoria': {
            'nome': categoria_data['nome'],
            'descricao': categoria_data['descricao']
        },
        'atividades': categoria_data['atividades'],
        'categoria_slug': categoria_slug
    }
    
    # Renderiza o template com o contexto
    return render(request, 'pages/pagina_categoria.html', context)