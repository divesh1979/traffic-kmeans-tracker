/**
 * Traffic Data Generator Service
 * Generates synthetic urban road networks with real-time and historical multi-factor traffic data.
 */

// Real Gurgaon (Gurugram) Key Interchange Nodes & Landmarks
export const CITY_NODES = [
  { id: 'N1', name: 'Sirhaul Border (Delhi-Gurgaon Entry)', lat: 28.5020, lng: 77.0950 },
  { id: 'N2', name: 'Shankar Chowk (Cyber City Flyover)', lat: 28.4940, lng: 77.0870 },
  { id: 'N3', name: 'IFFCO Chowk Interchange', lat: 28.4715, lng: 77.0720 },
  { id: 'N4', name: 'Rajiv Chowk (NH-48 Central Underpass)', lat: 28.4590, lng: 77.0320 },
  { id: 'N5', name: 'Hero Honda Chowk (NH-48 Main Line)', lat: 28.4405, lng: 77.0055 },
  { id: 'N6', name: 'Kherki Daula Toll Plaza', lat: 28.3955, lng: 76.9685 },
  { id: 'N7', name: 'Millennium City Centre Metro (HUDA)', lat: 28.4590, lng: 77.0720 },
  { id: 'N8', name: 'Golf Course Road (Genpact Crossing)', lat: 28.4700, lng: 77.1000 },
  { id: 'N9', name: 'Golf Course Extension (Sector 56)', lat: 28.4280, lng: 77.1020 },
  { id: 'N10', name: 'Subhash Chowk (Sohna Road)', lat: 28.4350, lng: 77.0420 },
  { id: 'N11', name: 'Sohna Road Tech Park (Sector 48)', lat: 28.4120, lng: 77.0400 },
  { id: 'N12', name: 'Dwarka Expressway Link (Sector 102)', lat: 28.4810, lng: 76.9950 },
  { id: 'N13', name: 'MG Road Metro Station', lat: 28.4800, lng: 77.0800 },
  { id: 'N14', name: 'Southern Peripheral Road (SPR Interchange)', lat: 28.4050, lng: 77.0750 }
];

