import { Delaunay } from "d3-delaunay";
import { polygonCentroid } from "d3-polygon";

// Below adapted from: https://observablehq.com/@dmitrybaranovskiy/random-grid

const almostRandom =
  (seed = 42) =>
  () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

// Hat tip to https://georgefrancis.dev/writing/crafting-organic-patterns-with-voronoi-tessellations/
const getRandomGrid = (
  width = 1000,
  height = 1000,
  amount = 200,
  rndseed = 1984,
  relax = 4
) => {
  const rnd = almostRandom(rndseed);
  const start = new Array(amount)
    .fill(0)
    .map(() => [rnd() * width, rnd() * height]);
  const delaunay = Delaunay.from(start);
  const voronoi = delaunay.voronoi([0, 0, width, height]);
  const points = [];

  for (let k = 0; k < relax; k++) {
    for (let i = 0; i < delaunay.points.length; i += 2) {
      const cell = voronoi.cellPolygon(i >> 1);

      if (cell === null) continue;
      const [x1, y1] = polygonCentroid(cell);

      delaunay.points[i] = x1;
      delaunay.points[i + 1] = y1;
    }

    voronoi.update();
  }
  for (let i = 0; i < delaunay.points.length; i += 2) {
    points.push([delaunay.points[i], delaunay.points[i + 1]]);
  }
  return points;
};

export default getRandomGrid;
