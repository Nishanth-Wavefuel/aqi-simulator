export interface FuelServerPayload {
	topic: string;
	name: string;
	organisation: string;
	network: string;
	startTime: string;
	endTime: string;
	timeZone: string;
	summerTimeAdjusted: boolean;
	readings: {
		PM1_0: number;
		PM2_5: number;
		PM10: number;
		O3: number;
		NO2: number;
		T: number;
		RH: number;
	};
}

export interface SensorRanges {
	PM1_0: { min: number; max: number; unit: string };
	PM2_5: { min: number; max: number; unit: string };
	PM10: { min: number; max: number; unit: string };
	O3: { min: number; max: number; unit: string };
	NO2: { min: number; max: number; unit: string };
	T: { min: number; max: number; unit: string };
	RH: { min: number; max: number; unit: string };
}
