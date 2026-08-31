import { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { Loader2, TrendingUp, Award, BarChart3 } from 'lucide-react';

type SalesReportRow = {
  period: string;
  order_count: number | string;
  revenue: number | string;
};

type BestSellerRow = {
  product_name: string;
  total_sold: number | string;
  total_revenue: number | string;
};

const money = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
});

function formatMoney(value: number | string): string {
  return money.format(Number(value) || 0);
}

function SalesTrendChart({ data }: { data: SalesReportRow[] }) {
  const chartData = [...data].reverse();
  const maxRevenue = Math.max(...chartData.map((item) => Number(item.revenue) || 0), 0);
  const totalRevenue = chartData.reduce((sum, item) => sum + (Number(item.revenue) || 0), 0);
  const totalOrders = chartData.reduce((sum, item) => sum + (Number(item.order_count) || 0), 0);

  if (chartData.length === 0 || maxRevenue === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-slate-50 border-b border-slate-100">
        <p className="text-sm text-slate-400 font-medium">No chart data for this period</p>
      </div>
    );
  }

  const width = 720;
  const height = 240;
  const paddingX = 44;
  const paddingTop = 24;
  const paddingBottom = 44;
  const innerWidth = width - paddingX * 2;
  const innerHeight = height - paddingTop - paddingBottom;
  const points = chartData.map((item, index) => {
    const x = chartData.length === 1
      ? width / 2
      : paddingX + (index / (chartData.length - 1)) * innerWidth;
    const y = paddingTop + innerHeight - ((Number(item.revenue) || 0) / maxRevenue) * innerHeight;
    return { x, y, item };
  });
  const linePath = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`;

  return (
    <div className="border-b border-slate-100 bg-slate-50/60">
      <div className="grid grid-cols-2 gap-3 p-4">
        <div className="bg-white border border-slate-100 rounded-xl p-3">
          <p className="text-[11px] font-bold uppercase text-slate-400">Revenue</p>
          <p className="text-lg font-black text-emerald-600 mt-1">{formatMoney(totalRevenue)}</p>
        </div>
        <div className="bg-white border border-slate-100 rounded-xl p-3">
          <p className="text-[11px] font-bold uppercase text-slate-400">Orders</p>
          <p className="text-lg font-black text-indigo-600 mt-1">{totalOrders}</p>
        </div>
      </div>
      <div className="w-full overflow-hidden px-3 pb-4">
        <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Sales revenue trend chart" className="w-full h-64">
          <defs>
            <linearGradient id="salesArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.26" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
            const y = paddingTop + tick * innerHeight;
            return <line key={tick} x1={paddingX} x2={width - paddingX} y1={y} y2={y} stroke="#e2e8f0" strokeWidth="1" />;
          })}
          <path d={areaPath} fill="url(#salesArea)" />
          <path d={linePath} fill="none" stroke="#10b981" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          {points.map((point, index) => (
            <g key={`${point.item.period}-${index}`}>
              <circle cx={point.x} cy={point.y} r="5" fill="#ffffff" stroke="#10b981" strokeWidth="3" />
              {(index === 0 || index === points.length - 1 || chartData.length <= 6) && (
                <text x={point.x} y={height - 16} textAnchor="middle" className="fill-slate-400 text-[11px] font-semibold">
                  {point.item.period}
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

function BestSellerChart({ data }: { data: BestSellerRow[] }) {
  const chartData = data.slice(0, 8);
  const maxSold = Math.max(...chartData.map((item) => Number(item.total_sold) || 0), 0);

  if (chartData.length === 0 || maxSold === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-slate-50 border-b border-slate-100">
        <p className="text-sm text-slate-400 font-medium">No top product data yet</p>
      </div>
    );
  }

  return (
    <div className="border-b border-slate-100 bg-slate-50/60 p-4 space-y-3">
      {chartData.map((item, index) => {
        const sold = Number(item.total_sold) || 0;
        const percent = Math.max(4, (sold / maxSold) * 100);
        return (
          <div key={`${item.product_name}-${index}`} className="space-y-1.5">
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="font-semibold text-slate-700 truncate">{index + 1}. {item.product_name}</span>
              <span className="font-bold text-violet-600 shrink-0">{sold} sold</span>
            </div>
            <div className="h-3 bg-white border border-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-amber-400"
                style={{ width: `${percent}%` }}
                aria-label={`${item.product_name}: ${sold} sold`}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function ReportsOverview() {
  const [report, setReport] = useState<SalesReportRow[]>([]);
  const [bestSellers, setBestSellers] = useState<BestSellerRow[]>([]);
  const [period, setPeriod] = useState('daily');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, [period]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadReports = async () => {
    setLoading(true);
    try {
      const [reportData, bestSellersData] = await Promise.all([
        api.get(`/dashboard/sales-report?period=${period}`),
        api.get('/dashboard/best-sellers'),
      ]);
      setReport(reportData);
      setBestSellers(bestSellersData);
    } catch (error) {
      console.error('Failed to load reports:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Reports & Analytics</h2>
          <p className="text-sm text-slate-400 mt-0.5">Revenue trends and top products</p>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="w-full sm:w-auto px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-sm font-medium">Generating reports...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Sales Summary */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Sales Summary ({period.charAt(0).toUpperCase() + period.slice(1)})</h3>
            </div>
            <SalesTrendChart data={report} />
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-100 uppercase text-[10px] tracking-wider font-bold">
                  <tr>
                    <th className="px-5 py-2.5">Period</th>
                    <th className="px-5 py-2.5">Orders</th>
                    <th className="px-5 py-2.5 text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {report.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-5 py-8 text-center text-slate-400 text-xs">
                        No data for this period
                      </td>
                    </tr>
                  ) : (
                    report.map((r, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 transition-colors animate-fade-in-up" style={{ animationDelay: `${i * 40}ms` }}>
                        <td className="px-5 py-3 font-mono text-xs font-medium text-slate-600">{r.period}</td>
                        <td className="px-5 py-3 text-slate-600">{r.order_count}</td>
                        <td className="px-5 py-3 font-bold text-emerald-600 text-right">
                          {formatMoney(r.revenue)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Best Sellers */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center gap-2">
              <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
                <Award className="w-4 h-4 text-amber-600" />
              </div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-sm">Top Selling Products</h3>
                <BarChart3 className="w-4 h-4 text-slate-300" />
              </div>
            </div>
            <BestSellerChart data={bestSellers} />
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-100 uppercase text-[10px] tracking-wider font-bold">
                  <tr>
                    <th className="px-5 py-2.5">Product</th>
                    <th className="px-5 py-2.5">Sold</th>
                    <th className="px-5 py-2.5 text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bestSellers.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-5 py-8 text-center text-slate-400 text-xs">
                        No sales data available
                      </td>
                    </tr>
                  ) : (
                    bestSellers.map((b, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 transition-colors animate-fade-in-up" style={{ animationDelay: `${i * 40}ms` }}>
                        <td className="px-5 py-3 font-semibold text-slate-900">{b.product_name}</td>
                        <td className="px-5 py-3 text-slate-600 font-medium">{b.total_sold}</td>
                        <td className="px-5 py-3 font-bold text-violet-600 text-right">
                          {formatMoney(b.total_revenue)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
