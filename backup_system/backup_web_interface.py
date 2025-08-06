# backup_system/backup_web_interface.py
"""
Interface Web para Gerenciamento de Backups
Sistema web simples para gerenciar backups via navegador
"""

from flask import Flask, render_template_string, request, jsonify, send_file, redirect, url_for, flash
import os
import json
from datetime import datetime
from pathlib import Path
from backup_manager import BackupManager
from backup_scheduler import BackupScheduler
import threading
import zipfile
import tempfile

app = Flask(__name__)
app.secret_key = 'clube_da_amizade_backup_secret_key_2024'

# Inicializar gerenciadores
backup_manager = BackupManager()
backup_scheduler = BackupScheduler()

# Template HTML principal
MAIN_TEMPLATE = """
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sistema de Backup - Clube da Amizade</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(45deg, #2563eb, #1d4ed8);
            color: white;
            padding: 30px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        
        .header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        
        .nav-tabs {
            display: flex;
            background: #f8f9fa;
            border-bottom: 2px solid #e9ecef;
        }
        
        .nav-tab {
            flex: 1;
            padding: 15px 20px;
            background: none;
            border: none;
            cursor: pointer;
            font-size: 16px;
            font-weight: 500;
            transition: all 0.3s ease;
            border-bottom: 3px solid transparent;
        }
        
        .nav-tab:hover {
            background: #e9ecef;
        }
        
        .nav-tab.active {
            background: white;
            border-bottom-color: #2563eb;
            color: #2563eb;
        }
        
        .tab-content {
            display: none;
            padding: 30px;
        }
        
        .tab-content.active {
            display: block;
        }
        
        .card {
            background: #f8f9fa;
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 20px;
            border: 1px solid #e9ecef;
        }
        
        .card h3 {
            color: #2563eb;
            margin-bottom: 15px;
            font-size: 1.3em;
        }
        
        .btn {
            display: inline-block;
            padding: 12px 24px;
            background: linear-gradient(45deg, #2563eb, #1d4ed8);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            border: none;
            cursor: pointer;
            font-size: 16px;
            font-weight: 500;
            transition: all 0.3s ease;
            margin: 5px;
        }
        
        .btn:hover {
            background: linear-gradient(45deg, #1d4ed8, #1e40af);
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(37, 99, 235, 0.4);
        }
        
        .btn-success {
            background: linear-gradient(45deg, #16a34a, #15803d);
        }
        
        .btn-success:hover {
            background: linear-gradient(45deg, #15803d, #166534);
        }
        
        .btn-danger {
            background: linear-gradient(45deg, #dc2626, #b91c1c);
        }
        
        .btn-danger:hover {
            background: linear-gradient(45deg, #b91c1c, #991b1b);
        }
        
        .btn-warning {
            background: linear-gradient(45deg, #d97706, #b45309);
        }
        
        .btn-warning:hover {
            background: linear-gradient(45deg, #b45309, #92400e);
        }
        
        .table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        
        .table th,
        .table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e9ecef;
        }
        
        .table th {
            background: #f8f9fa;
            font-weight: 600;
            color: #495057;
        }
        
        .table tr:hover {
            background: #f8f9fa;
        }
        
        .status-badge {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 500;
            text-transform: uppercase;
        }
        
        .status-concluido {
            background: #d1fae5;
            color: #065f46;
        }
        
        .status-erro {
            background: #fee2e2;
            color: #991b1b;
        }
        
        .status-em_progresso {
            background: #fef3c7;
            color: #92400e;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: 500;
            color: #374151;
        }
        
        .form-group input,
        .form-group textarea,
        .form-group select {
            width: 100%;
            padding: 10px;
            border: 2px solid #e5e7eb;
            border-radius: 6px;
            font-size: 16px;
            transition: border-color 0.3s ease;
        }
        
        .form-group input:focus,
        .form-group textarea:focus,
        .form-group select:focus {
            outline: none;
            border-color: #2563eb;
            box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }
        
        .alert {
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        
        .alert-success {
            background: #d1fae5;
            color: #065f46;
            border: 1px solid #a7f3d0;
        }
        
        .alert-error {
            background: #fee2e2;
            color: #991b1b;
            border: 1px solid #fca5a5;
        }
        
        .alert-info {
            background: #dbeafe;
            color: #1e40af;
            border: 1px solid #93c5fd;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .stat-card {
            background: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            border: 2px solid #e5e7eb;
            transition: all 0.3s ease;
        }
        
        .stat-card:hover {
            border-color: #2563eb;
            transform: translateY(-2px);
        }
        
        .stat-number {
            font-size: 2em;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 5px;
        }
        
        .stat-label {
            color: #6b7280;
            font-size: 14px;
        }
        
        .loading {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 3px solid #f3f3f3;
            border-top: 3px solid #2563eb;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .progress-bar {
            width: 100%;
            height: 20px;
            background: #e5e7eb;
            border-radius: 10px;
            overflow: hidden;
            margin: 10px 0;
        }
        
        .progress-fill {
            height: 100%;
            background: linear-gradient(45deg, #2563eb, #1d4ed8);
            transition: width 0.3s ease;
        }
        
        @media (max-width: 768px) {
            .nav-tabs {
                flex-direction: column;
            }
            
            .stats-grid {
                grid-template-columns: 1fr;
            }
            
            .table {
                font-size: 14px;
            }
            
            .btn {
                padding: 10px 16px;
                font-size: 14px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🛡️ Sistema de Backup</h1>
            <p>Clube da Amizade Pe. Antônio Gonçalves</p>
        </div>
        
        {% with messages = get_flashed_messages(with_categories=true) %}
            {% if messages %}
                {% for category, message in messages %}
                    <div class="alert alert-{{ category }}">
                        {{ message }}
                    </div>
                {% endfor %}
            {% endif %}
        {% endwith %}
        
        <div class="nav-tabs">
            <button class="nav-tab active" onclick="showTab('dashboard')">📊 Dashboard</button>
            <button class="nav-tab" onclick="showTab('backups')">💾 Backups</button>
            <button class="nav-tab" onclick="showTab('scheduler')">⏰ Agendador</button>
            <button class="nav-tab" onclick="showTab('settings')">⚙️ Configurações</button>
        </div>
        
        <!-- Dashboard Tab -->
        <div id="dashboard" class="tab-content active">
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-number">{{ stats.total_backups }}</div>
                    <div class="stat-label">Total de Backups</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">{{ stats.total_size_formatted }}</div>
                    <div class="stat-label">Espaço Utilizado</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">{{ next_runs|length }}</div>
                    <div class="stat-label">Backups Agendados</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">{{ recent_backups|length }}</div>
                    <div class="stat-label">Backups Recentes</div>
                </div>
            </div>
            
            <div class="card">
                <h3>🚀 Ações Rápidas</h3>
                <button class="btn btn-success" onclick="createBackup()">
                    <span id="backup-btn-text">Criar Backup Agora</span>
                    <span id="backup-loading" class="loading" style="display: none;"></span>
                </button>
                <a href="{{ url_for('download_latest_backup') }}" class="btn">📥 Baixar Último Backup</a>
                <button class="btn btn-warning" onclick="startScheduler()">▶️ Iniciar Agendador</button>
                <button class="btn btn-danger" onclick="stopScheduler()">⏹️ Parar Agendador</button>
            </div>
            
            {% if next_runs %}
            <div class="card">
                <h3>⏰ Próximos Backups Agendados</h3>
                <table class="table">
                    <thead>
                        <tr>
                            <th>Tipo</th>
                            <th>Próxima Execução</th>
                        </tr>
                    </thead>
                    <tbody>
                        {% for run in next_runs %}
                        <tr>
                            <td>{{ run.job }}</td>
                            <td>{{ run.next_run }}</td>
                        </tr>
                        {% endfor %}
                    </tbody>
                </table>
            </div>
            {% endif %}
            
            {% if recent_backups %}
            <div class="card">
                <h3>📋 Backups Recentes</h3>
                <table class="table">
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Data</th>
                            <th>Tamanho</th>
                            <th>Status</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {% for backup in recent_backups %}
                        <tr>
                            <td>{{ backup.name }}</td>
                            <td>{{ backup.timestamp_formatted }}</td>
                            <td>{{ backup.size_formatted }}</td>
                            <td><span class="status-badge status-{{ backup.status }}">{{ backup.status }}</span></td>
                            <td>
                                <a href="{{ url_for('download_backup', backup_name=backup.name) }}" class="btn" style="padding: 6px 12px; font-size: 12px;">📥</a>
                                <button onclick="deleteBackup('{{ backup.name }}')" class="btn btn-danger" style="padding: 6px 12px; font-size: 12px;">🗑️</button>
                            </td>
                        </tr>
                        {% endfor %}
                    </tbody>
                </table>
            </div>
            {% endif %}
        </div>
        
        <!-- Backups Tab -->
        <div id="backups" class="tab-content">
            <div class="card">
                <h3>💾 Criar Novo Backup</h3>
                <form method="POST" action="{{ url_for('create_backup') }}">
                    <div class="form-group">
                        <label for="description">Descrição do Backup:</label>
                        <input type="text" id="description" name="description" placeholder="Ex: Backup antes da atualização">
                    </div>
                    <button type="submit" class="btn btn-success">Criar Backup</button>
                </form>
            </div>
            
            <div class="card">
                <h3>📋 Todos os Backups</h3>
                {% if backups %}
                <table class="table">
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Descrição</th>
                            <th>Data</th>
                            <th>Tipo</th>
                            <th>Tamanho</th>
                            <th>Status</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {% for backup in backups %}
                        <tr>
                            <td>{{ backup.name }}</td>
                            <td>{{ backup.description or '-' }}</td>
                            <td>{{ backup.timestamp_formatted }}</td>
                            <td>{{ backup.type or 'Manual' }}</td>
                            <td>{{ backup.size_formatted }}</td>
                            <td><span class="status-badge status-{{ backup.status }}">{{ backup.status }}</span></td>
                            <td>
                                <a href="{{ url_for('download_backup', backup_name=backup.name) }}" class="btn" style="padding: 6px 12px; font-size: 12px;">📥 Baixar</a>
                                <button onclick="restoreBackup('{{ backup.name }}')" class="btn btn-warning" style="padding: 6px 12px; font-size: 12px;">🔄 Restaurar</button>
                                <button onclick="deleteBackup('{{ backup.name }}')" class="btn btn-danger" style="padding: 6px 12px; font-size: 12px;">🗑️ Excluir</button>
                            </td>
                        </tr>
                        {% endfor %}
                    </tbody>
                </table>
                {% else %}
                <p>Nenhum backup encontrado. Crie seu primeiro backup!</p>
                {% endif %}
            </div>
        </div>
        
        <!-- Scheduler Tab -->
        <div id="scheduler" class="tab-content">
            <div class="card">
                <h3>⏰ Configurações do Agendador</h3>
                <form method="POST" action="{{ url_for('update_scheduler_config') }}">
                    <h4>Backup Diário</h4>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" name="daily_enabled" {% if scheduler_config.daily_backup.enabled %}checked{% endif %}>
                            Ativar backup diário
                        </label>
                    </div>
                    <div class="form-group">
                        <label for="daily_time">Horário:</label>
                        <input type="time" id="daily_time" name="daily_time" value="{{ scheduler_config.daily_backup.time }}">
                    </div>
                    
                    <h4>Backup Semanal</h4>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" name="weekly_enabled" {% if scheduler_config.weekly_backup.enabled %}checked{% endif %}>
                            Ativar backup semanal
                        </label>
                    </div>
                    <div class="form-group">
                        <label for="weekly_day">Dia da semana:</label>
                        <select id="weekly_day" name="weekly_day">
                            <option value="monday" {% if scheduler_config.weekly_backup.day == 'monday' %}selected{% endif %}>Segunda-feira</option>
                            <option value="tuesday" {% if scheduler_config.weekly_backup.day == 'tuesday' %}selected{% endif %}>Terça-feira</option>
                            <option value="wednesday" {% if scheduler_config.weekly_backup.day == 'wednesday' %}selected{% endif %}>Quarta-feira</option>
                            <option value="thursday" {% if scheduler_config.weekly_backup.day == 'thursday' %}selected{% endif %}>Quinta-feira</option>
                            <option value="friday" {% if scheduler_config.weekly_backup.day == 'friday' %}selected{% endif %}>Sexta-feira</option>
                            <option value="saturday" {% if scheduler_config.weekly_backup.day == 'saturday' %}selected{% endif %}>Sábado</option>
                            <option value="sunday" {% if scheduler_config.weekly_backup.day == 'sunday' %}selected{% endif %}>Domingo</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="weekly_time">Horário:</label>
                        <input type="time" id="weekly_time" name="weekly_time" value="{{ scheduler_config.weekly_backup.time }}">
                    </div>
                    
                    <h4>Backup Mensal</h4>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" name="monthly_enabled" {% if scheduler_config.monthly_backup.enabled %}checked{% endif %}>
                            Ativar backup mensal
                        </label>
                    </div>
                    <div class="form-group">
                        <label for="monthly_day">Dia do mês:</label>
                        <input type="number" id="monthly_day" name="monthly_day" min="1" max="28" value="{{ scheduler_config.monthly_backup.day }}">
                    </div>
                    <div class="form-group">
                        <label for="monthly_time">Horário:</label>
                        <input type="time" id="monthly_time" name="monthly_time" value="{{ scheduler_config.monthly_backup.time }}">
                    </div>
                    
                    <button type="submit" class="btn btn-success">Salvar Configurações</button>
                </form>
            </div>
            
            <div class="card">
                <h3>🎛️ Controle do Agendador</h3>
                <button class="btn btn-success" onclick="startScheduler()">▶️ Iniciar Agendador</button>
                <button class="btn btn-danger" onclick="stopScheduler()">⏹️ Parar Agendador</button>
                <button class="btn" onclick="location.reload()">🔄 Atualizar Status</button>
            </div>
        </div>
        
        <!-- Settings Tab -->
        <div id="settings" class="tab-content">
            <div class="card">
                <h3>⚙️ Configurações Gerais</h3>
                <form method="POST" action="{{ url_for('update_settings') }}">
                    <div class="form-group">
                        <label for="max_backups">Máximo de backups a manter:</label>
                        <input type="number" id="max_backups" name="max_backups" min="1" max="50" value="{{ backup_config.max_backups }}">
                    </div>
                    
                    <div class="form-group">
                        <label>
                            <input type="checkbox" name="compress" {% if backup_config.compress %}checked{% endif %}>
                            Comprimir backups (recomendado)
                        </label>
                    </div>
                    
                    <div class="form-group">
                        <label>
                            <input type="checkbox" name="include_media" {% if backup_config.include_media %}checked{% endif %}>
                            Incluir arquivos de mídia
                        </label>
                    </div>
                    
                    <div class="form-group">
                        <label>
                            <input type="checkbox" name="include_static" {% if backup_config.include_static %}checked{% endif %}>
                            Incluir arquivos estáticos
                        </label>
                    </div>
                    
                    <button type="submit" class="btn btn-success">Salvar Configurações</button>
                </form>
            </div>
            
            <div class="card">
                <h3>🧹 Limpeza de Backups</h3>
                <p>Remove backups antigos baseado nas configurações de retenção.</p>
                <button class="btn btn-warning" onclick="cleanupBackups()">🧹 Limpar Backups Antigos</button>
            </div>
            
            <div class="card">
                <h3>📊 Informações do Sistema</h3>
                <table class="table">
                    <tr>
                        <td><strong>Pasta de Backups:</strong></td>
                        <td>{{ backup_dir }}</td>
                    </tr>
                    <tr>
                        <td><strong>Banco de Dados:</strong></td>
                        <td>{{ database_path }}</td>
                    </tr>
                    <tr>
                        <td><strong>Pasta de Mídia:</strong></td>
                        <td>{{ media_path }}</td>
                    </tr>
                    <tr>
                        <td><strong>Espaço Total dos Backups:</strong></td>
                        <td>{{ stats.total_size_formatted }}</td>
                    </tr>
                </table>
            </div>
        </div>
    </div>
    
    <script>
        function showTab(tabName) {
            // Esconder todas as abas
            const tabs = document.querySelectorAll('.tab-content');
            tabs.forEach(tab => tab.classList.remove('active'));
            
            // Remover classe active dos botões
            const buttons = document.querySelectorAll('.nav-tab');
            buttons.forEach(btn => btn.classList.remove('active'));
            
            // Mostrar aba selecionada
            document.getElementById(tabName).classList.add('active');
            event.target.classList.add('active');
        }
        
        function createBackup() {
            const btn = document.getElementById('backup-btn-text');
            const loading = document.getElementById('backup-loading');
            
            btn.style.display = 'none';
            loading.style.display = 'inline-block';
            
            fetch('/api/create-backup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Backup criado com sucesso: ' + data.backup_name);
                    location.reload();
                } else {
                    alert('Erro ao criar backup: ' + data.error);
                }
            })
            .catch(error => {
                alert('Erro: ' + error);
            })
            .finally(() => {
                btn.style.display = 'inline';
                loading.style.display = 'none';
            });
        }
        
        function deleteBackup(backupName) {
            if (confirm('Tem certeza que deseja excluir o backup: ' + backupName + '?')) {
                fetch('/api/delete-backup', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({backup_name: backupName})
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert('Backup excluído com sucesso');
                        location.reload();
                    } else {
                        alert('Erro ao excluir backup: ' + data.error);
                    }
                });
            }
        }
        
        function restoreBackup(backupName) {
            if (confirm('ATENÇÃO: Esta ação irá substituir os dados atuais pelo backup selecionado. Tem certeza?')) {
                fetch('/api/restore-backup', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({backup_name: backupName})
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert('Backup restaurado com sucesso');
                        location.reload();
                    } else {
                        alert('Erro ao restaurar backup: ' + data.error);
                    }
                });
            }
        }
        
        function startScheduler() {
            fetch('/api/start-scheduler', {method: 'POST'})
            .then(response => response.json())
            .then(data => {
                alert(data.message);
                if (data.success) location.reload();
            });
        }
        
        function stopScheduler() {
            fetch('/api/stop-scheduler', {method: 'POST'})
            .then(response => response.json())
            .then(data => {
                alert(data.message);
                if (data.success) location.reload();
            });
        }
        
        function cleanupBackups() {
            if (confirm('Tem certeza que deseja limpar backups antigos?')) {
                fetch('/api/cleanup-backups', {method: 'POST'})
                .then(response => response.json())
                .then(data => {
                    alert(data.message);
                    if (data.success) location.reload();
                });
            }
        }
        
        // Auto-refresh a cada 30 segundos
        setInterval(() => {
            if (document.getElementById('dashboard').classList.contains('active')) {
                location.reload();
            }
        }, 30000);
    </script>
</body>
</html>
"""

