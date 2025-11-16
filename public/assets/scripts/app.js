// URL base da API
const API_URL = 'http://localhost:3000/sessoes';

// Função para fazer requisições com tratamento de erro
async function fetchData(url, options = {}) {
    try {
        const response = await fetch(url, options);
        if (!response.ok) throw new Error(`Erro ${response.status}: ${response.statusText}`);
        return await response.json();
    } catch (error) {
        console.error('Erro na requisição:', error);
        throw error;
    }
}

// Funções para a página index.html
async function carregarDestaques() {
    try {
        const sessoesDestaque = await fetchData(`${API_URL}?destaque=true`);
        const carouselInner = document.getElementById('carousel-inner');
        const carouselIndicators = document.getElementById('carousel-indicators');
        
        if (carouselInner && sessoesDestaque.length > 0) {
            carouselInner.innerHTML = '';
            carouselIndicators.innerHTML = '';
            
            sessoesDestaque.forEach((sessao, index) => {
                // Criar indicador
                const indicator = document.createElement('button');
                indicator.type = 'button';
                indicator.dataset.bsTarget = '#carouselDestaques';
                indicator.dataset.bsSlideTo = index;
                indicator.className = index === 0 ? 'active' : '';
                indicator.setAttribute('aria-current', index === 0 ? 'true' : 'false');
                indicator.ariaLabel = `Slide ${index + 1}`;
                carouselIndicators.appendChild(indicator);
                
                // Criar item do carrossel
                const carouselItem = document.createElement('div');
                carouselItem.className = `carousel-item ${index === 0 ? 'active' : ''}`;
                carouselItem.innerHTML = `
                    <img src="${sessao.imagem_principal}" class="d-block w-100 carousel-image" alt="${sessao.titulo}" loading="lazy" onerror="this.src='imgs/estudio/estudioluacris.jpg'">
                    <div class="carousel-caption">
                        <h3>${sessao.titulo}</h3>
                        <p>${sessao.descricao}</p>
                        <a href="detalhes.html?id=${sessao.id}" class="btn">Ver Detalhes</a>
                    </div>
                `;
                carouselInner.appendChild(carouselItem);
            });
        } else {
            carouselInner.innerHTML = '<p class="text-center">Nenhum destaque disponível no momento.</p>';
        }
    } catch (error) {
        console.error('Erro ao carregar destaques:', error);
        mostrarErro('carousel-inner', 'Erro ao carregar sessões em destaque');
    }
}

async function carregarTodasSessoes() {
    try {
        const sessoes = await fetchData(API_URL);
        const container = document.getElementById('todas-sessoes');
        
        if (container) {
            container.innerHTML = '';
            
            if (sessoes.length === 0) {
                container.innerHTML = '<p class="text-center">Nenhum serviço cadastrado.</p>';
                return;
            }
            
            // Criar cards para cada categoria de serviço
            const categoriasServicos = [
                {
                    id: 1,
                    titulo: "Campanhas Publicitárias",
                    categoria: "Campanhas",
                    descricao: "A emoção de cada data, eternizada na foto certa.",
                    imagem_principal: "imgs/campanhas/pascoa1.jpg",
                    conteudo: "Desenvolvemos campanhas publicitárias completas para empresas que desejam fortalecer sua identidade visual. Trabalhamos com modelos profissionais, styling, produção e direção de arte."
                },
                {
                    id: 2,
                    titulo: "Ensaios Gestantes",
                    categoria: "Gestantes",
                    descricao: "Capturando a beleza e magia da maternidade",
                    imagem_principal: "imgs/gestantes/dalila.jpg",
                    conteudo: "Registramos esse momento único com sensibilidade e cuidado. Sessões que celebram a vida e a conexão entre mãe e bebê."
                },
                {
                    id: 3,
                    titulo: "Ensaios Infantis",
                    categoria: "Infantil",
                    descricao: "Guardando a melhor fase das brincadeiras mais lindas",
                    imagem_principal: "imgs/infantil/infantil2.jpg",
                    conteudo: "Ambiente seguro e divertido para capturar a pureza e espontaneidade das crianças. Trabalhamos com temáticas criativas."
                },
                {
                    id: 4,
                    titulo: "Eventos Especiais",
                    categoria: "Eventos",
                    descricao: "Cobertura completa dos seus momentos especiais",
                    imagem_principal: "imgs/eventos/Casamento1.jpg",
                    conteudo: "Casamentos, aniversários, formaturas. Documentamos cada emoção do seu evento com profissionalismo e discrição."
                }
            ];
            
            categoriasServicos.forEach((servico, index) => {
                const card = document.createElement('div');
                card.className = 'service-card reveal';
                card.style.animationDelay = `${index * 0.1}s`;
                card.innerHTML = `
                    <div class="service-image">
                        <img src="${servico.imagem_principal}" alt="${servico.titulo}" loading="lazy" onerror="this.src='imgs/estudio/estudioluacris.jpg'">
                        <div class="click-indicator">Clique para ver detalhes</div>
                    </div>
                    <div class="service-info">
                        <div class="service-category">${servico.categoria}</div>
                        <h3>${servico.titulo}</h3>
                        <p>${servico.descricao}</p>
                        <a href="detalhes.html?servico=${servico.id}" class="btn">Ver Detalhes</a>
                    </div>
                `;
                container.appendChild(card);
            });
        }
    } catch (error) {
        console.error('Erro ao carregar sessões:', error);
        mostrarErro('todas-sessoes', 'Erro ao carregar lista de serviços');
    }
}

