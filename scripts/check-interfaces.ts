import * as dotenv from "dotenv";
const res = dotenv.config({ path: '.env' });
console.log("Env loaded:", res.parsed ? "Yes" : "No");

// Mock env if missing to prevent crash during import (if it's not needed for the specific command logic being tested, though runOltCommand MIGHT need it)
if (!process.env.OLT_HOST) process.env.OLT_HOST = "192.168.1.1";
if (!process.env.OLT_USER) process.env.OLT_USER = "admin";
if (!process.env.OLT_PASS) process.env.OLT_PASS = "pass";
if (!process.env.AUTH_SECRET) process.env.AUTH_SECRET = "12345678901234567890123456789012";

async function main() {
    try {
        const { runOltCommand } = await import("../src/lib/telnet-service");

        console.log("Connecting to OLT...");
        // Try showing brief summary of interfaces to find the Uplink
        // Common commands: "show interface brief", "show card", "show uplink"

        console.log("Running 'show card'...");
        const output = await runOltCommand("show card");
        console.log("--- OUTPUT START (show card) ---");
        console.log(output);
        console.log("--- OUTPUT END ---");

        console.log("Testing 'show interface gei_1/3/1'...");
        try {
            const output3 = await runOltCommand("show interface gei_1/3/1");
            console.log("--- OUTPUT START ---");
            console.log(output3);
            console.log("--- OUTPUT END ---");
        } catch (e) { console.log("Failed:", e); }

        try {
            console.log("Running 'show interface'...");
            const output2 = await runOltCommand("show interface");
            console.log("--- OUTPUT START (show interface) ---");
            console.log(output2);
            console.log("--- OUTPUT END ---");
        } catch (e) { console.log("show interface failed", e); }

    } catch (e) {
        console.error("Error:", e);
    }
}

main();
