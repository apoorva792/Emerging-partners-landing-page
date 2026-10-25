/* Lyzr Partner Opportunity Agent — embedded into the Emerging Partners landing page.
 *
 * The page is a Claude Design export whose bundler replaces the whole documentElement
 * (`replaceWith`) once it boots, so anything appended to the original DOM is discarded.
 * The export also ships its own *simulated* journey behind the hero form. So we live on
 * `window` — which survives the replace — poll for the hero form, and bind directly to it
 * each time it appears, replacing the simulation with the real agent.
 *
 * __APP__ is substituted by scripts/patch-landing.py. It defaults to a path on the same
 * origin — /agent.html — so moving the site to another domain needs no re-patch.
 */
(function () {
  var APP = '__APP__';
  var VALID = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var ov = null, fr = null;

  function build() {
    ov = document.createElement('div');
    ov.id = 'lpa-ov';
    ov.style.cssText = 'position:fixed;inset:0;z-index:2147483000;display:none;' +
      'background:rgba(31,32,34,.55);backdrop-filter:blur(3px)';

    var box = document.createElement('div');
    box.style.cssText = 'position:absolute;inset:clamp(0px,3vh,28px) clamp(0px,3vw,28px);' +
      'background:#FAFAF9;border-radius:14px;overflow:hidden;display:flex;flex-direction:column;' +
      'box-shadow:0 30px 80px rgba(0,0,0,.35)';

    var bar = document.createElement('div');
    bar.style.cssText = 'flex:none;display:flex;align-items:center;justify-content:space-between;' +
      'padding:12px 16px;border-bottom:1px solid #E3E1DE';

    var label = document.createElement('span');
    label.textContent = 'Partner Opportunity Agent';
    label.style.cssText = 'font-family:ui-monospace,monospace;font-size:11px;letter-spacing:.14em;' +
      'text-transform:uppercase;color:#6B675F';

    var x = document.createElement('button');
    x.type = 'button';
    x.setAttribute('aria-label', 'Close');
    x.textContent = '×';
    x.style.cssText = 'border:0;background:none;cursor:pointer;font-size:26px;line-height:1;' +
      'color:#6B675F;padding:0 6px';
    x.onclick = close;

    fr = document.createElement('iframe');
    fr.id = 'lpa-f';
    fr.title = 'Partner Opportunity Agent';
    fr.style.cssText = 'flex:1;width:100%;border:0';

    bar.appendChild(label); bar.appendChild(x);
    box.appendChild(bar); box.appendChild(fr);
    ov.appendChild(box);

    ov.addEventListener('click', function (e) { if (e.target === ov) close(); });
    document.body.appendChild(ov);
  }

  function open(email) {
    /* The overlay is rebuilt if the bundler replaced the DOM under us. */
    if (!ov || !ov.isConnected) build();
    fr.src = APP + (APP.indexOf('?') > -1 ? '&' : '?') + 'embed=1&email=' + encodeURIComponent(email);
    ov.style.display = 'block';
    document.body.style.overflow = 'hidden';
  }

  function close() {
    if (!ov) return;
    ov.style.display = 'none';
    fr.src = 'about:blank';
    document.body.style.overflow = '';
  }

  window.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && ov && ov.style.display === 'block') close();
  });

  /* Two ways in — the top hero and the opportunity card lower down — and both now take a
   * work email. The agent derives the website from its domain, so there is nothing else
   * to collect here. */
  function intercept(e) {
    var form = e.type === 'submit' ? e.target : (e.target.closest && e.target.closest('form'));
    if (!form || !form.querySelector) return;
    var input = form.querySelector('#hero-email') || form.querySelector('#site');
    if (!input) return;
    var v = (input.value || '').trim();
    if (!VALID.test(v)) return;            /* invalid: let the page show its own error */
    e.preventDefault();
    e.stopPropagation();
    if (e.stopImmediatePropagation) e.stopImmediatePropagation();
    open(v);
  }

  /* Bind to the form itself, in the capture phase, so the export's own handler never runs.
   * Re-checked on a timer because the form is destroyed and rebuilt by the bundler. */
  function bind() {
    ['hero-email', 'site'].forEach(function (id) {
      var input = document.getElementById(id);
      var form = input && input.closest('form');
      if (!form || form.__lpa) return;
      form.__lpa = true;
      form.addEventListener('submit', intercept, true);
      form.addEventListener('click', intercept, true);
    });
  }

  bind();
  setInterval(bind, 400);
  window.__lpa = true;
})();
