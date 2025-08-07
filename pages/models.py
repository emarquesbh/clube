# pages/models.py

from django.db import models
from django.utils.text import slugify
from django_ckeditor_5.fields import CKEditor5Field
from ckeditor.fields import RichTextField

class ContatoMensagem(models.Model):
    """
    Modelo para armazenar mensagens de contato do site
    """
    STATUS_CHOICES = [
        ('nova', 'Nova'),
        ('lida', 'Lida'),
        ('respondida', 'Respondida'),
        ('arquivada', 'Arquivada'),
    ]
    
    nome = models.CharField(max_length=200, verbose_name="Nome Completo")
    email = models.EmailField(verbose_name="Email")
    telefone = models.CharField(max_length=20, blank=True, verbose_name="Telefone")
    assunto = models.CharField(max_length=200, verbose_name="Assunto")
    mensagem = models.TextField(verbose_name="Mensagem")
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='nova',
        verbose_name="Status"
    )
    data_envio = models.DateTimeField(auto_now_add=True, verbose_name="Data de Envio")
    data_leitura = models.DateTimeField(null=True, blank=True, verbose_name="Data de Leitura")
    data_resposta = models.DateTimeField(null=True, blank=True, verbose_name="Data de Resposta")
    ip_address = models.GenericIPAddressField(null=True, blank=True, verbose_name="IP do Remetente")
    user_agent = models.TextField(blank=True, verbose_name="Navegador")
    respondida_por = models.CharField(max_length=200, blank=True, verbose_name="Respondida por")
    observacoes_admin = models.TextField(blank=True, verbose_name="Observações Administrativas")
    
    class Meta:
        verbose_name = "Mensagem de Contato"
        verbose_name_plural = "Mensagens de Contato"
        ordering = ['-data_envio']
    
    def __str__(self):
        return f"{self.nome} - {self.assunto} ({self.get_status_display()})"
    
    def marcar_como_lida(self):
        """Marca a mensagem como lida"""
        if self.status == 'nova':
            self.status = 'lida'
            self.data_leitura = timezone.now()
            self.save()
    
    def marcar_como_respondida(self, respondida_por=None):
        """Marca a mensagem como respondida"""
        self.status = 'respondida'
        self.data_resposta = timezone.now()
        if respondida_por:
            self.respondida_por = respondida_por
        self.save()
class Pagina(models.Model):
    titulo = models.CharField(max_length=255, verbose_name="Título")
    conteudo = RichTextField(verbose_name="Conteúdo da Página")

    def __str__(self):
        return self.titulo
class MeuModelo(models.Model):
    conteudo = CKEditor5Field('Conteúdo')
    
# Rotina Documentada: Criação dos Modelos Django para Páginas e Menu

class CategoriaMenu(models.Model):
    """
    Representa uma categoria principal do menu (ex: Atividades Físicas, Arte e Cultura).
    """
    nome = models.CharField(max_length=100, unique=True, verbose_name="Nome da Categoria")
    slug = models.SlugField(max_length=100, unique=True, blank=True, verbose_name="Slug da Categoria")
    ordem = models.IntegerField(default=0, verbose_name="Ordem no Menu Principal")

    class Meta:
        verbose_name = "Categoria de Menu"
        verbose_name_plural = "Categorias de Menu"
        ordering = ['ordem'] # Ordena no admin e nas views

    def save(self, *args, **kwargs):
        """Gera o slug automaticamente ao salvar."""
        if not self.slug:
            self.slug = slugify(self.nome)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.nome

class Pagina(models.Model):
    """
    Representa uma página de conteúdo no site, associada a uma categoria ou subcategoria.
    Pode ser tanto uma página principal do menu quanto uma página de subitem.
    """
    titulo = models.CharField(max_length=200, verbose_name="Título da Página")
    slug = models.SlugField(max_length=200, unique=True, blank=True, verbose_name="Slug da Página")
    categoria = models.ForeignKey(
        CategoriaMenu,
        on_delete=models.SET_NULL, # Mantém a página se a categoria for deletada
        null=True,
        blank=True,
        related_name='paginas',
        verbose_name="Categoria Principal"
    )
    # Proposta de Melhoria: Usar RichTextField para o editor de texto rico
    conteudo = RichTextField(verbose_name="Conteúdo da Página")
    publicado = models.BooleanField(default=True, verbose_name="Página Publicada?")
    data_criacao = models.DateTimeField(auto_now_add=True)
    data_atualizacao = models.DateTimeField(auto_now=True)

    # Para subitens, podemos usar um campo 'parent' ou inferir pela categoria se for um subitem.
    # Neste design, cada 'Pagina' pode ser um item de menu ou um subitem.
    # A diferenciação virá da forma como o menu é construído nas views/templates.
    # Se uma página não tiver categoria, pode ser considerada uma página "solta" ou interna.

    class Meta:
        verbose_name = "Página"
        verbose_name_plural = "Páginas"
        ordering = ['titulo']

    def save(self, *args, **kwargs):
        """Gera o slug automaticamente ao salvar."""
        if not self.slug:
            self.slug = slugify(self.titulo)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.titulo
