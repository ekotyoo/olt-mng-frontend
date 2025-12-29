import dgram from 'dgram';
import crypto from 'crypto';

/**
 * Sends a RADIUS Disconnect-Request (RFC 3576) to the NAS.
 * 
 * @param nasIp - The IP address of the NAS (Router)
 * @param secret - The RADIUS Shared Secret for this NAS
 * @param sessionId - The Acct-Session-Id to terminate
 * @param username - The User-Name of the session
 * @returns Promise with success status and message
 */
export async function sendDisconnectPacket(
    nasIp: string,
    secret: string,
    sessionId: string,
    username: string
): Promise<{ success: boolean; message?: string }> {
    return new Promise((resolve) => {
        const socket = dgram.createSocket('udp4');

        // Timeout handling (5 seconds)
        const timeout = setTimeout(() => {
            try { socket.close(); } catch (e) { }
            resolve({ success: false, message: "Timeout awaiting NAS response" });
        }, 5000);

        // --- construct Attributes ---
        const attributes: Buffer[] = [];

        // Helper to create attribute buffer: [Type, Length, Value...]
        const addAttr = (type: number, value: string) => {
            const valBuf = Buffer.from(value);
            // Length field is 1 byte, includes Type(1) + Length(1) + Value(N)
            const len = valBuf.length + 2;
            const buf = Buffer.alloc(len);
            buf.writeUInt8(type, 0);
            buf.writeUInt8(len, 1);
            valBuf.copy(buf, 2);
            attributes.push(buf);
        };

        // RFC 2865 / 3576 Attributes
        // Type 1: User-Name
        addAttr(1, username);
        // Type 44: Acct-Session-Id
        addAttr(44, sessionId);

        const attrBuffer = Buffer.concat(attributes);

        // --- Construct Packet ---
        // Code (1) + Identifier (1) + Length (2) + Authenticator (16) + Attributes (N)
        const packetLength = 1 + 1 + 2 + 16 + attrBuffer.length;
        const packet = Buffer.alloc(packetLength);

        // Code 43 = Disconnect-Request
        const code = 43;
        const identifier = Math.floor(Math.random() * 255);

        packet.writeUInt8(code, 0);
        packet.writeUInt8(identifier, 1);
        packet.writeUInt16BE(packetLength, 2);

        // Authenticator Calculation for Disconnect-Request (RFC 3576):
        // MD5(Code + Identifier + Length + 16 zero octets + Attributes + Secret)

        // 1. Fill Authenticator slot with zeros temporarily
        packet.fill(0, 4, 20);

        // 2. Copy Attributes to packet
        attrBuffer.copy(packet, 20);

        // 3. Compute MD5
        const md5 = crypto.createHash('md5');
        md5.update(packet); // Packet with zero authenticator
        md5.update(secret); // Append Secret
        const signature = md5.digest();

        // 4. Write Signature back to Authenticator slot
        signature.copy(packet, 4);

        // --- Event Handlers ---
        socket.on('message', (msg) => {
            clearTimeout(timeout);
            try { socket.close(); } catch (e) { }

            const resCode = msg.readUInt8(0);
            if (resCode === 44) { // Disconnect-ACK
                resolve({ success: true, message: "Disconnect ACK received" });
            } else if (resCode === 45) { // Disconnect-NAK
                resolve({ success: false, message: "Disconnect NAK received" });
            } else {
                resolve({ success: false, message: `Unknown response code: ${resCode}` });
            }
        });

        socket.on('error', (err) => {
            clearTimeout(timeout);
            try { socket.close(); } catch (e) { }
            resolve({ success: false, message: err.message });
        });

        // --- Send ---
        // Default Port for CoA/Disconnect is 3799
        socket.send(packet, 3799, nasIp, (err) => {
            if (err) {
                clearTimeout(timeout);
                try { socket.close(); } catch (e) { }
                resolve({ success: false, message: "Send failed: " + err.message });
            }
        });
    });
}
