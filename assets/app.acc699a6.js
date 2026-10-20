(function () {
'use strict';
var $ = function (id) { return document.getElementById(id); };
if (/(invite|recovery|confirmation|email_change)_token/.test(location.hash)) {
location.replace('/admin/' + location.hash);
return;
}
var HL = document.body.dataset.page === 'acasa' ? 'h3' : 'h2';
var getJSON = function (n) {
return fetch('/data/' + n + '.json').then(function (r) {
if (!r.ok) throw new Error(n);
return r.json();
});
};
var paras = function (txt) {
return String(txt || '').split('\n\n').map(function (p) {
return '<p style="margin-bottom:14px">' + p + '</p>';
}).join('');
};
var tgl = $('nav-toggle');
if (tgl) tgl.addEventListener('click', function () {
var open = $('nav-links').classList.toggle('open');
tgl.setAttribute('aria-expanded', open ? 'true' : 'false');
});
var CK = 'cookie_consent_asigurpro_v2';
function getConsent() {
try { return JSON.parse(localStorage.getItem(CK)); } catch (e) { return null; }
}
function applyConsent(c) {
document.querySelectorAll('script[type="text/plain"][data-consent]').forEach(function (old) {
if (old.dataset.done || !c[old.dataset.consent]) return;
var s = document.createElement('script');
Array.prototype.forEach.call(old.attributes, function (a) {
if (a.name !== 'type' && a.name !== 'data-consent') s.setAttribute(a.name, a.value);
});
s.textContent = old.textContent;
old.dataset.done = '1';
old.parentNode.insertBefore(s, old.nextSibling);
});
}
function saveConsent(c) {
var prev = getConsent();
c.ts = Date.now();
try { localStorage.setItem(CK, JSON.stringify(c)); } catch (e) {}
$('cookie-banner').hidden = true;
$('cookie-modal').hidden = true;
if (prev && ((prev.statistici && !c.statistici) || (prev.marketing && !c.marketing))) { location.reload(); return; }
applyConsent(c);
}
function openCookieSettings() {
var c = getConsent() || {};
$('ck-statistici').checked = !!c.statistici;
$('ck-marketing').checked = !!c.marketing;
$('cookie-modal').hidden = false;
}
if ($('cookie-banner')) {
var existing = getConsent();
if (existing) applyConsent(existing); else $('cookie-banner').hidden = false;
$('ck-accept').addEventListener('click', function () { saveConsent({ statistici: true, marketing: true }); });
$('ck-reject').addEventListener('click', function () { saveConsent({ statistici: false, marketing: false }); });
$('ck-settings').addEventListener('click', openCookieSettings);
$('ck-save').addEventListener('click', function () {
saveConsent({ statistici: $('ck-statistici').checked, marketing: $('ck-marketing').checked });
});
$('ck-close').addEventListener('click', function () { $('cookie-modal').hidden = true; });
['open-cookie-settings', 'open-cookie-settings-2'].forEach(function (id) {
var l = $(id);
if (l) l.addEventListener('click', function (e) { e.preventDefault(); openCookieSettings(); });
});
}
getJSON('setari').then(function (s) {
var set = function (id, v) { var el = $(id); if (el) el.textContent = v; };
set('contact-telefon', s.telefon_afisat);
set('contact-broker', s.broker);
set('contact-companie', s.companie + ' · ' + s.cod_raf);
set('contact-program', s.program);
var tel = $('hero-tel-btn');
if (tel) { tel.href = s.telefon_link; tel.textContent = '📞 ' + s.telefon_afisat; }
var wa = $('wa-btn');
if (wa) wa.href = 'https://wa.me/' + s.whatsapp_numar;
if (s.smartsales_activ && s.smartsales_link) {
['hero-smartsales-btn', 'nav-smartsales-btn'].forEach(function (id) {
var b = $(id);
if (!b) return;
b.href = s.smartsales_link;
b.textContent = '🛒 ' + s.smartsales_text;
b.style.display = 'inline-block';
});
}
if (s.newsletter_activ && s.newsletter_embed && $('newsletter-embed-container')) {
$('newsletter-embed-container').innerHTML = s.newsletter_embed;
$('newsletter-section').style.display = 'block';
document.querySelectorAll('#newsletter-embed-container script').forEach(function (old) {
var n = document.createElement('script');
Array.prototype.forEach.call(old.attributes, function (a) { n.setAttribute(a.name, a.value); });
n.textContent = old.textContent;
old.replaceWith(n);
});
}
}).catch(function (e) { console.error(e); });
var limitOf = function (el, arr) {
var n = parseInt(el.dataset.limit, 10);
return n ? arr.slice(0, n) : arr;
};
if ($('anunturi-grid') || $('ticker-track')) {
getJSON('anunturi').then(function (d) {
if ($('ticker-track')) {
var t = d.items.map(function (a) { return '<span>' + a.titlu + '</span>'; }).join('');
$('ticker-track').innerHTML = t + t;
}
var g = $('anunturi-grid');
if (g) g.innerHTML = limitOf(g, d.items).map(function (a) {
return '<div class="anunt-card"><span class="anunt-badge">' + a.badge + '</span><' + HL + '>' + a.titlu +
'</' + HL + '><p>' + a.text + '</p><p class="anunt-data">' + a.data + '</p></div>';
}).join('');
}).catch(function (e) { console.error(e); });
}
if ($('services-grid')) {
getJSON('servicii').then(function (d) {
var g = $('services-grid');
g.innerHTML = limitOf(g, d.items).map(function (s) {
return '<div class="srv-card"><div class="srv-icon">' + s.icon + '</div><' + HL + '>' + s.titlu + '</' + HL + '><p>' + s.text + '</p></div>';
}).join('');
}).catch(function (e) { console.error(e); });
}
if ($('echipa-grid')) {
getJSON('echipa').then(function (d) {
$('echipa-grid').innerHTML = d.items.map(function (m) {
return '<div class="echipa-card"><div class="echipa-avatar">' + m.initiale + '</div><' + HL + '>' + m.nume +
'</' + HL + '><p>' + m.rol + '</p><p class="echipa-company">' + m.companie + '</p></div>';
}).join('');
}).catch(function (e) { console.error(e); });
}
if ($('blog-grid')) {
getJSON('blog').then(function (d) {
window._blogItems = d.items;
$('blog-grid').innerHTML = d.items.map(function (b, i) {
return '<div class="srv-card blog-card" style="cursor:pointer" role="button" tabindex="0" data-i="' + i + '">' +
'<p style="color:var(--orange);font-size:12px;font-weight:500;margin-bottom:8px">' + b.data + '</p>' +
'<' + HL + '>' + b.titlu + '</' + HL + '><p>' + b.extras + '</p>' +
'<p style="color:var(--orange);font-size:13px;font-weight:500;margin-top:12px">Citește mai mult →</p></div>';
}).join('');
var m = location.hash.match(/^#articol-(\d+)$/);
if (m && d.items[+m[1]]) window.openBlogModal(+m[1]);
}).catch(function (e) { console.error(e); });
window.openBlogModal = function (i) {
var b = window._blogItems[i];
$('blog-modal-data').textContent = b.data;
$('blog-modal-titlu').textContent = b.titlu;
$('blog-modal-continut').innerHTML = paras(b.continut);
$('blog-modal').style.display = 'block';
document.body.style.overflow = 'hidden';
history.replaceState(null, '', '#articol-' + i);
};
window.closeBlogModal = function () {
$('blog-modal').style.display = 'none';
document.body.style.overflow = '';
history.replaceState(null, '', location.pathname);
};
var bg = $('blog-grid');
bg.addEventListener('click', function (e) {
var c = e.target.closest('.blog-card');
if (c) window.openBlogModal(+c.dataset.i);
});
bg.addEventListener('keydown', function (e) {
if (e.key !== 'Enter' && e.key !== ' ') return;
var c = e.target.closest('.blog-card');
if (c) { e.preventDefault(); window.openBlogModal(+c.dataset.i); }
});
$('blog-close').addEventListener('click', window.closeBlogModal);
$('blog-modal').addEventListener('click', function (e) { if (e.target === this) window.closeBlogModal(); });
document.addEventListener('keydown', function (e) {
if (e.key === 'Escape' && $('blog-modal').style.display === 'block') window.closeBlogModal();
});
}
if ($('legal-content')) {
getJSON('legal').then(function (l) {
$('legal-content').innerHTML = paras(l[$('legal-content').dataset.legal]);
}).catch(function (e) { console.error(e); });
}
function wireForm(form, btn, onOk) {
form.addEventListener('submit', function (e) {
e.preventDefault();
var label = btn.textContent;
var file = form.querySelector('input[type=file]');
if (file && file.files[0] && file.files[0].size > 7 * 1024 * 1024) {
alert('Fișierul este prea mare. Limita este de 7 MB.');
return;
}
btn.disabled = true;
btn.textContent = 'Se trimite...';
var opts = { method: 'POST' };
var fd = new FormData(form);
if (file) {
opts.body = fd;
} else {
opts.headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
opts.body = new URLSearchParams(fd).toString();
}
fetch('/', opts).then(function (r) {
if (!r.ok) throw new Error('send');
onOk();
}).catch(function () {
btn.textContent = 'Eroare — încearcă din nou';
btn.disabled = false;
setTimeout(function () { btn.textContent = label; }, 3000);
});
});
}
if ($('contact-form')) {
var tip = new URLSearchParams(location.search).get('tip');
if (tip) {
var sel = $('contact-form').querySelector('select[name=tip_asigurare]');
Array.prototype.forEach.call(sel.options, function (o) { if (o.text === tip) sel.value = o.value || o.text; });
}
wireForm($('contact-form'), $('submit-btn'), function () {
$('contact-form').style.display = 'none';
$('form-success').style.display = 'block';
});
}
if ($('mini-go')) $('mini-go').addEventListener('click', function () {
var v = $('mini-tip').value;
location.href = '/contact/' + (v ? '?tip=' + encodeURIComponent(v) : '');
});
if ($('test-grid')) {
getJSON('testimoniale').then(function (d) {
var cta = $('test-grid').firstElementChild;
cta.insertAdjacentHTML('beforebegin', d.items.map(function (t) {
return '<div class="test-card"><div class="test-quote">"</div><div class="test-stars">' +
'★'.repeat(t.stele) + '☆'.repeat(5 - t.stele) + '</div><p class="test-text">' + t.text +
'</p><p class="test-autor">' + t.autor + '</p><p class="test-tip">' + t.tip + '</p></div>';
}).join(''));
}).catch(function (e) { console.error(e); });
document.querySelectorAll('.star-btn').forEach(function (btn) {
btn.classList.add('active');
btn.addEventListener('click', function () {
var v = parseInt(this.dataset.val, 10);
$('nota-hidden').value = v;
document.querySelectorAll('.star-btn').forEach(function (b, i) { b.classList.toggle('active', i < v); });
});
});
wireForm($('test-form'), $('test-form').querySelector('button[type=submit]'), function () {
$('test-form').style.display = 'none';
$('test-success').style.display = 'block';
});
}
if ($('cariere-form')) {
getJSON('cariere').then(function (c) {
var list = Array.isArray(c.pozitii) ? c.pozitii : [];
var id = new URLSearchParams(location.search).get('pozitie');
var cur = list.filter(function (p) { return p.id === id; })[0] || null;
var li = function (a) { return (a || []).map(function (x) { return '<li>' + x + '</li>'; }).join(''); };
var titlu = cur ? cur.titlu : c.titlu;
var intro = cur ? (cur.descriere || c.intro) : c.intro;
$('cariere-titlu').textContent = titlu;
$('cariere-intro').textContent = intro;
document.title = titlu + ' | Cariera AsigurPro';
var ben = cur && cur.beneficii && cur.beneficii.length ? cur.beneficii : c.beneficii;
var cer = cur && cur.cerinte && cur.cerinte.length ? cur.cerinte : c.cerinte;
$('cariere-beneficii').innerHTML = li(ben);
$('cariere-cerinte').innerHTML = li(cer);
var poz = cur ? cur.titlu : 'Aplicare generală';
$('cariere-pozitie').value = poz;
$('cariere-pozitie-label').textContent = 'Poziție: ' + poz;
if (cur) {
$('cariere-back').style.display = 'inline-block';
var meta = [cur.locatie, cur.tip].filter(Boolean).join(' · ');
if (meta) { $('cariere-meta').textContent = meta; $('cariere-meta').style.display = 'block'; }
} else if (list.length) {
$('cariere-pozitii').innerHTML = list.map(function (p) {
var url = location.origin + '/cariera/?pozitie=' + encodeURIComponent(p.id);
return '<div class="poz-card"><' + HL + '>' + p.titlu + '</' + HL + '><div class="poz-meta">' +
[p.locatie, p.tip].filter(Boolean).join(' · ') + '</div><p>' + (p.descriere || '') + '</p>' +
'<div class="poz-actions"><a href="/cariera/?pozitie=' + encodeURIComponent(p.id) + '">Vezi detalii și aplică</a>' +
'<button type="button" data-url="' + url + '">🔗 Copiază link</button></div></div>';
}).join('');
$('cariere-pozitii').style.display = 'grid';
$('cariere-pozitii').addEventListener('click', function (e) {
var b = e.target.closest('button[data-url]');
if (b) copy(b.dataset.url, b);
});
}
}).catch(function (e) { console.error(e); });
function copy(text, btn) {
var done = function () { var t = btn.textContent; btn.textContent = '✓ Link copiat'; setTimeout(function () { btn.textContent = t; }, 2000); };
if (navigator.clipboard) navigator.clipboard.writeText(text).then(done);
else { var i = document.createElement('input'); i.value = text; document.body.appendChild(i); i.select(); document.execCommand('copy'); i.remove(); done(); }
}
$('copy-page-link').addEventListener('click', function () { copy(location.href, this); });
wireForm($('cariere-form'), $('cariere-submit-btn'), function () {
$('cariere-form').style.display = 'none';
$('cariere-success').style.display = 'block';
});
}
})();