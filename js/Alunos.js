/* ==================================================
   ARMAZENAMENTO (localStorage)
================================================== */

const CHAVE_ALUNOS = "alunos";
const CHAVE_EMPRESTIMOS = "emprestimos";

// Retorna a lista de alunos salva no navegador
function obterAlunos(){
    const dados = localStorage.getItem(CHAVE_ALUNOS);
    return dados ? JSON.parse(dados) : [];
}

// Salva a lista de alunos no navegador
function salvarAlunos(alunos){
    localStorage.setItem(CHAVE_ALUNOS, JSON.stringify(alunos));
}

// Retorna a lista de empréstimos salva no navegador
function obterEmprestimos(){
    const dados = localStorage.getItem(CHAVE_EMPRESTIMOS);
    return dados ? JSON.parse(dados) : [];
}

// Verifica se o aluno possui algum empréstimo ainda não devolvido
function alunoTemEmprestimoAtivo(alunoId){
    const emprestimos = obterEmprestimos();
    return emprestimos.some(e => e.alunoId === alunoId && e.status !== "devolvido");
}

/* ==================================================
   CONTROLE DE EDIÇÃO
================================================== */

// Guarda o id do aluno que está sendo editado (null = cadastro novo)
let alunoEditandoId = null;

/* ==================================================
   CADASTRAR / SALVAR EDIÇÃO
================================================== */

function cadastrarAluno(){

    const nome  = document.getElementById("nomeAluno").value.trim();
    const cpf   = document.getElementById("cpfAluno").value.trim();
    const turma = document.getElementById("turmaAluno").value.trim();
    const idade = document.getElementById("idadeAluno").value.trim();

    if(!nome || !cpf || !turma || !idade){
        alert("Preencha todos os campos antes de cadastrar.");
        return;
    }

    const alunos = obterAlunos();

    if(alunoEditandoId !== null){

        // Atualiza o aluno que estava sendo editado
        const aluno = alunos.find(a => a.id === alunoEditandoId);

        aluno.nome  = nome;
        aluno.cpf   = cpf;
        aluno.turma = turma;
        aluno.idade = idade;

        alunoEditandoId = null;
        document.getElementById("btnCadastrar").textContent = "Cadastrar";

    }else{

        // Cria um novo aluno
        alunos.push({
            id: Date.now(),
            nome,
            cpf,
            turma,
            idade
        });
    }

    salvarAlunos(alunos);

    limparFormulario();
    atualizarFiltroTurmas();
    renderizarAlunos();
}

// Limpa os campos do formulário de cadastro
function limparFormulario(){
    document.getElementById("nomeAluno").value = "";
    document.getElementById("cpfAluno").value = "";
    document.getElementById("turmaAluno").value = "";
    document.getElementById("idadeAluno").value = "";
}

/* ==================================================
   EDITAR ALUNO
================================================== */

function editarAluno(id){

    const alunos = obterAlunos();
    const aluno = alunos.find(a => a.id === id);

    if(!aluno) return;

    document.getElementById("nomeAluno").value = aluno.nome;
    document.getElementById("cpfAluno").value = aluno.cpf;
    document.getElementById("turmaAluno").value = aluno.turma;
    document.getElementById("idadeAluno").value = aluno.idade;

    alunoEditandoId = id;
    document.getElementById("btnCadastrar").textContent = "Salvar Alterações";

    // Leva o usuário até o formulário para fazer a edição
    document.getElementById("nomeAluno").scrollIntoView({ behavior:"smooth" });
}

/* ==================================================
   EXCLUIR ALUNO
================================================== */

function excluirAluno(id){

    if(alunoTemEmprestimoAtivo(id)){
        alert("Este aluno não pode ser excluído porque possui um empréstimo em andamento. Registre a devolução antes de excluir.");
        return;
    }

    if(!confirm("Tem certeza que deseja excluir este aluno?")) return;

    let alunos = obterAlunos();
    alunos = alunos.filter(a => a.id !== id);

    salvarAlunos(alunos);

    atualizarFiltroTurmas();
    renderizarAlunos();
}

/* ==================================================
   FILTRO DE TURMAS (preenche o select dinamicamente)
================================================== */

function atualizarFiltroTurmas(){

    const alunos = obterAlunos();
    const select = document.getElementById("filtroTurma");

    const turmaSelecionada = select.value;

    // Lista de turmas únicas, em ordem alfabética
    const turmas = [...new Set(alunos.map(a => a.turma))].sort();

    select.innerHTML = '<option value="">Todas as turmas</option>';

    turmas.forEach(turma => {
        const option = document.createElement("option");
        option.value = turma;
        option.textContent = turma;
        select.appendChild(option);
    });

    // Mantém a turma selecionada, se ainda existir
    select.value = turmaSelecionada;
}

/* ==================================================
   RENDERIZAR LISTA (com busca e filtro aplicados)
================================================== */

function renderizarAlunos(){

    const lista = document.getElementById("listaAlunos");

    const busca = document.getElementById("buscaAluno").value.toLowerCase().trim();
    const filtroTurma = document.getElementById("filtroTurma").value;

    let alunos = obterAlunos();

    // Busca por nome ou CPF
    if(busca){
        alunos = alunos.filter(a =>
            a.nome.toLowerCase().includes(busca) ||
            a.cpf.toLowerCase().includes(busca)
        );
    }

    // Filtro por turma
    if(filtroTurma){
        alunos = alunos.filter(a => a.turma === filtroTurma);
    }

    lista.innerHTML = "";

    if(alunos.length === 0){
        lista.innerHTML = "<p>Nenhum aluno encontrado.</p>";
        return;
    }

    alunos.forEach(aluno => {

        const li = document.createElement("li");

        li.innerHTML = `
            <span>
                <strong>Nome:</strong> ${aluno.nome}<br>
                <strong>CPF:</strong> ${aluno.cpf}<br>
                <strong>Turma:</strong> <span class="turma">${aluno.turma}</span><br>
                <strong>Idade:</strong> ${aluno.idade}
            </span>
            <div class="botoes-acoes">
                <button class="btn-editar" onclick="editarAluno(${aluno.id})">Editar</button>
                <button class="btn-excluir" onclick="excluirAluno(${aluno.id})">Excluir</button>
            </div>
        `;

        lista.appendChild(li);
    });
}

/* ==================================================
   INICIALIZAÇÃO
================================================== */

document.addEventListener("DOMContentLoaded", () => {

    atualizarFiltroTurmas();
    renderizarAlunos();

    // Atualiza a lista em tempo real conforme o usuário digita ou filtra
    document.getElementById("buscaAluno").addEventListener("input", renderizarAlunos);
    document.getElementById("filtroTurma").addEventListener("change", renderizarAlunos);
});