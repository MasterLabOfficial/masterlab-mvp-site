/* ============================================================
   MASTERLAB AI TEST ENGINE — AI-POWERED VERSION
   Fully dynamic, AI-generated tests for all MasterLab lessons.
   ============================================================ */

const MLTestEngine = {

    /* ------------------------------------------------------------
       ATTEMPT TRACKING
       ------------------------------------------------------------ */
    getAttemptNumber(lesson) {
        const key = `ml_test_${lesson}_attempt`;
        return parseInt(localStorage.getItem(key) || "1");
    },

    incrementAttempt(lesson) {
        const key = `ml_test_${lesson}_attempt`;
        const attempt = this.getAttemptNumber(lesson);
        localStorage.setItem(key, attempt + 1);
    },

    /* ------------------------------------------------------------
       FETCH QUESTIONS FROM AI SERVICE
       ------------------------------------------------------------ */
    async fetchAIQuestions(lesson, attempt) {
        try {
            const response = await fetch("http://localhost:3000/ai", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    task: "generate-test-questions",
                    lesson,
                    attempt
                })
            });

            const data = await response.json();

            if (!data.questions) {
                console.warn("AI returned no questions:", data);
                return [];
            }

            return data.questions.map(q => ({
                type: "ai",
                sourceLesson: lesson,
                prompt: q.prompt,
                choices: q.choices,
                correct: q.correct
            }));

        } catch (err) {
            console.error("AI fetch error:", err);
            return [];
        }
    },

    /* ------------------------------------------------------------
       MAIN TEST GENERATOR (AI ONLY)
       ------------------------------------------------------------ */
    async generateTest(lesson) {
        const attempt = this.getAttemptNumber(lesson);

        // Fetch AI-generated questions
        const aiQuestions = await this.fetchAIQuestions(lesson, attempt);

        // Build answer key
        const answerKey = {};
        aiQuestions.forEach((q, i) => {
            answerKey[`q${i + 1}`] = q.correct;
        });

        return {
            lesson,
            attempt,
            mode: "ai",
            relearnActive: false,
            lessonQuestions: aiQuestions,
            relearnQuestions: [],
            pastQuestions: [],
            vocabQuestions: [],
            answerKey
        };
    },

    /* ============================================================
       startTest METHOD — Builds the test page
       ============================================================ */
    async startTest(config) {
        const { lesson, course } = config;

        // Generate full AI test
        const test = await this.generateTest(lesson);

        const allQuestions = [
            ...test.lessonQuestions,
            ...test.relearnQuestions,
            ...test.pastQuestions,
            ...test.vocabQuestions
        ];

        // Convert to display format
        const formatted = allQuestions.map(q => ({
            q: q.prompt,
            a: q.choices,
            c: q.correct,
            isVocab: false,
            term: null
        }));

        // Shuffle
        const shuffled = this.shuffleArray(formatted);

        // Render
        this.renderTest(shuffled, lesson, course);
    },

    /* ------------------------------------------------------------
       SHUFFLE ARRAY
       ------------------------------------------------------------ */
    shuffleArray(arr) {
        const newArr = [...arr];
        for (let i = newArr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
        }
        return newArr;
    },

    /* ------------------------------------------------------------
       RENDER TEST TO DOM
       ------------------------------------------------------------ */
    renderTest(questions, lesson, course) {
        const container = document.getElementById("test-container");
        if (!container) {
            console.warn("No #test-container found.");
            return;
        }

        let html = '<form id="answer-form">';

        questions.forEach((q, idx) => {
            const qNum = idx + 1;

            html += `
                <div class="question" data-q="${qNum}">
                    <h3>Question ${qNum}</h3>
                    <p><strong>${q.q}</strong></p>
                    <div class="choices">
            `;

            q.a.forEach((choice, cIdx) => {
                const inputId = `q${qNum}_c${cIdx}`;
                html += `
                    <label>
                        <input type="radio" name="q${qNum}" value="${cIdx}" id="${inputId}">
                        ${choice}
                    </label><br>
                `;
            });

            html += `</div></div>`;
        });

        html += `<button type="submit" class="submit-btn">Submit Test</button>`;
        html += `</form>`;

        container.innerHTML = html;

        document.getElementById("answer-form").addEventListener("submit", (e) => {
            e.preventDefault();
            MLTestEngine.submitTest(questions, lesson, course);
        });
    },

    /* ------------------------------------------------------------
       SUBMIT & GRADE TEST
       ------------------------------------------------------------ */
    submitTest(questions, lesson, course) {
        const form = document.getElementById("answer-form");
        let score = 0;
        const answers = {};

        questions.forEach((q, idx) => {
            const qNum = idx + 1;
            const selected = form.querySelector(`input[name="q${qNum}"]:checked`);
            const userAnswer = selected ? parseInt(selected.value) : null;

            answers[`q${qNum}`] = userAnswer;

            if (userAnswer === q.c) score++;
        });

        const percentage = Math.round((score / questions.length) * 100);

        // Save results
        const key = `ml_test_${lesson}_results_${Date.now()}`;
        localStorage.setItem(key, JSON.stringify({
            lesson,
            course,
            score,
            total: questions.length,
            percentage,
            answers,
            timestamp: new Date().toISOString()
        }));

        this.showResults(score, questions.length, percentage, lesson, course);
    },

    /* ------------------------------------------------------------
       SHOW RESULTS
       ------------------------------------------------------------ */
    showResults(score, total, percentage, lesson, course) {
        const container = document.getElementById("test-container");

        let html = `
            <div class="test-results">
                <h2>Test Complete!</h2>
                <p>You scored <strong>${score} out of ${total}</strong> (${percentage}%)</p>
        `;

        html += percentage >= 80
            ? `<p class="success">Great work! You passed this lesson.</p>`
            : `<p class="warning">You need to review this lesson before moving on.</p>`;

        html += `<a href="/" class="btn">Return to Dashboard</a></div>`;

        container.innerHTML = html;
    }
};
