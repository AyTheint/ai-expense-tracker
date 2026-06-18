import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Wallet, Eye, EyeOff, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import AuthHero from '../components/AuthHero.jsx';
import Spinner from '../components/Spinner.jsx';

const CURRENCIES = [
    { value: 'USD', label: 'USD — US Dollar' },
    { value: 'EUR', label: 'EUR — Euro' },
    { value: 'GBP', label: 'GBP — British Pound' },
    { value: 'INR', label: 'INR — Indian Rupee' },
    { value: 'JPY', label: 'JPY — Japanese Yen' },
    { value: 'CAD', label: 'CAD — Canadian Dollar' },
    { value: 'AUD', label: 'AUD — Australian Dollar' },
    { value: 'SGD', label: 'SGD — Singapore Dollar' },
];

const Register = () => {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', password: '', currency: 'USD' });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const onSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await register(form);
            toast.success('Account created!');
            navigate('/');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const field = 'w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:border-emerald-500 focus:ring-3 focus:ring-emerald-500/10 rounded-xl px-4 py-3 text-slate-900 text-sm outline-none transition placeholder-slate-400';

    return (
        <div className="min-h-screen flex bg-white">
            {/* ── Form side ── */}
            <div className="flex-1 flex flex-col px-8 sm:px-12 lg:px-16 py-8 order-1">
                {/* Logo */}
                <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-xl bg-linear-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-sm shadow-emerald-200">
                        <Wallet size={17} className="text-white" />
                    </div>
                    <span className="font-bold text-slate-900 text-lg tracking-tight">ExpenseAI</span>
                </div>

                {/* Form */}
                <div className="flex-1 flex items-center justify-center py-10">
                    <div className="w-full max-w-sm">
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-1.5">
                                Create account
                            </h2>
                            <p className="text-sm text-slate-500">Start tracking your finances in seconds</p>
                        </div>

                        <form onSubmit={onSubmit} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-700">Name</label>
                                <input
                                    required
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className={field}
                                    placeholder="Alex"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-700">Email</label>
                                <input
                                    type="email"
                                    required
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    className={field}
                                    placeholder="you@example.com"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-700">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        minLength={6}
                                        value={form.password}
                                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                                        className={`${field} pr-11`}
                                        placeholder="At least 6 characters"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((v) => !v)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                                        tabIndex={-1}
                                    >
                                        {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-700">Currency</label>
                                <div className="relative">
                                    <select
                                        value={form.currency}
                                        onChange={(e) => setForm({ ...form, currency: e.target.value })}
                                        className={`${field} appearance-none pr-10 cursor-pointer`}
                                    >
                                        {CURRENCIES.map((c) => (
                                            <option key={c.value} value={c.value}>{c.label}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full mt-2 inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold py-3 rounded-xl transition shadow-sm shadow-emerald-200 disabled:opacity-60 disabled:cursor-not-allowed text-sm"
                            >
                                {loading ? (
                                    <>
                                        <Spinner size="sm" />
                                        Creating account...
                                    </>
                                ) : (
                                    'Create account'
                                )}
                            </button>
                        </form>

                        <p className="text-center mt-6 text-sm text-slate-500">
                            Already have an account?{' '}
                            <Link to="/login" className="text-emerald-600 font-semibold hover:text-emerald-700 transition">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>

                <div className="flex gap-5 text-xs text-slate-400">
                    <a className="hover:text-slate-600 transition cursor-pointer">Privacy</a>
                    <a className="hover:text-slate-600 transition cursor-pointer">Terms</a>
                    <a className="hover:text-slate-600 transition cursor-pointer">Help</a>
                </div>
            </div>

            {/* ── Hero side ── */}
            <div className="hidden lg:flex lg:w-[55%] order-2">
                <AuthHero headline="Begin" subheadline="your financial journey" />
            </div>
        </div>
    );
};

export default Register;