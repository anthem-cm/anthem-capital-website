const rootElement = document.getElementById("research-dashboard-root");
const state = {
  metric: "sentiment",
  lag: 2,
  view: "scatter",
  episodeIndex: 0,
};

const gasData = {
  1993: [1.062, 1.054, 1.052, 1.078, 1.1, 1.097, 1.078, 1.062, 1.05, 1.092, 1.066, 1.014],
  1994: [0.998, 1.009, 1.008, 1.027, 1.047, 1.078, 1.106, 1.155, 1.144, 1.114, 1.116, 1.091],
  1995: [1.082, 1.073, 1.072, 1.111, 1.178, 1.192, 1.154, 1.123, 1.111, 1.087, 1.062, 1.071],
  1996: [1.09, 1.089, 1.137, 1.231, 1.279, 1.256, 1.227, 1.207, 1.202, 1.204, 1.232, 1.235],
  1997: [1.236, 1.23, 1.205, 1.199, 1.2, 1.198, 1.174, 1.224, 1.231, 1.197, 1.171, 1.131],
  1998: [1.086, 1.049, 1.017, 1.03, 1.064, 1.064, 1.055, 1.026, 1.009, 1.019, 0.995, 0.945],
  1999: [0.939, 0.921, 0.982, 1.131, 1.131, 1.114, 1.158, 1.221, 1.256, 1.244, 1.251, 1.273],
  2000: [1.289, 1.377, 1.516, 1.465, 1.487, 1.633, 1.551, 1.465, 1.55, 1.532, 1.517, 1.443],
  2001: [1.447, 1.45, 1.409, 1.552, 1.702, 1.616, 1.421, 1.421, 1.522, 1.315, 1.171, 1.086],
  2002: [1.107, 1.114, 1.249, 1.397, 1.392, 1.382, 1.397, 1.396, 1.4, 1.445, 1.419, 1.386],
  2003: [1.458, 1.613, 1.693, 1.589, 1.497, 1.493, 1.513, 1.62, 1.679, 1.564, 1.512, 1.479],
  2004: [1.572, 1.648, 1.736, 1.798, 1.983, 1.969, 1.911, 1.878, 1.87, 2, 1.979, 1.841],
  2005: [1.831, 1.91, 2.079, 2.243, 2.161, 2.153, 2.316, 2.505, 2.903, 2.724, 2.344, 2.186],
  2006: [2.315, 2.31, 2.4, 2.744, 2.897, 2.885, 2.981, 2.935, 2.557, 2.27, 2.234, 2.334],
  2007: [2.24, 2.275, 2.562, 2.86, 3.127, 3.052, 2.961, 2.782, 2.803, 2.795, 3.069, 3.02],
  2008: [3.043, 3.033, 3.258, 3.441, 3.764, 4.068, 4.062, 3.786, 3.698, 3.081, 2.151, 1.69],
  2009: [1.787, 1.928, 1.949, 2.057, 2.265, 2.631, 2.543, 2.627, 2.574, 2.561, 2.66, 2.621],
  2010: [2.731, 2.659, 2.778, 2.858, 2.837, 2.735, 2.734, 2.745, 2.73, 2.818, 2.861, 2.993],
  2011: [3.095, 3.168, 3.556, 3.815, 3.902, 3.68, 3.65, 3.633, 3.538, 3.447, 3.384, 3.246],
  2012: [3.38, 3.565, 3.837, 3.89, 3.732, 3.54, 3.443, 3.72, 3.855, 3.695, 3.449, 3.308],
  2013: [3.319, 3.582, 3.693, 3.554, 3.587, 3.603, 3.573, 3.559, 3.534, 3.344, 3.256, 3.259],
  2014: [3.313, 3.352, 3.533, 3.663, 3.673, 3.686, 3.605, 3.497, 3.387, 3.172, 2.885, 2.545],
  2015: [2.117, 2.215, 2.43, 2.456, 2.71, 2.805, 2.798, 2.637, 2.369, 2.275, 2.15, 2.034],
  2016: [1.949, 1.764, 1.979, 2.116, 2.296, 2.366, 2.243, 2.178, 2.209, 2.268, 2.179, 2.254],
  2017: [2.321, 2.304, 2.323, 2.417, 2.377, 2.348, 2.326, 2.383, 2.647, 2.508, 2.558, 2.477],
  2018: [2.556, 2.537, 2.577, 2.74, 2.896, 2.868, 2.839, 2.82, 2.842, 2.858, 2.648, 2.358],
  2019: [2.248, 2.332, 2.519, 2.812, 2.858, 2.718, 2.738, 2.634, 2.634, 2.636, 2.601, 2.561],
  2020: [2.548, 2.437, 2.174, 1.84, 1.868, 2.067, 2.182, 2.178, 2.183, 2.163, 2.106, 2.168],
  2021: [2.326, 2.504, 2.808, 2.874, 3.038, 3.068, 3.134, 3.152, 3.182, 3.291, 3.39, 3.28],
  2022: [3.317, 3.52, 4.222, 4.109, 4.444, 4.93, 4.54, 3.898, 3.677, 3.76, 3.769, 3.214],
  2023: [3.37, 3.393, 3.451, 3.604, 3.571, 3.57, 3.59, 3.824, 3.837, 3.443, 3.261, 3.074],
  2024: [3.07, 3.198, 3.388, 3.634, 3.572, 3.449, 3.492, 3.413, 3.202, 3.13, 3.04, 2.94],
  2025: [3.05, 3.1, 3.25],
};

