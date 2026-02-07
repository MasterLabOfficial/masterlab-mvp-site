/* ============================================================
   MASTERLAB AI TEST ENGINE
   Global, course-agnostic test generator for all MasterLab tests.
   File: /masterlab-mvp-site/js/ml-test-engine.js
   ============================================================ */

const MLTestEngine = {

    /* ------------------------------------------------------------
       ATTEMPT TRACKING
       ------------------------------------------------------------ */
    getAttemptNumber(lesson) {
        const key = `ml_test_${lesson}_attempt`;
        const attempt = parseInt(localStorage.getItem(key) || "1");
        return attempt;
    },

    incrementAttempt(lesson) {
        const key = `ml_test_${lesson}_attempt`;
        const attempt = this.getAttemptNumber(lesson);
        localStorage.setItem(key, attempt + 1);
    },

    /* ------------------------------------------------------------
       RELEARN ACTIVATION LOGIC (FIRST ATTEMPT ONLY)
       ------------------------------------------------------------ */
    shouldActivateRelearn(lesson) {
        // Lesson 1 can never have ReLearn (no prior data)
        if (lesson === 1) return false;

        // Example: weak-spot data from previous lesson
        const weakKey = `ml_lesson_${lesson - 1}_weakspots`;
        const weakData = JSON.parse(localStorage.getItem(weakKey) || "[]");

        return weakData.length > 0;
    },

    /* ------------------------------------------------------------
       QUESTION GENERATORS (STUBS / PLACEHOLDERS)
       In the real system, these will pull from your content DB.
       ------------------------------------------------------------ */

    generateLessonQuestions(lesson, count) {
        const questions = [];
        for (let i = 0; i < count; i++) {
            questions.push({
                type: "lesson",
                sourceLesson: lesson,
                prompt: `Lesson ${lesson} concept question #${i + 1}`,
                choices: ["A", "B", "C", "D"],
                correct: ["A", "B", "C", "D"][Math.floor(Math.random() * 4)]
            });
        }
        return questions;
    },

    generateRelearnQuestions(lesson, count) {
        const questions = [];
        for (let i = 0; i < count; i++) {
            questions.push({
                type: "relearn",
                sourceLesson: lesson,
                prompt: `ReLearn question for Lesson ${lesson} #${i + 1}`,
                choices: ["A", "B", "C", "D"],
                correct: ["A", "B", "C", "D"][Math.floor(Math.random() * 4)]
            });
        }
        return questions;
    },

    generatePastQuestions(lesson, count) {
        const questions = [];
        for (let i = 0; i < count; i++) {
            questions.push({
                type: "past",
                sourceLesson: lesson - 1, // example: previous lesson
                prompt: `Past concept review question #${i + 1}`,
                choices: ["A", "B", "C", "D"],
                correct: ["A", "B", "C", "D"][Math.floor(Math.random() * 4)]
            });
        }
        return questions;
    },

    generateVocabQuestions(lesson, mode) {
        const vocabQuestions = [];

        // These are placeholders; in the real system, pull from vocab DB.
        const todayVocab = [
            "inorganic",
            "crystal structure",
            "naturally occurring",
            "definite chemical composition"
        ];

        const pastVocab = [
            "igneous",
            "metamorphic",
            "sedimentary"
        ];

        const relearnVocab = [
            "streak",
            "luster"
        ];

        let pool = [];

        // FINAL VOCAB LOGIC:
        // first attempt: today + relearn + past
        // second attempt: today only
        // third+ attempts: today only
        if (mode === "first") {
            pool = [...todayVocab, ...relearnVocab, ...pastVocab];
        } else {
            pool = [...todayVocab];
        }

        pool.forEach((term, i) => {
            vocabQuestions.push({
                type: "vocab",
                sourceLesson: lesson,
                term,
                prompt: `What is the definition of "${term}"?`,
                choices: ["A", "B", "C", "D"],
                correct: ["A", "B", "C", "D"][Math.floor(Math.random() * 4)]
            });
        });

        return vocabQuestions;
    },

    /* ------------------------------------------------------------
       MAIN TEST GENERATOR
       ------------------------------------------------------------ */
    generateTest(lesson, attempt) {
        // Determine mode based on attempt
        let mode = "first";
        if (attempt === 2) mode = "second";
        if (attempt >= 3) mode = "thirdPlus";

        const relearnActive = (mode === "first") ? this.shouldActivateRelearn(lesson) : false;

        let lessonQuestions = [];
        let relearnQuestions = [];
        let pastQuestions = [];
        let vocabQuestions = [];

        /* FIRST ATTEMPT ---------------------------------------- */
        if (mode === "first") {
            // 6 lesson questions
            lessonQuestions = this.generateLessonQuestions(lesson, 6);

            // ReLearn / Past logic
            if (lesson === 1) {
                // No past exists yet → 4 more lesson questions
                pastQuestions = this.generateLessonQuestions(lesson, 4);
            } else if (relearnActive) {
                // 2 ReLearn + 2 Past
                relearnQuestions = this.generateRelearnQuestions(lesson, 2);
                pastQuestions = this.generatePastQuestions(lesson, 2);
            } else {
                // 4 Past
                pastQuestions = this.generatePastQuestions(lesson, 4);
            }

            // Unlimited vocab (today + relearn + past)
            vocabQuestions = this.generateVocabQuestions(lesson, "first");
        }

        /* SECOND ATTEMPT ---------------------------------------- */
        if (mode === "second") {
            // 10 lesson questions only
            lessonQuestions = this.generateLessonQuestions(lesson, 10);
            // Today’s vocab only
            vocabQuestions = this.generateVocabQuestions(lesson, "second");
        }

        /* THIRD+ ATTEMPTS ---------------------------------------- */
        if (mode === "thirdPlus") {
            // 10 lesson questions only
            lessonQuestions = this.generateLessonQuestions(lesson, 10);
            // Today’s vocab only
            vocabQuestions = this.generateVocabQuestions(lesson, "thirdPlus");
        }

        /* BUILD ANSWER KEY --------------------------------------- */
        const answerKey = {};
        const allQuestions = [
            ...lessonQuestions,
            ...relearnQuestions,
            ...pastQuestions,
            ...vocabQuestions
        ];

        allQuestions.forEach((q, i) => {
            answerKey[`q${i + 1}`] = q.correct;
        });

        return {
            lesson,
            attempt,
            mode,              // "first" | "second" | "thirdPlus"
            relearnActive,
            lessonQuestions,
            relearnQuestions,
            pastQuestions,
            vocabQuestions,
            answerKey
        };
    }
};
