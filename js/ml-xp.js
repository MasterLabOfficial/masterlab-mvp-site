/* ============================================================
   XP Reward System for Rocks & Minerals
   ============================================================ */

function showXPCoin() {
    const coin = document.createElement("div");
    coin.classList.add("xp-coin");
    coin.textContent = "+50 XP";
    document.body.appendChild(coin);
    setTimeout(() => coin.remove(), 1000);
}

function showLevelUp() {
    const burst = document.createElement("div");
    burst.classList.add("level-up-burst");
    burst.textContent = "LEVEL UP!";
    document.body.appendChild(burst);
    setTimeout(() => burst.remove(), 800);
}

function addXP(amount) {
    const current = parseInt(localStorage.getItem("ml_xp") || "0");
    const updated = current + amount;
    localStorage.setItem("ml_xp", updated);

    showXPCoin();

    // Level-up every 500 XP
    if (Math.floor(updated / 500) > Math.floor(current / 500)) {
        showLevelUp();
    }

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

function applyStreakRewards() {
    const streak = parseInt(localStorage.getItem("ml_streak") || "0");

    if (streak > 0 && streak % 5 === 0) {
        addXP(200); // bonus XP
        localStorage.setItem("ml_streak_reward", "true");
    }
}

applyStreakRewards();

window.MLStreak = {
    updateStreak
};