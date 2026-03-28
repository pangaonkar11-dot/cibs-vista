import { useState, useEffect, useRef } from "react";

// ── GOOGLE SHEETS DATA PIPELINE ───────────────────────────────────────────────
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxFmt0azInyYV-4QzDl58q6DaYX9Wj3BKKbtmHI5G2xJjm69iYQkEndwN1mKI7vI64A8A/exec";
const getURLParam = (key) => { try { return new URLSearchParams(window.location.search).get(key)||""; } catch { return ""; } };
const autoFileNo  = () => { const yy=String(new Date().getFullYear()).slice(-2); return `CIBS-${yy}-${String(Math.floor(Math.random()*9000)+1000)}`; };

// ══════════════════════════════════════════════════════════════════════════════
//  TEST CONSTANTS
// ══════════════════════════════════════════════════════════════════════════════
const SHAPES = [
  {code:1,name:"Circle"},{code:2,name:"Triangle"},{code:3,name:"Square"},
  {code:4,name:"Rhombus"},{code:5,name:"Pentagon"},{code:6,name:"Hexagon"},{code:7,name:"Octagon"},
];
const COLORS = [
  {code:1,name:"Red",hex:"#EF4444"},{code:2,name:"Orange",hex:"#F97316"},
  {code:3,name:"Yellow",hex:"#EAB308"},{code:4,name:"Green",hex:"#22C55E"},
  {code:5,name:"Blue",hex:"#3B82F6"},{code:6,name:"Indigo",hex:"#6366F1"},
  {code:7,name:"Violet",hex:"#A855F7"},
];
const SMILEYS = [
  {code:1,name:"Very Happy",emoji:"😄"},{code:2,name:"Happy",emoji:"🙂"},
  {code:3,name:"Calm",emoji:"😐"},{code:4,name:"Worried",emoji:"😟"},
  {code:5,name:"Sad",emoji:"😢"},{code:6,name:"Angry",emoji:"😠"},
  {code:7,name:"Scared",emoji:"😨"},
];

// ══════════════════════════════════════════════════════════════════════════════
//  PSYCHOMETRIC REFERENCE TABLES
// ══════════════════════════════════════════════════════════════════════════════
const SHAPE_DATA = {
  1:{name:"Circle",  complexity:3, geometry:"Curvilinear",  cogStyle:"Holistic-Integrative",   BFopen:5, BFcons:3, BFextra:5, BFagree:6, BFneuro:3},
  2:{name:"Triangle",complexity:4, geometry:"Angular-Sharp",cogStyle:"Analytical-Sequential",  BFopen:5, BFcons:5, BFextra:4, BFagree:3, BFneuro:4},
  3:{name:"Square",  complexity:2, geometry:"Rectilinear",  cogStyle:"Practical-Systematic",   BFopen:2, BFcons:7, BFextra:3, BFagree:5, BFneuro:3},
  4:{name:"Rhombus", complexity:5, geometry:"Angular-Fluid",cogStyle:"Adaptive-Creative",      BFopen:6, BFcons:4, BFextra:5, BFagree:4, BFneuro:3},
  5:{name:"Pentagon",complexity:6, geometry:"Complex-Angular",cogStyle:"Divergent-Exploratory",BFopen:7, BFcons:3, BFextra:4, BFagree:4, BFneuro:4},
  6:{name:"Hexagon", complexity:6, geometry:"Symmetric-Complex",cogStyle:"Systemic-Precise",   BFopen:5, BFcons:7, BFextra:3, BFagree:5, BFneuro:2},
  7:{name:"Octagon", complexity:5, geometry:"Complex-Symmetric",cogStyle:"Tenacious-Enduring", BFopen:4, BFcons:6, BFextra:3, BFagree:4, BFneuro:3},
};
const COLOR_DATA = {
  1:{name:"Red",   temp:"hot",      arousal:7, valence:4, BFextra:7, BFneuro:6, physArousal:"High",   socialWarm:6},
  2:{name:"Orange",temp:"warm",     arousal:6, valence:6, BFextra:6, BFneuro:4, physArousal:"Elevated",socialWarm:7},
  3:{name:"Yellow",temp:"warm",     arousal:5, valence:7, BFextra:5, BFneuro:3, physArousal:"Moderate",socialWarm:6},
  4:{name:"Green", temp:"cool",     arousal:4, valence:6, BFextra:4, BFneuro:2, physArousal:"Moderate",socialWarm:5},
  5:{name:"Blue",  temp:"cool",     arousal:3, valence:6, BFextra:3, BFneuro:2, physArousal:"Low",    socialWarm:4},
  6:{name:"Indigo",temp:"dark-cool",arousal:3, valence:4, BFextra:2, BFneuro:4, physArousal:"Low",    socialWarm:3},
  7:{name:"Violet",temp:"dark-cool",arousal:4, valence:4, BFextra:2, BFneuro:5, physArousal:"Low",    socialWarm:3},
};
const SHADE_DATA = {
  1:{label:"Shade 1 (Lightest)", rawEmo:95, mentalBurden:5,  emotOpen:95, ruminScore:5},
  2:{label:"Shade 2 (Light)",    rawEmo:82, mentalBurden:15, emotOpen:82, ruminScore:12},
  3:{label:"Shade 3",            rawEmo:70, mentalBurden:28, emotOpen:68, ruminScore:22},
  4:{label:"Shade 4 (Medium)",   rawEmo:55, mentalBurden:44, emotOpen:52, ruminScore:38},
  5:{label:"Shade 5",            rawEmo:40, mentalBurden:58, emotOpen:36, ruminScore:55},
  6:{label:"Shade 6 (Dark)",     rawEmo:28, mentalBurden:73, emotOpen:22, ruminScore:70},
  7:{label:"Shade 7 (Darkest)",  rawEmo:15, mentalBurden:88, emotOpen:10, ruminScore:85},
};
const SMILEY_DATA = {
  1:{name:"Very Happy",valence:95,arousal:72,negAffect:5,  anx:3,  dep:3,  anger:3,  fear:3},
  2:{name:"Happy",     valence:80,arousal:58,negAffect:15, anx:10, dep:10, anger:8,  fear:8},
  3:{name:"Calm",      valence:65,arousal:32,negAffect:28, anx:20, dep:18, anger:12, fear:15},
  4:{name:"Worried",   valence:35,arousal:62,negAffect:58, anx:65, dep:38, anger:30, fear:55},
  5:{name:"Sad",       valence:20,arousal:22,negAffect:75, anx:35, dep:78, anger:22, fear:40},
  6:{name:"Angry",     valence:15,arousal:88,negAffect:80, anx:42, dep:35, anger:88, fear:35},
  7:{name:"Scared",    valence:10,arousal:72,negAffect:85, anx:88, dep:55, anger:30, fear:88},
};

// ══════════════════════════════════════════════════════════════════════════════
//  CLASSIFICATION HELPERS
// ══════════════════════════════════════════════════════════════════════════════
function iqBand(cq) {
  if(cq>=130)return{band:"Very Superior",          percentile:"≥98th",  desc:"Intellectual functioning in the very superior range"};
  if(cq>=120)return{band:"Superior",               percentile:"91–97th",desc:"Intellectual functioning in the superior range"};
  if(cq>=110)return{band:"High Average",            percentile:"75–90th",desc:"Intellectual functioning in the high average range"};
  if(cq>=90) return{band:"Average",                 percentile:"25–74th",desc:"Intellectual functioning in the average range"};
  if(cq>=80) return{band:"Low Average",             percentile:"9–24th", desc:"Intellectual functioning in the low average range"};
  if(cq>=70) return{band:"Borderline",              percentile:"2–8th",  desc:"Intellectual functioning in the borderline range"};
  return              {band:"Intellectually Limited",percentile:"<2nd",   desc:"Intellectual functioning in the limited range"};
}
function eqBand(eq) {
  if(eq>=115)return{band:"Well Above Average",percentile:"≥84th",desc:"Emotional intelligence markedly above normative expectations"};
  if(eq>=100)return{band:"Above Average",     percentile:"50–83rd",desc:"Emotional intelligence above the normative mean"};
  if(eq>=85) return{band:"Average",            percentile:"16–49th",desc:"Emotional intelligence within the normative range"};
  if(eq>=70) return{band:"Below Average",      percentile:"2–15th", desc:"Emotional intelligence below the normative mean"};
  return             {band:"Well Below Average",percentile:"<2nd",   desc:"Emotional intelligence markedly below normative expectations"};
}
function phqAnalog(score) {
  if(score<=10)return{level:"None to Minimal",    severity:0, desc:"No clinically significant depressive or distress symptoms indicated"};
  if(score<=25)return{level:"Mild",               severity:1, desc:"Mild emotional distress; monitor and provide psychoeducation"};
  if(score<=50)return{level:"Moderate",           severity:2, desc:"Moderate distress warranting structured supportive intervention"};
  if(score<=75)return{level:"Moderately Severe",  severity:3, desc:"Moderately severe distress; clinical intervention recommended"};
  return              {level:"Severe",             severity:4, desc:"Severe distress indicators; urgent clinical evaluation indicated"};
}
function riskLevel(score) {
  if(score<=15)return{level:"Not Indicated",color:"#16a34a",bg:"#f0fdf4",border:"#86efac",flag:0};
  if(score<=35)return{level:"Low",          color:"#65a30d",bg:"#f7fee7",border:"#bef264",flag:1};
  if(score<=55)return{level:"Moderate",     color:"#d97706",bg:"#fffbeb",border:"#fcd34d",flag:2};
  if(score<=75)return{level:"Elevated",     color:"#ea580c",bg:"#fff7ed",border:"#fdba74",flag:3};
  return               {level:"High",        color:"#dc2626",bg:"#fef2f2",border:"#fca5a5",flag:4};
}

