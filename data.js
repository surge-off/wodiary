// 언어 팩 (i18n)
const i18n = {
    ko: {
        langFlag: "ENG", navHome: "HOME", navCalendar: "CALENDAR", navPr: "PR", navTimer: "TIMER",
        monthSummary: "이번 달 요약", exportCsv: "백업", workoutDays: "Workout Days", restDays: "Rest Days",
        recentRecords: "최근 기록", wipeData: "전체 데이터 초기화", noRecord: "기록이 없습니다.", calcTitle: "1RM % 계산기",
        addPr: "+ ADD PR", timerMode: "모드 선택", intWork: "WORK", intRest: "REST", intRound: "ROUND",
        btnAddWod: "+ 계획 / 운동 추가", btnClose: "CLOSE", lblSticker: "스티커 (완료 시 표시)", lblType: "분류",
        lblName: "WOD / 동작", lblScore: "기록 (Score/Weight)", lblMemo: "메모 / 목표",
        lblCompleted: "운동 완료 (체크 해제 시 '계획'으로 저장)", txtPlan: "계획", txtDone: "완료",
        btnBack: "BACK", btnSave: "SAVE", btnCancel: "CANCEL",
        prModalTitle: "PR 기록", prDate: "Date", prName: "Movement", prRecord: "Record",
        alertDel: "이 기록을 삭제하시겠습니까?", alertPrIncomplete: "종목과 기록을 모두 입력해주세요!", alertAutoPr: "PR이 달력에 완료 상태로 추가되었습니다! 🏆",
        alertWipe1: "⚠️ 정말 모든 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.", alertWipe2: "마지막 확인: 모든 기록이 영구적으로 삭제됩니다. 계속하시겠습니까?",
        todayPlanTitle: "오늘의 WOD 계획", noPlanToday: "오늘 계획된 운동이 없습니다."
    },
    en: {
        langFlag: "KOR", navHome: "HOME", navCalendar: "CALENDAR", navPr: "PR", navTimer: "TIMER",
        monthSummary: "Month Summary", exportCsv: "Backup", workoutDays: "Workout Days", restDays: "Rest Days",
        recentRecords: "Recent Records", wipeData: "Reset All Data", noRecord: "No records found.", calcTitle: "1RM % Calc",
        addPr: "+ ADD PR", timerMode: "Timer Mode", intWork: "WORK", intRest: "REST", intRound: "ROUNDS",
        btnAddWod: "+ ADD PLAN / WOD", btnClose: "CLOSE", lblSticker: "Sticker (If Done)", lblType: "Type",
        lblName: "WOD / Movement", lblScore: "Score / Weight", lblMemo: "Goal / Notes",
        lblCompleted: "Completed (Uncheck to save as 'Plan')", txtPlan: "Plan", txtDone: "Done",
        btnBack: "BACK", btnSave: "SAVE", btnCancel: "CANCEL",
        prModalTitle: "Personal Record", prDate: "Date", prName: "Movement", prRecord: "Record",
        alertDel: "Delete this record?", alertPrIncomplete: "Please fill in movement and record!", alertAutoPr: "PR automatically added to the calendar as Done! 🏆",
        alertWipe1: "⚠️ Are you sure you want to delete ALL data? This cannot be undone.", alertWipe2: "Final check: All records will be permanently deleted. Proceed?",
        todayPlanTitle: "Today's WOD Plan", noPlanToday: "No workouts planned for today."
    }
};

window.currentLang = localStorage.getItem('crossfit_lang') || 'ko';

