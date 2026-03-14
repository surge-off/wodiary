// 라운드 체커 로직
window.currentWodRound = 0;
window.addRound = () => { window.currentWodRound++; document.getElementById('wod-round-count').innerText = window.currentWodRound; };
window.subRound = () => { if(window.currentWodRound > 0) { window.currentWodRound--; document.getElementById('wod-round-count').innerText = window.currentWodRound; } };
window.resetRoundCount = () => { window.currentWodRound = 0; document.getElementById('wod-round-count').innerText = window.currentWodRound; };

// 타이머 플랜 그리기
window.renderTimerPlan = () => {
    const todayStr = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0];
    const planContainer = document.getElementById('timer-today-plan');
    const recs = window.workoutData[todayStr] || [];
    const t = i18n[window.currentLang]; // data.js에서 가져옴
    
    let html = `<div class="today-plan-header"><span class="material-icons">assignment</span> ${t.todayPlanTitle} (${todayStr})</div>`;

    if (recs.length === 0) {
        html += `<p style="color:var(--text-sub); text-align:center; font-size:0.9rem; margin:15px 0;">${t.noPlanToday}</p>`;
    } else {
        recs.forEach(r => {
            const statusIcon = r.isCompleted ? '<span class="material-icons" style="color:var(--primary-color); font-size:1.1rem;">check_circle</span>' : '<span class="material-icons" style="color:#ff9800; font-size:1.1rem;">hourglass_empty</span>';
            html += `
                <div class="today-plan-item">
                    <div class="tp-title">${statusIcon} ${r.type} ${r.name ? ' - ' + r.name : ''}</div>
                    ${r.memo ? `<div class="tp-memo">${r.memo}</div>` : ''}
                </div>
            `;
        });
    }
    planContainer.innerHTML = html;
};

// 스톱워치 / 인터벌 로직
window.timerInterval = null; window.timeInSeconds = 0; window.isTimerRunning = false;
window.intervalState = { currentRound: 1, totalRounds: 5, isWorkPhase: true, workSec: 40, restSec: 20 };

window.changeTimerMode = () => {
    const type = document.getElementById('timer-type').value;
    const phaseText = document.getElementById('timer-phase-text');
    document.getElementById('timer-setting-down').style.display = (type === 'down') ? 'flex' : 'none';
    document.getElementById('timer-setting-interval').style.display = (type === 'interval') ? 'flex' : 'none';
    window.resetTimerUI();
    
    if(type === 'down') { 
        window.timeInSeconds = (parseInt(document.getElementById('t-down-min').value) || 0) * 60 + (parseInt(document.getElementById('t-down-sec').value) || 0); 
    } else if (type === 'interval') {
        window.intervalState.workSec = parseInt(document.getElementById('t-int-work').value) || 40; 
        window.intervalState.restSec = parseInt(document.getElementById('t-int-rest').value) || 20;
        window.intervalState.totalRounds = parseInt(document.getElementById('t-int-round').value) || 5; 
        window.intervalState.currentRound = 1; window.intervalState.isWorkPhase = true; 
        window.timeInSeconds = window.intervalState.workSec;
        phaseText.innerText = `Round 1 / ${window.intervalState.totalRounds} - READY`;
    } else { 
        window.timeInSeconds = 0; 
    }
    window.updateTimerDisplay();
};

window.updateTimerDisplay = () => { document.getElementById('timer-display').innerText = `${String(Math.floor(window.timeInSeconds / 60)).padStart(2, '0')}:${String(window.timeInSeconds % 60).padStart(2, '0')}`; };

window.resetTimerUI = () => { clearInterval(window.timerInterval); window.isTimerRunning = false; document.getElementById('btn-timer-start').style.display = 'block'; document.getElementById('btn-timer-stop').style.display = 'none'; document.getElementById('timer-box').className = 'timer-container'; document.getElementById('timer-phase-text').innerText = ''; };

window.startTimer = () => {
    if (window.isTimerRunning) return;
    const type = document.getElementById('timer-type').value;
    const display = document.getElementById('timer-display');
    const phaseText = document.getElementById('timer-phase-text');
    const timerBox = document.getElementById('timer-box');

    if (window.timeInSeconds === 0 && display.innerText === "00:00" && type === 'down') { window.timeInSeconds = (parseInt(document.getElementById('t-down-min').value)||0)*60 + (parseInt(document.getElementById('t-down-sec').value)||0); }
    window.isTimerRunning = true; document.getElementById('btn-timer-start').style.display = 'none'; document.getElementById('btn-timer-stop').style.display = 'block';
    
    if(type === 'interval') { timerBox.className = window.intervalState.isWorkPhase ? 'timer-container work-phase' : 'timer-container rest-phase'; phaseText.innerText = `Round ${window.intervalState.currentRound} / ${window.intervalState.totalRounds} - ${window.intervalState.isWorkPhase ? 'WORK 🔥' : 'REST 💤'}`; }
    
    window.timerInterval = setInterval(() => {
        if (type === 'up') window.timeInSeconds++;
        else if (type === 'down') { window.timeInSeconds--; if (window.timeInSeconds <= 0) { window.resetTimerUI(); window.timeInSeconds = 0; window.updateTimerDisplay(); alert("END!"); return; } }
        else if (type === 'interval') {
            window.timeInSeconds--;
            if (window.timeInSeconds <= 0) {
                if (window.intervalState.isWorkPhase && window.intervalState.restSec > 0) { 
                    window.intervalState.isWorkPhase = false; window.timeInSeconds = window.intervalState.restSec; timerBox.className = 'timer-container rest-phase'; phaseText.innerText = `Round ${window.intervalState.currentRound} / ${window.intervalState.totalRounds} - REST 💤`; 
                } else {
                    window.intervalState.currentRound++;
                    if (window.intervalState.currentRound > window.intervalState.totalRounds) { window.resetTimerUI(); window.changeTimerMode(); alert('END!'); return; }
                    window.intervalState.isWorkPhase = true; window.timeInSeconds = window.intervalState.workSec; timerBox.className = 'timer-container work-phase'; phaseText.innerText = `Round ${window.intervalState.currentRound} / ${window.intervalState.totalRounds} - WORK 🔥`;
                }
            }
        }
        window.updateTimerDisplay();
    }, 1000);
};

window.stopTimer = () => { window.resetTimerUI(); };
window.resetTimer = () => { window.resetTimerUI(); window.changeTimerMode(); };