// ══════════════════════════════════════════════════════════════════════════════
//  CLINICAL ALGORITHM ENGINE
// ══════════════════════════════════════════════════════════════════════════════
function computeClinical(sSeq, cSeq, shSeq, smSeq) {
  const W = [7,6,5,4,3,2,1];
  const s0=sSeq[0], c0=cSeq[0], sh0=shSeq[0], sm0=smSeq[0];
  const SD=SHADE_DATA, CD=COLOR_DATA, SMD=SMILEY_DATA, SHD=SHAPE_DATA;

  // ── DOMAIN 1: COGNITIVE FUNCTION ────────────────────────────────────────────
  // Weighted complexity across all 7 positions
  let wtd=0, maxWtd=0;
  sSeq.forEach((code,i)=>{wtd+=SHD[code].complexity*W[i]; maxWtd+=7*W[i];});
  const rawCog = (wtd/maxWtd)*100;
  // Scale to CQ (55–145), mean≈100, SD≈15
  const CQ = Math.round(55 + (rawCog/100)*90);
  const iq = iqBand(CQ);
  // Cognitive Flexibility Index: difference between most-liked and least-liked shape complexity
  const cogFlex = Math.abs(SHD[sSeq[0]].complexity - SHD[sSeq[6]].complexity);
  const flexLabel = cogFlex>=4?"High":cogFlex>=2?"Moderate":"Restricted";
  // Processing Orientation: colour temperature bias
  const isWarm = ["hot","warm"].includes(CD[c0].temp);
  const isDarkCool = CD[c0].temp==="dark-cool";
  const procOrient = isWarm?"Action-Oriented / Externally Motivated":isDarkCool?"Reflective / Internally Motivated":"Balanced Processing Orientation";
  // D position (middle = index 3 in 0-based)
  const midComplexity = SHD[sSeq[3]].complexity;
  const midLabel = midComplexity>=5?"High-Complexity Neutral Baseline":midComplexity>=4?"Mid-Range Baseline":"Low-Complexity Neutral Baseline";
  const d1 = { CQ, iqBand:iq, primaryStyle:SHD[s0].cogStyle, secondaryStyle:SHD[sSeq[1]].cogStyle,
    flexIndex:cogFlex, flexLabel, procOrient, rawCog:Math.round(rawCog),
    topShape:SHD[sSeq[0]], secondShape:SHD[sSeq[1]], midShape:SHD[sSeq[3]], botShape:SHD[sSeq[6]],
    midLabel, colorInfluence: CD[c0].name };

  // ── DOMAIN 2: PERSONALITY (DSM-5 + Big Five) ────────────────────────────────
  // Big Five raw scores (1-7 scale, weighted across shape+color+shade)
  const shapeW=0.6, colorW=0.4;
  let BF = {O:0, C:0, E:0, A:0, N:0};
  // Weighted contribution from each shape position
  sSeq.forEach((code,i)=>{
    const sh=SHD[code]; const w=W[i]/28;
    BF.O += sh.BFopen   * w * shapeW;
    BF.C += sh.BFcons   * w * shapeW;
    BF.E += sh.BFextra  * w * shapeW;
    BF.A += sh.BFagree  * w * shapeW;
    BF.N += sh.BFneuro  * w * shapeW;
  });
  // Color modifier
  const col=CD[c0];
  BF.E += col.BFextra  / 7 * colorW;
  BF.N += col.BFneuro  / 7 * colorW;
  // Shade modifies Neuroticism
  BF.N += (SD[sh0].mentalBurden/100) * 0.3;
  BF.N = Math.min(BF.N, 1.0);
  // Convert to T-scores (mean 50, SD 10): raw 0-1 → T = 30+raw*40
  const BFt = {};
  ["O","C","E","A","N"].forEach(k=>{ BFt[k] = Math.round(30 + BF[k]*40); });
  // DSM-5 Cluster determination
  const isAngular=[2,4,5].includes(s0), isRounded=s0===1, isSymm=[3,6].includes(s0);
  let dsmCluster, dsmFeatures, dsmDesc, dsmClinical;
  const hN=BFt.N>=55, hE=BFt.E>=55, lE=BFt.E<45, hO=BFt.O>=55, hC=BFt.C>=55, lC=BFt.C<45;
  if(isDarkCool && (isAngular||s0===7) && lE) {
    dsmCluster="Cluster A Alignment";
    dsmFeatures="Schizoid / Schizotypal features";
    dsmDesc="Tendency towards social withdrawal, restricted emotional expression, preference for solitary activity, possible unconventional thinking patterns.";
    dsmClinical="Assess for flat affect, anhedonia, social isolation. Rule out prodromal schizophrenia spectrum in younger subjects.";
  } else if(isWarm && isAngular && (hN||BFt.E>=58)) {
    dsmCluster="Cluster B Alignment";
    dsmFeatures="Borderline / Histrionic / Narcissistic features";
    dsmDesc="Tendency towards emotional intensity, impulsivity, attention-seeking behaviour, affective instability, and difficulties with interpersonal boundaries.";
    dsmClinical="Assess for impulsivity, affective dysregulation, identity instability. Screen for trauma history. Monitor for externalising behaviours.";
  } else if(!isWarm && (isRounded||isSymm) && hN) {
    dsmCluster="Cluster C Alignment";
    dsmFeatures="Avoidant / Dependent / OCPD features";
    dsmDesc="Tendency towards anxiety-based inhibition, rigid rule adherence, excessive need for reassurance, fear of criticism, or marked difficulty with autonomous decision-making.";
    dsmClinical="Assess for generalised anxiety, social anxiety features, perfectionism. Consider impact on daily functioning and interpersonal relationships.";
  } else {
    dsmCluster="No Significant Cluster Alignment";
    dsmFeatures="Adaptive personality organisation";
    dsmDesc="No clinically significant personality cluster alignment indicated. Subject demonstrates balanced adaptive traits with context-appropriate behavioural flexibility.";
    dsmClinical="No specific personality-based clinical concerns indicated at this time. Supportive monitoring sufficient.";
  }
  const bfDesc = {
    O: BFt.O>=55?"Elevated — high intellectual curiosity, openness to experience, creative ideation":BFt.O<45?"Reduced — preference for conventional, familiar, concrete approaches":"Within average range",
    C: BFt.C>=55?"Elevated — high self-discipline, organisation, goal-directedness":BFt.C<45?"Reduced — may present with impulsivity, difficulty sustaining effort":"Within average range",
    E: BFt.E>=55?"Elevated — socially outgoing, high energy, assertive interaction style":BFt.E<45?"Reduced — reserved, socially selective, prefers limited stimulation":"Within average range",
    A: BFt.A>=55?"Elevated — cooperative, prosocial, trusting, conflict-avoidant":BFt.A<45?"Reduced — competitive, sceptical, challenging of authority":"Within average range",
    N: BFt.N>=55?"Elevated — marked emotional reactivity, vulnerability to distress, mood variability":BFt.N<45?"Reduced — emotionally stable, resilient, low distress susceptibility":"Within average range",
  };
  const d2 = { BFt, bfDesc, dsmCluster, dsmFeatures, dsmDesc, dsmClinical };

  // ── DOMAIN 3: EMOTIONAL INTELLIGENCE & STABILITY ───────────────────────────
  // EQ raw from shade (primary signal), smiley valence, shape EQ modifier
  const shadeEmo = SD[sh0].rawEmo;                         // 0-100
  const smVal    = SMD[sm0].valence;                       // 0-100
  const shEQmod  = isRounded?10:isAngular?-8:isSymm?4:2;
  const cEQmod   = ["cool"].includes(CD[c0].temp)?8:isDarkCool?0:isWarm?-4:0;
  const rawEQ    = Math.min(100,Math.max(0,shadeEmo*0.5 + smVal*0.3 + shEQmod + cEQmod));
  // Scale to EQ Standard Score (mean 100, SD 15): rawEQ 0-100 → SS 55-145
  const EQSS     = Math.round(55 + (rawEQ/100)*90);
  const eqB      = eqBand(EQSS);
  // Sub-scales (scaled 0-100)
  const selfAwareness  = Math.min(100,Math.round(SD[sh0].emotOpen * 0.7 + smVal * 0.3));
  const emoRegulation  = Math.min(100,Math.round(shadeEmo * 0.6 + (100-SMD[sm0].negAffect) * 0.4));
  const emoResilience  = Math.min(100,Math.round(rawCog*0.3 + shadeEmo*0.4 + (100-SD[sh0].ruminScore)*0.3));
  // Emotional Stability Index (0-100)
  const ESI = Math.round((selfAwareness+emoRegulation+emoResilience)/3);
  // Predominant affective state
  const affState = SMD[sm0].name;
  const affValence = smVal>=70?"Positive":smVal>=45?"Neutral-Mixed":smVal>=25?"Negative-Mild":"Negative-Significant";
  const d3 = { EQSS, eqBand:eqB, rawEQ:Math.round(rawEQ), ESI,
    selfAwareness, emoRegulation, emoResilience,
    shadePrimary: SD[sh0], affState, affValence,
    ruminScore:SD[sh0].ruminScore };

  // ── DOMAIN 4: HEALTH INDICATORS ─────────────────────────────────────────────
  // Mental Health Index — distress composite (0=no distress, 100=severe)
  const distressRaw = Math.round(
    SMD[sm0].negAffect * 0.35 +
    SD[sh0].mentalBurden * 0.35 +
    SMD[sm0].dep * 0.15 +
    SMD[sm0].anx * 0.15
  );
  const MHI = 100 - distressRaw;  // invert: high MHI = better mental health
  const phqA = phqAnalog(distressRaw);
  // Anxiety index
  const anxIdx = Math.round(SMD[sm0].anx*0.6 + SD[sh0].ruminScore*0.4);
  const anxLevel = anxIdx>=70?"Elevated":anxIdx>=45?"Moderate":anxIdx>=25?"Mild":"Minimal";
  // Depression index
  const depIdx = Math.round(SMD[sm0].dep*0.6 + SD[sh0].mentalBurden*0.4);
  const depLevel = depIdx>=70?"Elevated":depIdx>=45?"Moderate":depIdx>=25?"Mild":"Minimal";
  // Physical Health — autonomic arousal from colour
  const physArousal = CD[c0].physArousal;
  const physScore   = Math.round(100 - (CD[c0].arousal-1)*12 + (isRounded?5:isAngular?-4:0));
  const physNorm    = Math.min(95,Math.max(25,physScore));
  // Social Functioning Index
  const socRaw = Math.round(
    CD[c0].socialWarm/7*50 +
    (isRounded?50:isAngular?30:40) +
    SMD[sm0].valence*0.15
  );
  const SFI = Math.min(95, Math.max(20, socRaw));
  const sfLevel = SFI>=70?"Adequate – Social engagement indicators within functional range":
                  SFI>=50?"Moderate – Some social withdrawal or interpersonal difficulty indicated":
                           "Limited – Significant social isolation or interpersonal dysfunction indicated";
  const overallWBI = Math.round((MHI + physNorm + SFI)/3);
  const d4 = { MHI, distressRaw, phqAnalog:phqA, anxIdx, anxLevel, depIdx, depLevel,
    physArousal, physNorm, SFI, sfLevel, overallWBI };

  // ── DOMAIN 5: RISK FACTOR PROFILE ───────────────────────────────────────────
  // Suicidal Ideation Risk
  const SIR_raw = Math.round(
    SD[sh0].ruminScore  * 0.3 +
    SMD[sm0].dep        * 0.25 +
    SD[sh0].mentalBurden* 0.25 +
    (isDarkCool ? 15:0) +
    (sm0>=5 ? SMD[sm0].fear*0.2 : 0)
  );
  const SIR = riskLevel(SIR_raw);
  const SIR_indicators = [];
  if(sh0>=6)      SIR_indicators.push("Dark shade preference — elevated emotional burden indicator");
  if(sm0>=5)      SIR_indicators.push(`Primary affect "${SMD[sm0].name}" — high negative valence indicator`);
  if(isDarkCool)  SIR_indicators.push("Dark-cool colour preference — social withdrawal / introspective withdrawal indicator");
  if(s0===2&&sm0>=4) SIR_indicators.push("Angular primary shape with negative affect — heightened stress reactivity");
  if(SIR_indicators.length===0) SIR_indicators.push("No significant visual indicators for elevated risk");

  // Substance Use Risk
  const SUR_raw = Math.round(
    SMD[sm0].negAffect * 0.25 +
    SD[sh0].mentalBurden * 0.20 +
    CD[c0].arousal/7*35 +
    (isAngular ? 15:0) +
    (isWarm && sm0>=4 ? 15:0)
  );
  const SUR = riskLevel(SUR_raw);
  const SUR_indicators = [];
  if(isWarm && CD[c0].arousal>=6) SUR_indicators.push("High-arousal warm colour — sensation-seeking tendency indicator");
  if(isAngular && sm0>=4)         SUR_indicators.push("Angular shape with negative affect — impulsivity–distress pairing");
  if(SD[sh0].mentalBurden>=60)    SUR_indicators.push("Elevated emotional burden — risk of maladaptive coping");
  if(SUR_indicators.length===0)   SUR_indicators.push("No significant visual indicators for elevated risk");

  // Conduct / Delinquency Risk
  const CDR_raw = Math.round(
    SMD[sm0].anger * 0.30 +
    SMD[sm0].negAffect * 0.20 +
    CD[c0].arousal/7*25 +
    (isAngular&&isWarm ? 20:0) +
    (sm0===6 ? 20:0)
  );
  const CDR = riskLevel(CDR_raw);
  const CDR_indicators = [];
  if(sm0===6)             CDR_indicators.push("Primary affect — Anger — high aggression indicator");
  if(isAngular && isWarm) CDR_indicators.push("Angular shape + warm colour — dominance-aggression pairing");
  if(CD[c0].arousal>=6)  CDR_indicators.push("High physiological arousal colour — low frustration tolerance indicator");
  if(CDR_indicators.length===0) CDR_indicators.push("No significant visual indicators for elevated risk");

  // Combined Risk Index
  const maxFlag = Math.max(SIR.flag, SUR.flag, CDR.flag);
  const CRI = maxFlag===0?"Minimal":maxFlag===1?"Low — Monitor":maxFlag===2?"Moderate — Intervention Indicated":maxFlag===3?"Significant — Priority Referral":"Urgent — Immediate Evaluation Required";
  const CRI_color = maxFlag<=1?"#16a34a":maxFlag===2?"#d97706":maxFlag===3?"#ea580c":"#dc2626";
  const d5 = { SIR, SIR_raw, SIR_indicators, SUR, SUR_raw, SUR_indicators, CDR, CDR_raw, CDR_indicators, CRI, CRI_color, maxFlag };

  return { d1, d2, d3, d4, d5,
    meta:{ shapeSeq:sSeq, colorSeq:cSeq, shadeSeq:shSeq, smileySeq:smSeq,
           shapeCode:sSeq.join(""), colorCode:cSeq.join(""), shadeCode:shSeq.join(""), smileyCode:smSeq.join(""),
           firstShape:SHAPE_DATA[s0].name, firstColor:COLOR_DATA[c0].name,
           firstShade:SHADE_DATA[sh0].label, firstSmiley:SMILEY_DATA[sm0].name }};
}

