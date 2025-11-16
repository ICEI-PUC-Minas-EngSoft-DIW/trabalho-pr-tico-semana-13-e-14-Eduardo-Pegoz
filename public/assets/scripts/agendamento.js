// Sistema de Agendamentos
const API_URL = 'http://localhost:3000';

// Função para carregar agendamentos
async function carregarAgendamentos() {
    try {
        const response = await fetch(`${API_URL}/agendamentos`);
        if (!response.ok) throw new Error('Erro ao carregar agendamentos');
        
        const agendamentos = await response.json();
        exibirAgendamentos(agendamentos);
        atualizarCalendario(agendamentos);
    } catch (error) {
        console.error('Erro ao carregar agendamentos:', error);
        document.getElementById('lista-agendamentos').innerHTML = `
            <div class="error-message">
                <p>Erro ao carregar agendamentos. Verifique se o JSON Server está rodando.</p>
            </div>
        `;
    }
}

// Função para exibir agendamentos na lista
function exibirAgendamentos(agendamentos) {
    const container = document.getElementById('lista-agendamentos');
    
    if (agendamentos.length === 0) {
        container.innerHTML = '<p class="text-center">Nenhum agendamento encontrado.</p>';
        return;
    }
    
    // Ordenar agendamentos por data (mais recentes primeiro)
    agendamentos.sort((a, b) => new Date(b.data) - new Date(a.data));
    
    container.innerHTML = agendamentos.map(agendamento => `
        <div class="agendamento-item" data-id="${agendamento.id}">
            <div class="agendamento-header">
                <span class="agendamento-cliente">${agendamento.cliente}</span>
                <span class="agendamento-data">${formatarData(agendamento.data)} - ${agendamento.horario}</span>
            </div>
            <div class="agendamento-detalhes">
                <p><strong>Tipo:</strong> ${agendamento.tipo_colecao}</p>
                <p><strong>Duração:</strong> ${agendamento.duracao}</p>
                <p><strong>Valor:</strong> R$ ${parseFloat(agendamento.valor).toFixed(2)}</p>
                <p><strong>Fotos:</strong> ${agendamento.quantidade_fotos}</p>
                <p><strong>Local:</strong> ${agendamento.local}</p>
                <p><strong>Status:</strong> <span class="status-${agendamento.status}">${agendamento.status}</span></p>
                ${agendamento.observacoes ? `<p><strong>Observações:</strong> ${agendamento.observacoes}</p>` : ''}
            </div>
            <div class="agendamento-actions">
                <button class="btn-editar" onclick="editarAgendamento(${agendamento.id})">Editar</button>
                <button class="btn-excluir" onclick="excluirAgendamento(${agendamento.id})">Excluir</button>
            </div>
        </div>
    `).join('');
}

// Função para atualizar o calendário
function atualizarCalendario(agendamentos) {
    const hoje = new Date();
    const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const ultimoDia = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
    
    // Criar grid do calendário (simplificado)
    const calendarioGrid = document.createElement('div');
    calendarioGrid.className = 'calendario-grid';
    
    // Adicionar dias da semana
    const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    diasSemana.forEach(dia => {
        const diaElement = document.createElement('div');
        diaElement.className = 'dia-semana';
        diaElement.textContent = dia;
        calendarioGrid.appendChild(diaElement);
    });
    
    // Adicionar dias do mês
    for (let i = 1; i <= ultimoDia.getDate(); i++) {
        const diaElement = document.createElement('div');
        diaElement.className = 'dia';
        diaElement.textContent = i;
        
        // Verificar se há agendamentos neste dia
        const dataAtual = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        const temAgendamento = agendamentos.some(ag => ag.data === dataAtual);
        
        if (temAgendamento) {
            diaElement.classList.add('agendado');
        }
        
        if (i === hoje.getDate()) {
            diaElement.classList.add('ativo');
        }
        
        calendarioGrid.appendChild(diaElement);
    }
    
    const calendarioContainer = document.querySelector('.calendario');
    const calendarioExistente = calendarioContainer.querySelector('.calendario-grid');
    if (calendarioExistente) {
        calendarioExistente.remove();
    }
    calendarioContainer.appendChild(calendarioGrid);
}