const sentimentData = {
  1993: [89.3, 88.2, 84.2, 85, 85.5, 86, 85.6, 83.3, 85.6, 85.6, 89.6, 93.4],
  1994: [95.4, 97, 95.8, 91.2, 88.1, 91.2, 91.6, 91.1, 95.2, 91.4, 92.7, 97.6],
  1995: [97.6, 97.8, 90.8, 93.4, 90.7, 92.4, 93.7, 95, 89.6, 90.5, 91.5, 92.6],
  1996: [90.7, 90.4, 96.7, 94.7, 92.5, 94.7, 94.7, 95.3, 94.7, 96.5, 99.2, 96.9],
  1997: [97.4, 99.7, 100, 101, 103.2, 104.3, 107.1, 104.4, 104.4, 105.6, 107.2, 102.1],
  1998: [106, 106.6, 107.6, 107.3, 106.8, 105, 105.2, 102.2, 100.9, 100.4, 102.5, 101],
  1999: [104.5, 106.8, 106, 107.6, 106.8, 103.2, 106.5, 105.5, 106.1, 102, 107.2, 105.3],
  2000: [112, 111.3, 107.1, 109.2, 110.7, 106.4, 108.3, 107.3, 106.8, 105.8, 107.6, 108.6],
  2001: [94.7, 90.6, 91.5, 89.4, 92.6, 92.6, 92.4, 91.5, 81.8, 82.7, 83.9, 88.8],
  2002: [93, 90.7, 95.7, 93, 96.9, 92.4, 88.1, 87.6, 86.1, 80.6, 84.2, 86.7],
  2003: [82.4, 79.9, 77.6, 86, 92.1, 87.5, 90.9, 89.3, 87.7, 89.4, 93.7, 92.6],
  2004: [103.8, 94.4, 95.8, 94.2, 90.2, 95.6, 96.7, 95, 94.2, 91.7, 92.8, 97.1],
  2005: [95.5, 94.1, 92.9, 87.7, 86.9, 96, 96.5, 89.1, 76.9, 74.2, 81.6, 91.5],
  2006: [91.2, 86.7, 88.9, 87.4, 79.1, 84.9, 84.7, 82, 85.4, 93.6, 92.1, 91.7],
  2007: [96.9, 91.3, 88.4, 87.1, 88.3, 85.3, 90.4, 83.4, 83.4, 80.9, 76.1, 75.5],
  2008: [78.4, 70.8, 69.5, 62.6, 59.8, 56.4, 61.2, 63, 70.3, 57.6, 55.3, 60.1],
  2009: [61.2, 56.3, 57.3, 65.1, 68.7, 70.8, 66, 65.7, 73.5, 70.6, 67.4, 72.5],
  2010: [74.4, 73.6, 73.6, 72.2, 73.6, 76, 67.8, 68.9, 68.2, 67.7, 71.6, 74.5],
  2011: [74.2, 77.5, 67.5, 69.8, 74.3, 71.5, 63.7, 55.7, 59.4, 60.9, 64.1, 69.9],
  2012: [75, 75.3, 76.2, 76.4, 79.3, 73.2, 72.3, 74.3, 78.3, 82.6, 82.7, 72.9],
  2013: [73.8, 77.6, 78.6, 76.4, 84.5, 82.7, 85.1, 82.1, 77.5, 73.2, 75.1, 82.5],
  2014: [81.2, 81.6, 80, 84.1, 81.9, 82.5, 81.8, 82.5, 84.6, 86.9, 88.8, 93.6],
  2015: [98.1, 95.4, 93, 95.9, 90.7, 96.1, 93.1, 91.9, 87.2, 90, 91.3, 92.6],
  2016: [92, 91.7, 91, 89, 94.7, 93.5, 90, 89.8, 91.2, 87.2, 93.8, 98.2],
  2017: [98.5, 96.3, 96.9, 97, 97.1, 95.1, 93.4, 96.8, 95.1, 100.7, 98.5, 95.9],
  2018: [95.7, 99.7, 101.4, 98.8, 98, 98.2, 97.9, 96.2, 100.1, 98.6, 97.5, 98.3],
  2019: [91.2, 93.8, 98.4, 97.2, 100, 98.2, 98.4, 89.8, 93.2, 95.5, 96.8, 99.3],
  2020: [99.8, 101, 89.1, 71.8, 72.3, 78.1, 72.5, 74.1, 80.4, 81.8, 76.9, 80.7],
  2021: [79, 76.8, 84.9, 88.3, 82.9, 85.5, 81.2, 70.3, 72.8, 71.7, 67.4, 70.6],
  2022: [67.2, 62.8, 59.4, 65.2, 58.4, 50, 51.5, 58.2, 58.6, 59.9, 56.8, 59.7],
  2023: [64.9, 67, 62, 63.5, 59.2, 64.4, 71.6, 69.5, 68.1, 63.8, 61.3, 69.7],
  2024: [79, 76.9, 79.4, 77.2, 69.1, 68.2, 66.4, 67.9, 70.1, 70.5, 71.8, 74],
  2025: [71.1, 64.7, 57],
};

const gasYoYAnnual = {
  2005: 18.6,
  2006: 11.2,
  2007: 10.6,
  2008: 7.8,
  2009: -27.6,
  2010: 12.2,
  2011: 26.3,
  2012: 3.3,
  2013: -2.4,
  2014: -4.7,
  2015: -27.1,
  2016: -6.7,
  2017: 12.3,
  2018: 13,
  2019: -4.7,
  2020: -16.5,
  2021: 39.6,
  2022: 33.9,
  2023: -10.4,
  2024: -4.8,
};