window.applyLanguage = () => {
    const t = i18n[window.currentLang];
    document.getElementById('btn-lang-toggle').innerHTML = `<span class="material-icons" style="font-size:1rem;">language</span> <span>${t.langFlag}</span>`;
    document.querySelector('#nav-home span').innerText = t.navHome;
    document.querySelector('#nav-calendar span').innerText = t.navCalendar;
    document.querySelector('#nav-pr span').innerText = t.navPr;
    document.querySelector('#nav-timer span').innerText = t.navTimer;
    document.getElementById('txt-month-summary').innerText = t.monthSummary;
    document.getElementById('txt-export-csv').innerHTML = `<span class="material-icons" style="font-size:1rem;">download</span> ${t.exportCsv}`;
    document.getElementById('txt-btn-wipe').innerHTML = `<span class="material-icons" style="font-size:1.1rem;">delete_forever</span> ${t.wipeData}`;
    document.getElementById('txt-workout-days').innerText = t.workoutDays;
    document.getElementById('txt-rest-days').innerText = t.restDays;
    document.getElementById('txt-recent-records').innerText = t.recentRecords;
    document.getElementById('txt-1rm-calc').innerHTML = `<span class="material-icons" style="color:var(--primary-color);">calculate</span> ${t.calcTitle}`;
    document.getElementById('txt-add-pr').innerText = t.addPr;
    document.getElementById('txt-timer-mode').innerText = t.timerMode;
    document.getElementById('txt-int-work').innerText = t.intWork;
    document.getElementById('txt-int-rest').innerText = t.intRest;
    document.getElementById('txt-int-round').innerText = t.intRound;
    document.getElementById('txt-btn-add-wod').innerText = t.btnAddWod;
    document.getElementById('txt-btn-close').innerText = t.btnClose;
    document.getElementById('txt-lbl-sticker').innerText = t.lblSticker;
    document.getElementById('txt-lbl-type').innerText = t.lblType;
    document.getElementById('txt-lbl-name').innerText = t.lblName;
    document.getElementById('txt-lbl-score').innerText = t.lblScore;
    document.getElementById('txt-lbl-memo').innerText = t.lblMemo;
    document.getElementById('txt-lbl-completed').innerText = t.lblCompleted;
    document.getElementById('txt-btn-back').innerText = t.btnBack;
    document.getElementById('txt-btn-save1').innerText = t.btnSave;
    document.getElementById('txt-btn-save2').innerText = t.btnSave;
    document.getElementById('txt-btn-cancel').innerText = t.btnCancel;
    document.getElementById('txt-pr-modal-title').innerText = t.prModalTitle;
    document.getElementById('txt-pr-date').innerText = t.prDate;
    document.getElementById('txt-pr-name').innerText = t.prName;
    document.getElementById('txt-pr-record').innerText = t.prRecord;
};

window.toggleLanguage = () => { window.currentLang = window.currentLang === 'ko' ? 'en' : 'ko'; localStorage.setItem('crossfit_lang', window.currentLang); window.applyLanguage(); window.renderDashboard(); window.renderCalendar(); window.renderTimerPlan(); };

// 데이터 관리
window.workoutData = JSON.parse(localStorage.getItem('crossfit_records_v4')) || {}; 
window.prDataList = JSON.parse(localStorage.getItem('crossfit_prs_v3')) || [];

// 하위 호환성 (마이그레이션)
const oldData = JSON.parse(localStorage.getItem('crossfit_records_v2'));
if(oldData && Object.keys(window.workoutData).length === 0) {
    for(const d in oldData) {
        window.workoutData[d] = oldData[d].map(r => ({ ...r, isCompleted: true }));
    }
    localStorage.setItem('crossfit_records_v4', JSON.stringify(window.workoutData));
}

window.deleteAllData = () => {
    if(confirm(i18n[window.currentLang].alertWipe1)) {
        if(confirm(i18n[window.currentLang].alertWipe2)) {
            window.workoutData = {}; window.prDataList = [];
            localStorage.removeItem('crossfit_records_v4'); localStorage.removeItem('crossfit_prs_v3');
            window.renderDashboard(); window.renderCalendar(); window.renderPRs(); window.renderTimerPlan();
        }
    }
};

window.updateAll = () => {
    localStorage.setItem('crossfit_records_v4', JSON.stringify(window.workoutData));
    window.renderWorkoutList(); window.showListView();
    window.renderCalendar(); window.renderDashboard(); window.renderTimerPlan();
};

window.exportToCSV = () => {
    let csvContent = "\uFEFFDate,Status,Type,WOD/Movement,Score,Sticker,Memo\n";
    for (const date in window.workoutData) {
        window.workoutData[date].forEach(r => {
            const status = r.isCompleted ? 'Done' : 'Plan';
            const safeName = (r.name || "").replace(/,/g, " ");
            const safeScore = (r.score || "").replace(/,/g, " ");
            const safeMemo = (r.memo || "").replace(/,/g, " ");
            csvContent += `${date},${status},${r.type},${safeName},${safeScore},${r.sticker||""},${safeMemo}\n`;
        });
    }
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = "WODiary_records.csv";
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
};
