// Simulador de ganhos do programa de parceiros. Regras em packages/domain/src/afiliados.ts:
// nível 1 ganha 30% da primeira mensalidade e 10% das seguintes; nível 2 (rede), 10% e 5%.
(function () {
  var NIVEL_1 = { inicial: 0.3, recorrente: 0.1 };
  var NIVEL_2 = { inicial: 0.1, recorrente: 0.05 };

  var diretas = document.getElementById("diretas");
  var rede = document.getElementById("rede");
  if (!diretas || !rede) return;

  var real = function (centavos) {
    return "R$ " + Math.round(centavos / 100).toLocaleString("pt-BR");
  };
  var escrever = function (id, texto) {
    var el = document.getElementById(id);
    if (el) el.textContent = texto;
  };
  var preencher = function (input) {
    input.style.setProperty("--p", (Number(input.value) / Number(input.max)) * 100 + "%");
  };

  function calcular() {
    var plano = document.querySelector('input[name="plano"]:checked');
    var mensalidade = Number(plano ? plano.value : 38900);
    var d = Number(diretas.value);
    var r = Number(rede.value);
    var inicial = d * mensalidade * NIVEL_1.inicial + r * mensalidade * NIVEL_2.inicial;
    var recDiretas = d * mensalidade * NIVEL_1.recorrente;
    var recRede = r * mensalidade * NIVEL_2.recorrente;
    var mensal = recDiretas + recRede;
    // Primeiro ano: o bônus da 1ª mensalidade e mais 11 meses de recorrente.
    var ano = inicial + mensal * 11;

    escrever("sim-diretas", String(d));
    escrever("sim-rede", String(r));
    escrever("sim-mensal", real(mensal) + "/mês");
    escrever("sim-ano", real(ano) + " no primeiro ano");
    escrever("sim-inicial", real(inicial));
    escrever("sim-rec-diretas", real(recDiretas) + "/mês");
    escrever("sim-rec-rede", real(recRede) + "/mês");
    preencher(diretas);
    preencher(rede);
  }

  [diretas, rede].forEach(function (el) {
    el.addEventListener("input", calcular);
  });
  document.querySelectorAll('input[name="plano"]').forEach(function (el) {
    el.addEventListener("change", calcular);
  });
  calcular();
})();
