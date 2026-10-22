// Comportamento da landing page: destino dos botões, menu do celular e preços com/sem IA.
(function () {
  var config = window.ESCOLAPRO || {};

  // Destino dos botões "Teste grátis": cadastro no app, WhatsApp ou a seção de contato.
  var destino = null;
  if (config.app) {
    destino = config.app.replace(/\/$/, "") + "/cadastro";
  } else if (config.whatsapp) {
    destino = "https://wa.me/" + config.whatsapp.replace(/\D/g, "") + "?text=" + encodeURIComponent("Olá! Quero conhecer o EscolaPro para a minha escola.");
  }
  if (destino) {
    document.querySelectorAll("[data-cta]").forEach(function (a) {
      a.href = destino;
      if (!config.app) {
        a.target = "_blank";
        a.rel = "noopener";
      }
    });
    var nota = document.getElementById("contato-nota");
    if (nota) {
      nota.textContent = config.app
        ? "14 dias grátis, sem cartão de crédito. A primeira fatura só chega depois do teste."
        : "Respondemos pelo WhatsApp e mostramos o sistema funcionando com os dados de uma escola de exemplo.";
    }
  } else {
    // Sem cadastro online nem WhatsApp, o botão final aponta para quem mantém o produto.
    var final = document.querySelector("[data-cta-final]");
    if (final) {
      final.href = "https://github.com/sf-solucoestecnologicas";
      final.firstChild.textContent = "Falar com a SF Soluções Tecnológicas ";
    }
  }

  // Menu do celular
  var abrir = document.querySelector(".topo__abrir");
  var menu = document.getElementById("menu");
  if (abrir && menu) {
    abrir.addEventListener("click", function () {
      var aberto = menu.classList.toggle("aberto");
      abrir.setAttribute("aria-expanded", String(aberto));
    });
    menu.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        menu.classList.remove("aberto");
        abrir.setAttribute("aria-expanded", "false");
      }
    });
  }

  // Preços com e sem IA (valores em centavos nos atributos data-*).
  var comIa = document.getElementById("com-ia");
  function atualizarPrecos() {
    document.querySelectorAll(".plano").forEach(function (p) {
      var centavos = Number(p.dataset.base) + (comIa && comIa.checked ? Number(p.dataset.ia) : 0);
      var valor = p.querySelector(".plano__valor");
      if (valor) valor.textContent = "R$ " + (centavos / 100).toLocaleString("pt-BR", { maximumFractionDigits: 0 });
    });
  }
  if (comIa) {
    comIa.addEventListener("change", atualizarPrecos);
    atualizarPrecos();
  }

  var ano = document.getElementById("ano");
  if (ano) ano.textContent = String(new Date().getFullYear());
})();
