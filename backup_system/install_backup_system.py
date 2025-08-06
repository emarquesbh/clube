# backup_system/install_backup_system.py
"""
Script de Instalação do Sistema de Backup
Configura automaticamente o sistema de backup no projeto Django
"""

import os
import sys
import subprocess
from pathlib import Path
import shutil

def install_dependencies():
    """Instala as dependências necessárias"""
    print("📦 Instalando dependências...")
    
    requirements_file = Path(__file__).parent / 'requirements.txt'
    
    try:
        subprocess.check_call([
            sys.executable, '-m', 'pip', 'install', '-r', str(requirements_file)
        ])
        print("✅ Dependências instaladas com sucesso!")
        return True
        
    except subprocess.CalledProcessError as e:
        print(f"❌ Erro ao instalar dependências: {e}")
        return False

def create_backup_directories():
    """Cria as pastas necessárias para o sistema de backup"""
    print("📁 Criando estrutura de pastas...")
    
    project_root = Path(__file__).parent.parent
    backup_dir = project_root / 'backups'
    
    # Criar pasta de backups
    backup_dir.mkdir(exist_ok=True)
    
    # Criar subpastas
    (backup_dir / 'logs').mkdir(exist_ok=True)
    
    print(f"✅ Pastas criadas em: {backup_dir}")
    return True

def create_management_command():
    """Cria comando de gerenciamento Django para backups"""
    print("🔧 Criando comando de gerenciamento Django...")
    
    project_root = Path(__file__).parent.parent
    management_dir = project_root / 'pages' / 'management'
    commands_dir = management_dir / 'commands'
    
    # Criar estrutura de pastas
    management_dir.mkdir(exist_ok=True)
    commands_dir.mkdir(exist_ok=True)
    
    # Criar arquivos __init__.py
    (management_dir / '__init__.py').touch()
    (commands_dir / '__init__.py').touch()
    
    # Criar comando de backup
    backup_command = commands_dir / 'backup.py'
    
    command_content = '''# pages/management/commands/backup.py
"""
Comando Django para gerenciar backups
Uso: python manage.py backup [ação] [opções]
"""

from django.core.management.base import BaseCommand, CommandError
from pathlib import Path
import sys
import os

# Adicionar pasta do sistema de backup ao path
backup_system_path = Path(__file__).parent.parent.parent.parent / 'backup_system'
sys.path.insert(0, str(backup_system_path))

from backup_manager import BackupManager
from backup_scheduler import BackupScheduler

class Command(BaseCommand):
    help = 'Gerencia o sistema de backup do Clube da Amizade'
    
    def add_arguments(self, parser):
        parser.add_argument(
            'action',
            choices=['create', 'list', 'restore', 'start-scheduler', 'stop-scheduler', 'web'],
            help='Ação a ser executada'
        )
        
        parser.add_argument(
            '--name',
            help='Nome do backup (para restauração)'
        )
        
        parser.add_argument(
            '--description',
            help='Descrição do backup'
        )
        
        parser.add_argument(
            '--port',
            type=int,
            default=5000,
            help='Porta para interface web (padrão: 5000)'
        )
    
    def handle(self, *args, **options):
        action = options['action']
        
        try:
            if action == 'create':
                self.create_backup(options.get('description'))
                
            elif action == 'list':
                self.list_backups()
                
            elif action == 'restore':
                if not options.get('name'):
                    raise CommandError('Nome do backup é obrigatório para restauração')
                self.restore_backup(options['name'])
                
            elif action == 'start-scheduler':
                self.start_scheduler()
                
            elif action == 'stop-scheduler':
                self.stop_scheduler()
                
            elif action == 'web':
                self.start_web_interface(options['port'])
                
        except Exception as e:
            raise CommandError(f'Erro: {e}')
    
    def create_backup(self, description):
        """Cria um novo backup"""
        self.stdout.write('🔄 Criando backup...')
        
        backup_manager = BackupManager()
        result = backup_manager.create_full_backup(description)
        
        if result['status'] == 'concluido':
            self.stdout.write(
                self.style.SUCCESS(f'✅ Backup criado: {result["name"]}')
            )
            self.stdout.write(f'📊 Tamanho: {backup_manager.format_size(result["size"])}')
        else:
            self.stdout.write(
                self.style.ERROR(f'❌ Erro no backup: {result.get("error", "Erro desconhecido")}')
            )
    
    def list_backups(self):
        """Lista todos os backups"""
        backup_manager = BackupManager()
        backups = backup_manager.list_backups()
        
        if not backups:
            self.stdout.write('📭 Nenhum backup encontrado')
            return
        
        self.stdout.write('📋 Lista de Backups:')
        self.stdout.write('-' * 80)
        
        for backup in backups:
            from datetime import datetime
            timestamp = datetime.strptime(backup['timestamp'], '%Y%m%d_%H%M%S')
            date_str = timestamp.strftime('%d/%m/%Y %H:%M')
            
            status_icon = '✅' if backup['status'] == 'concluido' else '❌'
            
            self.stdout.write(
                f'{status_icon} {backup["name"]} | {date_str} | {backup["size_formatted"]} | {backup["status"]}'
            )
    
    def restore_backup(self, backup_name):
        """Restaura um backup"""
        self.stdout.write(f'🔄 Restaurando backup: {backup_name}')
        
        # Confirmação
        confirm = input('⚠️  ATENÇÃO: Esta ação irá substituir os dados atuais. Continuar? (s/N): ')
        if confirm.lower() != 's':
            self.stdout.write('❌ Restauração cancelada')
            return
        
        backup_manager = BackupManager()
        success = backup_manager.restore_backup(backup_name)
        
        if success:
            self.stdout.write(
                self.style.SUCCESS(f'✅ Backup restaurado com sucesso: {backup_name}')
            )
        else:
            self.stdout.write(
                self.style.ERROR(f'❌ Erro na restauração do backup: {backup_name}')
            )
    
    def start_scheduler(self):
        """Inicia o agendador de backups"""
        self.stdout.write('🔄 Iniciando agendador de backups...')
        
        scheduler = BackupScheduler()
        scheduler.start()
        
        self.stdout.write(
            self.style.SUCCESS('✅ Agendador iniciado com sucesso')
        )
        
        # Mostrar próximas execuções
        next_runs = scheduler.get_next_runs()
        if next_runs:
            self.stdout.write('⏰ Próximas execuções:')
            for run in next_runs:
                self.stdout.write(f'  - {run["job"]}: {run["next_run"]}')
        
        try:
            self.stdout.write('Pressione Ctrl+C para parar...')
            import time
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            scheduler.stop()
            self.stdout.write('\\n⏹️  Agendador parado')
    
    def stop_scheduler(self):
        """Para o agendador de backups"""
        scheduler = BackupScheduler()
        scheduler.stop()
        
        self.stdout.write(
            self.style.SUCCESS('⏹️  Agendador parado')
        )
    
    def start_web_interface(self, port):
        """Inicia a interface web"""
        self.stdout.write(f'🌐 Iniciando interface web na porta {port}...')
        
        try:
            # Importar e executar a interface web
            from backup_web_interface import app
            
            self.stdout.write(
                self.style.SUCCESS(f'✅ Interface web disponível em: http://localhost:{port}')
            )
            self.stdout.write('Pressione Ctrl+C para parar...')
            
            app.run(debug=False, host='0.0.0.0', port=port)
            
        except KeyboardInterrupt:
            self.stdout.write('\\n⏹️  Interface web parada')
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ Erro na interface web: {e}')
            )
'''
    
    with open(backup_command, 'w', encoding='utf-8') as f:
        f.write(command_content)
    
    print("✅ Comando de gerenciamento criado!")
    return True

