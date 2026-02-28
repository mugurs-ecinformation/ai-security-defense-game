// ===== Leaderboard settings =====
const WEBHOOK_URL = 'BURAYA_YAPIŞTIR';
let PLAYER = localStorage.getItem('player_name') || null;
// ===== i18n dictionary =====
const I18N = {
  nl: {
    status_active: 'STATUS: ACTIEF',
    status_corp: 'STATUS: CORPORATE',
    real_cases: 'Echte casestudy’s actief',
    comms: 'COMMUNICATIELOGBOEK',
    start: 'SYSTEEM STARTEN (Klik om te starten)',
    close_fact: 'Ik begrijp het risico',
    end_title: 'Resultaten van de Operatie',
    score1: 'NALEVINGSSCORE', score2: 'BEVEILIGDE DATAPAKKETTEN', risk: 'RISICONIVEAU',
    syslog: 'SYSTEEMLOG:', waiting: 'Wachten op operatorauthenticatie...',
    low:'LAAG', mid:'MIDDEL', high:'HOOG',
    lbl_corp: 'Corporate Mode (BIO/NIS2/AVG)',
    lbl_sound: 'Geluid aan', lbl_lang:'Taal', lbl_brand:'Merk‑kleur', lbl_logo:'Logo',
    fact_title: '💡 Wist je dat? (Casestudy)',
    // Scanner
    net_stream:'NETWORK_PACKET_STREAM', risk_pkt:'[RISK] API_KEY_SYNC', safe_pkt:'[SAFE] UI_REFRESH'
  },
  en: {
    status_active: 'STATUS: ACTIVE',
    status_corp: 'STATUS: CORPORATE',
    real_cases: 'Real‑world case studies enabled',
    comms: 'COMMUNICATIONS LOG',
    start: 'SYSTEM START (Click to Init)',
    close_fact: 'I understand the risk',
    end_title: 'Operation Results',
    score1: 'COMPLIANCE SCORE', score2: 'SECURED DATA BATCHES', risk: 'RISK LEVEL',
    syslog: 'SYSTEM LOG:', waiting: 'Waiting for operator authentication...',
    low:'LOW', mid:'MEDIUM', high:'HIGH',
    lbl_corp: 'Corporate Mode (BIO/NIS2/AVG)',
    lbl_sound: 'Sound on', lbl_lang:'Language', lbl_brand:'Brand color', lbl_logo:'Logo',
    fact_title: '💡 Did you know? (Case Study)',
    net_stream:'NETWORK_PACKET_STREAM', risk_pkt:'[RISK] API_KEY_SYNC', safe_pkt:'[SAFE] UI_REFRESH'
  }
};
let LANG = 'nl';

function t(k){ return (I18N[LANG] && I18N[LANG][k]) || I18N['nl'][k] || k; }

// ===== Sound =====
const Sound={on:true, play(id){ if(!this.on) return; const el=document.getElementById(id); if(!el) return; try{ const p=el.play(); if(p&&typeof p.then==='function') p.catch(()=>{});}catch(_){ } }};

