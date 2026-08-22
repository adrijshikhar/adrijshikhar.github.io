// ── locked spectral tokens (dark only) ───────────────────────────────────────
var GROUND="#0a0d12", PANEL="#12161d", PANE="#161b22";
var INK="#bfc6d0", INK_HI="#e8ecf1", MUTED="#848e9c";
var RULE="#242a33", RULE_HI="#555f6c";
var OB="#7fa8f5", CA="#bfd2f2", CF="#edebe6", CG="#f0ce72", CK="#eda05b", CM="#e8776a";
var MONO="IBM Plex Mono", SANS="Archivo";
var W=1440, MG=192, COL=1056;

function rgb(hex){var n=parseInt(hex.slice(1),16);
  return {r:(n>>16&255)/255,g:(n>>8&255)/255,b:(n&255)/255};}
function solid(hex){return [{type:"SOLID",color:rgb(hex)}];}

// PASS 1 — create only. Never remove a node in the same write as creating one:
// removal frees ids into a pool that creation re-draws from, so later nodes silently
// overwrite earlier ones (this is what cost the DESIGN SYSTEM frame on 0.14.0).
// The original pages are pruned by a separate second pass.
var page = figma.createPage();
page.name = "SPECTRAL — adrijshikhar.dev";
figma.currentPage = page;

["Regular","Medium","SemiBold","Bold","Black"].forEach(function(s){
  try{figma.loadFontAsync({family:SANS,style:s});}catch(e){}
  try{figma.loadFontAsync({family:MONO,style:s});}catch(e){}
});

function frame(name,x,y,w,h,fill){
  var f=figma.createFrame(); f.name=name; f.resize(w,h); f.x=x; f.y=y;
  f.fills=solid(fill||GROUND); page.appendChild(f); return f;
}
function box(parent,x,y,w,h,fill,stroke){
  var r=figma.createRectangle(); r.resize(w,h);
  r.x = parent.x + x; r.y = parent.y + y;
  r.fills = fill?solid(fill):[];
  if(stroke){ r.strokes=solid(stroke); r.strokeWeight=1; }
  parent.appendChild(r); return r;
}
function text(parent,x,y,s,size,hex,fam,style,track,wrapW){
  var t=figma.createText(); t.name=String(s).slice(0,40);
  try{t.fontName={family:fam||MONO,style:style||"Regular"};}catch(e){}
  t.fontSize=size||11;
  if(track!==undefined){ try{t.letterSpacing={value:track,unit:"PERCENT"};}catch(e){} }
  // hug the content so nothing wraps into its neighbour; opt in to wrapping
  // by passing wrapW, which fixes the width and lets height grow.
  t.characters=String(s);
  // autoResize must be applied AFTER characters, or the node keeps its 100x100 default
  try{ t.textAutoResize = wrapW ? "HEIGHT" : "WIDTH_AND_HEIGHT"; }catch(e){}
  if(wrapW){ try{ t.resize(wrapW, t.height); }catch(e){} }
  t.fills=solid(hex||INK);
  parent.appendChild(t); t.x=x; t.y=y; return t;
}
function label(parent,x,y,s){ return text(parent,x,y,s,11,MUTED,MONO,"Medium",14); }
function rule(parent,x,y,w,hex){ return box(parent,x,y,w,1,hex||RULE); }

var Y=0, GAP=96;

/* ─── 00 DESIGN SYSTEM ─────────────────────────────────────────────────── */
var ds=frame("00 — DESIGN SYSTEM",0,Y,W,1216); Y+=1216+GAP;
text(ds,MG,60,"SPECTRAL",56,CF,SANS,"Black",-4);
text(ds,MG,142,"Six hues from stellar classification. Each means a real temperature and has one job.",17,INK,SANS,"Regular",undefined,COL);
rule(ds,MG,172,COL,RULE_HI);

label(ds,MG,190,"FOUNDATION");
var sw=[["GROUND",GROUND,"L* 3.6"],["PANEL",PANEL,"footer · strip"],["PANE",PANE,"code only"],
        ["INK",INK,"11.31:1"],["INK-HI",INK_HI,"headings"],["MUTED",MUTED,"5.87:1"],
        ["RULE",RULE,"1.42 minor"],["RULE-HI",RULE_HI,"3.00 major"]];
for(i=0;i<sw.length;i++){ var x=MG+i*132;
  box(ds,x,210,124,64,sw[i][1],RULE);
  text(ds,x,286,sw[i][0],11,INK,MONO,"Medium",14);
  text(ds,x,302,sw[i][1],11,MUTED,MONO,"Regular",8);
  text(ds,x,318,sw[i][2],11,MUTED,MONO,"Regular",8);
}

