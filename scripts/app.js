/* =========================================================
   Final Defense v8 – i18n + Branding + Secure Leaderboard
   (choice + mask + scanner) — FULL CLIENT + Admin Reset
   ========================================================= */

/* ---------------- i18n ---------------- */
const I18N = {
  nl: {
    status_active: 'STATUS: ACTIEF',
    status_corp:   'STATUS: CORPORATE',
    real_cases:    'Echte casestudy’s actief',
    comms:         'COMMUNICATIELOGBOEK',
    start:         'SYSTEEM STARTEN (Klik om te starten)',
    close_fact:    'Ik begrijp het risico',
    end_title:     'Resultaten van de Operatie',
    score1:        'NALEVINGSSCORE', score2: 'BEVEILIGDE DATAPAKKETTEN', risk: 'RISICONIVEAU',
    syslog:        'SYSTEEMLOG:', waiting: 'Wachten op operatorauthenticatie...',
    low:'LAAG', mid:'MIDDEL', high:'HOOG',
    lbl_corp:'Corporate Mode (BIO/NIS2/AVG)', lbl_sound:'Geluid aan', lbl_lang:'Taal', lbl_brand:'Merk‑kleur', lbl_logo:'Logo',
    fact_title:'💡 Wist je dat? (Casestudy)',
    net_stream:'NETWORK_PACKET_STREAM', risk_pkt:'[RISK] API_KEY_SYNC', safe_pkt:'[SAFE] UI_REFRESH',
    send_ai:'VERZENDEN NAAR CLOUD AI', retry:'OPNIEUW', tip_mask:'Tip: Masker naam, adres, BSN, wachtwoord, e‑mail, IP…',
    mission:'Missie', standard:'(Standaard)', corporate:'(Corporate)',
    accepted:'Beslissing geaccepteerd.', detected:'Risico op beveiligingsincident gedetecteerd.',
    see_case:'Bekijk de casestudy.',
    name_prompt:'Naam (pseudoniem is prima):',
    masked_ok:'Maskeren: VOLLEDIG', masked_bad:'Maskeren: ONVOLDOENDE',
    choice:'Jouw keuze', correct:'✔ Correct', wrong:'✖ Fout'
  },
  en: {
    status_active: 'STATUS: ACTIVE',
    status_corp:   'STATUS: CORPORATE',
    real_cases:    'Real‑world case studies enabled',
    comms:         'COMMUNICATIONS LOG',
    start:         'SYSTEM START (Click to Init)',
    close_fact:    'I understand the risk',
    end_title:     'Operation Results',
    score1:        'COMPLIANCE SCORE', score2: 'SECURED DATA BATCHES', risk:'RISK LEVEL',
    syslog:        'SYSTEM LOG:', waiting: 'Waiting for operator authentication...',
    low:'LOW', mid:'MEDIUM', high:'HIGH',
    lbl_corp:'Corporate Mode (BIO/NIS2/AVG)', lbl_sound:'Sound on', lbl_lang:'Language', lbl_brand:'Brand color', lbl_logo:'Logo',
    fact_title:'💡 Did you know? (Case Study)',
    net_stream:'NETWORK_PACKET_STREAM', risk_pkt:'[RISK] API_KEY_SYNC', safe_pkt:'[SAFE] UI_REFRESH',
    send_ai:'SEND TO CLOUD AI', retry:'RETRY', tip_mask:'Tip: Mask name, address, national ID, password, email, IP…',
    mission:'Mission', standard:'(Standard)', corporate:'(Corporate)',
    accepted:'Decision accepted.', detected:'Security incident risk detected.',
    see_case:'See the case study.',
    name_prompt:'Name (pseudonym is fine):',
    masked_ok:'Masking: COMPLETE', masked_bad:'Masking: INCOMPLETE',
    choice:'Your choice', correct:'✔ Correct', wrong:'✖ Wrong'
  }
};
let LANG = (localStorage.getItem('lang') || 'nl');
function t(k){ return (I18N[LANG] && I18N[LANG][k]) || I18N['nl'][k] || k; }

/* ---------------- Ses ---------------- */
const Sound={ on:true, play(id){ if(!this.on) return; const el=document.getElementById(id); if(!el) return; try{ const p=el.play(); if(p && typeof p.then==='function') p.catch(()=>{});}catch(_){}} };

/* ---------------- Güvenli Leaderboard Sabitleri ----------------
   Not: WEBHOOK_URL_CONST = 'AUTO_PROMPT' → finale gelindiğinde
   admin’den /exec URL’ini bir defalığına ister; localStorage’a kaydeder. */