@app.route('/')
def index():
    """Página principal do sistema de backup"""
    try:
        # Obter estatísticas
        stats = backup_manager.get_backup_statistics()
        
        # Obter lista de backups
        backups = backup_manager.list_backups()
        
        # Formatar timestamps
        for backup in backups:
            timestamp = datetime.strptime(backup['timestamp'], '%Y%m%d_%H%M%S')
            backup['timestamp_formatted'] = timestamp.strftime('%d/%m/%Y %H:%M')
        
        # Backups recentes (últimos 5)
        recent_backups = backups[:5]
        
        # Próximas execuções do agendador
        next_runs = backup_scheduler.get_next_runs()
        
        # Configurações
        backup_config = backup_manager.config
        scheduler_config = backup_scheduler.config
        
        return render_template_string(MAIN_TEMPLATE,
            stats=stats,
            backups=backups,
            recent_backups=recent_backups,
            next_runs=next_runs,
            backup_config=backup_config,
            scheduler_config=scheduler_config,
            backup_dir=str(backup_manager.backup_dir),
            database_path=str(backup_manager.config['database_path']),
            media_path=str(backup_manager.config['media_path'])
        )
        
    except Exception as e:
        return f"Erro ao carregar página: {e}", 500

@app.route('/create-backup', methods=['POST'])
def create_backup():
    """Cria um novo backup"""
    try:
        description = request.form.get('description', '')
        
        # Executar backup em thread separada para não bloquear a interface
        def run_backup():
            backup_manager.create_full_backup(description)
            
        backup_thread = threading.Thread(target=run_backup)
        backup_thread.start()
        
        flash('Backup iniciado com sucesso!', 'success')
        return redirect(url_for('index'))
        
    except Exception as e:
        flash(f'Erro ao criar backup: {e}', 'error')
        return redirect(url_for('index'))