const catSeries = {
  entertainment: {
    label: "Entertainment",
    color: "#60a5fa",
    weight: 0.4,
    data: { 2008: -3.9, 2009: -3.3, 2010: 1.6, 2011: 0.9, 2012: 1, 2013: 1.7, 2014: 5.7, 2015: 5.4, 2016: 2.8, 2017: 3.1, 2018: 5.4, 2019: 4.8, 2020: -13.2, 2021: 22, 2022: -3.1, 2023: 5.1, 2024: 2.8 },
  },
  apparel: {
    label: "Apparel",
    color: "#d4af37",
    weight: 0.25,
    data: { 2008: -4.5, 2009: -9.2, 2010: 0.4, 2011: -3.2, 2012: 2.5, 2013: -3.5, 2014: 5.2, 2015: 4.5, 2016: -7.5, 2017: -3.1, 2018: 2.4, 2019: 0.6, 2020: -23.4, 2021: 17.5, 2022: 0.8, 2023: 6, 2024: 3.2 },
  },
  dining: {
    label: "Dining Out",
    color: "#f97316",
    weight: 0.35,
    data: { 2008: 1.8, 2009: -4.8, 2010: 0.8, 2011: 4.2, 2012: 3.5, 2013: 2.9, 2014: 5.8, 2015: 5.7, 2016: 2.5, 2017: 3.4, 2018: 4.2, 2019: 5.6, 2020: -25.5, 2021: 21.4, 2022: 8.1, 2023: 8.1, 2024: 0.3 },
  },
  groceries: {
    label: "Groceries",
    color: "#93c5fd",
    weight: 0,
    data: { 2008: 6.2, 2009: -2.3, 2010: 0.2, 2011: 5.6, 2012: -0.4, 2013: 0.9, 2014: 2.2, 2015: -0.6, 2016: -0.7, 2017: 1.7, 2018: 1.3, 2019: 2.8, 2020: 8, 2021: 4.2, 2022: 12, 2023: 6.1, 2024: 2.8 },
  },
  healthcare: {
    label: "Healthcare",
    color: "#38bdf8",
    weight: 0,
    data: { 2008: 1.5, 2009: 1.2, 2010: 1.9, 2011: 3.5, 2012: 4, 2013: 3, 2014: 5, 2015: 7.9, 2016: 4.4, 2017: 7.4, 2018: 3.8, 2019: 3.8, 2020: -3.9, 2021: 7, 2022: 5, 2023: 8.4, 2024: 5.2 },
  },
};

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const episodes = [
  {
    label: "2008 Oil Spike",
    cats: [
      { name: "Gasoline Spend", v: 11.2, t: "gas" },
      { name: "Entertainment", v: -3.9, t: "d" },
      { name: "Apparel", v: -4.5, t: "d" },
      { name: "Dining Out", v: 1.8, t: "d" },
      { name: "Groceries", v: 6.2, t: "n" },
      { name: "Healthcare", v: 1.5, t: "n" },
    ],
  },
  {
    label: "2011 Gas Surge",
    cats: [
      { name: "Gasoline Spend", v: 29.1, t: "gas" },
      { name: "Entertainment", v: 0.9, t: "d" },
      { name: "Apparel", v: -3.2, t: "d" },
      { name: "Dining Out", v: 4.2, t: "d" },
      { name: "Groceries", v: 5.6, t: "n" },
      { name: "Healthcare", v: 3.5, t: "n" },
    ],
  },
  {
    label: "2022 Ukraine Shock",
    cats: [
      { name: "Gasoline Spend", v: 45.4, t: "gas" },
      { name: "Entertainment", v: -3.1, t: "d" },
      { name: "Apparel", v: 0.8, t: "d" },
      { name: "Dining Out", v: 8.1, t: "d" },
      { name: "Groceries", v: 12, t: "n" },
      { name: "Healthcare", v: 5, t: "n" },
    ],
  },
  {
    label: "2015 Shale Glut",
    cats: [
      { name: "Gasoline Spend", v: -22.8, t: "gas" },
      { name: "Entertainment", v: 5.4, t: "d" },
      { name: "Apparel", v: 4.5, t: "d" },
      { name: "Dining Out", v: 5.7, t: "d" },
      { name: "Groceries", v: -0.6, t: "n" },
      { name: "Healthcare", v: 7.9, t: "n" },
    ],
  },
  {
    label: "2023 Gas Relief",
    cats: [
      { name: "Gasoline Spend", v: -11.9, t: "gas" },
      { name: "Entertainment", v: 5.1, t: "d" },
      { name: "Apparel", v: 6, t: "d" },
      { name: "Dining Out", v: 8.1, t: "d" },
      { name: "Groceries", v: 6.1, t: "n" },
      { name: "Healthcare", v: 8.4, t: "n" },
    ],
  },
];

const sty = {
  font: "'Inter', sans-serif",
  bg: "#0f172a",
  bg2: "#1e3a8a",
  bg3: "#2563eb",
  gold: "#d4af37",
  gold2: "#e3c76a",
  text: "#e2e8f0",
  sub: "#cbd5e1",
  mute: "#94a3b8",
  dim: "#bfd0f2",
  blue1: "#60a5fa",
  blue2: "#93c5fd",
  blue3: "#bfdbfe",
  red: "#f87171",
  green: "#34d399",
};

function buildWeightedIndex() {
  const idx = {};
  const years = Object.keys(gasYoYAnnual).map(Number);

  years.forEach((year) => {
    let weightedSum = 0;
    let weightTotal = 0;

    Object.values(catSeries).forEach((series) => {
      if (series.weight > 0 && series.data[year] !== undefined) {
        weightedSum += series.data[year] * series.weight;
        weightTotal += series.weight;
      }
    });

    if (weightTotal > 0) {
      idx[year] = Number((weightedSum / weightTotal).toFixed(1));
    }
  });

  return idx;
}

function flattenGas() {
  const arr = [];

  for (let year = 1993; year <= 2025; year += 1) {
    if (!gasData[year]) continue;

    for (let month = 0; month < gasData[year].length; month += 1) {
      arr.push({ year, month, gas: gasData[year][month] });
    }
  }

  return arr;
}

function flattenSentiment() {
  const map = {};

  for (let year = 1993; year <= 2025; year += 1) {
    if (!sentimentData[year]) continue;

    for (let month = 0; month < sentimentData[year].length; month += 1) {
      map[`${year}-${month}`] = sentimentData[year][month];
    }
  }

  return map;
}

