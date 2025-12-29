import { env } from "@/env";
import { Telnet } from "telnet-client";
import { prisma } from "@/lib/db";


export type OltConnectionParams = {
    host: string;
    port: number;
    username: string;
    password: string;
};

const defaultParams = {
    host: env.OLT_HOST,
    port: env.OLT_PORT,
    username: env.OLT_USER,
    password: env.OLT_PASS,
    shellPrompt: /ZXAN.*#\s*$/,
    loginPrompt: /Username:/i,
    passwordPrompt: /Password:/i,
    timeout: 30000,
    negotiationMandatory: false,
    debug: env.NODE_ENV !== "production"
        ? (msg: string) => console.log("[TELNET DEBUG]", msg)
        : undefined,
};

export type OltSession = {
    sendCommand: (command: string) => Promise<string>;
}

export async function runOltSession<T>(
    action: (session: OltSession) => Promise<T>,
    connectionParams?: OltConnectionParams
): Promise<T> {
    const connection = new Telnet();

    // Merge defaults with provided params
    const params = {
        ...defaultParams,
        ...(connectionParams || {}),
        // Ensure port is number if coming from env strings sometimes (zod handles conversion usually)
    };

    try {
        await connection.connect(params);

        await connection.send(params.username + "\n", { waitFor: params.loginPrompt });
        await connection.send(params.password + "\n", { waitFor: params.passwordPrompt });

        await connection.send("terminal length 0", { shellPrompt: params.shellPrompt });

        const sendCommand = async (command: string) => {
            try {
                const output = await connection.send(command, { shellPrompt: params.shellPrompt });

                // Log command asynchronously (don't block)
                prisma.commandLog.create({
                    data: {
                        command: command,
                        output: output,
                        status: "SUCCESS",
                        // In a real app we'd link to the specific OLT ID
                    }
                }).catch(err => console.error("Failed to log command", err));

                return output;
            } catch (error: any) {
                // Log failure
                prisma.commandLog.create({
                    data: {
                        command: command,
                        output: error.message || "Unknown Error",
                        status: "ERROR",
                    }
                }).catch(err => console.error("Failed to log command error", err));
                throw error;
            }
        };

        return await action({ sendCommand });
    } catch (err) {
        console.error("OLT command error:", err);
        throw err;
    } finally {
        await connection.end();
    }
}

export async function runOltCommand(command: string, connectionParams?: OltConnectionParams): Promise<string> {
    return runOltSession(async (session) => {
        return session.sendCommand(command);
    }, connectionParams);
}