/* <sadaf-hero> — self-contained animated hero. Usage: <script src="sadaf-hero.js"></script> <sadaf-hero></sadaf-hero>
   Attributes: intro="false" to skip the opening; transparent to drop the built-in background so the fan sits on the page.
   Height comes from CSS on the element (default clamp(330px,44vw,480px)).
   Designed in Claude Design; two small integration edits marked [site]. */
(function(){
if(customElements.get('sadaf-hero'))return;
const C={aub:'#2A0E44',aub2:'#1C0830',gold:'#D9A441',leaf:'#F2D79A',cream:'#F7EFE0',turq:'#2BB8AC',pom:'#C0355F'};
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches||/\bstatic\b/.test(location.search); /* [site] ?static renders the resting state for screenshots */
const A=o=>Object.entries(o).map(([k,v])=>` ${k}="${v}"`).join('');
const el=(t,a,c='')=>`<${t}${A(a)}>${c}</${t}>`;
const f=n=>(+n).toFixed(1);
const pol=(cx,cy,r,a)=>[cx+r*Math.cos(a),cy+r*Math.sin(a)];
const FONT_L="'Archivo Black','Vazirmatn',Impact,sans-serif";
const FONT_A="'Amiri','Noto Nastaliq Urdu',serif";
const PI=Math.PI;

function geom(W,H){const R=Math.min((H-14)/1.175,W/2-14),r0=R*0.13;return{R,r0,cy:r0+4,cx:W/2}}
function build(W,H,u,intro,transparent){
  const {cx,cy,R,r0}=geom(W,H),wts=[1,1.15,1.3,1.5,1.7,1.9],sum=8.55,m=Math.min(W,H);
  const pearl=(id,c1,c2)=>el('linearGradient',{id,x1:0,y1:0,x2:1,y2:1},el('stop',{offset:0,'stop-color':C.cream})+el('stop',{offset:.5,'stop-color':c1})+el('stop',{offset:1,'stop-color':c2}));
  let tiers='',rin=r0;
  for(let k=0;k<6;k++){
    const t=(R-r0)*wts[k]/sum,rout=rin+t,n=7+4*k,off=k%2?0.5:0,b=t*0.22;let cells='';
    for(let i=-1;i<=n;i++){
      const a0=Math.max(0,(i+off)/n*PI),a1=Math.min(PI,(i+1+off)/n*PI),am=(a0+a1)/2;if(a1-a0<0.01)continue;
      const p0=pol(cx,cy,rin,a0),p1=pol(cx,cy,rin,a1),q1=pol(cx,cy,rout,a1),q0=pol(cx,cy,rout,a0),qm=pol(cx,cy,rout+b,am);
      const dd=`M${f(p0[0])} ${f(p0[1])}A${f(rin)} ${f(rin)} 0 0 1 ${f(p1[0])} ${f(p1[1])}L${f(q1[0])} ${f(q1[1])}Q${f(qm[0])} ${f(qm[1])} ${f(q0[0])} ${f(q0[1])}Z`;
      let fill;
      if(k<2)fill=`url(#${u}p${(i+3)%3})`;
      else if(k===2)fill=i%2?`url(#${u}p1)`:'rgba(43,184,172,0.55)';
      else fill=(i%5===2)?C.turq:(k%2?C.aub:'#331253');
      const d=0.2+k*0.26+Math.abs(am-PI/2)*0.3;
      cells+=el('path',{class:'cell',d:dd,fill,stroke:C.gold,'stroke-width':k<3?1.2:1.6,'stroke-linejoin':'round',style:`transform-origin:${f(cx)}px ${f(cy)}px;--d:${f(d)}s`});
    }
    const L=2*PI*rin;
    tiers+=el('g',{class:'tier',style:`transform-origin:${f(cx)}px ${f(cy)}px`},cells+el('circle',{class:'ring',cx,cy,r:f(rin),fill:'none',stroke:C.gold,'stroke-width':2.4,style:`--L:${f(L)};--Lh:${f(L/2)};--d:${f(0.15+k*0.26)}s`}));
    rin=rout;
  }
  const impost=el('line',{class:'cart',x1:f(cx-rin*1.03),y1:f(cy),x2:f(cx+rin*1.03),y2:f(cy),stroke:C.gold,'stroke-width':2.6,'stroke-linecap':'round'})+el('line',{class:'cart',x1:f(cx-rin*1.03),y1:f(cy-5),x2:f(cx+rin*1.03),y2:f(cy-5),stroke:C.cream,'stroke-width':.8,opacity:.6});
  const em=Math.min(W*0.72/4,H*0.30),ny=H*0.70,ps=em*0.26,py=ny+em*0.36+em*0.3,avail=W*0.72;
  const nameAttrs={x:cx,y:ny,'text-anchor':'middle','dominant-baseline':'central','font-family':FONT_L,'font-size':f(em),textLength:f(avail),lengthAdjust:'spacing'};
  const sweepW=em*1.1,sa=-(avail/2+sweepW),sb=avail/2+sweepW;
  const css=`
  .cell,.ring,.pearl,.lid,.nameIn,.cart{will-change:transform,opacity}
  .intro .cell{opacity:0;animation:cellIn .85s cubic-bezier(.2,.9,.3,1.12) both;animation-delay:var(--d)}
  .intro .ring{stroke-dasharray:var(--L);stroke-dashoffset:var(--L);animation:draw 1.4s cubic-bezier(.5,0,.2,1) both;animation-delay:var(--d)}
  .intro .pearl{animation:pop .9s cubic-bezier(.2,.9,.3,1.25) both;animation-delay:.05s}
  .intro .lid{animation:open .55s cubic-bezier(.3,.8,.3,1) both;animation-delay:2.95s}
  .intro .nameIn{animation:rise 1.1s cubic-bezier(.2,.7,.1,1) both;animation-delay:2s}
  .intro .cart{animation:fadeIn .8s ease both;animation-delay:2.8s}
  .sweep{animation:sweep 7.5s cubic-bezier(.55,0,.35,1) infinite;animation-delay:2.5s}
  .lid.blink{animation:blink .24s ease-in-out}
  .lid,.pearl,.tier{transform-origin:${f(cx)}px ${f(cy)}px}
  @keyframes cellIn{from{opacity:0;transform:scale(.12)}55%{opacity:1}to{opacity:1;transform:scale(1)}}
  @keyframes draw{to{stroke-dashoffset:var(--Lh)}}
  @keyframes pop{from{transform:scale(0)}to{transform:scale(1)}}
  @keyframes open{from{transform:scaleY(.03)}to{transform:scaleY(1)}}
  @keyframes rise{from{opacity:0;transform:translateY(${f(em*0.35)}px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes blink{50%{transform:scaleY(.05)}}
  @keyframes sweep{0%{transform:translateX(${f(sa)}px)}16%{transform:translateX(${f(sb)}px)}100%{transform:translateX(${f(sb)}px)}}
  @media (prefers-reduced-motion:reduce){.sweep,.intro *{animation:none!important;opacity:1}}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="100%" height="100%" style="display:block;overflow:hidden" class="${intro?'intro':''}" data-screen-label="Sadaf hero">
  <style>${css}</style>
  <defs>
    ${el('linearGradient',{id:u+'g',x1:0,y1:0,x2:0,y2:1},el('stop',{offset:0,'stop-color':C.leaf})+el('stop',{offset:.55,'stop-color':C.gold})+el('stop',{offset:1,'stop-color':'#B8862E'}))}
    ${pearl(u+'p0','#DDF1EC','#F2D79A')}${pearl(u+'p1','#F4DFE6','#CFEDE8')}${pearl(u+'p2','#F2D79A','#E8D7EE')}
    ${el('radialGradient',{id:u+'pe',cx:.4,cy:.35,r:.75},el('stop',{offset:0,'stop-color':'#FFFDF7'})+el('stop',{offset:.6,'stop-color':C.cream})+el('stop',{offset:1,'stop-color':C.leaf}))}
    ${el('radialGradient',{id:u+'bg',cx:.5,cy:0,r:1},el('stop',{offset:0,'stop-color':C.aub})+el('stop',{offset:1,'stop-color':C.aub2}))}
    ${el('radialGradient',{id:u+'gl'},el('stop',{offset:0,'stop-color':C.leaf,'stop-opacity':.28})+el('stop',{offset:.45,'stop-color':C.gold,'stop-opacity':.10})+el('stop',{offset:1,'stop-color':C.gold,'stop-opacity':0}))}
    ${el('linearGradient',{id:u+'sw',x1:0,y1:0,x2:1,y2:0},el('stop',{offset:0,'stop-color':'#fff','stop-opacity':0})+el('stop',{offset:.5,'stop-color':'#FFF6DC','stop-opacity':.85})+el('stop',{offset:1,'stop-color':'#fff','stop-opacity':0}))}
    ${el('clipPath',{id:u+'c'},el('rect',{x:0,y:f(cy),width:W,height:f(H-cy)}))}
    ${el('clipPath',{id:u+'n'},el('text',nameAttrs,'SADAF'))}
  </defs>
  ${transparent?'':el('rect',{width:W,height:H,fill:`url(#${u}bg)`})}
  <g class="fanOuter">${impost}<g clip-path="url(#${u}c)">${tiers}<circle class="glow" cx="0" cy="0" r="${f(m*0.34)}" fill="url(#${u}gl)" opacity="0"/></g></g>
  <g class="pearl">
    ${el('circle',{cx,cy,r:f(r0),fill:`url(#${u}pe)`,stroke:C.gold,'stroke-width':3})}
    <g class="lid">
      ${el('circle',{cx,cy,r:f(r0*0.6),fill:C.aub2})}${el('circle',{cx,cy,r:f(r0*0.43),fill:C.cream})}
      <g class="iris">${el('circle',{cx,cy,r:f(r0*0.27),fill:C.turq})}${el('circle',{cx,cy,r:f(r0*0.13),fill:C.aub2})}${el('circle',{cx:cx-r0*0.08,cy:cy-r0*0.09,r:f(r0*0.045),fill:'#fff',opacity:.85})}</g>
    </g>
    ${el('ellipse',{cx:cx-r0*0.3,cy:cy-r0*0.45,rx:f(r0*0.16),ry:f(r0*0.09),fill:'#fff',opacity:.55})}
  </g>
  <g class="nameOuter"><g class="nameScroll"><g class="nameIn">
    ${el('text',{...nameAttrs,fill:`url(#${u}g)`,stroke:C.aub2,'stroke-width':f(em*0.075),'paint-order':'stroke','stroke-linejoin':'round'},'SADAF')}
    <g clip-path="url(#${u}n)"><rect class="sweep" x="${f(cx-sweepW/2)}" y="${f(ny-em)}" width="${f(sweepW)}" height="${f(em*2)}" fill="url(#${u}sw)" opacity=".7"/></g>
  </g>
  <g class="cart">
    ${el('rect',{x:f(cx-ps*1.7),y:f(py-ps*0.62),width:f(ps*3.4),height:f(ps*1.24),rx:f(ps*0.62),fill:C.aub2,stroke:C.gold,'stroke-width':1.2})}
    ${el('text',{x:cx,y:py,'text-anchor':'middle','dominant-baseline':'central','font-family':FONT_A,'font-size':f(ps),fill:C.leaf},'صدف')}
  </g></g></g>
</svg>`;
}

class SadafHero extends HTMLElement{
  connectedCallback(){
    const s=this.style;s.display='block';s.width='100%';if(!s.height)s.height='clamp(330px,44vw,480px)';s.position='relative';s.overflow='hidden';s.touchAction='pan-y';
    this._u='sh'+Math.random().toString(36).slice(2,6);this._played=false;this._ptr=null;this._last=0;this._scrollP=0;
    this._iris={x:0,y:0};this._glow={x:0,y:0,o:0};this._par={x:0,y:0};this._vis=true;
    this._ro=new ResizeObserver(()=>this.render());this._ro.observe(this);this.render();
    this._onMove=e=>{this._ptr={x:e.clientX,y:e.clientY};this._last=performance.now();this._wake()};
    this._onLeave=()=>{this._ptr=null};
    this._onScroll=()=>{const r=this.getBoundingClientRect();const p=Math.min(1,Math.max(0,-r.top/r.height));if(Math.abs(p-this._scrollP)>0.002){this._scrollP=p;this._applyScroll();this._wake()}};
    window.addEventListener('pointermove',this._onMove,{passive:true});
    window.addEventListener('pointerdown',this._onMove,{passive:true});
    document.addEventListener('pointerleave',this._onLeave);
    window.addEventListener('scroll',this._onScroll,{passive:true});
    this.addEventListener('pointerdown',()=>this._blink());
    this._io=new IntersectionObserver(en=>{this._vis=en[0].isIntersecting;if(this._vis)this._wake()});this._io.observe(this);
  }
  disconnectedCallback(){
    this._ro.disconnect();this._io.disconnect();clearTimeout(this._bt);cancelAnimationFrame(this._raf);
    window.removeEventListener('pointermove',this._onMove);window.removeEventListener('pointerdown',this._onMove);
    document.removeEventListener('pointerleave',this._onLeave);window.removeEventListener('scroll',this._onScroll);
  }
  render(){
    const r=this.getBoundingClientRect(),W=Math.round(r.width),H=Math.round(r.height);if(W<10||H<10)return;
    if(this.firstElementChild&&this._W===W&&Math.abs(this._H-H)<40)return;this._W=W;this._H=H;
    const intro=!RM&&!this._played&&this.getAttribute('intro')!=='false';this._played=true;
    this.innerHTML=build(W,H,this._u,intro,this.hasAttribute('transparent')); /* [site] transparent attribute */
    const svg=this.firstElementChild,q=s=>svg.querySelector(s);
    const {cx,cy,r0}=geom(W,H);
    this._g={W,H,cx,cy,maxOff:r0*0.16,svg,iris:q('.iris'),lid:q('.lid'),glow:q('.glow'),fan:q('.fanOuter'),name:q('.nameOuter'),nameScroll:q('.nameScroll'),tiers:[...svg.querySelectorAll('.tier')]};
    this._ready=!intro;clearTimeout(this._bt);
    if(intro)setTimeout(()=>{svg.classList.remove('intro');this._ready=true;this._scheduleBlink()},3700);else this._scheduleBlink();
    this._applyScroll();this._wake();
  }
  _scheduleBlink(){if(RM)return;clearTimeout(this._bt);this._bt=setTimeout(()=>{this._blink();this._scheduleBlink()},3800+Math.random()*4200)}
  _blink(){if(RM||!this._ready||!this._g)return;const l=this._g.lid;if(l.classList.contains('blink'))return;l.classList.add('blink');l.addEventListener('animationend',()=>l.classList.remove('blink'),{once:true})}
  _applyScroll(){if(RM||!this._g)return;const p=this._scrollP;this._g.tiers.forEach((t,k)=>{t.style.transform=`scale(${(1-p*0.10*(1+k*0.18)).toFixed(4)})`});this._g.nameScroll.style.transform=`translateY(${(p*30).toFixed(1)}px)`;this._g.nameScroll.style.opacity=(1-p*0.6).toFixed(3)}
  _wake(){if(!this.firstElementChild)this.render();if(!this._raf&&this._vis)this._raf=requestAnimationFrame(t=>this._tick(t))}
  _tick(now){
    this._raf=0;const g=this._g;if(!g||!this._vis)return;if(!this.firstElementChild){this.render();return}
    const rect=g.svg.getBoundingClientRect(),sc=g.W/rect.width;
    const idle=!this._ptr||now-this._last>2500;
    let tx=0,ty=0,gx=g.cx,gy=g.cy,go=0,px=0,py=0,inside=false;
    if(!idle){
      const x=(this._ptr.x-rect.left)*sc,y=(this._ptr.y-rect.top)*sc;
      const dx=x-g.cx,dy=y-g.cy,d=Math.hypot(dx,dy)||1,k=Math.min(1,d/(g.H*0.5));
      tx=dx/d*k*g.maxOff;ty=dy/d*k*g.maxOff;
      inside=x>=0&&x<=g.W&&y>=0&&y<=g.H;
      if(inside){gx=x;gy=y;go=1;px=(x/g.W-0.5)*10;py=(y/g.H-0.5)*7}
    }else if(!RM){const t=now/1000;tx=Math.sin(t*0.37)*g.maxOff*0.55;ty=(Math.sin(t*0.53)*0.5+0.2)*g.maxOff*0.6}
    ty+=this._scrollP*g.maxOff*0.9;
    const L=(a,b,f)=>a+(b-a)*f;
    const I=this._iris,G=this._glow,P=this._par;
    I.x=L(I.x,tx,0.12);I.y=L(I.y,ty,0.12);
    G.o=L(G.o,go,0.08);if(go){G.x=L(G.x,gx,0.14);G.y=L(G.y,gy,0.14)}
    P.x=L(P.x,px,0.06);P.y=L(P.y,py,0.06);
    g.iris.style.transform=`translate(${I.x.toFixed(2)}px,${I.y.toFixed(2)}px)`;
    g.glow.setAttribute('transform',`translate(${G.x.toFixed(1)} ${G.y.toFixed(1)})`);g.glow.setAttribute('opacity',G.o.toFixed(3));
    if(!RM){g.fan.style.transform=`translate(${P.x.toFixed(2)}px,${P.y.toFixed(2)}px)`;g.name.style.transform=`translate(${(-P.x*0.5).toFixed(2)}px,${(-P.y*0.5).toFixed(2)}px)`}
    const settled=Math.abs(I.x-tx)+Math.abs(I.y-ty)<0.05&&Math.abs(G.o-go)<0.005&&Math.abs(P.x-px)+Math.abs(P.y-py)<0.05;
    // keep running while unsettled, while a pointer is active, or while the idle wander is on (not under reduced motion)
    if(!settled||!idle||!RM)this._raf=requestAnimationFrame(t=>this._tick(t));
  }
}
customElements.define('sadaf-hero',SadafHero);
})();
