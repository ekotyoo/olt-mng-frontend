import Telnet from "telnet-client";

const { Telnet: TelnetClass } = Telnet;

let sharedConnection: any | null = null;

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

/**
 * Ensure we have a connected Telnet session
 */
async function getConnection() {
    if (sharedConnection && sharedConnection._socket?.writable) {
        return sharedConnection;
    }

    const connection = new TelnetClass();
    await connection.connect(params);

    await connection.send(params.username + "\n", { waitFor: params.loginPrompt });
    await connection.send(params.password + "\n", { waitFor: params.passwordPrompt });

    await connection.send("terminal length 0", { shellPrompt: params.shellPrompt });

    sharedConnection = connection;
    return connection;
}

/**
 * Run a command on OLT and return raw output
 */
export async function runOltCommand(command: string): Promise<string> {
    const conn = await getConnection();
    try {
        const result = await conn.send(command, { shellPrompt: params.shellPrompt });
        console.log(result);
        return result;
    } catch (err) {
        console.error("OLT command error:", err);
        throw err;
    } finally {
        await closeOltConnection();
    }
}

/**
 * Close the connection (optional, for manual cleanup)
 */
export async function closeOltConnection() {
    if (sharedConnection) {
        await sharedConnection.end();
        sharedConnection = null;
    }
}
