# Air Quality Sensor Simulator - Vercel Deployment Guide

This guide will help you deploy your Air Quality Sensor Simulator to Vercel following best practices for Node.js TypeScript applications.

## ✅ Setup Complete

Your project has been successfully configured for Vercel deployment with:

-   ✅ Express.js server with TypeScript
-   ✅ Proper `package.json` scripts
-   ✅ CommonJS module configuration
-   ✅ Vercel configuration (`vercel.json`)
-   ✅ API endpoints for sensor data
-   ✅ CORS headers configured

## 🚀 API Endpoints

Your deployed application will have the following endpoints:

### GET `/`

Returns basic server information and health status.

### GET `/api/sensor-data`

Returns simulated air quality sensor data with readings for:

-   PM1.0, PM2.5, PM10 (particulate matter)
-   O3 (ozone)
-   NO2 (nitrogen dioxide)
-   T (temperature)
-   RH (relative humidity)

### GET `/api/status`

Returns device status and uptime information.

### POST `/api/connect`

Tests connection to the FuelServer WebSocket endpoint.

### POST `/api/send-data`

Generates and sends sensor data to the FuelServer.

## 📋 Deployment Steps

### 1. Push to GitHub

```bash
git add .
git commit -m "Configure project for Vercel deployment"
git push origin main
```

### 2. Deploy to Vercel

#### Option A: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

#### Option B: Using Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Sign in with your GitHub account
3. Click "New Project"
4. Import your repository
5. Configure environment variables (see below)
6. Deploy

### 3. Environment Variables

In your Vercel dashboard, add these environment variables:

```
FUEL_SERVER_URL=wss://fus.wavefuel.in:8080
DEVICE_ID=710255a9-07af-4c2c-bc74-962b921ff5b6
DEVICE_SECRET=CNJeOimlVHRTknnJEHEFMQ==:Fl+Bvm8XHFmf7QmInVWWpLct46sTVUxFy7CIF3izq8+Yk5NG4sJdUgA/puSxcLH7gqLkU95vejfk/Rtv1cvg3cccOuqFmUPqvwize3khZp6M3UxcGYwHIgFyerEX5hrIG+x9aV0VliQZceS1tJFs52Lx5fzK3WBt/mVPQpR+j5S9yn/4p5yB2c1a6Ldlp/pjjkzpEqX1IeLRRgfiMyfhDyzPHj5y7NqoNEXnBDdqJhFLpnvCQfzm20+VmZnl5LyU
DEVICE_NAME=AQ_SENSOR_001
ORGANISATION=wavefuel
NETWORK=default_network
TIMEZONE=UTC
NODE_ENV=production
```

## 🔧 Local Development

To run the server locally:

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Or run the compiled version
npm run build
npm start
```

The server will be available at `http://localhost:3000`

## 📁 Project Structure

```
├── src/
│   ├── api/
│   │   └── index.ts          # Vercel entry point
│   ├── server.ts             # Express server
│   ├── index.ts              # Original WebSocket client
│   ├── sensorData.ts         # Sensor data generation
│   ├── websocket.ts          # WebSocket handling
│   ├── logger.ts             # Logging utilities
│   └── types.ts              # TypeScript types
├── dist/                     # Compiled JavaScript
├── package.json
├── tsconfig.json
├── vercel.json              # Vercel configuration
└── DEPLOYMENT.md            # This file
```

## 🎯 Key Changes Made

1. **Module System**: Changed from ES modules to CommonJS for better Vercel compatibility
2. **Express Server**: Added REST API endpoints alongside the original WebSocket functionality
3. **Build Configuration**: Updated TypeScript config for Node.js/Vercel deployment
4. **Package Scripts**: Added `vercel-build` script for deployment
5. **Entry Point**: Created `/api/index.ts` as the Vercel entry point

## 🧪 Testing Your Deployment

Once deployed, test your endpoints:

```bash
# Replace YOUR_VERCEL_URL with your actual deployment URL
curl https://YOUR_VERCEL_URL.vercel.app/
curl https://YOUR_VERCEL_URL.vercel.app/api/sensor-data
curl https://YOUR_VERCEL_URL.vercel.app/api/status
```

## 🚨 Important Notes

-   Vercel serverless functions have execution time limits
-   WebSocket connections are handled differently in serverless environments
-   The original persistent WebSocket client (`src/index.ts`) is preserved for local development
-   Environment variables must be configured in Vercel dashboard for production

## 📞 Support

If you encounter issues:

1. Check Vercel function logs in the dashboard
2. Verify environment variables are set correctly
3. Ensure all dependencies are listed in `package.json`

Your Air Quality Sensor Simulator is now ready for Vercel deployment! 🎉
