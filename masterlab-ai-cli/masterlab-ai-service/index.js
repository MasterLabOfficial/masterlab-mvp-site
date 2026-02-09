const express = require("express");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");

const app = express();
app.use(bodyParser.json());

/* ============================================================
   SANITIZER — removes Markdown fences, escapes, garbage
   ============================================================ */
function sanitize(raw) {
    if (!raw) return "";

    return raw
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .replace(/\\\n/g, "\n")
        .replace(/\\+"/g, '"')
        .trim();
}

/* ============================================================
   PROMPT FACTORY — chooses the correct prompt based on task
   ============================================================ */
function buildPrompt(task, payload) {

    /* ------------------------------------------------------------
       1. SCI OLY TEST QUESTION GENERATOR
       ------------------------------------------------------------ */
    if (task === "generate-test-questions") {
        return `
You are the MasterLab AI Test Generator for Science Olympiad Rocks & Minerals (Division C).

Generate a set of 10 multiple-choice questions for Lesson ${payload.lesson}.

The questions MUST follow Science Olympiad style:
- Conceptual reasoning, not trivia
- Identification-style questions (properties, classification, processes)
- Multi-step logic (e.g., “Given these properties, which mineral…”)
- Avoid overly simple or definition-only questions
- No explanations or answer reveals in the prompt text

Return JSON ONLY in this format:

{
  "questions": [
    {
      "prompt": "",
      "choices": ["", "", "", ""],
      "correct": 0
    }
  ]
}

Lesson topics:
1 = Mineral definition, properties, Mohs scale, identification
2 = Rock cycle, igneous/sedimentary/metamorphic classification
3+ = Follow standard Science Olympiad Rocks & Minerals curriculum
`;
    }

    /* ------------------------------------------------------------
       2. SCI OLY VOCAB LIST GENERATOR
       ------------------------------------------------------------ */
    if (task === "generate-vocab") {
        return `
You are the MasterLab AI Vocab Generator for Science Olympiad Rocks & Minerals (Division C).

Generate a vocabulary list for Lesson ${payload.lesson}.

The vocab MUST follow Science Olympiad style:
- Terms used in mineral identification
- Terms used in rock classification
- Terms used in physical/chemical property analysis
- Definitions must be concise, competition-ready, and accurate

Return JSON ONLY:

{
  "vocab": [
    { "term": "", "definition": "" }
  ]
}

Generate 8–12 terms.
`;
    }

    /* ------------------------------------------------------------
       3. SCI OLY VOCAB + TEST COMBO (CLI workflows)
       ------------------------------------------------------------ */
    if (task === "generate-vocab-test") {
        return `
You are the MasterLab AI Vocab + Test Generator for Science Olympiad Rocks & Minerals (Division C).

Generate:
1. A vocab list of 8–12 terms for Lesson ${payload.lesson}
2. A set of 10 multiple-choice questions aligned with Science Olympiad style

Return JSON ONLY:

{
  "vocab": [
    { "term": "", "definition": "" }
  ],
  "questions": [
    {
      "prompt": "",
      "choices": ["", "", "", ""],
      "correct": 0
    }
  ]
}
`;
    }

    /* ------------------------------------------------------------
       4. LESSON GENERATOR (future expansion)
       ------------------------------------------------------------ */
    if (task === "generate-lesson") {
        return `
You are the MasterLab AI Lesson Generator.

Generate a full lesson file for Lesson ${payload.lessonNumber}.

Return JSON ONLY with a "transaction" array.
`;
    }

    /* ------------------------------------------------------------
       5. FALLBACK PROMPT
       ------------------------------------------------------------ */
    return `
You are the MasterLab AI Engine.

Return valid JSON ONLY.

User request:
${JSON.stringify(payload, null, 2)}
`;
}

/* ============================================================
   AI ENDPOINT — handles all tasks
   ============================================================ */
app.post("/ai", async (req, res) => {
    const { task } = req.body;

    const prompt = buildPrompt(task, req.body);

    try {
        const response = await fetch("http://localhost:11434/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "phi3",
                prompt,
                stream: false
            })
        });

        const data = await response.json();
        const cleaned = sanitize(data.response);

        let parsed;
        try {
            parsed = JSON.parse(cleaned);
        } catch (err) {
            return res.json({
                error: "Model returned invalid JSON",
                raw: cleaned
            });
        }

        return res.json(parsed);

    } catch (err) {
        return res.json({
            error: "AI service error",
            details: err.message
        });
    }
});

/* ============================================================
   START SERVER
   ============================================================ */
app.listen(3000, () => {
    console.log("MasterLab AI Service running on port 3000");
});