const WEBHOOK_URL_CONST = 'AUTO_PROMPT';
const API_KEY           = 'c6f3e0a9b1d24f7c9e2a5d3f7a0b4c5d';
const SHARED_SECRET     = '9e3f2a1b0c4d5e6f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f';
let   WEBHOOK_URL       = null;

/* ---------------- Global Durum ---------------- */
let PLAYER = localStorage.getItem('player_name') || null;
let step=0, hp=100, score=0; const decisions=[]; let corporateMode=false;

/* ---------------- DOM Yardımcıları ---------------- */
function $(s,root=document){ return root.querySelector(s); }
function $all(s,root=document){ return Array.from(root.querySelectorAll(s)); }

/* ---------------- UI i18n ---------------- */
function applyLanguage(){
  $('#status').textContent=corporateMode?t('status_corp'):t('status_active');
  $('#lbl-comms').textContent=t('comms');
  $('#btn-start') && ($('#btn-start').textContent=t('start'));
  $('#fact-title').textContent=t('fact_title');
  $('#btn-close-fact').textContent=t('close_fact');
  $('#end-title').textContent=t('end_title');
  $('#lbl-m1').textContent=t('score1'); $('#lbl-m2').textContent=t('score2'); $('#lbl-m3').textContent=t('risk');
  $('#lbl-log').textContent=t('syslog'); $('#log-line').textContent=t('waiting');
  $('#lbl-corp').textContent=t('lbl_corp'); $('#lbl-sound').textContent=t('lbl_sound');
  $('#lbl-lang').textContent=t('lbl_lang'); $('#lbl-brand').textContent=t('lbl_brand'); $('#lbl-logo').textContent=t('lbl_logo');
}
function riskLevelFromHP(v){ if(v>=80) return t('low'); if(v>=50) return t('mid'); return t('high'); }
function refreshRiskUI(){ const r=riskLevelFromHP(hp); const el=$('#risk-val'); el.textContent=r; el.style.color=(r===t('low'))?'#00ff41':(r===t('mid'))?'#f1c40f':'#ff3131'; }
function appendChat(msg){ const cb=$('#chat-box'); const d=document.createElement('div'); d.className='chat-msg'; const h=document.createElement('span'); h.style.color='var(--accent)'; h.style.fontSize='10px'; h.textContent='[INCOMING]'; const br=document.createElement('br'); const b=document.createElement('span'); b.textContent=msg; d.appendChild(h); d.appendChild(br); d.appendChild(b); cb.appendChild(d); cb.scrollTop=cb.scrollHeight; }
function typeTerminal(text,i=0,done=null){ const el=$('#terminal-content'); if(i===0) el.textContent=''; if(i<text.length){ el.textContent+=text.charAt(i); Sound.play('snd-type'); setTimeout(()=>typeTerminal(text,i+1,done),24);} else if(done){ done(); } }

/* ---------------- Rozet ---------------- */
function pushBadge(){
  const lb=$('#live-badges'); lb.innerHTML='';
  const badges=[];
  if(score>=2) badges.push({cls:'green', text: LANG==='nl'?'Privacybeschermer':'Privacy Guardian'});
  if(score>=3) badges.push({cls:'blue',  text: LANG==='nl'?'Shadow‑AI‑jager':'Shadow‑AI Hunter'});
  const act=getActiveMissions();
  if(decisions.length===act.length && decisions.every(d=>d.ok)){
    badges.push({cls: corporateMode?'purple':'gold',
      text: corporateMode ? (LANG==='nl'?'Compliance‑kampioen (BIO/NIS2/AVG)':'Compliance Champion (BIO/NIS2/GDPR)')
                          : (LANG==='nl'?'Beleidsbewaker':'Policy Enforcer')});
  }
  badges.forEach(b=>{ const s=document.createElement('span'); s.className=`badge ${b.cls}`; s.innerHTML=`<span class="dot"></span>${b.text}`; lb.appendChild(s); });
}

