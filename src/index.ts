import WebSocket from "ws";
import { handleConnection } from "./websocket";
import dotenv from "dotenv";
import { serverLogger } from "./logger";

dotenv.config();

// Configuration from environment variables
const FUEL_SERVER_URL = process.env.FUEL_SERVER_URL || "wss://fus.wavefuel.in:8080";
const DEVICE_ID = process.env.DEVICE_ID || "710255a9-07af-4c2c-bc74-962b921ff5b6";
const DEVICE_SECRET =
	process.env.DEVICE_SECRET ||
	"CNJeOimlVHRTknnJEHEFMQ==:Fl+Bvm8XHFmf7QmInVWWpLct46sTVUxFy7CIF3izq8+Yk5NG4sJdUgA/puSxcLH7gqLkU95vejfk/Rtv1cvg3cccOuqFmUPqvwize3khZp6M3UxcGYwHIgFyerEX5hrIG+x9aV0VliQZceS1tJFs52Lx5fzK3WBt/mVPQpR+j5S9yn/4p5yB2c1a6Ldlp/pjjkzpEqX1IeLRRgfiMyfhDyzPHj5y7NqoNEXnBDdqJhFLpnvCQfzm20+VmZnl5LyU";
const CONNECTION_STRING = process.env.CONNECTION_STRING || `websocket/device/${DEVICE_ID}/status`;
const RECONNECT_INTERVAL = 180000; // 3 minutes in milliseconds

let ws: WebSocket | null = null;
let reconnectTimeout: NodeJS.Timeout | null = null;

function cleanup() {
	if (ws) {
		// Remove all listeners to prevent memory leaks
		ws.removeAllListeners();
		ws.terminate();
		ws = null;
	}
	if (reconnectTimeout) {
		clearTimeout(reconnectTimeout);
		reconnectTimeout = null;
	}
}

function connect() {
	// Clean up any existing connection
	cleanup();

	serverLogger.info("Attempting to connect to FuelServer");
	ws = new WebSocket(`${FUEL_SERVER_URL}/websocket/device/${DEVICE_ID}`, {
		headers: {
			"x-device-access-key": DEVICE_SECRET,
		},
	});

	ws.on("open", () => {
		serverLogger.info(`Connected to FuelServer at ${FUEL_SERVER_URL}`);
		if (reconnectTimeout) {
			clearTimeout(reconnectTimeout);
			reconnectTimeout = null;
		}
		handleConnection(ws!, DEVICE_ID);
	});

	ws.on("error", (error: Error) => {
		serverLogger.error("WebSocket error", { context: { error: error.message } });
		scheduleReconnect();
	});

	ws.on("close", () => {
		serverLogger.warn("Connection to FuelServer closed");
		scheduleReconnect();
	});
}

function scheduleReconnect() {
	if (!reconnectTimeout) {
		serverLogger.warn("Server is out of reach. Attempting to reconnect in 3 minutes...");
		reconnectTimeout = setTimeout(() => {
			reconnectTimeout = null;
			connect();
		}, RECONNECT_INTERVAL);
	}
}

// Handle process termination
process.on("SIGINT", () => {
	serverLogger.info("Cleaning up and shutting down...");
	cleanup();
	process.exit(0);
});

process.on("SIGTERM", () => {
	serverLogger.info("Cleaning up and shutting down...");
	cleanup();
	process.exit(0);
});

// Initial connection
connect();
