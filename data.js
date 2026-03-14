// --- 1. 수파베이스 설정 ---
const { createClient } = supabase;
const supabaseClient = createClient('https://ngenrfzcocnusrvbuupb.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5nZW5yZnpjb2NudXNydmJ1dXBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyNTY1MTcsImV4cCI6MjA4ODgzMjUxN30.vNmP_ORgKgrVuM77wBFBHfCLw-gWaV9LuUqMq7o0rpw');

window.workoutData = {};
window.prDataList = [];
window.currentUser = null;

// --- 2. 로그인/로그아웃 로직 (에러 알림 강화) ---
window.signUpUser = async () => {
    try {
        const email = document.getElementById('auth-email').value;
        const password = document.getElementById('auth-password').value;
        if(!email || password.length < 6) return alert("이메일과 6자리 이상의 비밀번호를 입력해주세요.");
        
        const { error } = await supabaseClient.auth.signUp({ email, password });
        if(error) throw error;
        alert("가입 성공! 즉시 로그인됩니다.");
    } catch (error) {
        alert("가입 에러 원인: " + error.message);
    }
};

window.loginUser = async () => {
    try {
        const email = document.getElementById('auth-email').value;
        const password = document.getElementById('auth-password').value;
        const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
        if(error) throw error;
    } catch (error) {
        alert("로그인 에러 원인: " + error.message);
    }
};

window.logoutUser = async () => {
    if(confirm("로그아웃 하시겠습니까?")) {
        await supabaseClient.auth.signOut();
        window.location.reload(); // 강제 새로고침으로 완벽 초기화
    }
};

// --- 3. 인증 상태 감지 및 DB 로드 (안전장치 추가) ---
supabaseClient.auth.onAuthStateChange(async (event, session) => {
    if (session && session.user) {
        window.currentUser = session.user;
        document.getElementById('login-overlay').classList.add('hidden');
        
        try {
            // 서버에서 데이터 긁어오기
            const { data, error } = await supabaseClient.from('user_data').select('*').eq('user_id', window.currentUser.id).single();
            if (data) { 
                window.workoutData = data.workout_data || {}; 
                window.prDataList = data.pr_data || []; 
            }
        } catch (err) {
            console.error("데이터를 가져오는 중 문제가 생겼습니다:", err);
        }
        
        // 💡 핵심 안전장치: ui.js가 완전히 로드된 상태인지 확인 후 화면 그리기
        if (typeof window.renderDashboard === 'function') {
            window.applyLanguage(); window.renderDashboard(); window.renderCalendar(); window.renderPRs(); window.renderTimerPlan();
        }
    } else {
        window.currentUser = null;
        document.getElementById('login-overlay').classList.remove('hidden');
        window.workoutData = {}; window.prDataList = [];
    }
});

// --- 4. 클라우드 동기화 저장 함수 ---
window.syncDataToCloud = async () => {
    if(!window.currentUser) return;
    try {
        const { error } = await supabaseClient.from('user_data').upsert({
            user_id: window.currentUser.id,
            workout_data: window.workoutData,
            pr_data: window.prDataList
        });
        if(error) throw error;
    } catch (error) {
        console.error("서버 저장 실패:", error.message);
    }
};

window.updateAll = () => {
    window.syncDataToCloud(); // 클라우드에 쏘기
    
    // UI 업데이트 (함수가 존재할 때만)
    if (typeof window.renderWorkoutList === 'function') {
        window.renderWorkoutList(); window.showListView();
        window.renderCalendar(); window.renderDashboard(); window.renderTimerPlan();
    }
};

window.deleteAllData = () => {
    if(confirm("⚠️ 정말 모든 데이터를 삭제하시겠습니까?")) {
        window.workoutData = {}; window.prDataList = [];
        window.updateAll();
        if (typeof window.renderPRs === 'function') window.renderPRs();
    }
};

// --- 언어팩 (유지) ---
const i18n = { ko: { langFlag: "ENG", monthSummary: "이번 달 요약", wipeData: "전체 데이터 초기화", noRecord: "기록이 없습니다.", calcTitle: "1RM % 계산기", txtDone: "완료", txtPlan: "계획", alertDel: "이 기록을 삭제하시겠습니까?", alertPrIncomplete: "종목과 기록을 모두 입력해주세요!", alertAutoPr: "PR이 달력에 완료 상태로 추가되었습니다! 🏆", todayPlanTitle: "오늘의 WOD 계획", noPlanToday: "오늘 계획된 운동이 없습니다." }, en: { langFlag: "KOR", monthSummary: "Month Summary", wipeData: "Reset All Data", noRecord: "No records found.", calcTitle: "1RM % Calc", txtDone: "Done", txtPlan: "Plan", alertDel: "Delete this record?", alertPrIncomplete: "Please fill in movement and record!", alertAutoPr: "PR automatically added to the calendar as Done! 🏆", todayPlanTitle: "Today's WOD Plan", noPlanToday: "No workouts planned for today." } };
window.currentLang = 'ko';
window.applyLanguage = () => { document.getElementById('btn-lang-toggle').innerHTML = `<span class="material-icons" style="font-size:1rem;">language</span> <span>${i18n[window.currentLang].langFlag}</span>`; };
window.toggleLanguage = () => { window.currentLang = window.currentLang === 'ko' ? 'en' : 'ko'; window.applyLanguage(); window.renderDashboard(); window.renderCalendar(); window.renderTimerPlan(); };
