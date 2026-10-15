const STORAGE_KEY='otDesignReviewMVP_v1';
const state={};
let currentStep=0;
const pages=[...document.querySelectorAll('.page')];
const navBtns=[...document.querySelectorAll('.nav-btn')];
const saveState=document.getElementById('saveState');

function esc(s=''){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]))}
function fmt(s){return esc(s||'—').replace(/\n/g,'<br>')}
function nowTime(){return new Date().toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit'})}
function save(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state));saveState.textContent='자동 저장됨 '+nowTime();updateContext();if(currentStep===6) renderPDF();}
function load(){try{Object.assign(state,JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}'))}catch(e){}
  if(!state.reviewDate) state.reviewDate=new Date().toISOString().slice(0,10);
}
function bindSimpleFields(){document.querySelectorAll('[data-key]').forEach(el=>{const k=el.dataset.key; if(state[k]!=null) el.value=state[k]; el.addEventListener('input',()=>{state[k]=el.value;save()});});}
function buildChips(containerId,key,items){const c=document.getElementById(containerId);state[key]=state[key]||[];items.forEach(item=>{const label=document.createElement('label');label.className='chip';label.innerHTML=`<input type="checkbox" ${state[key].includes(item)?'checked':''}> ${item}`;const cb=label.querySelector('input');cb.addEventListener('change',()=>{if(cb.checked&&!state[key].includes(item))state[key].push(item);if(!cb.checked)state[key]=state[key].filter(x=>x!==item);save()});c.appendChild(label);});}
function buildUserFit(){const areas=['운동·조작','감각','인지','시각','지시 이해','보조 필요 수준'];state.userFit=state.userFit||{};const body=document.getElementById('userFitBody');areas.forEach(a=>{state.userFit[a]=state.userFit[a]||{status:'',memo:''};const tr=document.createElement('tr');tr.innerHTML=`<td><strong>${a}</strong></td><td><select><option value="">선택</option><option>적절</option><option>확인 필요</option></select></td><td><textarea style="min-height:58px"></textarea></td>`;const [sel,ta]=tr.querySelectorAll('select,textarea');sel.value=state.userFit[a].status;ta.value=state.userFit[a].memo;sel.addEventListener('change',()=>{state.userFit[a].status=sel.value;save()});ta.addEventListener('input',()=>{state.userFit[a].memo=ta.value;save()});body.appendChild(tr);});}
function buildFlow(){const steps=['준비','시작','수행','피드백','종료','정리'];state.flow=state.flow||{};const wrap=document.getElementById('flowRows');steps.forEach(s=>{state.flow[s]=state.flow[s]||{action:'',risk:''};const row=document.createElement('div');row.className='flow-row';row.innerHTML=`<strong>${s}</strong><input type="text" placeholder="사용자/보조자 행동"><input type="text" placeholder="예상 어려움">`;const ins=row.querySelectorAll('input');ins[0].value=state.flow[s].action;ins[1].value=state.flow[s].risk;ins[0].addEventListener('input',()=>{state.flow[s].action=ins[0].value;save()});ins[1].addEventListener('input',()=>{state.flow[s].risk=ins[1].value;save()});wrap.appendChild(row);});}
function buildIssues(){state.issues=state.issues||Array.from({length:3},()=>({problem:'',why:'',verify:''}));const wrap=document.getElementById('issueCards');state.issues.forEach((it,i)=>{const card=document.createElement('div');card.className='issue-card';card.innerHTML=`<div class="issue-title"><div class="issue-num">0${i+1}</div><span class="small muted">CRITICAL ISSUE</span></div><div class="field"><label>문제</label><textarea data-f="problem"></textarea></div><div class="field"><label>왜 중요한가</label><textarea data-f="why"></textarea></div><div class="field"><label>어떻게 수정/확인할 것인가</label><textarea data-f="verify"></textarea></div>`;card.querySelectorAll('textarea').forEach(t=>{const f=t.dataset.f;t.value=it[f];t.addEventListener('input',()=>{state.issues[i][f]=t.value;save()});});wrap.appendChild(card);});}
function buildVerification(){state.verification=state.verification||Array.from({length:3},()=>({assumption:'',method:'',success:''}));const wrap=document.getElementById('verificationRows');state.verification.forEach((v,i)=>{const row=document.createElement('div');row.className='flow-row';row.style.gridTemplateColumns='40px 1fr 1fr 1fr';row.innerHTML=`<strong>${i+1}</strong><textarea placeholder="확인할 가정"></textarea><textarea placeholder="확인 방법"></textarea><textarea placeholder="성공 기준"></textarea>`;const tas=row.querySelectorAll('textarea');['assumption','method','success'].forEach((k,j)=>{tas[j].value=v[k];tas[j].addEventListener('input',()=>{state.verification[i][k]=tas[j].value;save()})});wrap.appendChild(row);});}
function buildNextActions(){state.nextActions=state.nextActions||Array.from({length:3},()=>({action:'',done:''}));const wrap=document.getElementById('nextActionRows');state.nextActions.forEach((v,i)=>{const row=document.createElement('div');row.className='flow-row';row.style.gridTemplateColumns='70px 1fr 1fr';row.innerHTML=`<strong>${i+1}순위</strong><textarea placeholder="다음 행동"></textarea><textarea placeholder="완료 기준"></textarea>`;const tas=row.querySelectorAll('textarea');tas[0].value=v.action;tas[1].value=v.done;tas[0].addEventListener('input',()=>{state.nextActions[i].action=tas[0].value;save()});tas[1].addEventListener('input',()=>{state.nextActions[i].done=tas[1].value;save()});wrap.appendChild(row);});}
function bindStatus(){document.querySelectorAll('input[name=status]').forEach(r=>{if(state.status===r.value)r.checked=true;r.addEventListener('change',()=>{state.status=r.value;save()})});}
function gotoStep(n){currentStep=Math.max(0,Math.min(6,n));pages.forEach((p,i)=>p.classList.toggle('active',i===currentStep));navBtns.forEach((b,i)=>b.classList.toggle('active',i===currentStep));document.getElementById('prevBtn').disabled=currentStep===0;document.getElementById('nextBtn').textContent=currentStep===6?'완료':'다음 →';if(currentStep===6)renderPDF();window.scrollTo({top:0,behavior:'smooth'});}
function updateContext(){document.getElementById('ctxProject').textContent=state.projectName||'—';document.getElementById('ctxTarget').textContent=state.targetUser||'—';document.getElementById('ctxOccupation').textContent=state.logicOccupation||state.occupationalProblem||'—';document.getElementById('ctxStatus').textContent=state.status||state.stage||'—';document.getElementById('ctxKeep').textContent=state.keep||'—';document.getElementById('ctxChange').textContent=state.change||'—';document.getElementById('ctxTest').textContent=state.test||'—';}
function renderPDF(){
  const issues=(state.issues||[]).filter(x=>x.problem||x.why||x.verify);
  const ver=(state.verification||[]).filter(x=>x.assumption||x.method||x.success);
  const acts=(state.nextActions||[]).filter(x=>x.action||x.done);
  const peo=(state.peoChanges||[]).join(', ')||'—';
  const logic=[['PROBLEM',state.logicProblem],['TOOL',state.logicFunction],['PERFORMANCE',state.logicPerformance],['CHANGE',state.logicChange],['OCCUPATION',state.logicOccupation]].filter(x=>x[1]);
  document.getElementById('pdfSheet').innerHTML=`
    <h4>OT DESIGN REVIEW</h4><h2>${fmt(state.projectName||'작업치료 교구 개발 프로젝트')}</h2>
    <div class="pdf-grid"><div class="pdf-item"><div class="pdf-label">TEAM / STUDENT</div>${fmt(state.teamName)}</div><div class="pdf-item"><div class="pdf-label">REVIEW DATE</div>${fmt(state.reviewDate)}</div><div class="pdf-item"><div class="pdf-label">STAGE</div>${fmt(state.stage)}</div><div class="pdf-item"><div class="pdf-label">STATUS</div>${fmt(state.status)}</div></div>
    <div class="rule"></div>
    <div class="pdf-item"><div class="pdf-label">TARGET USER</div><p>${fmt(state.targetUser)}</p></div>
    <div class="pdf-item"><div class="pdf-label">OCCUPATIONAL PROBLEM</div><p>${fmt(state.occupationalProblem||state.problem)}</p></div>
    <div class="pdf-item"><div class="pdf-label">PROPOSED SOLUTION</div><p>${fmt(state.solution)}</p></div>
    <div class="rule"></div>
    <div class="pdf-item"><div class="pdf-label">CLINICAL LOGIC</div>${logic.length?logic.map((x,i)=>`<p><strong>${esc(x[0])}</strong><br>${fmt(x[1])}${i<logic.length-1?'<br>↓':''}</p>`).join(''):'<p>—</p>'}</div>
    <div class="pdf-item"><div class="pdf-label">PEO FOCUS</div><p>${fmt(peo)}</p></div>
    <div class="pdf-grid"><div class="pdf-item"><div class="pdf-label">PERSON</div><p>${fmt(state.peoPerson)}</p></div><div class="pdf-item"><div class="pdf-label">ENVIRONMENT</div><p>${fmt(state.peoEnvironment)}</p></div></div>
    <div class="pdf-item"><div class="pdf-label">OCCUPATION</div><p>${fmt(state.peoOccupation)}</p></div>
    <div class="rule"></div>
    <div class="pdf-grid"><div class="pdf-item"><div class="pdf-label">CORE FUNCTION</div><p>${fmt(state.coreFunction)}</p></div><div class="pdf-item"><div class="pdf-label">USE CONTEXT</div><p>${fmt([state.contextPlace,state.contextDuration,state.contextHelper].filter(Boolean).join(' · '))}</p></div></div>
    <div class="pdf-item"><div class="pdf-label">CRITICAL ISSUES</div>${issues.length?issues.map((x,i)=>`<p><strong>${i+1}. ${fmt(x.problem)}</strong><br>${fmt(x.why)}<br><span class="muted">확인/수정: ${fmt(x.verify)}</span></p>`).join(''):'<p>—</p>'}</div>
    <div class="rule"></div>
    <div class="pdf-grid"><div><div class="bigword">KEEP</div><p>${fmt(state.keep)}</p></div><div><div class="bigword">CHANGE</div><p>${fmt(state.change)}</p></div></div>
    <div class="pdf-item"><div class="bigword">TEST</div><p>${fmt(state.test)}</p></div>
    ${ver.length?`<div class="pdf-item"><div class="pdf-label">VERIFICATION PLAN</div>${ver.map((x,i)=>`<p><strong>${i+1}. ${fmt(x.assumption)}</strong><br>${fmt(x.method)}<br><span class="muted">성공 기준: ${fmt(x.success)}</span></p>`).join('')}</div>`:''}
    <div class="rule"></div>
    <div class="pdf-item"><div class="pdf-label">NEXT ACTIONS</div>${acts.length?acts.map((x,i)=>`<p><strong>${i+1}. ${fmt(x.action)}</strong><br><span class="muted">완료 기준: ${fmt(x.done)}</span></p>`).join(''):'<p>—</p>'}</div>
    <div class="pdf-item"><div class="pdf-label">NEXT REVIEW QUESTION</div><p>${fmt(state.nextReviewQuestion)}</p></div>`;
}

load();bindSimpleFields();
buildChips('peoChips','peoChanges',['Person','Environment','Occupation','P–E Fit','P–O Fit','E–O Fit']);
buildChips('gradingChips','gradingTags',['크기','무게','저항','거리','속도','시간','정확도','반복 횟수','선택지 수','시각적 단서','신체적 도움','과제 단계','기타']);
buildUserFit();buildFlow();buildIssues();buildVerification();buildNextActions();bindStatus();updateContext();renderPDF();
navBtns.forEach((b,i)=>b.addEventListener('click',()=>gotoStep(i)));
document.getElementById('prevBtn').addEventListener('click',()=>gotoStep(currentStep-1));
document.getElementById('nextBtn').addEventListener('click',()=>{if(currentStep<6)gotoStep(currentStep+1)});
document.getElementById('printBtn').addEventListener('click',()=>{renderPDF();window.print()});
document.getElementById('resetBtn').addEventListener('click',()=>{if(confirm('현재 리뷰 데이터를 모두 지우고 새로 시작할까요?')){localStorage.removeItem(STORAGE_KEY);location.reload();}});