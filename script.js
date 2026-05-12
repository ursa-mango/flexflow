/* ==========================================
   FLEXFLOW - Lógica do Sistema
   ========================================== */

class FlexFlow {
    constructor() {
        this.processes = JSON.parse(localStorage.getItem('flexflow_processes')) || this.getDefaultProcesses();
        this.currentTab = 'dashboard';
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupModals();
        this.setupForms();
        this.setupFilters();
        this.renderProcessTable();
        this.updateAlertCount();
    }

    /* ========== DADOS PADRÃO (DEMO) ========== */
    getDefaultProcesses() {
        return [
            {
                id: 1,
                numero: '001234',
                cliente: 'Silva & Associados',
                tipo: 'trabalhista',
                status: 'em_andamento',
                prioridade: 'alta',
                prazo: '2026-05-14',
                descricao: 'Ação trabalhista - verbas rescisórias'
            },
            {
                id: 2,
                numero: '005678',
                cliente: 'Construtora Beta',
                tipo: 'civil',
                status: 'aguardando',
                prioridade: 'media',
                prazo: '2026-05-20',
                descricao: 'Ação de indenização por danos materiais'
            },
            {
                id: 3,
                numero: '009012',
                cliente: 'Martins Advogados',
                tipo: 'tributario',
                status: 'em_andamento',
                prioridade: 'alta',
                prazo: '2026-05-13',
                descricao: 'Execução fiscal - ISSQN'
            },
            {
                id: 4,
                numero: '003456',
                cliente: 'Saúde Total Ltda',
                tipo: 'civil',
                status: 'concluido',
                prioridade: 'baixa',
                prazo: '2026-05-01',
                descricao: 'Cobrança de honorários advocatícios'
            }
        ];
    }

    /* ========== NAVEGAÇÃO ========== */
    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        const tabContents = document.querySelectorAll('.tab-content');
        const menuToggle = document.getElementById('menuToggle');
        const sidebar = document.getElementById('sidebar');

        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const tabName = item.dataset.tab;

                // Atualiza sidebar
                navItems.forEach(n => n.classList.remove('active'));
                item.classList.add('active');

                // Atualiza conteúdo
                tabContents.forEach(tab => tab.classList.remove('active'));
                const targetTab = document.getElementById(`tab-${tabName}`);
                if (targetTab) {
                    targetTab.classList.add('active');
                }

                this.currentTab = tabName;

