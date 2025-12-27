
const Telnet = require("telnet-client");
console.log("Type of Telnet:", typeof Telnet);
console.log("Telnet:", Telnet);
try {
    const instance = new Telnet();
    console.log("Successfully instantiated with new Telnet()");
} catch (e) {
    console.log("Failed to instantiate with new Telnet(): " + e.message);
}