// Funções para a página detalhes.html
async function carregarDetalhesSessao() {
    const urlParams = new URLSearchParams(window.location.search);
    const sessaoId = urlParams.get('id');
    const servicoId = urlParams.get('servico');
    
    try {
        let dados;
        
        if (servicoId) {
            // Carregar detalhes de um serviço (categoria)
            dados = await carregarDetalhesServico(servicoId);
        } else if (sessaoId) {
            // Carregar detalhes de uma sessão específica
            dados = await fetchData(`${API_URL}/${sessaoId}`);
        } else {
            throw new Error('ID não especificado');
        }
        
        exibirDetalhes(dados);
    } catch (error) {
        console.error('Erro ao carregar detalhes:', error);
        mostrarErroDetalhes();
    }
}

// Detalhes dos serviços (categorias)
async function carregarDetalhesServico(servicoId) {
    const servicos = {
        '1': {
            titulo: "Campanhas Publicitárias",
            categoria: "Campanhas",
            descricao: "A emoção de cada data, eternizada na foto certa.",
            imagem_principal: "imgs/campanhas/pascoa1.jpg",
            conteudo: `
                <h3>Transforme sua marca com imagens profissionais</h3>
                <p>Nossas campanhas publicitárias são desenvolvidas para elevar a identidade visual da sua empresa. Trabalhamos com:</p>
                <ul>
                    <li><strong>Fotografia de produto</strong> - Destaque os detalhes e qualidade dos seus produtos</li>
                    <li><strong>Campanhas institucionais</strong> - Fortaleça a imagem da sua marca</li>
                    <li><strong>Books profissionais</strong> - Para modelos, atores e influenciadores</li>
                    <li><strong>Conteúdo para redes sociais</strong> - Imagens otimizadas para cada plataforma</li>
                </ul>
                <p>Utilizamos equipamento de última geração e técnicas avançadas de iluminação para garantir resultados excepcionais.</p>
            `,
            duracao: "4-6 horas",
            equipamento: "Câmeras Canon EOS R5/R6, lentes profissionais, iluminação de estúdio",
            preco: "A partir de R$ 800,00",
            inclui: "50 fotos editadas, rights de uso, direção de arte, produção"
        },
        '2': {
            titulo: "Ensaios Gestantes",
            categoria: "Gestantes",
            descricao: "Capturando a beleza e magia da maternidade",
            imagem_principal: "imgs/gestantes/dalila.jpg",
            conteudo: `
                <h3>Eternize esse momento único</h3>
                <p>Nossos ensaios de gestante são realizados com todo cuidado e sensibilidade para registrar essa fase especial. Oferecemos:</p>
                <ul>
                    <li><strong>Ensaios em estúdio</strong> - Controle total de iluminação e ambiente</li>
                    <li><strong>Ensaios externos</strong> - Natureza e cenários urbanos</li>
                    <li><strong>Ensaios em casa</strong> - Ambiente familiar e aconchegante</li>
                    <li><strong>Ensaio com parceiro(a)</strong> - Incluindo pai e/ou irmãos</li>
                </ul>
                <p>Trabalhamos com poses naturais que destacam a conexão entre mãe e bebê, criando memórias que você guardará para sempre.</p>
            `,
            duracao: "2-3 horas",
            equipamento: "Câmeras profissionais, lentes específicas, iluminação suave",
            preco: "A partir de R$ 450,00",
            inclui: "20 fotos editadas, 1 ampliação, álbum digital, 2 looks"
        },
        '3': {
            titulo: "Ensaios Infantis",
            categoria: "Infantil",
            descricao: "Guardando a melhor fase das brincadeiras mais lindas",
            imagem_principal: "imgs/infantil/infantil2.jpg",
            conteudo: `
                <h3>Capture a pureza da infância</h3>
                <p>Especializados em fotografia infantil, criamos ambientes seguros e divertidos onde as crianças podem ser elas mesmas. Oferecemos:</p>
                <ul>
                    <li><strong>Newborn (0-3 meses)</strong> - Sessões suaves e delicadas</li>
                    <li><strong>Baby (3-12 meses)</strong> - Capturando descobertas e sorrisos</li>
                    <li><strong>Infantil (1-5 anos)</strong> - Brincadeiras e personalidade</li>
                    <li><strong>Família</strong> - Incluindo pais e irmãos</li>
                </ul>
                <p>Temos brinquedos, acessórios e cenários temáticos para tornar a experiência ainda mais especial.</p>
            `,
            duracao: "1-2 horas",
            equipamento: "Câmeras rápidas, lentes apropriadas, brinquedos e acessórios",
            preco: "A partir de R$ 300,00",
            inclui: "15 fotos editadas, 1 ampliação, álbum digital, 1 look"
        },
        '4': {
            titulo: "Eventos Especiais",
            categoria: "Eventos",
            descricao: "Cobertura completa dos seus momentos especiais",
            imagem_principal: "imgs/eventos/Casamento1.jpg",
            conteudo: `
                <h3>Documente cada emoção do seu evento</h3>
                <p>Oferecemos cobertura completa para diversos tipos de eventos, capturando momentos espontâneos e emocionantes:</p>
                <ul>
                    <li><strong>Casamentos</strong> - Cobertura completa do grande dia</li>
                    <li><strong>Aniversários</strong> - Festas de 15 anos, adultos e infantis</li>
                    <li><strong>Formaturas</strong> - Cerimônias e festas</li>
                    <li><strong>Eventos corporativos</strong> - Palestras, workshops e confraternizações</li>
                </ul>
                <p>Trabalhamos de forma discreta para não interferir no evento, garantindo fotos naturais e cheias de emoção.</p>
            `,
            duracao: "Personalizado por evento",
            equipamento: "Múltiplas câmeras, lentes variadas, flash profissional",
            preco: "Sob consulta",
            inclui: "Fotos editadas, álbum físico, pen drive, cobertura completa"
        }
    };
    
    return servicos[servicoId] || null;
}