                // Fecha sidebar no mobile
                if (window.innerWidth <= 768) {
                    sidebar.classList.remove('open');
                }
            });
        });

        // Menu mobile
        if (menuToggle) {
            menuToggle.addEventListener('click', () => {
                sidebar.classList.toggle('open');
            });
        }

        // Fechar sidebar ao clicar fora
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                if (!sidebar.contains(e.target) && e.target !== menuToggle) {
                    sidebar.classList.remove('open');
                }
            }
        });
    }

    /* ========== MODAL ========== */
    setupModals() {
        const modal = document.getElementById('modalProcesso');
        const btnNovo = document.getElementById('btnNovoProcesso');
        const btnClose = document.getElementById('closeModal');
        const btnCancel = document.getElementById('cancelModal');

        if (btnNovo) {
            btnNovo.addEventListener('click', () => {
                modal.classList.add('open');
            });
        }

        if (btnClose) {
            btnClose.addEventListener('click', () => {
                modal.classList.remove('open');
            });
        }

        if (btnCancel) {
            btnCancel.addEventListener('click', () => {
                modal.classList.remove('open');
            });
        }

        // Fechar ao clicar fora
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('open');
            }
        });
    }

    /* ========== FORMULÁRIO DE PROCESSO ========== */
    setupForms() {
        const form = document.getElementById('processForm');

        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addProcess();
            });
        }
    }

    addProcess() {
        const numero = document.getElementById('numProcesso').value.trim();
        const cliente = document.getElementById('cliente').value.trim();
        const prazo = document.getElementById('prazo').value;

        if (!numero || !cliente || !prazo) {
            alert('Preencha os campos obrigatórios: Número, Cliente e Prazo.');
            return;
        }

        const newProcess = {
            id: Date.now(),
            numero: numero,
            cliente: cliente,
            tipo: document.getElementById('tipoAcao').value,
            status: document.getElementById('statusProcesso').value,
            prioridade: document.getElementById('prioridade').value,
            prazo: prazo,
            descricao: document.getElementById('descricao').value
        };

        this.processes.push(newProcess);
        this.saveProcesses();
        this.renderProcessTable();
        this.updateAlertCount();

        // Fechar modal e resetar form
        document.getElementById('modalProcesso').classList.remove('open');
        document.getElementById('processForm').reset();

        // Feedback visual
        this.showToast('Processo cadastrado com sucesso! ✅');
    }

    /* ========== TABELA DE PROCESSOS ========== */
    renderProcessTable(filteredData = null) {
        const tbody = document.getElementById('processTableBody');
        if (!tbody) return;

        const data = filteredData || this.processes;

        if (data.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align:center;padding:2rem;color:var(--text-muted);">
                        Nenhum processo encontrado
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = data.map(proc => `
            <tr>
                <td><strong>${proc.numero}</strong></td>
                <td>${proc.cliente}</td>
                <td>${this.getTipoLabel(proc.tipo)}</td>
                <td>${this.getStatusBadge(proc.status)}</td>
                <td>${this.getPrioridadeBadge(proc.prioridade)}</td>
                <td>${this.formatDate(proc.prazo)}</td>
                <td>
                    <button class="btn btn-sm btn-outline" onclick="app.viewProcess(${proc.id})">👁</button>
                    <button class="btn btn-sm btn-outline" onclick="app.deleteProcess(${proc.id})">🗑</button>
                </td>
            </tr>
        `).join('');
    }

    viewProcess(id) {
        const proc = this.processes.find(p => p.id === id);
        if (proc) {
            alert(`
📋 Detalhes do Processo

Número: ${proc.numero}
Cliente: ${proc.cliente}
Tipo: ${this.getTipoLabel(proc.tipo)}
Status: ${this.getStatusLabel(proc.status)}
Prioridade: ${this.getPrioridadeLabel(proc.prioridade)}
Prazo: ${this.formatDate(proc.prazo)}
Descrição: ${proc.descricao || 'Nenhuma'}
            `);
        }
    }

    deleteProcess(id) {
        if (confirm('Tem certeza que deseja excluir este processo?')) {
            this.processes = this.processes.filter(p => p.id !== id);
            this.saveProcesses();
            this.renderProcessTable();
            this.updateAlertCount();
            this.showToast('Processo excluído.');
        }
    }

    /* ========== FILTROS ========== */
    setupFilters() {
        const filterStatus = document.getElementById('filterStatus');
        const filterPriority = document.getElementById('filterPriority');
        const searchInput = document.getElementById('searchProcess');

        const applyFilters = () => {
            let filtered = [...this.processes];

            const status = filterStatus?.value;
            const priority = filterPriority?.value;
            const search = searchInput?.value.toLowerCase().trim();

            if (status) {
                filtered = filtered.filter(p => p.status === status);
            }

            if (priority) {
                filtered = filtered.filter(p => p.prioridade === priority);
            }

            if (search) {
                filtered = filtered.filter(p =>
                    p.numero.toLowerCase().includes(search) ||
                    p.cliente.toLowerCase().includes(search)
                );
            }

            this.renderProcessTable(filtered);
        };

        filterStatus?.addEventListener('change', applyFilters);
        filterPriority?.addEventListener('change', applyFilters);
        searchInput?.addEventListener('input', applyFilters);
    }

    /* ========== ALERTAS ========== */
    updateAlertCount() {
        const badge = document.getElementById('alertCount');
        if (!badge) return;

        const urgentes = this.processes.filter(p => {
            if (p.status === 'concluido') return false;
            const daysLeft = this.getDaysLeft(p.prazo);
            return daysLeft <= 3;
        });

        badge.textContent = urgentes.length;

        if (urgentes.length === 0) {
            badge.style.display = 'none';
        } else {
            badge.style.display = 'inline';
        }
    }

    getDaysLeft(prazo) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const deadline = new Date(prazo);
        deadline.setHours(0, 0, 0, 0);
        return Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
    }

    /* ========== UTILITÁRIOS ========== */
    formatDate(dateString) {
        if (!dateString) return '-';
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    }

    getTipoLabel(tipo) {
        const tipos = {
            civil: 'Civil',
            criminal: 'Criminal',
            trabalhista: 'Trabalhista',
            tributario: 'Tributário',
            empresarial: 'Empresarial'
        };
        return tipos[tipo] || tipo;
    }

    getStatusLabel(status) {
        const labels = {
            em_andamento: 'Em Andamento',
            aguardando: 'Aguardando',
            concluido: 'Concluído',
            urgente: 'Urgente'
        };
        return labels[status] || status;
    }

    getStatusBadge(status) {
        const badges = {
            em_andamento: '<span class="badge badge-info">Em Andamento</span>',
            aguardando: '<span class="badge badge-warning">Aguardando</span>',
            concluido: '<span class="badge badge-success">Concluído</span>',
            urgente: '<span class="badge badge-danger">Urgente</span>'
        };
        return badges[status] || status;
    }

    getPrioridadeLabel(prioridade) {
        const labels = {
            alta: 'Alta',
            media: 'Média',
            baixa: 'Baixa'
        };
        return labels[prioridade] || prioridade;
    }

    getPrioridadeBadge(prioridade) {
        const badges = {
            alta: '<span class="badge badge-danger">Alta</span>',
            media: '<span class="badge badge-warning">Média</span>',
            baixa: '<span class="badge badge-success">Baixa</span>'
        };
        return badges[prioridade] || prioridade;
    }

    showToast(message) {
        // Cria um toast simples
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            background: #1a1a2e;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            z-index: 2000;
            animation: fadeIn 0.3s;
            font-weight: 500;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    saveProcesses() {
        localStorage.setItem('flexflow_processes', JSON.stringify(this.processes));
    }
}

/* ========== INICIALIZAÇÃO ========== */
document.addEventListener('DOMContentLoaded', () => {
    window.app = new FlexFlow();
    console.log('🚀 FlexFlow iniciado com sucesso!');
});
