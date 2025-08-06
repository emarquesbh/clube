# backup_system/backup_manager.py
"""
Sistema de Backup Completo para Clube da Amizade
Backup automático de banco de dados, mídia e arquivos do projeto
"""

import os
import shutil
import sqlite3
import zipfile
import json
import datetime
from pathlib import Path
import logging
from typing import Dict, List, Optional

class BackupManager:
    def __init__(self, project_root: str = None):
        """
        Inicializa o gerenciador de backup
        
        Args:
            project_root: Caminho raiz do projeto Django
        """
        self.project_root = Path(project_root) if project_root else Path(__file__).parent.parent
        self.backup_dir = self.project_root / 'backups'
        self.backup_dir.mkdir(exist_ok=True)
        
        # Configurar logging
        self.setup_logging()
        
        # Configurações padrão
        self.config = {
            'max_backups': 10,  # Máximo de backups a manter
            'compress': True,   # Comprimir backups
            'include_media': True,  # Incluir arquivos de mídia
            'include_static': False,  # Incluir arquivos estáticos (geralmente não necessário)
            'database_path': self.project_root / 'db.sqlite3',
            'media_path': self.project_root / 'media',
            'static_path': self.project_root / 'static',
        }
        
    def setup_logging(self):
        """Configura o sistema de logging"""
        log_file = self.backup_dir / 'backup.log'
        
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(log_file),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
        
    def create_full_backup(self, description: str = None) -> Dict:
        """
        Cria um backup completo do sistema
        
        Args:
            description: Descrição opcional do backup
            
        Returns:
            Dict com informações do backup criado
        """
        timestamp = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
        backup_name = f'backup_{timestamp}'
        backup_path = self.backup_dir / backup_name
        backup_path.mkdir(exist_ok=True)
        
        self.logger.info(f"Iniciando backup completo: {backup_name}")
        
        backup_info = {
            'name': backup_name,
            'timestamp': timestamp,
            'description': description or f'Backup automático - {datetime.datetime.now().strftime("%d/%m/%Y %H:%M")}',
            'files': [],
            'size': 0,
            'status': 'em_progresso'
        }
        
        try:
            # 1. Backup do banco de dados
            db_backup = self.backup_database(backup_path)
            if db_backup:
                backup_info['files'].append(db_backup)
                
            # 2. Backup dos arquivos de mídia
            if self.config['include_media']:
                media_backup = self.backup_media(backup_path)
                if media_backup:
                    backup_info['files'].append(media_backup)
                    
            # 3. Backup dos arquivos estáticos (opcional)
            if self.config['include_static']:
                static_backup = self.backup_static(backup_path)
                if static_backup:
                    backup_info['files'].append(static_backup)
                    
            # 4. Backup das configurações do projeto
            config_backup = self.backup_project_config(backup_path)
            if config_backup:
                backup_info['files'].append(config_backup)
                
            # 5. Backup dos templates
            templates_backup = self.backup_templates(backup_path)
            if templates_backup:
                backup_info['files'].append(templates_backup)
                
            # 6. Calcular tamanho total
            backup_info['size'] = self.calculate_backup_size(backup_path)
            
            # 7. Comprimir se configurado
            if self.config['compress']:
                compressed_file = self.compress_backup(backup_path)
                if compressed_file:
                    # Remove pasta descomprimida
                    shutil.rmtree(backup_path)
                    backup_info['compressed'] = True
                    backup_info['file_path'] = str(compressed_file)
                else:
                    backup_info['compressed'] = False
                    backup_info['file_path'] = str(backup_path)
            else:
                backup_info['compressed'] = False
                backup_info['file_path'] = str(backup_path)
                
            backup_info['status'] = 'concluido'
            
            # 8. Salvar informações do backup
            self.save_backup_info(backup_info)
            
            # 9. Limpar backups antigos
            self.cleanup_old_backups()
            
            self.logger.info(f"Backup concluído com sucesso: {backup_name}")
            
        except Exception as e:
            backup_info['status'] = 'erro'
            backup_info['error'] = str(e)
            self.logger.error(f"Erro durante backup: {e}")
            
        return backup_info
        
    def backup_database(self, backup_path: Path) -> Optional[Dict]:
        """Faz backup do banco de dados SQLite"""
        try:
            db_path = self.config['database_path']
            if not db_path.exists():
                self.logger.warning("Banco de dados não encontrado")
                return None
                
            # Backup do arquivo SQLite
            backup_db_path = backup_path / 'database'
            backup_db_path.mkdir(exist_ok=True)
            
            # Cópia do arquivo de banco
            shutil.copy2(db_path, backup_db_path / 'db.sqlite3')
            
            # Exportar dados em JSON (backup adicional)
            json_backup = self.export_database_to_json(db_path, backup_db_path)
            
            self.logger.info("Backup do banco de dados concluído")
            
            return {
                'type': 'database',
                'files': ['db.sqlite3', 'data_export.json'] if json_backup else ['db.sqlite3'],
                'path': str(backup_db_path)
            }
            
        except Exception as e:
            self.logger.error(f"Erro no backup do banco: {e}")
            return None
            
    def export_database_to_json(self, db_path: Path, backup_path: Path) -> bool:
        """Exporta dados do banco para JSON"""
        try:
            conn = sqlite3.connect(db_path)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            # Obter todas as tabelas
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
            tables = cursor.fetchall()
            
            export_data = {}
            
            for table in tables:
                table_name = table[0]
                if table_name.startswith('sqlite_'):
                    continue
                    
                cursor.execute(f"SELECT * FROM {table_name}")
                rows = cursor.fetchall()
                
                export_data[table_name] = [dict(row) for row in rows]
                
            # Salvar JSON
            json_file = backup_path / 'data_export.json'
            with open(json_file, 'w', encoding='utf-8') as f:
                json.dump(export_data, f, indent=2, ensure_ascii=False, default=str)
                
            conn.close()
            return True
            
        except Exception as e:
            self.logger.error(f"Erro na exportação JSON: {e}")
            return False
            
    def backup_media(self, backup_path: Path) -> Optional[Dict]:
        """Faz backup dos arquivos de mídia"""
        try:
            media_path = self.config['media_path']
            if not media_path.exists():
                self.logger.info("Pasta de mídia não encontrada")
                return None
                
            backup_media_path = backup_path / 'media'
            shutil.copytree(media_path, backup_media_path, dirs_exist_ok=True)
            
            # Contar arquivos
            file_count = sum(1 for _ in backup_media_path.rglob('*') if _.is_file())
            
            self.logger.info(f"Backup de mídia concluído: {file_count} arquivos")
            
            return {
                'type': 'media',
                'file_count': file_count,
                'path': str(backup_media_path)
            }
            
        except Exception as e:
            self.logger.error(f"Erro no backup de mídia: {e}")
            return None
            
    def backup_static(self, backup_path: Path) -> Optional[Dict]:
        """Faz backup dos arquivos estáticos"""
        try:
            static_path = self.config['static_path']
            if not static_path.exists():
                self.logger.info("Pasta static não encontrada")
                return None
                
            backup_static_path = backup_path / 'static'
            shutil.copytree(static_path, backup_static_path, dirs_exist_ok=True)
            
            file_count = sum(1 for _ in backup_static_path.rglob('*') if _.is_file())
            
            self.logger.info(f"Backup de arquivos estáticos concluído: {file_count} arquivos")
            
            return {
                'type': 'static',
                'file_count': file_count,
                'path': str(backup_static_path)
            }
            
        except Exception as e:
            self.logger.error(f"Erro no backup de arquivos estáticos: {e}")
            return None
            
    def backup_project_config(self, backup_path: Path) -> Optional[Dict]:
        """Faz backup das configurações do projeto"""
        try:
            config_path = backup_path / 'config'
            config_path.mkdir(exist_ok=True)
            
            # Arquivos de configuração importantes
            config_files = [
                'manage.py',
                'requirements.txt',
                'clube_da_amizade/settings.py',
                'clube_da_amizade/urls.py',
                'clube_da_amizade/wsgi.py',
                'clube_da_amizade/asgi.py',
                'pages/models.py',
                'pages/views.py',
                'pages/urls.py',
                'pages/admin.py',
            ]
            
            copied_files = []
            
            for file_path in config_files:
                source = self.project_root / file_path
                if source.exists():
                    dest = config_path / file_path
                    dest.parent.mkdir(parents=True, exist_ok=True)
                    shutil.copy2(source, dest)
                    copied_files.append(file_path)
                    
            self.logger.info(f"Backup de configurações concluído: {len(copied_files)} arquivos")
            
            return {
                'type': 'config',
                'files': copied_files,
                'path': str(config_path)
            }
            
        except Exception as e:
            self.logger.error(f"Erro no backup de configurações: {e}")
            return None
            
    def backup_templates(self, backup_path: Path) -> Optional[Dict]:
        """Faz backup dos templates"""
        try:
            templates_source = self.project_root / 'templates'
            if not templates_source.exists():
                self.logger.info("Pasta de templates não encontrada")
                return None
                
            templates_backup = backup_path / 'templates'
            shutil.copytree(templates_source, templates_backup, dirs_exist_ok=True)
            
            file_count = sum(1 for _ in templates_backup.rglob('*.html'))
            
            self.logger.info(f"Backup de templates concluído: {file_count} arquivos")
            
            return {
                'type': 'templates',
                'file_count': file_count,
                'path': str(templates_backup)
            }
            
        except Exception as e:
            self.logger.error(f"Erro no backup de templates: {e}")
            return None
            
    def calculate_backup_size(self, backup_path: Path) -> int:
        """Calcula o tamanho total do backup em bytes"""
        total_size = 0
        for file_path in backup_path.rglob('*'):
            if file_path.is_file():
                total_size += file_path.stat().st_size
        return total_size
        
    def compress_backup(self, backup_path: Path) -> Optional[Path]:
        """Comprime o backup em um arquivo ZIP"""
        try:
            zip_path = backup_path.with_suffix('.zip')
            
            with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
                for file_path in backup_path.rglob('*'):
                    if file_path.is_file():
                        arcname = file_path.relative_to(backup_path)
                        zipf.write(file_path, arcname)
                        
            self.logger.info(f"Backup comprimido: {zip_path.name}")
            return zip_path
            
        except Exception as e:
            self.logger.error(f"Erro na compressão: {e}")
            return None
            
    def save_backup_info(self, backup_info: Dict):
        """Salva informações do backup em arquivo JSON"""
        try:
            info_file = self.backup_dir / 'backup_history.json'
            
            # Carregar histórico existente
            history = []
            if info_file.exists():
                with open(info_file, 'r', encoding='utf-8') as f:
                    history = json.load(f)
                    
            # Adicionar novo backup
            history.append(backup_info)
            
            # Salvar histórico atualizado
            with open(info_file, 'w', encoding='utf-8') as f:
                json.dump(history, f, indent=2, ensure_ascii=False, default=str)
                
        except Exception as e:
            self.logger.error(f"Erro ao salvar informações do backup: {e}")
            
    def cleanup_old_backups(self):
        """Remove backups antigos mantendo apenas os mais recentes"""
        try:
            # Listar todos os backups
            backup_files = []
            
            for item in self.backup_dir.iterdir():
                if item.name.startswith('backup_') and (item.is_dir() or item.suffix == '.zip'):
                    backup_files.append(item)
                    
            # Ordenar por data de modificação (mais recente primeiro)
            backup_files.sort(key=lambda x: x.stat().st_mtime, reverse=True)
            
            # Remover backups excedentes
            if len(backup_files) > self.config['max_backups']:
                for old_backup in backup_files[self.config['max_backups']:]:
                    if old_backup.is_dir():
                        shutil.rmtree(old_backup)
                    else:
                        old_backup.unlink()
                    self.logger.info(f"Backup antigo removido: {old_backup.name}")
                    
        except Exception as e:
            self.logger.error(f"Erro na limpeza de backups antigos: {e}")
            
    def list_backups(self) -> List[Dict]:
        """Lista todos os backups disponíveis"""
        try:
            info_file = self.backup_dir / 'backup_history.json'
            
            if not info_file.exists():
                return []
                
            with open(info_file, 'r', encoding='utf-8') as f:
                history = json.load(f)
                
            # Verificar se os arquivos ainda existem
            valid_backups = []
            for backup in history:
                backup_path = Path(backup.get('file_path', ''))
                if backup_path.exists():
                    # Adicionar informações de tamanho formatado
                    size_bytes = backup.get('size', 0)
                    backup['size_formatted'] = self.format_size(size_bytes)
                    valid_backups.append(backup)
                    
            return valid_backups
            
        except Exception as e:
            self.logger.error(f"Erro ao listar backups: {e}")
            return []
            
    def restore_backup(self, backup_name: str) -> bool:
        """
        Restaura um backup específico
        
        Args:
            backup_name: Nome do backup a ser restaurado
            
        Returns:
            True se a restauração foi bem-sucedida
        """
        try:
            backups = self.list_backups()
            backup_info = None
            
            for backup in backups:
                if backup['name'] == backup_name:
                    backup_info = backup
                    break
                    
            if not backup_info:
                self.logger.error(f"Backup não encontrado: {backup_name}")
                return False
                
            backup_path = Path(backup_info['file_path'])
            
            if not backup_path.exists():
                self.logger.error(f"Arquivo de backup não encontrado: {backup_path}")
                return False
                
            self.logger.info(f"Iniciando restauração do backup: {backup_name}")
            
            # Criar backup de segurança antes da restauração
            safety_backup = self.create_full_backup("Backup de segurança antes da restauração")
            
            # Descomprimir se necessário
            if backup_info.get('compressed', False):
                extract_path = self.backup_dir / f'restore_{backup_name}'
                with zipfile.ZipFile(backup_path, 'r') as zipf:
                    zipf.extractall(extract_path)
                restore_source = extract_path
            else:
                restore_source = backup_path
                
            # Restaurar banco de dados
            db_source = restore_source / 'database' / 'db.sqlite3'
            if db_source.exists():
                shutil.copy2(db_source, self.config['database_path'])
                self.logger.info("Banco de dados restaurado")
                
            # Restaurar mídia
            media_source = restore_source / 'media'
            if media_source.exists():
                if self.config['media_path'].exists():
                    shutil.rmtree(self.config['media_path'])
                shutil.copytree(media_source, self.config['media_path'])
                self.logger.info("Arquivos de mídia restaurados")
                
            # Limpar pasta temporária se foi criada
            if backup_info.get('compressed', False):
                shutil.rmtree(extract_path)
                
            self.logger.info(f"Restauração concluída: {backup_name}")
            return True
            
        except Exception as e:
            self.logger.error(f"Erro na restauração: {e}")
            return False
            
    def format_size(self, size_bytes: int) -> str:
        """Formata tamanho em bytes para formato legível"""
        if size_bytes == 0:
            return "0 B"
            
        size_names = ["B", "KB", "MB", "GB", "TB"]
        i = 0
        while size_bytes >= 1024 and i < len(size_names) - 1:
            size_bytes /= 1024.0
            i += 1
            
        return f"{size_bytes:.1f} {size_names[i]}"
        
    def get_backup_statistics(self) -> Dict:
        """Retorna estatísticas dos backups"""
        backups = self.list_backups()
        
        if not backups:
            return {
                'total_backups': 0,
                'total_size': 0,
                'total_size_formatted': '0 B',
                'oldest_backup': None,
                'newest_backup': None
            }
            
        total_size = sum(backup.get('size', 0) for backup in backups)
        
        # Ordenar por timestamp
        sorted_backups = sorted(backups, key=lambda x: x['timestamp'])
        
        return {
            'total_backups': len(backups),
            'total_size': total_size,
            'total_size_formatted': self.format_size(total_size),
            'oldest_backup': sorted_backups[0]['timestamp'],
            'newest_backup': sorted_backups[-1]['timestamp']
        }


