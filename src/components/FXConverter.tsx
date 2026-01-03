import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRightLeft, RefreshCw, TrendingUp, DollarSign, Loader2 } from 'lucide-react';
import './FXConverter.css';

interface Rates {
    [key: string]: number;
}

const SUPPORTED_CURRENCIES = [
    { code: 'USD', flag: '🇺🇸', name: 'US Dollar' },
    { code: 'GBP', flag: '🇬🇧', name: 'British Pound' },
    { code: 'EUR', flag: '🇪🇺', name: 'Euro' },
    { code: 'CAD', flag: '🇨🇦', name: 'Canadian Dollar' },
    { code: 'NGN', flag: '🇳🇬', name: 'Nigerian Naira' },
];

export const FXConverter: React.FC = () => {
    const [amount, setAmount] = useState<string>('1');
    const [fromCurrency, setFromCurrency] = useState('USD');
    const [toCurrency, setToCurrency] = useState('NGN');
    const [rates, setRates] = useState<Rates>({});
    const [loading, setLoading] = useState(true);

    // Converter logic using the rates
    const convertedAmount = (() => {
        if (!rates[fromCurrency] || !rates[toCurrency]) return 0;
        const value = parseFloat(amount.replace(/,/g, ''));
        if (isNaN(value)) return 0;

        // Base is USD in the API we are using
        // If From is USD, just multiply by To Rate
        // If From is Not USD, Convert to USD first ( / FromRate), then to Target (* ToRate)
        const inUSD = value / rates[fromCurrency];
        return inUSD * rates[toCurrency];
    })();

    const fetchRates = async () => {
        setLoading(true);
        try {
            // Fetch rates and wait at least 800ms to show the beautiful spin animation
            const [data] = await Promise.all([
                fetch('https://api.exchangerate-api.com/v4/latest/USD').then(res => res.json()),
                new Promise(resolve => setTimeout(resolve, 800))
            ]);
            setRates(data.rates);
        } catch (error) {
            console.error("Failed to fetch rates", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRates();
    }, []);

    const handleSwap = () => {
        setFromCurrency(toCurrency);
        setToCurrency(fromCurrency);
    };

    const formatCurrency = (val: number, currency: string) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: currency,
            maximumFractionDigits: 2
        }).format(val);
    };

    return (
        <div className="fx-container">
            <div className="fx-header">
                <h2 className="section-title">Global Markets</h2>
                <h1 className="display-title" style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    FX Currency Converter
                </h1>
                <p className="subtitle" style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>Real-time exchange rates for major currencies.</p>
            </div>

            <div className="fx-grid">
                {/* Converter Card */}
                <motion.div
                    className="converter-card"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <div className="card-header">
                        <h3>Quick Convert</h3>
                        {loading && <Loader2 className="animate-spin text-primary" size={20} />}
                    </div>

                    <div className="space-y-4">
                        <div className="input-group">
                            <label>Amount</label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="amount-input"
                            />
                        </div>

                        <div className="currency-row">
                            <div className="currency-select-group">
                                <label>From</label>
                                <select
                                    value={fromCurrency}
                                    onChange={(e) => setFromCurrency(e.target.value)}
                                    className="currency-select"
                                >
                                    {SUPPORTED_CURRENCIES.map(c => (
                                        <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                                    ))}
                                </select>
                            </div>

                            <button
                                onClick={handleSwap}
                                className="swap-btn"
                                title="Swap Currencies"
                            >
                                <ArrowRightLeft size={20} />
                            </button>

                            <div className="currency-select-group">
                                <label>To</label>
                                <select
                                    value={toCurrency}
                                    onChange={(e) => setToCurrency(e.target.value)}
                                    className="currency-select"
                                >
                                    {SUPPORTED_CURRENCIES.map(c => (
                                        <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="result-box">
                            <p className="result-label">
                                {amount} {fromCurrency} =
                            </p>
                            <h2 className="result-value">
                                {formatCurrency(convertedAmount, toCurrency)}
                            </h2>
                        </div>
                    </div>
                </motion.div>

                {/* Live Rates Card */}
                <motion.div
                    className="rates-card"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="rates-header">
                        <h3 style={{ margin: 0, fontWeight: 700, color: '#334155' }}>Live Rates (vs NGN)</h3>
                        <button onClick={fetchRates} className="refresh-btn" disabled={loading}>
                            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                            {loading ? 'Refreshing...' : 'Refresh'}
                        </button>
                    </div>

                    <div className="rates-list">
                        {['USD', 'GBP', 'EUR', 'CAD'].map(currency => {
                            if (!rates['NGN'] || !rates[currency]) return null;
                            const rateToNaira = rates['NGN'] / rates[currency];

                            return (
                                <div key={currency} className="rate-item">
                                    <div className="currency-info">
                                        <span className="flag">{SUPPORTED_CURRENCIES.find(c => c.code === currency)?.flag}</span>
                                        <div className="code-name">
                                            <span className="currency-code">{currency}</span>
                                            <span className="currency-name">1 {currency}</span>
                                        </div>
                                    </div>
                                    <div className="rate-value-box">
                                        <div className="rate-amt">
                                            ₦{rateToNaira.toFixed(2)}
                                        </div>
                                        <div className="live-indicator">
                                            Live <TrendingUp size={10} />
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    <div className="disclaimer-box">
                        <DollarSign className="shrink-0" size={18} />
                        <p>Rates are based on official interbank data. P2P/Parallel market rates may be significantly higher.</p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
