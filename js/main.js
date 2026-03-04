/* ══ LOADER (index only) ══ */
(function(){
  const ldBar = document.getElementById('ldBar');
  const ldNum = document.getElementById('ldNum');
  const letters = document.querySelectorAll('.lc');
  if(!ldBar || !ldNum) return;
  let prog = 0;
  setTimeout(()=>{
    letters.forEach((l,i)=> setTimeout(()=>{ l.style.transform='translateY(0)'; }, i * 70));
  }, 100);
  const tick = setInterval(()=>{
    prog += Math.random()*4 + 1.5;
    if(prog >= 100){ prog=100; clearInterval(tick); }
    ldBar.style.width = prog+'%';
    ldNum.textContent = Math.floor(prog)+'%';
    if(prog >= 100) setTimeout(()=> document.getElementById('loader')?.classList.add('gone'), 400);
  }, 40);
})();

/* ══ CURSOR ══ */
const dot = document.getElementById('cur-dot');
const ring = document.getElementById('cur-ring');
const lbl = document.getElementById('cur-label');
if(dot && ring){
  let mx=0,my=0,rx=0,ry=0,lx=0,ly=0;
  document.addEventListener('mousemove', e=>{ mx=e.clientX; my=e.clientY; dot.style.left=mx+'px'; dot.style.top=my+'px'; });
  (function loopCur(){
    rx += (mx-rx)*0.1; ry += (my-ry)*0.1;
    ring.style.left=rx+'px'; ring.style.top=ry+'px';
    if(lbl){ lx += (mx-lx)*0.1; ly += (my-ly)*0.1; lbl.style.left=lx+'px'; lbl.style.top=ly+'px'; }
    requestAnimationFrame(loopCur);
  })();
  document.querySelectorAll('a,button,.proj-row,.hl-item,.ss-item,.dark-full').forEach(el=>{
    el.addEventListener('mouseenter',()=>{ ring.classList.add('ch'); document.body.classList.add('ch'); });
    el.addEventListener('mouseleave',()=>{ ring.classList.remove('ch'); document.body.classList.remove('ch'); });
  });
}

/* ══ HERO PARALLAX (index only) ══ */
const heroBg = document.getElementById('heroBg');
if(heroBg){
  window.addEventListener('scroll',()=>{
    const y = window.scrollY;
    if(y < window.innerHeight * 1.2) heroBg.style.transform = `translateY(${y * 0.3}px)`;
  });
}

/* ══ CLIP REVEAL (index only) ══ */
document.querySelectorAll('[data-inview]').forEach(el=>{
  const projObs = new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(!e.isIntersecting) return;
      const row = e.target;
      const imgWrap = row.querySelector('.proj-img');
      const inner = row.querySelector('.proj-img-inner');
      if(imgWrap) imgWrap.classList.add('revealing');
      if(inner) setTimeout(()=> inner.classList.add('open'), 80);
      row.classList.add('inview');
      projObs.unobserve(row);
    });
  }, {threshold:0.2});
  projObs.observe(el);
});

/* ══ DARK FULL INVIEW (index only) ══ */
document.querySelectorAll('.dark-full').forEach(el=>{
  const dfObs = new IntersectionObserver(entries=>{
    entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('inview'); });
  }, {threshold:0.3});
  dfObs.observe(el);
});

/* ══ STICKY SCROLL SYNC (index only) ══ */
const ssItems = document.querySelectorAll('.ss-item');
const spBar = document.getElementById('spBar');
const spNum = document.getElementById('spNum');
const spCat = document.getElementById('spCat');
const spName = document.getElementById('spName');
if(ssItems.length && spBar){
  ssItems.forEach(i=>{
    const ssObs = new IntersectionObserver(entries=>{
      entries.forEach(e=>{
        if(!e.isIntersecting || e.intersectionRatio < 0.5) return;
        ssItems.forEach(it=>it.classList.remove('active'));
        e.target.classList.add('active');
        const idx = [...ssItems].indexOf(e.target);
        spBar.style.width = ((idx+1)/ssItems.length*100)+'%';
        if(spNum) spNum.textContent = String(idx+5).padStart(2,'0')+' / 06';
        if(spCat) spCat.style.opacity='0';
        if(spName) spName.style.opacity='0';
        setTimeout(()=>{
          if(spCat){ spCat.textContent = e.target.dataset.cat; spCat.style.opacity='1'; }
          if(spName){ spName.textContent = e.target.dataset.name; spName.style.opacity='1'; }
        }, 220);
      });
    }, {threshold:0.5});
    ssObs.observe(i);
  });
  if(spCat) spCat.style.transition='opacity 0.3s';
  if(spName) spName.style.transition='opacity 0.3s';
}

/* ══ TEXT SCRAMBLE (index only) ══ */
const swEl = document.getElementById('swText');
if(swEl){
  const CHARS='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const target='Chaque rendu est une alliance entre précision technique et sensibilité artistique — pour des visualisations qui racontent l\'espace avant même qu\'il existe.';
  let done=false;
  const scObs = new IntersectionObserver(entries=>{
    if(!entries[0].isIntersecting||done) return;
    done=true;
    let f=0; const total=55;
    const arr=target.split('');
    (function tick(){
      const p = f/total;
      swEl.textContent = arr.map((c,i)=>{
        if(c===' '||c==='—'||c==='\''||c===',') return c;
        if(i/arr.length < p) return c;
        return CHARS[Math.floor(Math.random()*CHARS.length)];
      }).join('');
      f++; if(f<=total) requestAnimationFrame(tick); else swEl.textContent=target;
    })();
  }, {threshold:0.4});
  scObs.observe(document.getElementById('scrambleWrap') || document.body);
}

/* ══ HOVER FLOAT IMAGE (index only) ══ */
const floatImg = document.getElementById('floatImg');
const floatSrc = document.getElementById('floatImgSrc');
if(floatImg && floatSrc){
  let fx=0,fy=0,ftx=0,fty=0;
  document.querySelectorAll('.hl-item').forEach(item=>{
    item.addEventListener('mouseenter',()=>{
      floatSrc.src = item.dataset.img || '';
      floatImg.classList.add('show');
    });
    item.addEventListener('mouseleave',()=> floatImg.classList.remove('show'));
    item.addEventListener('mousemove',e=>{ ftx=e.clientX; fty=e.clientY; });
  });
  (function loopFloat(){
    fx+=(ftx-fx)*0.09; fy+=(fty-fy)*0.09;
    floatImg.style.left=fx+'px'; floatImg.style.top=fy+'px';
    requestAnimationFrame(loopFloat);
  })();
}
