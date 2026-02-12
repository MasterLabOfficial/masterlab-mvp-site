/* ============================================================
   CAD LESSON RENDERER
   Renders lesson cards with progress tracking
   ============================================================ */

function renderCADLessons() {
    const container = document.getElementById("lesson-container");
    
    lessons.forEach(lesson => {
        const card = document.createElement("div");
        card.className = "lesson-card";
        card.dataset.lesson = lesson.number;

        // Check if completed
        if (localStorage.getItem(`cad_lesson${lesson.number}_xp`) === "true") {
            card.classList.add("completed");
        }

        const h3 = document.createElement("h3");
        h3.textContent = `Lesson ${lesson.number}`;

        const p = document.createElement("p");
        p.textContent = lesson.title;

        const link = document.createElement("a");
        link.href = `lessons/${lesson.file}`;
        link.className = "ml-button";
        link.textContent = "Start";

        card.appendChild(h3);
        card.appendChild(p);
        card.appendChild(link);
        
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
    continueBtn.href = `lessons/${nextFile}`;
    continueBtn.textContent = `Continue Lesson ${nextLesson}`;

    // Course completion animation
    if (completed === total) {
        continueBtn.textContent = "Course Complete!";
        continueBtn.classList.add("course-complete");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    renderCADLessons();
    updateProgressAndContinue("cad");
});
