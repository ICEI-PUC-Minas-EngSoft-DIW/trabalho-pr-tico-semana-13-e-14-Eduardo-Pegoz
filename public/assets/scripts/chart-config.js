// Configuração dos gráficos com Chart.js - Conectado com Agendamentos
let agendamentosData = [];
let charts = {};

// Cores para os gráficos
const cores = {
    primary: '#704241',
    secondary: '#cdbbaf',
    accent: '#8a5a58',
    success: '#28a745',
    warning: '#ffc107',
    danger: '#dc3545',
    info: '#17a2b8'
};

// Função para carregar dados da API
async function carregarDadosEstatisticas() {
    try {
        console.log('Carregando dados para estatísticas...');
        const [agendamentosResponse, sessoesResponse] = await Promise.all([
            fetch('http://localhost:3000/agendamentos'),
            fetch('http://localhost:3000/sessoes')
        ]);
        
        if (!agendamentosResponse.ok) throw new Error('Erro ao carregar agendamentos');
        
        agendamentosData = await agendamentosResponse.json();
        console.log('Dados carregados:', agendamentosData);
        
        atualizarMetricas();
        inicializarGraficos();
        configurarFiltros();
    } catch (error) {
        console.error('Erro ao carregar dados para estatísticas:', error);
        mostrarErroEstatisticas('Erro ao carregar dados. Verifique se o JSON Server está rodando.');
    }
}

// Função para atualizar as métricas rápidas
function atualizarMetricas() {
    console.log('Atualizando métricas...');
    
    // Total de agendamentos
    document.getElementById('total-sessoes').textContent = agendamentosData.length;
    
    // Agendamentos confirmados
    const agendamentosConfirmados = agendamentosData.filter(ag => ag.status === 'confirmado');
    document.getElementById('sessoes-destaque').textContent = agendamentosConfirmados.length;
    
    // Tipos de coleção únicos
    const tipos = [...new Set(agendamentosData.map(ag => ag.tipo_colecao))];
    document.getElementById('categorias-unicas').textContent = tipos.length;
    
    // Valor total agendado
    const valorTotal = agendamentosData.reduce((acc, ag) => acc + (parseFloat(ag.valor) || 0), 0);
    const valorMedio = agendamentosData.length > 0 ? valorTotal / agendamentosData.length : 0;
    document.getElementById('media-preco').textContent = `R$ ${valorMedio.toFixed(2)}`;
    
    console.log('Métricas atualizadas:', {
        total: agendamentosData.length,
        confirmados: agendamentosConfirmados.length,
        tipos: tipos.length,
        valorMedio: valorMedio
    });
}

// Função para inicializar todos os gráficos
function inicializarGraficos() {
    console.log('Inicializando gráficos...');
    
    criarGraficoTiposColecao();
    criarGraficoValores();
    criarGraficoMensal();
    criarGraficoStatus();
}

