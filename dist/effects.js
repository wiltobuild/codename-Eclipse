// Ambient magic is decorative. It stops offscreen, in hidden tabs, and on request.
(() => {
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const toggle = document.querySelector('#motion-toggle');
  let paused = preference.matches;
  let manualChoice = false;
  const fields = [];
  let frame = 0;
  let last = 0;
  let time = 0;
  const colors = { gold: [229,185,99], violet: [172,137,239], pearl: [232,214,255] };
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      const field = fields.find(f => f.canvas === entry.target);
      if (field) field.visible = entry.isIntersecting;
    }
    schedule();
  }, { rootMargin: '60px' });

  for (const canvas of document.querySelectorAll('[data-atmosphere]')) {
    const ctx = canvas.getContext('2d');
    if (!ctx) continue;
    const field = { canvas, ctx, visible: false, w: 1, h: 1, type: canvas.dataset.atmosphere,
      particles: Array.from({length: innerWidth < 600 ? 24 : 52}, () => ({
        x: Math.random(), y: Math.random(), r: .45 + Math.random() * 1.5,
        speed: .012 + Math.random() * .025, phase: Math.random() * Math.PI * 2
      })) };
    fields.push(field);
    const size = () => {
      const rect = canvas.getBoundingClientRect();
      field.w = rect.width; field.h = rect.height;
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      canvas.width = Math.max(1,Math.floor(rect.width * dpr));
      canvas.height = Math.max(1,Math.floor(rect.height * dpr));
      ctx.setTransform(dpr,0,0,dpr,0,0);
      draw(field,0);
    };
    new ResizeObserver(size).observe(canvas);
    size(); observer.observe(canvas);
  }

  function draw(f, t) {
    const {ctx,w,h,type} = f;
    ctx.clearRect(0,0,w,h);
    const tradition = document.querySelector('#magic').dataset.tradition || 'sun';
    for (const p of f.particles) {
      const x = (p.x + Math.sin(t*.13 + p.phase)*.025) * w;
      const y = ((p.y - t*p.speed + 100) % 1) * h;
      const color = type === 'void' ? colors.violet : type === 'magic' ?
        (tradition === 'sun' ? colors.gold : tradition === 'moon' ? colors.violet : colors.pearl) :
        p.x < .5 ? colors.gold : colors.violet;
      const alpha = .14 + (Math.sin(t*.6+p.phase)+1)*.2;
      ctx.beginPath(); ctx.fillStyle = `rgba(${color.join(',')},${alpha})`;
      ctx.shadowColor = `rgba(${color.join(',')},.7)`; ctx.shadowBlur = 8;
      ctx.arc(x,y,p.r,0,Math.PI*2); ctx.fill();
    }
    ctx.shadowBlur=0;
    // Abstract current lines follow the selected magical tradition.
    if (type === 'magic' || type === 'bond') {
      for(let i=0;i<3;i++) {
        const gradient=ctx.createLinearGradient(0,0,w,0);
        gradient.addColorStop(0,'rgba(229,185,99,0)');
        gradient.addColorStop(.38,'rgba(229,185,99,.2)');
        gradient.addColorStop(.62,'rgba(172,137,239,.24)');
        gradient.addColorStop(1,'rgba(172,137,239,0)');
        ctx.strokeStyle=gradient;ctx.lineWidth=.8;ctx.beginPath();
        for(let x=0;x<=w;x+=8) {
          const y=h*.5+Math.sin(x/w*Math.PI*2+t*.4+i*.7)*(h*.08)+i*13;
          if(x===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
        }
        ctx.stroke();
      }
    }
  }
  function loop(now) {
    frame=0;
    if(paused || document.hidden || !fields.some(f=>f.visible)) {last=0;return;}
    time += last ? Math.min((now-last)/1000,.05) : 0; last=now;
    for(const f of fields)if(f.visible)draw(f,time);
    frame=requestAnimationFrame(loop);
  }
  function schedule() {
    if(!paused && !document.hidden && !frame && fields.some(f=>f.visible))frame=requestAnimationFrame(loop);
  }
  function setPaused(value) {
    paused=value;document.body.classList.toggle('motion-off',paused);
    toggle.setAttribute('aria-pressed',String(paused));
    toggle.innerHTML=paused?'Enable motion <span aria-hidden="true">▷</span>':'Pause motion <span aria-hidden="true">Ⅱ</span>';
    if(paused) {cancelAnimationFrame(frame);frame=0;last=0;document.getAnimations().forEach(a=>{if(a.effect?.getTiming().iterations===Infinity)a.pause();else a.finish();});}
    else {document.getAnimations().forEach(a=>a.play());schedule();}
  }
  toggle.addEventListener('click',()=>{manualChoice=true;setPaused(!paused);});
  preference.addEventListener('change',()=>{if(!manualChoice)setPaused(preference.matches);});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;last=0;}else schedule();});
  setPaused(paused);

  // Reveal once, without concealing the page if JavaScript is unavailable.
  const reveals=new IntersectionObserver(entries=>{
    for(const entry of entries)if(entry.isIntersecting){
      if(!paused && !preference.matches)entry.target.animate(
        [{opacity:.25,transform:'translateY(30px)'},{opacity:1,transform:'translateY(0)'}],
        {duration:850,easing:'cubic-bezier(.2,.7,.2,1)'});
      reveals.unobserve(entry.target);
    }
  },{threshold:.13});
  document.querySelectorAll('.section-heading,.character-costs,.lineage,.magic-inspector,.city-frame,.threat-heading,.threat-flow,.fae-threshold').forEach(el=>reveals.observe(el));

  const experience=document.querySelector('#eclipse-experience');
  const awaken=document.querySelector('#awaken-bond');
  awaken.addEventListener('click',()=>{
    const active=experience.classList.toggle('awakened');
    awaken.setAttribute('aria-pressed',String(active));
    awaken.innerHTML=active?'Return to before the touch <span aria-hidden="true">↶</span>':'Reveal the bond <span aria-hidden="true">✧</span>';
    document.querySelector('#bond-state-title').textContent=active?'The blood recognizes.':'Two powers. Still apart.';
    document.querySelector('#bond-state-copy').textContent=active?
      'One touch reveals their fated bond. In the proposed sequence, the Sun and Moon align in the world’s first eclipse. Recognition is certain; the choice is still theirs.':
      'They feel the pull before they understand it. A dangerous encounter may force the first touch.';
  });
})();
