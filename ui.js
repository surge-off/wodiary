// 네비게이션
window.switchView = (targetId, element) => {
    document.querySelectorAll('nav a').forEach(n => n.classList.remove('active'));
    element.classList.add('active');
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(targetId).classList.add('active');
    
    if(targetId === 'view-home') window.renderDashboard();
    if(targetId === 'view-calendar') window.renderCalendar(); 
    if(targetId === 'view-pr') window.renderPRs();
    if(targetId === 'view-timer') window.renderTimerPlan();
};

window.calc1RM = (val) => {
    const weight = parseFloat(val); const resDiv = document.getElementById('calc-result');
    if(!weight || weight <= 0) { resDiv.innerHTML = ''; return; }
    let html = '';
    [95, 90, 85, 80, 75, 65, 55, 50].forEach(p => html += `<div><span style="color:var(--text-sub); font-size:0.8rem;">${p}%</span><br><strong style="color:var(--text-main);">${(weight * p / 100).toFixed(1)}</strong></div>`);
    resDiv.innerHTML = html;
};

// PR 로직
window.currentPrIndex = -1;
window.renderPRs = () => {
    const container = document.getElementById('pr-list-container'); container.innerHTML = '';
    const sortedPRs = [...window.prDataList].sort((a, b) => new Date(b.date) - new Date(a.date));
    if(sortedPRs.length === 0) { container.innerHTML = `<p style="text-align:center; color:var(--text-sub); margin-top:30px;">${i18n[window.currentLang].noRecord}</p>`; return; }

    sortedPRs.forEach(pr => {
        const originalIndex = window.prDataList.findIndex(item => item === pr);
        const div = document.createElement('div'); div.className = 'pr-item';
        div.innerHTML = `<div class="pr-item-content" onclick="openPRModal(${originalIndex})"><div class="pr-header"><span>${pr.type}</span><span class="pr-record-val">${pr.record}</span></div><div class="pr-date">${pr.date}</div></div>
                         <button class="btn-icon-delete" onclick="deletePRDirect(${originalIndex}, event)"><span class="material-icons">delete</span></button>`;
        container.appendChild(div);
    });
};

window.deletePRDirect = (index, event) => {
    event.stopPropagation();
    if(confirm(i18n[window.currentLang].alertDel)) { window.prDataList.splice(index, 1); localStorage.setItem('crossfit_prs_v3', JSON.stringify(window.prDataList)); window.renderPRs(); }
};

window.openPRModal = (index) => {
    window.currentPrIndex = index;
    const localTodayStr = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0];

    if(index > -1) {
        const pr = window.prDataList[index];
        document.getElementById('pr-input-date').value = pr.date; document.getElementById('pr-input-type').value = pr.type; document.getElementById('pr-input-record').value = pr.record;
    } else {
        document.getElementById('pr-input-date').value = localTodayStr; document.getElementById('pr-input-type').value = ''; document.getElementById('pr-input-record').value = '';
    }
    document.getElementById('pr-modal').classList.add('active');
};

window.savePR = () => {
    let date = document.getElementById('pr-input-date').value;
    const type = document.getElementById('pr-input-type').value.trim(); const record = document.getElementById('pr-input-record').value.trim();
    if(!type || !record) { alert(i18n[window.currentLang].alertPrIncomplete); return; }
    if(!date) date = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0];

    const newPR = { date, type, record }; const isNewEntry = (window.currentPrIndex === -1);
    if(!isNewEntry) window.prDataList[window.currentPrIndex] = newPR; else window.prDataList.push(newPR);

    localStorage.setItem('crossfit_prs_v3', JSON.stringify(window.prDataList));
    window.closeModal('pr-modal'); window.renderPRs(); 

    if (isNewEntry) {
        if (!window.workoutData[date]) window.workoutData[date] = [];
        window.workoutData[date].push({ type: 'Strength', name: `[PR] ${type}`, score: record, memo: 'PR Update!', sticker: 'star', isCompleted: true });
        localStorage.setItem('crossfit_records_v4', JSON.stringify(window.workoutData));
        window.renderCalendar(); window.renderDashboard();
        setTimeout(() => { alert(i18n[window.currentLang].alertAutoPr); }, 300);
    }
};

// 달력 및 대시보드 로직
window.currentDate = new Date(); window.selectedDateString = ""; window.currentEditIndex = -1;