label(ds,MG,370,"SPECTRAL RAMP — CLASS · STAR · RATIO · JOB");
var rp=[["O B",OB,"Rigel · Spica","8.17:1","links · active nav"],
        ["A",CA,"Sirius · Vega","12.71:1","types · infra tags"],
        ["F",CF,"Procyon","16.33:1","headings"],
        ["G",CG,"the Sun · Capella","12.77:1","strings · Sun values"],
        ["K",CK,"Arcturus","9.06:1","numbers · lang tags"],
        ["M",CM,"Betelgeuse","6.74:1","errors only"]];
for(i=0;i<rp.length;i++){ var rx=MG+i*176;
  box(ds,rx,390,168,140,null,RULE);
  text(ds,rx+16,412,rp[i][0],24,rp[i][1],SANS,"Black",-2);
  text(ds,rx+16,452,rp[i][2],11,MUTED,MONO,"Regular",8,136);
  text(ds,rx+16,472,rp[i][1],11,INK,MONO,"Regular",8);
  text(ds,rx+16,492,rp[i][3],11,INK,MONO,"Medium",8);
  text(ds,rx+16,512,rp[i][4],11,MUTED,MONO,"Regular",8,136);
}

label(ds,MG,580,"TYPE — FIVE STEPS, TWO FAMILIES");
var ty=[["DISPLAY — ARCHIVO BLACK · 112PX · -0.04EM · LH 0.88","ADRIJ SHIKHAR",64,SANS,"Black",CF],
        ["TITLE — ARCHIVO SEMIBOLD · 20PX","Senior Software Engineer",20,SANS,"SemiBold",INK_HI],
        ["BODY — ARCHIVO REGULAR · 17PX · MEASURE 38REM","I move data between systems that were never designed to agree.",17,SANS,"Regular",INK],
        ["SECONDARY — ARCHIVO REGULAR · 13PX","Load data from any source into your warehouse",13,SANS,"Regular",INK],
        ["DATA — IBM PLEX MONO · 11PX · THE FLOOR","SUN -4.2 CIVIL · MOON 62% WAXING · 12.97N 77.59E",11,MONO,"Medium",INK]];
var ty_y=600;
for(i=0;i<ty.length;i++){
  var h = ty[i][2]>40?128:64;
  box(ds,MG,ty_y,COL,h,null,RULE);
  text(ds,MG+16,ty_y+18,ty[i][0],11,OB,MONO,"Medium",14);
  text(ds,MG+16,ty_y+(ty[i][2]>40?52:34),ty[i][1],ty[i][2],ty[i][5],ty[i][3],ty[i][4]);
  ty_y+=h+12;
}

label(ds,MG,1058,"CONTRACTS");
var ct=["— NO CARDS. STRUCTURE IS RULES: 1PX #242A33 MINOR, #555F6C MAJOR.",
        "— RADIUS 0 EVERYWHERE. A MACHINED READOUT HAS SQUARE CORNERS.",
        "— ACCENT IS FOR STRUCTURE AND LARGE MARKS, NEVER SMALL BODY TEXT.",
        "— STATE IS CARRIED BY COLOUR, NEVER OPACITY.",
        "— CHROME RECEDES: FOUR CORNERS AT 11PX, NO PERSISTENT BAR.",
        "— CANVAS ALPHA UNDER TEXT STAYS UNDER 169/255."];
for(i=0;i<ct.length;i++) text(ds,MG,1080+i*18,ct[i],11,INK,MONO,"Regular",8);


/* ─── 01 HERO ──────────────────────────────────────────────────────────── */
var he=frame("01 — HERO",0,Y,W,900); Y+=900+GAP;
var cor=[["SUN","-4.2°",CG,"CIVIL TWILIGHT"],["MOON","62%",INK,"WAXING GIBBOUS"],
         ["OBSERVER","12.97°N 77.59°E",INK,""]];
for(i=0;i<cor.length;i++){
  text(he,32,32+i*16,cor[i][0],11,MUTED,MONO,"Medium",14);
  text(he,120,32+i*16,cor[i][1],11,cor[i][2],MONO,"Medium",8);
  if(cor[i][3]) text(he,240,32+i*16,cor[i][3],11,MUTED,MONO,"Regular",8);
}
box(he,W-176,28,72,22,OB); text(he,W-160,34,"HUMAN",11,GROUND,MONO,"Medium",14);
box(he,W-104,28,72,22,null,RULE); text(he,W-92,34,"MACHINE",11,MUTED,MONO,"Medium",14);
text(he,MG,300,"ADRIJ",112,CF,SANS,"Black",-4);
text(he,MG,420,"SHIKHAR",112,CF,SANS,"Black",-4);
box(he,MG,566,320,2,OB);
text(he,MG,592,"SENIOR SOFTWARE ENGINEER  ·  HEVO DATA  ·  BANGALORE",11,OB,MONO,"Medium",14);
text(he,MG,624,"I move data between systems that were never designed to agree, and write down what breaks on the way.",17,INK,SANS,"Regular",undefined,608);
box(he,0,836,W,64,PANEL); box(he,0,836,W,1,RULE_HI);
var st=[["ALT","+90…−35°"],["STARS","96"],["JD","2461170.88"]];
for(i=0;i<st.length;i++){
  text(he,MG+i*220,860,st[i][0],11,MUTED,MONO,"Medium",14);
  text(he,MG+i*220+72,860,st[i][1],11,INK,MONO,"Medium",8);
}