/* ---------------- Görevler ---------------- */
function buildDefaultMissions(){
  const m=[];
  m.push({type:'choice', sender:'Dev-Team Lead',
    msg:{nl:"Hé, we hebben een bug in de code van de betaalmodule. Ik wil de broncode even door ChatGPT laten checken op fouten. Goed?", en:"Hey, we found a bug in the payment module. Can I paste the source code into ChatGPT to check for errors?"},
    terminal:{nl:"> WAARSCHUWING: Uploaden van bedrijfseigen broncode gedetecteerd.", en:"> WARNING: Upload of proprietary source code detected."},
    fact:{nl:"In 2023 lekte personeel van Samsung per ongeluk vertrouwelijke broncode door het in ChatGPT te plakken.", en:"In 2023, confidential source code leaked when staff pasted it into ChatGPT."},
    choices:[
      { text:{nl:"STOP: Broncode delen is verboden.", en:"STOP: Sharing source code is forbidden."}, ok:true, feedback:{nl:"Correct! Gebruik alleen goedgekeurde interne code‑analyzers.", en:"Correct! Use approved internal code analyzers only."}},
      { text:{nl:"DOEN: Alleen de specifieke functie.", en:"DO IT: Just the specific function."}, ok:false, feedback:{nl:"LEK: De broncode kan nu door de AI‑leverancier worden gebruikt.", en:"LEAK: The code may now be used by the AI vendor."}}
    ]});
  m.push({type:'choice', sender:'HR‑manager',
    msg:{nl:"Ik wil de cv's van 50 kandidaten samenvatten met een handige AI‑tool.", en:"I want to summarize 50 candidates’ resumes with a handy AI tool."},
    terminal:{nl:"> PRIVACYCHECK: Bevat 50× PII (persoonsgegevens).", en:"> PRIVACY CHECK: Contains 50× PII (personal data)."},
    fact:{nl:"Een Italiaanse privacytoezichthouder blokkeerde ChatGPT tijdelijk i.v.m. AVG.", en:"An Italian DPA temporarily blocked ChatGPT due to GDPR concerns."},
    choices:[
      { text:{nl:"ANONIMISEREN: Namen/BSN eerst verwijderen.", en:"ANONYMIZE: Remove names/IDs first."}, ok:true, feedback:{nl:"Heel goed. Dataminimalisatie is de sleutel.", en:"Good. Data minimization is key."}},
      { text:{nl:"UPLOADEN: De AI is beveiligd.", en:"UPLOAD: The AI is secure."}, ok:false, feedback:{nl:"AVG‑overtreding: Ongeoorloofde verwerking.", en:"GDPR violation: Unlawful processing."}}
    ]});
  m.push({type:'choice', sender:'Systeembericht',
    msg:{nl:"Een medewerker heeft een gratis ‘AI‑PDF‑Unlocker’ extensie geïnstalleerd.", en:"An employee installed a free ‘AI‑PDF‑Unlocker’ extension."},
    terminal:{nl:"> MALWARESCAN: Extensie heeft ‘Read All Data’‑rechten.", en:"> MALWARE SCAN: Extension has ‘Read All Data’ permissions."},
    fact:{nl:"Veel ‘gratis’ AI‑tools verdienen aan data die je uploadt.", en:"Many ‘free’ AI tools monetize the data you upload."},
    choices:[
      { text:{nl:"VERWIJDEREN: Extensie blokkeren.", en:"REMOVE: Block the extension."}, ok:true, feedback:{nl:"Veiligheid hersteld. Shadow AI is een groot risico.", en:"Security restored. Shadow AI is a major risk."}},
      { text:{nl:"NEGEREN: Handige tool.", en:"IGNORE: It’s a handy tool."}, ok:false, feedback:{nl:"INFILTRATIE: Extensie kopieert data.", en:"INFILTRATION: The extension copies data."}}
    ]});

  // MASK görevleri
  m.push({type:'mask', sender:'Data Lab',
    msg:{nl:'Inspecteer de tekst en maskeer PII.', en:'Inspect the text and mask PII.'},
    terminal:{nl:"> DATA‑INSPECTIE: Klik op PII om te maskeren.", en:"> DATA INSPECTION: Click PII to mask."},
    fact_ok:{nl:'Perfect! Alle PII gemaskeerd.', en:'Perfect! All PII masked.'},
    fact_fail:{nl:'PII niet volledig gemaskeerd.', en:'PII not fully masked.'},
    body:{nl:"Geachte AI, analyseer dit rapport: De patiënt genaamd {{Willem de Boer}} woont in {{Amsterdam, Dam 1}}. Zijn BSN-nummer is {{123.456.789}}. Hij klaagt over hoofdpijn sinds {{12 januari}}.",
          en:"Dear AI, analyze this report: Patient {{Willem de Boer}} lives at {{Amsterdam, Dam 1}}. Their national ID is {{123.456.789}}. Headache since {{12 January}}."}});
  m.push({type:'mask', sender:'Data Lab',
    msg:{nl:'Bevat mogelijk inloggegevens. Maskeren verplicht.', en:'May contain credentials. Mask required.'},
    terminal:{nl:"> DATA‑INSPECTIE: Inloggegevens/PII maskeren.", en:"> DATA INSPECTION: Mask credentials/PII."},
    fact_ok:{nl:'Goed werk! Inloggegevens gemaskeerd.', en:'Nice! Credentials masked.'},
    fact_fail:{nl:'Onvoldoende. Wachtwoord/e‑mail/IP maskeren.', en:'Insufficient. Mask password/email/IP.'},
    body:{nl:"Projectverslag: Kwetsbaarheid gevonden door {{Sarah de Vries}}. Server IP {{192.168.1.45}} gebruikt wachtwoord {{Admin123!}}. Contact: {{s.vries@bedrijf.nl}}.",
          en:"Project report: Vulnerability found by {{Sarah de Vries}}. Server IP {{192.168.1.45}} uses password {{Admin123!}}. Contact {{s.vries@bedrijf.nl}}."}});
  m.push({type:'mask', sender:'Data Lab',
    msg:{nl:'Incidentlog: klantgegevens maskeren.', en:'Incident log: mask customer data.'},
    terminal:{nl:"> DATA‑INSPECTIE: Klantgegevens maskeren.", en:"> DATA INSPECTION: Mask customer data."},
    fact_ok:{nl:'Netjes! Klant‑ID/naam/telefoon beschermd.', en:'Great! Customer ID/name/phone protected.'},
    fact_fail:{nl:'Nog PII zichtbaar. Eerst maskeren.', en:'PII still visible. Mask first.'},
    body:{nl:"Incidentlog: Klantnummer {{#123456}} belde over factuur {{FCT-2024-9981}}. Notulen bevatten naam {{Jan Peters}} en telefoon {{06-12345678}}.",
          en:"Incident log: Customer ID {{#123456}} called about invoice {{FCT-2024-9981}}. Notes include name {{Jan Peters}} and phone {{06-12345678}}."}});

  // SCANNER
  m.push({type:'scanner', sender:'Netwerkbewaking',
    msg:{nl:'AI‑traffic monitoring gestart. Intercepteer [RISK] pakketten.', en:'AI traffic monitoring started. Intercept [RISK] packets.'},
    terminal:{nl:"> NETWERK: Klik op [RISK] pakketten.", en:"> NETWORK: Click [RISK] packets."},
    fact_ok:{nl:'Verdachte pakketten onderschept.', en:'Suspicious packets intercepted.'},
    fact_fail:{nl:'Risico’s gemist.', en:'Risks missed.'},
    duration:45, spawnInterval:1200, missPenalty:10, falsePenalty:5, hitReward:10, successThreshold:6
  });

  return m;
}
function buildCorporateMissions(){
  const m=[];
  m.push({type:'choice', sender:'Zaakbeheerder (Gemeente)',
    msg:{nl:'BRP‑export met naam/adres/BSN — AI samenvatten?', en:'BRP export with name/address/ID — summarize with AI?'},
    terminal:{nl:"> AVG/UAVG‑CHECK: BSN en persoonsgegevens aanwezig.", en:"> GDPR/Local ID check: contains national IDs."},
    fact:{nl:'BSN verwerken alleen met grondslag; geen externe AI zonder DPA.', en:'National IDs require legal basis; no external AI without DPA.'},
    choices:[
      { text:{nl:'STOP & ANONIMISEREN (on‑prem).', en:'STOP & ANONYMIZE (on‑prem).'}, ok:true, feedback:{nl:'Juist. Minimaliseer data, werk met verwerker + DPA.', en:'Right. Minimize data; use processor + DPA.'}},
      { text:{nl:'Upload naar publieke AI met “no training”.', en:'Upload to public AI with “no training”.'}, ok:false, feedback:{nl:'Onvoldoende waarborgen.', en:'Insufficient safeguards.'}}
    ]});
  m.push({type:'choice', sender:'Woo‑coördinator',
    msg:{nl:'Woo‑verzoek met duizenden e‑mails.', en:'FOI request with thousands of emails.'},
    terminal:{nl:"> BIO: BBN2/BBN3 mogelijk. Pseudonimisering.", en:"> Security baseline applies. Pseudonymization required."},
    fact:{nl:'Gebruik verwerkers met DPA en logging.', en:'Use processors with DPA and logging.'},
    choices:[
      { text:{nl:'Interne AI met DPA + logging.', en:'Internal AI with DPA + logging.'}, ok:true, feedback:{nl:'Goed. Minimalisatie + logging.', en:'Good. Minimization + logging.'}},
      { text:{nl:'Gratis webtool gebruiken.', en:'Use a free web tool.'}, ok:false, feedback:{nl:'Risico op datalek.', en:'Risk of data leak.'}}
    ]});

  // Data Lab mask görevlerini ekle
  buildDefaultMissions().filter(x=>x.type==='mask').forEach(x=>m.push(x));

  m.push({type:'scanner', sender:'Netwerkbewaking (Corporate)',
    msg:{nl:'Monitoring met meldplichtscenario (NIS2).', en:'Monitoring with notification scenario (NIS2).'},
    terminal:{nl:"> NETWERK: Klik [RISK]; missen verlaagt integriteit.", en:"> NETWORK: Click [RISK]; misses reduce integrity."},
    fact_ok:{nl:'Goed toezicht; NIS2‑risico beperkt.', en:'Good oversight; NIS2 risk limited.'},
    fact_fail:{nl:'Significante events gemist; drempel evalueren.', en:'Significant events missed; evaluate threshold.'},
    duration:45, spawnInterval:1200, missPenalty:10, falsePenalty:5, hitReward:10, successThreshold:6
  });
  return m;
}
function getActiveMissions(){ return corporateMode ? buildCorporateMissions() : buildDefaultMissions(); }

