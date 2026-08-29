import { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { Loader2, TrendingUp, Award } from 'lucide-react';

export default function ReportsOverview() {
  const [report, setReport] = useState<any[]>([]);
  const [bestSellers, setBestSellers] = useState<any[]>([]);
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
                          ₱{Number(r.revenue).toFixed(2)}
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
              <h3 className="font-bold text-slate-900 text-sm">Top Selling Products</h3>
            </div>
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
                          ₱{Number(b.total_revenue).toFixed(2)}
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
