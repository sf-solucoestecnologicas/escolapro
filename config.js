// Configuração da landing page. Edite e publique de novo (pnpm site:publicar) para mudar.
window.ESCOLAPRO = {
  // Endereço do app publicado (ex.: "https://app.semeio.com.br"). Os botões levam ao cadastro,
  // à demonstração e ao login desse endereço.
  app: "https://escolapro.fly.dev",
  // WhatsApp comercial, só números, com 55 e DDD (ex.: "5511999999999"). Só é usado sem app.
  whatsapp: "",

  // ── Rastreamento (vazio = desligado; nada é carregado) ──
  // Cada tag só carrega depois que o visitante aceita os cookies (LGPD).
  rastreio: {
    // Google Analytics 4 (ex.: "G-ABC123XYZ"): Admin › Fluxos de dados › ID da métrica.
    ga4: "",
    // Google Ads (ex.: "AW-123456789"): Ferramentas › Conversões › Tag do Google.
    googleAds: "",
    // Rótulos de conversão do Google Ads (a parte depois da barra em "AW-123456789/AbCdEf").
    conversaoAssinar: "",
    conversaoDemo: "",
    // Pixel da Meta para Facebook e Instagram Ads (só números, ex.: "1234567890123456").
    metaPixel: "",
  },
};
