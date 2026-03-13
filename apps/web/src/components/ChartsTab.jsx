import React, { useState, useEffect } from 'react';
import { 
  PieChart, Pie, Cell, 
  BarChart, Bar, 
  LineChart, Line,
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { ChevronLeft, ChevronRight, BarChart2, LineChart as LineChartIcon, PieChart as PieChartIcon, Activity } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const COLORS = ['#0f172a', '#334155', '#475569', '#64748b', '#94a3b8', '#cbd5e1', '#e2e8f0', '#f1f5f9'];

const ChartsTab = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  
  // Period and Date State
  const [period, setPeriod] = useState('month'); // 'week' | 'month'
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Chart Types State
  const [chartTypes, setChartTypes] = useState({
    expensesByCategory: 'pie',
    earningsBreakdown: 'bar',
    totalEarnings: 'bar',
    totalExpenses: 'bar'
  });

  // Data State
  const [expensesData, setExpensesData] = useState([]);
  const [earningsData, setEarningsData] = useState([]);
  const [totals, setTotals] = useState({ expenses: 0, earnings: 0 });

  useEffect(() => {
    fetchData();
  }, [currentUser, currentDate, period]);

  // Date Helpers
  const getStartOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const getEndOfWeek = (date) => {
    const d = getStartOfWeek(date);
    d.setDate(d.getDate() + 6);
    d.setHours(23, 59, 59, 999);
    return d;
  };

  const getStartOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
  };

  const getEndOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
  };

  const getPeriodRange = () => {
    if (period === 'week') {
      return { start: getStartOfWeek(currentDate), end: getEndOfWeek(currentDate) };
    } else {
      return { start: getStartOfMonth(currentDate), end: getEndOfMonth(currentDate) };
    }
  };

  const getPeriodLabel = () => {
    const { start, end } = getPeriodRange();
    if (period === 'week') {
      const startStr = start.toLocaleDateString('es-PE', { month: 'short', day: 'numeric' });
      const endStr = end.toLocaleDateString('es-PE', { month: 'short', day: 'numeric', year: 'numeric' });
      return `${startStr} - ${endStr}`;
    } else {
      return start.toLocaleDateString('es-PE', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase());
    }
  };

  const handlePrevPeriod = () => {
    const newDate = new Date(currentDate);
    if (period === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setCurrentDate(newDate);
  };

  const handleNextPeriod = () => {
    const newDate = new Date(currentDate);
    if (period === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const updateChartType = (chartId, type) => {
    setChartTypes(prev => ({ ...prev, [chartId]: type }));
  };

  const fetchData = async () => {
    if (!currentUser) return;
    setLoading(true);
    
    try {
      const { start, end } = getPeriodRange();
      
      // Format dates for PocketBase (UTC)
      const startStr = start.toISOString().replace('T', ' ').substring(0, 19);
      const endStr = end.toISOString().replace('T', ' ').substring(0, 19);

      // Fetch Expenses
      const expenses = await pb.collection('expenses').getFullList({
        filter: `userId = "${currentUser.id}" && date >= "${startStr}" && date <= "${endStr}"`,
        $autoCancel: false
      });

      // Fetch Earnings
      const earnings = await pb.collection('daily_records').getFullList({
        filter: `userId = "${currentUser.id}" && date >= "${startStr.split(' ')[0]}" && date <= "${endStr.split(' ')[0]}"`,
        $autoCancel: false
      });

      processData(expenses, earnings);
    } catch (error) {
      console.error('Error fetching chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processData = (expenses, earnings) => {
    // Process Expenses by Category
    const expByCategory = expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {});
    
    const formattedExpenses = Object.keys(expByCategory).map(key => ({
      name: key,
      value: expByCategory[key]
    })).sort((a, b) => b.value - a.value);

    // Process Earnings Breakdown
    let formattedEarnings = [];
    
    if (period === 'week') {
      // Daily breakdown for the week
      const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
      const weekData = days.reduce((acc, day) => ({ ...acc, [day]: 0 }), {});
      
      earnings.forEach(record => {
        if (!record.worked) return;
        const date = new Date(record.date);
        // Adjust getDay() so Monday is 0, Sunday is 6
        const dayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1;
        const dayName = days[dayIndex];
        if (weekData[dayName] !== undefined) {
          weekData[dayName] += record.total_earnings || 0;
        }
      });
      
      formattedEarnings = days.map(day => ({
        name: day,
        Ganancias: weekData[day]
      }));
    } else {
      // Weekly breakdown for the month
      const weeks = { 'Semana 1': 0, 'Semana 2': 0, 'Semana 3': 0, 'Semana 4': 0, 'Semana 5': 0 };
      
      earnings.forEach(record => {
        if (!record.worked) return;
        const day = new Date(record.date).getDate();
        const weekNum = Math.ceil(day / 7);
        const weekKey = `Semana ${weekNum > 5 ? 5 : weekNum}`;
        weeks[weekKey] += record.total_earnings || 0;
      });

      formattedEarnings = Object.keys(weeks).map(key => ({
        name: key,
        Ganancias: weeks[key]
      })).filter(w => w.Ganancias > 0 || w.name === 'Semana 1');
    }

    // Calculate Totals
    const totalExp = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalEarn = earnings.reduce((sum, rec) => sum + (rec.total_earnings || 0), 0);

    setExpensesData(formattedExpenses);
    setEarningsData(formattedEarnings);
    setTotals({ expenses: totalExp, earnings: totalEarn });
  };

  const renderChart = (type, data, dataKey, color) => {
    if (!data || data.length === 0) {
      return <div className="h-full flex items-center justify-center text-gray-500">Sin datos para este período</div>;
    }

    switch (type) {
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey={dataKey}
                nameKey="name"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `S/ ${value.toFixed(2)}`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => `S/ ${value.toFixed(2)}`} />
              <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'area':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => `S/ ${value.toFixed(2)}`} />
              <Area type="monotone" dataKey={dataKey} stroke={color} fill={color} fillOpacity={0.2} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        );
      case 'bar':
      default:
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => `S/ ${value.toFixed(2)}`} />
              <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} maxBarSize={50} />
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };

  const ChartTypeSelector = ({ chartId }) => (
    <div className="flex bg-gray-100 p-1 rounded-lg">
      <button
        onClick={() => updateChartType(chartId, 'bar')}
        className={`p-1.5 rounded-md transition-colors ${chartTypes[chartId] === 'bar' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
        title="Barras"
      >
        <BarChart2 className="w-4 h-4" />
      </button>
      <button
        onClick={() => updateChartType(chartId, 'line')}
        className={`p-1.5 rounded-md transition-colors ${chartTypes[chartId] === 'line' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
        title="Líneas"
      >
        <LineChartIcon className="w-4 h-4" />
      </button>
      <button
        onClick={() => updateChartType(chartId, 'area')}
        className={`p-1.5 rounded-md transition-colors ${chartTypes[chartId] === 'area' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
        title="Área"
      >
        <Activity className="w-4 h-4" />
      </button>
      <button
        onClick={() => updateChartType(chartId, 'pie')}
        className={`p-1.5 rounded-md transition-colors ${chartTypes[chartId] === 'pie' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
        title="Circular"
      >
        <PieChartIcon className="w-4 h-4" />
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Controls Section */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex bg-gray-100 p-1 rounded-lg w-full sm:w-auto">
          <button
            onClick={() => setPeriod('week')}
            className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-md transition-colors ${period === 'week' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Semana
          </button>
          <button
            onClick={() => setPeriod('month')}
            className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-md transition-colors ${period === 'month' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Mes
          </button>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <Button variant="outline" size="icon" onClick={handlePrevPeriod} className="h-9 w-9">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-medium text-gray-900 min-w-[140px] text-center">
            {getPeriodLabel()}
          </span>
          <Button variant="outline" size="icon" onClick={handleNextPeriod} className="h-9 w-9">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-gray-900 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Totals Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="overflow-hidden transition-all duration-300 hover:shadow-md">
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium text-gray-500">Ingresos Totales ({period === 'week' ? 'Semana' : 'Mes'})</CardTitle>
                <ChartTypeSelector chartId="totalEarnings" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 mb-4">S/ {totals.earnings.toFixed(2)}</div>
                <div className="h-[120px] w-full">
                  {renderChart(chartTypes.totalEarnings, [{ name: 'Total', Ganancias: totals.earnings }], 'Ganancias', '#0f172a')}
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden transition-all duration-300 hover:shadow-md">
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium text-gray-500">Gastos Totales ({period === 'week' ? 'Semana' : 'Mes'})</CardTitle>
                <ChartTypeSelector chartId="totalExpenses" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 mb-4">S/ {totals.expenses.toFixed(2)}</div>
                <div className="h-[120px] w-full">
                  {renderChart(chartTypes.totalExpenses, [{ name: 'Total', Gastos: totals.expenses }], 'Gastos', '#64748b')}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Breakdown Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="col-span-1 transition-all duration-300 hover:shadow-md">
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
                <CardTitle className="text-lg">Gastos por Categoría</CardTitle>
                <ChartTypeSelector chartId="expensesByCategory" />
              </CardHeader>
              <CardContent className="h-[350px] pt-4">
                {renderChart(chartTypes.expensesByCategory, expensesData, 'value', '#475569')}
              </CardContent>
            </Card>

            <Card className="col-span-1 transition-all duration-300 hover:shadow-md">
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
                <CardTitle className="text-lg">Desglose de Ingresos</CardTitle>
                <ChartTypeSelector chartId="earningsBreakdown" />
              </CardHeader>
              <CardContent className="h-[350px] pt-4">
                {renderChart(chartTypes.earningsBreakdown, earningsData, 'Ganancias', '#0f172a')}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default ChartsTab;