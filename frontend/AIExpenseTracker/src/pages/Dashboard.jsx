import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Wallet, TrendingUp, TrendingDown, PiggyBank, ArrowRight, Target } from 'lucide-react';
import api from '../lib/axios.js';
import { API_PATHS } from '../utils/apiPaths.js';
import { useAuth } from '../context/AuthContext.jsx';
import { formatCurrency, formatDate } from '../utils/format.js';
import KpiCard from '../components/KpiCard.jsx';
import CategoryBadge from '../components/CategoryBadge.jsx';
import MonthlyTrendChart from '../components/charts/MonthlyTrendChart.jsx';
import CategoryBreakdownChart from '../components/charts/CategoryBreakdownChart.jsx';
import Spinner from '../components/Spinner.jsx';

const Dashboard = () => {
    const { user } = useAuth();
    const currency = user?.currency || 'USD';
    const [summary, setSummary] = useState(null);
    const [trend, setTrend] = useState([]);
    const [breakdown, setBreakdown] = useState([]);
    const [recent, setRecent] = useState([]);
    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const [s, t, b, r, bd] = await Promise.all([
                    api.get(API_PATHS.DASHBOARD.SUMMARY),
                    api.get(API_PATHS.DASHBOARD.MONTHLY_TREND),
                    api.get(API_PATHS.DASHBOARD.CATEGORY_BREAKDOWN),
                    api.get(API_PATHS.TRANSACTIONS.LIST, { params: { limit: 5 } }),
                    api.get(API_PATHS.BUDGETS.LIST),
                ]);
                setSummary(s.data);
                setTrend(t.data);
                setBreakdown(b.data);
                setRecent(r.data);
                setBudgets(bd.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const totalSpent = budgets.reduce((sum, b) => sum + parseFloat(b.spent), 0);
    const totalBudget = budgets.reduce((sum, b) => sum + parseFloat(b.amount), 0);
    const aggPct = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    const aggColor = aggPct >= 100 ? '#F43F5E' : aggPct >= 70 ? '#F59E0B' : '#10B981';

    if (loading || !summary) {
        return (
            <div className="flex justify-center py-16">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
                <p className="text-sm text-slate-500 mt-1">An overview of your finances this month</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard label="Balance"      value={formatCurrency(summary.balance, currency)}          icon={Wallet}      accent="emerald" />
                <KpiCard label="Income"       value={formatCurrency(summary.incomeThisMonth, currency)}  icon={TrendingUp}  accent="orange"  delta={summary.incomeDelta} />
                <KpiCard label="Expenses"     value={formatCurrency(summary.expenseThisMonth, currency)} icon={TrendingDown} accent="rose"   delta={summary.expenseDelta} />
                <KpiCard label="Savings Rate" value={`${(summary.savingsRate ?? 0).toFixed(1)}%`} icon={PiggyBank} accent="blue" />          
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 p-6">
                    <div className="mb-5">
                        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Monthly Trend</h2>
                        <p className="text-xs text-slate-500 mt-1">Income vs expenses, last 6 months</p>
                    </div>
                    <MonthlyTrendChart data={trend} currency={currency} />
                </div>
                <div className="bg-white rounded-3xl border border-slate-100 p-6">
                    <div className="mb-5">
                        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Top Categories</h2>
                        <p className="text-xs text-slate-500 mt-1">Spending this month</p>
                    </div>
                    <CategoryBreakdownChart data={breakdown} currency={currency} />
                </div>
            </div>

            {/* Recent Transactions + Budget Status */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Recent Transactions */}
                <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-100 p-6">
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Recent Transactions</h2>
                            <p className="text-xs text-slate-500 mt-0.5">Your latest activity</p>
                        </div>
                        <Link
                            to="/transactions"
                            className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition"
                        >
                            View all <ArrowRight size={14} />
                        </Link>
                    </div>
                    {recent.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                            <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                                <Wallet size={20} className="text-slate-400" />
                            </div>
                            <p className="text-sm font-medium text-slate-700">No transactions yet</p>
                            <p className="text-xs text-slate-400 mt-1">Add your first transaction to get started</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-50">
                            {recent.map((t) => (
                                <div key={t.id} className="flex items-center justify-between py-3 hover:bg-slate-50/60 rounded-xl px-2 -mx-2 transition">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <CategoryBadge icon={t.category_icon} color={t.category_color} size="sm" />
                                        <div className="min-w-0">
                                            <div className="text-sm font-medium text-slate-900 truncate">
                                                {t.description || t.category_name || 'Untitled'}
                                            </div>
                                            <div className="text-xs text-slate-400 mt-0.5">
                                                {t.category_name || 'Uncategorized'} · {formatDate(t.transaction_date)}
                                            </div>
                                        </div>
                                    </div>
                                    <span className={`text-sm font-bold shrink-0 ml-3 ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-500'}`}>
                                        {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount, currency)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Budget Status */}
                <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-100 p-6">
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Budget Status</h2>
                            <p className="text-xs text-slate-500 mt-0.5">This month's spending limits</p>
                        </div>
                        <Link
                            to="/budgets"
                            className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition"
                        >
                            View all <ArrowRight size={14} />
                        </Link>
                    </div>

                    {budgets.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                            <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                                <Target size={20} className="text-slate-400" />
                            </div>
                            <p className="text-sm font-medium text-slate-700">No budgets yet</p>
                            <Link to="/budgets" className="text-xs text-emerald-600 font-medium hover:text-emerald-700 mt-1">
                                Create one →
                            </Link>
                        </div>
                    ) : (
                        <>
                            {/* Aggregate */}
                            <div className="bg-slate-50 rounded-2xl p-4 mb-4">
                                <div className="flex items-baseline justify-between mb-2">
                                    <div>
                                        <div className="text-xl font-bold tracking-tight text-slate-900">
                                            {formatCurrency(totalSpent, currency)}
                                        </div>
                                        <div className="text-xs text-slate-500 mt-0.5">
                                            of {formatCurrency(totalBudget, currency)} total budget
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-bold" style={{ color: aggColor }}>
                                            {aggPct.toFixed(0)}%
                                        </div>
                                        <div className="text-[10px] text-slate-400">used</div>
                                    </div>
                                </div>
                                <div className="h-2 bg-white rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all"
                                        style={{ width: `${Math.min(aggPct, 100)}%`, backgroundColor: aggColor }}
                                    />
                                </div>
                            </div>

                            {/* Individual budgets */}
                            <div className="space-y-3">
                                {budgets.slice(0, 4).map((b) => {
                                    const spent = parseFloat(b.spent);
                                    const total = parseFloat(b.amount);
                                    const pct = total > 0 ? Math.min((spent / total) * 100, 100) : 0;
                                    const color = pct >= 100 ? '#F43F5E' : pct >= 70 ? '#F59E0B' : '#10B981';
                                    return (
                                        <div key={b.id}>
                                            <div className="flex justify-between items-center mb-1.5">
                                                <span className="text-xs font-medium text-slate-700 truncate">{b.category_name}</span>
                                                <span className="text-[11px] text-slate-400 shrink-0 ml-2">
                                                    {formatCurrency(spent, currency)} / {formatCurrency(total, currency)}
                                                </span>
                                            </div>
                                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full transition-all"
                                                    style={{ width: `${pct}%`, backgroundColor: color }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;