def create_startup_scripts():
    """Cria scripts de inicialização"""
    print("📜 Criando scripts de inicialização...")
    
    project_root = Path(__file__).parent.parent
    
    # Script para Windows
    windows_script = project_root / 'start_backup_web.bat'
    windows_content = '''@echo off
echo 🛡️ Sistema de Backup - Clube da Amizade
echo Iniciando interface web...
python manage.py backup web
pause
'''
    
    with open(windows_script, 'w', encoding='utf-8') as f:
        f.write(windows_content)
    
    # Script para Linux/Mac
    unix_script = project_root / 'start_backup_web.sh'
    unix_content = '''#!/bin/bash
echo "🛡️ Sistema de Backup - Clube da Amizade"
echo "Iniciando interface web..."
python manage.py backup web
'''
    
    with open(unix_script, 'w', encoding='utf-8') as f:
        f.write(unix_content)
    
    # Tornar executável no Unix
    try:
        os.chmod(unix_script, 0o755)
    except:
        pass
    
    print("✅ Scripts de inicialização criados!")
    return True

def create_documentation():
    """Cria documentação do sistema"""
    print("📚 Criando documentação...")
    
    project_root = Path(__file__).parent.parent
    doc_file = project_root / 'BACKUP_SYSTEM_README.md'
    
    documentation = '''# 🛡️ Sistema de Backup - Clube da Amizade

Sistema completo de backup automático para o projeto Django do Clube da Amizade.

## 🚀 Funcionalidades

- ✅ Backup completo do banco de dados SQLite
- ✅ Backup de arquivos de mídia
- ✅ Backup de templates e configurações
- ✅ Compressão automática dos backups
- ✅ Agendamento automático (diário, semanal, mensal)
- ✅ Interface web para gerenciamento
- ✅ Restauração de backups
- ✅ Limpeza automática de backups antigos
- ✅ Logs detalhados de todas as operações

## 📦 Instalação

O sistema foi instalado automaticamente. As dependências necessárias são:

```
schedule==1.2.0
Flask==2.3.3
pathlib2==2.3.7
```

## 🎮 Como Usar

### Via Comando Django

```bash
# Criar backup manual
python manage.py backup create --description "Meu backup"

# Listar todos os backups
python manage.py backup list

# Restaurar um backup
python manage.py backup restore --name backup_20241201_143022

# Iniciar agendador automático
python manage.py backup start-scheduler

# Iniciar interface web
python manage.py backup web
```

### Via Interface Web

1. Execute: `python manage.py backup web`
2. Acesse: http://localhost:5000
3. Use a interface gráfica para gerenciar backups

### Via Scripts

- **Windows**: Execute `start_backup_web.bat`
- **Linux/Mac**: Execute `./start_backup_web.sh`

## ⏰ Agendamento Automático

O sistema pode executar backups automaticamente:

- **Diário**: Todo dia às 02:00
- **Semanal**: Domingos às 03:00  
- **Mensal**: Dia 1 de cada mês às 04:00

Configure os horários pela interface web ou editando as configurações.

## 📁 Estrutura de Arquivos

```
projeto/
├── backups/                    # Pasta dos backups
│   ├── backup_20241201_143022/ # Backup individual
│   ├── backup_history.json     # Histórico de backups
│   ├── backup.log             # Log das operações
│   └── scheduler.log          # Log do agendador
├── backup_system/             # Sistema de backup
│   ├── backup_manager.py      # Gerenciador principal
│   ├── backup_scheduler.py    # Agendador automático
│   ├── backup_web_interface.py # Interface web
│   └── requirements.txt       # Dependências
└── pages/management/commands/
    └── backup.py              # Comando Django
```

## 🔧 Configurações

### Configurações de Backup

- **max_backups**: Máximo de backups a manter (padrão: 10)
- **compress**: Comprimir backups (padrão: True)
- **include_media**: Incluir arquivos de mídia (padrão: True)
- **include_static**: Incluir arquivos estáticos (padrão: False)

### Configurações do Agendador

- **daily_backup**: Configurações do backup diário
- **weekly_backup**: Configurações do backup semanal
- **monthly_backup**: Configurações do backup mensal
- **auto_cleanup**: Limpeza automática de backups antigos

## 🛠️ Manutenção

### Limpeza Manual

```bash
# Limpar backups antigos
python manage.py backup cleanup
```

### Verificar Status

```bash
# Ver próximos backups agendados
python manage.py backup status
```

### Logs

Os logs são salvos em:
- `backups/backup.log` - Operações de backup
- `backups/scheduler.log` - Agendador automático

## 🔒 Segurança

- Backups são salvos localmente na pasta `backups/`
- Recomenda-se fazer backup da pasta `backups/` em local externo
- Senhas e dados sensíveis são preservados nos backups
- Use HTTPS em produção para a interface web

## 🆘 Solução de Problemas

### Erro de Permissão
```bash
# Linux/Mac - dar permissão para pasta de backups
chmod -R 755 backups/
```

### Backup Muito Grande
- Desabilite `include_static` se não necessário
- Configure limpeza automática mais agressiva
- Use compressão (habilitada por padrão)

### Interface Web Não Abre
- Verifique se a porta 5000 está livre
- Use `--port` para especificar outra porta
- Verifique se o Flask está instalado

## 📞 Suporte

Para problemas ou dúvidas:
1. Verifique os logs em `backups/backup.log`
2. Execute `python manage.py backup list` para verificar backups
3. Use a interface web para diagnósticos visuais

## 🔄 Atualizações

Para atualizar o sistema:
1. Substitua os arquivos em `backup_system/`
2. Execute `pip install -r backup_system/requirements.txt`
3. Reinicie o agendador se estiver rodando

---

**Sistema desenvolvido para o Clube da Amizade Pe. Antônio Gonçalves**
'''
    
    with open(doc_file, 'w', encoding='utf-8') as f:
        f.write(documentation)
    
    print("✅ Documentação criada!")
    return True

