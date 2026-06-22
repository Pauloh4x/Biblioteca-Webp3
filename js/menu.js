
function ativarLinkAtual() {
	const paginaAtual =
		window.location.pathname.split("/").pop() || "index.html"; // index.html ou livros.html ou contato.html
	const links = document.querySelectorAll(".menu a");
	links.forEach(function (link) {
		const href = link.getAttribute("href");
		if (href === paginaAtual) {
			link.classList.add("ativo");
		}
	});
}

function configurarBotaoMenu() {
	const botao = document.getElementById("menuBotao");
	const menu = document.getElementById("menu");
	if (!botao || !menu) {
		return;
	}
	botao.addEventListener("click", function () {
		menu.classList.toggle("aberto");
	});
}


async function carregarMenu() {
	
	const menu_container = document.getElementById("menu-container");
	if (!menu_container) {
		return;
	}
	try {
		const resposta = await fetch("components/menu.html");
		const html = await resposta.text();
		menu_container.innerHTML = html;
	} catch (erro) {
		menu_container.innerHTML = "<p>Erro ao carregar o menu.</p>";
	}
	configurarBotaoMenu();
	ativarLinkAtual();
}


// Espera o HTML da página carregar antes de executar o código.
document.addEventListener("DOMContentLoaded", carregarMenu);


 document.addEventListener("DOMContentLoaded", function () {

            const alunos =
                JSON.parse(localStorage.getItem("alunos")) || [];

            const livros =
                JSON.parse(localStorage.getItem("livros")) || [];

            const emprestimos =
                JSON.parse(localStorage.getItem("emprestimos")) || [];

            document.getElementById("totalAlunos").textContent =
                alunos.length;

            document.getElementById("totalLivros").textContent =
                livros.length;

            document.getElementById("totalEmprestimos").textContent =
                emprestimos.length;

        });