// ===== Missions (text per language) =====
function buildDefaultMissions(){
  const m = [];
  // Choice 1
  m.push({type:'choice', sender:'Dev-Team Lead',
    msg:{nl:"Hé, we hebben een bug in de code van de betaalmodule. Ik wil de broncode even door ChatGPT laten checken op fouten. Goed?",
         en:"Hey, we found a bug in the payment module. Can I paste the source code into ChatGPT to check for errors?"},
    terminal:{nl:"> WAARSCHUWING: Uploaden van bedrijfseigen broncode gedetecteerd.", en:"> WARNING: Upload of proprietary source code detected."},
    fact:{nl:"In 2023 lekte personeel van Samsung per ongeluk vertrouwelijke broncode door het in ChatGPT te plakken.", en:"In 2023, confidential source code leaked when staff pasted it into ChatGPT."},
    choices:[
      { text:{nl:"STOP: Broncode delen is verboden.", en:"STOP: Sharing source code is forbidden."}, ok:true,  feedback:{nl:"Correct! Gebruik alleen goedgekeurde interne code‑analyzers.", en:"Correct! Use approved internal code analyzers only."}},
      { text:{nl:"DOEN: Alleen de specifieke functie.", en:"DO IT: Just the specific function."}, ok:false, feedback:{nl:"LEK: De broncode kan nu door de AI‑leverancier worden gebruikt.", en:"LEAK: The code may now be used by the AI vendor."}}
    ]
  });
  // Choice 2
  m.push({type:'choice', sender:'HR‑manager',
    msg:{nl:"Ik wil de cv's van 50 kandidaten samenvatten met een handige AI‑tool.", en:"I want to summarize 50 candidates’ resumes with a handy AI tool."},
    terminal:{nl:"> PRIVACYCHECK: Bevat 50× PII (persoonsgegevens).", en:"> PRIVACY CHECK: Contains 50× PII (personal data)."},
    fact:{nl:"Een Italiaanse privacytoezichthouder blokkeerde ChatGPT tijdelijk i.v.m. AVG.", en:"An Italian DPA temporarily blocked ChatGPT due to GDPR concerns."},
    choices:[
      { text:{nl:"ANONIMISEREN: Namen/BSN eerst verwijderen.", en:"ANONYMIZE: Remove names/IDs first."}, ok:true,  feedback:{nl:"Heel goed. Dataminimalisatie is de sleutel.", en:"Good. Data minimization is key."}},
      { text:{nl:"UPLOADEN: De AI is beveiligd.", en:"UPLOAD: The AI is secure."}, ok:false, feedback:{nl:"AVG‑overtreding: Ongeoorloofde verwerking.", en:"GDPR violation: Unlawful processing."}}
    ]
  });
  // Choice 3
  m.push({type:'choice', sender:'Systeembericht',
    msg:{nl:"Een medewerker heeft een gratis ‘AI‑PDF‑Unlocker’ extensie geïnstalleerd.", en:"An employee installed a free ‘AI‑PDF‑Unlocker’ extension."},
    terminal:{nl:"> MALWARESCAN: Extensie heeft ‘Read All Data’‑rechten.", en:"> MALWARE SCAN: Extension has ‘Read All Data’ permissions."},
    fact:{nl:"Veel ‘gratis’ AI‑tools verdienen aan data die je uploadt.", en:"Many ‘free’ AI tools monetize the data you upload."},
    choices:[
      { text:{nl:"VERWIJDEREN: Extensie blokkeren.", en:"REMOVE: Block the extension."}, ok:true,  feedback:{nl:"Veiligheid hersteld. Shadow AI is een groot risico.", en:"Security restored. Shadow AI is a major risk."}},
      { text:{nl:"NEGEREN: Handige tool.", en:"IGNORE: It’s a handy tool."}, ok:false, feedback:{nl:"INFILTRATIE: Extensie kopieert data.", en:"INFILTRATION: The extension copies data."}}
    ]
  });
  // MASK 1
  m.push({type:'mask', sender:'Data Lab',
    msg:{nl:'Inspecteer de tekst en maskeer PII.', en:'Inspect the text and mask PII.'},
    terminal:{nl:"> DATA‑INSPECTIE: Klik op PII om te maskeren.", en:"> DATA INSPECTION: Click PII to mask."},
    fact_ok:{nl:'Perfect! Alle PII gemaskeerd.', en:'Perfect! All PII masked.'},
    fact_fail:{nl:'PII niet volledig gemaskeerd.', en:'PII not fully masked.'},
    body:{nl:"Geachte AI, analyseer dit rapport: De patiënt genaamd {{Willem de Boer}} woont in {{Amsterdam, Dam 1}}. Zijn BSN-nummer is {{123.456.789}}. Hij klaagt over hoofdpijn sinds {{12 januari}}.",
          en:"Dear AI, analyze this report: Patient {{Willem de Boer}} lives at {{Amsterdam, Dam 1}}. Their national ID is {{123.456.789}}. Headache since {{12 January}}."}
  });
  // MASK 2
  m.push({type:'mask', sender:'Data Lab',
    msg:{nl:'Bevat mogelijk inloggegevens. Maskeren verplicht.', en:'May contain credentials. Mask required.'},
    terminal:{nl:"> DATA‑INSPECTIE: Inloggegevens/PII maskeren.", en:"> DATA INSPECTION: Mask credentials/PII."},
    fact_ok:{nl:'Goed werk! Inloggegevens gemaskeerd.', en:'Nice! Credentials masked.'},
    fact_fail:{nl:'Onvoldoende. Wachtwoord/e‑mail/IP maskeren.', en:'Insufficient. Mask password/email/IP.'},
    body:{nl:"Projectverslag: Kwetsbaarheid gevonden door {{Sarah de Vries}}. Server IP {{192.168.1.45}} gebruikt wachtwoord {{Admin123!}}. Contact: {{s.vries@bedrijf.nl}}.",
          en:"Project report: Vulnerability found by {{Sarah de Vries}}. Server IP {{192.168.1.45}} uses password {{Admin123!}}. Contact {{s.vries@bedrijf.nl}}."}
  });
  // MASK 3
  m.push({type:'mask', sender:'Data Lab',
    msg:{nl:'Incidentlog: klantgegevens maskeren.', en:'Incident log: mask customer data.'},
    terminal:{nl:"> DATA‑INSPECTIE: Klantgegevens maskeren.", en:"> DATA INSPECTION: Mask customer data."},
    fact_ok:{nl:'Netjes! Klant‑ID/naam/telefoon beschermd.', en:'Great! Customer ID/name/phone protected.'},
    fact_fail:{nl:'Nog PII zichtbaar. Eerst maskeren.', en:'PII still visible. Mask first.'},
    body:{nl:"Incidentlog: Klantnummer {{#123456}} belde over factuur {{FCT-2024-9981}}. Notulen bevatten naam {{Jan Peters}} en telefoon {{06-12345678}}.",
          en:"Incident log: Customer ID {{#123456}} called about invoice {{FCT-2024-9981}}. Notes include name {{Jan Peters}} and phone {{06-12345678}}."}
  });
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
  const m = [];
  // A few corporate choice missions (NL/EN)
  m.push({type:'choice', sender:'Zaakbeheerder (Gemeente)',
    msg:{nl:'BRP‑export met naam/adres/BSN — AI samenvatten?', en:'BRP export with name/address/ID — summarize with AI?'},
    terminal:{nl:"> AVG/UAVG‑CHECK: BSN en persoonsgegevens aanwezig.", en:"> GDPR/Local ID check: contains national IDs."},
    fact:{nl:'BSN verwerken alleen met grondslag; geen externe AI zonder DPA.', en:'National IDs require legal basis; no external AI without DPA.'},
    choices:[
      { text:{nl:'STOP & ANONIMISEREN (on‑prem).', en:'STOP & ANONYMIZE (on‑prem).'}, ok:true, feedback:{nl:'Juist. Minimaliseer data, werk met verwerker + DPA.', en:'Right. Minimize data; use processor + DPA.'}},
      { text:{nl:'Upload naar publieke AI met “no training”.', en:'Upload to public AI with “no training”.'}, ok:false, feedback:{nl:'Onvoldoende waarborgen.', en:'Insufficient safeguards.'}}
    ]
  });
  m.push({type:'choice', sender:'Woo‑coördinator',
    msg:{nl:'Woo‑verzoek met duizenden e‑mails.', en:'FOI request with thousands of emails.'},
    terminal:{nl:"> BIO: BBN2/BBN3 mogelijk. Pseudonimisering.", en:"> Security baseline applies. Pseudonymization required."},
    fact:{nl:'Gebruik verwerkers met DPA en logging.', en:'Use processors with DPA and logging.'},
    choices:[
      { text:{nl:'Interne AI met DPA + logging.', en:'Internal AI with DPA + logging.'}, ok:true, feedback:{nl:'Goed. Minimalisatie + logging.', en:'Good. Minimization + logging.'}},
      { text:{nl:'Gratis webtool gebruiken.', en:'Use a free web tool.'}, ok:false, feedback:{nl:'Risico op datalek.', en:'Risk of data leak.'}}
    ]
  });
  // Add three mask missions (reuse Data Lab, Dutch/English texts)
  const dl = buildDefaultMissions().filter(x=>x.type==='mask');
  dl.forEach(x=>m.push(x));
  // Scanner
  m.push({type:'scanner', sender:'Netwerkbewaking (Corporate)',
    msg:{nl:'Monitoring met meldplichtscenario (NIS2).', en:'Monitoring with notification scenario (NIS2).'},
    terminal:{nl:"> NETWERK: Klik [RISK]; missen verlaagt integriteit.", en:"> NETWORK: Click [RISK]; misses reduce integrity."},
    fact_ok:{nl:'Goed toezicht; NIS2‑risico beperkt.', en:'Good oversight; NIS2 risk limited.'},
    fact_fail:{nl:'Significante events gemist; drempel evalueren.', en:'Significant events missed; evaluate threshold.'},
    duration:45, spawnInterval:1200, missPenalty:10, falsePenalty:5, hitReward:10, successThreshold:6
  });
  return m;
}

