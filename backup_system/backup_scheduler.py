# backup_system/backup_scheduler.py
"""
Agendador de Backups Automáticos
Sistema para executar backups em horários programados
"""

import schedule
import time
import threading
from datetime import datetime, timedelta
from backup_manager import BackupManager
import logging
import json
from pathlib import Path

class BackupScheduler:
    def __init__(self, project_root: str = None):
        """
        Inicializa o agendador de backups
        
        Args:
            project_root: Caminho raiz do projeto Django
        """
        self.backup_manager = BackupManager(project_root)
        self.project_root = self.backup_manager.project_root
        self.config_file = self.project_root / 'backup_system' / 'scheduler_config.json'
        self.is_running = False
        self.scheduler_thread = None
        
        # Configurações padrão
        self.config = {
            'daily_backup': {
                'enabled': True,
                'time': '02:00',  # 2:00 AM
                'description': 'Backup diário automático'
            },
            'weekly_backup': {
                'enabled': True,
                'day': 'sunday',  # Domingo
                'time': '03:00',  # 3:00 AM
                'description': 'Backup semanal automático'
            },
            'monthly_backup': {
                'enabled': True,
                'day': 1,  # Primeiro dia do mês
                'time': '04:00',  # 4:00 AM
                'description': 'Backup mensal automático'
            },
            'auto_cleanup': {
                'enabled': True,
                'keep_daily': 7,    # Manter 7 backups diários
                'keep_weekly': 4,   # Manter 4 backups semanais
                'keep_monthly': 12  # Manter 12 backups mensais
            }
        }
        
        self.load_config()
        self.setup_logging()
        
    def setup_logging(self):
        """Configura o sistema de logging para o agendador"""
        log_file = self.backup_manager.backup_dir / 'scheduler.log'
        
        # Configurar logger específico para o agendador
        self.logger = logging.getLogger('backup_scheduler')
        self.logger.setLevel(logging.INFO)
        
        # Evitar duplicação de handlers
        if not self.logger.handlers:
            handler = logging.FileHandler(log_file)
            formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
            handler.setFormatter(formatter)
            self.logger.addHandler(handler)
            
            # Console handler
            console_handler = logging.StreamHandler()
            console_handler.setFormatter(formatter)
            self.logger.addHandler(console_handler)
    
    def load_config(self):
        """Carrega configurações do arquivo JSON"""
        try:
            if self.config_file.exists():
                with open(self.config_file, 'r', encoding='utf-8') as f:
                    saved_config = json.load(f)
                    self.config.update(saved_config)
                    
        except Exception as e:
            self.logger.error(f"Erro ao carregar configurações: {e}")
            
    def save_config(self):
        """Salva configurações no arquivo JSON"""
        try:
            self.config_file.parent.mkdir(exist_ok=True)
            with open(self.config_file, 'w', encoding='utf-8') as f:
                json.dump(self.config, f, indent=2, ensure_ascii=False)
                
        except Exception as e:
            self.logger.error(f"Erro ao salvar configurações: {e}")
            
    def schedule_backups(self):
        """Configura os agendamentos de backup"""
        # Limpar agendamentos existentes
        schedule.clear()
        
        # Backup diário
        if self.config['daily_backup']['enabled']:
            time_str = self.config['daily_backup']['time']
            schedule.every().day.at(time_str).do(
                self.run_daily_backup
            )
            self.logger.info(f"Backup diário agendado para {time_str}")
            
        # Backup semanal
        if self.config['weekly_backup']['enabled']:
            day = self.config['weekly_backup']['day']
            time_str = self.config['weekly_backup']['time']
            
            day_method = getattr(schedule.every(), day.lower())
            day_method.at(time_str).do(self.run_weekly_backup)
            self.logger.info(f"Backup semanal agendado para {day} às {time_str}")
            
        # Backup mensal (simulado com verificação diária)
        if self.config['monthly_backup']['enabled']:
            time_str = self.config['monthly_backup']['time']
            schedule.every().day.at(time_str).do(
                self.check_monthly_backup
            )
            self.logger.info(f"Verificação de backup mensal agendada para {time_str}")
            
    def run_daily_backup(self):
        """Executa backup diário"""
        try:
            self.logger.info("Iniciando backup diário automático")
            description = f"{self.config['daily_backup']['description']} - {datetime.now().strftime('%d/%m/%Y')}"
            
            result = self.backup_manager.create_full_backup(description)
            
            if result['status'] == 'concluido':
                self.logger.info(f"Backup diário concluído: {result['name']}")
                
                # Marcar como backup diário
                self.mark_backup_type(result['name'], 'daily')
                
            else:
                self.logger.error(f"Erro no backup diário: {result.get('error', 'Erro desconhecido')}")
                
        except Exception as e:
            self.logger.error(f"Erro no backup diário: {e}")
            
    def run_weekly_backup(self):
        """Executa backup semanal"""
        try:
            self.logger.info("Iniciando backup semanal automático")
            description = f"{self.config['weekly_backup']['description']} - Semana {datetime.now().strftime('%U/%Y')}"
            
            result = self.backup_manager.create_full_backup(description)
            
            if result['status'] == 'concluido':
                self.logger.info(f"Backup semanal concluído: {result['name']}")
                
                # Marcar como backup semanal
                self.mark_backup_type(result['name'], 'weekly')
                
            else:
                self.logger.error(f"Erro no backup semanal: {result.get('error', 'Erro desconhecido')}")
                
        except Exception as e:
            self.logger.error(f"Erro no backup semanal: {e}")
            
    def check_monthly_backup(self):
        """Verifica se deve executar backup mensal"""
        try:
            today = datetime.now()
            target_day = self.config['monthly_backup']['day']
            
            # Verificar se é o dia correto do mês
            if today.day == target_day:
                self.run_monthly_backup()
                
        except Exception as e:
            self.logger.error(f"Erro na verificação de backup mensal: {e}")
            
    def run_monthly_backup(self):
        """Executa backup mensal"""
        try:
            self.logger.info("Iniciando backup mensal automático")
            description = f"{self.config['monthly_backup']['description']} - {datetime.now().strftime('%m/%Y')}"
            
            result = self.backup_manager.create_full_backup(description)
            
            if result['status'] == 'concluido':
                self.logger.info(f"Backup mensal concluído: {result['name']}")
                
                # Marcar como backup mensal
                self.mark_backup_type(result['name'], 'monthly')
                
            else:
                self.logger.error(f"Erro no backup mensal: {result.get('error', 'Erro desconhecido')}")
                
        except Exception as e:
            self.logger.error(f"Erro no backup mensal: {e}")
            
    def mark_backup_type(self, backup_name: str, backup_type: str):
        """Marca o tipo de backup no histórico"""
        try:
            info_file = self.backup_manager.backup_dir / 'backup_history.json'
            
            if not info_file.exists():
                return
                
            with open(info_file, 'r', encoding='utf-8') as f:
                history = json.load(f)
                
            # Encontrar e marcar o backup
            for backup in history:
                if backup['name'] == backup_name:
                    backup['type'] = backup_type
                    break
                    
            # Salvar histórico atualizado
            with open(info_file, 'w', encoding='utf-8') as f:
                json.dump(history, f, indent=2, ensure_ascii=False, default=str)
                
        except Exception as e:
            self.logger.error(f"Erro ao marcar tipo de backup: {e}")
            
    def cleanup_old_backups_by_type(self):
        """Remove backups antigos baseado no tipo e configurações de retenção"""
        try:
            if not self.config['auto_cleanup']['enabled']:
                return
                
            backups = self.backup_manager.list_backups()
            
            # Separar backups por tipo
            daily_backups = [b for b in backups if b.get('type') == 'daily']
            weekly_backups = [b for b in backups if b.get('type') == 'weekly']
            monthly_backups = [b for b in backups if b.get('type') == 'monthly']
            
            # Ordenar por timestamp (mais recente primeiro)
            daily_backups.sort(key=lambda x: x['timestamp'], reverse=True)
            weekly_backups.sort(key=lambda x: x['timestamp'], reverse=True)
            monthly_backups.sort(key=lambda x: x['timestamp'], reverse=True)
            
            # Remover backups diários excedentes
            keep_daily = self.config['auto_cleanup']['keep_daily']
            if len(daily_backups) > keep_daily:
                for backup in daily_backups[keep_daily:]:
                    self.remove_backup(backup)
                    self.logger.info(f"Backup diário antigo removido: {backup['name']}")
                    
            # Remover backups semanais excedentes
            keep_weekly = self.config['auto_cleanup']['keep_weekly']
            if len(weekly_backups) > keep_weekly:
                for backup in weekly_backups[keep_weekly:]:
                    self.remove_backup(backup)
                    self.logger.info(f"Backup semanal antigo removido: {backup['name']}")
                    
            # Remover backups mensais excedentes
            keep_monthly = self.config['auto_cleanup']['keep_monthly']
            if len(monthly_backups) > keep_monthly:
                for backup in monthly_backups[keep_monthly:]:
                    self.remove_backup(backup)
                    self.logger.info(f"Backup mensal antigo removido: {backup['name']}")
                    
        except Exception as e:
            self.logger.error(f"Erro na limpeza automática: {e}")
            
    def remove_backup(self, backup_info: dict):
        """Remove um backup específico"""
        try:
            backup_path = Path(backup_info['file_path'])
            
            if backup_path.exists():
                if backup_path.is_dir():
                    import shutil
                    shutil.rmtree(backup_path)
                else:
                    backup_path.unlink()
                    
        except Exception as e:
            self.logger.error(f"Erro ao remover backup: {e}")
            
    def start(self):
        """Inicia o agendador de backups"""
        if self.is_running:
            self.logger.warning("Agendador já está em execução")
            return
            
        self.is_running = True
        self.schedule_backups()
        
        def run_scheduler():
            self.logger.info("Agendador de backups iniciado")
            while self.is_running:
                schedule.run_pending()
                time.sleep(60)  # Verificar a cada minuto
                
        self.scheduler_thread = threading.Thread(target=run_scheduler, daemon=True)
        self.scheduler_thread.start()
        
        self.logger.info("Agendador de backups em execução")
        
    def stop(self):
        """Para o agendador de backups"""
        if not self.is_running:
            self.logger.warning("Agendador não está em execução")
            return
            
        self.is_running = False
        schedule.clear()
        
        if self.scheduler_thread:
            self.scheduler_thread.join(timeout=5)
            
        self.logger.info("Agendador de backups parado")
        
    def get_next_runs(self):
        """Retorna informações sobre as próximas execuções"""
        jobs = schedule.get_jobs()
        next_runs = []
        
        for job in jobs:
            next_run = job.next_run
            if next_run:
                next_runs.append({
                    'job': str(job.job_func.__name__),
                    'next_run': next_run.strftime('%d/%m/%Y %H:%M:%S'),
                    'next_run_timestamp': next_run
                })
                
        # Ordenar por próxima execução
        next_runs.sort(key=lambda x: x['next_run_timestamp'])
        
        return next_runs
        
    def update_config(self, new_config: dict):
        """Atualiza configurações do agendador"""
        try:
            self.config.update(new_config)
            self.save_config()
            
            # Reagendar se estiver em execução
            if self.is_running:
                self.schedule_backups()
                
            self.logger.info("Configurações atualizadas")
            
        except Exception as e:
            self.logger.error(f"Erro ao atualizar configurações: {e}")


