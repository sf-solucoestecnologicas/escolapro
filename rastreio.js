// Rastreamento da landing: Google Analytics 4, Google Ads e Pixel da Meta, com consentimento (LGPD).
// Sem IDs em config.js nada é carregado e o aviso de cookies nem aparece.
// Com IDs, o Modo de Consentimento do Google começa negado e as tags só medem depois do "Aceitar".
(function () {
  var cfg = (window.ESCOLAPRO && window.ESCOLAPRO.rastreio) || {};
  var temGoogle = Boolean(cfg.ga4 || cfg.googleAds);
  var temMeta = Boolean(cfg.metaPixel);
  var CHAVE = "semeio:cookies";

  function lerEscolha() {
    try {
      return localStorage.getItem(CHAVE);
    } catch (e) {
      return null;
    }
  }
  function guardarEscolha(v) {
    try {
      localStorage.setItem(CHAVE, v);
    } catch (e) {
      // Sem armazenamento: a escolha vale só nesta visita.
    }
  }
  function carregarScript(src) {
    var s = document.createElement("script");
    s.async = true;
    s.src = src;
    document.head.appendChild(s);
  }

  // Google: o gtag nasce com tudo negado; "Aceitar" libera a medição de anúncios e de visitas.
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () {
    window.dataLayer.push(arguments);
  };
  if (temGoogle) {
    window.gtag("consent", "default", { ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied", analytics_storage: "denied", wait_for_update: 500 });
    window.gtag("js", new Date());
    if (cfg.ga4) window.gtag("config", cfg.ga4);
    if (cfg.googleAds) window.gtag("config", cfg.googleAds);
    carregarScript("https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(cfg.ga4 || cfg.googleAds));
  }

  var metaPronto = false;
  function iniciarMeta() {
    if (!temMeta || metaPronto) return;
    metaPronto = true;
    /* Código base do Pixel da Meta */
    !(function (f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = !0;
      n.version = "2.0";
      n.queue = [];
      t = b.createElement(e);
      t.async = !0;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
    window.fbq("init", cfg.metaPixel);
    window.fbq("track", "PageView");
  }

  function aplicar(escolha) {
    var ok = escolha === "aceitou";
    if (temGoogle) {
      var v = ok ? "granted" : "denied";
      window.gtag("consent", "update", { ad_storage: v, ad_user_data: v, ad_personalization: v, analytics_storage: v });
    }
    if (ok) iniciarMeta();
  }

  /**
   * Evento de conversão. tipo: "assinar" (clique para assinar), "demo" (abriu a demonstração),
   * "contato" (e-mail). dados: { plano, perfil, origem }.
   */
  window.semeioEvento = function (tipo, dados) {
    dados = dados || {};
    if (temGoogle) {
      var nomes = { assinar: "clique_assinar", demo: "abrir_demonstracao", contato: "contato", entrar: "clique_entrar" };
      window.gtag("event", nomes[tipo] || tipo, dados);
      var rotulo = tipo === "assinar" ? cfg.conversaoAssinar : tipo === "demo" ? cfg.conversaoDemo : "";
      if (cfg.googleAds && rotulo) window.gtag("event", "conversion", { send_to: cfg.googleAds + "/" + rotulo });
    }
    if (metaPronto && window.fbq) {
      if (tipo === "assinar") window.fbq("track", "Lead", { content_name: dados.plano || "sem_plano" });
      else if (tipo === "demo") window.fbq("track", "ViewContent", { content_name: "demonstracao_" + (dados.perfil || "") });
      else if (tipo === "contato") window.fbq("track", "Contact");
    }
  };

  // Aviso de cookies (só quando há alguma tag configurada).
  if (!temGoogle && !temMeta) return;
  var escolha = lerEscolha();
  if (escolha) aplicar(escolha);
  document.addEventListener("DOMContentLoaded", function () {
    var aviso = document.getElementById("cookies");
    var reabrir = document.querySelector("[data-abrir-cookies]");
    if (!aviso) return;
    if (reabrir) {
      reabrir.hidden = false;
      reabrir.addEventListener("click", function (e) {
        e.preventDefault();
        aviso.hidden = false;
      });
    }
    if (!escolha) aviso.hidden = false;
    aviso.addEventListener("click", function (e) {
      var botao = e.target.closest("[data-cookies]");
      if (!botao) return;
      var v = botao.getAttribute("data-cookies") === "aceitar" ? "aceitou" : "recusou";
      guardarEscolha(v);
      aplicar(v);
      aviso.hidden = true;
    });
  });
})();