// Gráfico de agendamentos por tipo de coleção
function criarGraficoTiposColecao() {
    const ctx = document.getElementById('chartCategorias');
    if (!ctx) {
        console.error('Elemento chartCategorias não encontrado');
        return;
    }
    
    const context = ctx.getContext('2d');
    
    // Contar agendamentos por tipo de coleção
    const contadorTipos = {};
    agendamentosData.forEach(agendamento => {
        const tipo = agendamento.tipo_colecao || 'Sem Tipo';
        contadorTipos[tipo] = (contadorTipos[tipo] || 0) + 1;
    });
    
    const tipos = Object.keys(contadorTipos);
    const quantidades = Object.values(contadorTipos);
    
    console.log('Dados gráfico tipos:', { tipos, quantidades });
    
    if (charts.tipos) {
        charts.tipos.destroy();
    }
    
    charts.tipos = new Chart(context, {
        type: 'pie',
        data: {
            labels: tipos,
            datasets: [{
                data: quantidades,
                backgroundColor: [
                    cores.primary,
                    cores.secondary,
                    cores.accent,
                    cores.success,
                    cores.warning,
                    cores.info
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Gráfico de valores por tipo de coleção
function criarGraficoValores() {
    const ctx = document.getElementById('chartPrecos');
    if (!ctx) {
        console.error('Elemento chartPrecos não encontrado');
        return;
    }
    
    const context = ctx.getContext('2d');
    
    // Calcular valor médio por tipo de coleção
    const valoresPorTipo = {};
    agendamentosData.forEach(agendamento => {
        const tipo = agendamento.tipo_colecao || 'Sem Tipo';
        const valor = parseFloat(agendamento.valor) || 0;
        
        if (!valoresPorTipo[tipo]) {
            valoresPorTipo[tipo] = [];
        }
        valoresPorTipo[tipo].push(valor);
    });
    
    const tipos = Object.keys(valoresPorTipo);
    const valoresMedios = tipos.map(tipo => {
        const valores = valoresPorTipo[tipo];
        return valores.reduce((acc, valor) => acc + valor, 0) / valores.length;
    });
    
    console.log('Dados gráfico valores:', { tipos, valoresMedios });
    
    if (charts.valores) {
        charts.valores.destroy();
    }
    
    charts.valores = new Chart(context, {
        type: 'bar',
        data: {
            labels: tipos,
            datasets: [{
                label: 'Valor Médio (R$)',
                data: valoresMedios,
                backgroundColor: cores.accent,
                borderColor: cores.primary,
                borderWidth: 2,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return 'R$ ' + value.toFixed(2);
                        },
                        font: {
                            size: 11
                        }
                    },
                    grid: {
                        color: 'rgba(0,0,0,0.1)'
                    }
                },
                x: {
                    ticks: {
                        font: {
                            size: 11
                        }
                    },
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Valor médio: R$ ${context.raw.toFixed(2)}`;
                        }
                    }
                }
            }
        }
    });
}

// Gráfico de distribuição mensal
function criarGraficoMensal() {
    const ctx = document.getElementById('chartMensal');
    if (!ctx) {
        console.error('Elemento chartMensal não encontrado');
        return;
    }
    
    const context = ctx.getContext('2d');
    
    // Agrupar por mês
    const agendamentosPorMes = {};
    agendamentosData.forEach(agendamento => {
        if (agendamento.data) {
            try {
                const data = new Date(agendamento.data);
                if (!isNaN(data.getTime())) {
                    const mesAno = `${(data.getMonth() + 1).toString().padStart(2, '0')}/${data.getFullYear()}`;
                    agendamentosPorMes[mesAno] = (agendamentosPorMes[mesAno] || 0) + 1;
                }
            } catch (error) {
                console.error('Erro ao processar data:', agendamento.data, error);
            }
        }
    });
    
    // Ordenar por data
    const meses = Object.keys(agendamentosPorMes).sort((a, b) => {
        const [mesA, anoA] = a.split('/').map(Number);
        const [mesB, anoB] = b.split('/').map(Number);
        return new Date(anoA, mesA - 1) - new Date(anoB, mesB - 1);
    });
    
    const quantidades = meses.map(mes => agendamentosPorMes[mes]);
    
    console.log('Dados gráfico mensal:', { meses, quantidades });
    
    if (charts.mensal) {
        charts.mensal.destroy();
    }
    
    charts.mensal = new Chart(context, {
        type: 'line',
        data: {
            labels: meses,
            datasets: [{
                label: 'Agendamentos por Mês',
                data: quantidades,
                backgroundColor: cores.primary + '20',
                borderColor: cores.primary,
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: cores.primary,
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        font: {
                            size: 11
                        }
                    },
                    grid: {
                        color: 'rgba(0,0,0,0.1)'
                    }
                },
                x: {
                    ticks: {
                        font: {
                            size: 11
                        }
                    },
                    grid: {
                        color: 'rgba(0,0,0,0.1)'
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Agendamentos: ${context.raw}`;
                        }
                    }
                }
            }
        }
    });
}

// Gráfico de status dos agendamentos
function criarGraficoStatus() {
    const ctx = document.getElementById('chartDestaques');
    if (!ctx) {
        console.error('Elemento chartDestaques não encontrado');
        return;
    }
    
    const context = ctx.getContext('2d');
    
    const statusCount = {
        'confirmado': agendamentosData.filter(ag => ag.status === 'confirmado').length,
        'pendente': agendamentosData.filter(ag => ag.status === 'pendente').length,
        'cancelado': agendamentosData.filter(ag => ag.status === 'cancelado').length,
        'realizado': agendamentosData.filter(ag => ag.status === 'realizado').length
    };
    
    console.log('Dados gráfico status:', statusCount);
    
    if (charts.status) {
        charts.status.destroy();
    }
    
    charts.status = new Chart(context, {
        type: 'doughnut',
        data: {
            labels: ['Confirmados', 'Pendentes', 'Cancelados', 'Realizados'],
            datasets: [{
                data: [
                    statusCount.confirmado,
                    statusCount.pendente,
                    statusCount.cancelado,
                    statusCount.realizado
                ],
                backgroundColor: [
                    cores.success,
                    cores.warning,
                    cores.danger,
                    cores.info
                ],
                borderWidth: 3,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '60%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Configurar filtros
function configurarFiltros() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remover classe active de todos os botões
            filterBtns.forEach(b => b.classList.remove('active'));
            // Adicionar classe active ao botão clicado
            this.classList.add('active');
            
            const filter = this.dataset.filter;
            aplicarFiltro(filter);
        });
    });
}

// Aplicar filtro aos gráficos
function aplicarFiltro(filter) {
    let dadosFiltrados = agendamentosData;
    
    if (filter !== 'all') {
        dadosFiltrados = agendamentosData.filter(ag => ag.tipo_colecao === filter);
    }
    
    console.log(`Aplicando filtro: ${filter}`, dadosFiltrados.length + ' agendamentos');
    
    // Atualizar métricas com dados filtrados
    document.getElementById('total-sessoes').textContent = dadosFiltrados.length;
    const agendamentosConfirmados = dadosFiltrados.filter(ag => ag.status === 'confirmado');
    document.getElementById('sessoes-destaque').textContent = agendamentosConfirmados.length;
    
    // Recriar gráficos com dados filtrados
    const dadosOriginais = agendamentosData;
    agendamentosData = dadosFiltrados;
    inicializarGraficos();
    agendamentosData = dadosOriginais;
}

// Função para mostrar erro nas estatísticas
function mostrarErroEstatisticas(mensagem) {
    const container = document.querySelector('.stats-section .container');
    if (container) {
        const erroDiv = document.createElement('div');
        erroDiv.className = 'alert alert-danger text-center';
        erroDiv.innerHTML = `
            <strong>Erro:</strong> ${mensagem}
            <button type="button" class="btn btn-sm btn-outline-danger ms-2" onclick="carregarDadosEstatisticas()">
                Tentar Novamente
            </button>
        `;
        container.appendChild(erroDiv);
    }
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    console.log('Página de estatísticas carregada');
    
    if (document.getElementById('chartCategorias')) {
        console.log('Inicializando gráficos...');
        carregarDadosEstatisticas();
    }
});