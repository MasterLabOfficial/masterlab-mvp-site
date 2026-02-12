/* ============================================================
   R&M LESSON RENDERER
   Uses: lesson-data.js, ml-xp.js, hybrid lock system
   ============================================================ */

function renderRMLessons() {
    const container = document.getElementById("lesson-container");
    container.innerHTML = "";

    lessons.forEach(lesson => {
        const card = document.createElement("a");
        card.classList.add("lesson-card");
        card.href = lesson.file;

        // Title + subtitle
        card.innerHTML = `
            <h3>Lesson ${lesson.number}</h3>
            <p>${lesson.title}</p>
        `;

        // Apply Hybrid Lock System
        if (!RMLock.isLessonUnlocked(lesson.number)) {
            card.classList.add("locked");
            card.href = "#";
        }

        // XP completion state
        if (localStorage.getItem(`rm_lesson${lesson.number}_xp`) === "true") {
            card.classList.add("completed");
        }

        container.appendChild(card);
    });
}

document.addEventListener("DOMContentLoaded", renderRMLessons);