window.renderDashboard = () => {
    const today = new Date(); const currentYearMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    document.getElementById('dashboard-month-title').innerText = window.currentLang === 'ko' ? `${today.getMonth() + 1}월 요약` : `${today.toLocaleString('en-US', { month: 'long' })} Summary`;
    
    let wCount = 0, rCount = 0, all = [];
    for (const d in window.workoutData) {
        if (d.startsWith(currentYearMonth) && window.workoutData[d].length > 0) {
            const hasDone = window.workoutData[d].some(r => r.isCompleted && r.type !== 'Rest');
            const hasRest = window.workoutData[d].some(r => r.isCompleted && r.type === 'Rest');
            if (hasDone) wCount++; if (hasRest) rCount++;
        }
        window.workoutData[d].forEach(r => all.push({ date: d, ...r }));
    }
    document.getElementById('stat-workout-days').innerText = wCount; document.getElementById('stat-rest-days').innerText = rCount;
    
    all.sort((a, b) => new Date(b.date) - new Date(a.date));
    const recent = all.slice(0, 4); const cont = document.getElementById('recent-workout-list'); cont.innerHTML = '';
    
    if (recent.length === 0) cont.innerHTML = `<p style="color:var(--text-sub);text-align:center;">${i18n[window.currentLang].noRecord}</p>`;
    else recent.forEach(r => {
        const div = document.createElement('div'); div.className = 'workout-item';
        const st = r.sticker && r.isCompleted ? `<span class="item-sticker"><span class="material-icons" style="font-size:1.1rem; color:var(--primary-color);">${r.sticker}</span></span>` : '';
        const badge = r.isCompleted ? `<span class="status-badge status-done">${i18n[window.currentLang].txtDone}</span>` : `<span class="status-badge status-plan">${i18n[window.currentLang].txtPlan}</span>`;
        
        if(r.type === 'Rest') { div.classList.add('rest-item'); div.innerHTML = `<div class="workout-item-title">${r.date} - Rest ${badge}</div>${st}`; }
        else { div.innerHTML = `<div class="workout-item-title">${r.date} ${badge}</div><div class="workout-item-desc">${r.type}${r.name?' - '+r.name:''}</div>${st}`; }
        div.onclick = () => { document.querySelector('[data-target="view-calendar"]').click(); window.openDateModal(r.date); };
        cont.appendChild(div);
    });
};

window.changeMonth = (val) => { window.currentDate.setMonth(window.currentDate.getMonth() + val); window.renderCalendar(); };

window.renderCalendar = () => {
    const y = window.currentDate.getFullYear(), m = window.currentDate.getMonth();
    document.getElementById('current-month-year').innerText = window.currentLang === 'ko' ? `${y}년 ${m + 1}월` : `${new Date(y, m).toLocaleString('en-US', { month: 'long' })} ${y}`;
    const firstDay = new Date(y, m, 1).getDay(), daysInMonth = new Date(y, m + 1, 0).getDate();
    const grid = document.getElementById('calendar-grid'); grid.innerHTML = '';
    const daysArr = window.currentLang === 'ko' ? ['일', '월', '화', '수', '목', '금', '토'] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    daysArr.forEach(d => { const v = document.createElement('div'); v.className = 'day-name'; v.innerText = d; grid.appendChild(v); });
    for (let i = 0; i < firstDay; i++) grid.appendChild(Object.assign(document.createElement('div'), { className: 'calendar-day empty' }));
    
    const today = new Date();
    for (let i = 1; i <= daysInMonth; i++) {
        const div = document.createElement('div'); div.className = 'calendar-day'; div.innerText = i;
        const dStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        if (y === today.getFullYear() && m === today.getMonth() && i === today.getDate()) div.classList.add('today');
        
        if (window.workoutData[dStr] && window.workoutData[dStr].length > 0) {
            let isRest = false, hasDone = false, hasPlan = false, sticker = null;
            window.workoutData[dStr].forEach(r => {
                if(r.type === 'Rest') isRest = true;
                if(r.isCompleted) { hasDone = true; if(r.sticker) sticker = r.sticker; }
                else hasPlan = true;
            });

            if (isRest && hasDone) div.classList.add('is-rest');
            else if (sticker) div.innerHTML = `<span style="position:absolute; top:5px;">${i}</span><span class="day-sticker material-icons" style="font-size:1rem; color:var(--primary-color);">${sticker}</span>`;
            else if (hasDone) div.classList.add('has-record'); 
            else if (hasPlan) div.classList.add('has-plan');   
        }
        div.onclick = () => window.openDateModal(dStr); grid.appendChild(div);
    }
};