/* ---------------- MASK ---------------- */
function renderMaskMission(m){
  const area=$('#choices-area'); area.innerHTML='';
  const w=document.createElement('div'); w.className='mask-wrap'; w.id='mask-editor';
  const parts=(m.body[LANG]||m.body['nl']).split(/(\{\{.*?\}\})/g);
  parts.forEach(p=>{
    if(p.startsWith('{{')&&p.endsWith('}}')){
      const val=p.slice(2,-2);
      const sp=document.createElement('span'); sp.className='pii'; sp.tabIndex=0; sp.setAttribute('role','button'); sp.setAttribute('aria-pressed','false');
      sp.textContent=val;
      sp.addEventListener('click',()=>toggleMask(sp));
      sp.addEventListener('keydown',(e)=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); toggleMask(sp);} });
      w.appendChild(sp); w.appendChild(document.createTextNode(' '));
    } else {
      w.appendChild(document.createTextNode(p));
    }
  });
  area.appendChild(w);
  const c=document.createElement('div'); c.className='mask-controls';
  const send=document.createElement('button'); send.className='choice-btn'; send.textContent=t('send_ai'); send.onclick=()=>evaluateMaskMission(m);
  const r=document.createElement('button'); r.className='choice-btn'; r.style.borderColor='var(--accent)'; r.style.color='var(--accent)'; r.textContent=t('retry'); r.onclick=()=>renderMaskMission(m);
  const note=document.createElement('div'); note.className='note'; note.textContent=t('tip_mask');
  c.appendChild(send); c.appendChild(r); area.appendChild(c); area.appendChild(note);
}
function toggleMask(el){ el.classList.toggle('masked'); const pr=el.getAttribute('aria-pressed')==='true'; el.setAttribute('aria-pressed', String(!pr)); Sound.play('snd-type'); }
function evaluateMaskMission(m){
  const un=Array.from(document.querySelectorAll('#mask-editor .pii')).filter(x=>!x.classList.contains('masked'));
  if(un.length>0){
    hp-=34; if(hp<0) hp=0; $('#hp-val').textContent=hp+'%'; refreshRiskUI(); Sound.play('snd-alarm');
    const list=un.map(x=>x.textContent).join(', ');
    $('#fact-text').textContent=(m.fact_fail[LANG]||m.fact_fail['nl'])+'\n\n'+(LANG==='nl'?'Niet gemaskeerd: ':'Unmasked: ')+list;
    decisions.push({missionIndex:step, choiceText:t('masked_bad'), ok:false, feedback:'PII incomplete'});
    $('#log-line').textContent=t('detected');
  } else {
    score+=1; $('#score-val').textContent=String(score); Sound.play('snd-success');
    $('#fact-text').textContent=(m.fact_ok[LANG]||m.fact_ok['nl']);
    decisions.push({missionIndex:step, choiceText:t('masked_ok'), ok:true, feedback:'PII correct'});
    $('#log-line').textContent=t('accepted');
  }
  pushBadge(); showFact();
}

