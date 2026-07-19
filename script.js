let todasAsMesas = [];

// Grids de cada categoria
const grids = {
  iniciantes: document.getElementById('grid-iniciantes'),
  veteranos: document.getElementById('grid-veteranos'),
  personalizadas: document.getElementById('grid-personalizadas'),
  especiais: document.getElementById('grid-especiais')
};

// Seções inteiras
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

// Carregar JSON
async function carregarMesas() {
  try {
    const resposta = await fetch('mesas.json');
    todasAsMesas = await resposta.json();
    renderizarPorCategorias(todasAsMesas);
  } catch (erro) {
    console.error('Erro ao carregar mesas.json:', erro);
  }
}

// Renderizar mesas organizadas por Categoria
function renderizarPorCategorias(mesas) {
  // Limpa todos os grids
  Object.values(grids).forEach(grid => grid.innerHTML = '');

  // Contadores para controlar a exibição das seções
  const contagem = { iniciantes: 0, veteranos: 0, personalizadas: 0, especiais: 0 };

  mesas.forEach(mesa => {
    const card = criarCardHTML(mesa);
    if (grids[mesa.categoria]) {
      grids[mesa.categoria].appendChild(card);
      contagem[mesa.categoria]++;
    }
  });

  // Esconde seções vazias caso um filtro esteja ativo
  Object.keys(sections).forEach(cat => {
    if (contagem[cat] === 0) {
      sections[cat].style.display = 'none';
    } else {
      sections[cat].style.display = 'block';
    }
  });
}

// Criar o elemento do Card
function criarCardHTML(mesa) {
  const card = document.createElement('div');
  card.classList.add('card');
  card.innerHTML = `
    <img src="${mesa.imagem}" alt="${mesa.titulo}" class="card-img">
    <div class="card-content">
      <div class="badges-row">
        <span class="badge badge-category">${mesa.categoria}</span>
        <span class="badge badge-genre">${mesa.genero}</span>
      </div>
      <h3 class="card-title">${mesa.titulo}</h3>
      <div class="card-details">
        <p>📜 <strong>Sistema:</strong> ${mesa.sistema}</p>
        <p>⏰ <strong>Horário:</strong> ${mesa.horario}</p>
      </div>
      <div class="card-footer">
        <span>👥 Vagas: ${mesa.vagas}</span>
        <span class="price">${mesa.preco}</span>
      </div>
    </div>
  `;

  card.addEventListener('click', () => abrirModal(mesa));
  return card;
}

// Abrir Modal
function abrirModal(mesa) {
  modalImg.src = mesa.imagem;
  modalImg.alt = mesa.titulo;
  modalCategory.textContent = mesa.categoria;
  modalGenre.textContent = mesa.genero;
  modalTitle.textContent = mesa.titulo;
  modalSystem.textContent = mesa.sistema;
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

// Fechar Modal
function fecharModal() {
  modal.classList.add('hidden');
}

modalClose.addEventListener('click', fecharModal);
modal.addEventListener('click', (e) => { if (e.target === modal) fecharModal(); });
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !modal.classList.contains('hidden')) fecharModal();
});

// Filtro por Gênero
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const generoSelecionado = btn.getAttribute('data-genre');

    if (generoSelecionado === 'todos') {
      renderizarPorCategorias(todasAsMesas);
    } else {
      const mesasFiltradas = todasAsMesas.filter(m => m.genero === generoSelecionado);
      renderizarPorCategorias(mesasFiltradas);
    }
  });
});

// Inicializar
carregarMesas();