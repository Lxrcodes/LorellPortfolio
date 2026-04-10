// Marathon route points in normalised coordinates (0.0-1.0)
// x: 0.0-1.0 maps to canvas width
// y: 0.0-1.0 maps to a single viewport height
// The route winds like a real city marathon course

export interface RoutePoint {
  x: number;
  y: number;
  km?: number; // Kilometer marker
}

export const routePoints: RoutePoint[] = [
  // Start - top right, flowing down the right edge
  { x: 0.92, y: 0.02, km: 0 },
  { x: 0.90, y: 0.08 },
  { x: 0.88, y: 0.15, km: 5 },
  { x: 0.87, y: 0.22 },
  { x: 0.88, y: 0.28 },

  // Gentle curve towards center-right
  { x: 0.90, y: 0.35, km: 10 },
  { x: 0.88, y: 0.42 },
  { x: 0.85, y: 0.48 },

  // Sweep to far right
  { x: 0.92, y: 0.52, km: 15 },
  { x: 0.94, y: 0.58 },
  { x: 0.92, y: 0.64, km: 21 },

  // Down the right side
  { x: 0.88, y: 0.70 },
  { x: 0.90, y: 0.76, km: 30 },
  { x: 0.92, y: 0.82, km: 35 },

  // Final stretch
  { x: 0.90, y: 0.88 },
  { x: 0.88, y: 0.94, km: 42 },

  // Finish line
  { x: 0.90, y: 0.99 },
];

// Helper to get total route length for progress calculations
export function getRouteLength(points: RoutePoint[]): number {
  let length = 0;
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    length += Math.sqrt(dx * dx + dy * dy);
  }
  return length;
}

// Helper to get point at a specific progress (0-1)
export function getPointAtProgress(
  points: RoutePoint[],
  progress: number
): { x: number; y: number } {
  const totalLength = getRouteLength(points);
  const targetLength = progress * totalLength;

  let accumulatedLength = 0;
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    const segmentLength = Math.sqrt(dx * dx + dy * dy);

    if (accumulatedLength + segmentLength >= targetLength) {
      const segmentProgress =
        (targetLength - accumulatedLength) / segmentLength;
      return {
        x: points[i - 1].x + dx * segmentProgress,
        y: points[i - 1].y + dy * segmentProgress,
      };
    }

    accumulatedLength += segmentLength;
  }

  return points[points.length - 1];
}