/* ---------------- SCANNER ---------------- */
let scInt=null, scEndTo=null, scTick=null;
function renderScannerMission(m){
  const area=$('#choices-area'); area.innerHTML='';
  const box=document.createElement('div'); box.className='scanner';
  const head=document.createElement('div'); head.className='sc-head';
  const left=document.createElement('div'); left.textContent=t('net_stream');
  const tm=document.createElement('div'); tm.id='sc-timer'; tm.style.color='var(--neon-red)'; tm.textContent=formatTime(m.duration);
  head.appendChild(left); head.appendChild(tm);
  const stream=document.createElement('div'); stream.className='sc-stream'; stream.id='sc-stream';
  const legend=document.createElement('div'); legend.className='sc-legend';
  legend.innerHTML=`<span style="display:flex;align-items:center;gap:6px"><span class="sc-dot r"></span>[RISK]</span><span style="display:flex;align-items:center;gap:6px"><span class="sc-dot s"></span>[SAFE]</span>`;
  box.appendChild(head); box.appendChild(stream); box.appendChild(legend); area.appendChild(box);

  let tsec=m.duration, hits=0, miss=0, fals=0;
  function tick(){ tsec--; tm.textContent=formatTime(tsec); if(tsec<=0) finish(); }
  scTick=setInterval(tick,1000);

  function spawn(){
    const p=document.createElement('div'); const danger=Math.random()>0.6;
    p.className='packet '+(danger?'danger':'safe');
    p.textContent=danger?t('risk_pkt'):t('safe_pkt');
    p.style.left=(Math.random()*80+5)+'%';
    p.onclick=()=>{ if(danger){ hits++; score+=m.hitReward; Sound.play('snd-success'); } else { fals++; hp-=m.falsePenalty; if(hp<0) hp=0; Sound.play('snd-alarm'); } p.remove(); upd(); };
    stream.appendChild(p);
    setTimeout(()=>{ if(p.parentNode){ if(danger){ miss++; hp-=m.missPenalty; if(hp<0) hp=0; upd(); } p.remove(); } },5200);
  }
  function upd(){ $('#hp-val').textContent=hp+'%'; $('#score-val').textContent=String(score); refreshRiskUI(); }
  scInt=setInterval(spawn,m.spawnInterval); scEndTo=setTimeout(finish,m.duration*1000);

  function finish(){
    clearInterval(scInt); clearInterval(scTick); clearTimeout(scEndTo);
    const ok = hits>=m.successThreshold && miss<(m.successThreshold+2);
    if(!ok){
      Sound.play('snd-alarm');
      $('#fact-text').textContent=(m.fact_fail[LANG]||m.fact_fail['nl'])+
        `\n\n${LANG==='nl'?'Geïntercepteerd':'Intercepted'}: ${hits}\n${LANG==='nl'?'Gemist':'Missed'}: ${miss}\n${LANG==='nl'?'Vals alarm':'False alarm'}: ${fals}`;
      decisions.push({missionIndex:step, choiceText:`Scanner: hits=${hits}, miss=${miss}`, ok:false, feedback:'Netwerkbewaking onvoldoende'});
      $('#log-line').textContent=t('detected');
    } else {
      Sound.play('snd-success');
      score+=1; $('#score-val').textContent=String(score);
      $('#fact-text').textContent=(m.fact_ok[LANG]||m.fact_ok['nl'])+
        `\n\n${LANG==='nl'?'Geïntercepteerd':'Intercepted'}: ${hits}\n${LANG==='nl'?'Gemist':'Missed'}: ${miss}\n${LANG==='nl'?'Vals alarm':'False alarm'}: ${fals}`;
      decisions.push({missionIndex:step, choiceText:`Scanner: hits=${hits}, miss=${miss}`, ok:true, feedback:'Netwerkbewaking effectief'});
      $('#log-line').textContent=t('accepted');
    }
    pushBadge(); showFact();
  }
}
function formatTime(s){ const mm=String(Math.floor(s/60)).padStart(2,'0'); const ss=String(s%60).padStart(2,'0'); return `${mm}:${ss}`; }