// Gurgaon Road Network Topology with Multi-Point Physical Highway Curves
export const INITIAL_SEGMENTS = [
  { 
    id: 'S1', 
    name: 'Delhi-Gurgaon Expressway (Sirhaul to Cyber City)', 
    from: 'N1', 
    to: 'N2', 
    distanceKm: 2.2, 
    lanes: 5, 
    speedLimit: 80, 
    controlType: 0,
    waypoints: [
      [28.5020, 77.0950],
      [28.4995, 77.0925],
      [28.4965, 77.0895],
      [28.4940, 77.0870]
    ]
  },
  { 
    id: 'S2', 
    name: 'NH-48 Cyber City to IFFCO Chowk', 
    from: 'N2', 
    to: 'N3', 
    distanceKm: 3.1, 
    lanes: 4, 
    speedLimit: 80, 
    controlType: 0,
    waypoints: [
      [28.4940, 77.0870],
      [28.4870, 77.0815],
      [28.4795, 77.0765],
      [28.4715, 77.0720]
    ]
  },
  { 
    id: 'S3', 
    name: 'NH-48 Main Line (IFFCO Chowk to Rajiv Chowk)', 
    from: 'N3', 
    to: 'N4', 
    distanceKm: 4.5, 
    lanes: 4, 
    speedLimit: 80, 
    controlType: 0,
    waypoints: [
      [28.4715, 77.0720],
      [28.4680, 77.0620],
      [28.4635, 77.0465],
      [28.4590, 77.0320]
    ]
  },
  { 
    id: 'S4', 
    name: 'NH-48 Expressway (Rajiv Chowk to Hero Honda Chowk)', 
    from: 'N4', 
    to: 'N5', 
    distanceKm: 3.4, 
    lanes: 4, 
    speedLimit: 85, 
    controlType: 0,
    waypoints: [
      [28.4590, 77.0320],
      [28.4520, 77.0210],
      [28.4460, 77.0125],
      [28.4405, 77.0055]
    ]
  },
  { 
    id: 'S5', 
    name: 'NH-48 Southern Arterial (Hero Honda to Kherki Daula Toll)', 
    from: 'N5', 
    to: 'N6', 
    distanceKm: 6.2, 
    lanes: 4, 
    speedLimit: 90, 
    controlType: 3,
    waypoints: [
      [28.4405, 77.0055],
      [28.4280, 76.9920],
      [28.4120, 76.9800],
      [28.3955, 76.9685]
    ]
  },
  { 
    id: 'S6', 
    name: 'Cyber City Rapid Metro Corridor', 
    from: 'N2', 
    to: 'N13', 
    distanceKm: 1.8, 
    lanes: 3, 
    speedLimit: 50, 
    controlType: 2,
    waypoints: [
      [28.4940, 77.0870],
      [28.4870, 77.0840],
      [28.4795, 77.0795]
    ]
  },
  { 
    id: 'S7', 
    name: 'Golf Course Road 16-Lane Expressway', 
    from: 'N13', 
    to: 'N8', 
    distanceKm: 2.5, 
    lanes: 4, 
    speedLimit: 70, 
    controlType: 0,
    waypoints: [
      [28.4795, 77.0795],
      [28.4760, 77.0880],
      [28.4725, 77.0945],
      [28.4695, 77.0990]
    ]
  },
  { 
    id: 'S8', 
    name: 'Golf Course Extension Corridor', 
    from: 'N8', 
    to: 'N9', 
    distanceKm: 4.8, 
    lanes: 3, 
    speedLimit: 65, 
    controlType: 1,
    waypoints: [
      [28.4695, 77.0990],
      [28.4560, 77.0998],
      [28.4410, 77.1005],
      [28.4275, 77.1015]
    ]
  },
  { 
    id: 'S9', 
    name: 'Sohna Road Spine (Rajiv Chowk to Subhash Chowk)', 
    from: 'N4', 
    to: 'N10', 
    distanceKm: 3.0, 
    lanes: 3, 
    speedLimit: 50, 
    controlType: 2,
    waypoints: [
      [28.4590, 77.0320],
      [28.4500, 77.0355],
      [28.4425, 77.0385],
      [28.4345, 77.0415]
    ]
  },
  { 
    id: 'S10', 
    name: 'Sohna Road Commercial Belt (Subhash Chowk to Sec 48)', 
    from: 'N10', 
    to: 'N11', 
    distanceKm: 2.6, 
    lanes: 3, 
    speedLimit: 55, 
    controlType: 2,
    waypoints: [
      [28.4345, 77.0415],
      [28.4250, 77.0405],
      [28.4180, 77.0400],
      [28.4115, 77.0395]
    ]
  },
  { 
    id: 'S11', 
    name: 'HUDA Metro Connector (IFFCO to Millennium City Centre)', 
    from: 'N3', 
    to: 'N7', 
    distanceKm: 1.6, 
    lanes: 2, 
    speedLimit: 45, 
    controlType: 2,
    waypoints: [
      [28.4715, 77.0720],
      [28.4650, 77.0722],
      [28.4595, 77.0725]
    ]
  },
  { 
    id: 'S12', 
    name: 'Millennium Metro to Subhash Chowk Arterial', 
    from: 'N7', 
    to: 'N10', 
    distanceKm: 4.2, 
    lanes: 2, 
    speedLimit: 50, 
    controlType: 2,
    waypoints: [
      [28.4595, 77.0725],
      [28.4480, 77.0580],
      [28.4345, 77.0415]
    ]
  },
  { 
    id: 'S13', 
    name: 'Southern Peripheral Road (SPR East-West Bypass)', 
    from: 'N9', 
    to: 'N14', 
    distanceKm: 4.0, 
    lanes: 3, 
    speedLimit: 75, 
    controlType: 1,
    waypoints: [
      [28.4275, 77.1015],
      [28.4140, 77.0950],
      [28.4060, 77.0850],
      [28.4045, 77.0745]
    ]
  },
  { 
    id: 'S14', 
    name: 'SPR Extension to Kherki Daula Toll', 
    from: 'N14', 
    to: 'N6', 
    distanceKm: 5.5, 
    lanes: 3, 
    speedLimit: 80, 
    controlType: 0,
    waypoints: [
      [28.4045, 77.0745],
      [28.4010, 77.0300],
      [28.3980, 76.9950],
      [28.3955, 76.9685]
    ]
  },
  { 
    id: 'S15', 
    name: 'Dwarka Expressway Northern Link', 
    from: 'N1', 
    to: 'N12', 
    distanceKm: 7.8, 
    lanes: 4, 
    speedLimit: 90, 
    controlType: 0,
    waypoints: [
      [28.5020, 77.0950],
      [28.5050, 77.0500],
      [28.4960, 77.0150],
      [28.4805, 76.9945]
    ]
  },
  { 
    id: 'S16', 
    name: 'Dwarka Expressway to Hero Honda Link', 
    from: 'N12', 
    to: 'N5', 
    distanceKm: 5.1, 
    lanes: 3, 
    speedLimit: 75, 
    controlType: 1,
    waypoints: [
      [28.4805, 76.9945],
      [28.4650, 76.9980],
      [28.4510, 77.0015],
      [28.4405, 77.0055]
    ]
  }
];