function exibirDetalhes(dados) {
    const container = document.getElementById('detalhes-sessao');
    const fotosContainer = document.getElementById('fotos-sessao');
    const actionButtons = document.getElementById('action-buttons');
    
    if (!dados || !container) {
        mostrarErroDetalhes();
        return;
    }
    
    // Esconder botões de ação para serviços
    if (actionButtons) {
        actionButtons.style.display = 'none';
    }
    
    // Carregar informações principais
    container.innerHTML = `
        <div class="service-detail-header reveal">
            <h1>${dados.titulo}</h1>
            <p class="service-category">${dados.descricao}</p>
        </div>
        <div class="service-detail-content">
            <div class="service-detail-image reveal">
                <img src="${dados.imagem_principal}" alt="${dados.titulo}" loading="lazy" onerror="this.src='imgs/estudio/estudioluacris.jpg'">
            </div>
            <div class="service-detail-info">
                <div class="service-description reveal">
                    ${dados.conteudo}
                </div>
                <div class="service-highlights reveal">
                    <h3>Informações do Serviço</h3>
                    <ul>
                        <li><strong>Duração:</strong> ${dados.duracao}</li>
                        <li><strong>Equipamento:</strong> ${dados.equipamento}</li>
                        <li><strong>Investimento:</strong> ${dados.preco}</li>
                        <li><strong>Inclui:</strong> ${dados.inclui}</li>
                    </ul>
                </div>
            </div>
        </div>
    `;
    
    // Carregar fotos adicionais se disponíveis
    if (fotosContainer) {
        carregarFotosAdicionais(dados.categoria, fotosContainer);
    }
}

