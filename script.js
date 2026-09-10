// ---------- estado & persistência ----------

const STORAGE_KEY = "planner-estudos:disciplinas";

function carregarDisciplinas() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Erro ao carregar disciplinas:", e);
    return [];
  }
}

function salvarDisciplinas(disciplinas) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(disciplinas));
}

let disciplinas = carregarDisciplinas();

function gerarId() {
  return "d" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ---------- elementos principais ----------

const grid = document.getElementById("disciplinas-grid");
const emptyState = document.getElementById("empty-state");
const cardTemplate = document.getElementById("disciplina-card-template");
const topicTemplate = document.getElementById("topic-item-template");

const toggleFormBtn = document.getElementById("toggle-form");
const disciplinaForm = document.getElementById("disciplina-form");
const cancelFormBtn = document.getElementById("cancel-form");

// ---------- formulário de nova disciplina ----------

toggleFormBtn.addEventListener("click", () => {
  const isHidden = disciplinaForm.hasAttribute("hidden");
  if (isHidden) {
    disciplinaForm.removeAttribute("hidden");
    toggleFormBtn.setAttribute("aria-expanded", "true");
    document.getElementById("nome-disciplina").focus();
  } else {
    disciplinaForm.setAttribute("hidden", "");
    toggleFormBtn.setAttribute("aria-expanded", "false");
  }
});

cancelFormBtn.addEventListener("click", () => {
  disciplinaForm.reset();
  disciplinaForm.setAttribute("hidden", "");
  toggleFormBtn.setAttribute("aria-expanded", "false");
});

disciplinaForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const nome = document.getElementById("nome-disciplina").value.trim();
  const dataProva = document.getElementById("data-prova").value;
  if (!nome || !dataProva) return;

  disciplinas.push({
    id: gerarId(),
    nome,
    dataProva,
    topicos: [],
  });

  salvarDisciplinas(disciplinas);
  disciplinaForm.reset();
  disciplinaForm.setAttribute("hidden", "");
  toggleFormBtn.setAttribute("aria-expanded", "false");
  render();
});

// ---------- helpers de data e progresso ----------

function formatarContagem(dataProvaStr) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const dataProva = new Date(dataProvaStr + "T00:00:00");
  const diffMs = dataProva - hoje;
  const dias = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (dias > 1) return { texto: `faltam ${dias} dias`, urgente: dias <= 3, passado: false };
  if (dias === 1) return { texto: "é amanhã!", urgente: true, passado: false };
  if (dias === 0) return { texto: "é hoje!", urgente: true, passado: false };
  return { texto: "prova já passou", urgente: false, passado: true };
}

function calcularProgresso(topicos) {
  if (topicos.length === 0) return 0;
  const concluidos = topicos.filter((t) => t.concluido).length;
  return Math.round((concluidos / topicos.length) * 100);
}

// ---------- renderização ----------

function render() {
  grid.innerHTML = "";

  if (disciplinas.length === 0) {
    emptyState.removeAttribute("hidden");
    return;
  }
  emptyState.setAttribute("hidden", "");

  const ordenadas = [...disciplinas].sort(
    (a, b) => new Date(a.dataProva) - new Date(b.dataProva)
  );

  ordenadas.forEach((disciplina) => {
    grid.appendChild(criarCard(disciplina));
  });
}

function criarCard(disciplina) {
  const node = cardTemplate.content.cloneNode(true);
  const card = node.querySelector(".card");
  card.dataset.id = disciplina.id;

  card.querySelector(".card__title").textContent = disciplina.nome;

  const contagem = formatarContagem(disciplina.dataProva);
  const countdownEl = card.querySelector(".card__countdown");
  countdownEl.textContent = contagem.texto;
  if (contagem.urgente) countdownEl.dataset.urgent = "true";
  if (contagem.passado) countdownEl.dataset.past = "true";

  const progresso = calcularProgresso(disciplina.topicos);
  card.querySelector(".progress-fill").style.width = progresso + "%";
  card.querySelector(".card__progress-label").textContent =
    disciplina.topicos.length === 0
      ? "nenhum tópico cadastrado ainda"
      : `${progresso}% concluído · ${disciplina.topicos.filter((t) => t.concluido).length}/${disciplina.topicos.length} tópicos`;

  card.querySelector(".topics-count").textContent =
    disciplina.topicos.length === 1
      ? "1 tópico"
      : `${disciplina.topicos.length} tópicos`;

  const lista = card.querySelector(".topics-list");
  disciplina.topicos.forEach((topico) => {
    lista.appendChild(criarTopico(disciplina.id, topico));
  });

  // excluir disciplina
  card.querySelector(".card__delete").addEventListener("click", (e) => {
    e.stopPropagation();
    disciplinas = disciplinas.filter((d) => d.id !== disciplina.id);
    salvarDisciplinas(disciplinas);
    render();
  });

  // expandir/recolher
  const body = card.querySelector(".card__body");
  card.querySelector(".card__expand-toggle").addEventListener("click", () => {
    const abrir = body.hasAttribute("hidden");
    if (abrir) {
      body.removeAttribute("hidden");
      card.classList.add("is-open");
    } else {
      body.setAttribute("hidden", "");
      card.classList.remove("is-open");
    }
  });

  // adicionar tópico
  const topicForm = card.querySelector(".topic-form");
  topicForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const input = topicForm.querySelector(".topic-input");
    const select = topicForm.querySelector(".topic-tecnica");
    const nome = input.value.trim();
    if (!nome) return;

    const alvo = disciplinas.find((d) => d.id === disciplina.id);
    alvo.topicos.push({
      id: gerarId(),
      nome,
      concluido: false,
      tecnica: select.value || null,
    });
    salvarDisciplinas(disciplinas);
    input.value = "";
    select.value = "";
    render();
    // reabre o card e a seção depois de re-renderizar
    const novoCard = grid.querySelector(`.card[data-id="${disciplina.id}"]`);
    if (novoCard) {
      novoCard.classList.add("is-open");
      novoCard.querySelector(".card__body").removeAttribute("hidden");
    }
  });

  return node;
}

function criarTopico(disciplinaId, topico) {
  const node = topicTemplate.content.cloneNode(true);
  const item = node.querySelector(".topic-item");
  item.dataset.id = topico.id;
  if (topico.concluido) item.classList.add("is-done");

  const checkbox = item.querySelector('input[type="checkbox"]');
  checkbox.checked = topico.concluido;
  item.querySelector(".topic-item__name").textContent = topico.nome;
  item.querySelector(".topic-item__tecnica").textContent = topico.tecnica || "";

  checkbox.addEventListener("change", () => {
    const disciplina = disciplinas.find((d) => d.id === disciplinaId);
    const alvo = disciplina.topicos.find((t) => t.id === topico.id);
    alvo.concluido = checkbox.checked;
    salvarDisciplinas(disciplinas);
    render();
    const novoCard = grid.querySelector(`.card[data-id="${disciplinaId}"]`);
    if (novoCard) {
      novoCard.classList.add("is-open");
      novoCard.querySelector(".card__body").removeAttribute("hidden");
    }
  });

  item.querySelector(".topic-item__remove").addEventListener("click", () => {
    const disciplina = disciplinas.find((d) => d.id === disciplinaId);
    disciplina.topicos = disciplina.topicos.filter((t) => t.id !== topico.id);
    salvarDisciplinas(disciplinas);
    render();
    const novoCard = grid.querySelector(`.card[data-id="${disciplinaId}"]`);
    if (novoCard) {
      novoCard.classList.add("is-open");
      novoCard.querySelector(".card__body").removeAttribute("hidden");
    }
  });

  return node;
}

render();
