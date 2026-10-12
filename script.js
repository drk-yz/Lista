// Dados da aplicação: cada tarefa tem um id, um texto e um estado.
const CHAVE_STORAGE = "meus-afazeres";
let afazeres = carregarAfazeres();
let filtroAtual = "todas";

// Elementos do HTML que o JavaScript vai controlar.
const formulario = document.querySelector("#form-afazer");
const campoAfazer = document.querySelector("#campo-afazer");
const listaAfazeres = document.querySelector("#lista-afazeres");
const contador = document.querySelector("#contador");
const mensagemVazia = document.querySelector("#mensagem-vazia");
const resumoPendentes = document.querySelector("#resumo-pendentes");
const limparConcluidas = document.querySelector("#limpar-concluidas");
const botoesFiltro = document.querySelectorAll("[data-filtro]");

// Lê as tarefas guardadas. Se não houver dados válidos, começa com uma lista vazia.
function carregarAfazeres() {
  try {
    const dadosSalvos = localStorage.getItem(CHAVE_STORAGE);
    const dados = dadosSalvos ? JSON.parse(dadosSalvos) : [];
    return Array.isArray(dados) ? dados : [];
  } catch (erro) {
    console.warn("Não foi possível carregar os afazeres:", erro);
    return [];
  }
}

// Salva a lista inteira no navegador.
function salvarAfazeres() {
  try {
    localStorage.setItem(CHAVE_STORAGE, JSON.stringify(afazeres));
  } catch (erro) {
    console.warn("Não foi possível salvar os afazeres:", erro);
  }
}

// Retorna as tarefas que correspondem ao filtro selecionado.
function obterAfazeresVisiveis() {
  if (filtroAtual === "pendentes") {
    return afazeres.filter((afazer) => !afazer.concluido);
  }

  if (filtroAtual === "concluidas") {
    return afazeres.filter((afazer) => afazer.concluido);
  }

  return afazeres;
}

// Desenha a interface com base nos dados atuais.
function renderizarAfazeres() {
  listaAfazeres.replaceChildren();

  const visiveis = obterAfazeresVisiveis();

  visiveis.forEach((afazer) => {
    const item = document.createElement("li");
    item.className = "item-afazer";
    if (afazer.concluido) item.classList.add("concluido");

    const caixa = document.createElement("input");
    caixa.type = "checkbox";
    caixa.className = "caixa-concluir";
    caixa.checked = afazer.concluido;
    caixa.setAttribute("aria-label", `Marcar "${afazer.texto}" como concluída`);
    caixa.addEventListener("change", () => alternarConclusao(afazer.id));

    const texto = document.createElement("span");
    texto.className = "texto-afazer";
    // textContent trata o texto digitado como texto, não como HTML.
    texto.textContent = afazer.texto;

    const remover = document.createElement("button");
    remover.type = "button";
    remover.className = "botao-remover";
    remover.textContent = "×";
    remover.setAttribute("aria-label", `Remover "${afazer.texto}"`);
    remover.addEventListener("click", () => removerAfazer(afazer.id));

    item.append(caixa, texto, remover);
    listaAfazeres.append(item);
  });

  const pendentes = afazeres.filter((afazer) => !afazer.concluido).length;
  const concluidas = afazeres.length - pendentes;

  contador.textContent = `${afazeres.length} ${afazeres.length === 1 ? "tarefa" : "tarefas"}`;
  mensagemVazia.hidden = visiveis.length > 0;

  if (afazeres.length === 0) {
    resumoPendentes.textContent = "Você está começando. Vamos nessa!";
  } else if (pendentes === 0) {
    resumoPendentes.textContent = "Tudo concluído. Mandou bem! ✨";
  } else {
    resumoPendentes.textContent = `${pendentes} ${pendentes === 1 ? "tarefa pendente" : "tarefas pendentes"}`;
  }

  limparConcluidas.hidden = concluidas === 0;
}

// Adiciona uma tarefa nova à lista.
function adicionarAfazer(texto) {
  const textoLimpo = texto.trim();
  if (!textoLimpo) return;

  afazeres.unshift({
    id: criarId(),
    texto: textoLimpo,
    concluido: false
  });

  salvarAfazeres();
  renderizarAfazeres();
}

// Gera um identificador simples e único para cada tarefa.
function criarId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function alternarConclusao(id) {
  afazeres = afazeres.map((afazer) =>
    afazer.id === id
      ? { ...afazer, concluido: !afazer.concluido }
      : afazer
  );

  salvarAfazeres();
  renderizarAfazeres();
}

function removerAfazer(id) {
  afazeres = afazeres.filter((afazer) => afazer.id !== id);
  salvarAfazeres();
  renderizarAfazeres();
}

// Impede o formulário de recarregar a página ao adicionar uma tarefa.
formulario.addEventListener("submit", (evento) => {
  evento.preventDefault();
  adicionarAfazer(campoAfazer.value);
  campoAfazer.value = "";
  campoAfazer.focus();
});

// Troca entre todas, pendentes e concluídas.
botoesFiltro.forEach((botao) => {
  botao.addEventListener("click", () => {
    filtroAtual = botao.dataset.filtro;

    botoesFiltro.forEach((outroBotao) => {
      const selecionado = outroBotao === botao;
      outroBotao.classList.toggle("ativo", selecionado);
      outroBotao.setAttribute("aria-pressed", String(selecionado));
    });

    renderizarAfazeres();
  });
});

// Remove todas as tarefas já concluídas.
limparConcluidas.addEventListener("click", () => {
  afazeres = afazeres.filter((afazer) => !afazer.concluido);
  salvarAfazeres();
  renderizarAfazeres();
});

// Primeira renderização ao abrir a página.
renderizarAfazeres();
