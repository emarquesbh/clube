# pages/views.py

from django.shortcuts import render, get_object_or_404
from .models import CategoriaMenu, Pagina, ContatoMensagem
from .forms import ContatoForm
from django.contrib import messages
from django.core.mail import send_mail, EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
import logging
from datetime import datetime

# Configurar logging
logger = logging.getLogger('contato')
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

def contato(request):
    """
    View para exibir e processar o formulário de contato
    """
    if request.method == 'POST':
        form = ContatoForm(request.POST)
        if form.is_valid():
            try:
                # Salvar mensagem no banco
                mensagem = form.save(commit=False)
                
                # Capturar informações adicionais
                mensagem.ip_address = get_client_ip(request)
                mensagem.user_agent = request.META.get('HTTP_USER_AGENT', '')[:500]
                mensagem.save()
                
                # Enviar emails
                enviar_email_confirmacao(mensagem)
                enviar_email_notificacao_admin(mensagem)
                
                # Log da operação
                logger.info(f"Nova mensagem de contato recebida: {mensagem.nome} - {mensagem.email}")
                
                # Mensagem de sucesso
                messages.success(request, 'Sua mensagem foi enviada com sucesso! Entraremos em contato em breve.')
                
                return render(request, 'pages/contato_sucesso.html', {
                    'mensagem': mensagem
                })
                
            except Exception as e:
                logger.error(f"Erro ao processar formulário de contato: {str(e)}")
                messages.error(request, 'Ocorreu um erro ao enviar sua mensagem. Tente novamente.')
    else:
        form = ContatoForm()
    
    context = {
        'form': form,
        'page_title': 'Entre em Contato',
        'page_description': 'Envie sua mensagem, dúvida ou sugestão para o Clube da Amizade'
    }
    
    return render(request, 'pages/contato.html', context)

def get_client_ip(request):
    """Obter IP real do cliente"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

def enviar_email_confirmacao(mensagem):
    """
    Enviar email de confirmação para o usuário
    """
    try:
        assunto = f"Confirmação - Sua mensagem foi recebida - Clube da Amizade"
        
        # Template HTML
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: #2563eb; color: white; padding: 20px; text-align: center; }}
                .content {{ padding: 20px; background: #f9f9f9; }}
                .footer {{ padding: 15px; text-align: center; font-size: 12px; color: #666; }}
                .highlight {{ background: #e3f2fd; padding: 15px; border-left: 4px solid #2563eb; margin: 15px 0; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🤝 Clube da Amizade</h1>
                    <p>Pe. Antônio Gonçalves</p>
                </div>
                
                <div class="content">
                    <h2>Olá, {mensagem.nome}!</h2>
                    
                    <p>Recebemos sua mensagem com sucesso e agradecemos pelo contato!</p>
                    
                    <div class="highlight">
                        <h3>📋 Resumo da sua mensagem:</h3>
                        <p><strong>Assunto:</strong> {mensagem.assunto}</p>
                        <p><strong>Data:</strong> {mensagem.data_envio.strftime('%d/%m/%Y às %H:%M')}</p>
                        <p><strong>Mensagem:</strong></p>
                        <p style="font-style: italic;">"{mensagem.mensagem[:200]}{'...' if len(mensagem.mensagem) > 200 else ''}"</p>
                    </div>
                    
                    <p><strong>⏰ Tempo de resposta:</strong> Normalmente respondemos em até 24 horas durante dias úteis.</p>
                    
                    <p><strong>📞 Contato direto:</strong> Para urgências, ligue para (XX) XXXX-XXXX</p>
                    
                    <p>Obrigado por fazer parte da nossa comunidade!</p>
                </div>
                
                <div class="footer">
                    <p>Clube da Amizade Pe. Antônio Gonçalves</p>
                    <p>Este é um email automático, não responda.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        # Versão texto
        texto_content = f"""
        Olá, {mensagem.nome}!
        
        Recebemos sua mensagem com sucesso e agradecemos pelo contato!
        
        Resumo da sua mensagem:
        - Assunto: {mensagem.assunto}
        - Data: {mensagem.data_envio.strftime('%d/%m/%Y às %H:%M')}
        - Mensagem: "{mensagem.mensagem[:200]}{'...' if len(mensagem.mensagem) > 200 else ''}"
        
        Tempo de resposta: Normalmente respondemos em até 24 horas durante dias úteis.
        
        Para urgências, ligue para (XX) XXXX-XXXX
        
        Obrigado por fazer parte da nossa comunidade!
        
        Clube da Amizade Pe. Antônio Gonçalves
        """
        
        # Criar email
        email = EmailMultiAlternatives(
            subject=assunto,
            body=texto_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[mensagem.email]
        )
        email.attach_alternative(html_content, "text/html")
        email.send()
        
        logger.info(f"Email de confirmação enviado para: {mensagem.email}")
        
    except Exception as e:
        logger.error(f"Erro ao enviar email de confirmação: {str(e)}")

def enviar_email_notificacao_admin(mensagem):
    """
    Enviar notificação para administradores
    """
    try:
        assunto = f"Nova mensagem de contato - {mensagem.assunto}"
        
        conteudo = f"""
        Nova mensagem de contato recebida no site do Clube da Amizade:
        
        📋 DADOS DO REMETENTE:
        Nome: {mensagem.nome}
        Email: {mensagem.email}
        Telefone: {mensagem.telefone or 'Não informado'}
        
        📝 MENSAGEM:
        Assunto: {mensagem.assunto}
        Data: {mensagem.data_envio.strftime('%d/%m/%Y às %H:%M')}
        
        Mensagem:
        {mensagem.mensagem}
        
        🔧 DADOS TÉCNICOS:
        IP: {mensagem.ip_address}
        Navegador: {mensagem.user_agent[:100]}...
        
        Para responder, acesse: http://localhost:8000/admin/pages/contatomensagem/{mensagem.id}/change/
        
        Ou responda diretamente para: {mensagem.email}
        """
        
        send_mail(
            subject=assunto,
            message=conteudo,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[settings.CONTACT_EMAIL],
            fail_silently=False
        )
        
        logger.info(f"Notificação enviada para administradores sobre mensagem de: {mensagem.nome}")
        
    except Exception as e:
        logger.error(f"Erro ao enviar notificação para admin: {str(e)}")