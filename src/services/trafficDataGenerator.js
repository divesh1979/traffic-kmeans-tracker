/**
 * Traffic Data Generator Service
 * Generates synthetic urban road networks with real-time and historical multi-factor traffic data.
 */

// Real Gurgaon (Gurugram) Key Interchange Nodes & Landmarks
export const CITY_NODES = [
  { id: 'N1', name: 'Sirhaul Border (Delhi-Gurgaon Entry)', lat: 28.5039, lng: 77.0970 },
  { id: 'N2', name: 'Shankar Chowk (Cyber City Hub)', lat: 28.4950, lng: 77.0885 },
  { id: 'N3', name: 'IFFCO Chowk Interchange', lat: 28.4720, lng: 77.0725 },
  { id: 'N4', name: 'Rajiv Chowk (NH-48 Central)', lat: 28.4595, lng: 77.0325 },
  { id: 'N5', name: 'Hero Honda Chowk (NH-48 Expressway)', lat: 28.4410, lng: 77.0060 },
  { id: 'N6', name: 'Kherki Daula Toll Plaza', lat: 28.3960, lng: 76.9690 },
  { id: 'N7', name: 'Millennium City Centre Metro (HUDA)', lat: 28.4590, lng: 77.0720 },
  { id: 'N8', name: 'Golf Course Road (Genpact Crossing)', lat: 28.4700, lng: 77.1000 },
  { id: 'N9', name: 'Golf Course Extension (Sector 56)', lat: 28.4280, lng: 77.1020 },
  { id: 'N10', name: 'Subhash Chowk (Sohna Road)', lat: 28.4350, lng: 77.0420 },
  { id: 'N11', name: 'Sohna Road Tech Park (Sector 48)', lat: 28.4120, lng: 77.0400 },
  { id: 'N12', name: 'Dwarka Expressway Link (Sector 102)', lat: 28.4810, lng: 76.9950 },
  { id: 'N13', name: 'MG Road Metro Station', lat: 28.4800, lng: 77.0800 },
  { id: 'N14', name: 'Southern Peripheral Road (SPR Interchange)', lat: 28.4050, lng: 77.0750 }
];

// Gurgaon Road Network Topology
export const INITIAL_SEGMENTS = [
  { id: 'S1', name: 'Delhi-Gurgaon Expressway (Sirhaul to Cyber City)', from: 'N1', to: 'N2', distanceKm: 2.2, lanes: 5, speedLimit: 80, controlType: 0 },
  { id: 'S2', name: 'NH-48 Cyber City to IFFCO Chowk', from: 'N2', to: 'N3', distanceKm: 3.1, lanes: 4, speedLimit: 80, controlType: 0 },
  { id: 'S3', name: 'NH-48 Main Line (IFFCO Chowk to Rajiv Chowk)', from: 'N3', to: 'N4', distanceKm: 4.5, lanes: 4, speedLimit: 80, controlType: 0 },
  { id: 'S4', name: 'NH-48 Expressway (Rajiv Chowk to Hero Honda Chowk)', from: 'N4', to: 'N5', distanceKm: 3.4, lanes: 4, speedLimit: 85, controlType: 0 },
  { id: 'S5', name: 'NH-48 Southern Arterial (Hero Honda to Kherki Daula Toll)', from: 'N5', to: 'N6', distanceKm: 6.2, lanes: 4, speedLimit: 90, controlType: 3 }, // Toll control
  { id: 'S6', name: 'Cyber City Rapid Metro Corridor', from: 'N2', to: 'N13', distanceKm: 1.8, lanes: 3, speedLimit: 50, controlType: 2 },
  { id: 'S7', name: 'Golf Course Road 16-Lane Expressway', from: 'N13', to: 'N8', distanceKm: 2.5, lanes: 4, speedLimit: 70, controlType: 0 }, // Signal free underpasses
  { id: 'S8', name: 'Golf Course Extension Corridor', from: 'N8', to: 'N9', distanceKm: 4.8, lanes: 3, speedLimit: 65, controlType: 1 },
  { id: 'S9', name: 'Sohna Road Spine (Rajiv Chowk to Subhash Chowk)', from: 'N4', to: 'N10', distanceKm: 3.0, lanes: 3, speedLimit: 50, controlType: 2 },
  { id: 'S10', name: 'Sohna Road Commercial Belt (Subhash Chowk to Sec 48)', from: 'N10', to: 'N11', distanceKm: 2.6, lanes: 3, speedLimit: 55, controlType: 2 },
  { id: 'S11', name: 'HUDA Metro Connector (IFFCO to Millennium City Centre)', from: 'N3', to: 'N7', distanceKm: 1.6, lanes: 2, speedLimit: 45, controlType: 2 },
  { id: 'S12', name: 'Millennium Metro to Subhash Chowk Arterial', from: 'N7', to: 'N10', distanceKm: 4.2, lanes: 2, speedLimit: 50, controlType: 2 },
  { id: 'S13', name: 'Southern Peripheral Road (SPR East-West Bypass)', from: 'N9', to: 'N14', distanceKm: 4.0, lanes: 3, speedLimit: 75, controlType: 1 },
  { id: 'S14', name: 'SPR Extension to Kherki Daula Toll', from: 'N14', to: 'N6', distanceKm: 5.5, lanes: 3, speedLimit: 80, controlType: 0 },
  { id: 'S15', name: 'Dwarka Expressway Northern Link', from: 'N1', to: 'N12', distanceKm: 7.8, lanes: 4, speedLimit: 90, controlType: 0 },
  { id: 'S16', name: 'Dwarka Expressway to Hero Honda Link', from: 'N12', to: 'N5', distanceKm: 5.1, lanes: 3, speedLimit: 75, controlType: 1 }
];