def main():
    """Função principal de instalação"""
    print("🛡️ Instalador do Sistema de Backup")
    print("Clube da Amizade Pe. Antônio Gonçalves")
    print("=" * 50)
    
    steps = [
        ("Instalando dependências", install_dependencies),
        ("Criando estrutura de pastas", create_backup_directories),
        ("Criando comando Django", create_management_command),
        ("Criando scripts de inicialização", create_startup_scripts),
        ("Criando documentação", create_documentation),
    ]
    
    success_count = 0
    
    for step_name, step_function in steps:
        print(f"\n{step_name}...")
        try:
            if step_function():
                success_count += 1
            else:
                print(f"❌ Falha em: {step_name}")
        except Exception as e:
            print(f"❌ Erro em {step_name}: {e}")
    
    print("\n" + "=" * 50)
    
    if success_count == len(steps):
        print("🎉 Instalação concluída com sucesso!")
        print("\n📋 Próximos passos:")
        print("1. Execute: python manage.py backup create")
        print("2. Execute: python manage.py backup web")
        print("3. Acesse: http://localhost:5000")
        print("\n📚 Leia o arquivo BACKUP_SYSTEM_README.md para mais informações")
    else:
        print(f"⚠️  Instalação parcial: {success_count}/{len(steps)} etapas concluídas")
        print("Verifique os erros acima e tente novamente")

if __name__ == '__main__':
    main()