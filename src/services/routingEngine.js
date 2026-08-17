/**
 * Intelligent Route Planning & Optimization Engine
 * Calculates shortest path, K-Means live congestion-optimized path, and historical pattern path.
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
    // Add forward & reverse directions for two-way road segments
    graph[seg.from]?.push({ segment: seg, target: seg.to });
    graph[seg.to]?.push({ segment: seg, target: seg.from });
  });

  return graph;
}

/**
 * Priority Queue helper for A* algorithm
 */
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

/**
 * Heuristic estimation: Straight line geographical distance (Haversine approx)
 */
function heuristicDistance(nodeIdA, nodeIdB) {
  const nA = CITY_NODES.find(n => n.id === nodeIdA);
  const nB = CITY_NODES.find(n => n.id === nodeIdB);
  if (!nA || !nB) return 0;

  const dx = nA.lat - nB.lat;
  const dy = nA.lng - nB.lng;
  return Math.sqrt(dx * dx + dy * dy) * 111; // Approx km
}

/**
 * Computes weight for a segment based on selected routing mode
 */
function calculateCost(segment, mode) {
  const { distanceKm, speed, clusterId = 0, isAnomaly, controlDevices, precipitation } = segment;

  if (mode === 'distance') {
    // Pure physical distance in km
    return distanceKm;
  }

  if (mode === 'kmeans_smart') {
    // Time-based cost (minutes) + cluster penalty multiplier + anomaly penalty
    const baseMinutes = (distanceKm / Math.max(speed, 5)) * 60;
    
    // Cluster penalty multiplier (Cluster 0: 1.0x, Cluster 1: 1.25x, Cluster 2: 1.6x, Cluster 3: 2.2x)
    const clusterMultiplier = 1.0 + (clusterId * 0.35);
    
    // Anomaly / incident heavy penalty multiplier
    const anomalyMultiplier = isAnomaly ? 3.5 : 1.0;

    // Control device & weather modifier
    const controlDelayMinutes = controlDevices * 0.4;
    const weatherDelayMultiplier = 1 + (precipitation * 0.1);

    return (baseMinutes * clusterMultiplier * anomalyMultiplier * weatherDelayMultiplier) + controlDelayMinutes;
  }

  if (mode === 'historical') {
    // Historical time cost based on average historic speed limits
    const historicSpeed = segment.speedLimit * 0.75;
    return (distanceKm / historicSpeed) * 60;
  }

  return distanceKm;
}

/**
 * Executes A* Algorithm to find optimal path
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
        const priority = newCost + heuristicDistance(target, targetNodeId);
        frontier.enqueue(target, priority);
        cameFrom[target] = current;
        segmentUsed[target] = segment;
      }
    }
  }

  // Reconstruct path
  if (!cameFrom.hasOwnProperty(targetNodeId) && startNodeId !== targetNodeId) {
    return null; // Path not found
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

  // Aggregate metrics
  const totalDistanceKm = pathSegments.reduce((sum, s) => sum + s.distanceKm, 0);
  const totalTravelMinutes = pathSegments.reduce((sum, s) => {
    const actualSpeed = Math.max(s.speed, 5);
    return sum + ((s.distanceKm / actualSpeed) * 60);
  }, 0);

  const avgSpeed = totalDistanceKm > 0 ? (totalDistanceKm / (totalTravelMinutes / 60)) : 0;
  const maxCluster = pathSegments.length > 0 ? Math.max(...pathSegments.map(s => s.clusterId || 0)) : 0;
  const hasAnomaly = pathSegments.some(s => s.isAnomaly);

  return {
    mode,
    pathNodes,
    pathSegments,
    totalDistanceKm: parseFloat(totalDistanceKm.toFixed(2)),
    totalTravelMinutes: Math.round(totalTravelMinutes),
    avgSpeed: Math.round(avgSpeed),
    maxCluster,
    hasAnomaly
  };
}

/**
 * Calculate and compare all 3 route options
 */
export function calculateAllRoutes(startNodeId, targetNodeId, segments) {
  if (!startNodeId || !targetNodeId || startNodeId === targetNodeId) return null;

  const graph = buildGraph(segments);

  const distanceRoute = findAStarPath(startNodeId, targetNodeId, graph, 'distance');
  const smartRoute = findAStarPath(startNodeId, targetNodeId, graph, 'kmeans_smart');
  const historicalRoute = findAStarPath(startNodeId, targetNodeId, graph, 'historical');

  // Calculate time savings between standard & smart route
  const timeSavedMinutes = Math.max(0, (distanceRoute?.totalTravelMinutes || 0) - (smartRoute?.totalTravelMinutes || 0));

  return {
    startNode: CITY_NODES.find(n => n.id === startNodeId),
    targetNode: CITY_NODES.find(n => n.id === targetNodeId),
    distanceRoute,
    smartRoute,
    historicalRoute,
    timeSavedMinutes
  };
}