// ══════════════════════════════════════════════════════════════════════════════
//  CLAUDE API — CLINICAL REPORT WRITER
// ══════════════════════════════════════════════════════════════════════════════
async function generateClinicalReport(clinical, participant) {
  const {d1,d2,d3,d4,d5,meta} = clinical;
  const subj = `${participant.name||"Subject"}, ${participant.age?participant.age+" years old,":""} ${participant.gender==="M"?"Male":participant.gender==="F"?"Female":participant.gender||"gender unspecified"}${participant.edu?", Education: "+participant.edu:""}`;

  const prompt = `You are a senior clinical psychologist writing a formal psychometric assessment report for a clinician. Write in formal, technical third-person clinical language throughout. This is a SCST (Shape Colour Shade Smiley Test) evaluation. The SCST is a non-verbal projective psychometric instrument.

SUBJECT: ${subj}
SCST CODES: Shape ${meta.shapeCode} | Colour ${meta.colorCode} | Shade ${meta.shadeCode} | Smiley ${meta.smileyCode}
Primary Stimulus Selections: Shape — ${meta.firstShape} | Colour — ${meta.firstColor} | ${meta.firstShade} | Affect — ${meta.firstSmiley}

═══ DOMAIN 1 — COGNITIVE FUNCTION ═══
SCST-CQ Score: ${d1.CQ} | Band: ${d1.iqBand.band} | Percentile: ${d1.iqBand.percentile}
Primary Cognitive Style: ${d1.primaryStyle} | Secondary: ${d1.secondaryStyle}
Cognitive Flexibility Index: ${d1.flexLabel} (raw gap = ${d1.flexIndex})
Processing Orientation: ${d1.procOrient}
Most preferred shape: ${d1.topShape.name} (${d1.topShape.cogStyle}) | Least: ${d1.botShape.name} | Mid-point: ${d1.midShape.name} (${d1.midLabel})

═══ DOMAIN 2 — PERSONALITY ORGANISATION ═══
DSM-5 Classification: ${d2.dsmCluster} — ${d2.dsmFeatures}
${d2.dsmDesc}
Big Five T-Scores: O=${d2.BFt.O} C=${d2.BFt.C} E=${d2.BFt.E} A=${d2.BFt.A} N=${d2.BFt.N}
Openness (T=${d2.BFt.O}): ${d2.bfDesc.O}
Conscientiousness (T=${d2.BFt.C}): ${d2.bfDesc.C}
Extraversion (T=${d2.BFt.E}): ${d2.bfDesc.E}
Agreeableness (T=${d2.BFt.A}): ${d2.bfDesc.A}
Neuroticism (T=${d2.BFt.N}): ${d2.bfDesc.N}
Clinical note: ${d2.dsmClinical}

═══ DOMAIN 3 — EMOTIONAL INTELLIGENCE & STABILITY ═══
SCST-EQ Standard Score: ${d3.EQSS} | Band: ${d3.eqBand.band} | Percentile: ${d3.eqBand.percentile}
Emotional Stability Index: ${d3.ESI}/100
Sub-scales: Self-Awareness=${d3.selfAwareness}/100 | Regulation=${d3.emoRegulation}/100 | Resilience=${d3.emoResilience}/100
Shade primary selection: ${meta.firstShade} — emotional burden indicator ${d3.shadePrimary.mentalBurden}/100; rumination index ${d3.ruminScore}/100
Primary affect state: ${d3.affState} (${d3.affValence})

═══ DOMAIN 4 — HEALTH INDICATORS ═══
Mental Health Index: ${d4.MHI}/100 | Distress Level: ${d4.phqAnalog.level}
Anxiety Indicator: ${d4.anxLevel} (index ${d4.anxIdx}/100)
Depression Indicator: ${d4.depLevel} (index ${d4.depIdx}/100)
Physical Health — Autonomic Arousal: ${d4.physArousal} | Index ${d4.physNorm}/100
Social Functioning Index: ${d4.SFI}/100 — ${d4.sfLevel}
Overall Wellbeing Composite: ${d4.overallWBI}/100

═══ DOMAIN 5 — RISK FACTOR PROFILE ═══
Suicidal Ideation Risk (CSSRS-analog): ${d5.SIR.level} (raw ${d5.SIR_raw})
Indicators: ${d5.SIR_indicators.join("; ")}
Substance Use Risk: ${d5.SUR.level} (raw ${d5.SUR_raw})
Indicators: ${d5.SUR_indicators.join("; ")}
Conduct/Delinquency Risk: ${d5.CDR.level} (raw ${d5.CDR_raw})
Indicators: ${d5.CDR_indicators.join("; ")}
Combined Risk Index: ${d5.CRI}

Write formal clinical interpretive paragraphs for each domain (3–5 sentences). Use technical psychometric language appropriate for a clinical psychologist reading this report. Reference the scores explicitly. Third person throughout. Do NOT soften language for the subject — this is a clinician-to-clinician document. Be precise, evidence-referenced, and clinically informative.

Return ONLY valid JSON with no markdown:
{"d1":"...","d2":"...","d3":"...","d4":"...","d5":"...","impression":"...","recommendations":"..."}

The "impression" key should be a concise integrated clinical summary (3-4 sentences). The "recommendations" key should contain 5-7 prioritised clinical action points as a single string with numbered lines separated by \\n.`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages",{method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:1800,
        messages:[{role:"user",content:prompt}]})});
    const data = await res.json();
    const txt  = (data.content||[]).map(b=>b.text||"").join("");
    const clean= txt.replace(/```json|```/g,"").trim();
    return JSON.parse(clean.slice(clean.indexOf("{"),clean.lastIndexOf("}")+1));
  } catch(e){ return {d1:"Error generating report.",d2:"",d3:"",d4:"",d5:"",impression:"",recommendations:""}; }
}

