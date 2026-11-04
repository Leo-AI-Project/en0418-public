(function (root) {
'use strict';

var DIRS = { ja: '', en: 'english', th: 'thai' };
var FILE_PAGES = ['domains', 'group', 'contact'];
var DIR_PAGES = ['advance', 'en'];
var HTML = '.' + 'html';

function parse(pathname) {
  var segs = String(pathname || '/').split('/');
  if (segs[0] !== '') segs.unshift('');
  var i = segs.length - 1, last = segs[i];
  var page = 'index', form = 'dir';           /* form: dir（…/）／html（….html）／bare（拡張子なし） */
  var m = /^(.*?)(\.html?)?$/i.exec(last), base = m[1], ext = m[2] || '';
  if (last === '' || base === 'index') {
    form = last === '' ? 'dir' : (ext ? 'html' : 'bare');
    i -= 1;
    if (i >= 1 && DIR_PAGES.indexOf(segs[i]) >= 0) { page = segs[i]; i -= 1; }
  } else if (FILE_PAGES.indexOf(base) >= 0) {
    page = base; form = ext ? 'html' : 'bare'; i -= 1;
  } else if (!ext && DIR_PAGES.indexOf(last) >= 0) {
    page = last; form = 'dir'; i -= 1;          /* /advance（スラッシュなし） */
  } else if (!ext && (last === DIRS.en || last === DIRS.th)) {
    form = 'dir';                               /* /english（スラッシュなし）→ その言語のトップ */
  } else {
    i -= 1;                                     /* 知らないページ（404 など）→ トップ扱い */
  }
  var lang = 'ja';
  if (i >= 1 && segs[i] === DIRS.en) { lang = 'en'; i -= 1; }
  else if (i >= 1 && segs[i] === DIRS.th) { lang = 'th'; i -= 1; }
  var prefix = segs.slice(0, i + 1).join('/') + '/';
  return { lang: lang, page: page, form: form, prefix: prefix };
}

function href(pathname, target, protocol) {
  var p = parse(pathname), file = protocol === 'file:';
  var out = p.prefix + (DIRS[target] ? DIRS[target] + '/' : '');
  var form = file && p.form === 'dir' ? 'html' : p.form;
  if (p.page === 'index') {
    out += form === 'html' ? 'index' + HTML : '';
  } else if (DIR_PAGES.indexOf(p.page) >= 0) {
    out += p.page + '/' + (form === 'html' ? 'index' + HTML : '');
  } else {
    out += p.page + (form === 'html' ? HTML : (form === 'dir' && file ? HTML : ''));
  }
  return out;
}

var api = { parse: parse, href: href };
if (typeof module === 'object' && module.exports) module.exports = api;
if (!root || !root.document) return;
root.ShiibaLang = api;

var d = root.document, de = d.documentElement, loc = root.location;
var here = parse(decodeURI(loc.pathname));
var CUR = here.lang;

var KEY = 'shiiba-th', memo = false;
function unlocked() {
  if (memo) return true;
  try { if (root.localStorage.getItem(KEY) === '1') return true; } catch (e) {}
  try { if (root.sessionStorage.getItem(KEY) === '1') return true; } catch (e) {}
  return false;
}
function unlock() {
  memo = true;
  try { root.localStorage.setItem(KEY, '1'); return; } catch (e) {}
  try { root.sessionStorage.setItem(KEY, '1'); } catch (e) {}
}
function go(target) {
  loc.href = href(decodeURI(loc.pathname), target, loc.protocol) + loc.search + loc.hash;
}

var NAME = { ja: '日本語', en: 'English', th: 'ภาษาไทย' };
var T = {
  ja: { group: '言語の切り替え', cur: '（表示中）', menu: 'Language', code: 'Code', close: '閉じる', field: 'コード' },
  en: { group: 'Language', cur: ' (current)', menu: 'Language', code: 'Code', close: 'Close', field: 'Code' },
  th: null
}[CUR];
if (!T) T = { group: '言語の切り替え', cur: '（表示中）', menu: 'Language', code: 'Code', close: '閉じる', field: 'コード' };

var kind = d.querySelector('header.hd .hd__in nav') ? 'advance'
         : d.querySelector('header .hd .brand') ? 'en'
         : d.querySelector('header .hd nav') ? 'shiiba' : '';

var css = d.createElement('style');
css.textContent = [
'.lsw{ flex:none; display:inline-flex; align-items:stretch; height:26px; margin:0; padding:0; position:relative;',
'  background:#fff; border:1px solid var(--lsw-ui); font:600 9px/1 "Inter",sans-serif; letter-spacing:.22em; text-transform:uppercase }',
'.lsw .lsw__c{ position:relative; display:flex; align-items:center; justify-content:center; min-width:30px;',
'  padding:0 7px 0 calc(7px + .22em); color:var(--lsw-sub); text-decoration:none; border:0; white-space:nowrap;',
'  -webkit-tap-highlight-color:transparent; transition:background-color .15s, color .15s }',
'.lsw .lsw__c + .lsw__c{ border-left:1px solid var(--lsw-ui) }',
'.lsw a.lsw__c::after{ content:""; position:absolute; left:0; right:0; top:50%; height:44px; transform:translateY(-50%) }',
'.lsw a.lsw__c:hover{ color:var(--lsw-ink); background:var(--lsw-face) }',
'.lsw a.lsw__c:focus-visible{ outline:2px solid var(--lsw-ring); outline-offset:2px; z-index:1 }',
'.lsw .lsw__c.is-on{ background:var(--lsw-ink); color:#fff }',
'.lsw__sr{ position:absolute !important; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0 0 0 0); white-space:nowrap; border:0 }',
'.lsw--shiiba{ --lsw-ink:#1D2443; --lsw-sub:#4A5878; --lsw-ui:#8590AC; --lsw-face:#F4F7FC; --lsw-ring:#4C639F }',
'.hd .lsw--shiiba a.lsw__c{ padding-block:0; border-bottom:0; font-size:9px; letter-spacing:.22em; color:var(--lsw-sub) }',
'.hd .lsw--shiiba a.lsw__c:hover{ color:var(--lsw-ink); border-bottom:0 }',
'.hd .lsw--shiiba a.lsw__c + .lsw__c, .hd .lsw--shiiba .lsw__c + a.lsw__c{ border-left:1px solid var(--lsw-ui) }',
'@media (max-width:720px){ .hd .lsw--shiiba{ margin-left:auto } .hd .lsw--shiiba ~ #navBtn{ margin-left:0 } }',
'@media (min-width:721px) and (max-width:1060px){ header .hd:has(.lsw){ gap:12px } header .hd:has(.lsw) nav{ gap:12px }',
'  .hd .lsw ~ #lensSw{ gap:6px; padding-inline:8px } .hd .lsw ~ #lensSw .trk{ display:none }',
'  .hd .lsw--shiiba .lsw__c{ min-width:26px; padding:0 5px 0 calc(5px + .22em) } }',
'@media (max-width:420px){ .hd .lsw--shiiba{ position:absolute; top:calc(100% + 2px); right:var(--pad, 20px); height:24px; margin:0; border-top:0; z-index:2 }',
'  .hd .lsw--shiiba a.lsw__c::after{ top:0; height:40px; transform:none } .hd .lsw--shiiba ~ #navBtn{ margin-left:auto } }',
'@media (max-width:900px){ .hd .lsw--advance{ position:absolute; top:calc(100% + 2px); right:var(--pad, 20px); height:26px; margin:0; border-top:0; z-index:2 }',
'  .hd .lsw--advance a.lsw__c::after{ top:0; height:40px; transform:none } .hd .lsw--advance::before{ top:0 } }',
'@media (max-width:560px){ .hd .lsw--en{ position:absolute; top:100%; right:var(--pad, 20px); height:26px; margin:0; border-top:0; z-index:2 }',
'  .hd .lsw--en a.lsw__c::after{ top:0; height:40px; transform:none } }',
'@media (max-width:420px){ .hd .lsw--shiiba{ transition:opacity .2s, visibility .2s } .hd .lsw--shiiba.is-away{ opacity:0; visibility:hidden; pointer-events:none } }',
'@media (max-width:900px){ .hd .lsw--advance{ transition:opacity .2s, visibility .2s } .hd .lsw--advance.is-away{ opacity:0; visibility:hidden; pointer-events:none } }',
'@media (max-width:560px){ .hd .lsw--en{ transition:opacity .2s, visibility .2s } .hd .lsw--en.is-away{ opacity:0; visibility:hidden; pointer-events:none } }',
'#navPanel li.lsw-row{ display:flex; align-items:center; justify-content:space-between; gap:14px; min-height:58px }',
'#navPanel li.lsw-row .lsw-row__t{ display:flex; align-items:center; color:#4A5878; font:600 10px/1 "Inter",sans-serif; letter-spacing:.24em; text-transform:uppercase }',
'#navPanel li.lsw-row .lsw-row__t i{ display:inline-block; width:30px; margin-right:14px; height:1px; background:#8590AC }',
'#navPanel .lsw{ height:40px; font-size:11px }',
'#navPanel .lsw .lsw__c{ min-width:52px; min-height:0; justify-content:center; font:600 11px/1 "Inter",sans-serif; letter-spacing:.22em }',
'#navPanel .lsw a.lsw__c{ color:var(--lsw-sub) }',
'#navPanel .lsw .lsw__c.is-on{ color:#fff }',
'#navPanel .lsw a.lsw__c:focus-visible{ outline-offset:-2px }',
'.lsw--advance{ --lsw-ink:#34244C; --lsw-sub:#5A5070; --lsw-ui:#8C83A1; --lsw-face:#F7F5FA; --lsw-ring:#64578A; height:30px; font-size:10px }',
'.lsw--advance::before{ content:""; position:absolute; left:-1px; top:-1px; width:5px; height:5px; background:#E43028; z-index:2; pointer-events:none }',
'.lsw--advance .lsw__c{ min-width:34px }',
'.lsw--en{ --lsw-ink:#1D2443; --lsw-sub:#4A5878; --lsw-ui:#8590AC; --lsw-face:#F4F7FC; --lsw-ring:#4C639F; height:28px; font-size:10px; letter-spacing:.2em }',
'.lsw--en .lsw__c.is-on{ box-shadow:inset 0 -3px 0 #4C639F }',
'.lsw--en .lsw__c{ min-width:32px }',
'@media (min-width:901px) and (max-width:1060px){ header .hd:has(.lsw--en){ gap:14px } header .hd:has(.lsw--en) nav{ gap:14px } .hd .lsw--en .lsw__c{ min-width:26px; padding:0 5px 0 calc(5px + .2em) } }',
'.lsw-pop{ position:absolute; z-index:120; width:min(280px, calc(100vw - 32px)); background:#fff; color:#1D2443;',
'  border:1px solid #1D2443; box-shadow:0 10px 28px rgba(19,31,66,.18); font-family:"Inter","Noto Sans JP",sans-serif }',
'.lsw-pop::before,.lsw-pop::after{ content:""; position:absolute; width:7px; height:7px; border:1px solid #1D2443; background:#fff }',
'.lsw-pop::before{ left:-4px; top:-4px } .lsw-pop::after{ right:-4px; bottom:-4px }',
'.lsw-pop__hd{ display:flex; align-items:center; justify-content:space-between; height:30px; padding-left:12px; border-bottom:1px solid #C7D5EC }',
'.lsw-pop__hd b{ font:700 8px/1 "Syncopate","Inter",sans-serif; letter-spacing:.3em; color:#4A5878; text-transform:uppercase }',
'.lsw-pop__x{ display:flex; align-items:center; justify-content:center; width:44px; height:30px; margin:0; padding:0; border:0; border-left:1px solid #C7D5EC;',
'  background:#fff; color:#1D2443; cursor:pointer; -webkit-appearance:none; appearance:none }',
'.lsw-pop__x:hover{ background:#F4F7FC }',
'.lsw-pop__x:focus-visible{ outline:2px solid #4C639F; outline-offset:-2px }',
'.lsw-pop__x svg{ width:10px; height:10px }',
'.lsw-pop__bd{ padding:12px }',
'.lsw-pop input{ display:block; width:100%; box-sizing:border-box; height:42px; margin:0; padding:0 12px; border:1px solid #8590AC; border-radius:0;',
'  background:#fff; color:#1D2443; font:400 16px/1 "Inter","Noto Sans JP",sans-serif; letter-spacing:.14em; -webkit-appearance:none; appearance:none }',
'.lsw-pop input:focus{ outline:2px solid #4C639F; outline-offset:1px; border-color:#1D2443 }',
'.lsw-tap{ -webkit-tap-highlight-color:transparent; touch-action:manipulation; -webkit-user-select:none; user-select:none }',
'@media (prefers-reduced-motion: no-preference){ .lsw-pop{ animation:lswIn .18s cubic-bezier(.22,.61,.36,1) } }',
'@keyframes lswIn{ from{ opacity:0; transform:translateY(4px) } to{ opacity:1; transform:none } }'
].join('\n');
d.head.appendChild(css);

function langs() {
  var l = ['ja', 'en'];
  if (CUR === 'th') l.push('th');
  return l;
}
function makeSwitch(cls) {
  var box = d.createElement('div'), list = langs();
  box.className = 'lsw ' + cls + (list.length > 2 ? ' lsw--3' : '');
  box.setAttribute('role', 'group');
  box.setAttribute('aria-label', T.group);
  list.forEach(function (lg) {
    var on = lg === CUR, el = d.createElement(on ? 'span' : 'a');
    el.className = 'lsw__c' + (on ? ' is-on' : '');
    el.setAttribute('lang', lg);
    if (on) el.setAttribute('aria-current', 'true');
    else {
      el.href = href(decodeURI(loc.pathname), lg, loc.protocol) + loc.search + loc.hash;
      el.setAttribute('hreflang', lg);
    }
    el.innerHTML = '<span aria-hidden="true">' + lg.toUpperCase() + '</span><span class="lsw__sr">' + lg.toUpperCase() + ' ' + NAME[lg] + (on ? T.cur : '') + '</span>';
    box.appendChild(el);
  });
  return box;
}
var switches = [];
function mount() {
  switches.forEach(function (s) { s.parentNode && s.parentNode.removeChild(s); });
  switches = [];
  var nav, sw;
  if (kind === 'shiiba') {
    nav = d.querySelector('header .hd nav');
    sw = makeSwitch('lsw--shiiba'); nav.parentNode.insertBefore(sw, nav.nextSibling); switches.push(sw);
    var panelUl = d.querySelector('#navPanel ul');
    if (panelUl) mountMenu(panelUl);
  } else if (kind === 'advance') {
    nav = d.querySelector('header.hd .hd__in nav');
    sw = makeSwitch('lsw--advance'); nav.parentNode.insertBefore(sw, nav.nextSibling); switches.push(sw);
  } else if (kind === 'en') {
    nav = d.querySelector('header .hd nav');
    sw = makeSwitch('lsw--en'); nav.parentNode.insertBefore(sw, nav.nextSibling); switches.push(sw);
  }
}
function mountMenu(ul) {
  var li = d.createElement('li');
  li.className = 'lsw-row';
  li.innerHTML = '<span class="lsw-row__t" aria-hidden="true"><i></i>' + T.menu + '</span>';
  var sw = makeSwitch('lsw--shiiba');
  li.appendChild(sw); ul.appendChild(li); switches.push(li);
}
if (kind) mount();
function away() { var y = root.scrollY > 8; switches.forEach(function (s) { s.classList.toggle('is-away', y); }); }
if (kind) { away(); root.addEventListener('scroll', away, { passive: true }); }

if (kind === 'shiiba' && !d.getElementById('navPanel') && root.MutationObserver) {
  var mo = new root.MutationObserver(function () {
    var ul = d.querySelector('#navPanel ul');
    if (ul) { mo.disconnect(); mountMenu(ul); }
  });
  mo.observe(d.body || de, { childList: true });
  root.addEventListener('load', function () { mo.disconnect(); });
}

var CODE = 'tai0418';
function norm(s) {
  s = String(s || '');
  if (s.normalize) s = s.normalize('NFKC');               /* 全角英数・半角カナを揃える */
  s = s.replace(/[ァ-ヶ]/g, function (c) { return String.fromCharCode(c.charCodeAt(0) - 0x60); });
  return s.toLowerCase().replace(/[\s　\-_.・]/g, '');
}
function ok(s) { var v = norm(s); return v === CODE || v === 'たい0418'; }
function fire() { return;
  if (CUR === 'th') { if (!unlocked()) { unlock(); mount(); away(); } closePop(); return; }
  unlock(); go('th');
}
function typing(t) {
  if (!t || !t.tagName) return false;
  var tg = t.tagName.toLowerCase();
  return tg === 'input' || tg === 'textarea' || tg === 'select' || t.isContentEditable;
}
var buf = '';
root.addEventListener('keydown', function (e) {
  if (e.ctrlKey || e.metaKey || e.altKey || e.isComposing || typing(e.target) || typing(d.activeElement)) return;
  if (!e.key || e.key.length !== 1) return;
  buf = (buf + e.key.toLowerCase()).slice(-CODE.length);
  if (buf === CODE) { buf = ''; fire(); }
});

var cr = d.querySelector('footer .f-cr, footer .ft__cr, .f-cr, .ft__cr');
var pop = null, lastFocus = null, taps = [];
if (cr) {
  cr.classList.add('lsw-tap');
  cr.addEventListener('click', function () {
    var now = Date.now();
    taps = taps.filter(function (t) { return now - t < 2000; });
    taps.push(now);
    if (false) { openPop(); }
  });
}
function openPop() {
  if (pop) { pop.querySelector('input').focus(); return; }
  lastFocus = d.activeElement;
  pop = d.createElement('div');
  pop.className = 'lsw-pop';
  pop.setAttribute('role', 'dialog');
  pop.setAttribute('aria-modal', 'false');
  pop.setAttribute('aria-labelledby', 'lswPopT');
  pop.innerHTML =
    '<div class="lsw-pop__hd"><b id="lswPopT">' + T.code + '</b>' +
    '<button type="button" class="lsw-pop__x" aria-label="' + T.close + '">' +
    '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M1 1l8 8M9 1l-8 8" fill="none" stroke="currentColor" stroke-width="1.2"/></svg></button></div>' +
    '<div class="lsw-pop__bd"><input type="text" id="lswPopIn" aria-label="' + T.field + '" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="go" maxlength="16"></div>';
  d.body.appendChild(pop);
  place();
  var inp = pop.querySelector('input');
  function check() { if (ok(inp.value)) fire(); }
  inp.addEventListener('input', function (e) { if (!e.isComposing) check(); });
  inp.addEventListener('compositionend', check);
  inp.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.isComposing) { e.preventDefault(); check(); }
  });
  pop.querySelector('.lsw-pop__x').addEventListener('click', closePop);
  pop.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { e.stopPropagation(); closePop(); }
    if (e.key === 'Tab') {                                   /* 札の中でフォーカスを回す */
      var f = [inp, pop.querySelector('.lsw-pop__x')], i = f.indexOf(d.activeElement);
      if (i >= 0) { e.preventDefault(); f[(i + (e.shiftKey ? f.length - 1 : 1)) % f.length].focus(); }
    }
  });
  d.addEventListener('pointerdown', outside, true);
  root.addEventListener('resize', place);
  inp.focus({ preventScroll: true });
}
function outside(e) { if (pop && !pop.contains(e.target) && !(cr && cr.contains(e.target))) closePop(); }
function place() {
  if (!pop || !cr) return;
  var r = cr.getBoundingClientRect(), b = pop.offsetParent ? pop.offsetParent.getBoundingClientRect() : { top: 0, left: 0 };
  if (!pop.offsetParent || pop.offsetParent === d.body && root.getComputedStyle(d.body).position === 'static') {
    b = { top: -root.scrollY, left: -root.scrollX };
  }
  var w = pop.offsetWidth, h = pop.offsetHeight, vw = de.clientWidth;
  var x = Math.max(16, Math.min(r.left, vw - w - 16));
  var y = r.top - h - 12;
  if (y < 70) y = r.bottom + 12;                            /* 上に余地が無ければ下に出す */
  pop.style.left = Math.round(x - b.left) + 'px';
  pop.style.top = Math.round(y - b.top) + 'px';
}
function closePop() {
  if (!pop) return;
  d.removeEventListener('pointerdown', outside, true);
  root.removeEventListener('resize', place);
  pop.parentNode && pop.parentNode.removeChild(pop);
  pop = null;
  if (lastFocus && lastFocus.focus && lastFocus !== d.body) { try { lastFocus.focus({ preventScroll: true }); } catch (e) {} }
}
root.addEventListener('keydown', function (e) { if (pop && e.key === 'Escape') closePop(); });
root.addEventListener('pageshow', function (e) { if (e.persisted) { closePop(); if (kind) { mount(); away(); } } });
})(typeof window !== 'undefined' ? window : null);
