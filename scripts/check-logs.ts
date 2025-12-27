import * as dotenv from "dotenv";
const res = dotenv.config({ path: '.env' });

// Mock env if missing to prevent crash during import
if (!process.env.OLT_HOST) process.env.OLT_HOST = "192.168.1.1";
if (!process.env.OLT_USER) process.env.OLT_USER = "admin";
if (!process.env.OLT_PASS) process.env.OLT_PASS = "pass";
if (!process.env.AUTH_SECRET) process.env.AUTH_SECRET = "12345678901234567890123456789012";

async function main() {
    try {
        const { runOltCommand } = await import("../src/lib/telnet-service");

        console.log("Connecting to OLT...");

        // Try common log commands
        const commands = [
            "show logging alarm",
            "show logging",
            "show history",
            "show alarm history"
        ];

        for (const cmd of commands) {
            console.log(`\nTesting '${cmd}'...`);
            try {
                const output = await runOltCommand(cmd);
                console.log("--- OUTPUT START ---");
                console.log(output.substring(0, 500) + "..."); // Print first 500 chars
                console.log("--- OUTPUT END ---");
            } catch (e) {
                console.log(`Command '${cmd}' failed:`, e);
            }
        }

    } catch (e) {
        console.error("Error:", e);
    }
}

main();
