/* 32766 — Limits Lab | text tools. Everything runs in the browser; nothing you type is uploaded. */
(function(){
  'use strict';
  var $=function(s,c){return (c||document).querySelector(s)};
  var $$=function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))};
  var fmt=function(n){return (Math.round(n)||0).toLocaleString('en-US')};
  var enc=window.TextEncoder?new TextEncoder():null;
  var segG=null,segW=null,segS=null;
  try{segG=new Intl.Segmenter(undefined,{granularity:'grapheme'});segW=new Intl.Segmenter(undefined,{granularity:'word'});segS=new Intl.Segmenter(undefined,{granularity:'sentence'})}catch(e){}
  var reEmoji;try{reEmoji=new RegExp('\\p{Extended_Pictographic}','u')}catch(e){reEmoji=/[\uD83C-\uDBFF][\uDC00-\uDFFF]/}

  function graphemes(t){if(!t)return [];if(segG){var a=[];for(var s of segG.segment(t))a.push(s.segment);return a}return Array.from(t)}
  function utf8(t){if(enc)return enc.encode(t).length;return unescape(encodeURIComponent(t)).length}
  function words(t){
    if(!t)return [];
    if(segW){var a=[];for(var s of segW.segment(t))if(s.isWordLike)a.push(s.segment);return a}
    return t.match(/[A-Za-z0-9\u00C0-\u024F'’-]+/g)||[];
  }
  function sentences(t){
    if(!t.trim())return 0;
    if(segS){var n=0;for(var s of segS.segment(t))if(s.segment.trim())n++;return n}
    return (t.match(/[^.!?]+([.!?]+|$)/g)||[]).filter(function(x){return x.trim()}).length;
  }
  var CJK=/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uac00-\ud7af\uf900-\ufaff]/g;
  function tokRaw(t){
    if(!t)return 0;
    var cjk=(t.match(CJK)||[]).length,rest=t.replace(CJK,'');
    var w=(rest.match(/[A-Za-z\u00C0-\u024F\u0370-\u03FF\u0400-\u04FF0-9]+/g)||[]).length;
    var p=(rest.match(/[^\sA-Za-z0-9\u00C0-\u024F\u0370-\u03FF\u0400-\u04FF]/g)||[]).length;
    return (rest.length/4.2+(w*1.2+p*0.4))/2+cjk*1.2;
  }
  function tokens(t){
    if(!t)return 0;return Math.max(1,Math.round(tokRaw(t)));
  }
  function xcount(t){
    if(!t)return 0;var n=0;
    t=t.replace(/\bhttps?:\/\/[^\s]+|\b(?:[a-z0-9-]+\.)+(?:com|net|org|io|co|ai|app|dev|me|info|biz|ca|uk|in|us|de|fr|au)\b(?:\/[^\s]*)?/gi,function(){n+=23;return ''});
    graphemes(t).forEach(function(g){
      if(reEmoji.test(g)){n+=2;return}
      var cp=g.codePointAt(0);
      n+=(cp<=0x10FF||(cp>=0x2000&&cp<=0x200D)||(cp>=0x2010&&cp<=0x201F)||(cp>=0x2032&&cp<=0x2037))?1:2;
    });
    return n;
  }
  var GSM='@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !"#¤%&\'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà';
  var GSMX='^{}\\[~]|€\f';
  function gsm(t){
    var units=0,bad=[];
    Array.from(t).forEach(function(ch){if(GSM.indexOf(ch)>-1)units++;else if(GSMX.indexOf(ch)>-1)units+=2;else bad.push(ch)});
    if(!bad.length){return {enc:'GSM-7',units:units,single:160,multi:153,segments:units===0?0:(units<=160?1:Math.ceil(units/153)),bad:[]}}
    var u=t.length;return {enc:'UCS-2',units:u,single:70,multi:67,segments:u===0?0:(u<=70?1:Math.ceil(u/67)),bad:bad};
  }
  function hashtags(t){return (t.match(/(^|\s)#[^\s#]+/g)||[]).length}
  function syllables(w){w=w.toLowerCase().replace(/[^a-z]/g,'');if(!w)return 0;if(w.length<=3)return 1;w=w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/,'').replace(/^y/,'');var m=w.match(/[aeiouy]{1,2}/g);return m?m.length:1}
  function analyze(t){
    t=t||'';var g=graphemes(t),w=words(t);
    var noSpace=g.filter(function(x){return !/^\s+$/.test(x)}).length;
    var emoji=g.filter(function(x){return reEmoji.test(x)}).length;
    var paras=t.split(/\n\s*\n/).filter(function(p){return p.trim()}).length;
    var lines=t?t.split(/\r\n|\r|\n/).length:0;
    var uniq={};w.forEach(function(x){uniq[x.toLowerCase()]=1});
    var sent=sentences(t);
    var syl=0;w.forEach(function(x){syl+=syllables(x)});
    var fre=w.length&&sent?206.835-1.015*(w.length/sent)-84.6*(syl/w.length):null;
    return {
      text:t,chars:g.length,noSpace:noSpace,words:w.length,wordList:w,sentences:sent,paragraphs:paras,lines:lines,
      codepoints:Array.from(t).length,utf16:t.length,bytes:utf8(t),utf32:Array.from(t).length*4,
      tokens:tokens(t),x:xcount(t),emoji:emoji,unique:Object.keys(uniq).length,
      letters:(t.match(/\p{L}/gu)||[]).length,digits:(t.match(/\p{N}/gu)||[]).length,spaces:(t.match(/\s/g)||[]).length,
      hashtags:hashtags(t),gsm:gsm(t),readMin:w.length/238,speakMin:w.length/150,syllables:syl,fre:fre,
      avgWord:w.length?w.reduce(function(a,x){return a+x.length},0)/w.length:0
    };
  }
  function measure(L,a){
    switch(L.m){
      case 'b':return a.bytes;case 'u16':return a.utf16;case 'x':return a.x;case 'tok':return a.tokens;
      case 'ht':return a.hashtags;case 'gsm':return a.gsm.units;default:return a.chars;
    }
  }
  function limitFor(L,a){return L.m==='gsm'&&a.gsm.enc==='UCS-2'?70:L.v}
  function mins(m){if(m<1)return Math.max(1,Math.round(m*60))+' sec';var mm=Math.floor(m),s=Math.round((m-mm)*60);return mm+' min'+(s?' '+s+' s':'')}
  function setMeter(el,used,limit){
    if(!el)return;var p=limit?used/limit:0,i=$('i',el);
    if(i)i.style.width=Math.min(100,p*100)+'%';
    el.classList.toggle('warn',p>.9&&p<=1);el.classList.toggle('over',p>1);
  }
  function debounce(fn,ms){var t;return function(){clearTimeout(t);t=setTimeout(fn,ms)}}
  window.L32T={analyze:analyze,tokens:tokens,gsm:gsm,utf8:utf8,graphemes:graphemes,xcount:xcount};

  function toast(m){if(window.L32&&L32.toast)L32.toast(m)}
  function copy(t){if(window.L32&&L32.copy)L32.copy(t)}
  function download(name,text,type){var b=new Blob([text],{type:type||'text/plain;charset=utf-8'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=name;document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},500)}
  function persist(ta,key){
    if(!ta)return;try{var v=sessionStorage.getItem(key);if(v&&!ta.value)ta.value=v}catch(e){}
    ta.addEventListener('input',debounce(function(){try{sessionStorage.setItem(key,ta.value)}catch(e){}},400));
  }
  function wireBasics(ta,run){
    $$('[data-act]').forEach(function(b){
      b.addEventListener('click',function(){
        var a=b.getAttribute('data-act');
        if(a==='clear'){ta.value='';ta.focus()}
        else if(a==='copy'){copy(ta.value)}
        else if(a==='sample'){ta.value=b.getAttribute('data-sample')||SAMPLE}
        else if(a==='paste'&&navigator.clipboard&&navigator.clipboard.readText){navigator.clipboard.readText().then(function(t){ta.value=t;run()});return}
        else if(a==='download'){download('32766-text.txt',ta.value)}
        run();
      });
    });
  }
  var SAMPLE='Stay one byte under the limit. 🚀 Every platform caps your text somewhere: 280 on X, 2,200 on Instagram, 160 in an SMS, and 32,766 bytes for a single term in Apache Lucene. Paste anything here to see where it fits — and where it breaks.';

  /* ================= Counter + limit checker (home, character, word, byte counters) ================= */
  var ta=$('#txt');
  if(ta){
    persist(ta,'l32-txt');
    var LIM=(window.LIMITS||[]).filter(function(L){return L.m!=='none'});
    var lcList=$('#lcList'),lcSearch=$('#lcSearch'),lcCat=$('#lcCat'),lcSum=$('#lcSum');
    var custom=$('#customLimit'),customM=$('#customMethod');
    var big=$('#bigMeter'),fix=$('#fixcta');
    if(lcCat&&window.LIMIT_CATS){var here=location.pathname.split('/').pop();window.LIMIT_CATS.forEach(function(c){var o=document.createElement('option');o.value=c[0];o.textContent=c[1];lcCat.appendChild(o);if(c[2]===here)lcCat.value=c[0]})}
    function renderChecker(a){
      if(!lcList)return;
      var q=(lcSearch&&lcSearch.value||'').toLowerCase(),cat=lcCat?lcCat.value:'pop';
      var rows=LIM.filter(function(L){
        if(cat==='pop'&&!L.pop)return false;
        if(cat!=='pop'&&cat!=='all'&&L.c!==cat)return false;
        return !q||(L.p+' '+L.f).toLowerCase().indexOf(q)>-1;
      });
      var fits=0,over=0,html='';
      rows.forEach(function(L){
        var used=measure(L,a),lim=limitFor(L,a),p=used/lim,st=p>1?'over':(p>.9?'warn':'fit');
        if(p>1)over++;else fits++;
        var unit=L.u==='hashtags'?'#':(L.m==='b'?'B':(L.m==='tok'?'tok':''));
        html+='<li><span class="nm"><b>'+L.p+'</b> — '+L.f+'<small>'+(L.k==='hard'?'Hard limit':(L.k==='rec'?'Recommended / display cut-off':'Default (configurable)'))+(L.m==='x'?' · X weighted count':'')+(L.m==='b'?' · UTF-8 bytes':'')+(L.m==='u16'?' · UTF-16 units':'')+(L.m==='tok'?' · estimated tokens':'')+(L.m==='gsm'?' · '+a.gsm.enc:'')+'</small></span>'+
          '<span class="vv"><span class="pill '+st+'">'+(p>1?'over by '+fmt(used-lim):(fmt(lim-used)+' left'))+'</span><br>'+fmt(used)+' / '+fmt(lim)+' '+unit+'</span>'+
          '<span class="meter '+(st==='fit'?'':st)+'"><i style="width:'+Math.min(100,p*100)+'%"></i></span></li>';
      });
      lcList.innerHTML=html||'<li>No limits match that search.</li>';
      if(lcSum)lcSum.innerHTML=a.text?'Your text fits <b>'+fits+'</b> of '+rows.length+' limits shown'+(over?' — <b style="color:var(--over)">'+over+' over</b>.':'.'):'Paste or type text to check it against '+rows.length+' limits.';
    }
    function run(){
      var a=analyze(ta.value);
      $$('[data-k]').forEach(function(el){
        var k=el.getAttribute('data-k'),v;
        if(k==='readMin'||k==='speakMin')v=a.words?mins(a[k]):'0 sec';
        else if(k==='fre')v=a.fre===null?'—':Math.max(0,Math.min(100,a.fre)).toFixed(0);
        else if(k==='avgWord')v=a.avgWord.toFixed(1);
        else if(k==='pages')v=(a.words/500).toFixed(1);
        else if(k==='gsmSeg')v=a.gsm.segments+' ('+a.gsm.enc+')';
        else v=fmt(a[k]);
        el.textContent=v;
      });
      if(big){
        var lim=+big.getAttribute('data-limit'),m=big.getAttribute('data-method')||'b';
        var used=m==='u16'?a.utf16:(m==='g'?a.chars:a.bytes);
        $('.used',big).textContent=fmt(used);
        var left=$('.left',big);if(left)left.textContent=used>lim?'Over by '+fmt(used-lim):fmt(lim-used)+' to spare';
        setMeter($('.meter',big),used,lim);
        if(fix)fix.classList.toggle('show',used>lim);
      }
      if(custom){
        var cl=+custom.value||0,cm=customM?customM.value:'g',cu=cm==='b'?a.bytes:(cm==='w'?a.words:(cm==='tok'?a.tokens:(cm==='u16'?a.utf16:a.chars)));
        var co=$('#customOut');if(co)co.textContent=cl?(cu<=cl?fmt(cl-cu)+' remaining':'Over by '+fmt(cu-cl)):'Set a limit';
        setMeter($('#customMeter'),cu,cl||1);
      }
      renderChecker(a);
      if(window.L32Extra)window.L32Extra(a);
    }
    var r=debounce(run,60);
    ta.addEventListener('input',r);
    [lcSearch,lcCat,custom,customM].forEach(function(el){if(el){el.addEventListener('input',r);el.addEventListener('change',r)}});
    wireBasics(ta,run);
    run();
  }

  /* ---------- Word counter extras: keyword density ---------- */
  var kw=$('#kwTable');
  if(kw){
    var STOP=('a about above after again against all am an and any are as at be because been before being below between both but by can could did do does doing down during each few for from further had has have having he her here hers herself him himself his how i if in into is it its itself just me more most my myself no nor not now of off on once only or other our ours ourselves out over own same she should so some such than that the their theirs them themselves then there these they this those through to too under until up very was we were what when where which while who whom why will with you your yours yourself yourselves').split(' ');
    var stopSet={};STOP.forEach(function(w){stopSet[w]=1});
    window.L32Extra=function(a){
      var f={},bi={},ws=a.wordList.map(function(w){return w.toLowerCase()});
      ws.forEach(function(w,i){if(!stopSet[w]&&w.length>1&&!/^\d+$/.test(w))f[w]=(f[w]||0)+1;if(i&&!stopSet[w]&&!stopSet[ws[i-1]]){var b=ws[i-1]+' '+w;bi[b]=(bi[b]||0)+1}});
      function top(o,n){return Object.keys(o).map(function(k){return [k,o[k]]}).sort(function(x,y){return y[1]-x[1]}).slice(0,n)}
      var t1=top(f,12),t2=top(bi,8).filter(function(x){return x[1]>1});
      var h='<table><thead><tr><th>Keyword</th><th style="text-align:right">Count</th><th style="text-align:right">Density</th></tr></thead><tbody>';
      if(!t1.length)h+='<tr><td colspan="3" class="muted">Keywords appear here as you type.</td></tr>';
      t1.forEach(function(x){h+='<tr><td>'+x[0].replace(/</g,'&lt;')+'</td><td class="n">'+x[1]+'</td><td class="n">'+(x[1]/a.words*100).toFixed(1)+'%</td></tr>'});
      t2.forEach(function(x){h+='<tr><td>'+x[0].replace(/</g,'&lt;')+' <small>(phrase)</small></td><td class="n">'+x[1]+'</td><td class="n">—</td></tr>'});
      kw.innerHTML=h+'</tbody></table>';
    };
  }

  /* ---------- Byte counter extras: per-character breakdown + trim ---------- */
  var bt=$('#byteTable');
  if(bt){
    var prev=window.L32Extra;
    window.L32Extra=function(a){
      if(prev)prev(a);
      var gs=graphemes(a.text),rows=[],seen={};
      gs.forEach(function(g){var b=utf8(g);if(b>1&&!seen[g]){seen[g]=1;rows.push([g,b,g.length,Array.from(g).map(function(c){return 'U+'+c.codePointAt(0).toString(16).toUpperCase().padStart(4,'0')}).join(' ')])}});
      rows.sort(function(x,y){return y[1]-x[1]});
      var mb=0;gs.forEach(function(g){if(utf8(g)>1)mb+=utf8(g)});
      var h='<p class="muted" style="margin:0 0 8px">'+fmt(a.bytes)+' bytes total · '+fmt(mb)+' bytes come from '+fmt(gs.filter(function(g){return utf8(g)>1}).length)+' multi-byte characters.</p><div class="tbl-wrap"><table><thead><tr><th>Char</th><th>Code points</th><th style="text-align:right">UTF-8 bytes</th><th style="text-align:right">UTF-16 units</th></tr></thead><tbody>';
      if(!rows.length)h+='<tr><td colspan="4" class="muted">No multi-byte characters — every character is 1 byte (plain ASCII).</td></tr>';
      rows.slice(0,40).forEach(function(r){h+='<tr><td style="font-size:1.2rem">'+r[0].replace(/</g,'&lt;')+'</td><td class="mono">'+r[3]+'</td><td class="n">'+r[1]+'</td><td class="n">'+r[2]+'</td></tr>'});
      bt.innerHTML=h+'</tbody></table></div>';
    };
    var trimBtn=$('#trimBytes');
    if(trimBtn)trimBtn.addEventListener('click',function(){
      var lim=+($('#trimTo')&&$('#trimTo').value)||32766;ta.value=trimToBytes(ta.value,lim);ta.dispatchEvent(new Event('input'));toast('Trimmed to '+fmt(utf8(ta.value))+' bytes');
    });
  }
  function trimToBytes(t,lim){var out='',n=0;for(var g of graphemes(t)){var b=utf8(g);if(n+b>lim)break;out+=g;n+=b}return out}

  /* ================= Token counter ================= */
  var tk=$('#tokTxt');
  if(tk){
    persist(tk,'l32-tok');
    function runT(){
      var a=analyze(tk.value),ctx=+$('#ctxSel').value||0;
      if(ctx===-1)ctx=+$('#ctxCustom').value||0;
      $('#ctxCustomWrap').hidden=+$('#ctxSel').value!==-1;
      var reserve=+$('#reserve').value||0,avail=Math.max(0,ctx-reserve);
      $('#tkTokens').textContent=fmt(a.tokens);
      $('#tkLow').textContent=fmt(a.tokens*0.85);$('#tkHigh').textContent=fmt(a.tokens*1.15);
      $('#tkChars').textContent=fmt(a.chars);$('#tkWords').textContent=fmt(a.words);
      $('#tkRatio').textContent=a.tokens?(a.chars/a.tokens).toFixed(2):'—';
      $('#tkUse').textContent=ctx?(a.tokens/avail*100).toFixed(2)+'%':'—';
      $('#tkLeft').textContent=ctx?(a.tokens>avail?'Over by '+fmt(a.tokens-avail):fmt(avail-a.tokens)+' tokens free'):'—';
      setMeter($('#tkMeter'),a.tokens,avail||1);
      var pin=+$('#priceIn').value,pout=+$('#priceOut').value,calls=+$('#calls').value||1;
      var cost=(pin?a.tokens/1e6*pin:0)+(pout?reserve/1e6*pout:0);
      $('#tkCost').textContent=(pin||pout)?'$'+(cost*calls).toFixed(cost*calls<1?4:2)+' for '+fmt(calls)+' call'+(calls>1?'s':''):'Enter your model’s price per 1M tokens';
      var fx=$('#fixcta');if(fx)fx.classList.toggle('show',ctx&&a.tokens>avail);
    }
    ['tokTxt','ctxSel','ctxCustom','reserve','priceIn','priceOut','calls'].forEach(function(id){var el=document.getElementById(id);if(el){el.addEventListener('input',debounce(runT,60));el.addEventListener('change',runT)}});
    wireBasics(tk,runT);runT();
  }

  /* ================= Text splitter / chunker ================= */
  var sp=$('#spTxt');
  if(sp){
    persist(sp,'l32-sp');
    var PRE={x:['chars',280,0,true,true],xpremium:['chars',25000,0,true,false],sms:['chars',153,0,true,false],lucene:['bytes',32766,0,true,false],excel:['chars',32767,0,true,false],rag:['tokens',512,64,true,false],rag1k:['tokens',1000,150,true,false],linkedin:['chars',3000,0,true,false]};
    $$('[data-preset]').forEach(function(b){b.addEventListener('click',function(){var p=PRE[b.getAttribute('data-preset')];$('#spMode').value=p[0];$('#spSize').value=p[1];$('#spOverlap').value=p[2];$('#spBound').checked=p[3];$('#spNum').checked=p[4];runS();toast('Preset applied')})});
    function unitLen(s,mode){return mode==='bytes'?utf8(s):(mode==='tokens'?tokens(s):(mode==='words'?words(s).length:graphemes(s).length))}
    function split(text,mode,size,overlap,bound,num){
      if(!text.trim()||size<1)return [];
      var parts=bound?(text.match(/\S+\s*|\s+/g)||[]):graphemes(text);
      var res=(num&&mode==='chars')?8:0,chunks=[],cur=[],curLen=0;
      var L=function(s){return mode==='tokens'?tokRaw(s):unitLen(s,mode)};
      var i=0;
      while(i<parts.length){
        var piece=parts[i],pl=L(piece);
        if(!cur.length){
          if(pl+res<=size){cur=[piece];curLen=pl;i++;continue}
          var acc='',al=0;
          graphemes(piece).forEach(function(g){var gl=L(g);if(acc&&al+gl+res>size){chunks.push(acc);acc='';al=0}acc+=g;al+=gl});
          cur=acc?[acc]:[];curLen=al;i++;continue;
        }
        if(curLen+pl+res<=size){cur.push(piece);curLen+=pl;i++;continue}
        chunks.push(cur.join(''));
        var back=[],bl=0;
        if(overlap>0){for(var j=cur.length-1;j>=0;j--){var l=L(cur[j]);if(bl+l>overlap)break;back.unshift(cur[j]);bl+=l}}
        cur=back;curLen=bl;
        if(cur.length&&curLen+pl+res>size){cur=[];curLen=0}
      }
      if(cur.length)chunks.push(cur.join(''));
      chunks=chunks.map(function(c){return c.replace(/\s+$/,'')}).filter(function(c){return c.length});
      if(num&&chunks.length>1)chunks=chunks.map(function(c,k){return c+' '+(k+1)+'/'+chunks.length});
      return chunks;
    }
    var lastChunks=[];
    function runS(){
      var mode=$('#spMode').value,size=+$('#spSize').value||0,ov=+$('#spOverlap').value||0;
      lastChunks=split(sp.value,mode,size,Math.min(ov,size-1),$('#spBound').checked,$('#spNum').checked);
      $('#spCount').textContent=fmt(lastChunks.length)+' chunk'+(lastChunks.length===1?'':'s');
      var out=$('#spOut');
      out.innerHTML=lastChunks.slice(0,300).map(function(c,k){
        return '<div class="chunk"><header><span>#'+(k+1)+' · '+fmt(graphemes(c).length)+' chars · '+fmt(utf8(c))+' B · ~'+fmt(tokens(c))+' tok</span><button class="btn btn-ghost btn-sm" data-cp="'+k+'">Copy</button></header><pre>'+c.replace(/&/g,'&amp;').replace(/</g,'&lt;')+'</pre></div>';
      }).join('')+(lastChunks.length>300?'<p class="muted">Showing the first 300 chunks. Download to get all '+fmt(lastChunks.length)+'.</p>':'');
    }
    $('#spOut').addEventListener('click',function(e){var b=e.target.closest('[data-cp]');if(b)copy(lastChunks[+b.getAttribute('data-cp')])});
    $('#spDlTxt').addEventListener('click',function(){download('chunks.txt',lastChunks.join('\n\n-----\n\n'))});
    $('#spDlJson').addEventListener('click',function(){download('chunks.jsonl',lastChunks.map(function(c,k){return JSON.stringify({id:k+1,text:c,chars:graphemes(c).length,bytes:utf8(c),tokens_est:tokens(c)})}).join('\n'),'application/jsonl')});
    $('#spCopyAll').addEventListener('click',function(){copy(lastChunks.join('\n\n'))});
    ['spTxt','spMode','spSize','spOverlap','spBound','spNum'].forEach(function(id){var el=document.getElementById(id);el.addEventListener('input',debounce(runS,120));el.addEventListener('change',runS)});
    wireBasics(sp,runS);runS();
  }

  /* ================= Truncator ================= */
  var tr=$('#trTxt');
  if(tr){
    persist(tr,'l32-tr');
    function runTr(){
      var t=tr.value,lim=+$('#trLimit').value||0,mode=$('#trMode').value,ell=$('#trEll').value,wb=$('#trWord').checked;
      var out=t;
      if(mode==='words'){var ws=t.split(/(\s+)/),acc='',n=0;for(var i=0;i<ws.length;i++){if(/\S/.test(ws[i])){if(n>=lim)break;n++}acc+=ws[i]}out=acc.replace(/\s+$/,'');if(out.length<t.trim().length)out+=ell}
      else{
        var L=function(s){return mode==='bytes'?utf8(s):graphemes(s).length};
        if(L(t)>lim){
          var budget=lim-L(ell),acc2='';
          for(var g of graphemes(t)){if(L(acc2+g)>budget)break;acc2+=g}
          if(wb){var cut=acc2.replace(/\s+\S*$/,'');if(cut.length>acc2.length*0.6)acc2=cut}
          out=acc2.replace(/[\s,;:.\-–—]+$/,'')+ell;
        }
      }
      $('#trOut').value=out;
      var a=analyze(out),b=analyze(t);
      $('#trStats').textContent='Before: '+fmt(b.chars)+' chars · '+fmt(b.bytes)+' bytes · '+fmt(b.words)+' words → After: '+fmt(a.chars)+' chars · '+fmt(a.bytes)+' bytes · '+fmt(a.words)+' words';
    }
    ['trTxt','trLimit','trMode','trEll','trWord'].forEach(function(id){var el=document.getElementById(id);el.addEventListener('input',debounce(runTr,60));el.addEventListener('change',runTr)});
    $('#trCopy').addEventListener('click',function(){copy($('#trOut').value)});
    $$('[data-trp]').forEach(function(b){b.addEventListener('click',function(){var p=b.getAttribute('data-trp').split(':');$('#trMode').value=p[0];$('#trLimit').value=p[1];runTr()})});
    wireBasics(tr,runTr);runTr();
  }

  /* ================= SMS counter ================= */
  var sm=$('#smsTxt');
  if(sm){
    persist(sm,'l32-sms');
    function runSms(){
      var g=gsm(sm.value);
      $('#smsEnc').textContent=g.enc;$('#smsUnits').textContent=fmt(g.units);$('#smsSeg').textContent=fmt(g.segments);
      var per=g.segments<=1?g.single:g.multi,capacity=g.segments<=1?g.single:g.segments*g.multi;
      $('#smsLeft').textContent=fmt(Math.max(0,capacity-g.units))+' left in '+(g.segments<=1?'this message':'segment '+g.segments);
      $('#smsPer').textContent=per;
      setMeter($('#smsMeter'),g.units,g.segments<=1?g.single:capacity);
      var bad={};g.bad.forEach(function(c){bad[c]=1});
      $('#smsBad').textContent=g.bad.length?Object.keys(bad).join(' '):'None — message stays in GSM-7';
      var h='';Array.from(sm.value).forEach(function(c){var e=c.replace(/&/g,'&amp;').replace(/</g,'&lt;');h+=bad[c]?'<mark class="ng" title="Not in GSM-7: forces UCS-2">'+e+'</mark>':e});
      $('#smsHl').innerHTML=h||'<span class="muted">Characters that force Unicode (UCS-2) are highlighted here.</span>';
      var price=+$('#smsPrice').value||0,rec=+$('#smsRecip').value||0;
      $('#smsCost').textContent=price&&rec?'$'+(price*g.segments*rec).toFixed(2)+' ('+fmt(g.segments*rec)+' segments billed)':'Enter price per segment and recipients';
    }
    $('#smsFix').addEventListener('click',function(){
      sm.value=sm.value.replace(/[‘’‚‛′]/g,"'").replace(/[“”„‟″]/g,'"').replace(/[–—―]/g,'-').replace(/…/g,'...').replace(/\u00A0/g,' ').replace(/[•·]/g,'-');
      runSms();toast('Smart punctuation replaced');
    });
    ['smsTxt','smsPrice','smsRecip'].forEach(function(id){document.getElementById(id).addEventListener('input',debounce(runSms,60))});
    wireBasics(sm,runSms);runSms();
  }

  /* ================= SERP preview (pixel widths) ================= */
  var st=$('#sTitle');
  if(st){
    var cv=document.createElement('canvas').getContext('2d');
    function px(t,font){cv.font=font;return cv.measureText(t).width}
    function fitPx(t,font,max){if(px(t,font)<=max)return t;var out='';for(var g of graphemes(t)){if(px(out+g+' ...',font)>max)break;out+=g}return out.replace(/\s+\S*$/,'')+' ...'}
    function esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;')}
    function runSerp(){
      var t=st.value,u=$('#sUrl').value||'https://example.com/page',d=$('#sDesc').value;
      var tp=px(t,'20px Arial'),dp=px(d,'14px Arial');
      $('#tPx').textContent=Math.round(tp)+' / 600 px · '+graphemes(t).length+' chars';
      $('#dPx').textContent=Math.round(dp)+' / 920 px · '+graphemes(d).length+' chars';
      setMeter($('#tMeter'),tp,600);setMeter($('#dMeter'),dp,920);
      var host=u.replace(/^https?:\/\//,'').split('/'),crumb=host[0]+(host.length>1&&host[1]?' › '+host.slice(1).filter(Boolean).join(' › '):'');
      $$('.serp').forEach(function(box){
        var mob=box.classList.contains('mobile');
        $('.u',box).textContent=crumb;
        $('.t',box).textContent=mob?t:fitPx(t,'20px Arial',600);
        $('.d',box).textContent=fitPx(d,'14px Arial',mob?680:920);
      });
      $('#tVerdict').innerHTML=!t?'':(tp>600?'<span class="pill over">Title will be cut</span>':'<span class="pill fit">Title fits</span>');
      $('#dVerdict').innerHTML=!d?'':(dp>920?'<span class="pill over">Description will be cut</span>':(graphemes(d).length<70?'<span class="pill warn">Short — consider adding detail</span>':'<span class="pill fit">Description fits</span>'));
      var fx=$('#fixcta');if(fx)fx.classList.toggle('show',tp>600||dp>920);
    }
    ['sTitle','sUrl','sDesc'].forEach(function(id){document.getElementById(id).addEventListener('input',debounce(runSerp,40))});
    if(document.fonts&&document.fonts.ready)document.fonts.ready.then(runSerp);
    runSerp();
  }

  /* ================= Text cleaner & case converter ================= */
  var cl=$('#clTxt');
  if(cl){
    persist(cl,'l32-cl');
    var stat=$('#clStat');
    function upd(){var a=analyze(cl.value);stat.textContent=fmt(a.chars)+' characters · '+fmt(a.words)+' words · '+fmt(a.lines)+' lines · '+fmt(a.bytes)+' bytes'}
    function tc(s){var small=/^(a|an|and|as|at|but|by|for|in|nor|of|on|or|the|to|up|via|vs)$/i;return s.toLowerCase().replace(/\S+/g,function(w,i){return i&&small.test(w)?w:w.charAt(0).toUpperCase()+w.slice(1)})}
    function wordsOf(s){return s.replace(/([a-z])([A-Z])/g,'$1 $2').replace(/[^\p{L}\p{N}]+/gu,' ').trim().split(' ').filter(Boolean)}
    var OPS={
      upper:function(s){return s.toUpperCase()},lower:function(s){return s.toLowerCase()},
      sentence:function(s){return s.toLowerCase().replace(/(^\s*\p{L}|[.!?]\s+\p{L})/gu,function(m){return m.toUpperCase()})},
      title:function(s){return s.split('\n').map(tc).join('\n')},
      camel:function(s){return wordsOf(s).map(function(w,i){w=w.toLowerCase();return i?w.charAt(0).toUpperCase()+w.slice(1):w}).join('')},
      snake:function(s){return wordsOf(s).join('_').toLowerCase()},kebab:function(s){return wordsOf(s).join('-').toLowerCase()},
      trim:function(s){return s.split('\n').map(function(l){return l.trim()}).join('\n').trim()},
      spaces:function(s){return s.replace(/[ \t\u00A0]{2,}/g,' ')},
      empty:function(s){return s.split('\n').filter(function(l){return l.trim()}).join('\n')},
      breaks:function(s){return s.replace(/\s*\r?\n\s*/g,' ').trim()},
      quotes:function(s){return s.replace(/[‘’‚‛]/g,"'").replace(/[“”„‟]/g,'"').replace(/[–—]/g,'-').replace(/…/g,'...')},
      emoji:function(s){try{return s.replace(/\p{Extended_Pictographic}(\uFE0F|\u200D\p{Extended_Pictographic})*/gu,'').replace(/[ ]{2,}/g,' ')}catch(e){return s}},
      ascii:function(s){return s.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^\x09\x0A\x0D\x20-\x7E]/g,'')},
      dedupe:function(s){var seen={};return s.split('\n').filter(function(l){if(seen[l])return false;seen[l]=1;return true}).join('\n')},
      sort:function(s){return s.split('\n').sort(function(a,b){return a.localeCompare(b,undefined,{sensitivity:'base'})}).join('\n')},
      reverse:function(s){return s.split('\n').reverse().join('\n')},
      slug:function(s){return s.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,75)}
    };
    var hist=[];
    $$('[data-op]').forEach(function(b){b.addEventListener('click',function(){hist.push(cl.value);if(hist.length>30)hist.shift();cl.value=OPS[b.getAttribute('data-op')](cl.value);upd()})});
    $('#clUndo').addEventListener('click',function(){if(hist.length){cl.value=hist.pop();upd()}else toast('Nothing to undo')});
    cl.addEventListener('input',debounce(upd,60));
    wireBasics(cl,upd);upd();
  }
})();
