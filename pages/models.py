# pages/models.py

from django.db import models
from django.utils.text import slugify
from ckeditor.fields import RichTextField # Proposta de Melhoria: Usar CKEditor para o editor rico

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