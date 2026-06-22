/* ==================================================
   ARMAZENAMENTO (localStorage)
================================================== */

const CHAVE_ALUNOS = "alunos";
const CHAVE_LIVROS = "livros";
const CHAVE_EMPRESTIMOS = "emprestimos";

const LIMITE_DIAS = 15;

function obterAlunos(){
    const dados = localStorage.getItem(CHAVE_ALUNOS);
    return dados ? JSON.parse(dados) : [];
}

function obterLivros(){
    const dados = localStorage.getItem(CHAVE_LIVROS);
    return dados ? JSON.parse(dados) : [];
}

function salvarLivros(livros){
    localStorage.setItem(CHAVE_LIVROS, JSON.stringify(livros));
}

function obterEmprestimos(){
    const dados = localStorage.getItem(CHAVE_EMPRESTIMOS);
    return dados ? JSON.parse(dados) : [];
}

function salvarEmprestimos(emprestimos){
    localStorage.setItem(CHAVE_EMPRESTIMOS, JSON.stringify(emprestimos));
}

/* ==================================================
   PREENCHER SELECTS (alunos e livros disponíveis)
================================================== */

function preencherSelectAlunos(){

    const select = document.getElementById("alunoSelect");
    const alunos = obterAlunos();

    select.innerHTML = '<option value="">Selecione um aluno</option>';

    alunos.forEach(aluno => {
        const option = document.createElement("option");
        option.value = aluno.id;
        option.textContent = `${aluno.nome} (${aluno.turma})`;
        select.appendChild(option);
    });
}

function preencherSelectLivros(){

    const select = document.getElementById("livroSelect");
    const livros = obterLivros();

    select.innerHTML = '<option value="">Selecione um livro</option>';

    // Só livros disponíveis podem ser emprestados
    livros
        .filter(livro => livro.status === "disponivel")
        .forEach(livro => {
            const option = document.createElement("option");
            option.value = livro.id;
            option.textContent = `${livro.titulo} — ${livro.autor}`;
            select.appendChild(option);
        });
}

/* ==================================================
   DATA: limitar o calendário de devolução a 15 dias
================================================== */

function calcularDataMaxima(dataInicioStr){

    const data = new Date(dataInicioStr + "T00:00:00");
    data.setDate(data.getDate() + LIMITE_DIAS);

    return data.toISOString().split("T")[0];
}

function atualizarLimiteDataFim(){

    const dataInicio = document.getElementById("dataInicio").value;
    const campoFim = document.getElementById("dataFim");

    if(dataInicio){

        // O calendário de devolução não permite escolher antes do início
        // nem mais de 15 dias depois dele
        campoFim.min = dataInicio;
        campoFim.max = calcularDataMaxima(dataInicio);

        // Se já havia uma data de devolução escolhida fora do novo intervalo, limpa
        if(campoFim.value && (campoFim.value < campoFim.min || campoFim.value > campoFim.max)){
            campoFim.value = "";
        }

    }else{
        campoFim.removeAttribute("min");
        campoFim.removeAttribute("max");
    }
}

/* ==================================================
   REGISTRAR EMPRÉSTIMO
================================================== */

function registrarEmprestimo(){

    const alunoId = document.getElementById("alunoSelect").value;
    const livroId = document.getElementById("livroSelect").value;
    const dataInicio = document.getElementById("dataInicio").value;
    const dataFim = document.getElementById("dataFim").value;

    if(!alunoId || !livroId || !dataInicio || !dataFim){
        alert("Selecione o aluno, o livro e as datas de início e devolução.");
        return;
    }

    // Validação do limite de 15 dias (segurança extra, mesmo com o calendário já restrito)
    const inicio = new Date(dataInicio + "T00:00:00");
    const fim = new Date(dataFim + "T00:00:00");
    const diferencaDias = Math.round((fim - inicio) / (1000 * 60 * 60 * 24));

    if(diferencaDias > LIMITE_DIAS){
        alert(`O prazo máximo de empréstimo é de ${LIMITE_DIAS} dias.`);
        return;
    }

    if(diferencaDias <= 0){
        alert("A data de devolução deve ser depois da data de início.");
        return;
    }

    const alunos = obterAlunos();
    const livros = obterLivros();

    const aluno = alunos.find(a => a.id === Number(alunoId));
    const livro = livros.find(l => l.id === Number(livroId));

    if(!aluno || !livro){
        alert("Aluno ou livro inválido.");
        return;
    }

    if(livro.status === "emprestado"){
        alert("Este livro já está emprestado.");
        return;
    }

    // Cria o registro do empréstimo
    const emprestimos = obterEmprestimos();

    emprestimos.push({
        id: Date.now(),
        alunoId: aluno.id,
        nomeAluno: aluno.nome,
        livroId: livro.id,
        tituloLivro: livro.titulo,
        dataInicio,
        dataFim,
        dataDevolucaoReal: null,
        status: "emprestado"
    });

    salvarEmprestimos(emprestimos);

    // Sincroniza o status do livro
    livro.status = "emprestado";
    salvarLivros(livros);

    limparFormulario();
    preencherSelectLivros();
    renderizarEmprestimos();
}