/* ---------------- Ortak Akış ---------------- */
function renderMission(){
  const ms=getActiveMissions();
  if(step>=ms.length){ showEndScreen(); return; }
  const m=ms[step];
  appendChat(m.msg[LANG]||m.msg['nl']);
  typeTerminal(m.terminal[LANG]||m.terminal['nl']);
  const area=$('#choices-area'); area.innerHTML='';
  if(m.type==='mask') renderMaskMission(m);
  else if(m.type==='scanner') renderScannerMission(m);
  else m.choices.forEach(c=>{ const b=document.createElement('button'); b.className='choice-btn'; b.textContent=c.text[LANG]||c.text['nl']; b.onclick=()=>handleChoice(m,c); area.appendChild(b); });
  $('#log-line').textContent=`${t('mission')} ${step+1}/${ms.length} ${corporateMode?t('corporate'):t('standard')} …`;
}
function handleChoice(m,c){
  $all('#choices-area .choice-btn').forEach(b=>b.disabled=true);
  if(!c.ok){ hp-=34; if(hp<0) hp=0; Sound.play('snd-alarm'); $('#main-display').classList.add('glitch-mode'); setTimeout(()=>$('#main-display').classList.remove('glitch-mode'),600); }
  else { score+=1; Sound.play('snd-success'); }
  decisions.push({missionIndex:step, choiceText:(c.text[LANG]||c.text['nl']), ok:!!c.ok, feedback:(c.feedback[LANG]||c.feedback['nl'])});
  $('#hp-val').textContent=hp+'%'; $('#score-val').textContent=String(score); refreshRiskUI(); pushBadge();
  const fb=(c.ok?'[OK] ':'[ALERT] ')+(c.feedback[LANG]||c.feedback['nl']);
  typeTerminal(fb+'\n\n> '+t('see_case'));
  $('#fact-text').textContent=(m.fact&&(m.fact[LANG]||m.fact['nl']))||'';
  showFact();
}
function showFact(){ $('#fact-card').style.display='block'; }
function closeFact(){ $('#fact-card').style.display='none'; step++; renderMission(); }
function showEndScreen(){
  const ms=getActiveMissions();
  $('#end-hp').textContent=hp+'%'; $('#end-score').textContent=String(score); $('#end-risk').textContent=riskLevelFromHP(hp);
  $('#earned-badges').innerHTML=$('#live-badges').innerHTML;
  const list=$('#decisions-list'); list.innerHTML='';
  decisions.forEach(d=>{
    const m=ms[d.missionIndex];
    const box=document.createElement('div'); box.className='summary';
    const st=d.ok?`<span class="ok">${t('correct')}</span>`:`<span class="fail">${t('wrong')}</span>`;
    box.innerHTML=`<div><strong>${t('mission')} ${d.missionIndex+1}:</strong> ${m.sender}</div><div style="margin:6px 0; color:#bbb;">${m.msg[LANG]||m.msg['nl']}</div><div>${t('choice')}: <em>${d.choiceText}</em> — ${st}</div><div style="margin-top:6px;">Feedback: ${d.feedback}</div>`;
    list.appendChild(box);
  });
  typeTerminal(LANG==='nl'?'> OPERATIE VOLTOOID. RESULTATEN WORDEN GETOOND...':'> OPERATION COMPLETE. SHOWING RESULTS...');
  // Güvenli skor gönderimi (async; await gerekli değil)
  submitScore();
  $('#end-modal').style.display='block';
  $('#log-line').textContent = LANG==='nl'?'Alle missies voltooid.':'All missions completed.';
}
function replay(){
  step=0; hp=100; score=0; decisions.length=0;
  $('#hp-val').textContent='100%'; $('#score-val').textContent='0'; $('#risk-val').textContent=riskLevelFromHP(100);
  $('#live-badges').innerHTML=''; $('#chat-box').innerHTML=`<div id="lbl-comms" class="muted">${t('comms')}</div>`;
  $('#terminal-content').textContent=''; $('#choices-area').innerHTML='';
  $('#end-modal').style.display='none';
  renderMission();
}

