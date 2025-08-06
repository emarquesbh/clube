# backup_system/README.md

# 🛡️ Sistema de Backup - Clube da Amizade

Sistema completo e automatizado de backup para o projeto Django do Clube da Amizade Pe. Antônio Gonçalves.

## 🎯 Visão Geral

Este sistema foi desenvolvido especificamente para garantir a segurança dos dados do site do Clube da Amizade, oferecendo:

- **Backup Automático**: Agendamento de backups diários, semanais e mensais
- **Interface Web**: Gerenciamento visual e intuitivo via navegador
- **Restauração Simples**: Restaurar dados com poucos cliques
- **Compressão Inteligente**: Economia de espaço em disco
- **Logs Detalhados**: Monitoramento completo de todas as operações

## 🚀 Instalação Rápida

1. **Execute o instalador automático:**
   ```bash
   cd backup_system
   python install_backup_system.py
   ```

2. **Inicie a interface web:**
   ```bash
   python manage.py backup web
   ```

3. **Acesse no navegador:**
   ```
   http://localhost:5000
   ```

## 📋 Funcionalidades Principais

### ✅ Backup Completo
- **Banco de dados SQLite** (com exportação JSON adicional)
- **Arquivos de mídia** (uploads, imagens)
- **Templates HTML** (páginas do site)
- **Configurações do projeto** (settings.py, urls.py, etc.)

### ⏰ Agendamento Automático
- **Backup Diário**: 02:00 (configurável)
- **Backup Semanal**: Domingos às 03:00 (configurável)
- **Backup Mensal**: Dia 1 às 04:00 (configurável)

### 🌐 Interface Web Moderna
- **Dashboard** com estatísticas em tempo real
- **Gerenciamento visual** de todos os backups
- **Configuração fácil** do agendador
- **Download direto** dos backups
- **Restauração com um clique**

### 🔧 Linha de Comando
```bash
# Criar backup manual
python manage.py backup create --description "Backup antes da atualização"

# Listar backups
python manage.py backup list

# Restaurar backup
python manage.py backup restore --name backup_20241201_143022

# Iniciar agendador
python manage.py backup start-scheduler
```

## 📁 Estrutura do Sistema

```
backup_system/
├── backup_manager.py          # 🎯 Gerenciador principal de backups
├── backup_scheduler.py        # ⏰ Agendador automático
├── backup_web_interface.py    # 🌐 Interface web Flask
├── install_backup_system.py   # 📦 Instalador automático
├── requirements.txt           # 📋 Dependências Python
└── README.md                  # 📚 Esta documentação

backups/                       # 📁 Pasta dos backups (criada automaticamente)
├── backup_20241201_143022.zip # 💾 Backup comprimido
├── backup_history.json        # 📊 Histórico de backups
├── backup.log                 # 📝 Log das operações
└── scheduler.log              # ⏰ Log do agendador
```

## 🎮 Como Usar

### 1. Interface Web (Recomendado)

**Iniciar:**
```bash
python manage.py backup web
```

**Funcionalidades:**
- 📊 **Dashboard**: Visão geral com estatísticas
- 💾 **Backups**: Criar, baixar, restaurar e excluir
- ⏰ **Agendador**: Configurar backups automáticos
- ⚙️ **Configurações**: Ajustar parâmetros do sistema

### 2. Linha de Comando

**Comandos principais:**
```bash
# Backup manual com descrição
python manage.py backup create --description "Backup pré-atualização"

# Listar todos os backups
python manage.py backup list

# Restaurar backup específico
python manage.py backup restore --name backup_20241201_143022

# Agendador em segundo plano
python manage.py backup start-scheduler --daemon
```

### 3. Scripts de Inicialização

**Windows:**
```cmd
start_backup_web.bat
```

**Linux/Mac:**
```bash
./start_backup_web.sh
```

## ⚙️ Configurações

### Configurações de Backup
```python
{
    'max_backups': 10,        # Máximo de backups a manter
    'compress': True,         # Comprimir backups (recomendado)
    'include_media': True,    # Incluir arquivos de mídia
    'include_static': False   # Incluir arquivos estáticos
}
```

### Configurações do Agendador
```python
{
    'daily_backup': {
        'enabled': True,
        'time': '02:00',
        'description': 'Backup diário automático'
    },
    'weekly_backup': {
        'enabled': True,
        'day': 'sunday',
        'time': '03:00'
    },
    'monthly_backup': {
        'enabled': True,
        'day': 1,
        'time': '04:00'
    }
}
```

## 🔒 Segurança e Boas Práticas

### ✅ Recomendações
- **Backup externo**: Copie a pasta `backups/` para local seguro
- **Teste regular**: Faça testes de restauração periodicamente
- **Monitoramento**: Verifique os logs regularmente
- **Espaço em disco**: Configure limpeza automática adequada

### 🛡️ Segurança
- Backups contêm **todos os dados** do sistema
- **Senhas** e dados sensíveis são preservados
- Use **HTTPS** em produção para interface web
- Restrinja **acesso** à pasta de backups

## 🆘 Solução de Problemas

### Problema: Erro de permissão
```bash
# Linux/Mac
chmod -R 755 backups/
sudo chown -R $USER:$USER backups/
```

### Problema: Backup muito grande
- Desabilite `include_static` se desnecessário
- Configure limpeza mais agressiva
- Verifique arquivos grandes em `media/`

### Problema: Interface web não abre
```bash
# Verificar porta em uso
netstat -an | grep 5000

# Usar porta alternativa
python manage.py backup web --port 8080
```

### Problema: Agendador não funciona
- Verifique logs em `backups/scheduler.log`
- Confirme configurações de horário
- Reinicie o agendador

## 📊 Monitoramento

### Logs Disponíveis
- **backup.log**: Todas as operações de backup
- **scheduler.log**: Atividades do agendador automático

### Verificações Recomendadas
```bash
# Status dos backups
python manage.py backup list

# Últimas linhas do log
tail -f backups/backup.log

# Próximos agendamentos
python manage.py backup status
```

## 🔄 Manutenção

### Limpeza Manual
```bash
# Remover backups antigos
python manage.py backup cleanup

# Verificar espaço usado
du -sh backups/
```

### Atualização do Sistema
1. Substitua arquivos em `backup_system/`
2. Execute: `pip install -r backup_system/requirements.txt`
3. Reinicie agendador se necessário

## 📞 Suporte Técnico

### Diagnóstico Rápido
1. **Verifique logs**: `cat backups/backup.log`
2. **Liste backups**: `python manage.py backup list`
3. **Teste interface**: `python manage.py backup web`

### Informações do Sistema
- **Python**: 3.8+ requerido
- **Django**: Compatível com versões atuais
- **Espaço**: ~2x tamanho do projeto para backups
- **Dependências**: Flask, schedule, pathlib2

---

## 🎉 Conclusão

Este sistema de backup foi desenvolvido especificamente para o **Clube da Amizade Pe. Antônio Gonçalves**, garantindo que todos os dados importantes do site estejam sempre protegidos e facilmente recuperáveis.

**Características principais:**
- ✅ **Simples de usar** - Interface intuitiva
- ✅ **Automático** - Funciona sem intervenção
- ✅ **Confiável** - Testado e robusto
- ✅ **Completo** - Backup de todos os dados
- ✅ **Flexível** - Configurável conforme necessidade

Para dúvidas ou suporte, consulte os logs do sistema ou a documentação técnica nos arquivos Python.

**Desenvolvido com ❤️ para o Clube da Amizade**