// ===== State =====
let step=0, hp=100, score=0; const decisions=[]; let corporateMode=false;

// ===== UI helpers =====
function applyLanguage(){
  document.getElementById('status').textContent = corporateMode ? t('status_corp') : t('status_active');
  document.getElementById('lbl-comms').textContent = t('comms');
  document.getElementById('btn-start').textContent = t('start');
  document.getElementById('fact-title').textContent = t('fact_title');
  document.getElementById('btn-close-fact').textContent = t('close_fact');
  document.getElementById('end-title').textContent = t('end_title');
  document.getElementById('lbl-m1').textContent = t('score1');
  document.getElementById('lbl-m2').textContent = t('score2');
  document.getElementById('lbl-m3').textContent = t('risk');
  document.getElementById('lbl-log').textContent = t('syslog');
  document.getElementById('log-line').textContent = t('waiting');
  document.getElementById('lbl-corp').textContent = t('lbl_corp');
  document.getElementById('lbl-sound').textContent = t('lbl_sound');
  document.getElementById('lbl-lang').textContent = t('lbl_lang');
  document.getElementById('lbl-brand').textContent = t('lbl_brand');
  document.getElementById('lbl-logo').textContent = t('lbl_logo');
}

function riskLevelFromHP(v){ if(v>=80) return t('low'); if(v>=50) return t('mid'); return t('high'); }
function refreshRiskUI(){ const r=riskLevelFromHP(hp); const el=document.getElementById('risk-val'); el.textContent=r; el.style.color = (r===t('low'))?'#00ff41':(r===t('mid'))?'#f1c40f':'#ff3131'; }