/* ---------------- Güvenli Gönderim Yardımcıları ---------------- */
function base64Url(buf){ let bin=''; const by=new Uint8Array(buf); for(let i=0;i<by.length;i++) bin+=String.fromCharCode(by[i]); return btoa(bin).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,''); }
function hex(buf){ const b=new Uint8Array(buf); return Array.from(b).map(x=>x.toString(16).padStart(2,'0')).join(''); }
function canonicalStringify(o){ if(o===null||typeof o!=='object') return JSON.stringify(o); if(Array.isArray(o)) return '['+o.map(canonicalStringify).join(',')+']'; const ks=Object.keys(o).sort(); return '{'+ks.map(k=>JSON.stringify(k)+':'+canonicalStringify(o[k])).join(',')+'}'; }
async function sha256Hex(t){ const enc=new TextEncoder(); const dig=await crypto.subtle.digest('SHA-256', enc.encode(t)); return hex(dig); }
async function hmacSignB64Url(secret,msg){ const enc=new TextEncoder(); const key=await crypto.subtle.importKey('raw', enc.encode(secret), {name:'HMAC', hash:'SHA-256'}, false, ['sign']); const sig=await crypto.subtle.sign('HMAC', key, enc.encode(msg)); return base64Url(sig); }

/* ---------------- Güvenli submit (AUTO_PROMPT destekli) ---------------- */
async function submitScore(){
  try{
    // Webhook URL: AUTO_PROMPT & cache
    if(!WEBHOOK_URL){
      if(WEBHOOK_URL_CONST==='AUTO_PROMPT'){
        WEBHOOK_URL = localStorage.getItem('webhook_url') || null;
        if(!WEBHOOK_URL){
          const ask = (LANG==='nl'
            ? 'Admin: Plak hier de Google Apps Script Web App URL (…/exec):'
            : 'Admin: Paste Google Apps Script Web App URL (…/exec):');
          const val = (typeof window.prompt==='function') ? window.prompt(ask) : '';
          if(val && val.trim()){ WEBHOOK_URL = val.trim(); localStorage.setItem('webhook_url', WEBHOOK_URL); } else { return; }
        }
      } else {
        WEBHOOK_URL = WEBHOOK_URL_CONST;
      }
    }
    if(WEBHOOK_URL.indexOf('/exec')===-1) return;

    const ms=getActiveMissions();
    const okCount=decisions.filter(d=>d.ok).length;
    const failCount=decisions.length-okCount;

    const data={
      name: PLAYER || 'Anonymous',
      mode: (corporateMode?'Corporate':'Standard'),
      lang: LANG,
      score: score,
      hp: hp,
      risk: ($('#risk-val')?.textContent||''),
      missions: ms.length,
      ok: okCount,
      fail: failCount,
      client: navigator.userAgent || '',
      repo: location.origin + location.pathname,
      page: document.title || ''
    };

    const canonical=canonicalStringify(data);
    const hash=await sha256Hex(canonical);
    const ts=Date.now();
    const sign=await hmacSignB64Url(SHARED_SECRET, `${ts}.${hash}`);

    const body={ apiKey: API_KEY, ts, hash, sign, data };

    fetch(WEBHOOK_URL, {
      method:'POST', mode:'no-cors',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify(body)
    }).catch(()=>{});
  }catch(_){}
}

