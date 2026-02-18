/**
 * Captura de leads: abre modal ao clicar em "Solicitar Orçamento",
 * envia dados para a API e redireciona para o WhatsApp.
 * Quando o site é servido pelo mesmo servidor da API, o lead é salvo no dashboard.
 */
(function () {
  var API_BASE = ''; // mesmo origem quando servido pelo Express
  var WHATSAPP_DEFAULT = '5547999140885';

  var modal = document.getElementById('lead-modal');
  var form = document.getElementById('lead-form');
  var btnOpen = document.getElementById('btn-solicitar-orcamento');
  var btnClose = document.getElementById('lead-modal-close');
  var backdrop = modal && modal.querySelector('.lead-modal__backdrop');

  function openModal() {
    if (!modal) return;
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!modal) return;
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function getWhatsAppNumber(cb) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', API_BASE + '/api/public/contacts');
    xhr.onload = function () {
      try {
        var c = JSON.parse(xhr.responseText);
        var num = '';
        if (c.numbers && c.numbers.length > 0) num = (c.numbers[0].number || '').replace(/\D/g, '');
        if (!num) num = (c.whatsapp1 || WHATSAPP_DEFAULT).replace(/\D/g, '');
        if (num && !num.startsWith('55')) num = '55' + num;
        cb(num || WHATSAPP_DEFAULT);
      } catch (e) {
        cb(WHATSAPP_DEFAULT);
      }
    };
    xhr.onerror = function () { cb(WHATSAPP_DEFAULT); };
    xhr.send();
  }

  if (btnOpen) btnOpen.addEventListener('click', openModal);
  // Delegação de eventos para capturar cliques em .js-open-lead-modal criados dinamicamente
  document.addEventListener('click', function (e) {
    var el = e.target.closest('.js-open-lead-modal');
    if (el) { e.preventDefault(); openModal(); }
  });
  if (btnClose) btnClose.addEventListener('click', closeModal);
  if (backdrop) backdrop.addEventListener('click', closeModal);

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var nome = (document.getElementById('lead-nome') || {}).value || '';
      var telefone = (document.getElementById('lead-telefone') || {}).value || '';
      var mensagem = (document.getElementById('lead-mensagem') || {}).value || '';

      var payload = { nome: nome.trim(), telefone: telefone.trim(), mensagem: mensagem.trim(), origem: 'site' };
      var url = API_BASE + '/api/leads';

      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(function () {});

      getWhatsAppNumber(function (waNum) {
        var text = 'Olá! Sou ' + encodeURIComponent(nome) + '. ';
        if (mensagem) text += encodeURIComponent(mensagem);
        window.open('https://wa.me/' + waNum + '?text=' + text, '_blank');
      });
      closeModal();
      form.reset();
    });
  }
})();
