import { useCallback, useEffect, useRef, useState } from 'react';
import { Bell, Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/axios.js';
import { useAuth } from '../context/AuthContext.jsx';
import { API_PATHS } from '../utils/apiPaths.js';

const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
};

const formatToday = () =>
    new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
    });

const Topbar = () => {
    const { user } = useAuth();
    const firstName = user?.name?.split(' ')[0] || '';
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [notificationsLoading, setNotificationsLoading] = useState(false);
    const [notificationsSeen, setNotificationsSeen] = useState(false);
    const wrapperRef = useRef(null);
    const searchInputRef = useRef(null);
    const navigate = useNavigate();

    const buildNotificationsFromBudgets = (budgets = []) => {
        return budgets
            .map((budget) => {
                const amount = Number(budget.amount) || 0;
                const spent = Number(budget.spent) || 0;
                if (!amount || amount === 0) return null;

                const percent = Math.round((spent / amount) * 100);
                const title = `${budget.category_name} budget`;
                let message = null;
                let severity = null;

                if (percent >= 100) {
                    severity = 'over_budget';
                    message = `You are over your ${budget.period} budget for ${budget.category_name} by ${new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: user?.currency || 'USD',
                    }).format(spent - amount)}.`;
                } else if (percent >= 90) {
                    severity = 'warning';
                    message = `You're at ${percent}% of your ${budget.period} budget for ${budget.category_name}.`;
                } else if (percent >= 75) {
                    severity = 'notice';
                    message = `You've used ${percent}% of your ${budget.period} budget for ${budget.category_name}.`;
                }

                if (!message) return null;
                return {
                    id: `budget-${budget.id}`,
                    title,
                    message,
                    timestamp: 'Today',
                    severity,
                };
            })
            .filter(Boolean);
    };

    const fetchNotifications = useCallback(async () => {
        if (!user) return;
        setNotificationsLoading(true);
        setNotificationsSeen(false);

        try {
            const res = await api.get(API_PATHS.NOTIFICATIONS.LIST);
            const notificationsData = res.data || [];
            if (Array.isArray(notificationsData) && notificationsData.length > 0) {
                setNotifications(notificationsData);
            } else {
                const budgetsRes = await api.get(API_PATHS.BUDGETS.LIST);
                setNotifications(buildNotificationsFromBudgets(budgetsRes.data || []));
            }
        } catch (err) {
            console.error('Failed to load notifications:', err);
            try {
                const budgetsRes = await api.get(API_PATHS.BUDGETS.LIST);
                setNotifications(buildNotificationsFromBudgets(budgetsRes.data || []));
            } catch (fallbackErr) {
                console.error('Failed to load budget fallback notifications:', fallbackErr);
                setNotifications([]);
            }
        } finally {
            setNotificationsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    useEffect(() => {
        const handleNotificationUpdate = () => {
            fetchNotifications();
        };

        window.addEventListener('notifications:update', handleNotificationUpdate);
        return () => window.removeEventListener('notifications:update', handleNotificationUpdate);
    }, [fetchNotifications]);

    useEffect(() => {
        if (searchOpen) {
            searchInputRef.current?.focus();
        }
    }, [searchOpen]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!wrapperRef.current?.contains(event.target)) {
                setSearchOpen(false);
                setNotificationsOpen(false);
                setSearchTerm('');
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const submitSearch = (event) => {
        event.preventDefault();
        const query = searchTerm.trim();
        const params = new URLSearchParams();

        if (query) {
            params.set('search', query);
        }

        navigate(`/transactions${params.toString() ? `?${params.toString()}` : ''}`);
        setSearchOpen(false);
        setSearchTerm('');
    };

    return (
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 shrink-0">
            <div>
                <div className="text-sm font-semibold text-slate-900 tracking-tight">
                    {greeting()}{firstName && `, ${firstName}`} 👋
                </div>
                <div className="text-xs text-slate-500">{formatToday()}</div>
            </div>

            <div className="relative flex items-center gap-1" ref={wrapperRef}>
                {searchOpen && (
                    <form onSubmit={submitSearch} className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 shadow-sm">
                        <Search size={16} className="text-slate-500" />
                        <input
                            ref={searchInputRef}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search transactions..."
                            className="w-64 bg-transparent focus:outline-none text-sm text-slate-900"
                        />
                        <button
                            type="button"
                            onClick={() => {
                                setSearchOpen(false);
                                setSearchTerm('');
                            }}
                            className="rounded-full p-1 text-slate-500 hover:bg-slate-200"
                            aria-label="Close search"
                        >
                            <X size={16} />
                        </button>
                    </form>
                )}

                <button
                    title="Search"
                    onClick={() => {
                        setSearchOpen((open) => !open);
                        setNotificationsOpen(false);
                    }}
                    className="h-9 w-9 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900 flex items-center justify-center transition"
                >
                    <Search size={17} />
                </button>
                <button
                    title="Notifications"
                    onClick={() => {
                        setNotificationsOpen((open) => !open);
                        setSearchOpen(false);
                        if (!notificationsOpen) {
                            fetchNotifications();
                            setNotificationsSeen(true);
                        }
                    }}
                    className="relative h-9 w-9 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900 flex items-center justify-center transition"
                >
                    <Bell size={17} />
                    {notifications.length > 0 && !notificationsSeen && (
                        <span className="absolute top-2 right-2 h-2 w-2 bg-rose-500 rounded-full ring-2 ring-white" />
                    )}
                </button>

                {notificationsOpen && (
                    <div className="absolute right-0 top-full z-20 mt-2 w-80 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
                        <div className="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900">
                            Notifications
                        </div>
                        <div className="max-h-72 overflow-y-auto">
                            {notificationsLoading ? (
                                <div className="px-4 py-6 text-sm text-slate-500">Loading notifications…</div>
                            ) : notifications.length > 0 ? (
                                <div className="divide-y divide-slate-100">
                                    {notifications.map((notification) => (
                                        <div key={notification.id} className="px-4 py-3 hover:bg-slate-50">
                                            <div className="text-sm font-semibold text-slate-900">{notification.title}</div>
                                            <div className="text-xs text-slate-500 mt-1">{notification.message}</div>
                                            <div className="text-[11px] text-slate-400 mt-2">{notification.timestamp}</div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="px-4 py-6 text-sm text-slate-500">
                                    You have no notifications right now.
                                    Add transactions and budgets to see alerts here.
                                </div>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={() => setNotificationsOpen(false)}
                            className="w-full border-t border-slate-200 px-4 py-3 text-left text-sm text-slate-600 hover:bg-slate-50"
                        >
                            Close
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
};                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          

export default Topbar;