/* ─── 02 RULED ROWS ────────────────────────────────────────────────────── */
var rr=frame("02 — RULED ROWS (no cards)",0,Y,W,460); Y+=460+GAP;
text(rr,MG,64,"Experience",40,CF,SANS,"Black",-3);
text(rr,MG,124,"Structure comes from rules, not fills. There is no card left to be invisible.",17,INK,SANS,"Regular",undefined,COL);
var rows=[["01","Senior Software Engineer","Hevo Data — CDC pipelines and connector infrastructure",
           [["Java",CK],["Debezium",CA],["Temporal",CG]],"2022 →",RULE_HI],
          ["02","Software Development Intern","MTX Global",
           [["Python",CK],["Salesforce",CA]],"2021",RULE]];
var ry=180;
for(i=0;i<rows.length;i++){ var r0=rows[i];
  text(rr,MG,ry,r0[0],11,OB,MONO,"Medium",14);
  text(rr,MG+56,ry-4,r0[1],20,INK_HI,SANS,"SemiBold");
  text(rr,MG+56,ry+26,r0[2],13,MUTED,SANS,"Regular");
  var tx=MG+56;
  for(var j=0;j<r0[3].length;j++){
    text(rr,tx,ry+52,r0[3][j][0],11,r0[3][j][1],MONO,"Medium",8);
    tx += r0[3][j][0].length*8 + 24;
  }
  text(rr,MG+COL-80,ry,r0[4],11,MUTED,MONO,"Medium",8);
  rule(rr,MG,ry+84,COL,r0[5]);
  ry += 116;
}

/* ─── 03 CODE ──────────────────────────────────────────────────────────── */
var cd=frame("03 — CODE (the ramp earns its keep)",0,Y,W,440); Y+=440+GAP;
text(cd,MG,64,"Article",40,CF,SANS,"Black",-3);
text(cd,MG,124,"The ramp IS the syntax palette. Nothing invented per-language.",17,INK,SANS,"Regular",undefined,COL);
box(cd,MG,168,COL,180,PANE);
var code=[[[ "// the decoder was fine. the file was lying.",MUTED]],
          [["if",OB],[" (endLogPos > ",INK],["4294967295",CK],[") {",INK]],
          [["  throw new ",OB],["BinlogPositionWrap",CA],["(",INK]],
          [['    "position exceeds 4 GiB"',CG]],
          [["  );",INK]],[["}",INK]]];
for(i=0;i<code.length;i++){ var cx=MG+20;
  for(j=0;j<code[i].length;j++){
    text(cd,cx,190+i*22,code[i][j][0],12,code[i][j][1],MONO,"Regular",0);
    cx += code[i][j][0].length*7.2;
  }
}
var leg="Keyword → O/B  ·  Type → A  ·  String → G  ·  Number → K  ·  Comment → muted  ·  Error → M";
text(cd,MG,372,leg,11,MUTED,MONO,"Regular",8);

/* ─── 04 RAIL STATES ───────────────────────────────────────────────────── */
var rs=frame("04 — RAIL STATES",0,Y,W,520); Y+=520+GAP;
text(rs,MG,64,"Rail — state by colour, never opacity",40,CF,SANS,"Black",-3);
text(rs,MG,124,"Today: --muted at opacity 0.4 = 1.75:1 light / 2.08:1 dark, and 4 of 6 destinations hidden.",17,INK,SANS,"Regular",undefined,COL);
label(rs,MG,180,"PROPOSED — ALL SIX VISIBLE");
var nav=[["01","About","active",OB],["02","Experience","hover",INK_HI],["03","Projects","focus-visible",INK_HI],
         ["04","Writing","rest",MUTED],["05","Education","rest",MUTED],["06","Achievements","rest",MUTED]];