@app.route('/api/create-backup', methods=['POST'])
def api_create_backup():
    """API para criar backup"""
    try:
        description = request.json.get('description', 'Backup via interface web')
        result = backup_manager.create_full_backup(description)
        
        return jsonify({
            'success': result['status'] == 'concluido',
            'backup_name': result['name'],
            'error': result.get('error')
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/delete-backup', methods=['POST'])
def api_delete_backup():
    """API para excluir backup"""
    try:
        backup_name = request.json.get('backup_name')
        
        # Encontrar e remover backup
        backups = backup_manager.list_backups()
        backup_to_remove = None
        
        for backup in backups:
            if backup['name'] == backup_name:
                backup_to_remove = backup
                break
                
        if not backup_to_remove:
            return jsonify({'success': False, 'error': 'Backup não encontrado'})
            
        # Remover arquivo
        backup_path = Path(backup_to_remove['file_path'])
        if backup_path.exists():
            if backup_path.is_dir():
                import shutil
                shutil.rmtree(backup_path)
            else:
                backup_path.unlink()
                
        return jsonify({'success': True})
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/restore-backup', methods=['POST'])
def api_restore_backup():
    """API para restaurar backup"""
    try:
        backup_name = request.json.get('backup_name')
        success = backup_manager.restore_backup(backup_name)
        
        return jsonify({
            'success': success,
            'error': None if success else 'Erro na restauração'
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/start-scheduler', methods=['POST'])
def api_start_scheduler():
    """API para iniciar agendador"""
    try:
        backup_scheduler.start()
        return jsonify({'success': True, 'message': 'Agendador iniciado com sucesso'})
        
    except Exception as e:
        return jsonify({'success': False, 'message': f'Erro ao iniciar agendador: {e}'})

@app.route('/api/stop-scheduler', methods=['POST'])
def api_stop_scheduler():
    """API para parar agendador"""
    try:
        backup_scheduler.stop()
        return jsonify({'success': True, 'message': 'Agendador parado com sucesso'})
        
    except Exception as e:
        return jsonify({'success': False, 'message': f'Erro ao parar agendador: {e}'})

@app.route('/api/cleanup-backups', methods=['POST'])
def api_cleanup_backups():
    """API para limpar backups antigos"""
    try:
        backup_manager.cleanup_old_backups()
        return jsonify({'success': True, 'message': 'Limpeza concluída com sucesso'})
        
    except Exception as e:
        return jsonify({'success': False, 'message': f'Erro na limpeza: {e}'})

@app.route('/download-backup/<backup_name>')
def download_backup(backup_name):
    """Download de um backup específico"""
    try:
        backups = backup_manager.list_backups()
        backup_info = None
        
        for backup in backups:
            if backup['name'] == backup_name:
                backup_info = backup
                break
                
        if not backup_info:
            flash('Backup não encontrado', 'error')
            return redirect(url_for('index'))
            
        backup_path = Path(backup_info['file_path'])
        
        if not backup_path.exists():
            flash('Arquivo de backup não encontrado', 'error')
            return redirect(url_for('index'))
            
        return send_file(backup_path, as_attachment=True)
        
    except Exception as e:
        flash(f'Erro no download: {e}', 'error')
        return redirect(url_for('index'))

@app.route('/download-latest-backup')
def download_latest_backup():
    """Download do backup mais recente"""
    try:
        backups = backup_manager.list_backups()
        
        if not backups:
            flash('Nenhum backup encontrado', 'error')
            return redirect(url_for('index'))
            
        latest_backup = backups[0]  # Lista já vem ordenada
        return download_backup(latest_backup['name'])
        
    except Exception as e:
        flash(f'Erro no download: {e}', 'error')
        return redirect(url_for('index'))

@app.route('/update-scheduler-config', methods=['POST'])
def update_scheduler_config():
    """Atualiza configurações do agendador"""
    try:
        new_config = {
            'daily_backup': {
                'enabled': 'daily_enabled' in request.form,
                'time': request.form.get('daily_time', '02:00'),
                'description': 'Backup diário automático'
            },
            'weekly_backup': {
                'enabled': 'weekly_enabled' in request.form,
                'day': request.form.get('weekly_day', 'sunday'),
                'time': request.form.get('weekly_time', '03:00'),
                'description': 'Backup semanal automático'
            },
            'monthly_backup': {
                'enabled': 'monthly_enabled' in request.form,
                'day': int(request.form.get('monthly_day', 1)),
                'time': request.form.get('monthly_time', '04:00'),
                'description': 'Backup mensal automático'
            }
        }
        
        backup_scheduler.update_config(new_config)
        flash('Configurações do agendador atualizadas com sucesso!', 'success')
        
    except Exception as e:
        flash(f'Erro ao atualizar configurações: {e}', 'error')
        
    return redirect(url_for('index'))

@app.route('/update-settings', methods=['POST'])
def update_settings():
    """Atualiza configurações gerais"""
    try:
        backup_manager.config.update({
            'max_backups': int(request.form.get('max_backups', 10)),
            'compress': 'compress' in request.form,
            'include_media': 'include_media' in request.form,
            'include_static': 'include_static' in request.form
        })
        
        flash('Configurações atualizadas com sucesso!', 'success')
        
    except Exception as e:
        flash(f'Erro ao atualizar configurações: {e}', 'error')
        
    return redirect(url_for('index'))

if __name__ == '__main__':
    print("🛡️ Sistema de Backup - Clube da Amizade")
    print("Interface web disponível em: http://localhost:5000")
    print("Pressione Ctrl+C para parar")
    
    app.run(debug=True, host='0.0.0.0', port=5000)