// ══════════════════════════════════════════════════════════════════════════════
//  SHADE GENERATOR
// ══════════════════════════════════════════════════════════════════════════════
function generateShades(hex) {
  try {
    const r=parseInt(hex.slice(1,3),16)/255,g=parseInt(hex.slice(3,5),16)/255,b=parseInt(hex.slice(5,7),16)/255;
    const max=Math.max(r,g,b),min=Math.min(r,g,b);let h=0,s=0;
    if(max!==min){const d=max-min;s=(max+min)>1?d/(2-max-min):d/(max+min);
      if(max===r)h=((g-b)/d+(g<b?6:0))/6;else if(max===g)h=((b-r)/d+2)/6;else h=((r-g)/d+4)/6;}
    const hd=Math.round(h*360),sp=Math.round(Math.max(s,0.5)*100);
    return [88,76,63,50,38,26,14].map((lp,i)=>({code:i+1,hex:`hsl(${hd},${sp}%,${lp}%)`}));
  } catch{return Array.from({length:7},(_,i)=>({code:i+1,hex:`hsl(0,0%,${88-11*i}%)`}));}
}

// ══════════════════════════════════════════════════════════════════════════════
//  SVG SHAPES
// ══════════════════════════════════════════════════════════════════════════════
function ShapeSVG({code,fill="#1e40af",size=48}){
  const s=size,c=s/2,r=s/2-2;
  const poly=n=>Array.from({length:n},(_,i)=>{const a=(i*2*Math.PI/n)-Math.PI/2;return`${c+r*Math.cos(a)},${c+r*Math.sin(a)}`;}).join(" ");
  return(<svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} style={{display:"block"}}>
    {code===1&&<circle cx={c} cy={c} r={r} fill={fill}/>}
    {code===2&&<polygon points={poly(3)} fill={fill}/>}
    {code===3&&<rect x={2} y={2} width={s-4} height={s-4} fill={fill}/>}
    {code===4&&<polygon points={`${c},2 ${s-2},${c} ${c},${s-2} 2,${c}`} fill={fill}/>}
    {code===5&&<polygon points={poly(5)} fill={fill}/>}
    {code===6&&<polygon points={poly(6)} fill={fill}/>}
    {code===7&&<polygon points={poly(8)} fill={fill}/>}
  </svg>);
}

// ══════════════════════════════════════════════════════════════════════════════
//  STATIC CIRCLE (TEST UI)
// ══════════════════════════════════════════════════════════════════════════════
function StaticCircle({items,onSelect,renderItem}){
  const[ready,setReady]=useState(false);
  useEffect(()=>{const t=setTimeout(()=>setReady(true),80);return()=>clearTimeout(t);},[]);
  const n=items.length;
  const vw=typeof window!=="undefined"?Math.min(window.innerWidth,520):400;
  const radius=Math.min(130,Math.max(90,vw*0.24));
  const itemSize=Math.min(70,Math.max(54,radius*0.52));
  const cs=radius*2+itemSize+10,cx=cs/2;
  return(<div style={{position:"relative",width:cs,height:cs,maxWidth:"100%",margin:"0 auto",flexShrink:0}}>
    <svg style={{position:"absolute",top:0,left:0,pointerEvents:"none"}} width={cs} height={cs}>
      <circle cx={cx} cy={cx} r={radius} fill="none" stroke="rgba(30,64,175,0.12)" strokeWidth={1.5} strokeDasharray="5 5"/>
    </svg>
    {items.map((item,idx)=>{
      const angle=(idx/n)*2*Math.PI-Math.PI/2;
      const tx=cx+radius*Math.cos(angle)-itemSize/2,ty=cx+radius*Math.sin(angle)-itemSize/2;
      return(<div key={item.code} onClick={()=>onSelect(item)}
        style={{position:"absolute",width:itemSize,height:itemSize,top:ready?ty:cx-itemSize/2,left:ready?tx:cx-itemSize/2,opacity:ready?1:0,
          transition:`top 0.5s cubic-bezier(0.34,1.4,0.64,1) ${idx*50}ms,left 0.5s cubic-bezier(0.34,1.4,0.64,1) ${idx*50}ms,opacity 0.3s ease ${idx*50}ms,transform 0.18s ease`,
          cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",background:"white",borderRadius:"50%",
          boxShadow:"0 3px 14px rgba(0,0,0,0.1),0 0 0 1.5px rgba(30,64,175,0.15)",userSelect:"none",touchAction:"manipulation",zIndex:2}}
        onMouseEnter={e=>{e.currentTarget.style.transform="scale(1.12)";e.currentTarget.style.boxShadow="0 6px 22px rgba(30,64,175,0.25),0 0 0 2.5px rgba(30,64,175,0.45)";}}
        onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)";e.currentTarget.style.boxShadow="0 3px 14px rgba(0,0,0,0.1),0 0 0 1.5px rgba(30,64,175,0.15)";}}
      >{renderItem(item,Math.round(itemSize*0.55))}</div>);
    })}
  </div>);
}

