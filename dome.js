/* ============================================================
   THE DOME — a glazed tile vault seen from below, the oculus a
   nazar bead, the name set into the tiles. Shared by index.html
   and og.html. No dependencies.

   SadafDome(canvas, { word, static, onCount, onPointer })
   ============================================================ */
window.SadafDome = function(cv, opts){
  opts = opts || {};
  var RM   = !!opts.static;
  var word = opts.word || 'SADAF';
  var ctx  = cv.getContext('2d');
  var base = document.createElement('canvas'), bctx = base.getContext('2d');
  var TAU = Math.PI*2;
  var W=0,H=0,dpr=1,CX=0,CY=0,R0=30,RMAX=0,C=[],BEADS=[],raf=null,t0=performance.now();
  var REVEAL = 1.9;
  var ptr = {x:-1e4,y:-1e4,live:false};

  /* glazes, as hue/sat/light */
  var G = {
    gold:[42,70,50], leaf:[46,84,68], cream:[40,52,90],
    fir:[176,64,44], fir2:[182,58,34], lapis:[224,58,34], anar:[345,56,46], violet:[280,40,48],
    word:[42,72,86], word2:[46,92,74], halo:[272,50,15]
  };
  var RAY  = [G.gold,G.leaf,G.gold,G.cream,G.gold,G.leaf];
  var WALL = [G.fir,G.fir2,G.fir,G.lapis,G.fir2,G.violet];
  var WORD = [G.word,G.word2,G.cream,G.word];

  function hash(a,b){ var v = Math.sin(a*127.1 + b*311.7)*43758.5453; return v - Math.floor(v); }
  function hsl(g,dl,ds){ return 'hsl('+g[0]+' '+Math.max(0,Math.min(100,g[1]+(ds||0)))+'% '+Math.max(0,Math.min(100,g[2]+(dl||0)))+'%)'; }

  /* the name as two masks: red where the letters are, green in a halo around them */
  function masks(w,h,cell){
    var m = document.createElement('canvas'); m.width=w; m.height=h;
    var c = m.getContext('2d');
    c.fillStyle='#000'; c.fillRect(0,0,w,h);
    var size = Math.min(h*(W < 620 ? 0.44 : 0.36), w*0.24);
    c.textAlign='center'; c.textBaseline='alphabetic';
    try{ c.letterSpacing = '0.05em'; }catch(e){}
    for(var i=0;i<40;i++){
      c.font = '400 '+size+'px "Archivo Black", "Arial Black", sans-serif';
      if(c.measureText(word).width <= w*(W < 620 ? 0.86 : 0.76)) break;
      size *= 0.94;
    }
    var cap = c.measureText(word).actualBoundingBoxAscent || size*0.7;
    var y = h*(W < 620 ? 0.80 : 0.79) + cap/2;
    c.lineJoin='round'; c.strokeStyle='#0f0'; c.lineWidth=cell*2.8; c.strokeText(word, w/2, y);
    c.fillStyle='#f00'; c.fillText(word, w/2, y);
    return c.getImageData(0,0,w,h).data;
  }

  function build(){
    var rect = cv.getBoundingClientRect();
    W = Math.max(280, Math.round(rect.width || cv.width));
    H = Math.max(160, Math.round(rect.height || cv.height));
    dpr = Math.min(window.devicePixelRatio||1, 2);
    cv.width = W*dpr; cv.height = H*dpr; base.width = W*dpr; base.height = H*dpr;
    ctx.setTransform(dpr,0,0,dpr,0,0); bctx.setTransform(dpr,0,0,dpr,0,0);

    var cell = W < 620 ? 9.5 : (W < 900 ? 13 : 15);
    R0 = W < 620 ? 30 : 46;
    CX = W/2; CY = H*0.17;
    RMAX = Math.hypot(W/2, H-CY) + cell*2;

    var px = masks(W,H,cell);
    C = []; BEADS = [];
    var rb = R0*1.72, b = 0;
    while(rb < RMAX){
      var t = cell*(1 + 0.10*b);
      var n = 2*Math.max(8, Math.round(Math.PI*rb/t));
      var w = TAU/n;
      var rEnd = Math.min(RMAX, 2.0*t/w);
      if(rEnd <= rb + t) rEnd = rb + t*2;
      for(var j=0, r=rb+t/2; r < rEnd + t/2; j++, r += t/2){
        var off = (j&1) ? w/2 : 0;
        for(var k=0;k<n;k++){
          var am = k*w + off + w/2;
          var cx = CX + Math.cos(am)*r, cy = CY + Math.sin(am)*r;
          if(cy < -t || cy > H+t || cx < -t || cx > W+t) continue;
          var gx = Math.min(W-1, Math.max(0, Math.round(cx))), gy = Math.min(H-1, Math.max(0, Math.round(cy)));
          var i4 = (gy*W + gx)*4;
          var inWord = px[i4] > 128, halo = !inWord && px[i4+1] > 128;
          var hh = hash(b*97 + j*13, k*7 + 1);
          /* the sunburst: sixteen rays, twisted a little as they go out */
          var ray = ((am/TAU)*16 + r*0.0045) % 1; if(ray < 0) ray += 1;
          var pal = inWord ? WORD : (halo ? [G.halo] : (ray < 0.5 ? RAY : WALL));
          var g = pal[Math.floor(hh*pal.length) % pal.length];
          if(!inWord && !halo && hash(k*3+b, j*5+2) < 0.05) g = G.anar;
          C.push({x:cx, y:cy, a:am, r:r, t:t, w:w, g:g, word:inWord, halo:halo,
                  bright:(g===G.leaf || g===G.cream || inWord), boost:0, d:Math.hypot(cx-CX, cy-CY)});
        }
      }
      rb = rEnd; b++;
    }

    /* a few nazar beads set into the vault, never on the name, well apart */
    for(var q=0; q<C.length; q++){
      var c2 = C[q];
      if(c2.word || c2.halo || c2.d < R0*3.2 || c2.y < 0 || c2.y > H) continue;
      if(hash(c2.x*0.37, c2.y*0.91) > 0.012) continue;
      var far = BEADS.every(function(e){ return Math.hypot(e.x-c2.x, e.y-c2.y) > Math.min(W,H)*0.28; });
      if(!far || BEADS.length >= 5) continue;
      c2.blinkAt = 1.5 + hash(c2.x, c2.y)*5;
      BEADS.push(c2);
    }

    if(opts.onCount) opts.onCount(C.length);
    paintBase();
  }

  /* one petal-shaped tile */
  function path(c2, cx2, s){
    s = s || 1;
    var hw = c2.w/2*s, ht = c2.t/2*s, g = 0.9, ga = g/c2.r;
    var pIn  = [CX + Math.cos(c2.a)*(c2.r-ht+g), CY + Math.sin(c2.a)*(c2.r-ht+g)];
    var pOut = [CX + Math.cos(c2.a)*(c2.r+ht-g), CY + Math.sin(c2.a)*(c2.r+ht-g)];
    var pL   = [CX + Math.cos(c2.a-hw+ga)*c2.r, CY + Math.sin(c2.a-hw+ga)*c2.r];
    var pR   = [CX + Math.cos(c2.a+hw-ga)*c2.r, CY + Math.sin(c2.a+hw-ga)*c2.r];
    var pts = [pIn,pR,pOut,pL];
    cx2.beginPath(); cx2.moveTo(pIn[0],pIn[1]);
    for(var i=0;i<4;i++){
      var A = pts[i], B = pts[(i+1)%4];
      var mx = (A[0]+B[0])/2, my = (A[1]+B[1])/2;
      cx2.quadraticCurveTo(mx + (mx-c2.x)*0.34, my + (my-c2.y)*0.34, B[0], B[1]);
    }
    cx2.closePath();
    return [pIn,pOut];
  }

  function tile(c2, cx2, alpha){
    var pp = path(c2, cx2);
    var gr = cx2.createLinearGradient(pp[0][0],pp[0][1],pp[1][0],pp[1][1]);
    gr.addColorStop(0, hsl(c2.g, c2.word?9:13));
    gr.addColorStop(0.55, hsl(c2.g, 0));
    gr.addColorStop(1, hsl(c2.g, c2.word?-4:-13));
    cx2.globalAlpha = alpha == null ? 1 : alpha;
    cx2.fillStyle = gr; cx2.fill();
    cx2.lineWidth = c2.word ? 1.2 : 0.75;
    cx2.strokeStyle = c2.word ? 'rgba(255,248,222,.95)' : (c2.halo ? 'rgba(217,164,65,.20)' : 'rgba(242,215,154,.48)');
    cx2.stroke();
    if(c2.bright && !c2.halo){
      var sx = c2.x + (pp[0][0]-c2.x)*0.45, sy = c2.y + (pp[0][1]-c2.y)*0.45;
      cx2.fillStyle = 'rgba(255,255,255,'+(c2.word?0.45:0.28)+')';
      cx2.beginPath(); cx2.ellipse(sx, sy, c2.t*0.14, c2.t*0.09, c2.a + Math.PI/2, 0, TAU); cx2.fill();
    }
    cx2.globalAlpha = 1;
  }

  function sun(cx2){
    /* sixteen rays around the oculus, gold and gold leaf */
    for(var i=0;i<16;i++){
      var a0 = i*TAU/16, a1 = a0 + TAU/16, am = a0 + TAU/32;
      cx2.beginPath();
      cx2.moveTo(CX + Math.cos(a0)*R0*1.02, CY + Math.sin(a0)*R0*1.02);
      cx2.lineTo(CX + Math.cos(am)*R0*1.78, CY + Math.sin(am)*R0*1.78);
      cx2.lineTo(CX + Math.cos(a1)*R0*1.02, CY + Math.sin(a1)*R0*1.02);
      cx2.closePath();
      var gr = cx2.createLinearGradient(CX,CY, CX + Math.cos(am)*R0*1.78, CY + Math.sin(am)*R0*1.78);
      gr.addColorStop(0, (i&1) ? '#F2D79A' : '#D9A441');
      gr.addColorStop(1, (i&1) ? '#B8862B' : '#8A5E14');
      cx2.fillStyle = gr; cx2.fill();
      cx2.lineWidth = 0.8; cx2.strokeStyle = 'rgba(255,240,200,.55)'; cx2.stroke();
    }
  }

  function paintBase(){
    bctx.setTransform(dpr,0,0,dpr,0,0);
    bctx.clearRect(0,0,W,H);
    bctx.fillStyle = '#20083A'; bctx.fillRect(0,0,W,H);
    var i, c2;
    for(i=0;i<C.length;i++){ c2 = C[i]; if(!c2.word) tile(c2, bctx); }
    /* light from the oculus, dark at the rim */
    var v = bctx.createRadialGradient(CX,CY,R0, CX,CY,RMAX);
    v.addColorStop(0,'rgba(255,228,170,.16)'); v.addColorStop(0.4,'rgba(0,0,0,0)'); v.addColorStop(1,'rgba(18,5,36,.55)');
    bctx.fillStyle = v; bctx.fillRect(0,0,W,H);
    /* the name, raised */
    for(i=0;i<C.length;i++){ c2 = C[i]; if(!c2.word) continue;
      bctx.save(); bctx.translate(1.6,2.6); path(c2,bctx); bctx.fillStyle='rgba(0,0,0,.6)'; bctx.fill(); bctx.restore(); }
    for(i=0;i<C.length;i++){ c2 = C[i]; if(c2.word) tile(c2, bctx); }
    sun(bctx);
  }

  function eye(cx2, x, y, er, px2, py2, blink){
    cx2.beginPath(); cx2.arc(x+er*0.06, y+er*0.1, er*1.04, 0, TAU); cx2.fillStyle='rgba(0,0,0,.42)'; cx2.fill();
    cx2.beginPath(); cx2.arc(x,y,er,0,TAU); cx2.fillStyle='#12306E'; cx2.fill();
    cx2.lineWidth = Math.max(1, er*0.06); cx2.strokeStyle='rgba(242,215,154,.85)'; cx2.stroke();
    cx2.beginPath(); cx2.arc(x,y,er*0.72,0,TAU); cx2.fillStyle='#F5EDE0'; cx2.fill();
    cx2.beginPath(); cx2.arc(x,y,er*0.44,0,TAU); cx2.fillStyle='#2BB8AC'; cx2.fill();
    cx2.beginPath(); cx2.arc(x+px2,y+py2,er*0.20,0,TAU); cx2.fillStyle='#0B1226'; cx2.fill();
    cx2.beginPath(); cx2.arc(x+px2-er*0.07,y+py2-er*0.08,er*0.06,0,TAU); cx2.fillStyle='rgba(255,255,255,.85)'; cx2.fill();
    if(blink > 0){
      cx2.beginPath(); cx2.ellipse(x, y, er*1.03, er*1.03*blink, 0, 0, TAU); cx2.fillStyle='#12306E'; cx2.fill();
    }
  }

  function paint(now){
    var t = (now - t0)/1000;
    ctx.setTransform(1,0,0,1,0,0); ctx.clearRect(0,0,cv.width,cv.height);
    var rev = RM ? 1 : Math.min(1, t/REVEAL);
    var e = 1 - Math.pow(1-rev, 3);
    var RR = R0*1.72 + e*(RMAX - R0*1.72);

    ctx.save();
    if(rev < 1){ ctx.setTransform(dpr,0,0,dpr,0,0); ctx.beginPath(); ctx.arc(CX,CY,RR,0,TAU); ctx.clip(); ctx.setTransform(1,0,0,1,0,0); }
    ctx.drawImage(base,0,0);
    ctx.restore();
    ctx.setTransform(dpr,0,0,dpr,0,0);

    var th = t*0.30, hw = 0.26, i, c2;
    for(i=0;i<C.length;i++){
      c2 = C[i];
      /* tiles landing at the edge of the reveal */
      if(rev < 1){
        var dd0 = c2.d - RR;
        if(dd0 > 0 && dd0 < 70){ var kk = 1 - dd0/70; path(c2, ctx, 0.35 + 0.65*kk); ctx.globalAlpha = kk; ctx.fillStyle = hsl(c2.g, 16*(1-kk)); ctx.fill(); ctx.globalAlpha = 1; }
        if(dd0 > 0) continue;
      }
      /* sunlight sweeping round the vault */
      if(!RM && !c2.halo){
        var da = Math.abs(((c2.a - th) % TAU + TAU) % TAU); if(da > Math.PI) da = TAU - da;
        if(da < hw){ var k = 1 - da/hw; k *= k; path(c2, ctx); ctx.fillStyle = 'rgba(255,246,220,'+(k*(c2.bright?0.30:0.17))+')'; ctx.fill(); }
      }
      /* the finger */
      if(ptr.live){
        var dx = c2.x-ptr.x, dy = c2.y-ptr.y, dd = dx*dx + dy*dy;
        if(dd < 8100) c2.boost = Math.max(c2.boost, 1 - Math.sqrt(dd)/90);
      }
      if(c2.boost > 0.03){
        path(c2, ctx);
        ctx.globalAlpha = c2.boost*0.92;
        ctx.fillStyle = hsl(c2.g, c2.halo ? 40*c2.boost : 30*c2.boost, 10); ctx.fill();
        ctx.globalAlpha = 1;
        c2.boost *= RM ? 0.7 : 0.95;
      }
    }

    /* beads in the vault, and the oculus */
    var all = BEADS.slice(); 
    for(var q=0;q<=all.length;q++){
      var isOc = q === all.length;
      var ex = isOc ? CX : all[q].x, ey = isOc ? CY : all[q].y;
      var er = isOc ? R0*0.94 : all[q].t*0.95;
      if(!isOc && all[q].d > RR) continue;
      var px2 = 0, py2 = 0;
      if(ptr.live){
        var vx = ptr.x-ex, vy = ptr.y-ey, vd = Math.sqrt(vx*vx+vy*vy) || 1;
        var m = Math.min(er*0.28, vd*0.12);
        px2 = vx/vd*m; py2 = vy/vd*m;
      }else if(!RM){
        px2 = Math.cos(t*0.5 + ex*0.01)*er*0.16; py2 = Math.sin(t*0.37 + ey*0.01)*er*0.12;
      }
      var blink = 0;
      if(!RM){
        var o = isOc ? oc : all[q];
        var since = t - o.blinkAt;
        if(since > 0.18){
          var near = ptr.live && Math.hypot(ptr.x-ex, ptr.y-ey) < er*3;
          o.blinkAt = t + (near ? 0.7 : 4 + ((ex*7 + ey*3 + q*11) % 50)/10);
        }else if(since >= 0){ blink = Math.sin(since/0.18*Math.PI); }
      }
      eye(ctx, ex, ey, er, px2, py2, blink);
    }

    if(!RM) raf = requestAnimationFrame(paint);
  }
  var oc = {blinkAt: 3.2};

  function start(){
    build();
    if(raf) cancelAnimationFrame(raf);
    t0 = performance.now();
    if(RM) paint(performance.now()); else raf = requestAnimationFrame(paint);
  }

  function move(e){
    var b = cv.getBoundingClientRect();
    var p = e.touches ? e.touches[0] : e;
    ptr.x = p.clientX - b.left; ptr.y = p.clientY - b.top; ptr.live = true;
    if(opts.onPointer) opts.onPointer();
    if(RM) paint(performance.now());
  }
  cv.addEventListener('pointermove', move);
  cv.addEventListener('pointerdown', move);
  cv.addEventListener('touchmove', move, {passive:true});
  cv.addEventListener('pointerleave', function(){ ptr.live = false; });

  var rt;
  window.addEventListener('resize', function(){ clearTimeout(rt); rt = setTimeout(start, 220); });
  if(document.fonts && document.fonts.ready) document.fonts.ready.then(start);
  start();

  return { rebuild:start, count:function(){ return C.length; } };
};
