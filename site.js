// Comportamento da landing page: destino dos botões, eventos de conversão, menu do celular e preços.
(function () {
  var config = window.ESCOLAPRO || {};

  // Botões com data-app levam ao cadastro, à demonstração ou ao login do app. O endereço do HTML já
  // aponta para o app (vale sem JavaScript); aqui ele segue o config.js e leva junto a origem da
  // visita (UTM, gclid, fbclid e ?ref= de indicação), que o app guarda para medir a conversão.
  var CAMPANHA = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "gbraid", "wbraid", "fbclid", "ref"];
  var daVisita = new URLSearchParams(window.location.search);
  var whatsapp = config.whatsapp ? "https://wa.me/" + config.whatsapp.replace(/\D/g, "") + "?text=" + encodeURIComponent("Olá! Quero conhecer o Semeio para a minha escola.") : null;
  document.querySelectorAll("[data-app]").forEach(function (a) {
    if (config.app) {
      var url = new URL(config.app.replace(/\/$/, "") + a.getAttribute("data-app"));
      CAMPANHA.forEach(function (p) {
        if (daVisita.get(p)) url.searchParams.set(p, daVisita.get(p));
      });
      a.href = url.toString();
    } else if (whatsapp) {
      a.href = whatsapp;
      a.target = "_blank";
      a.rel = "noopener";
    }
  });

  // Eventos de conversão (rastreio.js decide para onde vão, se houver tags configuradas).
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("[data-evento]");
    if (!a || !window.semeioEvento) return;
    window.semeioEvento(a.getAttribute("data-evento"), {
      plano: a.getAttribute("data-plano") || undefined,
      perfil: a.getAttribute("data-perfil") || undefined,
      origem: a.getAttribute("data-origem-cta") || undefined,
    });
  });

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

  // Preços (centavos nos atributos data-*): mensal ou anual (12 meses com 10% de desconto).
  // O adicional de IA aparece à parte, abaixo dos planos.
  var DESCONTO_ANUAL = 0.1;
  var real = function (centavos, casas) {
    return "R$ " + (centavos / 100).toLocaleString("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas });
  };
  function aplicarCiclo(ciclo, animar) {
    document.querySelectorAll("[data-ciclo]").forEach(function (b) {
      b.setAttribute("aria-checked", String(b.getAttribute("data-ciclo") === ciclo));
    });
    document.querySelectorAll(".plano").forEach(function (p) {
      var mensal = Number(p.dataset.base);
      var cobrado = ciclo === "anual" ? Math.round((mensal * 12 * (1 - DESCONTO_ANUAL)) / 100) * 100 : mensal;
      var porMes = ciclo === "anual" ? cobrado / 12 : mensal;
      var valor = p.querySelector(".plano__valor");
      var periodo = p.querySelector(".plano__periodo");
      var porAluno = p.querySelector(".plano__por-aluno");
      if (valor) valor.textContent = real(cobrado, 0);
      if (periodo) periodo.textContent = ciclo === "anual" ? "/ano" : "/mês";
      if (porAluno) porAluno.textContent = (ciclo === "anual" ? "equivale a " + real(porMes, 0) + "/mês · " : "") + real(Math.round(porMes / Number(p.dataset.alunos)), 2) + " por aluno";
      var botao = p.querySelector("a[data-app]");
      if (botao) {
        var url = new URL(botao.href, window.location.href);
        if (ciclo === "anual") url.searchParams.set("ciclo", "anual");
        else url.searchParams.delete("ciclo");
        botao.href = url.toString();
      }
      if (!animar || !valor) return;
      valor.classList.remove("mudou");
      void valor.offsetWidth; // reinicia a animação
      valor.classList.add("mudou");
    });
  }
  document.querySelectorAll("[data-ciclo]").forEach(function (b) {
    b.addEventListener("click", function () {
      aplicarCiclo(b.getAttribute("data-ciclo"), true);
      if (window.semeioEvento) window.semeioEvento("ciclo", { ciclo: b.getAttribute("data-ciclo") });
    });
  });

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
