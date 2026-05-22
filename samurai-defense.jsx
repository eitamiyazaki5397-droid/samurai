import React, { useState, useEffect, useRef, useCallback } from "react";

const COLS = 10, ROWS = 6, CS = 62;

const STAGES = [
  { id:0, name:"春の里",   sub:"SPRING VILLAGE", icon:"🌸", bg:"#0a180a", cells:["#0e200e","#0f210f","#101f10","#0d1e0d","#112011"], accent:"#a0e860" },
  { id:1, name:"炎の砦",   sub:"BLAZING FORT",   icon:"🔥", bg:"#1a0800", cells:["#1e0e00","#1f0f00","#1d0e00","#200f00","#1c0d00"], accent:"#ff8030" },
  { id:2, name:"雪の城",   sub:"ICE CASTLE",     icon:"❄️", bg:"#08101e", cells:["#0c1020","#0b0f1e","#0d111f","#0a1020","#0c101e"], accent:"#70c0ff" },
  { id:3, name:"嵐の海峡", sub:"STORM STRAIT",   icon:"⛈️", bg:"#0a0a1a", cells:["#0c0c1c","#0b0b1a","#0d0d1e","#0a0a1b","#0e0e1f"], accent:"#a060ff" },
  { id:4, name:"地獄の門", sub:"HELL'S GATE",    icon:"💀", bg:"#180006", cells:["#1c0008","#1a0006","#1e0008","#180005","#1b0007"], accent:"#ff2060" },
];

const UNIT_DEFS = {
  samurai:{ emoji:"⚔️", name:"侍",    desc:"近距離・高ダメ",    cost:50,  dmg:18, range:1.4, speed:1.0, color:"#e74c3c", glow:"#ff6b6b" },
  archer: { emoji:"🏹", name:"弓兵",  desc:"遠距離・速射",      cost:80,  dmg:9,  range:3.8, speed:2.2, color:"#9b59b6", glow:"#d98aff" },
  ninja:  { emoji:"🥷", name:"忍者",  desc:"毒攻撃・広範囲",    cost:110, dmg:12, range:2.5, speed:1.8, color:"#1abc9c", glow:"#4dffd4", poison:true },
  cannon: { emoji:"💣", name:"砲兵",  desc:"超火力・低速",      cost:150, dmg:55, range:2.0, speed:0.5, color:"#e67e22", glow:"#ffa040" },
  mage:   { emoji:"🧙", name:"魔術師",desc:"範囲爆発",          cost:180, dmg:35, range:3.0, speed:0.9, color:"#3498db", glow:"#74b9ff", splash:true },
  monk:   { emoji:"🪬", name:"僧侶",  desc:"サポート",          cost:120, dmg:8,  range:2.2, speed:1.4, color:"#27ae60", glow:"#55ff90" },
  wall:   { emoji:"🪨", name:"石垣",  desc:"通行不可",          cost:25,  dmg:0,  range:0,   speed:0,   color:"#7f8c8d", glow:"#aaaaaa", isWall:true },
};

const ENEMY_DEFS = [
  { id:0, emoji:"👹", name:"鬼",     hp:70,  spd:0.85, reward:15, size:26, armor:0 },
  { id:1, emoji:"💀", name:"骸骨",   hp:40,  spd:1.7,  reward:18, size:24, armor:0 },
  { id:2, emoji:"🐲", name:"竜",     hp:240, spd:0.45, reward:50, size:33, armor:0,   boss:true },
  { id:3, emoji:"👺", name:"天狗",   hp:95,  spd:1.1,  reward:25, size:28, armor:0 },
  { id:4, emoji:"🛡️", name:"甲冑兵", hp:180, spd:0.65, reward:38, size:28, armor:0.4 },
  { id:5, emoji:"🐺", name:"狼群",   hp:25,  spd:2.3,  reward:10, size:22, armor:0 },
  { id:6, emoji:"👾", name:"妖怪",   hp:135, spd:0.95, reward:32, size:28, armor:0.2 },
  { id:7, emoji:"🧟", name:"爆鬼",   hp:80,  spd:0.8,  reward:40, size:28, armor:0 },
  { id:8, emoji:"🔮", name:"魔人",   hp:320, spd:0.55, reward:80, size:34, armor:0.3, boss:true },
  { id:9, emoji:"👑", name:"大魔王", hp:700, spd:0.38, reward:160,size:38, armor:0.45,boss:true },
];

