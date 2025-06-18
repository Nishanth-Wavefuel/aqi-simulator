import WebSocket from "ws";
import { generateSensorData } from "./sensorData";
import dotenv from "dotenv";
import { serverLogger } from "./logger";

dotenv.config();

const SEND_INTERVAL = 60000; // 1 minute in milliseconds

export function handleConnection(ws: WebSocket, deviceId: string): void {
	serverLogger.info(`Device ${deviceId} connected to FuelServer`);

	let intervalId: NodeJS.Timeout | null = null;

	// Send initial data
	sendSensorData(ws, deviceId);

	// Set up interval for continuous data transmission
	intervalId = setInterval(() => {
		sendSensorData(ws, deviceId);
	}, SEND_INTERVAL);

	// Handle incoming messages (if any)
	const messageHandler = (data: string) => {
		try {
			const message = JSON.parse(data);
			serverLogger.info("Received message from server", { context: { message } });
		} catch (error) {
			serverLogger.error("Error parsing message", { context: { error: error instanceof Error ? error.message : String(error) } });
		}
	};

	// Clean up on connection close
	const closeHandler = () => {
		if (intervalId) {
			clearInterval(intervalId);
			intervalId = null;
		}
		ws.removeListener("message", messageHandler);
		ws.removeListener("close", closeHandler);
		ws.removeListener("error", errorHandler);
		serverLogger.warn(`Device ${deviceId} disconnected from FuelServer`);
	};

	// Handle errors
	const errorHandler = (error: Error) => {
		serverLogger.error("WebSocket error", { context: { error: error.message } });
		if (intervalId) {
			clearInterval(intervalId);
			intervalId = null;
		}
		ws.removeListener("message", messageHandler);
		ws.removeListener("close", closeHandler);
		ws.removeListener("error", errorHandler);
	};

	ws.on("message", messageHandler);
	ws.on("close", closeHandler);
	ws.on("error", errorHandler);
}

function sendSensorData(ws: WebSocket, deviceId: string): void {
	if (ws.readyState === WebSocket.OPEN) {
		const data = generateSensorData();

		// Format the payload according to the required template
		const payload = [
			data.topic,
			data.name,
			data.organisation,
			data.network,
			data.startTime,
			data.endTime,
			data.timeZone,
			data.summerTimeAdjusted,
			{
				PM1_0: data.readings.PM1_0,
				PM2_5: data.readings.PM2_5,
				PM10: data.readings.PM10,
				O3: data.readings.O3,
				NO2: data.readings.NO2,
				T: data.readings.T,
				RH: data.readings.RH,
			},
		];

		try {
			ws.send(JSON.stringify(payload));
			serverLogger.debug(`Data sent at ${new Date().toISOString()}`, { context: { deviceId } });
		} catch (error) {
			serverLogger.error("Error sending data", { context: { error: error instanceof Error ? error.message : String(error) } });
			// If we can't send data, the connection might be in a bad state
			// The main connection handler will handle reconnection
			ws.terminate();
		}
	}
}