/**
 * Generate simulated metrics for the 10 traffic factors on each segment
 */
export function generateSegmentTelemetry(segment, envConfig = {}) {
  const {
    timeOfDay = 17, // 5 PM peak hour default
    dayOfWeek = 2,  // Tuesday
    seasonality = 1, // Spring
    precipitation = 0, // 0: Clear, 1: Rain, 2: Heavy Rain, 3: Snow
    rushHourMultiplier = 1.0,
    vehicleMixHeavy = 15 // % heavy trucks/buses
  } = envConfig;

  // Peak hour factors (7-9 AM and 4-7 PM)
  const isMorningPeak = timeOfDay >= 7 && timeOfDay <= 9;
  const isEveningPeak = timeOfDay >= 16 && timeOfDay <= 19;
  const peakFactor = (isMorningPeak || isEveningPeak) ? 1.6 * rushHourMultiplier : 0.7;

  // Weekend vs Weekday factor
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const dayFactor = isWeekend ? 0.65 : 1.1;

  // Weather penalty on speed & density
  const weatherSpeedPenalty = precipitation === 0 ? 1.0 : precipitation === 1 ? 0.85 : precipitation === 2 ? 0.65 : 0.45;
  const weatherDensityMultiplier = 1 + precipitation * 0.15;

  // Base road capacity (veh/hr)
  const capacity = segment.lanes * 1100;

  // Bottleneck tendency based on control devices (0: highway, 1: roundabout, 2: signal, 3: toll/stop)
  const controlPenalty = segment.controlType * 0.12;

  // Seeded variation per segment
  const baseVolumeDemand = (capacity * 0.5) * peakFactor * dayFactor + (segment.id.charCodeAt(1) * 35);
  const volume = Math.min(Math.round(baseVolumeDemand * (0.85 + Math.random() * 0.3)), Math.round(capacity * 1.3));

  // Volume-to-Capacity ratio (V/C)
  const vcRatio = volume / capacity;

  // Speed calculation using Greenshields fundamental traffic relationship
  const baseFreeSpeed = segment.speedLimit;
  const speedDecrease = Math.pow(vcRatio, 1.8) * (baseFreeSpeed * 0.6) + (controlPenalty * 15);
  const speed = Math.max(8, Math.round((baseFreeSpeed - speedDecrease) * weatherSpeedPenalty + (Math.random() * 4 - 2)));

  // Density = Volume / Speed (veh/km)
  const rawDensity = (volume / Math.max(speed, 5));
  const density = Math.round(rawDensity * weatherDensityMultiplier);

  return {
    id: segment.id,
    name: segment.name,
    from: segment.from,
    to: segment.to,
    distanceKm: segment.distanceKm,
    lanes: segment.lanes,
    speedLimit: segment.speedLimit,
    
    // The 10 Core Traffic Flow Factors:
    volume,             // 1. Volume (Flow Rate in veh/hr)
    speed,              // 2. Speed (Average actual speed km/h)
    density,            // 3. Density (Vehicles per km)
    timeOfDay,          // 4. Time of Day (0-23 hours)
    dayOfWeek,          // 5. Day of the Week (0-6)
    seasonality,        // 6. Seasonality (0-3)
    precipitation,      // 7. Precipitation (0: Clear, 1: Rain, 2: Heavy Rain, 3: Snow)
    capacity,           // 8. Road Capacity (veh/hr limit)
    controlDevices: segment.controlType, // 9. Control Devices (0: Highway, 1: Roundabout, 2: Signal, 3: Toll)
    vehicleMix: vehicleMixHeavy,          // 10. Vehicle Mix (% heavy vehicles)

    // Derived operational stats
    vcRatio: parseFloat(vcRatio.toFixed(2)),
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
