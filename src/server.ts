import express, { Request, Response, NextFunction } from "express";
import WebSocket from "ws";
import dotenv from "dotenv";
import { serverLogger } from "./logger";
import { generateSensorData } from "./sensorData";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration from environment variables
const FUEL_SERVER_URL = process.env.FUEL_SERVER_URL || "wss://fus.wavefuel.in:8080";
const DEVICE_ID = process.env.DEVICE_ID || "710255a9-07af-4c2c-bc74-962b921ff5b6";
const DEVICE_SECRET =
	process.env.DEVICE_SECRET ||
	"CNJeOimlVHRTknnJEHEFMQ==:Fl+Bvm8XHFmf7QmInVWWpLct46sTVUxFy7CIF3izq8+Yk5NG4sJdUgA/puSxcLH7gqLkU95vejfk/Rtv1cvg3cccOuqFmUPqvwize3khZp6M3UxcGYwHIgFyerEX5hrIG+x9aV0VliQZceS1tJFs52Lx5fzK3WBt/mVPQpR+j5S9yn/4p5yB2c1a6Ldlp/pjjkzpEqX1IeLRRgfiMyfhDyzPHj5y7NqoNEXnBDdqJhFLpnvCQfzm20+VmZnl5LyU";

app.use(express.json());

// Add CORS headers
app.use((req: Request, res: Response, next: NextFunction) => {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
	if (req.method === "OPTIONS") {
		res.sendStatus(200);
	} else {
		next();
	}
});

// Health check endpoint
app.get("/", (req: Request, res: Response) => {
	res.json({
		message: "Air Quality Sensor Simulator API",
		status: "running",
		timestamp: new Date().toISOString(),
		deviceId: DEVICE_ID,
	});
});

// Get current sensor data
app.get("/api/sensor-data", (req: Request, res: Response) => {
	try {
		const sensorData = generateSensorData();
		res.json({
			success: true,
			data: sensorData,
			timestamp: new Date().toISOString(),
		});
	} catch (error) {
		serverLogger.error("Error generating sensor data", { context: { error } });
		res.status(500).json({
			success: false,
			error: "Failed to generate sensor data",
		});
	}
});

// Get device status
app.get("/api/status", (req: Request, res: Response) => {
	res.json({
		success: true,
		status: "active",
		deviceId: DEVICE_ID,
		timestamp: new Date().toISOString(),
		uptime: process.uptime(),
	});
});

// Connect to fuel server endpoint
app.post("/api/connect", (req: Request, res: Response) => {
	try {
		const ws = new WebSocket(`${FUEL_SERVER_URL}/websocket/device/${DEVICE_ID}`, {
			headers: {
				"x-device-access-key": DEVICE_SECRET,
			},
		});

		ws.on("open", () => {
			serverLogger.info(`Connected to FuelServer at ${FUEL_SERVER_URL}`);
			res.json({
				success: true,
				message: "Successfully connected to FuelServer",
				timestamp: new Date().toISOString(),
			});
			ws.close(); // Close after confirming connection for this endpoint
		});

		ws.on("error", (error: Error) => {
			serverLogger.error("WebSocket connection error", { context: { error: error.message } });
			res.status(500).json({
				success: false,
				error: "Failed to connect to FuelServer",
				details: error.message,
			});
		});
	} catch (error) {
		serverLogger.error("Connection attempt failed", { context: { error } });
		res.status(500).json({
			success: false,
			error: "Failed to initiate connection",
		});
	}
});

// Send sensor data to fuel server
app.post("/api/send-data", (req: Request, res: Response) => {
	try {
		const sensorData = generateSensorData();

		const ws = new WebSocket(`${FUEL_SERVER_URL}/websocket/device/${DEVICE_ID}`, {
			headers: {
				"x-device-access-key": DEVICE_SECRET,
			},
		});

		ws.on("open", () => {
			ws.send(JSON.stringify(sensorData));
			serverLogger.info("Sensor data sent to FuelServer", { context: { sensorData } });

			res.json({
				success: true,
				message: "Sensor data sent successfully",
				data: sensorData,
				timestamp: new Date().toISOString(),
			});

			ws.close();
		});

		ws.on("error", (error: Error) => {
			serverLogger.error("Failed to send sensor data", { context: { error: error.message } });
			res.status(500).json({
				success: false,
				error: "Failed to send sensor data",
				details: error.message,
			});
		});
	} catch (error) {
		serverLogger.error("Error in send-data endpoint", { context: { error } });
		res.status(500).json({
			success: false,
			error: "Internal server error",
		});
	}
});

// Export the app for Vercel
export default app;

// Only start server if not in Vercel environment
if (process.env.NODE_ENV !== "production") {
	app.listen(PORT, () => {
		serverLogger.info(`Server running on port ${PORT}`);
	});
}