for(i=0;i<nav.length;i++){
  text(rs,MG,208+i*24,nav[i][0],11,nav[i][3],MONO,"Medium",14);
  text(rs,MG+36,208+i*24,nav[i][1],13,nav[i][3],SANS,"Regular");
  text(rs,MG+180,208+i*24,nav[i][2],11,MUTED,MONO,"Regular",8);
  if(i===0) box(rs,MG-12,208,2,14,OB);
}
label(rs,MG+560,180,"TODAY — 2 OF 6 VISIBLE");
var old=[["01","About","1.75:1 light"],["02","Experience","2.08:1 dark"],
         ["03","Projects","clipped"],["04","Writing","clipped"]];
for(i=0;i<old.length;i++){
  text(rs,MG+560,208+i*24,old[i][0],11,MUTED,MONO,"Medium",14);
  text(rs,MG+596,208+i*24,old[i][1],13,MUTED,SANS,"Regular");
  text(rs,MG+740,208+i*24,old[i][2],11,CM,MONO,"Regular",8);
}

/* ─── 05 CHROME INVENTORY ──────────────────────────────────────────────── */
var ch=frame("05 — CHROME INVENTORY",0,Y,W,720); Y+=720+GAP;
text(ch,MG,64,"Chrome — all 14, mapped",40,CF,SANS,"Black",-3);
text(ch,MG,124,"Fourteen labelled readouts, of which three are three counts of the same sky. Nothing deleted silently.",17,INK,SANS,"Regular",undefined,COL);
var hd=["ELEMENT","FATE","REASON"];
for(i=0;i<hd.length;i++) text(ch,MG+i*352,180,hd[i],11,MUTED,MONO,"Medium",14);
rule(ch,MG,198,COL,RULE_HI);
var inv=[["SUN +23.2° · DAY","KEEP · 11px","Explains the glow",CG],
 ["MOON 23% · WANING","KEEP · 11px","Explains the terminator",INK],
 ["OBSERVER 12.97°N","KEEP · 11px","Explains why this sky",INK],
 ["ALT +90…−35°","MOVE → strip","True, but not first-viewport",CA],
 ["STARS 96","MOVE → strip","A count, not a magnitude limit",CA],
 ["JD 2461260.981","MOVE → strip","The real input to every position",CA],
 ["SIDEREAL 13:50:41","MOVE → strip","Per-second mutation",CA],
 ["PLANETS 3 OF 5 UP","CUT","Third count of the same sky",CM],
 ["ABOVE YOU 58 OF 103","CUT","Fourth count of the same sky",CM],
 ["BRIGHTEST SUN · VENUS","CUT","Restates canvas labels",CM],
 ["SOURCE DEFAULT","CUT from hero","A debug confession",CM],
 ["SCROLL — CONSTELLATIONS","CUT","Flavour fighting the contract",CM],
 ["MOVE · STARS BEND","CUT","Many inputs cannot follow it",CM],
 ["ORBITAL MECHANICS","KEEP · relocated","A real affordance",CG]];
for(i=0;i<inv.length;i++){ var iy=218+i*32;
  text(ch,MG,iy,inv[i][0],11,INK,MONO,"Regular",8);
  text(ch,MG+352,iy,inv[i][1],11,inv[i][3],MONO,"Medium",8);
  text(ch,MG+704,iy,inv[i][2],11,MUTED,MONO,"Regular",8);
  rule(ch,MG,iy+20,COL,RULE);
}

/* ── shared pieces ─────────────────────────────────────────────────────── */
function sectionHead(f,x,y,no,title){
  text(f,x,y,no,11,OB,MONO,"Medium",14);
  text(f,x,y+22,title,48,CF,SANS,"Black",-3);
  return y+96;
}
function postRow(f,x,y,date,title,excerpt,tags,w){
  text(f,x,y,date,11,CK,MONO,"Medium",8);
  text(f,x+120,y-4,title,20,INK_HI,SANS,"SemiBold",undefined,(w||COL)-140);
  text(f,x+120,y+28,excerpt,13,MUTED,SANS,"Regular",undefined,(w||COL)-140);
  var tx=x+120;
  for(var j=0;j<tags.length;j++){ text(f,tx,y+56,tags[j][0],11,tags[j][1],MONO,"Medium",8); tx+=tags[j][0].length*8+24; }
  rule(f,x,y+84,w||COL,RULE);
  return y+116;
}
function btn(f,x,y,labelTxt,w){
  box(f,x,y,w||188,40,null,RULE_HI);
  text(f,x+20,y+13,labelTxt,11,CG,MONO,"Medium",14);
  return y+40;
}

