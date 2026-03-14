// --- 1. 수파베이스 설정 ---
const { createClient } = supabase;
const supabaseClient = createClient('https://ngenrfzcocnusrvbuupb.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5nZW5yZnpjb2NudXNydmJ1dXBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyNTY1MTcsImV4cCI6MjA4ODgzMjUxN30.vNmP_ORgKgrVuM77wBFBHfCLw-gWaV9LuUqMq7o0rpw');

window.workoutData = {};
window.prDataList = [];
window.currentUser = null;

// --- 2. 로그인/로그아웃 로직 ---
window.signUpUser = async () => {
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    if(!email || password.length < 6) return alert("이메일과 6자리 이상의 비밀번호를 입력해주세요.");
    const { error } = await supabaseClient.auth.signUp({ email, password });
    if(error) alert("가입 실패: " + error.message); else alert("가입 성공! 이제 로그인 되었습니다.");
};

window.loginUser = async () => {
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if(error) alert("로그인 실패. 확인해주세요.");
};

window.logoutUser = async () => {
    if(confirm("로그아웃 하시겠습니까?")) {
        await supabaseClient.auth.signOut();
        window.location.reload(); // 강제 새로고침으로 완벽 초기화
    }
};

// --- 3. 인증 상태 감지 및 DB 로드 ---
supabaseClient.auth.onAuthStateChange(async (event, session) => {
    if (session && session.user) {
        window.currentUser = session.user;
        document.getElementById('login-overlay').classList.add('hidden');
        
        // 서버에서 데이터 긁어오기
        const { data } = await supabaseClient.from('user_data').select('*').eq('user_id', window.currentUser.id).single();
        if (data) { 
            window.workoutData = data.workout_data || {}; 
            window.prDataList = data.pr_data || []; 
        }
        
        // UI 그리기 시작
        window.applyLanguage(); window.renderDashboard(); window.renderCalendar(); window.renderPRs(); window.renderTimerPlan();
    } else {
        window.currentUser = null;
        document.getElementById('login-overlay').classList.remove('hidden');
        window.workoutData = {}; window.prDataList = [];
    }
});

// --- 4. 클라우드 동기화 저장 함수 ---
window.syncDataToCloud = async () => {
    if(!window.currentUser) return;
    await supabaseClient.from('user_data').upsert({
        user_id: window.currentUser.id,
        workout_data: window.workoutData,
        pr_data: window.prDataList
    });
};

window.updateAll = () => {
    window.syncDataToCloud(); // 클라우드에 쏘기
    window.renderWorkoutList(); window.showListView();
    window.renderCalendar(); window.renderDashboard(); window.renderTimerPlan();
};

window.deleteAllData = () => {
    if(confirm("⚠️ 정말 모든 데이터를 삭제하시겠습니까?")) {
        window.workoutData = {}; window.prDataList = [];
        window.updateAll();
        window.renderPRs();
    }
};

// 언어팩 (생략 없이 유지)
const i18n = { ko: { langFlag: "ENG", monthSummary: "이번 달 요약", wipeData: "데이터 초기화", noRecord: "기록이 없습니다", calcTitle: "1RM 계산기", txtDone: "완료", txtPlan: "계획", alertDel: "삭제할까요?", alertPrIncomplete: "입력해주세요", alertAutoPr: "추가됨!", todayPlanTitle: "오늘의 WOD" }, en: { langFlag: "KOR", monthSummary: "Summary", wipeData: "Reset Data", noRecord: "No records", calcTitle: "1RM Calc", txtDone: "Done", txtPlan: "Plan", alertDel: "Delete?", alertPrIncomplete: "Fill fields", alertAutoPr: "Added!", todayPlanTitle: "Today's WOD" } };
window.currentLang = 'ko';
window.applyLanguage = () => { document.getElementById('btn-lang-toggle').innerHTML = `<span class="material-icons" style="font-size:1rem;">language</span> <span>${i18n[window.currentLang].langFlag}</span>`; };
window.toggleLanguage = () => { window.currentLang = window.currentLang === 'ko' ? 'en' : 'ko'; window.applyLanguage(); window.renderDashboard(); window.renderCalendar(); window.renderTimerPlan(); };