def main():
    """Função principal para execução via linha de comando"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Sistema de Backup - Clube da Amizade')
    parser.add_argument('action', choices=['backup', 'list', 'restore', 'stats'], 
                       help='Ação a ser executada')
    parser.add_argument('--name', help='Nome do backup (para restauração)')
    parser.add_argument('--description', help='Descrição do backup')
    
    args = parser.parse_args()
    
    backup_manager = BackupManager()
    
    if args.action == 'backup':
        result = backup_manager.create_full_backup(args.description)
        print(f"Backup criado: {result['name']}")
        print(f"Status: {result['status']}")
        if result['status'] == 'concluido':
            print(f"Tamanho: {backup_manager.format_size(result['size'])}")
            
    elif args.action == 'list':
        backups = backup_manager.list_backups()
        if not backups:
            print("Nenhum backup encontrado")
        else:
            print(f"{'Nome':<20} {'Data':<20} {'Tamanho':<10} {'Status'}")
            print("-" * 60)
            for backup in backups:
                timestamp = datetime.datetime.strptime(backup['timestamp'], '%Y%m%d_%H%M%S')
                date_str = timestamp.strftime('%d/%m/%Y %H:%M')
                print(f"{backup['name']:<20} {date_str:<20} {backup['size_formatted']:<10} {backup['status']}")
                
    elif args.action == 'restore':
        if not args.name:
            print("Nome do backup é obrigatório para restauração")
            return
            
        success = backup_manager.restore_backup(args.name)
        if success:
            print(f"Backup {args.name} restaurado com sucesso")
        else:
            print(f"Erro na restauração do backup {args.name}")
            
    elif args.action == 'stats':
        stats = backup_manager.get_backup_statistics()
        print("Estatísticas dos Backups:")
        print(f"Total de backups: {stats['total_backups']}")
        print(f"Tamanho total: {stats['total_size_formatted']}")
        if stats['oldest_backup']:
            oldest = datetime.datetime.strptime(stats['oldest_backup'], '%Y%m%d_%H%M%S')
            newest = datetime.datetime.strptime(stats['newest_backup'], '%Y%m%d_%H%M%S')
            print(f"Backup mais antigo: {oldest.strftime('%d/%m/%Y %H:%M')}")
            print(f"Backup mais recente: {newest.strftime('%d/%m/%Y %H:%M')}")


if __name__ == '__main__':
    main()