/* ─── 06 HOME (composed) ───────────────────────────────────────────────── */
var hm=frame("06 — HOME (composed)",0,Y,W,2160); Y+=2160+GAP;
// left column: identity + wayfinding rail (all six visible — decision)
text(hm,MG,64,"ADRIJ",32,CF,SANS,"Black",-3);
text(hm,MG,102,"SHIKHAR",32,CF,SANS,"Black",-3);
text(hm,MG,150,"Senior Software Engineer",13,INK,SANS,"Regular");
text(hm,MG,170,"Hevo Data · Bangalore",13,MUTED,SANS,"Regular");
rule(hm,MG,200,232,RULE);
var navi=[["01","About",OB],["02","Experience",MUTED],["03","Writing",MUTED],
          ["04","Projects",MUTED],["05","Education",MUTED],["06","Contact",MUTED]];
for(i=0;i<navi.length;i++){
  text(hm,MG,224+i*24,navi[i][0],11,navi[i][2],MONO,"Medium",14);
  text(hm,MG+32,224+i*24,navi[i][1],13,navi[i][2],SANS,"Regular");
}
box(hm,MG-12,224,2,14,OB);
text(hm,MG,400,"adrijshikhar@gmail.com",11,OB,MONO,"Regular",8);
text(hm,MG,420,"github · linkedin · resume",11,MUTED,MONO,"Regular",8);
// right column: the sections
var CX=MG+320, CW=COL-320+MG-MG;
var hy=64;
hy=sectionHead(hm,CX,hy,"01","About");
text(hm,CX,hy,"I move data between systems that were never designed to agree, and write down what breaks on the way. Four years on CDC pipelines and connector infrastructure at Hevo, where the interesting failures are never in the happy path.",17,INK,SANS,"Regular",undefined,704);
hy+=120; rule(hm,CX,hy,704,RULE_HI); hy+=48;
hy=sectionHead(hm,CX,hy,"02","Experience");
hy=postRow(hm,CX,hy,"2022 →","Senior Software Engineer","Hevo Data — CDC pipelines and connector infrastructure",[["Java",CK],["Debezium",CA],["Temporal",CG]],704);
hy=postRow(hm,CX,hy,"2021","Software Development Intern","MTX Global",[["Python",CK],["Salesforce",CA]],704);
btn(hm,CX,hy,"FULL RESUME  →"); hy+=88; rule(hm,CX,hy,704,RULE_HI); hy+=48;
hy=sectionHead(hm,CX,hy,"03","Writing");
hy=postRow(hm,CX,hy,"2026-04","The decoder was fine. The file was lying.","A MySQL binlog position wrapped past 4 GiB and took a pipeline with it.",[["MySQL",CK],["Debezium",CA]],704);
hy=postRow(hm,CX,hy,"2026-02","25,000 objects, one schema registry","What breaks when catalogue size stops being a rounding error.",[["Kafka",CA],["Postgres",CK]],704);
btn(hm,CX,hy,"ALL WRITING  →"); hy+=88; rule(hm,CX,hy,704,RULE_HI); hy+=48;
hy=sectionHead(hm,CX,hy,"04","Projects");
hy=postRow(hm,CX,hy,"2026","hevo-connector-agent","Agentic connector scaffolding — originator and architect.",[["TypeScript",CK],["LLM",CA]],704);
hy=postRow(hm,CX,hy,"2026","resume-ops","Aggregates dev history into resume bullets. Open source.",[["Skill",CA]],704);
rule(hm,CX,hy,704,RULE_HI); hy+=48;
hy=sectionHead(hm,CX,hy,"05","Education");
hy=postRow(hm,CX,hy,"2018-22","B.Tech, Electrical Engineering","Indian Institute of Technology Roorkee",[],704);
rule(hm,CX,hy,704,RULE_HI); hy+=48;
hy=sectionHead(hm,CX,hy,"06","Contact");
text(hm,CX,hy,"adrijshikhar@gmail.com",20,OB,SANS,"SemiBold");
text(hm,CX,hy+34,"Open to conversations about data infrastructure and agent-native tooling.",13,MUTED,SANS,"Regular",undefined,704);

/* ─── 07 BLOGS INDEX ───────────────────────────────────────────────────── */
var bl=frame("07 — BLOGS index",0,Y,W,700); Y+=700+GAP;
text(bl,MG,64,"Writing",48,CF,SANS,"Black",-3);
text(bl,MG,124,"Failures worth writing down. Mostly data infrastructure.",17,INK,SANS,"Regular",undefined,COL);
rule(bl,MG,168,COL,RULE_HI);
var by=200;
by=postRow(bl,MG,by,"2026-04","The decoder was fine. The file was lying.","A MySQL binlog position wrapped past 4 GiB and took a pipeline with it. The decoder was innocent.",[["MySQL",CK],["Debezium",CA]]);
by=postRow(bl,MG,by,"2026-02","25,000 objects, one schema registry","What breaks when catalogue size stops being a rounding error.",[["Kafka",CA],["Postgres",CK]]);
by=postRow(bl,MG,by,"2025-11","Temporal for people who already have cron","When a workflow engine earns its operational cost.",[["Temporal",CG],["Java",CK]]);
by=postRow(bl,MG,by,"2025-08","README-driven connectors","Writing the docs first changed the interface.",[["Docs",CA]]);