const STAGE_WAVES = [
  [[{t:0,n:5}],[{t:0,n:6},{t:1,n:2}],[{t:0,n:5},{t:3,n:2}],[{t:1,n:5},{t:3,n:3}],[{t:0,n:6},{t:5,n:4},{t:2,n:1}],[{t:4,n:3},{t:1,n:4}],[{t:5,n:8},{t:3,n:3}],[{t:4,n:4},{t:6,n:3}],[{t:6,n:5},{t:5,n:6},{t:8,n:1}],[{t:0,n:5},{t:4,n:4},{t:8,n:1},{t:9,n:1}]],
  [[{t:0,n:7}],[{t:0,n:7},{t:1,n:3}],[{t:3,n:5},{t:7,n:2}],[{t:4,n:4},{t:1,n:5}],[{t:5,n:8},{t:7,n:3},{t:2,n:1}],[{t:4,n:5},{t:6,n:4}],[{t:7,n:5},{t:3,n:4},{t:5,n:5}],[{t:4,n:5},{t:6,n:4},{t:7,n:3}],[{t:6,n:6},{t:5,n:8},{t:8,n:1}],[{t:4,n:5},{t:6,n:5},{t:8,n:2},{t:9,n:1}]],
  [[{t:0,n:8},{t:1,n:4}],[{t:4,n:4},{t:5,n:6}],[{t:6,n:5},{t:7,n:3}],[{t:4,n:6},{t:5,n:5}],[{t:7,n:5},{t:2,n:1},{t:5,n:6}],[{t:6,n:6},{t:4,n:5}],[{t:5,n:10},{t:7,n:4}],[{t:4,n:6},{t:6,n:5},{t:7,n:4}],[{t:6,n:7},{t:8,n:2}],[{t:4,n:6},{t:6,n:6},{t:8,n:2},{t:9,n:2}]],
  [[{t:0,n:10},{t:5,n:6}],[{t:4,n:6},{t:6,n:5}],[{t:5,n:10},{t:7,n:5}],[{t:6,n:7},{t:4,n:5}],[{t:7,n:6},{t:5,n:8},{t:2,n:2}],[{t:6,n:8},{t:4,n:6}],[{t:5,n:12},{t:7,n:6}],[{t:4,n:8},{t:6,n:7},{t:7,n:5}],[{t:8,n:3},{t:6,n:8}],[{t:6,n:8},{t:8,n:3},{t:9,n:2}]],
  [[{t:4,n:8},{t:6,n:6}],[{t:5,n:10},{t:7,n:6}],[{t:6,n:8},{t:4,n:7}],[{t:7,n:8},{t:5,n:10}],[{t:8,n:2},{t:6,n:8},{t:5,n:8}],[{t:6,n:10},{t:7,n:8}],[{t:5,n:14},{t:7,n:8}],[{t:4,n:10},{t:6,n:9},{t:7,n:7}],[{t:8,n:4},{t:6,n:10}],[{t:6,n:10},{t:8,n:4},{t:9,n:3}]],
];

let _uid = 1;
const nid = () => _uid++;
const dist = (a, b) => Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);

// ── Floating damage text ───────────────────────────────────────────────────
function FloatText({ items }) {
  return (
    <div style={{ position:"absolute", inset:0, pointerEvents:"none", overflow:"hidden", zIndex:80 }}>
      {items.map(f => (
        <div key={f.id} style={{
          position:"absolute", left: f.x * CS, top: f.y * CS,
          transform: `translateY(${(1 - f.t) * -50}px)`,
          opacity: f.t > 0.4 ? 1 : f.t / 0.4,
          color: f.color, fontSize: f.big ? 22 : 12, fontWeight: 900,
          textShadow: "0 2px 8px #000", whiteSpace: "nowrap", pointerEvents: "none",
        }}>{f.text}</div>
      ))}
    </div>
  );
}

