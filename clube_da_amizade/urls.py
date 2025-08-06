# clube_da_amizade/urls.py

from django.contrib import admin
from django.urls import path, include
from django.conf.urls.static import static
from django.conf import settings

app_name = 'pages'

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('pages.urls')), # Inclui as URLs da sua app 'pages'
    path('ckeditor/', include('ckeditor_uploader.urls')), # Para o CKEditor
]

# Servir arquivos de mídia em desenvolvimento
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)