async function carregarFotosAdicionais(categoria, container) {
    const fotosPorCategoria = {
        'Campanhas': [
            { imagem: 'imgs/campanhas/S6A6193.jpg', titulo: 'Produção Profissional' },
            { imagem: 'imgs/campanhas/S6A6759.jpg', titulo: 'Direção de Arte' },
            { imagem: 'imgs/campanhas/S6A7845.jpg', titulo: 'Books Comerciais' }
        ],
        'Gestantes': [
            { imagem: 'imgs/gestantes/dalila2.jpg', titulo: 'Close-up Maternal' },
            { imagem: 'imgs/gestantes/G56A5488.jpg', titulo: 'Silhueta Gestante' },
            { imagem: 'imgs/gestantes/G56A5645.jpg', titulo: 'Ensaios Externos' }
        ],
        'Infantil': [
            { imagem: 'imgs/infantil/infantil3.jpg', titulo: 'Brinquedos e Diversão' },
            { imagem: 'imgs/infantil/GS6A5171-2.jpg', titulo: 'Sorrisos Espontâneos' },
            { imagem: 'imgs/infantil/GS6A5477.jpg', titulo: 'Newborn' }
        ],
        'Eventos': [
            { imagem: 'imgs/eventos/Casamento2.jpg', titulo: 'Casamentos' },
            { imagem: 'imgs/eventos/Casamento3.jpg', titulo: 'Cerimônias' },
            { imagem: 'imgs/eventos/G56A0102.jpg', titulo: 'Eventos Familiares' }
        ]
    };
    
    const fotos = fotosPorCategoria[categoria] || [];
    
    if (fotos.length > 0) {
        container.innerHTML = `
            <div class="service-gallery">
                <h2 class="reveal">Galeria do Serviço</h2>
                <div class="gallery-grid">
                    ${fotos.map((foto, index) => `
                        <div class="gallery-item reveal" style="animation-delay: ${index * 0.1}s">
                            <img src="${foto.imagem}" alt="${foto.titulo}" loading="lazy" onerror="this.src='imgs/estudio/estudioluacris.jpg'">
                            <p>${foto.titulo}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    } else {
        container.innerHTML = '';
    }
}

// Função para cadastrar nova sessão
async function cadastrarSessao(dadosSessao) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dadosSessao),
        });
        
        if (!response.ok) throw new Error('Erro ao cadastrar sessão');
        return await response.json();
    } catch (error) {
        console.error('Erro:', error);
        throw error;
    }
}

// Função para atualizar sessão
async function atualizarSessao(id, dadosSessao) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dadosSessao),
        });
        
        if (!response.ok) throw new Error('Erro ao atualizar sessão');
        return await response.json();
    } catch (error) {
        console.error('Erro:', error);
        throw error;
    }
}

// Função para excluir sessão
async function excluirSessao(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
        });
        
        if (!response.ok) throw new Error('Erro ao excluir sessão');
        return true;
    } catch (error) {
        console.error('Erro:', error);
        throw error;
    }
}

// Configurar botões de ação (editar e excluir)
function configurarBotoesAcao(sessaoId) {
    const btnEditar = document.getElementById('btn-editar');
    const btnExcluir = document.getElementById('btn-excluir');
    
    if (btnEditar) {
        btnEditar.addEventListener('click', () => {
            window.location.href = `cadastro_sessoes.html?edit=${sessaoId}`;
        });
    }
    
    if (btnExcluir) {
        btnExcluir.addEventListener('click', async () => {
            if (confirm('Tem certeza que deseja excluir esta sessão? Esta ação não pode ser desfeita.')) {
                try {
                    await excluirSessao(sessaoId);
                    alert('Sessão excluída com sucesso!');
                    window.location.href = 'index.html';
                } catch (error) {
                    alert('Erro ao excluir sessão. Tente novamente.');
                }
            }
        });
    }
}

// Função para carregar dados para edição
async function carregarDadosEdicao() {
    const urlParams = new URLSearchParams(window.location.search);
    const sessaoId = parseInt(urlParams.get('edit'));
    
    if (!sessaoId) return null;
    
    try {
        return await fetchData(`${API_URL}/${sessaoId}`);
    } catch (error) {
        console.error('Erro ao carregar dados para edição:', error);
        return null;
    }
}

