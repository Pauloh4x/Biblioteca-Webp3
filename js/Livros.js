/* ==================================================
   ARMAZENAMENTO (localStorage)
================================================== */

const CHAVE_LIVROS = "livros";
const CHAVE_EMPRESTIMOS = "emprestimos";

// Retorna a lista de livros salva no navegador
function obterLivros(){
    const dados = localStorage.getItem(CHAVE_LIVROS);
    const livros = dados ? JSON.parse(dados) : [];

    return livros;
}

// Salva a lista de livros no navegador
function salvarLivros(livros){
    localStorage.setItem(CHAVE_LIVROS, JSON.stringify(livros));
}

// Retorna a lista de empréstimos salva no navegador
function obterEmprestimos(){
    const dados = localStorage.getItem(CHAVE_EMPRESTIMOS);
    return dados ? JSON.parse(dados) : [];
}

// Verifica se o livro possui algum empréstimo ainda não devolvido
function livroTemEmprestimoAtivo(livroId){
    const emprestimos = obterEmprestimos();
    return emprestimos.some(e => e.livroId === livroId && e.status !== "devolvido");
}

/* ==================================================
   CONTROLE DE EDIÇÃO
================================================== */

// Guarda o id do livro que está sendo editado (null = cadastro novo)
let livroEditandoId = null;

/* ==================================================
   CADASTRAR / SALVAR EDIÇÃO
================================================== */

function cadastrarLivro(){

    const titulo    = document.getElementById("titulo").value.trim();
    const autor     = document.getElementById("autor").value.trim();
    const categoria = document.getElementById("categoria").value.trim();
    const ano       = document.getElementById("ano").value.trim();

    if(!titulo || !autor || !categoria || !ano){
        alert("Preencha todos os campos antes de cadastrar.");
        return;
    }

    const livros = obterLivros();

    if(livroEditandoId !== null){

        // Atualiza o livro que estava sendo editado
        const livro = livros.find(l => l.id === livroEditandoId);

        livro.titulo    = titulo;
        livro.autor     = autor;
        livro.categoria = categoria;
        livro.ano       = ano;

        livroEditandoId = null;
        document.getElementById("btnCadastrar").textContent = "Cadastrar Livro";

    }else{

        // Cria um novo livro, disponível por padrão
        livros.push({
            id: Date.now(),
            titulo,
            autor,
            categoria,
            ano,
            status: "disponivel"
        });
    }

    salvarLivros(livros);

    limparFormulario();
    atualizarFiltroCategorias();
    renderizarLivros();
}

// Limpa os campos do formulário de cadastro
function limparFormulario(){
    document.getElementById("titulo").value = "";
    document.getElementById("autor").value = "";
    document.getElementById("categoria").value = "";
    document.getElementById("ano").value = "";
}

/* ==================================================
   EDITAR LIVRO
================================================== */

function editarLivro(id){

    const livros = obterLivros();
    const livro = livros.find(l => l.id === id);

    if(!livro) return;

    document.getElementById("titulo").value = livro.titulo;
    document.getElementById("autor").value = livro.autor;
    document.getElementById("categoria").value = livro.categoria;
    document.getElementById("ano").value = livro.ano;

    livroEditandoId = id;
    document.getElementById("btnCadastrar").textContent = "Salvar Alterações";

    // Leva o usuário até o formulário para fazer a edição
    document.getElementById("titulo").scrollIntoView({ behavior:"smooth" });
}

/* ==================================================
   EXCLUIR LIVRO
================================================== */

function excluirLivro(id){

    if(livroTemEmprestimoAtivo(id)){
        alert("Este livro não pode ser excluído porque está emprestado atualmente. Registre a devolução antes de excluir.");
        return;
    }

    if(!confirm("Tem certeza que deseja excluir este livro?")) return;

    let livros = obterLivros();
    livros = livros.filter(l => l.id !== id);

    salvarLivros(livros);

    atualizarFiltroCategorias();
    renderizarLivros();
}

/* ==================================================
   ALTERAR STATUS (disponível / emprestado)
================================================== */

function alterarStatus(id, novoStatus){

    const livros = obterLivros();
    const livro = livros.find(l => l.id === id);

    if(!livro) return;

    livro.status = novoStatus;

    salvarLivros(livros);
    renderizarLivros();
}

/* ==================================================
   FILTRO DE CATEGORIAS (preenche o select dinamicamente)
================================================== */

function atualizarFiltroCategorias(){

    const livros = obterLivros();
    const select = document.getElementById("filtroCategoria");

    const categoriaSelecionada = select.value;

    // Lista de categorias únicas, em ordem alfabética
    const categorias = [...new Set(livros.map(l => l.categoria))].sort();

    select.innerHTML = '<option value="">Todas as categorias</option>';

    categorias.forEach(categoria => {
        const option = document.createElement("option");
        option.value = categoria;
        option.textContent = categoria;
        select.appendChild(option);
    });

    // Mantém a categoria selecionada, se ainda existir
    select.value = categoriaSelecionada;
}

/* ==================================================
   RENDERIZAR LISTA (com busca e filtros aplicados)
================================================== */

function renderizarLivros(){

    const lista = document.getElementById("listaLivros");

    const busca = document.getElementById("buscaTitulo").value.toLowerCase().trim();
    const filtroCategoria = document.getElementById("filtroCategoria").value;
    const filtroStatus = document.getElementById("filtroStatus").value;

    let livros = obterLivros();

    // Busca por título
    if(busca){
        livros = livros.filter(l => l.titulo.toLowerCase().includes(busca));
    }

    // Filtro por categoria
    if(filtroCategoria){
        livros = livros.filter(l => l.categoria === filtroCategoria);
    }

    // Filtro por status
    if(filtroStatus){
        livros = livros.filter(l => l.status === filtroStatus);
    }

    lista.innerHTML = "";

    if(livros.length === 0){
        lista.innerHTML = "<p>Nenhum livro encontrado.</p>";
        return;
    }

    livros.forEach(livro => {

        const li = document.createElement("li");

        li.innerHTML = `
            <span>
                <strong>Título:</strong> ${livro.titulo}<br>
                <strong>Autor:</strong> ${livro.autor}<br>
                <strong>Categoria:</strong> <span class="categoria">${livro.categoria}</span><br>
                <strong>Ano:</strong> ${livro.ano}
            </span>
            <div class="botoes-acoes">
                <select class="status-select status-${livro.status}" onchange="alterarStatus(${livro.id}, this.value)">
                    <option value="disponivel" ${livro.status === "disponivel" ? "selected" : ""}>Disponível</option>
                    <option value="emprestado" ${livro.status === "emprestado" ? "selected" : ""}>Emprestado</option>
                </select>
                <button class="btn-editar" onclick="editarLivro(${livro.id})">Editar</button>
                <button class="btn-excluir" onclick="excluirLivro(${livro.id})">Excluir</button>
            </div>
        `;

        lista.appendChild(li);
    });
}

/* ==================================================
   INICIALIZAÇÃO
================================================== */

document.addEventListener("DOMContentLoaded", () => {

    atualizarFiltroCategorias();
    renderizarLivros();

    // Atualiza a lista em tempo real conforme o usuário digita ou filtra
    document.getElementById("buscaTitulo").addEventListener("input", renderizarLivros);
    document.getElementById("filtroCategoria").addEventListener("change", renderizarLivros);
    document.getElementById("filtroStatus").addEventListener("change", renderizarLivros);
});