// ── Title ──────────────────────────────────────────────────────────────────
function TitleScreen({ onPlay }) {
  const [t, setT] = useState(0);
  useEffect(() => { const id = setInterval(() => setT(v => v + 1), 60); return () => clearInterval(id); }, []);
  const s = 0.97 + Math.sin(t * 0.08) * 0.03;

  return (
    <div style={{
      minHeight:"100vh", background:"#060a06",
      backgroundImage:"radial-gradient(ellipse at 50% 30%,#1a0800,transparent 60%)",
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      fontFamily:"'Hiragino Kaku Gothic Pro','Yu Gothic',sans-serif", userSelect:"none",
    }}>
      <div style={{ fontSize:80, marginBottom:16, filter:"drop-shadow(0 0 30px #f0c04088)" }}>⛩️</div>
      <h1 style={{
        fontSize:48, fontWeight:900, margin:"0 0 4px", letterSpacing:8,
        background:"linear-gradient(135deg,#f0c040,#ff8c00,#ffd700)",
        WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
      }}>侍の砦</h1>
      <div style={{ color:"#5a4a20", fontSize:13, letterSpacing:6, marginBottom:6 }}>SAMURAI TOWER DEFENSE</div>
      <div style={{ color:"#3a3020", fontSize:11, marginBottom:48, letterSpacing:2 }}>5 STAGES · 50 WAVES · 7 UNITS</div>

      <div style={{ display:"flex", gap:10, marginBottom:40, flexWrap:"wrap", justifyContent:"center" }}>
        {["🌸春の里","🔥炎の砦","❄️雪の城","⛈️嵐の海峡","💀地獄の門"].map((s2, i) => (
          <div key={i} style={{
            background:"#111", border:"1px solid #2a2010", borderRadius:8,
            padding:"6px 10px", fontSize:10, color:"#4a3a20", letterSpacing:1,
          }}>{s2}</div>
        ))}
      </div>

      <button onClick={onPlay} style={{
        background:"linear-gradient(135deg,#c0392b,#8b0000)",
        border:"2px solid #ff4444", borderRadius:16, padding:"16px 56px",
        color:"#fff", fontSize:20, fontWeight:900, cursor:"pointer",
        boxShadow:"0 6px 30px #c0392b88", letterSpacing:4,
        transform:`scale(${s})`,
      }}>⚔️ 戦へ</button>
      <div style={{ color:"#2a2018", fontSize:10, marginTop:32, letterSpacing:2 }}>配置 → 開戦 → 撃退 → 繰り返せ</div>
    </div>
  );
}

// ── Stage Select ────────────────────────────────────────────────────────────
function StageSelect({ clearedStages, totalScore, onSelect, onBack }) {
  return (
    <div style={{
      minHeight:"100vh", background:"#060a06",
      backgroundImage:"radial-gradient(ellipse at 30% 20%,#1a0800,transparent 50%)",
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      fontFamily:"'Hiragino Kaku Gothic Pro','Yu Gothic',sans-serif", padding:20,
    }}>
      <h2 style={{ fontSize:28, fontWeight:900, color:"#f0c040", letterSpacing:6, marginBottom:4 }}>⛩️ ステージ選択</h2>
      <div style={{ color:"#5a4a20", fontSize:11, marginBottom:6, letterSpacing:2 }}>総戦功: {totalScore.toLocaleString()}</div>
      <div style={{ color:"#3a3020", fontSize:10, marginBottom:24, letterSpacing:1 }}>クリアすると次が解放される</div>

      <div style={{ display:"flex", flexDirection:"column", gap:10, width:"100%", maxWidth:440 }}>
        {STAGES.map(st => {
          const unlocked = st.id === 0 || clearedStages.includes(st.id - 1);
          const cleared  = clearedStages.includes(st.id);
          return (
            <button key={st.id} onClick={() => unlocked && onSelect(st.id)} disabled={!unlocked}
              style={{
                background: cleared ? "linear-gradient(135deg,#1a3010,#0e200a)" : unlocked ? "linear-gradient(135deg,#1a1200,#0e0c00)" : "#0a0a0a",
                border: cleared ? "2px solid #4a8020" : unlocked ? "2px solid #3a2800" : "2px solid #1a1a1a",
                borderRadius:14, padding:"14px 20px", cursor: unlocked ? "pointer" : "not-allowed",
                display:"flex", alignItems:"center", gap:14, opacity: unlocked ? 1 : 0.4,
              }}>
              <span style={{ fontSize:32 }}>{st.icon}</span>
              <div style={{ flex:1, textAlign:"left" }}>
                <div style={{ fontSize:15, fontWeight:900, color: cleared?"#a0e060":unlocked?"#f0c040":"#444", letterSpacing:2 }}>{st.name}</div>
                <div style={{ fontSize:9, color:"#555", letterSpacing:2 }}>{st.sub} · 10波</div>
              </div>
              <div style={{ fontSize:18 }}>{cleared ? "✅" : unlocked ? "▶️" : "🔒"}</div>
            </button>
          );
        })}
      </div>

      <button onClick={onBack} style={{
        background:"transparent", border:"1px solid #2a2010", borderRadius:10,
        padding:"10px 24px", color:"#5a4a20", fontSize:13, cursor:"pointer", marginTop:20, letterSpacing:2,
      }}>← タイトルへ</button>
    </div>
  );
}