const gasFlat = flattenGas();
const sentimentMap = flattenSentiment();

function buildMonthly(lag) {
  const points = [];

  for (let i = 12; i < gasFlat.length; i += 1) {
    const current = gasFlat[i];
    const prior = gasFlat[i - 12];
    if (current.year < 1994) continue;

    const gasYoY = ((current.gas - prior.gas) / prior.gas) * 100;
    const targetIndex = i + lag;
    if (targetIndex >= gasFlat.length) continue;

    const target = gasFlat[targetIndex];
    const sentiment = sentimentMap[`${target.year}-${target.month}`];
    if (sentiment === undefined) continue;

    points.push({
      x: Number(gasYoY.toFixed(1)),
      y: sentiment,
      label: `${months[current.month]} ${current.year}`,
      year: current.year,
      month: current.month,
    });
  }

  return points;
}

function buildAnnual(metric) {
  const categoryData = metric === "weighted" ? buildWeightedIndex() : catSeries[metric].data;
  const points = [];

  Object.keys(gasYoYAnnual).map(Number).forEach((year) => {
    if (categoryData[year] === undefined) return;
    if (year === 2020) return;

    points.push({
      x: gasYoYAnnual[year],
      y: categoryData[year],
      label: String(year),
      year,
    });
  });

  return points;
}

function ols(data) {
  const n = data.length;
  if (n < 3) return { slope: 0, intercept: 0, r2: 0, r: 0, tStat: 0, n };

  let sx = 0;
  let sy = 0;
  let sxy = 0;
  let sx2 = 0;

  data.forEach((point) => {
    sx += point.x;
    sy += point.y;
    sxy += point.x * point.y;
    sx2 += point.x * point.x;
  });

  const slope = (n * sxy - sx * sy) / (n * sx2 - sx * sx);
  const intercept = (sy - slope * sx) / n;
  const meanY = sy / n;

  let ssTot = 0;
  let ssRes = 0;

  data.forEach((point) => {
    ssTot += (point.y - meanY) ** 2;
    ssRes += (point.y - (intercept + slope * point.x)) ** 2;
  });

  const r2 = ssTot === 0 ? 0 : 1 - ssRes / ssTot;
  const r = Math.sqrt(Math.abs(r2)) * (slope < 0 ? -1 : 1);
  const se = Math.sqrt(ssRes / (n - 2));
  const slopeError = se / Math.sqrt(sx2 - (sx * sx) / n);
  const tStat = slopeError === 0 ? 0 : slope / slopeError;

  return { slope, intercept, r2, r, tStat, n };
}

function scale(value, domainMin, domainMax, rangeMin, rangeMax) {
  if (domainMax === domainMin) return (rangeMin + rangeMax) / 2;
  return rangeMin + ((value - domainMin) / (domainMax - domainMin)) * (rangeMax - rangeMin);
}