function appendChat(msg){ const cb=document.getElementById('chat-box'); const div=document.createElement('div'); div.className='chat-msg'; const h=document.createElement('span'); h.style.color='var(--accent)'; h.style.fontSize='10px'; h.textContent='[INCOMING]'; const br=document.createElement('br'); const body=document.createElement('span'); body.textContent=msg; div.appendChild(h); div.appendChild(br); div.appendChild(body); cb.appendChild(div); cb.scrollTop=cb.scrollHeight; }

function typeTerminal(text,i=0,done=null){ const el=document.getElementById('terminal-content'); if(i===0) el.textContent=''; if(i<text.length){ el.textContent+=text.charAt(i); Sound.play('snd-type'); setTimeout(()=>typeTerminal(text,i+1,done),24);} else if(done){done();}}

function getActiveMissions(){ return corporateMode ? buildCorporateMissions() : buildDefaultMissions(); }

function renderMission(){ const missions=getActiveMissions(); if(step>=missions.length){ showEndScreen(); return; } const m=missions[step]; appendChat(m.msg[LANG]||m.msg['nl']); typeTerminal(m.terminal[LANG]||m.terminal['nl']); const area=document.getElementById('choices-area'); area.innerHTML=''; if(m.type==='mask'){ renderMaskMission(m); } else if(m.type==='scanner'){ renderScannerMission(m); } else { m.choices.forEach(c=>{ const b=document.createElement('button'); b.className='choice-btn'; b.textContent = c.text[LANG]||c.text['nl']; b.onclick=()=>handleChoice(m,c); area.appendChild(b); }); } document.getElementById('log-line').textContent = `${LANG==='nl'?'Missie':'Mission'} ${step+1}/${missions.length} ${LANG==='nl'?(corporateMode?'(Corporate)':'(Standaard)'):(corporateMode?'(Corporate)':'(Standard)')} …`; }
function submitScore() {
  try {
    const missions = getActiveMissions();
    const okCount   = decisions.filter(d => d.ok).length;
    const failCount = decisions.length - okCount;

    const payload = {
      name: PLAYER,
      mode: (corporateMode ? 'Corporate' : 'Standard'),
      lang: LANG,
      score: score,
      hp: hp,
      risk: (document.getElementById('risk-val')?.textContent || ''),
      missions: missions.length,
      ok: okCount,
      fail: failCount,
      client: navigator.userAgent || '',
      repo: location.origin + location.pathname,
      page: document.title || ''
    };

    // Apps Script için CORS gereksiz; no-cors yeterli
    fetch(WEBHOOK_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(()=>{ /* sessiz geç */ });
  } catch (_) { /* sessiz geç */ }
}

function handleChoice(m,c){ Array.from(document.querySelectorAll('#choices-area .choice-btn')).forEach(btn=>btn.disabled=true); if(!c.ok){ hp-=34; if(hp<0) hp=0; Sound.play('snd-alarm'); document.getElementById('main-display').classList.add('glitch-mode'); setTimeout(()=>document.getElementById('main-display').classList.remove('glitch-mode'),600);} else { score+=1; Sound.play('snd-success'); }
  decisions.push({missionIndex:step, choiceText:(c.text[LANG]||c.text['nl']), ok:!!c.ok, feedback:(c.feedback[LANG]||c.feedback['nl'])}); document.getElementById('hp-val').textContent=hp+"%"; document.getElementById('score-val').textContent=String(score); refreshRiskUI(); pushBadge(); const fbText = (c.ok?"[OK] ":"[ALERT] ") + (c.feedback[LANG]||c.feedback['nl']); typeTerminal(fbText+"\n\n> " + (LANG==='nl'? 'Bekijk de casestudy.' : 'See the case study.')); document.getElementById('fact-text').textContent = (m.fact && (m.fact[LANG]||m.fact['nl'])) || ''; showFact(); }

function showFact(){ document.getElementById('fact-card').style.display='block'; }
function closeFact(){ document.getElementById('fact-card').style.display='none'; step++; renderMission(); }

function showEndScreen(){ const missions=getActiveMissions(); document.getElementById('end-hp').textContent=hp+"%"; document.getElementById('end-score').textContent=String(score); document.getElementById('end-risk').textContent=riskLevelFromHP(hp); document.getElementById('earned-badges').innerHTML=document.getElementById('live-badges').innerHTML; const list=document.getElementById('decisions-list'); list.innerHTML=''; decisions.forEach(d=>{ const m=missions[d.missionIndex]; const box=document.createElement('div'); box.className='summary'; const state=d.ok?'<span class="ok">✔ Correct</span>':'<span class="fail">✖ Fout</span>'; box.innerHTML = `<div><strong>${LANG==='nl'?'Missie':'Mission'} ${d.missionIndex+1}:</strong> ${m.sender}</div><div style="margin:6px 0; color:#bbb;">${m.msg[LANG]||m.msg['nl']}</div><div>${LANG==='nl'?'Jouw keuze':'Your choice'}: <em>${d.choiceText}</em> — ${state}</div><div style="margin-top:6px;">Feedback: ${d.feedback}</div>`; list.appendChild(box); }); typeTerminal(LANG==='nl'?'> OPERATIE VOLTOOID. RESULTATEN WORDEN GETOOND...':'> OPERATION COMPLETE. SHOWING RESULTS...'); document.getElementById('end-modal').style.display='block'; document.getElementById('log-line').textContent = LANG==='nl'?'Alle missies voltooid.':'All missions completed.'; }

function replay(){ step=0; hp=100; score=0; decisions.length=0; document.getElementById('hp-val').textContent='100%'; document.getElementById('score-val').textContent='0'; document.getElementById('risk-val').textContent=riskLevelFromHP(100); document.getElementById('live-badges').innerHTML=''; document.getElementById('chat-box').innerHTML = `<div id="lbl-comms" class="muted">${t('comms')}</div>`; document.getElementById('terminal-content').textContent=''; document.getElementById('choices-area').innerHTML=''; document.getElementById('end-modal').style.display='none'; renderMission(); }

function pushBadge(){ const lb=document.getElementById('live-badges'); lb.innerHTML=''; const badges=[]; if(score>=2) badges.push({cls:'green', text: LANG==='nl'?'Privacybeschermer':'Privacy Guardian'}); if(score>=3) badges.push({cls:'blue', text: LANG==='nl'?'Shadow‑AI‑jager':'Shadow‑AI Hunter'}); const act=getActiveMissions(); if(decisions.length===act.length && decisions.every(d=>d.ok)){ badges.push({cls: corporateMode?'purple':'gold', text: corporateMode?(LANG==='nl'?'Compliance‑kampioen (BIO/NIS2/AVG)':'Compliance Champion (BIO/NIS2/GDPR)'):(LANG==='nl'?'Beleidsbewaker':'Policy Enforcer')}); } badges.forEach(b=>{ const s=document.createElement('span'); s.className=`badge ${b.cls}`; s.innerHTML=`<span class="dot"></span>${b.text}`; lb.appendChild(s); }); }

// ===== Mask mission render/eval =====
function renderMaskMission(m){ const area=document.getElementById('choices-area'); area.innerHTML=''; const wrap=document.createElement('div'); wrap.className='mask-wrap'; wrap.id='mask-editor'; const parts=(m.body[LANG]||m.body['nl']).split(/(\{\{.*?\}\})/g); parts.forEach(p=>{ if(p.startsWith('{{')&&p.endsWith('}}')){ const val=p.slice(2,-2); const sp=document.createElement('span'); sp.className='pii'; sp.tabIndex=0; sp.setAttribute('role','button'); sp.setAttribute('aria-pressed','false'); sp.textContent=val; sp.addEventListener('click',()=>toggleMask(sp)); sp.addEventListener('keydown',(e)=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); toggleMask(sp);} }); wrap.appendChild(sp); wrap.appendChild(document.createTextNode(' ')); } else { wrap.appendChild(document.createTextNode(p)); } }); area.appendChild(wrap); const ctrl=document.createElement('div'); ctrl.className='mask-controls'; const send=document.createElement('button'); send.className='choice-btn'; send.textContent= LANG==='nl'?'VERZENDEN NAAR CLOUD AI':'SEND TO CLOUD AI'; send.onclick=()=>evaluateMaskMission(m); const reset=document.createElement('button'); reset.className='choice-btn'; reset.style.borderColor='var(--accent)'; reset.style.color='var(--accent)'; reset.textContent= LANG==='nl'?'NIVEAU OPNIEUW':'RETRY'; reset.onclick=()=>renderMaskMission(m); const note=document.createElement('div'); note.className='note'; note.textContent= LANG==='nl'?'Tip: Masker naam, adres, BSN, wachtwoord, e‑mail, IP…':'Tip: Mask name, address, national ID, password, email, IP…'; ctrl.appendChild(send); ctrl.appendChild(reset); area.appendChild(ctrl); area.appendChild(note); }
function toggleMask(el){ el.classList.toggle('masked'); const pr=el.getAttribute('aria-pressed')==='true'; el.setAttribute('aria-pressed', String(!pr)); Sound.play('snd-type'); }
function evaluateMaskMission(m){ const unmasked=Array.from(document.querySelectorAll('#mask-editor .pii')).filter(x=>!x.classList.contains('masked')); if(unmasked.length>0){ hp-=34; if(hp<0) hp=0; document.getElementById('hp-val').textContent=hp+'%'; refreshRiskUI(); Sound.play('snd-alarm'); const list=unmasked.map(x=>x.textContent).join(', '); document.getElementById('fact-text').textContent=(m.fact_fail[LANG]||m.fact_fail['nl'])+"\n\n"+(LANG==='nl'?'Niet gemaskeerd: ':'Unmasked: ')+list; decisions.push({missionIndex:step, choiceText: LANG==='nl'?'Maskeren: ONVOLDOENDE':'Masking: INCOMPLETE', ok:false, feedback: LANG==='nl'?'PII onvolledig gemaskeerd':'PII incompletely masked'}); document.getElementById('log-line').textContent = LANG==='nl'?'Risico op beveiligingsincident gedetecteerd.':'Security incident risk detected.'; } else { score+=1; document.getElementById('score-val').textContent=String(score); Sound.play('snd-success'); document.getElementById('fact-text').textContent=(m.fact_ok[LANG]||m.fact_ok['nl']); decisions.push({missionIndex:step, choiceText: LANG==='nl'?'Maskeren: VOLLEDIG':'Masking: COMPLETE', ok:true, feedback: LANG==='nl'?'PII correct gemaskeerd':'PII correctly masked'}); document.getElementById('log-line').textContent = LANG==='nl'?'Beslissing geaccepteerd.':'Decision accepted.'; } pushBadge(); showFact(); }

