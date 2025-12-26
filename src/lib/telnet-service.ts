import Telnet from "telnet-client";

const { Telnet: TelnetClass } = Telnet;

const params = {
    host: process.env.OLT_HOST,
    port: process.env.OLT_PORT ? parseInt(process.env.OLT_PORT) : 23,
    shellPrompt: /ZXAN.*#\s*$/, // flexible prompt
    loginPrompt: /Username:/i,
    passwordPrompt: /Password:/i,
    username: process.env.OLT_USER,
    password: process.env.OLT_PASS,
    timeout: 10000,
    negotiationMandatory: false,
    debug:
        process.env.NODE_ENV !== "production"
            ? (msg: string) => console.log("[TELNET DEBUG]", msg)
            : undefined,
};

export type OltSession = {
    sendCommand: (command: string) => Promise<string>;
}

export async function runOltSession<T>(
    action: (session: OltSession) => Promise<T>
): Promise<T> {
    const connection = new TelnetClass();

    try {
        await connection.connect(params);

        await connection.send(params.username + "\n", { waitFor: params.loginPrompt });
        await connection.send(params.password + "\n", { waitFor: params.passwordPrompt });

        await connection.send("terminal length 0", { shellPrompt: params.shellPrompt });

        const sendCommand = async (command: string) => connection.send(command, { shellPrompt: params.shellPrompt });

        return await action({ sendCommand });
    } catch (err) {
        console.error("OLT command error:", err);
        throw err;
    } finally {
        await connection.end();
    }
}

export async function runOltCommand(command: string): Promise<string> {
    return runOltSession(async (session) => {
        return session.sendCommand(command);
    });
}