import realTrafficData from './realTrafficData.json';

/**
 * Generate simulated metrics for the 10 traffic factors on each segment using Traffic_Flow_Dataset.csv
 */
export function generateSegmentTelemetry(segment, envConfig = {}) {
  const realData = realTrafficData[segment.id] || {};
  
  const {
    timeOfDay = 17,
    dayOfWeek = 2,
    seasonality = 1,
    precipitation = 0,
    rushHourMultiplier = 1.0,
    vehicleMixHeavy = 15
  } = envConfig;

  // Real sensor baselines from Traffic_Flow_Dataset.csv
  const baseVolume = realData.volume || 1400;
  const baseSpeed = realData.speed || 45;
  const baseDensity = realData.density || 50;

  // Environmental modifiers
  const isMorningPeak = timeOfDay >= 7 && timeOfDay <= 9;
  const isEveningPeak = timeOfDay >= 16 && timeOfDay <= 19;
  const peakFactor = (isMorningPeak || isEveningPeak) ? 1.4 * rushHourMultiplier : 0.8;
  const weatherSpeedPenalty = precipitation === 0 ? 1.0 : precipitation === 1 ? 0.85 : precipitation === 2 ? 0.65 : 0.45;

  const volume = Math.round(baseVolume * peakFactor);
  const speed = Math.max(8, Math.round(baseSpeed * weatherSpeedPenalty));
  const density = Math.round(baseDensity * (volume / (baseVolume || 1)));
  const capacity = segment.lanes * 1100;
  const vcRatio = parseFloat((volume / capacity).toFixed(2));

  return {
    id: segment.id,
    name: segment.name,
    from: segment.from,
    to: segment.to,
    distanceKm: segment.distanceKm,
    lanes: segment.lanes,
    speedLimit: segment.speedLimit,
    
    // Core Traffic Flow Factors from Traffic_Flow_Dataset.csv:
    volume,
    speed,
    density,
    queueMeters: realData.queueMeters || 120,
    signalDelaySec: realData.signalDelaySec || 45,
    timeOfDay,
    dayOfWeek,
    seasonality,
    precipitation,
    capacity,
    controlDevices: segment.controlType,
    vehicleMix: vehicleMixHeavy,

    vcRatio,
    estimatedTravelMinutes: parseFloat(((segment.distanceKm / Math.max(speed, 5)) * 60).toFixed(1)),
    isAnomaly: false
  };
}

/**
 * Generates historical multi-factor logs for model training & pattern visualization
 */
export function generateHistoricalDataset(segments = INITIAL_SEGMENTS, sampleCount = 300) {
  const dataset = [];
  const days = [1, 2, 3, 4, 5]; // Weekdays focus
  
  for (let i = 0; i < sampleCount; i++) {
    const randomSeg = segments[i % segments.length];
    const hour = Math.floor(Math.random() * 24);
    const day = days[Math.floor(Math.random() * days.length)];
    const prep = Math.random() > 0.75 ? Math.floor(Math.random() * 3) + 1 : 0;
    const mix = Math.floor(8 + Math.random() * 25);

    const record = generateSegmentTelemetry(randomSeg, {
      timeOfDay: hour,
      dayOfWeek: day,
      seasonality: Math.floor(Math.random() * 4),
      precipitation: prep,
      vehicleMixHeavy: mix
    });

    dataset.push(record);
  }

  return dataset;
}