// ===== Scanner mission =====
let scInt=null, scEndTo=null, scTick=null;
function renderScannerMission(m){ const area=document.getElementById('choices-area'); area.innerHTML=''; const box=document.createElement('div'); box.className='scanner'; const head=document.createElement('div'); head.className='sc-head'; const left=document.createElement('div'); left.textContent=t('net_stream'); const timer=document.createElement('div'); timer.id='sc-timer'; timer.style.color='var(--neon-red)'; timer.textContent=formatTime(m.duration); head.appendChild(left); head.appendChild(timer); const stream=document.createElement('div'); stream.className='sc-stream'; stream.id='sc-stream'; const legend=document.createElement('div'); legend.className='sc-legend'; legend.innerHTML = `<span style="display:flex;align-items:center;gap:6px"><span class="sc-dot r"></span>[RISK]</span><span style="display:flex;align-items:center;gap:6px"><span class="sc-dot s"></span>[SAFE]</span>`; box.appendChild(head); box.appendChild(stream); box.appendChild(legend); area.appendChild(box); let tsec=m.duration, hits=0, misses=0, falses=0; function tick(){ tsec--; timer.textContent=formatTime(tsec); if(tsec<=0) finish(); }
  scTick=setInterval(tick,1000);
  function spawn(){ const p=document.createElement('div'); const isDanger=Math.random()>0.6; p.className='packet '+(isDanger?'danger':'safe'); p.textContent=isDanger?t('risk_pkt'):t('safe_pkt'); p.style.left=(Math.random()*80+5)+'%'; p.onclick=()=>{ if(isDanger){ hits++; score+=m.hitReward; Sound.play('snd-success'); } else { falses++; hp-=m.falsePenalty; if(hp<0) hp=0; Sound.play('snd-alarm'); } p.remove(); updateStats(); }; stream.appendChild(p); setTimeout(()=>{ if(p.parentNode){ if(isDanger){ misses++; hp-=m.missPenalty; if(hp<0) hp=0; updateStats(); } p.remove(); } },5200); }
  function updateStats(){ document.getElementById('hp-val').textContent=hp+'%'; document.getElementById('score-val').textContent=String(score); refreshRiskUI(); }
  scInt=setInterval(spawn, m.spawnInterval); scEndTo=setTimeout(finish, m.duration*1000);
  function finish(){ clearInterval(scInt); clearInterval(scTick); clearTimeout(scEndTo); const ok = hits >= m.successThreshold && misses < (m.successThreshold+2); if(!ok){ Sound.play('snd-alarm'); document.getElementById('fact-text').textContent=(m.fact_fail[LANG]||m.fact_fail['nl'])+`\n\n${LANG==='nl'?'Geïntercepteerd':'Intercepted'}: ${hits}\n${LANG==='nl'?'Gemist':'Missed'}: ${misses}\n${LANG==='nl'?'Vals alarm':'False alarm'}: ${falses}`; decisions.push({missionIndex:step, choiceText:`Scanner: hits=${hits}, miss=${misses}`, ok:false, feedback: LANG==='nl'?'Netwerkbewaking onvoldoende':'Network monitoring insufficient'}); document.getElementById('log-line').textContent = LANG==='nl'?'Risico op beveiligingsincident gedetecteerd.':'Security incident risk detected.'; }
    else { Sound.play('snd-success'); score+=1; document.getElementById('score-val').textContent=String(score); document.getElementById('fact-text').textContent=(m.fact_ok[LANG]||m.fact_ok['nl'])+`\n\n${LANG==='nl'?'Geïntercepteerd':'Intercepted'}: ${hits}\n${LANG==='nl'?'Gemist':'Missed'}: ${misses}\n${LANG==='nl'?'Vals alarm':'False alarm'}: ${falses}`; decisions.push({missionIndex:step, choiceText:`Scanner: hits=${hits}, miss=${misses}`, ok:true, feedback: LANG==='nl'?'Netwerkbewaking effectief':'Network monitoring effective'}); document.getElementById('log-line').textContent = LANG==='nl'?'Beslissing geaccepteerd.':'Decision accepted.'; }
    pushBadge(); showFact(); }
}
function formatTime(s){ const mm=String(Math.floor(s/60)).padStart(2,'0'); const ss=String(s%60).padStart(2,'0'); return `${mm}:${ss}`; }

