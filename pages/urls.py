# pages/urls.py
from django.urls import path
from . import views

app_name = 'pages' # Define o namespace da aplicação

urlpatterns = [
    path('', views.index, name='index'),
    path('<slug:categoria_slug>/', views.pagina_categoria, name='pagina_categoria'),
    path('<slug:categoria_slug>/<slug:pagina_slug>/', views.pagina_detalhe, name='pagina_detalhe'),
]