// ── Game ────────────────────────────────────────────────────────────────────
function Game({ stageId, onClear, onBack }) {
  const stage = STAGES[stageId];
  const waves = STAGE_WAVES[stageId];

  const [gold,    setGold]    = useState(130 + stageId * 10);
  const [lives,   setLives]   = useState(20);
  const [wave,    setWave]    = useState(0);
  const [score,   setScore]   = useState(0);
  const [phase,   setPhase]   = useState("prep");
  const [sel,     setSel]     = useState("samurai");
  const [towers,  setTowers]  = useState([]);
  const [tLv,     setTLv]     = useState({});
  const [enemies, setEnemies] = useState([]);
  const [projs,   setProjs]   = useState([]);
  const [floats,  setFloats]  = useState([]);
  const [queue,   setQueue]   = useState([]);
  const [msg,     setMsg]     = useState("配置して開戦せよ！");
  const [hover,   setHover]   = useState(null);
  const [shake,   setShake]   = useState(false);

  const gRef   = useRef({});
  const rafRef = useRef(null);
  const lastRef= useRef(null);
  const spawnT = useRef(0);

  useEffect(() => {
    gRef.current = { gold, lives, wave, score, phase, towers, tLv, enemies, projs, queue };
  });

  const spawnFloat = useCallback((x, y, text, color, big = false) => {
    const f = { id: nid(), x, y, text, color, big, t: 1.0 };
    setFloats(fs => [...fs, f]);
    const step = () => {
      f.t -= 0.024;
      if (f.t > 0) { setFloats(fs => fs.map(ff => ff.id === f.id ? { ...ff, t: f.t } : ff)); requestAnimationFrame(step); }
      else { setFloats(fs => fs.filter(ff => ff.id !== f.id)); }
    };
    requestAnimationFrame(step);
  }, []);

  const tStats = useCallback((tower) => {
    const base = UNIT_DEFS[tower.type];
    const lv = (gRef.current.tLv[tower.id] || 1);
    const m = 1 + (lv - 1) * 0.4;
    return { ...base, dmg: Math.round(base.dmg * m), range: +(base.range * (1 + (lv - 1) * 0.1)).toFixed(2), level: lv };
  }, []);

  const startWave = useCallback(() => {
    const g = gRef.current;
    if (g.wave >= waves.length) return;
    const cfg = waves[g.wave];
    const q = [];
    cfg.forEach(({ t, n }) => { for (let i = 0; i < n; i++) q.push({ type: t, row: Math.floor(Math.random() * ROWS), delay: q.length * 820 }); });
    setQueue(q); setPhase("fighting");
    const hasBoss = cfg.some(c => ENEMY_DEFS[c.t]?.boss);
    setMsg(hasBoss ? `💀 第${g.wave + 1}波 — ボス出現！` : `⚔️ 第${g.wave + 1}波 開始！`);
    spawnT.current = 0; lastRef.current = null;
  }, [waves]);

  useEffect(() => {
    if (phase !== "fighting") return;
    const tick = (ts) => {
      if (!lastRef.current) lastRef.current = ts;
      const dt = Math.min((ts - lastRef.current) / 1000, 0.05);
      lastRef.current = ts;
      spawnT.current += dt * 1000;

      const g = gRef.current;
      let enm = [...g.enemies];
      let qArr = [...g.queue];
      let prs  = [...g.projs];

      while (qArr.length > 0 && spawnT.current >= qArr[0].delay) {
        const s = qArr.shift();
        const et = ENEMY_DEFS[s.type];
        enm.push({ id:nid(), type:s.type, x:COLS+0.7, y:s.row+0.5, hp:et.hp, maxHp:et.hp, spd:et.spd, reward:et.reward, emoji:et.emoji, size:et.size, armor:et.armor||0, boss:et.boss, poison:0 });
        setQueue(qArr);
      }

      let lost = 0;
      enm = enm.map(e => ({ ...e, x: e.x - e.spd * dt, hp: e.poison > 0 ? e.hp - 5 * dt : e.hp, poison: Math.max(0, e.poison - dt) }))
        .filter(e => { if (e.x < -0.7) { lost++; return false; } return true; });

      const tws = g.towers.map(t => {
        const u = tStats(t);
        if (u.isWall) return t;
        let cd = t.cd - dt;
        if (cd <= 0) {
          const target = enm.filter(e => dist(t, e) <= u.range).sort((a, b) => a.x - b.x)[0];
          if (target) {
            cd = 1 / u.speed;
            prs.push({ id:nid(), x:t.x, y:t.y, targetId:target.id, dmg:u.dmg, color:u.color, glow:u.glow, poison:u.poison, splash:u.splash, type:t.type });
          }
        }
        return { ...t, cd };
      });

      let ge = 0, gs = 0;
      prs = prs.map(p => {
        const tgt = enm.find(e => e.id === p.targetId);
        if (!tgt) return null;
        if (dist(p, tgt) < 0.35) {
          if (p.splash) {
            enm = enm.map(e => dist(e, tgt) <= 1.2 ? { ...e, hp: e.hp - Math.max(1, Math.round(p.dmg * (1 - e.armor))) } : e);
          } else {
            enm = enm.map(e => e.id !== p.targetId ? e : { ...e, hp: e.hp - Math.max(1, Math.round(p.dmg * (1 - e.armor))), poison: p.poison ? 4 : e.poison });
          }
          return null;
        }
        const dx = tgt.x - p.x, dy = tgt.y - p.y, len = Math.sqrt(dx*dx+dy*dy);
        return { ...p, x: p.x + (dx/len)*7*dt, y: p.y + (dy/len)*7*dt };
      }).filter(Boolean);

      enm = enm.filter(e => {
        if (e.hp <= 0) { ge += e.reward; gs += e.reward * 3; spawnFloat(e.x, e.y - 0.5, `+${e.reward}両`, "#f0c040"); spawnFloat(e.x, e.y - 0.9, "💥", "#fff", true); return false; }
        return true;
      });

      setTowers(tws); setEnemies(enm); setProjs(prs);
      if (ge > 0) setGold(v => v + ge);
      if (gs > 0) setScore(v => v + gs);

      if (lost > 0) {
        setShake(true); setTimeout(() => setShake(false), 400);
        setLives(lv => {
          const nv = lv - lost;
          if (nv <= 0) { setPhase("lost"); setMsg("城が落ちた…！"); }
          return Math.max(0, nv);
        });
        if ((g.lives - lost) <= 0) return;
      }

      if (enm.length === 0 && qArr.length === 0 && g.queue.length === 0) {
        const nw = g.wave + 1;
        if (nw >= waves.length) {
          setPhase("stageClear"); setMsg("🏆 全波撃退！ステージ制覇！");
          onClear(stageId, g.score + gs);
        } else {
          setWave(nw); setPhase("prep");
          const bonus = 40 + stageId * 10;
          setGold(v => v + bonus);
          setMsg(`✅ 波撃退！（+${bonus}両）`);
        }
        lastRef.current = null; return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };
    lastRef.current = null;
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [phase, waves, stageId, onClear, tStats, spawnFloat]);

  const placeTower = (col, row) => {
    if (phase !== "prep") { setMsg("戦闘中は配置できぬ！"); return; }
    const u = UNIT_DEFS[sel];
    const g = gRef.current;
    const existing = g.towers.find(t => t.col === col && t.row === row);
    if (existing) {
      if (existing.type === sel && !u.isWall) {
        const lv = g.tLv[existing.id] || 1;
        if (lv >= 3) { setMsg("最大レベル！"); return; }
        const cost = u.cost * lv;
        if (g.gold < cost) { setMsg("両が足りぬ！"); return; }
        setTLv(prev => ({ ...prev, [existing.id]: lv + 1 }));
        setGold(v => v - cost);
        spawnFloat(col + 0.5, row + 0.5, `⬆️Lv${lv + 1}`, "#f0c040", true);
      } else { setMsg("同じユニットを選んで強化"); }
      return;
    }
    if (g.gold < u.cost) { setMsg("両が足りぬ！"); return; }
    setTowers(ts => [...ts, { id: nid(), type: sel, col, row, x: col + 0.5, y: row + 0.5, cd: 0 }]);
    setGold(v => v - u.cost);
    spawnFloat(col + 0.5, row + 0.5, u.emoji, "#fff", true);
  };

  const removeTower = (id, e) => {
    e.stopPropagation();
    const t = towers.find(t => t.id === id);
    if (!t) return;
    const ref = Math.floor(UNIT_DEFS[t.type].cost * 0.5);
    setTowers(ts => ts.filter(x => x.id !== id));
    setTLv(prev => { const n = { ...prev }; delete n[id]; return n; });
    setGold(v => v + ref);
    setMsg(`撤退（+${ref}両）`);
  };

  const W = COLS * CS, H = ROWS * CS;
  const selUnit = UNIT_DEFS[sel];
  const wCfg = waves[wave] || [];
  const hasBoss = wCfg.some(c => ENEMY_DEFS[c.t]?.boss);

  return (
    <div style={{
      minHeight:"100vh", background:stage.bg, display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      fontFamily:"'Hiragino Kaku Gothic Pro','Yu Gothic',sans-serif",
      padding:"8px", userSelect:"none",
    }}>
      {/* Top bar */}
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6, width:"100%", maxWidth:W }}>
        <button onClick={onBack} style={{ background:"transparent", border:"1px solid #3a2810", borderRadius:8, padding:"4px 10px", color:"#5a4a20", fontSize:11, cursor:"pointer" }}>← 戻る</button>
        <div style={{ display:"flex", flex:1, background:"linear-gradient(180deg,#1a1200,#0e0c00)", border:"1px solid #3a2800", borderRadius:10, overflow:"hidden" }}>
          {[{icon:"🪙",label:"両",val:gold,color:"#f0c040"},{icon:"❤️",label:"命",val:lives,color:"#ff6b6b"},{icon:"🌊",label:"波",val:`${wave+1}/${waves.length}`,color:"#60a0ff"},{icon:"⭐",label:"点",val:score,color:"#ffd700"}].map(({icon,label,val,color},i)=>(
            <div key={label} style={{ padding:"5px 10px", textAlign:"center", flex:1, borderRight:i<3?"1px solid #2a1800":"none" }}>
              <div style={{ fontSize:13 }}>{icon}</div>
              <div style={{ fontSize:13, fontWeight:900, color, lineHeight:1 }}>{val}</div>
              <div style={{ fontSize:8, color:"#5a4a30" }}>{label}</div>
            </div>
          ))}
        </div>
        <div style={{ background:"#111", border:"1px solid #2a1a00", borderRadius:8, padding:"4px 8px", textAlign:"center" }}>
          <div style={{ fontSize:14 }}>{stage.icon}</div>
          <div style={{ fontSize:8, color:"#5a4a20" }}>{stage.name}</div>
        </div>
      </div>

      {/* Message */}
      <div style={{ padding:"4px 20px", marginBottom:6, fontSize:12, color:hasBoss&&phase==="fighting"?"#ff6060":stage.accent, letterSpacing:2, textAlign:"center", width:"100%", maxWidth:W, boxSizing:"border-box" }}>{msg}</div>

      {/* Board */}
      <div style={{ position:"relative", width:W, height:H, marginBottom:8, borderRadius:8, boxShadow:`0 0 40px #00000099`, transform:shake?"translate(-3px,1px)":"none", transition:"transform 0.05s", overflow:"hidden" }}>

        {Array.from({length:ROWS},(_,row)=>Array.from({length:COLS},(_,col)=>(
          <div key={`bg${col}-${row}`} style={{ position:"absolute", left:col*CS, top:row*CS, width:CS, height:CS, background:stage.cells[(col*7+row*13)%5] }}/>
        )))}

        <svg width={W} height={H} style={{ position:"absolute", top:0, left:0, pointerEvents:"none" }}>
          <defs>
            <filter id="glow"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            <filter id="bglow"><feGaussianBlur stdDeviation="8" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          </defs>
          {Array.from({length:COLS+1},(_,i)=><line key={`v${i}`} x1={i*CS} y1={0} x2={i*CS} y2={H} stroke={stage.cells[0]} strokeWidth={1}/>)}
          {Array.from({length:ROWS+1},(_,i)=><line key={`h${i}`} x1={0} y1={i*CS} x2={W} y2={i*CS} stroke={stage.cells[0]} strokeWidth={1}/>)}
          <rect x={W-4} y={0} width={4} height={H} fill="#ff222233"/>
          <line x1={W-1} y1={0} x2={W-1} y2={H} stroke="#ff3300" strokeWidth={2} opacity={0.4}/>

          {hover && (() => {
            const ex = towers.find(t => t.col===hover.col && t.row===hover.row);
            const u = ex ? tStats(ex) : selUnit;
            if (!u.range) return null;
            return <circle cx={(hover.col+0.5)*CS} cy={(hover.row+0.5)*CS} r={u.range*CS} fill={u.color+"14"} stroke={u.color} strokeWidth={1.5} strokeDasharray="6 4" opacity={0.7}/>;
          })()}

          {enemies.map(e => {
            const ex=e.x*CS, ey=e.y*CS, hp=e.hp/e.maxHp;
            return (
              <g key={e.id}>
                {e.boss && <circle cx={ex} cy={ey} r={e.size*0.9} fill="#ff000011" stroke="#ff0000" strokeWidth={1} opacity={0.5} filter="url(#bglow)"/>}
                <ellipse cx={ex} cy={ey+e.size*0.55} rx={e.size*0.6} ry={e.size*0.2} fill="#00000055"/>
                {e.poison>0 && <circle cx={ex} cy={ey} r={e.size*0.7} fill="#1abc9c22" stroke="#1abc9c" strokeWidth={1} opacity={0.6}/>}
                <text x={ex} y={ey+4} textAnchor="middle" dominantBaseline="middle" fontSize={e.size} filter={e.boss?"url(#bglow)":undefined}>{e.emoji}</text>
                <rect x={ex-20} y={ey-e.size*0.85-6} width={40} height={5} rx={2} fill="#111"/>
                <rect x={ex-20} y={ey-e.size*0.85-6} width={40*Math.max(0,hp)} height={5} rx={2} fill={hp>0.6?"#2ecc71":hp>0.3?"#f39c12":"#e74c3c"}/>
              </g>
            );
          })}

          {projs.map(p => {
            const big = p.type==="cannon"||p.type==="mage";
            return (
              <g key={p.id}>
                <circle cx={p.x*CS} cy={p.y*CS} r={big?13:9} fill={p.glow+"22"}/>
                <circle cx={p.x*CS} cy={p.y*CS} r={big?7:4} fill={p.glow} filter="url(#glow)"/>
              </g>
            );
          })}
        </svg>

        {Array.from({length:ROWS},(_,row)=>Array.from({length:COLS},(_,col)=>{
          const tower = towers.find(t=>t.col===col&&t.row===row);
          const lv = tower ? (tLv[tower.id]||1) : 0;
          const isHov = hover && hover.col===col && hover.row===row;
          const canPlace = !tower && gold>=selUnit.cost && phase==="prep";
          const canUpg = tower && tower.type===sel && lv<3 && gold>=UNIT_DEFS[tower.type].cost*lv && phase==="prep";
          return (
            <div key={`c${col}-${row}`}
              style={{ position:"absolute", left:col*CS, top:row*CS, width:CS, height:CS, cursor:phase==="prep"?"pointer":"default", background:isHov&&phase==="prep"?(canPlace||canUpg?"#ffffff14":"#ff000010"):"transparent", display:"flex", alignItems:"center", justifyContent:"center", border:isHov&&phase==="prep"?`1px solid ${canPlace||canUpg?"#ffffff22":"#ff000020"}`:"none", boxSizing:"border-box", transition:"background 0.08s", zIndex:10 }}
              onClick={()=>placeTower(col,row)}
              onMouseEnter={()=>setHover({col,row})}
              onMouseLeave={()=>setHover(null)}
            >
              {tower && (
                <div style={{ position:"relative", display:"flex", flexDirection:"column", alignItems:"center" }}>
                  <span style={{ fontSize:24, filter:`drop-shadow(0 0 5px ${UNIT_DEFS[tower.type].glow}88)` }}>{UNIT_DEFS[tower.type].emoji}</span>
                  <div style={{ fontSize:7, color:lv===3?"#ffd700":lv===2?"#c0a030":"#806020", lineHeight:1 }}>{["","","★","★★","★★★"][lv+1]||""}</div>
                  {isHov && phase==="prep" && (
                    <div onClick={e=>removeTower(tower.id,e)} style={{ position:"absolute", top:-18, right:-18, background:"#c0392b", color:"#fff", borderRadius:"50%", width:16, height:16, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:900, cursor:"pointer", zIndex:20 }}>×</div>
                  )}
                  {canUpg && isHov && (
                    <div style={{ position:"absolute", bottom:-16, background:"#f0c040", color:"#000", borderRadius:4, padding:"1px 4px", fontSize:8, fontWeight:900, whiteSpace:"nowrap" }}>⬆️Lv{lv+1}</div>
                  )}
                </div>
              )}
            </div>
          );
        }))}

        <FloatText items={floats}/>

        {phase==="stageClear" && (
          <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.88)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", zIndex:50, borderRadius:6 }}>
            <div style={{ fontSize:60, marginBottom:8 }}>🏆</div>
            <div style={{ fontSize:24, fontWeight:900, color:"#f0c040", letterSpacing:4, marginBottom:4 }}>ステージ制覇！</div>
            <div style={{ color:"#888", fontSize:13, marginBottom:20 }}>戦功: {score.toLocaleString()}</div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={()=>onBack("pick")} style={{ background:"linear-gradient(135deg,#f0c040,#a07000)", border:"none", borderRadius:10, padding:"11px 24px", color:"#000", fontSize:13, fontWeight:700, cursor:"pointer" }}>🗺️ ステージ選択</button>
              {stageId < STAGES.length-1 && <button onClick={()=>onBack("next")} style={{ background:"linear-gradient(135deg,#2ecc71,#1a7a40)", border:"none", borderRadius:10, padding:"11px 24px", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer" }}>▶️ 次へ</button>}
            </div>
          </div>
        )}
        {phase==="lost" && (
          <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.9)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", zIndex:50, borderRadius:6 }}>
            <div style={{ fontSize:60, marginBottom:8 }}>💀</div>
            <div style={{ fontSize:24, fontWeight:900, color:"#e74c3c", letterSpacing:4, marginBottom:4 }}>落城…</div>
            <div style={{ color:"#888", fontSize:13, marginBottom:20 }}>戦功: {score.toLocaleString()}</div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={()=>onBack("retry")} style={{ background:"linear-gradient(135deg,#c0392b,#7b0000)", border:"none", borderRadius:10, padding:"11px 24px", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer" }}>🔄 もう一度</button>
              <button onClick={()=>onBack("pick")} style={{ background:"linear-gradient(135deg,#2c3e50,#1a2530)", border:"1px solid #444", borderRadius:10, padding:"11px 24px", color:"#aaa", fontSize:13, fontWeight:700, cursor:"pointer" }}>🗺️ 選択へ</button>
            </div>
          </div>
        )}
      </div>

      {/* Unit selector */}
      <div style={{ display:"flex", gap:5, marginBottom:8, flexWrap:"wrap", justifyContent:"center" }}>
        {Object.entries(UNIT_DEFS).map(([key, u]) => {
          const active = sel===key, ok = gold>=u.cost;
          return (
            <button key={key} onClick={()=>setSel(key)} style={{ background:active?`linear-gradient(135deg,${u.color}33,${u.color}18)`:"#0e1208", border:active?`2px solid ${u.color}`:"2px solid #2a3a2a", borderRadius:8, padding:"5px 8px", cursor:"pointer", color:active?"#fff":ok?"#888":"#444", minWidth:54, opacity:ok?1:0.5, boxShadow:active?`0 0 12px ${u.color}44`:"none" }}>
              <div style={{ fontSize:18, filter:active?`drop-shadow(0 0 4px ${u.glow})`:""}}>{u.emoji}</div>
              <div style={{ fontSize:9, fontWeight:700 }}>{u.name}</div>
              <div style={{ fontSize:10, color:"#f0c040", fontWeight:700 }}>🪙{u.cost}</div>
            </button>
          );
        })}
      </div>

      <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:4 }}>
        {phase==="prep" && (
          <button onClick={startWave} style={{ background:hasBoss?"linear-gradient(135deg,#8b0080,#4b0040)":"linear-gradient(135deg,#c0392b,#8b0000)", border:`2px solid ${hasBoss?"#ff40ff":"#ff4444"}`, borderRadius:11, padding:"10px 28px", color:"#fff", fontSize:14, fontWeight:900, cursor:"pointer", letterSpacing:2 }}>
            {hasBoss?"💀 ボス波 開戦！":`⚔️ 第${wave+1}波 開戦！`}
          </button>
        )}
        {phase==="fighting" && <div style={{ background:"#0e0e0e", border:"2px solid #333", borderRadius:11, padding:"8px 20px", color:"#666", fontSize:12, letterSpacing:2 }}>🌊 戦闘中…</div>}
      </div>
      <div style={{ color:"#2a3a2a", fontSize:9, letterSpacing:1 }}>📌 配置 · ⬆️ 同ユニット再クリックでLv3強化 · ❌ ホバー→×で撤退</div>
    </div>
  );
}

// ── Root ────────────────────────────────────────────────────────────────────
export default function App() {
  const [screen,        setScreen]        = useState("title");
  const [currentStage,  setCurrentStage]  = useState(0);
  const [clearedStages, setClearedStages] = useState([]);
  const [totalScore,    setTotalScore]    = useState(0);

  const handleClear = (stageId, score) => {
    setClearedStages(cs => cs.includes(stageId) ? cs : [...cs, stageId]);
    setTotalScore(ts => ts + score);
  };

  if (screen === "title") return <TitleScreen onPlay={() => setScreen("stagePick")}/>;

  if (screen === "stagePick") return (
    <StageSelect
      clearedStages={clearedStages} totalScore={totalScore}
      onSelect={id => { setCurrentStage(id); setScreen("game"); }}
      onBack={() => setScreen("title")}
    />
  );

  if (screen === "game") return (
    <Game
      stageId={currentStage}
      onClear={handleClear}
      onBack={(action) => {
        if (action === "next" && currentStage < STAGES.length - 1) { setCurrentStage(currentStage + 1); setScreen("game"); }
        else if (action === "retry") { setScreen("game"); setCurrentStage(currentStage); }
        else setScreen("stagePick");
      }}
    />
  );

  return null;
}
