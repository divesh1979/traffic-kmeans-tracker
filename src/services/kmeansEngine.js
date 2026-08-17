/**
 * K-Means Clustering Machine Learning Engine
 * Processes multi-dimensional traffic factor vectors to classify live & historical road conditions.
 */

export const TRAFFIC_FACTORS = [
  { key: 'volume', label: 'Volume (Flow Rate)', unit: 'veh/hr', weight: 1.2 },
  { key: 'speed', label: 'Speed', unit: 'km/h', weight: 1.5, invert: true }, // lower speed = higher congestion contribution
  { key: 'density', label: 'Density', unit: 'veh/km', weight: 1.4 },
  { key: 'timeOfDay', label: 'Time of Day', unit: 'hr', weight: 0.8 },
  { key: 'dayOfWeek', label: 'Day of Week', unit: 'day', weight: 0.6 },
  { key: 'seasonality', label: 'Seasonality', unit: 'season', weight: 0.5 },
  { key: 'precipitation', label: 'Precipitation', unit: 'level', weight: 1.1 },
  { key: 'capacity', label: 'Road Capacity', unit: 'veh/hr', weight: 0.7, invert: true },
  { key: 'controlDevices', label: 'Control Devices', unit: 'type', weight: 0.9 },
  { key: 'vehicleMix', label: 'Vehicle Mix (Heavy %)', unit: '%', weight: 1.0 }
];

export const DEFAULT_CLUSTER_THEMES = [
  {
    name: 'Free Flow (Smooth Traffic)',
    color: '#059669', // Emerald green
    badge: 'smooth',
    description: 'Optimal speeds, low density, smooth transit flow.'
  },
  {
    name: 'Moderate Traffic Flow',
    color: '#d97706', // High-contrast amber
    badge: 'moderate',
    description: 'Increased volume, slight speed reduction, manageable queues.'
  },
  {
    name: 'Heavy Bottleneck',
    color: '#ea580c', // High-contrast orange
    badge: 'heavy',
    description: 'High volume to capacity ratio, significant delays, dense queuing.'
  },
  {
    name: 'Critical Congestion / Gridlock',
    color: '#dc2626', // Deep red
    badge: 'severe',
    description: 'Extremely high density, crawling speeds, potential stoppage.'
  },
  {
    name: 'Irregular Anomaly Event',
    color: '#9333ea', // Royal purple
    badge: 'anomaly',
    description: 'Severe weather, accident, or control device disruption causing bottleneck.'
  }
];

/**
 * Standardize feature values using Z-score (mean = 0, std = 1)
 */
function calculateScalerStats(data) {
  const stats = {};
  
  TRAFFIC_FACTORS.forEach(factor => {
    const values = data.map(item => Number(item[factor.key] || 0));
    const mean = values.reduce((sum, v) => sum + v, 0) / (values.length || 1);
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / (values.length || 1);
    const std = Math.sqrt(variance) || 1; // avoid divide by zero

    stats[factor.key] = { mean, std };
  });

  return stats;
}

/**
 * Normalizes a sample record into a 10D feature vector
 */
function extractFeatureVector(item, stats) {
  return TRAFFIC_FACTORS.map(factor => {
    const rawVal = Number(item[factor.key] || 0);
    const { mean, std } = stats[factor.key];
    let norm = (rawVal - mean) / std;

    // Apply feature importance weight multiplier
    norm = norm * factor.weight;
    
    // If feature is inverted (e.g. speed: high speed means low congestion score)
    if (factor.invert) {
      norm = -norm;
    }

    return norm;
  });
}

/**
 * Euclidean distance in multi-dimensional space
 */
function euclideanDistance(vecA, vecB) {
  return Math.sqrt(
    vecA.reduce((sum, val, idx) => sum + Math.pow(val - vecB[idx], 2), 0)
  );
}

/**
 * Main K-Means Algorithm implementation
 * @param {Array} data - Array of segment telemetry objects
 * @param {number} k - Number of clusters (default 4)
 * @param {number} maxIterations - Convergence iteration limit
 */
