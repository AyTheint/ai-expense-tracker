import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

if (!process.env.GEMINI_API_KEY) {
    console.warn("Warning: GEMINI_API_KEY is not set. AI features will not work");
}

const MODELS = ['gemini-2-flash', 'gemini-2-flash-lite', 'gemini-2.5-flash-lite', 'gemini-2.5-flash', 'gemini-3-flash', 'gemini-3.1-flash-lite', 'gemini-3.5-flash'];

const generateWithFallback = async (prompt) => {
    let lastErr;
    for (const model of MODELS) {
        try {
            return await withRetry(() => ai.models.generateContent({ model, contents: prompt }));
        } catch (err) {
            lastErr = err;
            const status = err?.status || err?.error?.code;
            if (status !== 503 && status !== 429) throw err; // not a capacity issue, don't bother falling back
            console.warn(`Model ${model} unavailable, trying next fallback...`);
        }
    }
    throw lastErr;
};

const withRetry = async (fn, { retries = 3, baseDelay = 1000 } = {}) => {
    let lastErr;
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            return await fn();
        } catch (err) {
            lastErr = err;
            const status = err?.status || err?.error?.code;
            const isRetryable = status === 503 || status === 429;
            if (!isRetryable || attempt === retries) throw err;
            const delay = baseDelay * Math.pow(2, attempt); // 1s, 2s, 4s
            console.warn(`Gemini ${status} — retrying in ${delay}ms (attempt ${attempt + 1}/${retries})`);
            await new Promise((res) => setTimeout(res, delay));
        }
    }
    throw lastErr;
};

