import { Delaunay } from "d3-delaunay";
import { polygonCentroid } from "d3-polygon";

type Point = [number, number];
// Below adapted from: https://observablehq.com/@dmitrybaranovskiy/random-grid

// Hat tip to https://georgefrancis.dev/writing/crafting-organic-patterns-with-voronoi-tessellations/
const getRandomGrid = (
  width = 1000,
  height = 1000,
  amount = 200,
  relax = 4
) => {
  const start: Point[] = new Array(amount)
    .fill(0)
    .map(() => [Math.random() * width, Math.random() * height]);

  const delaunay = Delaunay.from(start);
  const voronoi = delaunay.voronoi([0, 0, width, height]);
  const points = [];

  for (let k = 0; k < relax; k++) {
    for (let i = 0; i < delaunay.points.length; i += 2) {
      const cell = voronoi.cellPolygon(i >> 1);

      if (cell === null) continue;
      const [x1, y1] = polygonCentroid(cell);

      (delaunay.points as number[])[i] = x1;
      (delaunay.points as number[])[i + 1] = y1;
    }

    voronoi.update();
  }
  for (let i = 0; i < delaunay.points.length; i += 2) {
    points.push([delaunay.points[i], delaunay.points[i + 1]]);
  }
  return points;
};

export default getRandomGrid;