// Função para preencher formulário de edição
function preencherFormularioEdicao(sessao) {
    const form = document.getElementById('form-cadastro-sessao');
    if (!form) return;
    
    // Alterar título da página
    const titleElement = document.querySelector('.section-title');
    if (titleElement) {
        titleElement.textContent = 'Editar Sessão';
    }
    
    // Preencher campos
    form.titulo.value = sessao.titulo || '';
    form.categoria.value = sessao.categoria || '';
    form.descricao.value = sessao.descricao || '';
    form.conteudo.value = sessao.conteudo || '';
    form.data.value = sessao.data || '';
    form.local.value = sessao.local || '';
    form.fotografo.value = sessao.fotografo || '';
    form.cliente.value = sessao.cliente || '';
    form.duracao.value = sessao.duracao || '';
    form.equipamento.value = sessao.equipamento || '';
    form.preco.value = sessao.preco || '';
    form.inclui.value = sessao.inclui || '';
    form.imagem_principal.value = sessao.imagem_principal || '';
    form.destaque.checked = sessao.destaque || false;
    
    // Alterar texto do botão
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.textContent = 'Atualizar Sessão';
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

function mostrarErro(containerId, mensagem) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div class="error-message">
                <p>${mensagem}</p>
                <button onclick="location.reload()" class="btn">Tentar Novamente</button>
            </div>
        `;
    }
}

function mostrarErroDetalhes() {
    const container = document.getElementById('detalhes-sessao');
    if (container) {
        container.innerHTML = `
            <div class="error-message">
                <h2>Serviço não encontrado</h2>
                <p>O serviço que você está procurando não existe ou não está disponível no momento.</p>
                <a href="index.html" class="btn">Voltar para a Página Inicial</a>
            </div>
        `;
    }
}

// Sistema de animação scroll reveal
function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    reveals.forEach(reveal => {
        observer.observe(reveal);
    });
}

// Inicialização do carrossel
function inicializarCarrossel() {
    const carousel = document.getElementById('carouselDestaques');
    if (carousel) {
        const bsCarousel = new bootstrap.Carousel(carousel, {
            interval: 5000,
            wrap: true,
            pause: 'hover',
            touch: true
        });
    }
}

// Formulário de contato
function configurarFormularioContato() {
    const form = document.getElementById('form-contato');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            
            submitBtn.textContent = 'Enviando...';
            submitBtn.disabled = true;
            
            // Simular envio
            setTimeout(() => {
                alert('Mensagem enviada com sucesso! Entraremos em contato em breve.');
                form.reset();
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }, 2000);
        });
    }
}

// Smooth scroll para links internos
function configurarScrollSuave() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Header scroll effect
function configurarHeaderScroll() {
    const header = document.querySelector('header');
    if (!header) return;
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
            header.style.backdropFilter = 'blur(10px)';
        } else {
            header.style.background = 'var(--white)';
            header.style.backdropFilter = 'none';
        }
    });
}

// Inicialização completa
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Inicializando aplicação...');
    
    // Inicializar componentes baseados na página
    if (document.getElementById('carousel-inner')) {
        console.log('Carregando página inicial...');
        await carregarDestaques();
        await carregarTodasSessoes();
        inicializarCarrossel();
        configurarFormularioContato();
    }
    
    if (document.getElementById('detalhes-sessao')) {
        console.log('Carregando página de detalhes...');
        await carregarDetalhesSessao();
    }
    
    if (document.getElementById('form-cadastro-sessao')) {
        console.log('Carregando página de cadastro...');
        const sessaoEdicao = await carregarDadosEdicao();
        if (sessaoEdicao) {
            preencherFormularioEdicao(sessaoEdicao);
            
            // Modificar o submit para edição
            document.getElementById('form-cadastro-sessao').addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const urlParams = new URLSearchParams(window.location.search);
                const sessaoId = parseInt(urlParams.get('edit'));
                
                const formData = new FormData(this);
                const dadosSessao = {
                    titulo: formData.get('titulo'),
                    categoria: formData.get('categoria'),
                    descricao: formData.get('descricao'),
                    conteudo: formData.get('conteudo'),
                    data: formData.get('data'),
                    local: formData.get('local'),
                    fotografo: formData.get('fotografo'),
                    cliente: formData.get('cliente'),
                    duracao: formData.get('duracao'),
                    equipamento: formData.get('equipamento'),
                    preco: formData.get('preco'),
                    inclui: formData.get('inclui'),
                    imagem_principal: formData.get('imagem_principal'),
                    destaque: formData.get('destaque') === 'on',
                    fotos: sessaoEdicao.fotos || []
                };
                
                const submitBtn = this.querySelector('button[type="submit"]');
                const originalText = submitBtn.textContent;
                
                try {
                    submitBtn.textContent = 'Atualizando...';
                    submitBtn.disabled = true;
                    
                    await atualizarSessao(sessaoId, dadosSessao);
                    
                    alert('Sessão atualizada com sucesso!');
                    window.location.href = `detalhes.html?id=${sessaoId}`;
                } catch (error) {
                    alert('Erro ao atualizar sessão. Tente novamente.');
                    console.error(error);
                } finally {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                }
            });
        }
    }
    
    // Componentes globais
    initScrollReveal();
    configurarScrollSuave();
    configurarHeaderScroll();
    
    console.log('Aplicação inicializada com sucesso!');
});

// Adicionar função global para cadastrarSessao (usada no cadastro_sessoes.html)
window.cadastrarSessao = cadastrarSessao;