window.openDateModal = (d) => { window.selectedDateString = d; document.getElementById('modal-date-title').innerText = d; window.renderWorkoutList(); window.showListView(); document.getElementById('record-modal').classList.add('active'); };

window.renderWorkoutList = () => {
    const c = document.getElementById('workout-list'); c.innerHTML = '';
    const recs = window.workoutData[window.selectedDateString] || [];
    if (recs.length === 0) c.innerHTML = `<p style="text-align:center;color:var(--text-sub);">${i18n[window.currentLang].noRecord}</p>`;
    else recs.forEach((r, i) => {
        const div = document.createElement('div'); div.className = 'workout-item';
        const st = r.sticker && r.isCompleted ? `<span class="item-sticker"><span class="material-icons" style="font-size:1.1rem; color:var(--primary-color);">${r.sticker}</span></span>` : '';
        const badge = r.isCompleted ? `<span class="status-badge status-done">${i18n[window.currentLang].txtDone}</span>` : `<span class="status-badge status-plan">${i18n[window.currentLang].txtPlan}</span>`;
        
        let contentHtml = '';
        if(r.type === 'Rest') { div.classList.add('rest-item'); contentHtml = `<div class="workout-item-title">Rest ${badge}</div>${st}`; }
        else { contentHtml = `<div class="workout-item-title">${r.type}${r.name?' - '+r.name:''} ${badge}</div><div class="workout-item-desc">${r.memo||'Rec: '+ (r.score||'-')}</div>${st}`; }
        div.innerHTML = `<div class="workout-item-content" onclick="openFormView(${i})">${contentHtml}</div><button class="btn-icon-delete" onclick="deleteWorkoutDirect(${i}, event)"><span class="material-icons">delete</span></button>`;
        c.appendChild(div);
    });
};

window.deleteWorkoutDirect = (index, event) => {
    event.stopPropagation();
    if(confirm(i18n[window.currentLang].alertDel)) {
        window.workoutData[window.selectedDateString].splice(index, 1);
        if (window.workoutData[window.selectedDateString].length === 0) delete window.workoutData[window.selectedDateString];
        window.updateAll();
    }
};

window.showListView = () => { document.getElementById('modal-list-view').style.display = 'block'; document.getElementById('modal-form-view').style.display = 'none'; };
window.closeModal = (id) => { document.getElementById(id).classList.remove('active'); };

window.openFormView = (idx) => {
    window.currentEditIndex = idx;
    document.getElementById('modal-list-view').style.display = 'none'; document.getElementById('modal-form-view').style.display = 'block';
    
    const localTodayStr = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0];
    const defaultCheck = window.selectedDateString <= localTodayStr;

    if (idx > -1) {
        const r = window.workoutData[window.selectedDateString][idx];
        document.getElementById('wod-completed').checked = r.isCompleted;
        ['type', 'name', 'score', 'memo', 'sticker'].forEach(k => document.getElementById(`wod-${k}`).value = r[k] || (k==='type'?'AMRAP':''));
    } else {
        document.getElementById('wod-completed').checked = defaultCheck; 
        ['name', 'score', 'memo', 'sticker'].forEach(k => document.getElementById(`wod-${k}`).value = '');
        document.getElementById('wod-type').value = 'AMRAP';
    }
};

window.saveWorkout = () => {
    const r = { 
        isCompleted: document.getElementById('wod-completed').checked,
        type: document.getElementById('wod-type').value, 
        name: document.getElementById('wod-name').value, 
        score: document.getElementById('wod-score').value, 
        memo: document.getElementById('wod-memo').value, 
        sticker: document.getElementById('wod-sticker').value 
    };
    if (!window.workoutData[window.selectedDateString]) window.workoutData[window.selectedDateString] = [];
    if (window.currentEditIndex > -1) window.workoutData[window.selectedDateString][window.currentEditIndex] = r; else window.workoutData[window.selectedDateString].push(r);
    window.updateAll();
};

// 앱 초기 실행
window.onload = () => {
    window.applyLanguage(); 
    window.changeTimerMode();
    window.renderTimerPlan();
    window.renderDashboard();
    window.renderCalendar();
    window.renderPRs();
};