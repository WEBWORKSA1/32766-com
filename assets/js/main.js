/* 32766 — Limits Lab | site script (no dependencies) */
(function(){
  'use strict';
  var $=function(s,c){return (c||document).querySelector(s)};
  var $$=function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))};
  function store(k,v){try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v)}catch(e){return null}}
  function sstore(k,v){try{if(v===undefined)return sessionStorage.getItem(k);sessionStorage.setItem(k,v)}catch(e){return null}}
  window.L32={$:$,$$:$$,store:store};

  /* ---------- Private inbox routing: the address is never written in any page ---------- */
  var _q=[118,116,120,53,119,114,122,118,124,91,42,122,104,112,105,116,108,121,126,108];
  function inbox(){return String.fromCharCode.apply(null,_q.map(function(c){return c^27})).split('').reverse().join('')}
  function endpoint(){return 'https://formsubmit.co/ajax/'+inbox()}
  $$('[data-mail]').forEach(function(a){
    a.addEventListener('click',function(e){
      e.preventDefault();
      window.location.href='mailto:'+inbox()+'?subject='+encodeURIComponent(a.getAttribute('data-mail')||'Inquiry from 32766.com');
    });
  });

  /* ---------- Toast ---------- */
  var toastEl;
  function toast(msg){
    if(!toastEl){toastEl=document.createElement('div');toastEl.className='toast';toastEl.setAttribute('role','status');document.body.appendChild(toastEl)}
    toastEl.textContent=msg;toastEl.classList.add('show');
    clearTimeout(toastEl._t);toastEl._t=setTimeout(function(){toastEl.classList.remove('show')},1800);
  }
  window.L32.toast=toast;
  window.L32.copy=function(text){
    if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(text).then(function(){toast('Copied')},function(){fallback()})}else fallback();
    function fallback(){var t=document.createElement('textarea');t.value=text;document.body.appendChild(t);t.select();try{document.execCommand('copy');toast('Copied')}catch(e){toast('Copy failed')}document.body.removeChild(t)}
  };

  /* ---------- Theme ---------- */
  var root=document.documentElement,saved=store('l32-theme');
  if(saved)root.setAttribute('data-theme',saved);
  var tb=$('#themeBtn');
  if(tb)tb.addEventListener('click',function(){var t=root.getAttribute('data-theme')==='light'?'dark':'light';root.setAttribute('data-theme',t);store('l32-theme',t)});

  /* ---------- Nav ---------- */
  var here=(location.pathname.split('/').pop()||'index.html');
  $$('#menu a').forEach(function(a){
    var h=a.getAttribute('href');
    if(h===here||(a.dataset.group&&document.body.dataset.group===a.dataset.group)){a.classList.add('active');a.setAttribute('aria-current','page')}
  });
  var bg=$('#burger'),menu=$('#menu');
  if(bg&&menu)bg.addEventListener('click',function(){var o=menu.classList.toggle('open');bg.setAttribute('aria-expanded',o)});

  /* ---------- Reveal ---------- */
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){en.target.classList.add('in');io.unobserve(en.target)}})},{threshold:.08});
    $$('.reveal').forEach(function(el){io.observe(el)});
  }else $$('.reveal').forEach(function(el){el.classList.add('in')});

  /* ---------- Cookie notice ---------- */
  var ck=$('#cookie');
  if(ck&&!store('l32-cookie'))ck.classList.add('show');
  $$('[data-cookie]').forEach(function(b){b.addEventListener('click',function(){store('l32-cookie',b.getAttribute('data-cookie'));ck.classList.remove('show')})});
  $$('.year').forEach(function(el){el.textContent=new Date().getFullYear()});

  /* ---------- Prefill from query (?need=search etc.) ---------- */
  var qs={};location.search.replace(/^\?/,'').split('&').forEach(function(p){if(!p)return;var kv=p.split('=');qs[decodeURIComponent(kv[0])]=decodeURIComponent((kv[1]||'').replace(/\+/g,' '))});
  if(qs.need){$$('input[name="need"]').forEach(function(r){if(r.value===qs.need)r.checked=true})}
  if(qs.role){var rs=$('select[name="role"]');if(rs)rs.value=qs.role}
  if(qs.tier){var ts=$('select[name="package"]');if(ts)ts.value=qs.tier}

  /* ---------- Forms (AJAX relay; one private inbox) ---------- */
  function serialize(form){
    var data={};
    $$('input,select,textarea',form).forEach(function(el){
      if(!el.name||el.disabled)return;
      if((el.type==='checkbox'||el.type==='radio')&&!el.checked)return;
      if(data[el.name]){data[el.name]+=', '+el.value}else data[el.name]=el.value;
    });
    return data;
  }
  function validStep(scope){
    var ok=true;
    $$('input,select,textarea',scope).forEach(function(el){
      if(ok&&el.willValidate&&!el.checkValidity()){el.reportValidity();ok=false}
    });
    return ok;
  }
  $$('form.js-form').forEach(function(form){
    form.addEventListener('submit',function(e){
      e.preventDefault();
      var msg=$('.form-msg',form),btn=$('button[type=submit]',form);
      if(!validStep(form))return;
      var data=serialize(form);
      if(data._honey){return}
      delete data._honey;
      data._subject='[32766.com] '+(form.getAttribute('data-subject')||'Website form');
      data._template='table';data._captcha='false';
      data.page=location.href;data.submitted_at=new Date().toISOString();
      if(btn){btn.disabled=true;btn._t=btn.textContent;btn.textContent='Sending…'}
      if(msg){msg.className='form-msg';msg.textContent=''}
      fetch(endpoint(),{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(data)})
        .then(function(r){return r.json().catch(function(){return {}}).then(function(j){if(!r.ok||j.success==='false'||j.success===false)throw new Error(j.message||'Failed');return j})})
        .then(function(){
          if(msg){msg.className='form-msg ok';msg.textContent=form.getAttribute('data-ok')||'Thanks — received. We reply within one business day.'}
          var after=form.getAttribute('data-after');if(after){var el=document.getElementById(after);if(el)el.hidden=false}
          form.reset();
          if(form.classList.contains('multistep'))goStep(form,0);
          try{if(window.gtag)gtag('event','generate_lead',{form:form.getAttribute('data-subject')})}catch(x){}
        })
        .catch(function(){
          if(msg){msg.className='form-msg err';msg.innerHTML='Could not send right now. Please try again in a minute, or use the <a href="contact.html">contact page</a>.'}
        })
        .then(function(){if(btn){btn.disabled=false;btn.textContent=btn._t}});
    });
  });

  /* ---------- Multi-step forms ---------- */
  function goStep(form,i){
    var steps=$$('.step',form),bar=$$('.steps-bar i',form);
    steps.forEach(function(s,k){s.classList.toggle('on',k===i)});
    bar.forEach(function(b,k){b.classList.toggle('on',k<=i)});
    form._step=i;
    var lbl=$('.step-count',form);if(lbl)lbl.textContent='Step '+(i+1)+' of '+steps.length;
  }
  $$('form.multistep').forEach(function(form){
    goStep(form,0);
    form.addEventListener('click',function(e){
      var t=e.target.closest('[data-next],[data-prev]');if(!t)return;
      e.preventDefault();
      var i=form._step||0,steps=$$('.step',form);
      if(t.hasAttribute('data-next')){if(!validStep(steps[i]))return;goStep(form,Math.min(i+1,steps.length-1))}
      else goStep(form,Math.max(i-1,0));
      var top=form.getBoundingClientRect().top+window.scrollY-90;if(window.scrollY>top)window.scrollTo(0,top);
    });
    $$('.step[data-auto] input[type=radio]',form).forEach(function(r){
      r.addEventListener('change',function(){setTimeout(function(){var i=form._step||0;if(i<$$('.step',form).length-1)goStep(form,i+1)},220)});
    });
  });

  /* ---------- Donation amount "other" ---------- */
  $$('input[name="amount"]').forEach(function(r){r.addEventListener('change',function(){var o=$('#amountOther');if(o){o.hidden=r.value!=='Other';if(r.value==='Other')o.focus()}})});

  /* ---------- YouTube facades (privacy-enhanced, load on click) ---------- */
  $$('.vid[data-yt]').forEach(function(v){
    var id=v.getAttribute('data-yt');
    v.style.backgroundImage='url(https://i.ytimg.com/vi/'+id+'/hqdefault.jpg)';
    var b=$('button',v);
    if(b)b.addEventListener('click',function(){
      var f=document.createElement('iframe');
      f.src='https://www.youtube-nocookie.com/embed/'+id+'?autoplay=1&rel=0';
      f.title=b.textContent.trim();f.allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';f.allowFullscreen=true;
      v.innerHTML='';v.appendChild(f);
    });
  });

  /* ---------- Lead nudge: once per session, after 45s or 55% scroll ---------- */
  var nudge=$('#nudge');
  if(nudge&&!sstore('l32-nudge')&&!document.body.hasAttribute('data-no-nudge')){
    var shown=false;
    function showNudge(){if(shown)return;shown=true;nudge.hidden=false;sstore('l32-nudge','1')}
    setTimeout(showNudge,45000);
    window.addEventListener('scroll',function(){var h=document.documentElement;if((h.scrollTop+h.clientHeight)/h.scrollHeight>.55)showNudge()},{passive:true});
    $$('[data-nudge-close]').forEach(function(b){b.addEventListener('click',function(){nudge.hidden=true})});
  }

  /* ---------- Table filter ---------- */
  $$('[data-filter-table]').forEach(function(inp){
    var tbl=$(inp.getAttribute('data-filter-table'));if(!tbl)return;
    inp.addEventListener('input',function(){var q=inp.value.toLowerCase().trim();$$('tbody tr',tbl).forEach(function(tr){tr.hidden=q&&tr.textContent.toLowerCase().indexOf(q)<0})});
  });

  /* ---------- Contest countdown (end of current month, 23:59:59 ET ≈ UTC-5) ---------- */
  var cd=$('#countdown');
  if(cd){
    (function tick(){
      var now=new Date(),y=now.getUTCFullYear(),m=now.getUTCMonth();
      var end=new Date(Date.UTC(y,m+1,1,4,59,59));if(end<now)end=new Date(Date.UTC(y,m+2,1,4,59,59));
      var ms=end-now,d=Math.floor(ms/864e5),h=Math.floor(ms%864e5/36e5),mi=Math.floor(ms%36e5/6e4),s=Math.floor(ms%6e4/1e3);
      cd.textContent=d+'d '+('0'+h).slice(-2)+'h '+('0'+mi).slice(-2)+'m '+('0'+s).slice(-2)+'s';
      setTimeout(tick,1000);
    })();
  }
})();