// Função para cadastrar novo agendamento
async function cadastrarAgendamento(dadosAgendamento) {
    try {
        const response = await fetch(`${API_URL}/agendamentos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dadosAgendamento),
        });
        
        if (!response.ok) throw new Error('Erro ao cadastrar agendamento');
        return await response.json();
    } catch (error) {
        console.error('Erro:', error);
        throw error;
    }
}

// Função para editar agendamento
async function editarAgendamento(id) {
    try {
        const response = await fetch(`${API_URL}/agendamentos/${id}`);
        if (!response.ok) throw new Error('Agendamento não encontrado');
        
        const agendamento = await response.json();
        preencherFormularioEdicao(agendamento);
    } catch (error) {
        console.error('Erro ao carregar agendamento para edição:', error);
        alert('Erro ao carregar agendamento para edição.');
    }
}

// Função para preencher formulário de edição
function preencherFormularioEdicao(agendamento) {
    document.getElementById('cliente').value = agendamento.cliente || '';
    document.getElementById('email').value = agendamento.email || '';
    document.getElementById('telefone').value = agendamento.telefone || '';
    document.getElementById('data').value = agendamento.data || '';
    document.getElementById('horario').value = agendamento.horario || '';
    document.getElementById('tipo_colecao').value = agendamento.tipo_colecao || '';
    document.getElementById('duracao').value = agendamento.duracao || '';
    document.getElementById('valor').value = agendamento.valor || '';
    document.getElementById('quantidade_fotos').value = agendamento.quantidade_fotos || '';
    document.getElementById('local').value = agendamento.local || '';
    document.getElementById('observacoes').value = agendamento.observacoes || '';
    document.getElementById('status').value = agendamento.status || 'pendente';
    
    // Alterar texto do botão
    document.getElementById('btn-agendar').textContent = 'Atualizar Agendamento';
    document.getElementById('btn-agendar').dataset.editando = agendamento.id;
}

// Função para excluir agendamento
async function excluirAgendamento(id) {
    if (!confirm('Tem certeza que deseja excluir este agendamento?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/agendamentos/${id}`, {
            method: 'DELETE',
        });
        
        if (!response.ok) throw new Error('Erro ao excluir agendamento');
        
        alert('Agendamento excluído com sucesso!');
        carregarAgendamentos();
    } catch (error) {
        console.error('Erro ao excluir agendamento:', error);
        alert('Erro ao excluir agendamento.');
    }
}

// Função para atualizar agendamento
async function atualizarAgendamento(id, dadosAgendamento) {
    try {
        const response = await fetch(`${API_URL}/agendamentos/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dadosAgendamento),
        });
        
        if (!response.ok) throw new Error('Erro ao atualizar agendamento');
        return await response.json();
    } catch (error) {
        console.error('Erro:', error);
        throw error;
    }
}

// Utilitários
function formatarData(dataString) {
    if (!dataString) return 'Data não informada';
    
    const data = new Date(dataString);
    if (isNaN(data.getTime())) return 'Data inválida';
    
    return data.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    carregarAgendamentos();
    
    // Configurar formulário
    const form = document.getElementById('form-agendamento');
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const dadosAgendamento = {
            cliente: formData.get('cliente'),
            email: formData.get('email'),
            telefone: formData.get('telefone'),
            data: formData.get('data'),
            horario: formData.get('horario'),
            tipo_colecao: formData.get('tipo_colecao'),
            duracao: formData.get('duracao'),
            valor: parseFloat(formData.get('valor')),
            quantidade_fotos: parseInt(formData.get('quantidade_fotos')),
            local: formData.get('local'),
            observacoes: formData.get('observacoes'),
            status: formData.get('status'),
            data_criacao: new Date().toISOString()
        };
        
        const submitBtn = document.getElementById('btn-agendar');
        const originalText = submitBtn.textContent;
        const editandoId = submitBtn.dataset.editando;
        
        try {
            submitBtn.textContent = editandoId ? 'Atualizando...' : 'Agendando...';
            submitBtn.disabled = true;
            
            if (editandoId) {
                await atualizarAgendamento(editandoId, dadosAgendamento);
                alert('Agendamento atualizado com sucesso!');
                delete submitBtn.dataset.editando;
            } else {
                await cadastrarAgendamento(dadosAgendamento);
                alert('Agendamento cadastrado com sucesso!');
            }
            
            form.reset();
            carregarAgendamentos();
            submitBtn.textContent = 'Agendar Ensaio';
        } catch (error) {
            alert('Erro ao processar agendamento. Tente novamente.');
            console.error(error);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });
    
    // Botão cancelar
    document.getElementById('btn-cancelar').addEventListener('click', function() {
        if (confirm('Deseja cancelar? Os dados preenchidos serão perdidos.')) {
            document.getElementById('form-agendamento').reset();
            const submitBtn = document.getElementById('btn-agendar');
            submitBtn.textContent = 'Agendar Ensaio';
            delete submitBtn.dataset.editando;
        }
    });
});