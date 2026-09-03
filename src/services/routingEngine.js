/**
 * Real Street Navigation & Intelligent Route Optimization Engine
 * Integrates OpenStreetMap OSRM Real Street Routing Service with K-Means ML Congestion Penalties.
 */

import { CITY_NODES } from './trafficDataGenerator';

/**
 * Builds adjacency graph from segments list
 */
function buildGraph(segments) {
  const graph = {};

  CITY_NODES.forEach(node => {
    graph[node.id] = [];
  });

  segments.forEach(seg => {
    graph[seg.from]?.push({ segment: seg, target: seg.to });
    graph[seg.to]?.push({ segment: seg, target: seg.from });
  });

  return graph;
}

class PriorityQueue {
  constructor() {
    this.elements = [];
  }
  enqueue(element, priority) {
    this.elements.push({ element, priority });
    this.elements.sort((a, b) => a.priority - b.priority);
  }
  dequeue() {
    return this.elements.shift().element;
  }
  isEmpty() {
    return this.elements.length === 0;
  }
}

function calculateCost(segment, mode) {
  const { distanceKm, speed, clusterId = 0, isAnomaly, controlDevices, precipitation } = segment;

  if (mode === 'distance') {
    return distanceKm;
  }

  if (mode === 'kmeans_smart') {
    const baseMinutes = (distanceKm / Math.max(speed, 5)) * 60;
    const clusterMultiplier = 1.0 + (clusterId * 0.35);
    const anomalyMultiplier = isAnomaly ? 3.5 : 1.0;
    const controlDelayMinutes = controlDevices * 0.4;
    const weatherDelayMultiplier = 1 + (precipitation * 0.1);

    return (baseMinutes * clusterMultiplier * anomalyMultiplier * weatherDelayMultiplier) + controlDelayMinutes;
  }

  if (mode === 'historical') {
    const historicSpeed = segment.speedLimit * 0.75;
    return (distanceKm / historicSpeed) * 60;
  }

  return distanceKm;
}

/**
 * Executes A* Graph Search for segment topology
 */
function findAStarPath(startNodeId, targetNodeId, graph, mode) {
  const frontier = new PriorityQueue();
  frontier.enqueue(startNodeId, 0);

  const cameFrom = { [startNodeId]: null };
  const costSoFar = { [startNodeId]: 0 };
  const segmentUsed = {};

  while (!frontier.isEmpty()) {
    const current = frontier.dequeue();

    if (current === targetNodeId) break;

    const neighbors = graph[current] || [];
    for (const neighbor of neighbors) {
      const { segment, target } = neighbor;
      const stepCost = calculateCost(segment, mode);
      const newCost = costSoFar[current] + stepCost;

      if (costSoFar[target] === undefined || newCost < costSoFar[target]) {
        costSoFar[target] = newCost;
        frontier.enqueue(target, newCost);
        cameFrom[target] = current;
        segmentUsed[target] = segment;
      }
    }
  }

  if (!cameFrom.hasOwnProperty(targetNodeId) && startNodeId !== targetNodeId) {
    return null;
  }

  const pathNodes = [];
  const pathSegments = [];
  let curr = targetNodeId;

  while (curr) {
    pathNodes.unshift(curr);
    if (segmentUsed[curr]) {
      pathSegments.unshift(segmentUsed[curr]);
    }
    curr = cameFrom[curr];
  }

  const totalDistanceKm = pathSegments.reduce((sum, s) => sum + s.distanceKm, 0);
  const totalTravelMinutes = pathSegments.reduce((sum, s) => {
    const actualSpeed = Math.max(s.speed, 5);
    return sum + ((s.distanceKm / actualSpeed) * 60);
  }, 0);

  const avgSpeed = totalDistanceKm > 0 ? (totalDistanceKm / (totalTravelMinutes / 60)) : 0;

  return {
    mode,
    pathNodes,
    pathSegments,
    totalDistanceKm: parseFloat(totalDistanceKm.toFixed(2)),
    totalTravelMinutes: Math.round(totalTravelMinutes),
    avgSpeed: Math.round(avgSpeed)
  };
}

/**
 * Fetches 100% Real Street Driving Geometry from OpenStreetMap OSRM Navigation API
 */
export async function fetchOSRMRealStreetPolyline(startNode, targetNode) {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${startNode.lng},${startNode.lat};${targetNode.lng},${targetNode.lat}?overview=full&geometries=geojson`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      // Convert OSRM GeoJSON [lng, lat] to Leaflet [lat, lng]
      const realStreetCoords = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
      return {
        realStreetCoords,
        distanceKm: parseFloat((route.distance / 1000).toFixed(2)),
        durationMins: Math.round(route.duration / 60)
      };
    }
  } catch (error) {
    console.warn('OSRM Real Street Routing fetch failed, fallback to detailed waypoints:', error);
  }
  return null;
}

/**
 * Calculate and compare all 3 route options with OSRM Real Street Geometry
 */
export function calculateAllRoutes(startNodeId, targetNodeId, segments) {
  if (!startNodeId || !targetNodeId || startNodeId === targetNodeId) return null;

  const startNode = CITY_NODES.find(n => n.id === startNodeId);
  const targetNode = CITY_NODES.find(n => n.id === targetNodeId);

  const graph = buildGraph(segments);

  const distanceRoute = findAStarPath(startNodeId, targetNodeId, graph, 'distance');
  const smartRoute = findAStarPath(startNodeId, targetNodeId, graph, 'kmeans_smart');
  const historicalRoute = findAStarPath(startNodeId, targetNodeId, graph, 'historical');

  const timeSavedMinutes = Math.max(0, (distanceRoute?.totalTravelMinutes || 0) - (smartRoute?.totalTravelMinutes || 0));

  return {
    startNode,
    targetNode,
    distanceRoute,
    smartRoute,
    historicalRoute,
    timeSavedMinutes
  };
}