const stripMarkdown = (text) => {
    let cleaned = text.trim();
    if(cleaned.startsWith('```json')){
        cleaned = cleaned.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
    } else if(cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/```\n?/g, '');
    }
    return cleaned.trim();
}

// const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

// const toNumber = (value) => Number(value) || 0;

// const buildMonthlyFallback = ({
//     totalIncome,
//     totalExpenses,
//     savingsRate,
//     expenseBreakdown,
//     currency,
// }) => {
//     const topCategory = expenseBreakdown[0]?.category || null;
//     const savingsGap = Math.max(0, totalIncome - totalExpenses);
//     const healthScore = clamp(
//         Math.round(50 + savingsRate * 0.5 - (totalExpenses > totalIncome ? 10 : 0)),
//         0,
//         100
//     );

//     const summary = totalIncome > 0
//         ? `You brought in ${currency} ${totalIncome.toFixed(2)} and spent ${currency} ${totalExpenses.toFixed(2)} this month. ${savingsRate >= 0 ? 'You stayed within your income.' : 'Your expenses are currently above your income, so this month needs attention.'}`
//         : `There is no reported income for this month, so the main focus is controlling spending and adding income data for a fuller picture.`;

//     const highlights = totalIncome > 0
//         ? [
//             `You kept ${currency} ${savingsGap.toFixed(2)} in the month as a buffer.`,
//             topCategory ? `${topCategory} is your largest spending category, so you have a clear place to optimize.` : 'Your spending data is simple enough to review quickly.',
//         ]
//         : ['You have enough expense data to spot spending patterns.', 'Adding income transactions will make the analysis more accurate.'];

//     const concerns = totalIncome > 0
//         ? [
//             totalExpenses > totalIncome
//                 ? 'Your spending is higher than your income, which can create cash flow pressure.'
//                 : 'A large share of your income is going toward expenses, so savings may be tighter than ideal.',
//             topCategory ? `Keep an eye on ${topCategory}; it is currently the biggest driver of your total spend.` : 'There is not enough category detail to identify the biggest pressure point.',
//         ]
//         : ['Without income data, it is hard to judge whether your spending is sustainable.', 'Tracking income will help the score reflect your real financial health.'];

//     const recommendations = [
//         {
//             title: topCategory ? `Trim ${topCategory}` : 'Review top spending',
//             detail: topCategory
//                 ? `Set a target to reduce ${topCategory} by about 10% next month and recheck the impact on your savings.`
//                 : 'Review your highest expense categories and look for one recurring cost to reduce.',
//         },
//         {
//             title: 'Set a weekly limit',
//             detail: 'Split your monthly budget into a weekly spending cap so overruns show up earlier and are easier to correct.',
//         },
//         {
//             title: 'Automate a transfer',
//             detail: savingsGap > 0
//                 ? `Move about ${currency} ${(savingsGap * 0.25).toFixed(2)} into savings automatically each month.`
//                 : 'Even a small automatic transfer can build a buffer and improve consistency over time.',
//         },
//     ];

//     return {
//         summary,
//         highlights,
//         concerns,
//         recommendations,
//         topSpendingCategory: topCategory,
//         estimatedMonthlySavings: Number((savingsGap * 0.1).toFixed(2)),
//         healthScore,
//     };
// };

// const buildSavingTipsFallback = ({ topCategories, monthlyIncome, currency }) => {
//     const categories = topCategories.slice(0, 4);
//     const tips = categories.map((item, index) => {
//         const savings = Math.max(5, Math.round(toNumber(item.amount) * 0.1));
//         return {
//             category: item.category,
//             title: `Reduce ${item.category} by 10%`,
//             detail: `Try one small change in ${item.category.toLowerCase()} spending and aim to save about ${currency} ${savings} this month.`,
//             estimatedSavings: savings,
//         };
//     });

//     while (tips.length < 4) {
//         const fallbackNumber = tips.length + 1;
//         tips.push({
//             category: 'General',
//             title: `Build a ${fallbackNumber * 5}% buffer`,
//             detail: monthlyIncome > 0
//                 ? `Redirect a small portion of your ${currency} ${monthlyIncome.toFixed(2)} monthly income into savings before spending it.`
//                 : 'Start with a fixed small transfer and increase it once income is tracked consistently.',
//             estimatedSavings: Math.max(10, Math.round(monthlyIncome * 0.05) || 10),
//         });
//     }

//     return {
//         overallTip: topCategories.length > 0
//             ? `Focus on the categories that make up most of your spending first. Even a small cut can create meaningful monthly savings.`
//             : 'Track a few more transactions so the app can identify the most useful savings opportunities.',
//         tips,
//     };
// };

// const buildBudgetAlertFallback = ({ categoryName, budgetAmount, spentAmount, daysIntoPeriod, totalPeriodDays, currency }) => {
//     const percentUsed = budgetAmount > 0 ? (spentAmount / budgetAmount) * 100 : 0;
//     const remaining = Math.max(0, budgetAmount - spentAmount);
//     const severity = percentUsed >= 100 ? 'critical' : percentUsed >= 70 ? 'warning' : 'info';

//     return {
//         severity,
//         title: `${categoryName} budget update`,
//         message: `You have spent ${currency} ${spentAmount.toFixed(2)} of your ${currency} ${budgetAmount.toFixed(2)} ${categoryName.toLowerCase()} budget after ${daysIntoPeriod} of ${totalPeriodDays} days. ${remaining > 0 ? `You still have ${currency} ${remaining.toFixed(2)} left.` : 'You are already over budget.'}`,
//         suggestions: [
//             'Pause any non-essential purchases in this category for a few days.',
//             'Review recent transactions to spot avoidable repeats.',
//             'Move leftover budget from lower-priority categories if needed.',
//         ],
//     };
// };

export const generateMonthlyInsights = async ({
    totalIncome,
    totalExpenses,
    savingsRate,
    expenseBreakdown,
    previousMonths,
    currency = 'USD'
}) => {
    const breakdownText = expenseBreakdown.length > 0
        ? expenseBreakdown.map(c => `- ${c.category}: ${currency} ${c.amount.toFixed(2)}`).join('\n')
        : '- No expenses recorded yet';

    const trendsText = previousMonths.length > 0
        ? previousMonths.map(m => `- ${m.month}: Income ${currency} ${m.income.toFixed(2)}, Expenses ${currency} ${m.expense.toFixed(2)}`).join('\n')
        : '- No previous month data available';

    const prompt = `Analyze this user's monthly financial data and generate accurate insights

    Currency: ${currency}
    Total Income: ${currency} ${totalIncome.toFixed(2)}
    Total Expenses: ${currency} ${totalExpenses.toFixed(2)}
    Savings Rate: ${(savingsRate.toFixed(1))}%

    Expense Breakdown By category (this month): ${breakdownText}

    Previous months trend: ${trendsText}

    Return only valid JSON (no markdown, no commentary) in this exact structure:
    {
        "summary": "2-3 sentences summary of the user's financial health this month",
        "highlights": ["Positive observation 1", "Positive observation 2"],
        "concerns": ["Concern 1", "Concern 2"],
        "recommendations": [
            {"title": "Short title", "detail": "Actionable suggestion (1-2 senetnces)"}
        ],
        "topSpendingCategory": "Category name or null",  
        "estimatedMonthlySavings": number,
        "healthScore": number
    }

    Constraints:
    - "healthScore" must be an integer between 0 and 100.
    - Provide 3 recommendations.
    - Reference actual numbers from the data. Tone: friendly but honest.`;

    try {
        const response = await generateWithFallback(prompt);
        const cleaned = stripMarkdown(response.text);
        return JSON.parse(cleaned);
    } catch (err) {
        console.error("Error generating insights:", err);
         throw new Error("Failed to generate monthly insights. PLease try again.");
        // return buildMonthlyFallback({
        //     totalIncome,
        //     totalExpenses,
        //     savingsRate,
        //     expenseBreakdown,
        //     currency,
        // });
    }
};

export const generateBudgetAlert = async ({
    categoryName,
    budgetAmount,
    spentAmount,
    daysIntoPeriod,
    totalPeriodDays,
    currency = 'USD'
}) => {
    const percentUsed = ((spentAmount / budgetAmount) * 100).toFixed(1);
    const daysLeft = totalPeriodDays - daysIntoPeriod;

    const prompt = `A user is tracking a budget. Generate a helpful alert.
    Category: ${categoryName}
    Budget: ${currency} ${budgetAmount.toFixed(2)}
    Spent so far: ${currency} ${spentAmount.toFixed(2)} (${percentUsed}% used)
    Days into period: ${daysIntoPeriod} / ${totalPeriodDays} (${daysLeft} days remaining)
    
    Return only valid JSON (no markdown):
    {
        "severity": "info|warning|critical",
        "title": "Short alert title",
        "message": "1-2 sentences empathetic message referencing actual numbers",
        "suggestions": ["Specific action 1", "Specific action 2", "Specific action 3"]
    
    }

    Servity guide:
    - info: under 70% spent
    - warning: 70-100% spent
    - critical: over 100% spent`

    try {
        const response = await generateWithFallback(prompt);
        const cleaned = stripMarkdown(response.text);
        return JSON.parse(cleaned);
    } catch (err) {
        console.error("Error generating budget alert:", err);
        throw new Error("Failed to generate budget alert. Please try again.");
        // return buildBudgetAlertFallback({
        //     categoryName,
        //     budgetAmount,
        //     spentAmount,
        //     daysIntoPeriod,
        //     totalPeriodDays,
        //     currency,
        // });
    }
}

export const generateSavingTips = async ({ topCategories, monthlyIncome, currency = 'USD' }) => {
    const categoryText = topCategories.length > 0 ?
    topCategories.map(c => `- ${c.category}: ${currency} ${c.amount.toFixed(2)} across ${c.transactionCount}`)
    : '- No spending data available'

    const prompt = `Generate personalized savings tips for a user.
    
    Monthly income (last 30 days): ${currency} ${monthlyIncome.toFixed(2)}
    Top spending categories (last 30 days):
    ${categoryText}

    Return ONLY valid JSON (no markdown):
    {
        "overallTip": "Top-level 1-sentence advice",
        "tips": [
            {
                "category": "Category this targets",
                "title": "short tip title",
                "detail": "2-3 sentence actionable suggestion",
                "estimateedSavings": number
            }
        ]
    }

    Provide exactly 4 tips. Each tip should reference an actual category from the data and include a realistic monthly savings estimated amount
    `

    try{
        const response = await generateWithFallback(prompt);
        const cleaned = stripMarkdown(response.text);
        return JSON.parse(cleaned);
    } catch (err) {
        console.error('Gemini API error (saving tips): ', err);
        throw new Error('Failed to generate saving tips.')
        // return buildSavingTipsFallback({
        //     topCategories,
        //     monthlyIncome,
        //     currency,
        // });
    }
};


export const analyzeTransactionList = async ({ transactions, currency = 'USD'}) => {
    const formatDate = (d) => {
        if (!d) return '';
        if (d instanceof Date) {
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${y}-${m}-${day}`
        }
        return String(d).split('T')[0];
    };

    const lines = transactions.slice(0, 50).map((t) => {
        const date = formatDate(t.transaction_date);
        const amt = parseFloat(t.amount).toFixed(2);
        const cat = t.category_name || 'uncategorized';
        const desc = t.description ? ` | ${t.description}` : '';
        return `- ${date}: ${t.type} ${currency} ${amt} | ${cat}${desc}`
    }).join('\n');

    const prompt = `Analyze these ${transactions.length} transactions and provide a concise, helpful spending insight. Focus 
    Transactions:  ${lines}

    Return ONLY valid JSON (no markdown): {
        "insight": "2-4 sentence analysis with specific numbers from the data. Tone: friendly, helpful.",
        "highlight": "Single short phrase capturing the key takeaway (e.g., 'Heavy on dining', 'Stable income')"
    }`;

    try {
        const response = await generateWithFallback(prompt);
        const cleaned = stripMarkdown(response.text);
        return JSON.parse(cleaned);
    } catch (err) {
        console.error('Gemini API error (analyze transactions): ', err);
        throw new Error('Failed to analyze transactions.');
    }
};