// ══════════════════════════════════════════════════════════════════════════════
//  SELECTION STAGE
// ══════════════════════════════════════════════════════════════════════════════
function SelectionStage({stageKey,title,instr,items,renderItem,onComplete,accentColor}){
  const[remaining,setRemaining]=useState([...items]);
  const[selected,setSelected]=useState([]);
  const ac=accentColor||"#1e40af";
  const pick=item=>{
    const ns=[...selected,item],nr=remaining.filter(i=>i.code!==item.code);
    setSelected(ns);setRemaining(nr);
    if(nr.length===0)setTimeout(()=>onComplete(ns.map(i=>i.code)),500);
  };
  return(<div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:12,width:"100%"}}>
    <div style={{textAlign:"center",padding:"0 8px"}}>
      <div style={{display:"inline-block",fontSize:10,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",color:ac,background:`${ac}12`,borderRadius:100,padding:"4px 14px",marginBottom:6}}>{title}</div>
      <div style={{fontSize:14,color:"#374151",fontWeight:500,lineHeight:1.5}}>{instr}</div>
    </div>
    <div style={{display:"flex",gap:5,flexWrap:"wrap",justifyContent:"center"}}>
      {Array.from({length:7},(_,i)=>(
        <div key={i} style={{width:28,height:28,borderRadius:"50%",background:i<selected.length?ac:"rgba(30,64,175,0.05)",color:i<selected.length?"white":`${ac}70`,border:i<selected.length?`2px solid ${ac}`:`1.5px dashed ${ac}35`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,transition:"all 0.3s cubic-bezier(0.34,1.56,0.64,1)"}}>
          {i<selected.length?"✓":i+1}
        </div>
      ))}
    </div>
    {remaining.length>0
      ?<StaticCircle key={`${stageKey}-${remaining.length}`} items={remaining} onSelect={pick} renderItem={(item,sz)=>renderItem(item,sz)}/>
      :<div style={{height:220,display:"flex",alignItems:"center",justifyContent:"center",fontSize:56}}>✅</div>
    }
    {selected.length>0&&(
      <div style={{width:"100%",maxWidth:400,background:"rgba(30,64,175,0.02)",borderRadius:12,padding:"10px 12px",border:"1px solid rgba(30,64,175,0.08)"}}>
        <div style={{fontSize:9,fontWeight:700,color:ac,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:7}}>Selection order — Position 1 (most liked) → 7 (least liked)</div>
        <div style={{display:"flex",alignItems:"center",gap:5,flexWrap:"wrap"}}>
          {selected.map((item,idx)=>(
            <div key={item.code} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
              <div style={{width:32,height:32,borderRadius:"50%",background:"white",border:`2px solid ${idx===0?ac:`${ac}28`}`,display:"flex",alignItems:"center",justifyContent:"center"}}>{renderItem(item,19)}</div>
              <span style={{fontSize:8,color:"#9CA3AF",fontWeight:700}}>{idx+1}</span>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>);
}

// ══════════════════════════════════════════════════════════════════════════════
//  REPORT COMPONENTS
// ══════════════════════════════════════════════════════════════════════════════
function Divider(){return <div style={{borderTop:"1px solid #e5e7eb",margin:"16px 0"}}/>;}
function SectionTitle({children,color="#1e3a5f"}){
  return(<div style={{background:color,color:"white",padding:"7px 14px",fontSize:11,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:14,marginLeft:-20,marginRight:-20}}>
    {children}
  </div>);
}
function ScoreRow({label,value,band,percentile,color="#1e3a5f"}){
  return(<div style={{display:"flex",alignItems:"baseline",gap:10,marginBottom:6,flexWrap:"wrap"}}>
    <span style={{fontSize:11,color:"#6b7280",minWidth:180,flexShrink:0}}>{label}</span>
    <span style={{fontSize:16,fontWeight:800,color,fontFamily:"'Courier New',monospace",minWidth:50}}>{value}</span>
    {band&&<span style={{fontSize:11,fontWeight:700,color,background:`${color}12`,borderRadius:5,padding:"2px 8px"}}>{band}</span>}
    {percentile&&<span style={{fontSize:10,color:"#9ca3af",fontStyle:"italic"}}>{percentile} percentile</span>}
  </div>);
}
function SubScoreBar({label,value,max=100,color}){
  return(<div style={{marginBottom:8}}>
    <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}>
      <span style={{color:"#374151",fontWeight:500}}>{label}</span>
      <span style={{fontWeight:700,color,fontFamily:"'Courier New',monospace"}}>{value}</span>
    </div>
    <div style={{background:"#f3f4f6",borderRadius:3,height:6,overflow:"hidden"}}>
      <div style={{width:`${(value/max)*100}%`,height:"100%",background:color,borderRadius:3}}/>
    </div>
  </div>);
}
function RiskBadge({level,color,bg,border,raw,label}){
  return(<div style={{background:bg,border:`1px solid ${border}`,borderRadius:8,padding:"10px 13px",marginBottom:8}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
      <span style={{fontSize:11,fontWeight:700,color:"#374151"}}>{label}</span>
      <span style={{fontSize:12,fontWeight:800,color,fontFamily:"'Courier New',monospace"}}>{level}</span>
    </div>
    <div style={{background:"#f9fafb",borderRadius:4,height:5,overflow:"hidden"}}>
      <div style={{width:`${raw}%`,height:"100%",background:color,borderRadius:4}}/>
    </div>
    <div style={{fontSize:9,color:"#9ca3af",marginTop:3,textAlign:"right"}}>Index: {raw}/100</div>
  </div>);
}
function InterpPara({children}){
  return(<p style={{fontSize:12.5,color:"#1f2937",lineHeight:1.9,margin:"10px 0",fontFamily:"Georgia, serif",fontWeight:400}}>{children}</p>);
}
function BFrow({label,abbr,score}){
  const hi=score>=55,lo=score<45;
  const col=hi?"#1e3a5f":lo?"#dc2626":"#6b7280";
  const bg=hi?"#eff6ff":lo?"#fef2f2":"#f9fafb";
  return(<div style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
    <span style={{fontSize:10,fontWeight:700,color:"#6b7280",width:24,textAlign:"right"}}>{abbr}</span>
    <span style={{fontSize:11,color:"#374151",flex:1}}>{label}</span>
    <div style={{background:"#f3f4f6",borderRadius:3,height:6,width:80,flexShrink:0,overflow:"hidden"}}>
      <div style={{width:`${(score-30)/40*100}%`,height:"100%",background:col,borderRadius:3}}/>
    </div>
    <span style={{fontSize:11,fontWeight:700,color:col,fontFamily:"'Courier New',monospace",width:28,textAlign:"right",background:bg,borderRadius:4,padding:"1px 4px"}}>{score}</span>
  </div>);
}

// ══════════════════════════════════════════════════════════════════════════════
//  CLINICAL REPORT RENDERER
// ══════════════════════════════════════════════════════════════════════════════
function ClinicalReport({clinical,narratives,participant,reportId,examiner}){
  const {d1,d2,d3,d4,d5,meta} = clinical;
  const today = new Date().toLocaleDateString("en-IN",{year:"numeric",month:"long",day:"numeric"});
  const S = {fontFamily:"'Georgia',serif",color:"#1f2937"};
  const CARD={background:"white",borderRadius:0,padding:"20px",marginBottom:0,boxSizing:"border-box"};
  return(
    <div id="report-root" style={{...S,maxWidth:760,margin:"0 auto",background:"white",fontSize:13}}>

      {/* ── PAGE 1: HEADER ── */}
      <div style={{background:"#1e3a5f",color:"white",padding:"20px 24px 16px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:10}}>
          <div>
            <div style={{fontSize:9,letterSpacing:"0.2em",textTransform:"uppercase",color:"#93c5fd",marginBottom:4}}>Shape · Colour · Shade · Smiley Test</div>
            <div style={{fontSize:20,fontWeight:700,fontFamily:"'Georgia',serif",lineHeight:1.3}}>Clinical Psychometric Evaluation</div>
            <div style={{fontSize:11,color:"#bfdbfe",marginTop:2,fontStyle:"italic"}}>Non-Verbal Projective Assessment · Five-Domain Profile</div>
          </div>
          <div style={{textAlign:"right",fontSize:11,color:"#93c5fd",lineHeight:1.9}}>
            <div style={{fontFamily:"monospace",fontSize:13,color:"white",fontWeight:700}}>Report ID: {reportId}</div>
            <div>Assessment Date: {today}</div>
            <div>Instrument: SCST v1.0</div>
          </div>
        </div>
      </div>

      {/* ── SUBJECT & EXAMINER BLOCK ── */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",borderBottom:"2px solid #1e3a5f",fontSize:12}}>
        <div style={{padding:"12px 16px",borderRight:"1px solid #e5e7eb"}}>
          <div style={{fontSize:9,fontWeight:700,color:"#6b7280",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:7}}>Subject Details</div>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
            <tbody>
              {[["Name / ID:", participant.name||"—"],["Age:",participant.age||"—"],["Gender:",participant.gender==="M"?"Male":participant.gender==="F"?"Female":participant.gender||"—"],["Education:",participant.edu||"—"]].map(([l,v])=>(
                <tr key={l}><td style={{color:"#6b7280",paddingBottom:3,paddingRight:10,verticalAlign:"top",whiteSpace:"nowrap"}}>{l}</td><td style={{fontWeight:600,color:"#111827"}}>{v}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{padding:"12px 16px"}}>
          <div style={{fontSize:9,fontWeight:700,color:"#6b7280",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:7}}>Examiner / Referral</div>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
            <tbody>
              {[["Clinician:",examiner||"—"],["Setting:",participant.setting||"—"],["Language:",participant.language||"—"],["Purpose:",participant.purpose||"Screening"]].map(([l,v])=>(
                <tr key={l}><td style={{color:"#6b7280",paddingBottom:3,paddingRight:10,verticalAlign:"top",whiteSpace:"nowrap"}}>{l}</td><td style={{fontWeight:600,color:"#111827"}}>{v}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── SCST CODE BLOCK ── */}
      <div style={{background:"#f8fafc",borderBottom:"2px solid #1e3a5f",padding:"12px 16px"}}>
        <div style={{fontSize:9,fontWeight:700,color:"#6b7280",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:9}}>SCST Response Codes</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
          {[["I — Shape Code",meta.shapeCode,"#1e3a5f",meta.firstShape],["II — Colour Code",meta.colorCode,"#b45309",meta.firstColor],["III — Shade Code",meta.shadeCode,"#6d28d9",meta.firstShade.replace("Shade ","Sh.")],["IV — Smiley Code",meta.smileyCode,"#be185d",meta.firstSmiley]].map(([l,v,c,first])=>(
            <div key={l} style={{background:"white",border:`1px solid ${c}25`,borderRadius:6,padding:"9px 10px"}}>
              <div style={{fontSize:8,fontWeight:700,color:c,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:4}}>{l}</div>
              <div style={{fontFamily:"'Courier New',monospace",fontSize:18,fontWeight:800,color:c,letterSpacing:"0.15em"}}>{v}</div>
              <div style={{fontSize:9,color:"#9ca3af",marginTop:3}}>Primary: {first}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{padding:"0 20px 20px"}}>

        {/* ── DOMAIN 1: COGNITIVE ── */}
        <div style={{marginTop:20}}>
          <SectionTitle color="#1e3a5f">Domain I — Cognitive Function &amp; Intellectual Level</SectionTitle>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:14}}>
            <div>
              <ScoreRow label="SCST-CQ (Cognitive Quotient)" value={d1.CQ} band={d1.iqBand.band} percentile={d1.iqBand.percentile} color="#1e3a5f"/>
              <div style={{fontSize:11,color:"#6b7280",marginTop:2,marginBottom:10,fontStyle:"italic"}}>{d1.iqBand.desc}</div>
              <ScoreRow label="Raw Cognitive Score" value={`${d1.rawCog}/100`} color="#374151"/>
              <ScoreRow label="Cognitive Flexibility Index" value={d1.flexLabel} color="#374151"/>
            </div>
            <div style={{background:"#f8fafc",borderRadius:8,padding:"12px",border:"1px solid #e5e7eb"}}>
              <div style={{fontSize:9,fontWeight:700,color:"#6b7280",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:9}}>Cognitive Style Profile</div>
              <div style={{marginBottom:6}}><span style={{fontSize:10,color:"#6b7280"}}>Primary Style:</span><br/><span style={{fontSize:12,fontWeight:700,color:"#1e3a5f"}}>{d1.primaryStyle}</span></div>
              <div style={{marginBottom:6}}><span style={{fontSize:10,color:"#6b7280"}}>Secondary Style:</span><br/><span style={{fontSize:12,fontWeight:600,color:"#374151"}}>{d1.secondaryStyle}</span></div>
              <div style={{marginBottom:4}}><span style={{fontSize:10,color:"#6b7280"}}>Processing Orientation:</span><br/><span style={{fontSize:11,color:"#374151"}}>{d1.procOrient}</span></div>
            </div>
          </div>
          <div style={{background:"#f0f4f8",borderRadius:6,padding:"10px 12px",marginBottom:12,border:"1px solid #cbd5e1"}}>
            <div style={{fontSize:9,fontWeight:700,color:"#64748b",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:6}}>Shape Sequence Indicators (Position Analysis)</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,fontSize:11}}>
              {[["Position A (Most preferred)",d1.topShape.name,d1.topShape.cogStyle],["Position B (2nd)",d1.secondShape.name,d1.secondShape.cogStyle],["Position D (Mid / Neutral)",d1.midShape.name,d1.midLabel],["Position G (Least preferred)",d1.botShape.name,d1.botShape.cogStyle]].map(([pos,name,desc])=>(
                <div key={pos} style={{background:"white",borderRadius:5,padding:"7px 8px",border:"1px solid #e2e8f0"}}>
                  <div style={{fontSize:8,color:"#9ca3af",marginBottom:2}}>{pos}</div>
                  <div style={{fontWeight:700,color:"#1e3a5f",fontSize:12}}>{name}</div>
                  <div style={{fontSize:9,color:"#64748b",lineHeight:1.4}}>{desc}</div>
                </div>
              ))}
            </div>
          </div>
          {narratives.d1&&<InterpPara>{narratives.d1}</InterpPara>}
        </div>

        <Divider/>

        {/* ── DOMAIN 2: PERSONALITY ── */}
        <div>
          <SectionTitle color="#1e5f2e">Domain II — Personality Organisation</SectionTitle>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:14}}>
            <div>
              <div style={{background:d2.dsmCluster.includes("No Significant")?"#f0fdf4":d2.dsmCluster.includes("A")?"#eff6ff":d2.dsmCluster.includes("B")?"#fff7ed":"#faf5ff",border:`1px solid ${d2.dsmCluster.includes("No Significant")?"#86efac":d2.dsmCluster.includes("A")?"#93c5fd":d2.dsmCluster.includes("B")?"#fdba74":"#d8b4fe"}`,borderRadius:8,padding:"12px",marginBottom:12}}>
                <div style={{fontSize:9,fontWeight:700,color:"#6b7280",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:5}}>DSM-5 Personality Cluster Alignment</div>
                <div style={{fontSize:14,fontWeight:800,color:"#1e3a5f",marginBottom:3}}>{d2.dsmCluster}</div>
                <div style={{fontSize:11,fontWeight:600,color:"#374151",marginBottom:6}}>{d2.dsmFeatures}</div>
                <div style={{fontSize:11,color:"#374151",lineHeight:1.7}}>{d2.dsmDesc}</div>
              </div>
              <div style={{background:"#fef9c3",borderRadius:6,padding:"9px 11px",border:"1px solid #fde047",fontSize:11,color:"#713f12",lineHeight:1.7}}>
                <strong>Clinical Note:</strong> {d2.dsmClinical}
              </div>
            </div>
            <div>
              <div style={{fontSize:9,fontWeight:700,color:"#6b7280",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:9}}>NEO-PI Analog — Big Five Dimensional Profile (T-scores, M=50, SD=10)</div>
              {[["Openness to Experience","O",d2.BFt.O],["Conscientiousness","C",d2.BFt.C],["Extraversion","E",d2.BFt.E],["Agreeableness","A",d2.BFt.A],["Neuroticism","N",d2.BFt.N]].map(([l,a,sc])=>(
                <BFrow key={a} label={l} abbr={a} score={sc}/>
              ))}
              <div style={{fontSize:9,color:"#9ca3af",marginTop:6,textAlign:"right",fontStyle:"italic"}}>T&lt;45 = Low · T 45–55 = Average · T&gt;55 = High</div>
            </div>
          </div>
          {narratives.d2&&<InterpPara>{narratives.d2}</InterpPara>}
        </div>

        <Divider/>

        {/* ── DOMAIN 3: EQ / EMOTIONAL STABILITY ── */}
        <div>
          <SectionTitle color="#78350f">Domain III — Emotional Intelligence &amp; Affective Stability</SectionTitle>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:14}}>
            <div>
              <ScoreRow label="SCST-EQ Standard Score" value={d3.EQSS} band={d3.eqBand.band} percentile={d3.eqBand.percentile} color="#78350f"/>
              <div style={{fontSize:11,color:"#6b7280",marginBottom:10,fontStyle:"italic"}}>{d3.eqBand.desc}</div>
              <ScoreRow label="Emotional Stability Index (ESI)" value={`${d3.ESI}/100`} color="#374151"/>
              <div style={{fontSize:10,color:"#6b7280",marginBottom:10}}>Ref: Bar-On EQ-i 2.0 normative framework (SS M=100, SD=15)</div>
              <div style={{background:"#fefce8",borderRadius:6,padding:"9px 11px",border:"1px solid #fde047",fontSize:11}}>
                <div style={{fontWeight:700,color:"#713f12",marginBottom:3}}>Primary Affect State: {d3.affState}</div>
                <div style={{color:"#92400e"}}>Valence Category: <strong>{d3.affValence}</strong></div>
                <div style={{color:"#92400e",marginTop:2}}>Shade Selection: {meta.firstShade}</div>
              </div>
            </div>
            <div>
              <div style={{fontSize:9,fontWeight:700,color:"#6b7280",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:10}}>EQ Sub-Scale Scores (0–100)</div>
              <SubScoreBar label="Emotional Self-Awareness" value={d3.selfAwareness} color="#d97706"/>
              <SubScoreBar label="Emotional Regulation" value={d3.emoRegulation} color="#d97706"/>
              <SubScoreBar label="Emotional Resilience" value={d3.emoResilience} color="#d97706"/>
              <Divider/>
              <div style={{fontSize:9,fontWeight:700,color:"#6b7280",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8}}>Shade-Derived Indices</div>
              <SubScoreBar label="Emotional Burden Index" value={d3.shadePrimary.mentalBurden} color="#b45309"/>
              <SubScoreBar label="Rumination Index" value={d3.ruminScore} color="#b45309"/>
              <div style={{fontSize:9,color:"#9ca3af",marginTop:4,fontStyle:"italic"}}>Higher values indicate elevated burden/rumination</div>
            </div>
          </div>
          {narratives.d3&&<InterpPara>{narratives.d3}</InterpPara>}
        </div>

        <Divider/>

        {/* ── DOMAIN 4: HEALTH ── */}
        <div>
          <SectionTitle color="#831843">Domain IV — Health Indicators (Mental · Physical · Social)</SectionTitle>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:14}}>
            {/* Mental */}
            <div style={{background:"#fdf2f8",borderRadius:8,padding:"12px",border:"1px solid #fbcfe8"}}>
              <div style={{fontSize:9,fontWeight:700,color:"#9d174d",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8}}>Mental Health</div>
              <ScoreRow label="MHI Score" value={`${d4.MHI}/100`} color="#9d174d"/>
              <div style={{fontSize:11,fontWeight:700,color:d4.phqAnalog.severity>=3?"#dc2626":d4.phqAnalog.severity>=2?"#d97706":"#16a34a",background:d4.phqAnalog.severity>=3?"#fef2f2":d4.phqAnalog.severity>=2?"#fffbeb":"#f0fdf4",borderRadius:5,padding:"4px 8px",marginBottom:8,textAlign:"center"}}>{d4.phqAnalog.level}</div>
              <div style={{fontSize:10,color:"#6b7280",marginBottom:6}}>(PHQ-9 analog)</div>
              <SubScoreBar label={`Anxiety — ${d4.anxLevel}`} value={d4.anxIdx} color="#db2777"/>
              <SubScoreBar label={`Depression — ${d4.depLevel}`} value={d4.depIdx} color="#be185d"/>
            </div>
            {/* Physical */}
            <div style={{background:"#fff1f2",borderRadius:8,padding:"12px",border:"1px solid #fecdd3"}}>
              <div style={{fontSize:9,fontWeight:700,color:"#9f1239",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8}}>Physical Health</div>
              <ScoreRow label="PHI Score" value={`${d4.physNorm}/100`} color="#9f1239"/>
              <div style={{fontSize:11,fontWeight:700,color:"#9f1239",marginBottom:8}}>Autonomic Arousal: {d4.physArousal}</div>
              <div style={{fontSize:10,color:"#6b7280",lineHeight:1.7}}>Colour-derived physiological arousal indicator. Elevated arousal (warm/intense colours) may reflect heightened sympathetic activation or psychosomatic stress response.</div>
            </div>
            {/* Social */}
            <div style={{background:"#fdf4ff",borderRadius:8,padding:"12px",border:"1px solid #e9d5ff"}}>
              <div style={{fontSize:9,fontWeight:700,color:"#6b21a8",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8}}>Social Functioning</div>
              <ScoreRow label="SFI Score" value={`${d4.SFI}/100`} color="#6b21a8"/>
              <div style={{fontSize:11,color:"#374151",lineHeight:1.6,marginTop:4}}>{d4.sfLevel}</div>
              <div style={{fontSize:9,color:"#9ca3af",marginTop:6,fontStyle:"italic"}}>(UCLA Loneliness Scale / SSQ analog)</div>
            </div>
          </div>
          <div style={{background:"#1e3a5f",color:"white",borderRadius:8,padding:"12px 16px",display:"flex",alignItems:"center",gap:16,marginBottom:12}}>
            <div>
              <div style={{fontSize:9,letterSpacing:"0.12em",textTransform:"uppercase",color:"#93c5fd",marginBottom:3}}>Overall Wellbeing Composite</div>
              <div style={{fontFamily:"'Courier New',monospace",fontSize:28,fontWeight:800,color:"white"}}>{d4.overallWBI}<span style={{fontSize:13,color:"#93c5fd",fontWeight:400}}> /100</span></div>
            </div>
            <div style={{flex:1,fontSize:11,color:"#bfdbfe",lineHeight:1.7}}>{d4.phqAnalog.desc}</div>
          </div>
          {narratives.d4&&<InterpPara>{narratives.d4}</InterpPara>}
        </div>

        <Divider/>

        {/* ── DOMAIN 5: RISK ── */}
        <div>
          <SectionTitle color="#7c1d1d">Domain V — Risk Factor Profile</SectionTitle>
          <div style={{background:"#fef2f2",borderRadius:8,padding:"11px 14px",marginBottom:14,border:`2px solid ${d5.CRI_color}40`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{fontSize:9,fontWeight:700,color:"#6b7280",letterSpacing:"0.1em",textTransform:"uppercase"}}>Combined Risk Index</div>
              <div style={{fontSize:14,fontWeight:800,color:d5.CRI_color}}>{d5.CRI}</div>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr",gap:0}}>
            <RiskBadge label="1. Suicidal Ideation Risk (Columbia CSSRS Analog)" level={d5.SIR.level} color={d5.SIR.color} bg={d5.SIR.bg} border={d5.SIR.border} raw={d5.SIR_raw}/>
            <div style={{fontSize:11,color:"#374151",marginBottom:12,lineHeight:1.7,paddingLeft:4}}>
              {d5.SIR_indicators.map((ind,i)=><div key={i} style={{marginBottom:2}}>• {ind}</div>)}
            </div>
            <RiskBadge label="2. Substance Use Risk" level={d5.SUR.level} color={d5.SUR.color} bg={d5.SUR.bg} border={d5.SUR.border} raw={d5.SUR_raw}/>
            <div style={{fontSize:11,color:"#374151",marginBottom:12,lineHeight:1.7,paddingLeft:4}}>
              {d5.SUR_indicators.map((ind,i)=><div key={i} style={{marginBottom:2}}>• {ind}</div>)}
            </div>
            <RiskBadge label="3. Conduct / Delinquency Risk" level={d5.CDR.level} color={d5.CDR.color} bg={d5.CDR.bg} border={d5.CDR.border} raw={d5.CDR_raw}/>
            <div style={{fontSize:11,color:"#374151",marginBottom:12,lineHeight:1.7,paddingLeft:4}}>
              {d5.CDR_indicators.map((ind,i)=><div key={i} style={{marginBottom:2}}>• {ind}</div>)}
            </div>
          </div>
          <div style={{background:"#fef9c3",borderRadius:6,padding:"10px 12px",border:"1px solid #fde047",fontSize:11,color:"#713f12",lineHeight:1.7,marginBottom:12}}>
            <strong>⚠ IMPORTANT:</strong> Domain V scores reflect emotional and behavioural state correlates derived from visual-projective responses. These are screening indicators only and do not constitute clinical diagnosis or predictive assessment. All elevated indicators must be confirmed through structured clinical interview, validated scales (C-SSRS, AUDIT, SDQ), and direct clinical assessment before any intervention decision.
          </div>
          {narratives.d5&&<InterpPara>{narratives.d5}</InterpPara>}
        </div>

        <Divider/>

        {/* ── CLINICAL IMPRESSION ── */}
        {narratives.impression&&(
          <div>
            <SectionTitle color="#1e3a5f">Clinical Impression — Integrated Summary</SectionTitle>
            <InterpPara>{narratives.impression}</InterpPara>
            <Divider/>
          </div>
        )}

        {/* ── RECOMMENDATIONS ── */}
        {narratives.recommendations&&(
          <div>
            <SectionTitle color="#1e5f2e">Clinical Recommendations</SectionTitle>
            <div style={{fontSize:12,color:"#1f2937",lineHeight:2,fontFamily:"Georgia,serif"}}>
              {narratives.recommendations.split("\n").filter(l=>l.trim()).map((line,i)=>(
                <div key={i} style={{marginBottom:4,paddingLeft:4}}>{line}</div>
              ))}
            </div>
            <Divider/>
          </div>
        )}

        {/* ── LIMITATIONS ── */}
        <div style={{background:"#f8fafc",borderRadius:8,padding:"14px 16px",border:"1px solid #e2e8f0",marginBottom:16}}>
          <div style={{fontSize:9,fontWeight:700,color:"#6b7280",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:9}}>Test Limitations &amp; Caveats</div>
          <div style={{fontSize:11,color:"#374151",lineHeight:1.85}}>
            {["The SCST is a non-verbal projective screening instrument under active validation. Scores are not standardised against a normative population at this stage of development.",
              "All domain classifications are theoretical-empirical approximations based on peer-reviewed colour, shape, and affect research. They are not equivalent to scores obtained from validated psychometric batteries.",
              "This report is intended to assist a qualified clinician's formulation — not to replace clinical judgement or replace gold-standard instruments (Wechsler, NEO-PI-3, EQ-i 2.0, C-SSRS, PHQ-9, AUDIT).",
              "Cross-cultural and contextual factors may influence projective responses. The evaluating clinician must interpret results within the subject's cultural, linguistic, and socioeconomic context.",
              "Re-assessment is recommended after any significant life event, therapeutic intervention, or when results appear inconsistent with clinical presentation."
            ].map((t,i)=><div key={i} style={{marginBottom:5,display:"flex",gap:6}}><span style={{flexShrink:0,color:"#9ca3af"}}>{i+1}.</span><span>{t}</span></div>)}
          </div>
        </div>

        {/* ── SIGNATURE BLOCK ── */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginTop:10}}>
          {["Evaluating Clinician / Examiner","Supervising Clinician (if applicable)"].map(label=>(
            <div key={label}>
              <div style={{borderTop:"1.5px solid #1e3a5f",paddingTop:8}}>
                <div style={{fontSize:10,color:"#6b7280",marginBottom:2}}>{label}</div>
                <div style={{display:"flex",gap:14,flexWrap:"wrap"}}>
                  <div style={{flex:1,minWidth:100}}>
                    <div style={{fontSize:9,color:"#9ca3af",marginBottom:12}}>Signature</div>
                    <div style={{borderBottom:"1px dotted #cbd5e1",marginBottom:4}}/>
                  </div>
                  <div style={{flex:1,minWidth:80}}>
                    <div style={{fontSize:9,color:"#9ca3af",marginBottom:12}}>Date</div>
                    <div style={{borderBottom:"1px dotted #cbd5e1",marginBottom:4}}/>
                  </div>
                </div>
                <div style={{fontSize:9,color:"#9ca3af",marginTop:4}}>Name &amp; Designation: __________________________</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{marginTop:16,borderTop:"1px solid #e5e7eb",paddingTop:10,display:"flex",justifyContent:"space-between",fontSize:9,color:"#9ca3af"}}>
          <span>SCST Clinical Report · {reportId} · {today}</span>
          <span>CONFIDENTIAL — For clinical use only</span>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  GLOBAL STYLES
// ══════════════════════════════════════════════════════════════════════════════
const G=`
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');
  *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
  body{font-family:'DM Sans',sans-serif;background:#e8ecf0;margin:0}
  @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
  @keyframes bobble{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
  @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}
  button:active{transform:scale(0.97)}
  input:focus,select:focus,textarea:focus{outline:none;border-color:#1e3a5f!important;box-shadow:0 0 0 3px rgba(30,58,95,0.1)!important}
  @media print{
    body{background:white!important}
    #no-print{display:none!important}
    #report-root{max-width:100%!important;margin:0!important;box-shadow:none!important}
  }
`;
const ROOT={minHeight:"100vh",background:"#e8ecf0",fontFamily:"'DM Sans',sans-serif",padding:"16px 8px 80px"};
const CARD={background:"white",borderRadius:12,padding:"18px 16px",maxWidth:540,width:"100%",margin:"0 auto",boxShadow:"0 2px 16px rgba(0,0,0,0.08)"};
const LBL={display:"block",fontSize:10,fontWeight:700,color:"#1e3a5f",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:4};
const INP={width:"100%",padding:"10px 12px",border:"1.5px solid #cbd5e1",borderRadius:8,fontSize:14,fontFamily:"'DM Sans',sans-serif",outline:"none",boxSizing:"border-box",background:"#fafafa",color:"#0f172a"};
const BTN={display:"block",width:"100%",padding:"14px",background:"#1e3a5f",color:"white",border:"none",borderRadius:10,fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",letterSpacing:"0.01em"};

// ══════════════════════════════════════════════════════════════════════════════
//  MAIN APP
// ══════════════════════════════════════════════════════════════════════════════
export default function App(){
  const[stage,setStage]=useState("setup");
  const[participant,setParticipant]=useState({fileNo:getURLParam("reg")||"",name:"",age:"",dob:"",gender:"",edu:"",language:"",setting:"",purpose:"",referral:"",mobile:""});
  const[examiner,setExaminer]=useState(getURLParam("assessor")||"");
  const[shapeSeq,setShapeSeq]=useState([]);
  const[colorSeq,setColorSeq]=useState([]);
  const[shadeSeq,setShadeSeq]=useState([]);
  const[smileySeq,setSmileySeq]=useState([]);
  const[storedFS,setStoredFS]=useState(null);
  const[storedFC,setStoredFC]=useState(null);
  const[storedShades,setStoredShades]=useState([]);
  const[clinical,setClinical]=useState(null);
  const[narratives,setNarratives]=useState(null);
  const[reportId]=useState(()=>"SCST-"+Date.now().toString(36).toUpperCase().slice(-8));

  const runReport=async(sSeq,cSeq,shSeq,smSeq)=>{
    setStage("processing");
    const cl=computeClinical(sSeq,cSeq,shSeq,smSeq);
    setClinical(cl);
    const narr=await generateClinicalReport(cl,participant);
    setNarratives(narr);
    // ── Push to Google Sheets ──────────────────────────────────────────────
    if(APPS_SCRIPT_URL && !APPS_SCRIPT_URL.startsWith("PASTE_")){
      const fileNo=(participant.fileNo||autoFileNo()).trim();
      fetch(APPS_SCRIPT_URL,{method:"POST",mode:"no-cors",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          tool:"CIBS-VISTA", timestamp:new Date().toISOString(), mode:"assisted",
          fileNo, name:participant.name||"Anonymous", dob:participant.dob||"",
          age:participant.age||"", gender:participant.gender||"",
          mobile:participant.mobile||"", education:participant.edu||"",
          referral:participant.referral||participant.purpose||"",
          assessor:examiner||"", notes:"",
          vista_total:cl.d1?.CQ||"", vista_percentile:cl.d1?.pctRank||"",
          vista_band:cl.d1?.band||"", vista_label:cl.d1?.label||"",
          vista_cog:cl.d1?.CQ||"", vista_personality:cl.d2?.BFprimaryScore||"",
          vista_health:cl.d4?.overallWBI||"", vista_risk:cl.d5?.overallRisk||"",
        })}).catch(()=>{});
    }
    setStage("report");
  };
  const reset=()=>{setStage("setup");setShapeSeq([]);setColorSeq([]);setShadeSeq([]);setSmileySeq([]);setStoredFS(null);setStoredFC(null);setStoredShades([]);setClinical(null);setNarratives(null);};

  // ── SETUP ─────────────────────────────────────────────
  if(stage==="setup") return(
    <div style={ROOT}><style>{G}</style>
      <div style={{...CARD,animation:"fadeUp 0.4s ease",maxWidth:600}}>
        <div style={{borderBottom:"2px solid #1e3a5f",paddingBottom:14,marginBottom:18}}>
          <div style={{fontSize:9,letterSpacing:"0.18em",textTransform:"uppercase",color:"#64748b",marginBottom:5}}>Shape · Colour · Shade · Smiley Test</div>
          <h1 style={{margin:0,fontSize:18,color:"#1e3a5f",fontFamily:"Georgia,serif",fontWeight:700}}>Clinical Evaluation — Subject Registration</h1>
        </div>

        <div style={{marginBottom:18}}>
          <div style={{fontSize:11,fontWeight:700,color:"#1e3a5f",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>Subject Details</div>
          {/* FileNo — primary key */}
          <div style={{marginBottom:10,padding:"10px 14px",background:"#F5F3FF",borderRadius:8,border:"1px solid #DDD6FE"}}>
            <label style={{...LBL,color:"#6D28D9",fontWeight:700}}>Registration No. (FileNo) ★</label>
            {getURLParam("reg")
              ? <div style={{fontFamily:"monospace",fontSize:15,fontWeight:900,color:"#5B21B6"}}>{participant.fileNo}<span style={{fontSize:10,marginLeft:8,color:"#A78BFA"}}>Pre-filled by CIBS</span></div>
              : <input style={INP} placeholder="CIBS-26-0001 (leave blank to auto-generate)" value={participant.fileNo} onChange={e=>setParticipant(p=>({...p,fileNo:e.target.value}))}/>
            }
          </div>
          <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:10,marginBottom:10}}>
            <div><label style={LBL}>Full Name / Subject ID</label><input style={INP} placeholder="Name or anonymised ID" value={participant.name} onChange={e=>setParticipant(p=>({...p,name:e.target.value}))}/></div>
            <div><label style={LBL}>Mobile No.</label><input style={INP} type="tel" maxLength={10} placeholder="9876543210" value={participant.mobile||""} onChange={e=>setParticipant(p=>({...p,mobile:e.target.value}))}/></div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
            <div>
              <label style={LBL}>Gender</label>
              <select style={INP} value={participant.gender} onChange={e=>setParticipant(p=>({...p,gender:e.target.value}))}>
                <option value="">— Select —</option>
                <option value="M">Male</option><option value="F">Female</option><option value="O">Other / Not specified</option>
              </select>
            </div>
            <div>
              <label style={LBL}>Education Level</label>
              <select style={INP} value={participant.edu} onChange={e=>setParticipant(p=>({...p,edu:e.target.value}))}>
                <option value="">— Select —</option>
                <option>Illiterate</option><option>Primary (up to Class 5)</option><option>Secondary (up to Class 10)</option>
                <option>Higher Secondary (Class 12)</option><option>Graduate</option><option>Post-Graduate</option>
              </select>
            </div>
          </div>
        </div>

        <div style={{marginBottom:18,borderTop:"1px solid #e2e8f0",paddingTop:14}}>
          <div style={{fontSize:11,fontWeight:700,color:"#1e3a5f",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>Clinical Context</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
            <div><label style={LBL}>Examiner Name</label><input style={INP} placeholder="Clinician / Barefoot worker" value={examiner} onChange={e=>setExaminer(e.target.value)}/></div>
            <div><label style={LBL}>Setting</label>
              <select style={INP} value={participant.setting} onChange={e=>setParticipant(p=>({...p,setting:e.target.value}))}>
                <option value="">— Select —</option>
                <option>Primary Health Centre</option><option>Community Outreach</option><option>School / Anganwadi</option>
                <option>Hospital OPD</option><option>Residential / Inpatient</option><option>Home Visit</option><option>Other</option>
              </select>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div><label style={LBL}>Language of Administration</label>
              <select style={INP} value={participant.language} onChange={e=>setParticipant(p=>({...p,language:e.target.value}))}>
                <option value="">— Select —</option>
                {["Non-verbal (no language)","Hindi","Marathi","Bengali","Tamil","Telugu","Gujarati","Kannada","Punjabi","Urdu","English","Other"].map(l=><option key={l}>{l}</option>)}
              </select>
            </div>
            <div><label style={LBL}>Referral Purpose</label>
              <select style={INP} value={participant.purpose} onChange={e=>setParticipant(p=>({...p,purpose:e.target.value}))}>
                <option value="">— Select —</option>
                <option>Routine Screening</option><option>Cognitive Assessment</option><option>Mental Health Evaluation</option>
                <option>Risk Assessment</option><option>Follow-up / Reassessment</option><option>Research / Validation</option>
              </select>
            </div>
          </div>
        </div>

        <button style={BTN} onClick={()=>setStage("intro")}>Proceed to Test Administration →</button>
      </div>
    </div>
  );

  // ── INTRO ────────────────────────────────────────────
  if(stage==="intro") return(
    <div style={ROOT}><style>{G}</style>
      <div style={{...CARD,animation:"fadeUp 0.4s ease"}}>
        <div style={{background:"#f0f4f8",borderRadius:8,padding:"12px 14px",marginBottom:16,border:"1px solid #cbd5e1"}}>
          <div style={{fontSize:9,fontWeight:700,color:"#1e3a5f",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:4}}>Instructions for Examiner</div>
          <div style={{fontSize:12,color:"#374151",lineHeight:1.85}}>Present the screen to the subject. No verbal instructions about meaning are to be given. Simply say: <em>"Point to the one you like most. Then the next one. Keep going until all are done."</em> No prompting, guiding, or interpretation during administration.</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:7,marginBottom:18}}>
          {[["STAGE I — Shapes","Seven geometric forms","#1e3a5f"],["STAGE II — Colours","Seven spectral colours","#b45309"],["STAGE III — Shades","Seven shade gradations","#6d28d9"],["STAGE IV — Feelings","Seven facial expressions","#be185d"]].map(([t,sub,c])=>(
            <div key={t} style={{borderRadius:8,padding:"10px",background:`#f8fafc`,border:`1px solid ${c}22`,borderLeft:`3px solid ${c}`}}>
              <div style={{fontSize:11,fontWeight:700,color:c}}>{t}</div>
              <div style={{fontSize:10,color:"#6b7280"}}>{sub}</div>
            </div>
          ))}
        </div>
        <div style={{display:"flex",gap:7,alignItems:"center",justifyContent:"center",marginBottom:18}}>
          {SHAPES.slice(0,5).map((sh,i)=>(
            <div key={sh.code} style={{width:42,height:42,borderRadius:"50%",background:"white",boxShadow:"0 2px 10px rgba(30,58,95,0.12)",display:"flex",alignItems:"center",justifyContent:"center",animation:`bobble 2.2s ${i*0.18}s ease-in-out infinite`}}>
              <ShapeSVG code={sh.code} fill="#9ca3af" size={26}/>
            </div>
          ))}
        </div>
        <button style={BTN} onClick={()=>setStage("s1")}>Begin Administration ›</button>
      </div>
    </div>
  );

  // ── STAGES 1-4 ────────────────────────────────────────
  // Stage 1: shapes are intentionally bland/neutral — NO colour cue
  if(stage==="s1") return(
    <div style={ROOT}><style>{G}</style>
      <div style={{...CARD,maxWidth:560,animation:"fadeUp 0.3s ease"}}>
        <SelectionStage key="s1" stageKey="s1" accentColor="#64748b" title="Stage I — Shapes" instr="Select the shape you like most first" items={SHAPES}
          renderItem={(item,sz)=><ShapeSVG code={item.code} fill="#9ca3af" size={sz}/>}
          onComplete={seq=>{setStoredFS(SHAPES.find(s=>s.code===seq[0])||SHAPES[0]);setShapeSeq(seq);setStage("s2");}}/>
      </div>
    </div>
  );

  if(stage==="s2") return(
    <div style={ROOT}><style>{G}</style>
      <div style={{...CARD,maxWidth:560,animation:"fadeUp 0.3s ease"}}>
        <div style={{textAlign:"center",marginBottom:10}}>
          <span style={{display:"inline-flex",alignItems:"center",gap:7,background:"rgba(30,58,95,0.07)",borderRadius:100,padding:"4px 12px"}}>
            <ShapeSVG code={storedFS?.code||1} fill="#1e3a5f" size={20}/>
            <span style={{fontSize:12,color:"#1e3a5f",fontWeight:600}}>Primary shape: {storedFS?.name}</span>
          </span>
        </div>
        <SelectionStage key="s2" stageKey="s2" accentColor="#b45309" title="Stage II — Colours" instr="Select the colour you like most first" items={COLORS}
          renderItem={(item,sz)=><ShapeSVG code={storedFS?.code||1} fill={item.hex} size={sz}/>}
          onComplete={seq=>{const fc=COLORS.find(c=>c.code===seq[0])||COLORS[0];setStoredFC(fc);setStoredShades(generateShades(fc.hex));setColorSeq(seq);setStage("s3");}}/>
      </div>
    </div>
  );

  if(stage==="s3") return(
    <div style={ROOT}><style>{G}</style>
      <div style={{...CARD,maxWidth:560,animation:"fadeUp 0.3s ease"}}>
        <div style={{textAlign:"center",marginBottom:10}}>
          <span style={{display:"inline-flex",alignItems:"center",gap:7,background:"rgba(30,58,95,0.07)",borderRadius:100,padding:"4px 12px"}}>
            <ShapeSVG code={storedFS?.code||1} fill={storedFC?.hex||"#1e3a5f"} size={20}/>
            <span style={{fontSize:12,color:"#1e3a5f",fontWeight:600}}>{storedFS?.name} · {storedFC?.name} shades</span>
          </span>
        </div>
        <SelectionStage key="s3" stageKey="s3" accentColor="#6d28d9" title="Stage III — Shades" instr="Select the shade you like most first" items={storedShades}
          renderItem={(item,sz)=><ShapeSVG code={storedFS?.code||1} fill={item.hex} size={sz}/>}
          onComplete={seq=>{setShadeSeq(seq);setStage("s4");}}/>
      </div>
    </div>
  );

  if(stage==="s4") return(
    <div style={ROOT}><style>{G}</style>
      <div style={{...CARD,maxWidth:560,animation:"fadeUp 0.3s ease"}}>
        <SelectionStage key="s4" stageKey="s4" accentColor="#be185d" title="Stage IV — Feelings" instr="Select the expression that shows how you feel most" items={SMILEYS}
          renderItem={(item,sz)=><span style={{fontSize:Math.round(sz*0.72),lineHeight:1,userSelect:"none"}}>{item.emoji}</span>}
          onComplete={seq=>{setSmileySeq(seq);runReport(shapeSeq,colorSeq,shadeSeq,seq);}}/>
      </div>
    </div>
  );

  // ── PROCESSING ────────────────────────────────────────
  if(stage==="processing") return(
    <div style={{...ROOT,display:"flex",alignItems:"center",justifyContent:"center"}}><style>{G}</style>
      <div style={{textAlign:"center",maxWidth:340,padding:20,animation:"fadeUp 0.4s ease"}}>
        <div style={{width:56,height:56,border:"3px solid #e2e8f0",borderTopColor:"#1e3a5f",borderRadius:"50%",animation:"spin 1s linear infinite",margin:"0 auto 20px"}}/>
        <h2 style={{fontFamily:"Georgia,serif",fontSize:22,color:"#1e3a5f",marginBottom:10}}>Generating Clinical Report</h2>
        <p style={{color:"#64748b",fontSize:13,lineHeight:1.8}}>Computing psychometric scores across five clinical domains…</p>
        <div style={{display:"flex",gap:5,justifyContent:"center",flexWrap:"wrap",marginTop:16}}>
          {["Cognitive CQ","Personality","EQ Score","Health Indices","Risk Profile"].map((d,i)=>(
            <span key={d} style={{fontSize:10,color:"#94a3b8",background:"white",borderRadius:20,padding:"4px 10px",animation:`pulse 2s ${i*0.3}s ease-in-out infinite`,boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>{d}</span>
          ))}
        </div>
      </div>
    </div>
  );

  // ── REPORT ────────────────────────────────────────────
  if(stage==="report"&&clinical&&narratives) return(
    <div style={{background:"#e8ecf0",minHeight:"100vh",padding:"16px 8px 80px"}}><style>{G}</style>
      {/* Action bar */}
      <div id="no-print" style={{maxWidth:760,margin:"0 auto 14px",display:"flex",gap:9,flexWrap:"wrap"}}>
        <button onClick={()=>window.print()} style={{flex:1,minWidth:140,padding:"11px",background:"#1e3a5f",color:"white",border:"none",borderRadius:9,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>🖨 Print / Save PDF</button>
        <button onClick={reset} style={{flex:1,minWidth:120,padding:"11px",background:"white",color:"#1e3a5f",border:"1.5px solid #1e3a5f",borderRadius:9,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>← New Evaluation</button>
        <div style={{flex:2,minWidth:200,background:"#fef9c3",border:"1px solid #fde047",borderRadius:9,padding:"9px 12px",fontSize:11,color:"#713f12",lineHeight:1.6}}>
          <strong>Report ID: {reportId}</strong> · Confidential clinical document. For qualified clinician use only.
        </div>
      </div>
      {/* Report */}
      <div style={{maxWidth:760,margin:"0 auto",boxShadow:"0 4px 40px rgba(0,0,0,0.12)"}}>
        <ClinicalReport clinical={clinical} narratives={narratives} participant={participant} reportId={reportId} examiner={examiner}/>
      </div>
    </div>
  );

  return null;
}
