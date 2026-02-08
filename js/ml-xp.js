/* ============================================================
   XP Reward System for Rocks & Minerals
   ============================================================ */

function addXP(amount) {
    const current = parseInt(localStorage.getItem("ml_xp") || "0");
    const updated = current + amount;
    localStorage.setItem("ml_xp", updated);
    return updated;
}

function rewardLessonXP(lessonNumber) {
    // 50 XP per lesson completion
    addXP(50);
    localStorage.setItem(`rm_lesson${lessonNumber}_xp`, "true");
}

function rewardTestXP(lessonNumber) {
    // 100 XP per test completion
    addXP(100);
    localStorage.setItem(`rm_test${lessonNumber}_xp`, "true");
}

window.RMRewards = {
    addXP,
    rewardLessonXP,
    rewardTestXP
};
function updateStreak() {
    const today = new Date().toDateString();
    const last = localStorage.getItem("ml_last_active");

    if (last !== today) {
        const streak = parseInt(localStorage.getItem("ml_streak") || "0") + 1;
        localStorage.setItem("ml_streak", streak);
        localStorage.setItem("ml_last_active", today);
    }
}

updateStreak();

window.MLStreak = {
    updateStreak
};