/* ─── 08 ARTICLE (full page) ───────────────────────────────────────────── */
var ar=frame("08 — ARTICLE (readme post)",0,Y,W,1180); Y+=1180+GAP;
text(ar,MG,56,"←  WRITING",11,MUTED,MONO,"Medium",14);
text(ar,MG,96,"The decoder was fine.",56,CF,SANS,"Black",-4);
text(ar,MG,160,"The file was lying.",56,CF,SANS,"Black",-4);
text(ar,MG,248,"2026-04-11   ·   11 MIN   ·   MYSQL · DEBEZIUM",11,CK,MONO,"Medium",14);
rule(ar,MG,280,COL,RULE_HI);
var ay=320;
var paras=[
 "A pipeline stopped advancing. The connector logged a position it could not possibly have read, the decoder threw, and every retry produced the same offset. The obvious conclusion was a corrupt binlog.",
 "It was not corrupt. MySQL writes end_log_pos as a 32-bit unsigned integer. Past 4 GiB the value wraps, and the file keeps growing while the position restarts from zero. The decoder was reading exactly what was written down. The file was the thing that lied.",
 "The fix is a guard where all callers route through, not at the one call site the incident named:"];
for(i=0;i<paras.length;i++){ text(ar,MG,ay,paras[i],17,INK,SANS,"Regular",undefined,608); ay+=(paras[i].length>200?116:88); }
box(ar,MG,ay,COL,176,PANE);
var acode=[[["// the decoder was fine. the file was lying.",MUTED]],
 [["if",OB],[" (endLogPos > ",INK],["4294967295",CK],[") {",INK]],
 [["  throw new ",OB],["BinlogPositionWrap",CA],["(",INK]],
 [['    "position exceeds 4 GiB"',CG]],[["  );",INK]],[["}",INK]]];
for(i=0;i<acode.length;i++){ var acx=MG+20;
  for(var jj=0;jj<acode[i].length;jj++){
    text(ar,acx,ay+20+i*22,acode[i][jj][0],12,acode[i][jj][1],MONO,"Regular",0);
    acx+=acode[i][jj][0].length*7.2; } }
ay+=212;
box(ar,MG,ay,3,72,OB);
text(ar,MG+24,ay+4,"A wrapped counter is not corruption. It is a smaller type than the thing it counts.",20,INK_HI,SANS,"SemiBold",undefined,584);
ay+=112;
text(ar,MG,ay,"The guard went in the shared decode path. Sibling callers that had the same latent bug were fixed by the same three lines.",17,INK,SANS,"Regular",undefined,608);
ay+=80; rule(ar,MG,ay,COL,RULE); 
text(ar,MG,ay+20,"MYSQL",11,CK,MONO,"Medium",8);
text(ar,MG+80,ay+20,"DEBEZIUM",11,CA,MONO,"Medium",8);
text(ar,MG+180,ay+20,"POSTMORTEM",11,CA,MONO,"Medium",8);

/* ─── 09 RESUME ────────────────────────────────────────────────────────── */
var rz=frame("09 — RESUME",0,Y,W,1000); Y+=1000+GAP;
text(rz,MG,64,"Resume",48,CF,SANS,"Black",-3);
text(rz,MG,124,"Senior Software Engineer · data infrastructure · Bangalore",17,INK,SANS,"Regular",undefined,COL);
btn(rz,MG+COL-188,64,"DOWNLOAD PDF  ↓");
rule(rz,MG,168,COL,RULE_HI);
var zy=200;
text(rz,MG,zy,"EXPERIENCE",11,MUTED,MONO,"Medium",14); zy+=28;
zy=postRow(rz,MG,zy,"2022 →","Senior Software Engineer","Hevo Data — CDC pipelines, connector infrastructure, 25K objects synced, 200 P0/P1 triaged",[["Java",CK],["Debezium",CA],["Temporal",CG],["Kafka",CA]]);
zy=postRow(rz,MG,zy,"2021","Software Development Intern","MTX Global — Salesforce integrations",[["Python",CK],["Salesforce",CA]]);
zy+=16;
text(rz,MG,zy,"EDUCATION",11,MUTED,MONO,"Medium",14); zy+=28;
zy=postRow(rz,MG,zy,"2018-22","B.Tech, Electrical Engineering","Indian Institute of Technology Roorkee",[]);
zy+=16;
text(rz,MG,zy,"SKILLS",11,MUTED,MONO,"Medium",14); zy+=28;
var sk=[["LANGUAGES","Java · Python · TypeScript · SQL",CK],
        ["DATA","Debezium · Kafka · Temporal · Postgres · MySQL · Snowflake",CA],
        ["OBSERVABILITY","OpenTelemetry · Grafana · Coralogix · InfluxDB",CA],
        ["PRACTICE","CDC · schema evolution · incident response · code review at scale",CG]];
