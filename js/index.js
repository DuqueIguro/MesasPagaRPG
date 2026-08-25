let dadosMesasPorCategoria = {};

// Mapeamento dos containers da DOM
const grids = {
  iniciantes: document.getElementById('grid-iniciantes'),
  veteranos: document.getElementById('grid-veteranos'),
  personalizadas: document.getElementById('grid-personalizadas'),
  especiais: document.getElementById('grid-especiais')
};

const sections = {
  iniciantes: document.getElementById('sec-iniciantes'),
  veteranos: document.getElementById('sec-veteranos'),
  personalizadas: document.getElementById('sec-personalizadas'),
  especiais: document.getElementById('sec-especiais')
};

const filterBtns = document.querySelectorAll('.filter-btn');

// Elementos do Modal
const modal = document.getElementById('modal');
const modalClose = document.getElementById('modal-close');
const modalImg = document.getElementById('modal-img');
const modalCategory = document.getElementById('modal-category');
const modalGenre = document.getElementById('modal-genre');
const modalTitle = document.getElementById('modal-title');
const modalSystem = document.getElementById('modal-system');
const modalSchedule = document.getElementById('modal-schedule');
const modalSlots = document.getElementById('modal-slots');
const modalPrice = document.getElementById('modal-price');
const modalDescription = document.getElementById('modal-description');
const modalRequirements = document.getElementById('modal-requirements');
const modalContactBtn = document.getElementById('modal-contact-btn');

// Carregar o arquivo JSON
async function carregarMesas() {
  try {
    const resposta = await fetch('data/mesas.json');
    dadosMesasPorCategoria = await resposta.json();
    renderizarMesas('todos');
  } catch (erro) {
    console.error('Erro ao carregar data/mesas.json:', erro);
  }
}

// Renderiza as mesas percorrendo cada categoria do objeto JSON
function renderizarMesas(generoFiltro) {
  // Limpa o conteúdo de todas as grades antes de renderizar
  Object.keys(grids).forEach(categoria => {
    if (grids[categoria]) grids[categoria].innerHTML = '';
  });

  // Percorre cada categoria do JSON (iniciantes, veteranos, etc.)
  Object.keys(dadosMesasPorCategoria).forEach(categoriaKey => {
    const listaMesas = dadosMesasPorCategoria[categoriaKey] || [];
    const gridContainer = grids[categoriaKey];
    const sectionContainer = sections[categoriaKey];

    if (!gridContainer || !sectionContainer) return;

    let quantidadeExibida = 0;

    listaMesas.forEach(mesa => {
      // Aplica o filtro de gênero se não for 'todos'
      if (generoFiltro === 'todos' || mesa.genero === generoFiltro) {
        const card = criarCardHTML(mesa, categoriaKey);
        gridContainer.appendChild(card);
        quantidadeExibida++;
      }
    });

    // Se não houver mesas visíveis na categoria, esconde a seção inteira
    if (quantidadeExibida === 0) {
      sectionContainer.style.display = 'none';
    } else {
      sectionContainer.style.display = 'block';
    }
  });
}

// Cria a estrutura HTML de cada card
function criarCardHTML(mesa, categoriaNome) {
  const card = document.createElement('div');
  card.classList.add('card');
  card.innerHTML = `
    <img src="${mesa.imagem}" alt="${mesa.titulo}" class="card-img">
    <div class="card-content">
      <div class="badges-row">
        <span class="badge badge-category">${categoriaNome}</span>
        <span class="badge badge-genre">${mesa.genero}</span>
      </div>
      <h3 class="card-title">${mesa.titulo}</h3>
      <div class="card-details">
        <p>📜 <strong>Sistema:</strong> ${mesa.sistema}</p>
        <p>⏳ <strong>Duração:</strong> ${mesa.duracao || 'N/A'}</p>
        <p>⏰ <strong>Horário:</strong> ${mesa.horario}</p>
      </div>
      <div class="card-footer">
        <span>👥 Vagas: ${mesa.vagas}</span>
        <span class="price">${mesa.preco}</span>
      </div>
    </div>
  `;

  card.addEventListener('click', () => abrirModal(mesa, categoriaNome));
  return card;
}

// Abrir e preencher o modal
function abrirModal(mesa, categoriaNome) {
  modalImg.src = mesa.imagem;
  modalImg.alt = mesa.titulo;
  modalCategory.textContent = categoriaNome;
  modalGenre.textContent = mesa.genero;
  modalTitle.textContent = mesa.titulo;
  modalSystem.textContent = `${mesa.sistema} (${mesa.duracao || 'Duração variável'})`;
  modalSchedule.textContent = mesa.horario;
  modalSlots.textContent = mesa.vagas;
  modalPrice.textContent = mesa.preco;
  modalDescription.textContent = mesa.descricao;
  modalRequirements.textContent = mesa.requisitos;

  const meuNumeroWhats = "5511999999999"; 
  const mensagem = encodeURIComponent(`Olá! Gostaria de tirar dúvidas / garantir minha vaga na mesa: "${mesa.titulo}".`);
  modalContactBtn.href = `https://wa.me/${meuNumeroWhats}?text=${mensagem}`;

  modal.classList.remove('hidden');
}

// Controles do Modal
function fecharModal() {
  modal.classList.add('hidden');
}

modalClose.addEventListener('click', fecharModal);
modal.addEventListener('click', (e) => { if (e.target === modal) fecharModal(); });
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !modal.classList.contains('hidden')) fecharModal();
});

// Eventos dos botões de filtro por Gênero
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const generoSelecionado = btn.getAttribute('data-genre');
    renderizarMesas(generoSelecionado);
  });
});

// Inicialização
carregarMesas();