def main():
    """Função principal para execução via linha de comando"""
    import argparse
    import signal
    import sys
    
    def signal_handler(sig, frame):
        print("\nParando agendador...")
        scheduler.stop()
        sys.exit(0)
        
    parser = argparse.ArgumentParser(description='Agendador de Backups - Clube da Amizade')
    parser.add_argument('action', choices=['start', 'stop', 'status', 'config'], 
                       help='Ação a ser executada')
    parser.add_argument('--daemon', action='store_true', 
                       help='Executar como daemon (em segundo plano)')
    
    args = parser.parse_args()
    
    scheduler = BackupScheduler()
    
    if args.action == 'start':
        # Configurar handler para CTRL+C
        signal.signal(signal.SIGINT, signal_handler)
        
        scheduler.start()
        
        if args.daemon:
            print("Agendador iniciado em segundo plano")
            # Manter o processo vivo
            try:
                while True:
                    time.sleep(3600)  # Dormir por 1 hora
            except KeyboardInterrupt:
                scheduler.stop()
        else:
            print("Agendador iniciado. Pressione Ctrl+C para parar.")
            try:
                while True:
                    time.sleep(1)
            except KeyboardInterrupt:
                scheduler.stop()
                
    elif args.action == 'stop':
        scheduler.stop()
        print("Agendador parado")
        
    elif args.action == 'status':
        next_runs = scheduler.get_next_runs()
        
        if not next_runs:
            print("Nenhum backup agendado")
        else:
            print("Próximos backups agendados:")
            for run in next_runs:
                print(f"  {run['job']}: {run['next_run']}")
                
    elif args.action == 'config':
        print("Configurações atuais:")
        print(json.dumps(scheduler.config, indent=2, ensure_ascii=False))


if __name__ == '__main__':
    main()