/* ---------------- Admin Reset Kancaları ---------------- */
function adminResetPrompts(){
  try{
    localStorage.removeItem('player_name');
    localStorage.removeItem('webhook_url');
  }catch(_){}
}

/* ---------------- Başlat / Eventler ---------------- */
function start(){ $('#btn-start')?.remove(); renderMission(); }

document.addEventListener('DOMContentLoaded', ()=>{
  // URL ile reset ( ?reset=1 )
  try { const p=new URLSearchParams(location.search); if(p.get('reset')==='1'){ adminResetPrompts(); } } catch(_){}

  // Dil
  const sel=$('#lang-select');
  if(sel){ sel.value=LANG; sel.addEventListener('change', ()=>{ LANG=sel.value; localStorage.setItem('lang',LANG); replay(); applyLanguage(); }); }
  applyLanguage();

  // Ses / Corporate
  $('#toggle-sound')?.addEventListener('change',(e)=>{ Sound.on=e.target.checked; });
  $('#toggle-corp')?.addEventListener('change',(e)=>{ corporateMode=e.target.checked; $('#status').textContent=corporateMode?t('status_corp'):t('status_active'); replay(); });

  // Marka rengi & logo
  $('#brand-color')?.addEventListener('input',(e)=>{ document.documentElement.style.setProperty('--accent', e.target.value); document.documentElement.style.setProperty('--neon-blue', e.target.value); });
  const savedLogo=localStorage.getItem('logo'); if(savedLogo){ $('#brand-logo').src=savedLogo; $('#logo-url') && ($('#logo-url').value=savedLogo); }
  $('#btn-apply-logo')?.addEventListener('click', ()=>{ const v=$('#logo-url').value.trim()||'assets/logo.svg'; $('#brand-logo').src=v; localStorage.setItem('logo', v); });

  // Oyuncu adı prompt’u
  if(!PLAYER){
    const ask=t('name_prompt');
    const v=(typeof window.prompt==='function') ? window.prompt(ask) : '';
    PLAYER=(v && v.trim()) ? v.trim() : 'Anonymous';
    localStorage.setItem('player_name', PLAYER);
  }

  // Start butonu: normal tık → start, SHIFT+tık → admin reset
  $('#btn-start')?.addEventListener('click', (e)=>{
    if(e.shiftKey){
      adminResetPrompts();
      alert('Admin reset: İsim ve Webhook URL yeniden sorulacak.');
      location.reload();
      return;
    }
    start();
  });

  $('#btn-close-fact')?.addEventListener('click', closeFact);
  $('#btn-replay')?.addEventListener('click', replay);
  $('#btn-close-end')?.addEventListener('click', ()=> $('#end-modal').style.display='none');
});
