/* ============================================================
   R&M LESSON RENDERER
   Renders lesson cards with progress tracking and lock system
   ============================================================ */

function renderRMLessons() {
    const container = document.getElementById("lesson-container");
    
    lessons.forEach(lesson => {
        const card = document.createElement("a");
        card.href = `Lessons/${lesson.file}`;
        card.className = "lesson-card";
        card.dataset.lesson = lesson.number;

        // Check if completed
        if (localStorage.getItem(`rm_lesson${lesson.number}_xp`) === "true") {
            card.classList.add("completed");
        }

        // Check if locked
        if (!RMLock.isLessonUnlocked(lesson.number)) {
            card.classList.add("disabled");
            card.href = "#";
        }

        const header = document.createElement("div");
        header.className = "lesson-header";
        header.innerHTML = `
            <h2>Lesson ${lesson.number}</h2>
            <span class="lock-status">${RMLock.isLessonUnlocked(lesson.number) ? "🔓" : "🔒"}</span>
        `;

        const p = document.createElement("p");
        p.textContent = lesson.title;

        card.appendChild(header);
        card.appendChild(p);
        
        container.appendChild(card);
    });
}

function updateProgressAndContinue(prefix) {
    const total = lessons.length;
    let completed = 0;
    let lastCompleted = 0;

    lessons.forEach(lesson => {
        if (localStorage.getItem(`${prefix}_lesson${lesson.number}_xp`) === "true") {
            completed++;
            lastCompleted = lesson.number;
        }
    });

    const percent = Math.round((completed / total) * 100);
    document.getElementById("progress-fill").style.width = percent + "%";

    let nextLesson = lastCompleted + 1;
    if (nextLesson > total) nextLesson = total;

    const nextFile = lessons.find(l => l.number === nextLesson).file;

    const continueBtn = document.getElementById("continue-btn");
    continueBtn.href = `Lessons/${nextFile}`;
    continueBtn.textContent = `Continue Lesson ${nextLesson}`;

    // R&M specific: Check if next lesson is locked
    if (!RMLock.isLessonUnlocked(nextLesson)) {
        continueBtn.href = "#";
        continueBtn.textContent = "Next Lesson Locked";
        continueBtn.classList.add("locked");
    }

    // Course completion animation
    if (completed === total) {
        continueBtn.textContent = "Course Complete!";
        continueBtn.classList.add("course-complete");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    renderRMLessons();
    updateProgressAndContinue("rm");
});