export function runKMeansClustering(data, k = 4, maxIterations = 30) {
  if (!data || data.length === 0) return { data: [], centroids: [], inertia: 0, clustersInfo: [] };

  // Step 1: Compute statistics for feature standardization
  const scalerStats = calculateScalerStats(data);

  // Step 2: Convert all data points to normalized feature vectors
  const featureVectors = data.map(item => extractFeatureVector(item, scalerStats));

  // Step 3: Initialize K centroids using K-Means++ logic
  const centroids = [];
  const firstIndex = Math.floor(Math.random() * featureVectors.length);
  centroids.push([...featureVectors[firstIndex]]);

  while (centroids.length < k) {
    const distances = featureVectors.map(vec => {
      const minDist = Math.min(...centroids.map(c => euclideanDistance(vec, c)));
      return minDist * minDist;
    });

    const totalDist = distances.reduce((sum, d) => sum + d, 0);
    let randomVal = Math.random() * totalDist;
    let chosenIdx = 0;

    for (let i = 0; i < distances.length; i++) {
      randomVal -= distances[i];
      if (randomVal <= 0) {
        chosenIdx = i;
        break;
      }
    }

    centroids.push([...featureVectors[chosenIdx]]);
  }

  // Step 4: Iterative optimization (Assign & Update)
  let assignments = new Array(featureVectors.length).fill(0);
  let iteration = 0;
  let converged = false;

  while (iteration < maxIterations && !converged) {
    iteration++;
    let changed = false;

    // Assignment Step
    for (let i = 0; i < featureVectors.length; i++) {
      const vec = featureVectors[i];
      let nearestCluster = 0;
      let minDistance = Infinity;

      for (let c = 0; c < k; c++) {
        const dist = euclideanDistance(vec, centroids[c]);
        if (dist < minDistance) {
          minDistance = dist;
          nearestCluster = c;
        }
      }

      if (assignments[i] !== nearestCluster) {
        assignments[i] = nearestCluster;
        changed = true;
      }
    }

    if (!changed) {
      converged = true;
      break;
    }

    // Update Step
    for (let c = 0; c < k; c++) {
      const clusterPoints = featureVectors.filter((_, idx) => assignments[idx] === c);
      if (clusterPoints.length > 0) {
        const dim = featureVectors[0].length;
        const newCentroid = new Array(dim).fill(0);

        for (let d = 0; d < dim; d++) {
          const sum = clusterPoints.reduce((acc, pt) => acc + pt[d], 0);
          newCentroid[d] = sum / clusterPoints.length;
        }

        centroids[c] = newCentroid;
      }
    }
  }

  // Step 5: Compute cluster total inertia (Within-Cluster Sum of Squares)
  let totalInertia = 0;
  featureVectors.forEach((vec, idx) => {
    const clusterId = assignments[idx];
    const dist = euclideanDistance(vec, centroids[clusterId]);
    totalInertia += dist * dist;
  });

  // Step 6: Rank clusters by average overall congestion severity score
  const clusterSeverities = centroids.map((c, cIdx) => {
    // Average normalized vector score
    const avgScore = c.reduce((sum, val) => sum + val, 0) / c.length;
    return { cIdx, avgScore };
  });

  // Sort clusters from least congested to most congested
  clusterSeverities.sort((a, b) => a.avgScore - b.avgScore);

  const clusterIdMap = {};
  clusterSeverities.forEach((item, sortedRank) => {
    clusterIdMap[item.cIdx] = sortedRank;
  });

  // Attach cluster labels & theme colors to original segment data
  const clusteredData = data.map((item, idx) => {
    const originalClusterId = assignments[idx];
    const rank = clusterIdMap[originalClusterId];
    const theme = DEFAULT_CLUSTER_THEMES[Math.min(rank, DEFAULT_CLUSTER_THEMES.length - 1)];

    return {
      ...item,
      clusterId: rank,
      clusterName: theme.name,
      clusterColor: item.isAnomaly ? DEFAULT_CLUSTER_THEMES[4].color : theme.color,
      clusterBadge: item.isAnomaly ? 'anomaly' : theme.badge,
      congestionScore: parseFloat((Math.min(100, Math.max(0, (rank + 1) * 22 + Math.random() * 10))).toFixed(1))
    };
  });

  // Build cluster profile summaries & factor centroids for charts
  const clustersInfo = clusterSeverities.map((item, sortedRank) => {
    const originalClusterId = item.cIdx;
    const theme = DEFAULT_CLUSTER_THEMES[Math.min(sortedRank, DEFAULT_CLUSTER_THEMES.length - 1)];
    const members = clusteredData.filter(d => d.clusterId === sortedRank);

    // Calculate un-normalized real-world averages per factor for this cluster
    const factorAverages = {};
    TRAFFIC_FACTORS.forEach(factor => {
      const avgVal = members.reduce((sum, m) => sum + Number(m[factor.key] || 0), 0) / (members.length || 1);
      factorAverages[factor.key] = parseFloat(avgVal.toFixed(1));
    });

    return {
      clusterId: sortedRank,
      name: theme.name,
      color: theme.color,
      description: theme.description,
      memberCount: members.length,
      percentage: parseFloat(((members.length / (data.length || 1)) * 100).toFixed(1)),
      factorAverages,
      normalizedCentroid: centroids[originalClusterId]
    };
  });

  return {
    clusteredData,
    clustersInfo,
    inertia: parseFloat(totalInertia.toFixed(2)),
    scalerStats
  };
}

/**
 * Calculates Elbow Method curve data (Inertia vs K)
 */
export function calculateElbowCurve(data, maxK = 6) {
  const curve = [];
  for (let k = 1; k <= maxK; k++) {
    const result = runKMeansClustering(data, k, 15);
    curve.push({ k, inertia: result.inertia });
  }
  return curve;
}