function createLinePath(points) {
  return points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(2)},${point.y.toFixed(2)}`).join(" ");
}

function numberLabel(value) {
  return Number(value).toFixed(1);
}

function getContext() {
  const isMonthly = state.metric === "sentiment";
  const isEpisodes = state.metric === "episodes";
  const data = isMonthly ? buildMonthly(state.lag) : isEpisodes ? [] : buildAnnual(state.metric);
  const regression = ols(data);
  const lagSweep = isMonthly
    ? Array.from({ length: 13 }, (_, lag) => ({ lag, r2: ols(buildMonthly(lag)).r2 }))
    : [];
  const bestLag = lagSweep.length ? lagSweep.reduce((best, item) => (item.r2 > best.r2 ? item : best), lagSweep[0]) : { lag: 0, r2: 0 };
  const weightedIndex = buildWeightedIndex();
  const annualTimeline = Object.keys(gasYoYAnnual)
    .map(Number)
    .sort((a, b) => a - b)
    .map((year) => ({
      year,
      gasYoY: gasYoYAnnual[year],
      entertainment: catSeries.entertainment.data[year],
      apparel: catSeries.apparel.data[year],
      dining: catSeries.dining.data[year],
      weighted: weightedIndex[year],
    }));

  return {
    isMonthly,
    isEpisodes,
    data,
    regression,
    lagSweep,
    bestLag,
    annualTimeline,
    currentEpisode: episodes[state.episodeIndex],
  };
}

function renderScatterChart(context) {
  const width = 920;
  const height = 460;
  const padding = { top: 20, right: 24, bottom: 58, left: 64 };
  const { data, regression, isMonthly } = context;
  const xMin = Math.min(...data.map((point) => point.x), -5);
  const xMax = Math.max(...data.map((point) => point.x), 5);
  const yMinRaw = Math.min(...data.map((point) => point.y));
  const yMaxRaw = Math.max(...data.map((point) => point.y));
  const yPad = (yMaxRaw - yMinRaw || 10) * 0.12;
  const yMin = yMinRaw - yPad;
  const yMax = yMaxRaw + yPad;
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  const xPos = (value) => scale(value, xMin, xMax, padding.left, padding.left + plotWidth);
  const yPos = (value) => scale(value, yMin, yMax, padding.top + plotHeight, padding.top);

  const regressionPoints = [
    { x: xMin, y: regression.intercept + regression.slope * xMin },
    { x: xMax, y: regression.intercept + regression.slope * xMax },
  ];

  const grid = Array.from({ length: 6 }, (_, index) => {
    const x = padding.left + (plotWidth * index) / 5;
    const y = padding.top + (plotHeight * index) / 5;
    return `
      <line x1="${x}" y1="${padding.top}" x2="${x}" y2="${padding.top + plotHeight}" stroke="rgba(255,255,255,0.08)" />
      <line x1="${padding.left}" y1="${y}" x2="${padding.left + plotWidth}" y2="${y}" stroke="rgba(255,255,255,0.08)" />
    `;
  }).join("");

  const zeroLines = `
    ${xMin < 0 && xMax > 0 ? `<line x1="${xPos(0)}" y1="${padding.top}" x2="${xPos(0)}" y2="${padding.top + plotHeight}" stroke="rgba(255,255,255,0.18)" stroke-dasharray="5 5" />` : ""}
    ${!isMonthly && yMin < 0 && yMax > 0 ? `<line x1="${padding.left}" y1="${yPos(0)}" x2="${padding.left + plotWidth}" y2="${yPos(0)}" stroke="rgba(255,255,255,0.18)" stroke-dasharray="5 5" />` : ""}
  `;

  const circles = data.map((point) => `
    <circle cx="${xPos(point.x)}" cy="${yPos(point.y)}" r="${isMonthly ? 3.8 : 5.2}" fill="${sty.blue1}" fill-opacity="${isMonthly ? 0.65 : 0.82}">
      <title>${point.label}: Gas YoY ${point.x > 0 ? "+" : ""}${point.x}%, Value ${numberLabel(point.y)}</title>
    </circle>
  `).join("");

  const xTicks = Array.from({ length: 6 }, (_, index) => {
    const value = xMin + ((xMax - xMin) * index) / 5;
    const x = xPos(value);
    return `<text x="${x}" y="${height - 24}" fill="${sty.dim}" font-size="11" text-anchor="middle">${Math.round(value)}</text>`;
  }).join("");

  const yTicks = Array.from({ length: 6 }, (_, index) => {
    const value = yMin + ((yMax - yMin) * index) / 5;
    const y = yPos(value);
    return `<text x="${padding.left - 10}" y="${y + 4}" fill="${sty.dim}" font-size="11" text-anchor="end">${Math.round(value)}</text>`;
  }).join("");

  return `
    <div style="max-width:960px;margin:0 auto 20px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:24px 12px 16px;">
      <svg viewBox="0 0 ${width} ${height}" width="100%" height="460" role="img" aria-label="Scatter chart">
        ${grid}
        ${zeroLines}
        <line x1="${padding.left}" y1="${padding.top + plotHeight}" x2="${padding.left + plotWidth}" y2="${padding.top + plotHeight}" stroke="rgba(255,255,255,0.2)" />
        <line x1="${padding.left}" y1="${padding.top}" x2="${padding.left}" y2="${padding.top + plotHeight}" stroke="rgba(255,255,255,0.2)" />
        <path d="${createLinePath(regressionPoints.map((point) => ({ x: xPos(point.x), y: yPos(point.y) })))}" stroke="${sty.gold}" stroke-width="2.5" stroke-dasharray="8 4" fill="none" />
        ${circles}
        ${xTicks}
        ${yTicks}
        <text x="${width / 2}" y="${height - 6}" fill="${sty.sub}" font-size="12" text-anchor="middle">Gas Price YoY %</text>
        <text x="18" y="${height / 2}" fill="${sty.sub}" font-size="12" text-anchor="middle" transform="rotate(-90 18 ${height / 2})">${context.isMonthly ? "Sentiment Index" : "YoY % Change"}</text>
      </svg>
      <div style="text-align:center;margin-top:12px;font-size:13px;color:${sty.sub};line-height:1.8;">
        <span style="color:#fef3c7;font-weight:700;">y-hat</span> = ${regression.intercept.toFixed(1)} ${regression.slope < 0 ? "-" : "+"} ${Math.abs(regression.slope).toFixed(3)}x
        | R2 = <span style="color:#fef3c7;font-weight:700;">${regression.r2.toFixed(3)}</span>
        | r = <span style="color:${regression.r < 0 ? sty.red : sty.green};font-weight:700;">${regression.r.toFixed(3)}</span>
        | t = <span style="color:${sty.blue2};font-weight:700;">${regression.tStat.toFixed(1)}</span>
        | n = ${regression.n}${context.isMonthly ? ` (lag ${state.lag} mo)` : " (annual, ex-Covid)"}
      </div>
    </div>
  `;
}

function renderTimeSeriesChart(context) {
  const width = 920;
  const height = 420;
  const padding = { top: 20, right: 28, bottom: 46, left: 60 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  if (context.isMonthly) {
    const gasSeries = context.data.map((point, index) => ({ x: index, y: point.x, label: point.label }));
    const sentimentSeries = context.data.map((point, index) => ({ x: index, y: point.y, label: point.label }));
    const gasMin = Math.min(...gasSeries.map((point) => point.y));
    const gasMax = Math.max(...gasSeries.map((point) => point.y));
    const sentMin = Math.min(...sentimentSeries.map((point) => point.y));
    const sentMax = Math.max(...sentimentSeries.map((point) => point.y));
    const xPos = (value) => scale(value, 0, gasSeries.length - 1, padding.left, padding.left + plotWidth);
    const gasY = (value) => scale(value, gasMin, gasMax, padding.top + plotHeight, padding.top);
    const sentY = (value) => scale(value, sentMin, sentMax, padding.top + plotHeight, padding.top);
    const gasPath = createLinePath(gasSeries.map((point) => ({ x: xPos(point.x), y: gasY(point.y) })));
    const sentPath = createLinePath(sentimentSeries.map((point) => ({ x: xPos(point.x), y: sentY(point.y) })));
    const ticks = gasSeries.filter((_, index) => index % 24 === 0 || index === gasSeries.length - 1).map((point) => `
      <text x="${xPos(point.x)}" y="${height - 14}" fill="${sty.dim}" font-size="9" text-anchor="end" transform="rotate(-45 ${xPos(point.x)} ${height - 14})">${point.label}</text>
    `).join("");
    return `
      <div style="max-width:960px;margin:0 auto 20px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:24px 12px 16px;">
        <svg viewBox="0 0 ${width} ${height}" width="100%" height="420" role="img" aria-label="Time series chart">
          <line x1="${padding.left}" y1="${padding.top + plotHeight}" x2="${padding.left + plotWidth}" y2="${padding.top + plotHeight}" stroke="rgba(255,255,255,0.2)" />
          <line x1="${padding.left}" y1="${padding.top}" x2="${padding.left}" y2="${padding.top + plotHeight}" stroke="rgba(248,113,113,0.35)" />
          <line x1="${padding.left + plotWidth}" y1="${padding.top}" x2="${padding.left + plotWidth}" y2="${padding.top + plotHeight}" stroke="rgba(147,197,253,0.35)" />
          <path d="${gasPath}" stroke="${sty.red}" stroke-width="1.8" fill="none" />
          <path d="${sentPath}" stroke="${sty.blue2}" stroke-width="1.8" fill="none" />
          ${ticks}
          <text x="${padding.left}" y="${padding.top - 6}" fill="${sty.red}" font-size="11">Gas YoY %</text>
          <text x="${padding.left + plotWidth}" y="${padding.top - 6}" fill="${sty.blue2}" font-size="11" text-anchor="end">Sentiment</text>
        </svg>
      </div>
    `;
  }

  const series = [
    { key: "gasYoY", color: sty.red, label: "Gas Price" },
    { key: "weighted", color: sty.gold, label: "Weighted Discretionary" },
    { key: "entertainment", color: sty.blue1, label: "Entertainment" },
    { key: "apparel", color: sty.gold2, label: "Apparel" },
  ];
  const values = context.annualTimeline.flatMap((row) => series.map((seriesItem) => row[seriesItem.key]).filter((value) => value !== undefined));
  const yMin = Math.min(...values);
  const yMax = Math.max(...values);
  const xPos = (index) => scale(index, 0, context.annualTimeline.length - 1, padding.left, padding.left + plotWidth);
  const yPos = (value) => scale(value, yMin, yMax, padding.top + plotHeight, padding.top);
  const paths = series.map((seriesItem) => ({
    ...seriesItem,
    d: createLinePath(context.annualTimeline.map((row, index) => ({ x: xPos(index), y: yPos(row[seriesItem.key]) }))),
  }));
  const ticks = context.annualTimeline.map((row, index) => `
    <text x="${xPos(index)}" y="${height - 14}" fill="${sty.dim}" font-size="10" text-anchor="middle">${row.year}</text>
  `).join("");
  return `
    <div style="max-width:960px;margin:0 auto 20px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:24px 12px 16px;">
      <svg viewBox="0 0 ${width} ${height}" width="100%" height="420" role="img" aria-label="Annual time series chart">
        <line x1="${padding.left}" y1="${padding.top + plotHeight}" x2="${padding.left + plotWidth}" y2="${padding.top + plotHeight}" stroke="rgba(255,255,255,0.2)" />
        <line x1="${padding.left}" y1="${padding.top}" x2="${padding.left}" y2="${padding.top + plotHeight}" stroke="rgba(255,255,255,0.2)" />
        ${yMin < 0 && yMax > 0 ? `<line x1="${padding.left}" y1="${yPos(0)}" x2="${padding.left + plotWidth}" y2="${yPos(0)}" stroke="rgba(255,255,255,0.18)" stroke-dasharray="5 5" />` : ""}
        ${paths.map((path) => `<path d="${path.d}" stroke="${path.color}" stroke-width="${path.key === "weighted" ? 2.8 : 1.8}" fill="none" />`).join("")}
        ${ticks}
      </svg>
      <div style="display:flex;gap:16px;flex-wrap:wrap;justify-content:center;margin-top:10px;">
        ${paths.map((path) => `<div style="display:flex;align-items:center;gap:6px;font-size:11px;color:${sty.sub};"><span style="width:12px;height:2px;background:${path.color};display:inline-block;"></span>${path.label}</div>`).join("")}
      </div>
    </div>
  `;
}

function renderEpisodeChart(context) {
  const width = 920;
  const height = 320;
  const padding = { top: 20, right: 24, bottom: 24, left: 160 };
  const plotWidth = width - padding.left - padding.right;
  const barHeight = 28;
  const gap = 16;
  const values = context.currentEpisode.cats.map((item) => item.v);
  const maxAbs = Math.max(...values.map((value) => Math.abs(value))) * 1.15;
  const zeroX = scale(0, -maxAbs, maxAbs, padding.left, padding.left + plotWidth);
  const bars = context.currentEpisode.cats.map((item, index) => {
    const y = padding.top + index * (barHeight + gap);
    const x = scale(Math.min(0, item.v), -maxAbs, maxAbs, padding.left, padding.left + plotWidth);
    const widthPx = Math.abs(scale(item.v, -maxAbs, maxAbs, padding.left, padding.left + plotWidth) - zeroX);
    const color = item.t === "gas" ? (item.v > 0 ? sty.red : sty.green) : item.t === "d" ? (item.v < 0 ? sty.red : sty.green) : sty.blue2;
    return `
      <text x="${padding.left - 12}" y="${y + 18}" fill="${sty.sub}" font-size="11" text-anchor="end">${item.name}</text>
      <rect x="${x}" y="${y}" width="${widthPx}" height="${barHeight}" rx="6" fill="${color}" fill-opacity="0.88"></rect>
      <text x="${item.v >= 0 ? x + widthPx + 8 : x - 8}" y="${y + 18}" fill="${sty.sub}" font-size="11" text-anchor="${item.v >= 0 ? "start" : "end"}">${item.v > 0 ? "+" : ""}${item.v}%</text>
    `;
  }).join("");
  return `
    <div style="max-width:960px;margin:0 auto 20px;">
      <div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap;">
        ${episodes.map((episode, index) => {
          const active = state.episodeIndex === index;
          const positiveGas = episode.cats[0].v > 0;
          return `<button data-episode="${index}" style="background:${active ? positiveGas ? "rgba(248,113,113,0.18)" : "rgba(52,211,153,0.18)" : "rgba(255,255,255,0.06)"};border:1px solid ${active ? positiveGas ? "rgba(248,113,113,0.55)" : "rgba(52,211,153,0.55)" : "rgba(255,255,255,0.08)"};color:${active ? positiveGas ? "#fecaca" : "#a7f3d0" : sty.sub};padding:8px 14px;border-radius:8px;font-size:11px;font-family:${sty.font};font-weight:600;cursor:pointer;">${episode.label}</button>`;
        }).join("")}
      </div>
      <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:24px 16px 16px;">
        <div style="text-align:center;margin-bottom:16px;font-size:18px;font-weight:700;color:#f8fafc;">${context.currentEpisode.label}</div>
        <svg viewBox="0 0 ${width} ${height}" width="100%" height="320" role="img" aria-label="Episode comparison chart">
          <line x1="${zeroX}" y1="${padding.top - 6}" x2="${zeroX}" y2="${height - 20}" stroke="rgba(255,255,255,0.18)" stroke-dasharray="5 5" />
          ${bars}
        </svg>
      </div>
    </div>
  `;
}

function dashboardMarkup(context) {
  const controls = `
    <div style="max-width:960px;margin:0 auto 16px;display:flex;gap:12px;flex-wrap:wrap;align-items:center;">
      <select id="research-metric" style="background:rgba(15,23,42,0.28);border:1px solid ${sty.gold}55;border-radius:10px;color:#fef3c7;padding:10px 14px;font-size:13px;font-family:${sty.font};font-weight:600;cursor:pointer;outline:none;min-width:280px;">
        <optgroup label="Monthly">
          <option value="sentiment" ${state.metric === "sentiment" ? "selected" : ""}>Michigan Consumer Sentiment</option>
        </optgroup>
        <optgroup label="Annual Categories">
          <option value="weighted" ${state.metric === "weighted" ? "selected" : ""}>Weighted Discretionary Index</option>
          <option value="entertainment" ${state.metric === "entertainment" ? "selected" : ""}>Entertainment Spending</option>
          <option value="apparel" ${state.metric === "apparel" ? "selected" : ""}>Apparel Spending</option>
          <option value="dining" ${state.metric === "dining" ? "selected" : ""}>Dining Out Spending</option>
          <option value="groceries" ${state.metric === "groceries" ? "selected" : ""}>Groceries</option>
          <option value="healthcare" ${state.metric === "healthcare" ? "selected" : ""}>Healthcare</option>
        </optgroup>
        <optgroup label="Detail">
          <option value="episodes" ${state.metric === "episodes" ? "selected" : ""}>Episode Deep Dives</option>
        </optgroup>
      </select>
      ${context.isEpisodes ? "" : `
        <div style="display:flex;gap:2px;background:rgba(255,255,255,0.08);border-radius:10px;padding:2px;">
          ${["scatter", "timeseries"].map((viewName) => `<button data-view="${viewName}" style="background:${state.view === viewName ? "rgba(212,175,55,0.18)" : "transparent"};border:1px solid ${state.view === viewName ? `${sty.gold}55` : "transparent"};color:${state.view === viewName ? "#fef3c7" : sty.sub};padding:8px 14px;border-radius:8px;font-size:11px;font-family:${sty.font};font-weight:600;cursor:pointer;">${viewName === "scatter" ? "Scatter + Regression" : "Time Series"}</button>`).join("")}
        </div>
      `}
    </div>
  `;

  const weighted = state.metric === "weighted"
    ? `
      <div style="max-width:960px;margin:0 auto 14px;background:rgba(212,175,55,0.1);border:1px solid ${sty.gold}33;border-radius:12px;padding:12px 18px;display:flex;gap:16px;flex-wrap:wrap;align-items:center;">
        <div style="font-size:11px;color:#fef3c7;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Index Weights</div>
        ${Object.values(catSeries).filter((series) => series.weight > 0).map((series) => `<div style="display:flex;align-items:center;gap:6px;"><div style="width:8px;height:8px;border-radius:2px;background:${series.color};"></div><span style="font-size:12px;color:${sty.sub};">${series.label}: <span style="color:#fef3c7;font-weight:700;">${(series.weight * 100).toFixed(0)}%</span></span></div>`).join("")}
      </div>
    `
    : "";

  const lagControls = context.isMonthly
    ? `
      <div style="max-width:960px;margin:0 auto 16px;background:rgba(255,255,255,0.08);border:1px solid ${sty.gold}22;border-radius:12px;padding:14px 20px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;flex-wrap:wrap;gap:8px;">
          <div style="font-size:11px;color:#fef3c7;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;">Lag: gas price to sentiment response</div>
          <div style="font-size:11px;color:${sty.sub};">Peak R2 at <span style="color:${sty.green};font-weight:700;">lag = ${context.bestLag.lag} months</span> (${context.bestLag.r2.toFixed(3)})</div>
        </div>
        <div style="display:flex;align-items:center;gap:12px;">
          <span style="font-size:10px;color:${sty.mute};">0 mo</span>
          <input id="research-lag" type="range" min="0" max="12" value="${state.lag}" style="flex:1;accent-color:${sty.gold};" />
          <span style="font-size:10px;color:${sty.mute};">12 mo</span>
          <div style="background:rgba(212,175,55,0.2);border:1px solid ${sty.gold}55;border-radius:8px;padding:4px 10px;font-size:12px;color:#fef3c7;font-weight:700;min-width:56px;text-align:center;">${state.lag} mo</div>
        </div>
      </div>
    `
    : "";

  const chart = context.isEpisodes
    ? renderEpisodeChart(context)
    : state.view === "scatter"
      ? renderScatterChart(context)
      : renderTimeSeriesChart(context);

  const stats = context.isEpisodes ? "" : `
    <div style="max-width:960px;margin:0 auto 20px;display:grid;grid-template-columns:repeat(auto-fit,minmax(155px,1fr));gap:12px;">
      ${[
        { label: "Slope", value: context.regression.slope.toFixed(3), sub: context.isMonthly ? "sentiment pts per 1% gas" : "category pts per 1% gas", color: sty.red },
        { label: "R2", value: context.regression.r2.toFixed(3), sub: "variance explained", color: sty.gold },
        { label: "Correlation", value: context.regression.r.toFixed(3), sub: "Pearson r", color: context.regression.r < 0 ? sty.red : sty.green },
        { label: "t-Statistic", value: context.regression.tStat.toFixed(2), sub: `n = ${context.regression.n}`, color: sty.blue1 },
      ].map((stat) => `<div style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:14px 16px;"><div style="font-size:9px;color:${sty.mute};text-transform:uppercase;letter-spacing:1.5px;margin-bottom:5px;">${stat.label}</div><div style="font-size:22px;font-weight:800;color:${stat.color};">${stat.value}</div><div style="font-size:10px;color:${sty.sub};margin-top:4px;">${stat.sub}</div></div>`).join("")}
    </div>
  `;

  return `
    <div style="background:linear-gradient(160deg, ${sty.bg} 0%, ${sty.bg2} 52%, ${sty.bg3} 100%);border-radius:28px;padding:32px 24px;font-family:${sty.font};color:${sty.text};box-shadow:0 30px 70px rgba(15,23,42,0.18);">
      <div style="max-width:960px;margin:0 auto 22px;">
        <div style="font-size:11px;letter-spacing:3px;color:${sty.gold};text-transform:uppercase;margin-bottom:6px;font-weight:700;">Anthem Capital Research</div>
        <h2 style="font-size:28px;font-weight:800;margin:0 0 8px;color:#f8fafc;">Gas Prices vs. Consumer Spending</h2>
        <p style="font-size:13px;color:${sty.sub};margin:0;line-height:1.6;">OLS regression with lag analysis | EIA, University of Michigan, and BLS Consumer Expenditure | 1994-2025</p>
      </div>
      ${controls}
      ${weighted}
      ${lagControls}
      ${chart}
      ${stats}
      <div style="max-width:960px;margin:0 auto 20px;display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px;">
        <div style="background:rgba(96,165,250,0.12);border:1px solid rgba(96,165,250,0.25);border-radius:12px;padding:16px 20px;">
          <div style="font-size:10px;color:${sty.blue2};font-weight:700;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:6px;">JPMorgan Chase Institute</div>
          <div style="font-size:28px;font-weight:900;color:${sty.red};">-$1.60</div>
          <p style="font-size:12px;color:${sty.sub};margin:6px 0 0;line-height:1.6;">For every extra $1 of gasoline spend, non-gas consumption falls by $1.60. The drag accumulates over roughly 2 to 3 months.</p>
        </div>
        <div style="background:rgba(212,175,55,0.12);border:1px solid ${sty.gold}33;border-radius:12px;padding:16px 20px;">
          <div style="font-size:10px;color:#fef3c7;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:6px;">AEJ Macro</div>
          <div style="font-size:28px;font-weight:900;color:${sty.green};">MPC near 1.0</div>
          <p style="font-size:12px;color:${sty.sub};margin:6px 0 0;line-height:1.6;">Consumers appear to spend nearly all gasoline savings elsewhere. In that framing, the household budget behaves like a zero-sum wallet.</p>
        </div>
        <div style="background:rgba(147,197,253,0.12);border:1px solid rgba(147,197,253,0.25);border-radius:12px;padding:16px 20px;">
          <div style="font-size:10px;color:${sty.blue2};font-weight:700;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:6px;">BLS Consumer Expenditure</div>
          <div style="font-size:28px;font-weight:900;color:#f8fafc;">+45% to -3%</div>
          <p style="font-size:12px;color:${sty.sub};margin:6px 0 0;line-height:1.6;">In 2022, gasoline spend surged 45.4% while entertainment fell 3.1%. The 2023 reversal was followed by stronger discretionary categories.</p>
        </div>
      </div>
      <div style="max-width:960px;margin:0 auto;background:rgba(212,175,55,0.08);border:1px solid ${sty.gold}22;border-radius:12px;padding:16px 20px;">
        <div style="font-size:11px;color:#fef3c7;font-weight:700;text-transform:uppercase;letter-spacing:2px;margin-bottom:6px;">Bottom Line</div>
        <p style="font-size:13px;color:${sty.sub};line-height:1.7;margin:0;">Rising gas prices are a measurable drag on discretionary consumer spending. The annual category data shows entertainment and apparel weakening in spike years and improving in relief years. The monthly lag analysis points to a delayed reaction window, with the strongest fit at ${context.bestLag.lag} months in the current sample.</p>
      </div>
    </div>
  `;
}

function bindDashboardEvents() {
  const metricSelect = document.getElementById("research-metric");
  if (metricSelect) {
    metricSelect.addEventListener("change", (event) => {
      state.metric = event.target.value;
      if (state.metric === "episodes") state.view = "scatter";
      renderDashboard();
    });
  }

  document.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => {
      state.view = button.getAttribute("data-view");
      renderDashboard();
    });
  });

  const lagInput = document.getElementById("research-lag");
  if (lagInput) {
    lagInput.addEventListener("input", (event) => {
      state.lag = Number(event.target.value);
      renderDashboard();
    });
  }

  document.querySelectorAll("[data-episode]").forEach((button) => {
    button.addEventListener("click", () => {
      state.episodeIndex = Number(button.getAttribute("data-episode"));
      renderDashboard();
    });
  });
}

function renderDashboard() {
  if (!rootElement) return;
  const context = getContext();
  rootElement.innerHTML = dashboardMarkup(context);
  bindDashboardEvents();
}

if (rootElement) {
  renderDashboard();
}
