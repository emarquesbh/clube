# pages/forms.py
"""
Formulários para o Clube da Amizade
Otimizado para usuários 60+ com design acessível
"""

from django import forms
from .models import ContatoMensagem

class ContatoForm(forms.ModelForm):
    """
    Formulário de contato otimizado para a terceira idade
    """
    
    ASSUNTO_CHOICES = [
        ('', 'Selecione um assunto...'),
        ('informacoes', 'Informações Gerais'),
        ('inscricoes', 'Inscrições em Atividades'),
        ('horarios', 'Horários e Funcionamento'),
        ('sugestoes', 'Sugestões e Melhorias'),
        ('reclamacoes', 'Reclamações'),
        ('elogios', 'Elogios'),
        ('parcerias', 'Parcerias e Colaborações'),
        ('eventos', 'Eventos Especiais'),
        ('outro', 'Outro (especificar abaixo)'),
    ]
    
    assunto_predefinido = forms.ChoiceField(
        choices=ASSUNTO_CHOICES,
        required=False,
        widget=forms.Select(attrs={
            'class': 'form-control form-control-lg',
            'style': 'font-size: 18px; padding: 15px; border: 2px solid #ddd; border-radius: 8px;',
            'onchange': 'toggleCustomSubject(this.value)'
        }),
        label='Assunto da Mensagem'
    )
    
    assunto_personalizado = forms.CharField(
        max_length=200,
        required=False,
        widget=forms.TextInput(attrs={
            'class': 'form-control form-control-lg',
            'style': 'font-size: 18px; padding: 15px; border: 2px solid #ddd; border-radius: 8px; display: none;',
            'placeholder': 'Digite seu assunto personalizado...',
            'id': 'assunto_personalizado'
        }),
        label='Assunto Personalizado'
    )
    
    class Meta:
        model = ContatoMensagem
        fields = ['nome', 'email', 'telefone', 'mensagem']
        
        widgets = {
            'nome': forms.TextInput(attrs={
                'class': 'form-control form-control-lg',
                'style': 'font-size: 18px; padding: 15px; border: 2px solid #ddd; border-radius: 8px;',
                'placeholder': 'Digite seu nome completo...',
                'required': True
            }),
            'email': forms.EmailInput(attrs={
                'class': 'form-control form-control-lg',
                'style': 'font-size: 18px; padding: 15px; border: 2px solid #ddd; border-radius: 8px;',
                'placeholder': 'Digite seu melhor email...',
                'required': True
            }),
            'telefone': forms.TextInput(attrs={
                'class': 'form-control form-control-lg',
                'style': 'font-size: 18px; padding: 15px; border: 2px solid #ddd; border-radius: 8px;',
                'placeholder': '(XX) XXXXX-XXXX',
                'pattern': r'\(\d{2}\)\s\d{4,5}-\d{4}',
                'title': 'Formato: (XX) XXXXX-XXXX'
            }),
            'mensagem': forms.Textarea(attrs={
                'class': 'form-control form-control-lg',
                'style': 'font-size: 18px; padding: 15px; border: 2px solid #ddd; border-radius: 8px; min-height: 150px;',
                'placeholder': 'Digite sua mensagem aqui... (mínimo 10 caracteres)',
                'rows': 6,
                'maxlength': 2000,
                'required': True,
                'onkeyup': 'updateCharCount(this.value.length)'
            })
        }
        
        labels = {
            'nome': 'Nome Completo *',
            'email': 'Email *',
            'telefone': 'Telefone (opcional)',
            'mensagem': 'Sua Mensagem *'
        }
    
    def clean_mensagem(self):
        """Validação personalizada para a mensagem"""
        mensagem = self.cleaned_data.get('mensagem')
        if mensagem and len(mensagem.strip()) < 10:
            raise forms.ValidationError('A mensagem deve ter pelo menos 10 caracteres.')
        return mensagem
    
    def clean(self):
        """Validação geral do formulário"""
        cleaned_data = super().clean()
        assunto_predefinido = cleaned_data.get('assunto_predefinido')
        assunto_personalizado = cleaned_data.get('assunto_personalizado')
        
        # Determinar o assunto final
        if assunto_predefinido == 'outro':
            if not assunto_personalizado:
                raise forms.ValidationError('Por favor, especifique o assunto personalizado.')
            cleaned_data['assunto_final'] = assunto_personalizado
        elif assunto_predefinido:
            cleaned_data['assunto_final'] = dict(self.ASSUNTO_CHOICES)[assunto_predefinido]
        else:
            raise forms.ValidationError('Por favor, selecione um assunto.')
        
        return cleaned_data
    
    def save(self, commit=True):
        """Salvar com assunto processado"""
        instance = super().save(commit=False)
        
        # Definir o assunto baseado na validação
        if hasattr(self, 'cleaned_data') and 'assunto_final' in self.cleaned_data:
            instance.assunto = self.cleaned_data['assunto_final']
        
        if commit:
            instance.save()
        return instance