(function(){
  // 非侵入式增强脚本 — 加很多华丽效果，但不修改原有脚本内容
  // 仅当页面有 script.js 定义的 celebrate 时包装它

  // 插入基础样式（渐变背景、按钮光效等）
  const css = `
  /* 背景渐变动画 */
  body {
    background: linear-gradient(120deg,#0f2027, #203a43, #2c5364);
    background-size: 300% 300%;
    animation: bgShift 20s ease infinite;
    color: #f7f7f7;
  }
  @keyframes bgShift {
    0% {background-position:0% 50%}
    50% {background-position:100% 50%}
    100% {background-position:0% 50%}
  }

  /* 玻璃按钮效果 */
  button {
    transition: transform .12s ease, box-shadow .12s ease;
    border-radius: 8px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.08);
    padding: 8px 12px;
    color: #fff;
    cursor: pointer;
  }
  button:hover { transform: translateY(-3px) scale(1.02); box-shadow: 0 8px 20px rgba(0,0,0,0.35), 0 0 12px rgba(255,255,255,0.03) inset; }
  button:active { transform: translateY(0) scale(0.99); }

  /* 消息提示发光 */
  #msg { transition: text-shadow .3s ease; }

  /* 最快/平均时间高亮 */
  #fastest, #avgTime { font-weight: 600; color: #ffefc4; text-shadow: 0 2px 10px rgba(0,0,0,0.5); }

  /* 底部固定彩带 */
  .effects-ribbon { position: fixed; left:0; right:0; bottom:0; height:6px; pointer-events:none; z-index:9997; background: linear-gradient(90deg, rgba(255,0,150,0.8), rgba(255,200,0,0.8), rgba(0,200,255,0.8)); background-size: 300% 100%; animation: ribbonShift 6s linear infinite; opacity:0.6 }
  @keyframes ribbonShift { 0% {background-position:0%} 100% {background-position:300%} }

  /* 居中庆祝文字 */
  .celebrate-overlay { position:fixed; left:50%; top:20%; transform:translateX(-50%); z-index:9998; font-size:28px; font-weight:800; color:#fff; text-shadow:0 6px 30px rgba(0,0,0,0.6); pointer-events:none; }
  `;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  // 插入彩带
  const ribbon = document.createElement('div');
  ribbon.className = 'effects-ribbon';
  document.body.appendChild(ribbon);

  // Canvas confetti layer
  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.left = 0;
  canvas.style.top = 0;
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = 9999;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  function resize(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  // 简单 confetti 粒子系统
  function Confetti(){
    this.particles = [];
  }
  Confetti.prototype.launch = function(count){
    for(let i=0;i<count;i++){
      this.particles.push({
        x: Math.random()*canvas.width,
        y: -10 - Math.random()*200,
        vx: (Math.random()-0.5)*6,
        vy: 2+Math.random()*6,
        size: 6 + Math.random()*12,
        color: `hsl(${Math.floor(Math.random()*360)}, 90%, 60%)`,
        rot: Math.random()*360,
        vr: (Math.random()-0.5)*8,
        life: 200 + Math.random()*200
      });
    }
  }
  Confetti.prototype.update = function(dt){
    for(let i=this.particles.length-1;i>=0;i--){
      const p = this.particles[i];
      p.vy += 0.12; // gravity
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      p.life -= dt;
      if(p.y > canvas.height + 50 || p.life <= 0) this.particles.splice(i,1);
    }
  }
  Confetti.prototype.draw = function(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    for(const p of this.particles){
      ctx.save();
      ctx.translate(p.x,p.y);
      ctx.rotate(p.rot*Math.PI/180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size/2,-p.size/2,p.size,p.size*0.6);
      ctx.restore();
    }
  }
  const conf = new Confetti();

  // Fireworks: radial particle bursts
  function fireBurst(x,y,color){
    const pieces = 30 + Math.floor(Math.random()*30);
    for(let i=0;i<pieces;i++){
      conf.particles.push({
        x:x, y:y,
        vx: Math.cos(i/pieces*Math.PI*2)*(2+Math.random()*6),
        vy: Math.sin(i/pieces*Math.PI*2)*(2+Math.random()*6),
        size: 3 + Math.random()*8,
        color: color || `hsl(${Math.floor(Math.random()*360)}, 90%, 60%)`,
        rot: Math.random()*360,
        vr: (Math.random()-0.5)*16,
        life: 60 + Math.random()*80
      });
    }
  }

  // 主动画循环
  let last = performance.now();
  function frame(now){
    const dt = now - last;
    last = now;
    conf.update(dt);
    conf.draw();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // WebAudio 简单庆祝音效果
  function playCheer(){
    try{
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sawtooth';
      o.frequency.value = 600;
      o.connect(g);
      g.connect(ctx.destination);
      g.gain.value = 0.0001;
      const now = ctx.currentTime;
      g.gain.linearRampToValueAtTime(0.05, now + 0.02);
      o.start(now);
      o.frequency.exponentialRampToValueAtTime(880, now + 0.15);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
      o.stop(now + 0.8);
    }catch(e){
      // AudioContext 可能被浏览器阻止（需用户交互）
      // 忽略错误
    }
  }

  // 额外的视觉：闪烁 overlay 和火花文字
  function showCelebrateOverlay(text){
    const el = document.createElement('div');
    el.className = 'celebrate-overlay';
    el.textContent = text || 'You did it!';
    document.body.appendChild(el);
    el.animate([
      { transform: 'translateX(-50%) translateY(-40px) scale(0.9)', opacity:0 },
      { transform: 'translateX(-50%) translateY(0) scale(1.05)', opacity:1, offset:0.6 },
      { transform: 'translateX(-50%) translateY(-6px) scale(1)', opacity:1 },
      { transform: 'translateX(-50%) translateY(-80px) scale(0.9)', opacity:0 }
    ], { duration: 1600, easing: 'cubic-bezier(.2,.9,.2,1)' });
    setTimeout(()=>el.remove(), 1700);
  }

  // 把原生 celebrate 包装/增强
  function enhanceCelebrate(){
    const original = window.celebrate;
    if(typeof original !== 'function') return;
    window.celebrate = function(){
      try{ original(); } catch(e){ /* ignore */ }
      // 多重效果：confetti + fireworks + sound + overlay + button flash
      conf.launch(60);
      // 多个小爆炸
      const cx = window.innerWidth/2;
      const cy = window.innerHeight*0.35;
      for(let i=0;i<3;i++) setTimeout(()=>fireBurst(cx + (Math.random()-0.5)*200, cy + (Math.random()-0.5)*100), i*120);
      playCheer();
      showCelebrateOverlay('Correct! 🎉');
      // 给按钮一个短暂光环
      const flash = document.createElement('div');
      flash.style.position = 'fixed';
      flash.style.left = 0; flash.style.top = 0; flash.style.right=0; flash.style.bottom=0;
      flash.style.pointerEvents='none';
      flash.style.zIndex='9996';
      flash.style.background='radial-gradient(circle at 50% 30%, rgba(255,255,255,0.08), rgba(255,255,255,0))';
      document.body.appendChild(flash);
      flash.animate([{opacity:1},{opacity:0}],{duration:700}).onfinish=()=>flash.remove();
    }
  }

  // 页面准备好后增强（确保 script.js 已定义 celebrate）
  function tryEnhance(){
    if(window.celebrate && typeof window.celebrate === 'function'){
      enhanceCelebrate();
    } else {
      // 如果还没定义，等 200ms 再试，最多 10 次
      let attempts = 0;
      const id = setInterval(()=>{
        attempts++;
        if(window.celebrate && typeof window.celebrate === 'function'){
          clearInterval(id);
          enhanceCelebrate();
        } else if(attempts>10){
          clearInterval(id);
        }
      },200);
    }
  }

  // 额外：给所有按钮添加点击涟漪
  function attachRipple(){
    document.addEventListener('click', (e)=>{
      const t = e.target;
      if(t.tagName !== 'BUTTON') return;
      const r = document.createElement('span');
      const rect = t.getBoundingClientRect();
      r.style.position='absolute';
      r.style.left=(e.clientX-rect.left)+'px';
      r.style.top=(e.clientY-rect.top)+'px';
      r.style.width='8px'; r.style.height='8px';
      r.style.background='rgba(255,255,255,0.25)';
      r.style.borderRadius='50%';
      r.style.transform='translate(-50%,-50%) scale(1)';
      r.style.pointerEvents='none';
      r.style.zIndex=9999;
      r.style.transition='transform 600ms ease, opacity 600ms ease';
      t.style.position = t.style.position || 'relative';
      t.appendChild(r);
      requestAnimationFrame(()=>{ r.style.transform='translate(-50%,-50%) scale(12)'; r.style.opacity='0'; });
      setTimeout(()=>r.remove(),700);
    });
  }

  // 运行
  tryEnhance();
  attachRipple();

})();
