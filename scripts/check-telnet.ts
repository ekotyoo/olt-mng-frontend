
import Telnet from "telnet-client";
console.log("Type of Telnet:", typeof Telnet);
console.log("Telnet keys:", Object.keys(Telnet));
try {
    // @ts-ignore
    const instance = new Telnet();
    console.log("Successfully instantiated with new Telnet()");
} catch (e) {
    console.log("Failed to instantiate with new Telnet(): " + e.message);
}

try {
    // @ts-ignore
    const instance = new Telnet.Telnet();
    console.log("Successfully instantiated with new Telnet.Telnet()");
} catch (e) {
    console.log("Failed to instantiate with new Telnet.Telnet(): " + e.message);
}