for(i=0;i<sk.length;i++){
  text(rz,MG,zy+i*32,sk[i][0],11,MUTED,MONO,"Medium",14);
  text(rz,MG+180,zy+i*32,sk[i][1],13,INK,SANS,"Regular",undefined,COL-180);
}

/* ─── 10 ARCHIVE ───────────────────────────────────────────────────────── */
var av=frame("10 — ARCHIVE (projects)",0,Y,W,860); Y+=860+GAP;
text(av,MG,64,"Archive",48,CF,SANS,"Black",-3);
text(av,MG,124,"Everything else — tools, experiments, things that stopped being interesting.",17,INK,SANS,"Regular",undefined,COL);
rule(av,MG,168,COL,RULE_HI);
var proj=[["hevo-connector-agent","Agentic connector scaffolding. Originator and architect.",[["TypeScript",CK],["LLM",CA]]],
          ["resume-ops","Aggregates GitHub and Jira history into resume bullets.",[["Skill",CA]]],
          ["adrijshikhar.dev","This site. Astro, real computed astronomy in the background.",[["Astro",CK],["Canvas",CA]]],
          ["binlog-probe","Reproduces the 4 GiB wrap in a container.",[["Go",CK]]],
          ["sentinel-tests","Integration harness for connector behaviour.",[["Java",CK]]],
          ["dotfiles","Twelve years of accumulated opinions.",[["Shell",CK]]]];
var CW2=(COL-32)/2;
for(i=0;i<proj.length;i++){
  var col=i%2, row=Math.floor(i/2);
  var px=MG+col*(CW2+32), py=200+row*160;
  text(av,px,py,proj[i][0],20,INK_HI,SANS,"SemiBold");
  text(av,px,py+30,proj[i][1],13,MUTED,SANS,"Regular",undefined,CW2);
  var ptx=px;
  for(jj=0;jj<proj[i][2].length;jj++){ text(av,ptx,py+80,proj[i][2][jj][0],11,proj[i][2][jj][1],MONO,"Medium",8); ptx+=proj[i][2][jj][0].length*8+24; }
  rule(av,px,py+108,CW2,RULE);
}

/* ─── 11 MACHINE VIEW ──────────────────────────────────────────────────── */
var mv=frame("11 — MACHINE VIEW (?machine=true)",0,Y,W,900); Y+=900+GAP;
box(mv,W-176,28,72,22,null,RULE); text(mv,W-160,34,"HUMAN",11,MUTED,MONO,"Medium",14);
box(mv,W-104,28,72,22,OB); text(mv,W-92,34,"MACHINE",11,GROUND,MONO,"Medium",14);
var raw=["# Adrij Shikhar","","Senior Software Engineer — Hevo Data, Bangalore","",
 "## About","","I move data between systems that were never designed to agree,",
 "and write down what breaks on the way.","",
 "## Experience","",
 "### Senior Software Engineer — Hevo Data (2022 - present)","",
 "- CDC pipelines and connector infrastructure","- 25,000 objects synced; sub-second latency",
 "- 200+ P0/P1 incidents triaged","- 1,889 code reviews across 47 repositories","",
 "### Software Development Intern — MTX Global (2021)","",
 "- Salesforce integrations","",
 "## Writing","",
 "- 2026-04-11 — The decoder was fine. The file was lying.","- 2026-02-03 — 25,000 objects, one schema registry","",
 "## Contact","","adrijshikhar@gmail.com"];
for(i=0;i<raw.length;i++){
  var ln=raw[i], cl=INK;
  if(ln.indexOf("###")===0) cl=CA; else if(ln.indexOf("##")===0) cl=CG; else if(ln.indexOf("#")===0) cl=CF;
  else if(ln.indexOf("- ")===0) cl=INK; 
  text(mv,MG,72+i*22,ln||" ",12,cl,MONO,"Regular",0);
}

