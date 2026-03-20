import type { VendorTrends, MetricKey, WeeklyDataPoint } from './types'

const weeks = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8']

function trend(values: number[]): WeeklyDataPoint[] {
  return values.map((value, i) => ({ week: weeks[i], value }))
}

export const vendorTrends: VendorTrends[] = [
  // ─── Apex Outdoor Co. (v1) — steady growth ──────────────────
  {
    vendorId: 'v1',
    metrics: {
      orderedRevenue: trend([385000, 392000, 401000, 412000, 418000, 425000, 434000, 487900]),
      orderedUnits: trend([7800, 7950, 8100, 8300, 8450, 8600, 8800, 9350]),
      traffic: trend([108000, 112000, 115000, 118000, 120000, 122000, 125000, 126200]),
      conversionRate: trend([6.8, 6.9, 7.0, 7.1, 7.1, 7.2, 7.3, 7.4]),
      inStockRate: trend([95, 94, 96, 95, 94, 93, 94, 94]),
      adSpend: trend([14800, 15200, 15400, 15600, 15800, 16000, 16200, 16400]),
      adAttributedSales: trend([58000, 60000, 62000, 64000, 65000, 66000, 68000, 71900]),
      returnRate: trend([2.8, 2.7, 2.9, 2.6, 2.7, 2.8, 2.5, 2.6]),
    },
  },

  // ─── Bloom Naturals (v2) — mixed signals, some decline ──────
  {
    vendorId: 'v2',
    metrics: {
      orderedRevenue: trend([520000, 515000, 508000, 498000, 492000, 488000, 482000, 549000]),
      orderedUnits: trend([16800, 16600, 16200, 15900, 15600, 15400, 15200, 16985]),
      traffic: trend([195000, 192000, 188000, 185000, 182000, 180000, 178000, 176800]),
      conversionRate: trend([8.6, 8.7, 8.6, 8.6, 8.6, 8.6, 8.5, 9.6]),
      inStockRate: trend([94, 93, 92, 90, 89, 88, 87, 91]),
      adSpend: trend([24000, 24200, 24400, 24600, 24800, 25000, 25200, 25400]),
      adAttributedSales: trend([92000, 90000, 88000, 86000, 84000, 82000, 80000, 87600]),
      returnRate: trend([2.4, 2.6, 2.8, 2.9, 3.0, 3.1, 3.2, 2.7]),
    },
  },

  // ─── TechVault Electronics (v3) — declining across the board ─
  {
    vendorId: 'v3',
    metrics: {
      orderedRevenue: trend([580000, 562000, 548000, 520000, 505000, 492000, 478000, 489200]),
      orderedUnits: trend([6200, 6000, 5800, 5500, 5300, 5100, 4900, 7650]),
      traffic: trend([165000, 160000, 155000, 150000, 148000, 145000, 142000, 180600]),
      conversionRate: trend([5.2, 5.0, 4.8, 4.6, 4.4, 4.3, 4.2, 4.2]),
      inStockRate: trend([88, 86, 84, 82, 80, 78, 76, 80]),
      adSpend: trend([32000, 32400, 32800, 33200, 33600, 34000, 34400, 34200]),
      adAttributedSales: trend([86000, 82000, 78000, 74000, 70000, 68000, 65000, 85400]),
      returnRate: trend([5.2, 5.6, 5.8, 6.2, 6.4, 6.8, 7.0, 5.5]),
    },
  },

  // ─── HomeStead Goods (v4) — strong and stable ───────────────
  {
    vendorId: 'v4',
    metrics: {
      orderedRevenue: trend([380000, 386000, 392000, 398000, 405000, 412000, 420000, 485400]),
      orderedUnits: trend([9200, 9400, 9600, 9800, 10000, 10200, 10400, 11530]),
      traffic: trend([102000, 104000, 106000, 108000, 110000, 112000, 114000, 131600]),
      conversionRate: trend([9.0, 9.0, 9.1, 9.1, 9.1, 9.1, 9.1, 8.8]),
      inStockRate: trend([96, 96, 95, 96, 95, 95, 95, 95]),
      adSpend: trend([12800, 13000, 13200, 13400, 13600, 13800, 14000, 14400]),
      adAttributedSales: trend([62000, 64000, 66000, 68000, 70000, 72000, 74000, 76400]),
      returnRate: trend([1.8, 1.9, 1.8, 1.7, 1.8, 1.9, 1.8, 1.8]),
    },
  },

  // ─── PureFit Athletics (v5) — growing but some supply issues ─
  {
    vendorId: 'v5',
    metrics: {
      orderedRevenue: trend([280000, 288000, 296000, 308000, 315000, 322000, 330000, 351600]),
      orderedUnits: trend([10200, 10500, 10800, 11200, 11500, 11800, 12100, 13035]),
      traffic: trend([118000, 120000, 122000, 125000, 128000, 130000, 132000, 154400]),
      conversionRate: trend([8.6, 8.8, 8.9, 9.0, 9.0, 9.1, 9.2, 8.4]),
      inStockRate: trend([94, 93, 92, 91, 90, 89, 88, 90]),
      adSpend: trend([13000, 13400, 13800, 14200, 14600, 15000, 15400, 16000]),
      adAttributedSales: trend([48000, 50000, 52000, 54000, 56000, 58000, 60000, 61800]),
      returnRate: trend([2.6, 2.8, 2.9, 3.0, 3.1, 3.2, 3.4, 2.9]),
    },
  },
]

/** Get trends for a specific vendor */
export function getVendorTrends(vendorId: string): VendorTrends | undefined {
  return vendorTrends.find((t) => t.vendorId === vendorId)
}

/** Get the latest value and previous value for a metric */
export function getMetricSnapshot(
  trends: VendorTrends,
  key: MetricKey,
): { current: number; previous: number } {
  const data = trends.metrics[key]
  return {
    current: data[data.length - 1].value,
    previous: data[data.length - 2].value,
  }
}
