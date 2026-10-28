// Comportamento da landing page: destino dos botões, menu do celular e preços com/sem IA.
(function () {
  var config = window.ESCOLAPRO || {};

  // Destino dos botões de ação: página de login do app, WhatsApp ou a seção de contato.
  var destino = null;
  if (config.app) {
    destino = config.app.replace(/\/$/, "") + "/";
  } else if (config.whatsapp) {
    destino = "https://wa.me/" + config.whatsapp.replace(/\D/g, "") + "?text=" + encodeURIComponent("Olá! Quero conhecer o Semeio para a minha escola.");
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
        ? "Entre na sua conta, explore os perfis de demonstração ou crie a conta da escola e assine em poucos minutos."
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

  // Preços (centavos nos atributos data-*). O adicional de IA fica fora da oferta por enquanto.
  var comIa = document.getElementById("com-ia");
  function atualizarPrecos(animar) {
    document.querySelectorAll(".plano").forEach(function (p) {
      var centavos = Number(p.dataset.base) + (comIa && comIa.checked ? Number(p.dataset.ia) : 0);
      var valor = p.querySelector(".plano__valor");
      if (!valor) return;
      valor.textContent = "R$ " + (centavos / 100).toLocaleString("pt-BR", { maximumFractionDigits: 0 });
      if (!animar) return;
      valor.classList.remove("mudou");
      void valor.offsetWidth; // reinicia a animação
      valor.classList.add("mudou");
    });
  }
  if (comIa) {
    comIa.addEventListener("change", function () {
      atualizarPrecos(true);
    });
    atualizarPrecos(false);
  }

  var ano = document.getElementById("ano");
  if (ano) ano.textContent = String(new Date().getFullYear());

  // ───── Movimento (desligado para quem pede "reduzir movimento") ─────
  var semMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var comMouse = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  // Barra de progresso da leitura e sombra no cabeçalho.
  var barra = document.querySelector(".progresso");
  var topo = document.querySelector(".topo");
  var agendado = false;
  function aoRolar() {
    agendado = false;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    if (barra) barra.style.setProperty("--progresso", String(max > 0 ? Math.min(1, window.scrollY / max) : 0));
    if (topo) topo.classList.toggle("rolou", window.scrollY > 8);
  }
  window.addEventListener(
    "scroll",
    function () {
      if (!agendado) {
        agendado = true;
        requestAnimationFrame(aoRolar);
      }
    },
    { passive: true },
  );
  aoRolar();

  // Números que contam até o valor quando aparecem.
  function contar(el) {
    var alvo = Number(el.dataset.contar);
    var sufixo = el.dataset.sufixo || "";
    if (semMovimento) return;
    var inicio = null;
    function passo(t) {
      if (inicio === null) inicio = t;
      var p = Math.min(1, (t - inicio) / 1200);
      var suave = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(alvo * suave) + sufixo;
      if (p < 1) requestAnimationFrame(passo);
    }
    el.textContent = "0" + sufixo;
    requestAnimationFrame(passo);
  }

  // Seções e cartões aparecem ao rolar, um depois do outro.
  var seletor = ".secao__titulo, .area, .agente, .dupla__texto, .dupla__imagem, .mini, .plano, .seguranca > div, .faq details, .incluso, .final__caixa";
  if ("IntersectionObserver" in window && !semMovimento) {
    var observador = new IntersectionObserver(
      function (entradas) {
        entradas.forEach(function (e) {
          if (!e.isIntersecting) return;
          var el = e.target;
          observador.unobserve(el);
          if (el.dataset.contar) return contar(el);
          el.classList.add("visivel");
          // Depois de aparecer, volta ao normal (o efeito de passar o mouse não herda o atraso).
          setTimeout(function () {
            el.classList.remove("revelar", "visivel");
            el.style.removeProperty("--i");
          }, 1400);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    document.querySelectorAll(seletor).forEach(function (el) {
      var irmaos = Array.prototype.filter.call(el.parentElement.children, function (x) {
        return x.matches(seletor);
      });
      el.style.setProperty("--i", String(Math.min(irmaos.indexOf(el), 5)));
      el.classList.add("revelar");
      observador.observe(el);
    });
    document.querySelectorAll("[data-contar]").forEach(function (el) {
      observador.observe(el);
    });
  }

  if (comMouse && !semMovimento) {
    // Luz que segue o mouse nos cartões.
    document.querySelectorAll(".area, .agente, .mini, .seguranca > div").forEach(function (el) {
      el.addEventListener("pointermove", function (ev) {
        var r = el.getBoundingClientRect();
        el.style.setProperty("--mx", ev.clientX - r.left + "px");
        el.style.setProperty("--my", ev.clientY - r.top + "px");
      });
    });
    // A tela do topo inclina levemente acompanhando o mouse.
    var vitrine = document.querySelector(".vitrine");
    var tela = vitrine && vitrine.querySelector(".navegador");
    if (vitrine && tela) {
      vitrine.addEventListener("pointermove", function (ev) {
        var r = vitrine.getBoundingClientRect();
        var x = (ev.clientX - r.left) / r.width - 0.5;
        var y = (ev.clientY - r.top) / r.height - 0.5;
        tela.style.setProperty("--ry", (x * 8).toFixed(2) + "deg");
        tela.style.setProperty("--rx", (-y * 6).toFixed(2) + "deg");
      });
      vitrine.addEventListener("pointerleave", function () {
        tela.style.setProperty("--ry", "0deg");
        tela.style.setProperty("--rx", "0deg");
      });
    }
  }
})();
