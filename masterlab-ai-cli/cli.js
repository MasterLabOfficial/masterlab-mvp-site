#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const readline = require("readline");
const fetch = require("node-fetch");

/* ============================================================
   APPROVAL WORKFLOW
   ============================================================ */
function askApproval(promptText) {
    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question(promptText + " (y/n): ", (answer) => {
            rl.close();
            resolve(answer.trim().toLowerCase() === "y");
        });
    });
}

/* ============================================================
   FILE WRITER
   ============================================================ */
function writeFileSafely(filePath, content) {
    const fullPath = path.join(process.cwd(), "..", filePath);

    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, content, "utf8");

    console.log("✔ Wrote:", filePath);

    fs.appendFileSync(
        path.join(process.cwd(), "transaction-log.txt"),
        `[${new Date().toISOString()}] WROTE ${filePath}\n`
    );
}

/* ============================================================
   TRANSACTION PROCESSOR
   ============================================================ */
async function processTransaction(transaction) {
    for (const item of transaction) {
        console.log("\n----------------------------------------");
        console.log("File:", item.path);
        console.log("Action:", item.action);
        console.log("Reason:", item.reason);
        console.log("\nPreview:\n");
        console.log(item.preview);
        console.log("----------------------------------------\n");

        const approved = await askApproval("Apply this change?");
        if (approved) {
            writeFileSafely(item.path, item.content);
        } else {
            console.log("✖ Skipped:", item.path);
        }
    }
}

/* ============================================================
   AI SERVICE CALLER
   ============================================================ */
async function callAIService(payload) {
    try {
        const response = await fetch("http://localhost:3000/ai", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        return await response.json();
    } catch (err) {
        return { error: err.message };
    }
}

/* ============================================================
   COMMAND ROUTER
   ============================================================ */
async function main() {
    const args = process.argv.slice(2);
    const command = args[0];
    const subcommand = args[1];

    /* ------------------------------------------------------------
       HELP COMMAND
       ------------------------------------------------------------ */
    if (command === "help" || !command) {
        console.log("MasterLab AI CLI — Available Commands\n");
        console.log("  generate test <lesson>       Generate AI test questions (SciOly style)");
        console.log("  generate vocab <lesson>      Generate AI vocab list (SciOly style)");
        console.log("  generate vt <lesson>         Generate vocab + test bundle for one lesson");
        console.log("  generate vt-all              Generate vocab + test for lessons 1–10\n");
        console.log("  generate lesson <lesson>     Generate lesson content (optional)");
        console.log("  generate course <name>       Generate all lessons for a course (optional)\n");
        console.log("  help                         Show this help menu");
        return;
    }

    /* ------------------------------------------------------------
       GENERATE TEST QUESTIONS
       ------------------------------------------------------------ */
    if (command === "generate" && subcommand === "test") {
        const lesson = args[2];
        if (!lesson) return console.log("Please specify a lesson number.");

        console.log(`Generating AI test questions for lesson ${lesson}...`);

        const result = await callAIService({
            task: "generate-test-questions",
            lesson: lesson
        });

        if (!result.questions) {
            console.log("AI did not return questions:");
            console.log(result);
            return;
        }

        console.log("\nGenerated Questions:");
        console.log(JSON.stringify(result.questions, null, 2));
        return;
    }

    /* ------------------------------------------------------------
       GENERATE VOCAB LIST
       ------------------------------------------------------------ */
    if (command === "generate" && subcommand === "vocab") {
        const lesson = args[2];
        if (!lesson) return console.log("Please specify a lesson number.");

        console.log(`Generating AI vocab list for lesson ${lesson}...`);

        const result = await callAIService({
            task: "generate-vocab",
            lesson: lesson
        });

        if (!result.vocab) {
            console.log("AI did not return vocab:");
            console.log(result);
            return;
        }

        console.log("\nGenerated Vocab:");
        console.log(JSON.stringify(result.vocab, null, 2));
        return;
    }

    /* ------------------------------------------------------------
       GENERATE VOCAB + TEST BUNDLE
       ------------------------------------------------------------ */
    if (command === "generate" && subcommand === "vt") {
        const lesson = args[2];
        if (!lesson) return console.log("Please specify a lesson number.");

        console.log(`Generating vocab + test for lesson ${lesson}...`);

        const result = await callAIService({
            task: "generate-vocab-test",
            lesson: lesson
        });

        if (!result.vocab || !result.questions) {
            console.log("AI did not return vocab+test:");
            console.log(result);
            return;
        }

        console.log("\nGenerated Vocab:");
        console.log(JSON.stringify(result.vocab, null, 2));

        console.log("\nGenerated Test Questions:");
        console.log(JSON.stringify(result.questions, null, 2));

        return;
    }

    /* ------------------------------------------------------------
       GENERATE VOCAB + TEST FOR ALL LESSONS
       ------------------------------------------------------------ */
    if (command === "generate" && subcommand === "vt-all") {
        console.log("Generating vocab + test for lessons 1–10...");

        for (let i = 1; i <= 10; i++) {
            console.log(`\n--- Lesson ${i} ---\n`);

            const result = await callAIService({
                task: "generate-vocab-test",
                lesson: i
            });

            if (!result.vocab || !result.questions) {
                console.log("AI did not return vocab+test:");
                console.log(result);
                continue;
            }

            console.log("\nGenerated Vocab:");
            console.log(JSON.stringify(result.vocab, null, 2));

            console.log("\nGenerated Test Questions:");
            console.log(JSON.stringify(result.questions, null, 2));
        }

        return;
    }

    /* ------------------------------------------------------------
       GENERATE LESSON CONTENT
       ------------------------------------------------------------ */
    if (command === "generate" && subcommand === "lesson") {
        const lesson = args[2];
        if (!lesson) return console.log("Please specify a lesson number.");

        console.log(`Generating lesson ${lesson}...`);

        const result = await callAIService({
            task: "generate-lesson",
            lessonNumber: lesson
        });

        if (!result.transaction) {
            console.log("AI did not return a transaction:");
            console.log(result);
            return;
        }

        await processTransaction(result.transaction);
        return;
    }

    /* ------------------------------------------------------------
       GENERATE ENTIRE COURSE
       ------------------------------------------------------------ */
    if (command === "generate" && subcommand === "course") {
        const course = args[2];
        if (!course) return console.log("Please specify a course name.");

        console.log(`Generating entire course: ${course}...`);

        for (let i = 1; i <= 10; i++) {
            console.log(`\n--- Generating lesson ${i} ---\n`);

            const result = await callAIService({
                task: "generate-lesson",
                course: course,
                lessonNumber: i
            });

            if (!result.transaction) {
                console.log("AI did not return a transaction:");
                console.log(result);
                continue;
            }

            await processTransaction(result.transaction);
        }

        return;
    }

    console.log("Unknown command. Use: node cli.js help");
}

main();
