import {
    TrendingUp,
    Sparkles,
    ShoppingBag,
    Coffee,
    Wallet,
    PiggyBank,
    ArrowUpRight,
    ArrowDownRight,
} from 'lucide-react';

const BalanceCard = () => (
    <div className="bg-linear-to-br from-emerald-500 to-emerald-700 rounded-2xl p-5 text-white shadow-lg shadow-emerald-200">
        <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-medium opacity-75">Total Balance</span>
            <Wallet size={15} className="opacity-75" />
        </div>
        <div className="text-3xl font-bold tracking-tight mb-2">$12,547.30</div>
        <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-xs">
                <ArrowUpRight size={13} className="text-emerald-200" />
                <span className="text-emerald-200 font-semibold">$6,300</span>
                <span className="opacity-60">income</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
                <ArrowDownRight size={13} className="text-rose-300" />
                <span className="text-rose-300 font-semibold">$2,400</span>
                <span className="opacity-60">spent</span>
            </div>
        </div>
    </div>
);

const SavingsCard = () => (
    <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <PiggyBank size={13} className="text-emerald-600" />
                </div>
                <span className="text-xs font-semibold text-slate-700">Savings rate</span>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Healthy</span>
        </div>
        <div className="text-2xl font-bold text-slate-900 mb-2">62%</div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-linear-to-r from-emerald-400 to-emerald-600 rounded-full" style={{ width: '62%' }} />
        </div>
    </div>
);

const InsightCard = () => (
    <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
        <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-xl bg-linear-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shrink-0">
                <Sparkles size={15} className="text-white" />
            </div>
            <div>
                <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-0.5">AI Insight</div>
                <div className="text-xs font-semibold text-slate-900 mb-1">Cut coffee spend → save $32/mo</div>
                <div className="text-[11px] text-slate-500 leading-relaxed">
                    You've visited Starbucks 14× this month. Brewing at home 3 days a week covers your savings gap.
                </div>
            </div>
        </div>
    </div>
);

const BudgetCard = () => (
    <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Budget · May 2026</div>
        {[
            { name: 'Food & Dining', icon: ShoppingBag, color: 'bg-amber-50 text-amber-600', bar: 'bg-amber-500', pct: 80, spent: '$320', total: '$400' },
            { name: 'Coffee', icon: Coffee, color: 'bg-rose-50 text-rose-600', bar: 'bg-rose-500', pct: 95, spent: '$47', total: '$50' },
            { name: 'Savings goal', icon: TrendingUp, color: 'bg-emerald-50 text-emerald-600', bar: 'bg-emerald-500', pct: 65, spent: '$650', total: '$1,000' },
        ].map((b) => (
            <div key={b.name}>
                <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                        <div className={`h-6 w-6 rounded-md ${b.color} flex items-center justify-center`}>
                            <b.icon size={11} />
                        </div>
                        <span className="text-[11px] font-medium text-slate-700">{b.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">{b.spent} / {b.total}</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${b.bar} rounded-full`} style={{ width: `${b.pct}%` }} />
                </div>
            </div>
        ))}
    </div>
);

const RecentCard = () => (
    <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Recent</div>
        <div className="space-y-2.5">
            {[
                { icon: ShoppingBag, bg: 'bg-blue-50 text-blue-600', name: 'Whole Foods', amount: '-$87.00', neg: true },
                { icon: Coffee, bg: 'bg-amber-50 text-amber-600', name: 'Starbucks', amount: '-$6.45', neg: true },
                { icon: TrendingUp, bg: 'bg-emerald-50 text-emerald-600', name: 'Salary', amount: '+$5,500', neg: false },
            ].map((t, i) => (
                <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className={`h-7 w-7 rounded-lg ${t.bg} flex items-center justify-center`}>
                            <t.icon size={12} />
                        </div>
                        <span className="text-[11px] font-medium text-slate-800">{t.name}</span>
                    </div>
                    <span className={`text-[11px] font-semibold ${t.neg ? 'text-slate-700' : 'text-emerald-600'}`}>
                        {t.amount}
                    </span>
                </div>
            ))}
        </div>
    </div>
);

const AuthHero = ({ headline, subheadline }) => (
    <div className="relative h-full w-full overflow-hidden bg-emerald-50 flex flex-col">

        {/* Subtle decorative blobs */}
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-emerald-200/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 -left-16 w-56 h-56 bg-emerald-100/60 rounded-full blur-3xl pointer-events-none" />

        {/* Headline area */}
        <div className="relative z-10 pt-12 px-10 xl:pt-16 xl:px-14 mb-8">
            <div className="inline-flex items-center gap-2 bg-white border border-emerald-100 rounded-full px-3 py-1.5 mb-5 shadow-sm">
                <div className="h-5 w-5 rounded-full bg-linear-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                    <Sparkles size={10} className="text-white" />
                </div>
                <span className="text-[11px] font-semibold text-emerald-700">Powered by Gemini AI</span>
            </div>
            <h1 className="text-4xl xl:text-5xl font-bold tracking-tight text-slate-900 leading-tight mb-2">
                {headline}
            </h1>
            <p className="text-base text-slate-500">{subheadline}</p>
        </div>

        {/* Static card grid */}
        <div className="relative z-10 flex-1 px-10 xl:px-14 overflow-hidden">
            <div className="grid grid-cols-2 gap-3 h-full pb-10">
                <div className="space-y-3 overflow-hidden">
                    <BalanceCard />
                    <InsightCard />
                    <RecentCard />
                </div>
                <div className="space-y-3 pt-6 overflow-hidden">
                    <SavingsCard />
                    <BudgetCard />
                </div>
            </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-emerald-50 to-transparent pointer-events-none z-20" />
    </div>
);

export default AuthHero;