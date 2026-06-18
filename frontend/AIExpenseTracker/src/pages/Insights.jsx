import { useEffect, useMemo, useState, useRef } from 'react';
import { Sparkles, TrendingUp, Lightbulb, Activity, Wallet, Clock, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/axios.js';
import { API_PATHS } from '../utils/apiPaths.js';
import { timeAgo } from '../utils/format.js';
import EmptyState from '../components/EmptyState.jsx';
import Spinner from '../components/Spinner.jsx';
import InsightCard from '../components/InsightCard.jsx';
import KpiCard from '../components/KpiCard.jsx';

const ActionCard = ({ title, description, icon: Icon, accentGradient, accentText, onClick, generating, lastGeneratedDisplay }) => (
    <button
        onClick={onClick}
        disabled={generating}
        className="group relative overflow-hidden bg-white rounded-3xl border border-slate-100 p-6 text-left hover:border-slate-200 hover:shadow-md transition disabled:opacity-60 disabled:cursor-not-allowed"
    >
        <div className="flex items-start justify-between mb-4">
            <div className={`h-14 w-14 rounded-2xl bg-linear-to-br ${accentGradient} flex items-center justify-center group-hover:scale-105 transition shadow-sm`}>
                <Icon size={24} className="text-white" />
            </div>
            {generating
                ? <Spinner size="sm" />
                : <Sparkles size={16} className="text-slate-300 group-hover:text-emerald-500 transition" />
            }
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-1.5">{title}</h3>
        <p className="text-sm text-slate-500 mb-5 leading-relaxed">{description}</p>
        <div className="flex items-center justify-between">
            <span className={`inline-flex items-center gap-1.5 text-sm font-semibold ${accentText}`}>
                {generating ? 'Analyzing…' : 'Generate Insight'}
                {!generating && <ArrowRight size={14} className="group-hover:translate-x-0.5 transition" />}
            </span>
            {lastGeneratedDisplay && (
                <span className="text-xs text-slate-400">Last: {lastGeneratedDisplay}</span>
            )}
        </div>
    </button>
);

const Insights = () => {
    const [insights, setInsights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const refreshInterval = useRef(null);

    const fetchInsights = async () => {
        try {
            setLoading(true);
            const res = await api.get(API_PATHS.INSIGHTS.LIST);
            setInsights(res.data);
            setRefreshKey((prev) => prev + 1);
        } catch (err) {
            toast.error('Failed to load insights');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInsights();
        refreshInterval.current = setInterval(() => setRefreshKey((prev) => prev + 1), 10000);
        return () => clearInterval(refreshInterval.current);
    }, []);

    const generate = async (type) => {
        setGenerating(type);
        try {
            const res = await api.post(API_PATHS.INSIGHTS.GENERATE, { type });
            setInsights((prev) => [res.data, ...prev.filter((i) => i.id !== res.data.id)]);
            toast.success('Insight generated');
            await fetchInsights();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to generate');
        } finally {
            setGenerating(null);
        }
    };

    const stats = useMemo(() => {
        const latestMonthly = insights.find((i) => i.insight_type === 'monthly_summary');
        const latestTips    = insights.find((i) => i.insight_type === 'saving_tips');
        const monthly = latestMonthly?.content_json;
        const tips    = latestTips?.content_json;
        const potentialSavings = tips?.tips?.reduce((sum, t) => sum + (Number(t.estimatedSavings) || 0), 0) || 0;

        return {
            total: insights.length,
            healthScore: monthly?.healthScore ?? null,
            potentialSavings,
            lastAnalysisTime:   insights[0]?.created_at        ? timeAgo(insights[0].created_at)        : null,
            monthlyDisplayTime: latestMonthly?.created_at      ? timeAgo(latestMonthly.created_at)      : null,
            tipsDisplayTime:    latestTips?.created_at         ? timeAgo(latestTips.created_at)         : null,
        };
    }, [insights, refreshKey]);

    const healthAccent = stats.healthScore == null ? 'slate' : stats.healthScore >= 70 ? 'emerald' : stats.healthScore >= 40 ? 'amber' : 'rose';

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">AI Insights</h1>
                <p className="text-sm text-slate-500 mt-1">Personalized financial analysis powered by Gemini</p>
            </div>

            {/* KPI strip */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard label="Insights generated" value={stats.total}                                                       icon={Sparkles} accent="emerald" />
                <KpiCard label="Health score"        value={stats.healthScore != null ? `${stats.healthScore}/100` : '—'}     icon={Activity} accent={healthAccent} />
                <KpiCard label="Potential savings"   value={stats.potentialSavings > 0 ? `$${stats.potentialSavings.toFixed(0)}/mo` : '—'} icon={Wallet} accent="orange" />
                <KpiCard label="Last analysis"       value={stats.lastAnalysisTime || '—'}                                    icon={Clock}    accent="violet" />
            </div>

            {/* Action cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ActionCard
                    title="Monthly Summary"
                    description="A full breakdown of this month's income, expenses, and a personalized health score with actionable recommendations."
                    icon={TrendingUp}
                    accentGradient="from-amber-400 to-amber-600"
                    accentText="text-amber-600"
                    onClick={() => generate('monthly_summary')}
                    generating={generating === 'monthly_summary'}
                    lastGeneratedDisplay={stats.monthlyDisplayTime}
                />
                <ActionCard
                    title="Savings Tips"
                    description="Tailored, ranked ways to save money based on your top spending categories from the last 30 days."
                    icon={Lightbulb}
                    accentGradient="from-blue-400 to-blue-600"
                    accentText="text-blue-600"
                    onClick={() => generate('saving_tips')}
                    generating={generating === 'saving_tips'}
                    lastGeneratedDisplay={stats.tipsDisplayTime}
                />
            </div>

            {/* History */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-slate-900 tracking-tight">Recent Analyses</h2>
                    {!loading && insights.length > 0 && (
                        <span className="text-xs text-slate-400">{insights.length} {insights.length === 1 ? 'analysis' : 'analyses'}</span>
                    )}
                </div>

                {loading ? (
                    <div className="bg-white rounded-3xl border border-slate-100 py-16 flex justify-center">
                        <Spinner size="lg" />
                    </div>
                ) : insights.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-slate-100">
                        <EmptyState icon={Sparkles} title="No insights yet" description="Generate your first AI analysis using one of the cards above." />
                    </div>
                ) : (
                    <div className="space-y-3">
                        {insights.map((i, idx) => (
                            <InsightCard key={i.id} insight={i} defaultExpanded={idx === 0} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Insights;