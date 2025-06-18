import { SensorRanges, FuelServerPayload } from "./types";
import dotenv from "dotenv";

dotenv.config();

// Base ranges for sensor readings (typical values)
const SENSOR_RANGES: SensorRanges = {
	PM1_0: { min: 2.0, max: 3.1, unit: "µg/m³" },
	PM2_5: { min: 3.0, max: 5.0, unit: "µg/m³" },
	PM10: { min: 1.5, max: 13.0, unit: "µg/m³" },
	O3: { min: 29.0, max: 32.0, unit: "ppb" },
	NO2: { min: 32.0, max: 55.0, unit: "ppb" },
	T: { min: 13.8, max: 15.0, unit: "°C" },
	RH: { min: 45.0, max: 51.0, unit: "%" },
};

function getRandomValue(min: number, max: number): number {
	return Number((Math.random() * (max - min) + min).toFixed(2));
}

function addRandomVariation(value: number, variationPercent: number = 5): number {
	const variation = value * (variationPercent / 100);
	return Number((value + (Math.random() * variation * 2 - variation)).toFixed(2));
}

export function generateSensorData(): FuelServerPayload {
	const now = new Date();
	const startTime = new Date(now.getTime() - 60000); // 1 minute ago

	const readings = {
		PM1_0: addRandomVariation(getRandomValue(SENSOR_RANGES.PM1_0.min, SENSOR_RANGES.PM1_0.max)),
		PM2_5: addRandomVariation(getRandomValue(SENSOR_RANGES.PM2_5.min, SENSOR_RANGES.PM2_5.max)),
		PM10: addRandomVariation(getRandomValue(SENSOR_RANGES.PM10.min, SENSOR_RANGES.PM10.max)),
		O3: addRandomVariation(getRandomValue(SENSOR_RANGES.O3.min, SENSOR_RANGES.O3.max)),
		NO2: addRandomVariation(getRandomValue(SENSOR_RANGES.NO2.min, SENSOR_RANGES.NO2.max)),
		T: addRandomVariation(getRandomValue(SENSOR_RANGES.T.min, SENSOR_RANGES.T.max)),
		RH: addRandomVariation(getRandomValue(SENSOR_RANGES.RH.min, SENSOR_RANGES.RH.max)),
	};

	return {
		topic: process.env.DEVICE_SECRET || "status",
		name: process.env.DEVICE_NAME || "AQ_SENSOR_001",
		organisation: process.env.ORGANISATION || "wavefuel",
		network: process.env.NETWORK || "default_network",
		startTime: startTime.toISOString(),
		endTime: now.toISOString(),
		timeZone: process.env.TIMEZONE || "UTC",
		summerTimeAdjusted: false,
		readings,
	};
}