function limparFormulario(){
    document.getElementById("alunoSelect").value = "";
    document.getElementById("livroSelect").value = "";
    document.getElementById("dataInicio").value = "";
    document.getElementById("dataFim").value = "";
    document.getElementById("dataFim").removeAttribute("min");
    document.getElementById("dataFim").removeAttribute("max");
}

/* ==================================================
   REGISTRAR DEVOLUÇÃO
================================================== */

function registrarDevolucao(id){

    const emprestimos = obterEmprestimos();
    const emprestimo = emprestimos.find(e => e.id === id);

    if(!emprestimo) return;

    emprestimo.status = "devolvido";
    emprestimo.dataDevolucaoReal = new Date().toISOString().split("T")[0];

    salvarEmprestimos(emprestimos);

    // Sincroniza o status do livro de volta para disponível
    const livros = obterLivros();
    const livro = livros.find(l => l.id === emprestimo.livroId);

    if(livro){
        livro.status = "disponivel";
        salvarLivros(livros);
    }

    preencherSelectLivros();
    renderizarEmprestimos();
}

/* ==================================================
   EXCLUIR REGISTRO DO HISTÓRICO
================================================== */

function excluirEmprestimo(id){

    if(!confirm("Tem certeza que deseja excluir este registro do histórico?")) return;

    let emprestimos = obterEmprestimos();
    emprestimos = emprestimos.filter(e => e.id !== id);

    salvarEmprestimos(emprestimos);
    renderizarEmprestimos();
}

/* ==================================================
   STATUS CALCULADO (emprestado / atrasado / devolvido)
================================================== */

function calcularStatus(emprestimo){

    if(emprestimo.status === "devolvido"){
        return "devolvido";
    }

    const hoje = new Date(new Date().toISOString().split("T")[0] + "T00:00:00");
    const fim = new Date(emprestimo.dataFim + "T00:00:00");

    if(hoje > fim){
        return "atrasado";
    }

    return "emprestado";
}

function textoStatus(status){
    switch(status){
        case "emprestado": return "Emprestado";
        case "atrasado":    return "Atrasado";
        case "devolvido":   return "Devolvido";
        default:            return status;
    }
}

/* ==================================================
   RENDERIZAR HISTÓRICO (com filtro de status)
================================================== */

function renderizarEmprestimos(){

    const lista = document.getElementById("listaEmprestimos");
    const filtroStatus = document.getElementById("filtroStatus").value;

    let emprestimos = obterEmprestimos();

    // Mostra os mais recentes primeiro
    emprestimos = [...emprestimos].sort((a, b) => b.id - a.id);

    if(filtroStatus){
        emprestimos = emprestimos.filter(e => calcularStatus(e) === filtroStatus);
    }

    lista.innerHTML = "";

    if(emprestimos.length === 0){
        lista.innerHTML = "<p>Nenhum empréstimo encontrado.</p>";
        return;
    }

    emprestimos.forEach(emprestimo => {

        const status = calcularStatus(emprestimo);

        const li = document.createElement("li");
        li.className = status;

        li.innerHTML = `
            <span>
                <strong>Aluno:</strong> ${emprestimo.nomeAluno}<br>
                <strong>Livro:</strong> ${emprestimo.tituloLivro}<br>
                <strong>Data do empréstimo:</strong> ${formatarData(emprestimo.dataInicio)}<br>
                <strong>Devolução prevista:</strong> ${formatarData(emprestimo.dataFim)}<br>
                <strong>Status:</strong> <span class="status-${status}">${textoStatus(status)}</span>
            </span>
            <div class="botoes-acoes">
                <button
                    class="btn-devolver"
                    onclick="registrarDevolucao(${emprestimo.id})"
                    ${status === "devolvido" ? "disabled" : ""}>
                    Devolver
                </button>
                <button class="btn-excluir" onclick="excluirEmprestimo(${emprestimo.id})">Excluir</button>
            </div>
        `;

        lista.appendChild(li);
    });
}

// Formata "2026-06-17" para "17/06/2026"
function formatarData(dataStr){
    const [ano, mes, dia] = dataStr.split("-");
    return `${dia}/${mes}/${ano}`;
}

/* ==================================================
   INICIALIZAÇÃO
================================================== */

document.addEventListener("DOMContentLoaded", () => {

    preencherSelectAlunos();
    preencherSelectLivros();
    renderizarEmprestimos();

    // Limita o calendário de devolução a 15 dias após a data de início
    document.getElementById("dataInicio").addEventListener("change", atualizarLimiteDataFim);

    // Atualiza o histórico ao trocar o filtro de status
    document.getElementById("filtroStatus").addEventListener("change", renderizarEmprestimos);
});