/* ─── 12 / 13 MOBILE 390 ───────────────────────────────────────────────── */
var MX=1600, MW=390, MPAD=24;
var mh=frame("12 — MOBILE home 390",MX,0,MW,1180);
text(mh,MPAD,28,"SUN -4.2°  CIVIL",11,CG,MONO,"Medium",8);
text(mh,MPAD,44,"12.97°N 77.59°E",11,MUTED,MONO,"Regular",8);
text(mh,MPAD,140,"ADRIJ",56,CF,SANS,"Black",-4);
text(mh,MPAD,200,"SHIKHAR",56,CF,SANS,"Black",-4);
box(mh,MPAD,272,160,2,OB);
text(mh,MPAD,292,"SENIOR SOFTWARE ENGINEER",11,OB,MONO,"Medium",14);
text(mh,MPAD,312,"HEVO DATA · BANGALORE",11,OB,MONO,"Medium",14);
text(mh,MPAD,348,"I move data between systems that were never designed to agree, and write down what breaks on the way.",17,INK,SANS,"Regular",undefined,MW-MPAD*2);
rule(mh,MPAD,460,MW-MPAD*2,RULE_HI);
var mhy=488;
text(mh,MPAD,mhy,"01",11,OB,MONO,"Medium",14);
text(mh,MPAD,mhy+20,"About",32,CF,SANS,"Black",-3); mhy+=76;
text(mh,MPAD,mhy,"Four years on CDC pipelines, where the interesting failures are never in the happy path.",17,INK,SANS,"Regular",undefined,MW-MPAD*2);
mhy+=96; rule(mh,MPAD,mhy,MW-MPAD*2,RULE); mhy+=28;
text(mh,MPAD,mhy,"02",11,OB,MONO,"Medium",14);
text(mh,MPAD,mhy+20,"Experience",32,CF,SANS,"Black",-3); mhy+=76;
text(mh,MPAD,mhy,"2022 →",11,CK,MONO,"Medium",8);
text(mh,MPAD,mhy+18,"Senior Software Engineer",20,INK_HI,SANS,"SemiBold",undefined,MW-MPAD*2);
text(mh,MPAD,mhy+46,"Hevo Data",13,MUTED,SANS,"Regular");
text(mh,MPAD,mhy+70,"Java",11,CK,MONO,"Medium",8);
text(mh,MPAD+60,mhy+70,"Debezium",11,CA,MONO,"Medium",8);
rule(mh,MPAD,mhy+98,MW-MPAD*2,RULE); mhy+=126;
text(mh,MPAD,mhy,"THE RAIL COLLAPSES BELOW 1180PX —",11,MUTED,MONO,"Regular",8);
text(mh,MPAD,mhy+16,"NUMBERS STAY AS SECTION EYEBROWS.",11,MUTED,MONO,"Regular",8);
box(mh,0,1056,MW,64,PANEL); box(mh,0,1056,MW,1,RULE_HI);
text(mh,MPAD,1080,"ALT +90…−35°  STARS 96",11,MUTED,MONO,"Medium",8);

var ma=frame("13 — MOBILE article 390",MX+MW+64,0,MW,940);
text(ma,MPAD,28,"←  WRITING",11,MUTED,MONO,"Medium",14);
text(ma,MPAD,72,"The decoder",40,CF,SANS,"Black",-4);
text(ma,MPAD,118,"was fine.",40,CF,SANS,"Black",-4);
text(ma,MPAD,180,"2026-04-11 · 11 MIN",11,CK,MONO,"Medium",14);
rule(ma,MPAD,208,MW-MPAD*2,RULE_HI);
var may=236;
var mp=["A pipeline stopped advancing. Every retry produced the same offset.",
        "MySQL writes end_log_pos as a 32-bit unsigned integer. Past 4 GiB the value wraps while the file keeps growing.",
        "The decoder was reading exactly what was written down."];
for(i=0;i<mp.length;i++){ text(ma,MPAD,may,mp[i],17,INK,SANS,"Regular",undefined,MW-MPAD*2); may+=(mp[i].length>90?120:88); }
box(ma,MPAD,may,MW-MPAD*2,132,PANE);
var mcode=[[["if",OB],[" (pos > ",INK],["4294967295",CK],[") {",INK]],
           [["  throw new ",OB],["Wrap",CA],["(",INK]],
           [['    "exceeds 4 GiB"',CG]],[["  );",INK]],[["}",INK]]];
for(i=0;i<mcode.length;i++){ var mcx=MPAD+14;
  for(jj=0;jj<mcode[i].length;jj++){
    text(ma,mcx,may+16+i*22,mcode[i][jj][0],11,mcode[i][jj][1],MONO,"Regular",0);
    mcx+=mcode[i][jj][0].length*6.6; } }
may+=160;
box(ma,MPAD,may,3,56,OB);
text(ma,MPAD+18,may+2,"A wrapped counter is not corruption.",17,INK_HI,SANS,"SemiBold",undefined,MW-MPAD*2-24);
may+=88; rule(ma,MPAD,may,MW-MPAD*2,RULE);
text(ma,MPAD,may+18,"MYSQL",11,CK,MONO,"Medium",8);
text(ma,MPAD+72,may+18,"DEBEZIUM",11,CA,MONO,"Medium",8);

"BUILT " + page.children.length + " frames"