export const analyzeBudgetList = async ({ budgets, currency = 'USD' }) => {
    const lines = budgets.map((b) => {
        const spent = Number(b.spent) || 0;
        const total = Number(b.amount) || 0;
        const pct = total > 0 ? ((spent / total) * 100).toFixed(1) : '0';
        return `Budget ID ${b.id} | Category: ${b.category_name} | Limit: ${currency} ${total.toFixed(2)} | Spent: ${currency} ${spent.toFixed(2)}`
    }).join('\n');

    const prompt = `You're a personal finance assistant. Analyze each budget below and provide a one-sentence verdict on how well the user is managing their finances, highlighting their biggest strength and biggest risk.
    Today: ${new Date().toISOString().split('T')[0]}
    Budgets: ${lines}
    For each budget, return:
    - status: 'good' (well-paced, under target), 'caution' (approaching limit or above 70%), or 'concerning' (over budget or above 90%)
    - message: A specific, friendly 1-sentence assessment with actionable feedback or encouragement

    Return ONLY valid JSON (no markdown):
    {
        "analyses": [
            {"budgetId": number, "status": "good"|"caution"|"concerning", "message": "string" }
        ]
    }`;

    try {
        const response = await generateWithFallback(prompt);
        const cleaned = stripMarkdown(response.text);
        return JSON.parse(cleaned);
    } catch (err) {
        console.error('Gemini API error (analyze budgets): ', err);
        throw new Error('Failed to analyze budgets.');
    }
}

export default {
    generateMonthlyInsights,
    generateBudgetAlert,
    generateSavingTips,
    analyzeTransactionList,
    analyzeBudgetList
};