// ===== Flow wiring =====
function start(){ document.getElementById('btn-start')?.remove(); renderMission(); }

document.addEventListener('DOMContentLoaded', ()=>{
  // Oyuncu adı (gerçek isim zorunlu değil; takma ad önerilir)
if (!PLAYER) {
  const promptTxt = (LANG === 'nl')
    ? 'Naam (pseudoniem is prima):'
    : 'Name (pseudonym is fine):';
  const val = (typeof window.prompt === 'function') ? window.prompt(promptTxt) : '';
  if (val && val.trim()) {
    PLAYER = val.trim();
    localStorage.setItem('player_name', PLAYER);
  } else {
    PLAYER = 'Anonymous';
  }
}
  // language init
  const sel = document.getElementById('lang-select');
  sel.value = (localStorage.getItem('lang')||'nl'); LANG = sel.value; applyLanguage();
  sel.addEventListener('change', ()=>{ LANG = sel.value; localStorage.setItem('lang', LANG); replay(); applyLanguage(); });
  // brand color
  const bc = document.getElementById('brand-color');
  bc.addEventListener('input', ()=>{ document.documentElement.style.setProperty('--accent', bc.value); document.documentElement.style.setProperty('--neon-blue', bc.value); });
  // logo
  const logoInput = document.getElementById('logo-url');
  submitScore();
  document.getElementById('btn-apply-logo').addEventListener('click', ()=>{ const v=logoInput.value.trim()||'assets/logo.svg'; document.getElementById('brand-logo').src = v; localStorage.setItem('logo', v); });
  const savedLogo = localStorage.getItem('logo'); if(savedLogo){ document.getElementById('brand-logo').src=savedLogo; logoInput.value=savedLogo; }
  // toggles
  document.getElementById('toggle-sound').addEventListener('change', (e)=>{ Sound.on = e.target.checked; });
  document.getElementById('toggle-corp').addEventListener('change', (e)=>{ corporateMode = e.target.checked; document.getElementById('status').textContent = corporateMode ? t('status_corp') : t('status_active'); replay(); });
  // buttons
  document.getElementById('btn-start').addEventListener('click', start);
  document.getElementById('btn-close-fact').addEventListener('click', closeFact);
  document.getElementById('btn-replay').addEventListener('click', replay);
  document.getElementById('btn-close-end').addEventListener('click', ()=> document.getElementById('end-modal').style.display='none');
});
