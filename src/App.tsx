import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calculator,
  Wallet,
  TrendingUp,
  Home,
  ShieldCheck,
  Download,
  Share2,
  Info,
  Mail,
  MessageCircle,
  ArrowLeft
} from 'lucide-react';
import { calculateTax } from './utils/taxCalculator';
import type { TaxInputs } from './utils/taxCalculator';
import { Tooltip } from './components/Tooltip';
import { FXConverter } from './components/FXConverter';
import { DisclaimerModal } from './components/DisclaimerModal';
import './App.css';

const initialInputs: TaxInputs = {
  residency: 'resident',
  annualGrossSalary: 0,
  investingIncome: {
    dividends: 0,
    interest: 0,
    royalties: 0,
  },
  chargeableGains: {
    digitalAssetGains: 0,
    digitalAssetLosses: 0,
    otherAssetGains: 0,
  },
  employerBenefits: {
    housingProvided: false,
    housingRentalValue: 0,
    carProvided: false,
    carAcquisitionCost: 0,
  },
  reliefs: {
    annualPension: 0,
    annualNHF: 0,
    annualNHIS: 0,
    annualRentPaid: 0,
    lifeAssurancePremiums: 0,
    mortgageInterest: 0,
  },
};

function App() {
  const [inputs, setInputs] = useState<TaxInputs>(initialInputs);
  const [activeTab, setActiveTab] = useState<'income' | 'benefits' | 'reliefs'>('income');
  const [currentPage, setCurrentPage] = useState<'calculator' | 'bands' | 'guidelines' | 'fx-rates'>('calculator');
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(true);

  const taxResult = useMemo(() => calculateTax(inputs), [inputs]);

  const scrollToId = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const handleInputChange = (path: string, value: any) => {
    const keys = path.split('.');
    setInputs(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      let current = next;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatInputNumber = (val: number) => {
    if (!val && val !== 0) return '';
    return new Intl.NumberFormat('en-US').format(val);
  };

  const handleNumericChange = (path: string, val: string) => {
    const numericValue = parseFloat(val.replace(/,/g, '')) || 0;
    handleInputChange(path, numericValue);
  };

  const handleExportPDF = () => {
    document.body.setAttribute('data-date', new Date().toLocaleDateString('en-NG', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }));
    window.print();
  };

  const getShareMessage = () => {
    return `NaijaReceipt Personal Tax Estimation 2025:%0A%0A` +
      `💰 Gross Annual Income: ${formatCurrency(taxResult.totalGrossIncome)}%0A` +
      `💸 Total Tax Due: ${formatCurrency(taxResult.totalTaxDue)}%0A` +
      `🏦 Monthly Take-Home: ${formatCurrency(taxResult.monthlyTakeHomePay)}%0A%0A` +
      `Calculate your accurate 2025 tax at: ${window.location.href}`;
  };

  const shareViaWhatsApp = () => {
    const url = `https://wa.me/?text=${getShareMessage()}`;
    window.open(url, '_blank');
    setIsShareMenuOpen(false);
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent("My 2025 Nigeria Tax Estimation");
    const body = getShareMessage();
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    setIsShareMenuOpen(false);
  };

  return (
    <div className="app-container">
      <DisclaimerModal isOpen={showDisclaimer} onClose={() => setShowDisclaimer(false)} />
      <header className="main-header">
        <div className="header-content glass container">
          <div className="logo">
            <Calculator className="logo-icon" size={32} />
            <div>
              <h1>NaijaReceipt Personal Tax Estimator <span className="badge">2025</span></h1>
              <p>Compliant with Nigeria Tax Act (NTA) 2025</p>
            </div>
          </div>
          <nav>
            <a href="https://www.naijareceipt.com.ng/dashboard" className="nav-btn back-link">
              <ArrowLeft size={18} /> <span className="back-text">Dashboard</span>
            </a>
            <button
              className={`nav-btn ${currentPage === 'calculator' ? 'active' : ''}`}
              onClick={() => setCurrentPage('calculator')}
            >
              Calculator
            </button>
            <button
              className={`nav-btn ${currentPage === 'bands' ? 'active' : ''}`}
              onClick={() => setCurrentPage('bands')}
            >
              Tax Bands
            </button>
            <button
              className={`nav-btn ${currentPage === 'guidelines' ? 'active' : ''}`}
              onClick={() => setCurrentPage('guidelines')}
            >
              Guidelines
            </button>
            <button
              className={`nav-btn ${currentPage === 'fx-rates' ? 'active' : ''}`}
              onClick={() => setCurrentPage('fx-rates')}
            >
              FX Rates
            </button>
          </nav>
        </div>
      </header>

      <main className="main-content">
        <AnimatePresence mode="wait">
          {currentPage === 'calculator' ? (
            <motion.div
              key="calculator"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid-layout container"
            >
              {/* Form Side */}
              <section className="input-section glass p-8">
                <div className="tabs">
                  <button
                    className={`tab-btn ${activeTab === 'income' ? 'active' : ''}`}
                    onClick={() => setActiveTab('income')}
                  >
                    <Wallet size={18} /> Income
                  </button>
                  <button
                    className={`tab-btn ${activeTab === 'benefits' ? 'active' : ''}`}
                    onClick={() => setActiveTab('benefits')}
                  >
                    <Home size={18} /> Benefits
                  </button>
                  <button
                    className={`tab-btn ${activeTab === 'reliefs' ? 'active' : ''}`}
                    onClick={() => setActiveTab('reliefs')}
                  >
                    <ShieldCheck size={18} /> Reliefs
                  </button>
                </div>

                <div className="tab-content">
                  <AnimatePresence mode="wait">
                    {activeTab === 'income' && (
                      <motion.div
                        key="income"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="form-group-stack"
                      >
                        <div className="field-group">
                          <label>Residency Status
                            <Tooltip content="Resident: Taxed on worldwide income. Non-Resident: Taxed only on Nigerian source income." />
                          </label>
                          <select
                            value={inputs.residency}
                            onChange={(e) => handleInputChange('residency', e.target.value)}
                          >
                            <option value="resident">Resident Individual</option>
                            <option value="non-resident">Non-Resident Individual</option>
                          </select>
                        </div>

                        <div className="field-group">
                          <label>Annual Gross Salary/Wages (₦)
                            <Tooltip content="Include all basic pay, allowances, bonuses, and commissions." />
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. 5,000,000"
                            value={formatInputNumber(inputs.annualGrossSalary)}
                            onChange={(e) => handleNumericChange('annualGrossSalary', e.target.value)}
                          />
                        </div>

                        <div className="sub-section">
                          <h4 className="section-title">Investment Income</h4>
                          <div className="field-grid">
                            <div className="field-group">
                              <label>Dividends (₦)</label>
                              <input
                                type="text"
                                value={formatInputNumber(inputs.investingIncome.dividends)}
                                onChange={(e) => handleNumericChange('investingIncome.dividends', e.target.value)}
                              />
                            </div>
                            <div className="field-group">
                              <label>Interest (₦)</label>
                              <input
                                type="text"
                                value={formatInputNumber(inputs.investingIncome.interest)}
                                onChange={(e) => handleNumericChange('investingIncome.interest', e.target.value)}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="sub-section">
                          <h4 className="section-title">Chargeable Gains (NTA 2025)</h4>
                          <div className="field-group">
                            <label>Digital Asset Gains (₦)
                              <Tooltip content="Profits from transactions in digital/virtual assets (e.g. Crypto, NFTs)." />
                            </label>
                            <input
                              type="text"
                              value={formatInputNumber(inputs.chargeableGains.digitalAssetGains)}
                              onChange={(e) => handleNumericChange('chargeableGains.digitalAssetGains', e.target.value)}
                            />
                          </div>
                          <div className="field-group">
                            <label>Digital Asset Losses (₦)
                              <Tooltip content="Losses from digital assets can ONLY be offset against digital asset gains." />
                            </label>
                            <input
                              type="text"
                              value={formatInputNumber(inputs.chargeableGains.digitalAssetLosses)}
                              onChange={(e) => handleNumericChange('chargeableGains.digitalAssetLosses', e.target.value)}
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {activeTab === 'benefits' && (
                      <motion.div
                        key="benefits"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="form-group-stack"
                      >
                        <div className="toggle-field">
                          <div className="toggle-label-desc">
                            <label>Housing Provided?</label>
                            <p>Does your employer provide accommodation?</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={inputs.employerBenefits.housingProvided}
                            onChange={(e) => handleInputChange('employerBenefits.housingProvided', e.target.checked)}
                          />
                        </div>
                        {inputs.employerBenefits.housingProvided && (
                          <div className="field-group">
                            <label>Annual Rental Value (₦)
                              <Tooltip content="The benefit is the annual rental value, capped at 20% of your annual gross income." />
                            </label>
                            <input
                              type="text"
                              value={formatInputNumber(inputs.employerBenefits.housingRentalValue)}
                              onChange={(e) => handleNumericChange('employerBenefits.housingRentalValue', e.target.value)}
                            />
                          </div>
                        )}

                        <div className="toggle-field">
                          <div className="toggle-label-desc">
                            <label>Car Provided?</label>
                            <p>Does your employer provide an official car?</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={inputs.employerBenefits.carProvided}
                            onChange={(e) => handleInputChange('employerBenefits.carProvided', e.target.checked)}
                          />
                        </div>
                        {inputs.employerBenefits.carProvided && (
                          <div className="field-group">
                            <label>Car Acquisition Cost (₦)
                              <Tooltip content="The annual benefit is 5% of the acquisition cost or market value of the asset." />
                            </label>
                            <input
                              type="text"
                              value={formatInputNumber(inputs.employerBenefits.carAcquisitionCost)}
                              onChange={(e) => handleNumericChange('employerBenefits.carAcquisitionCost', e.target.value)}
                            />
                          </div>
                        )}
                      </motion.div>
                    )}

                    {activeTab === 'reliefs' && (
                      <motion.div
                        key="reliefs"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="form-group-stack"
                      >
                        <div className="field-group">
                          <label>Annual Rent Paid (₦)
                            <Tooltip content="Relief is 20% of annual rent paid, subject to a maximum of ₦500,000." />
                          </label>
                          <input
                            type="text"
                            value={formatInputNumber(inputs.reliefs.annualRentPaid)}
                            onChange={(e) => handleNumericChange('reliefs.annualRentPaid', e.target.value)}
                          />
                        </div>

                        <div className="field-grid">
                          <div className="field-group">
                            <label>Pension / NHF / NHIS (₦)
                              <Tooltip content="Total annual contributions to Pension Reform Act, National Housing Fund, and National Health Insurance." />
                            </label>
                            <input
                              type="text"
                              placeholder="Sum of contributions"
                              value={formatInputNumber(inputs.reliefs.annualPension)}
                              onChange={(e) => handleNumericChange('reliefs.annualPension', e.target.value)}
                            />
                          </div>
                          <div className="field-group">
                            <label>Life Assurance (₦)
                              <Tooltip content="Total annual premiums paid on life of the individual or spouse." />
                            </label>
                            <input
                              type="text"
                              value={formatInputNumber(inputs.reliefs.lifeAssurancePremiums)}
                              onChange={(e) => handleNumericChange('reliefs.lifeAssurancePremiums', e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="field-group">
                          <label>Mortgage Interest (₦)
                            <Tooltip content="Interest on loans for an owner-occupied residential house." />
                          </label>
                          <input
                            type="text"
                            value={formatInputNumber(inputs.reliefs.mortgageInterest)}
                            onChange={(e) => handleNumericChange('reliefs.mortgageInterest', e.target.value)}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </section>

              {/* Results Side */}
              <section className="results-section">
                <div className="summary-card glass p-8">
                  <h2 className="section-title">Tax Estimation Summary</h2>

                  <div className="hero-stats">
                    <div className="main-stat">
                      <p className="label">Take-Home Pay (Monthly)</p>
                      <h3>{formatCurrency(taxResult.monthlyTakeHomePay)}</h3>
                    </div>
                    <div className="main-stat border-left">
                      <p className="label">Total Tax Due (Annual)</p>
                      <h3 className="text-primary">{formatCurrency(taxResult.totalTaxDue)}</h3>
                    </div>
                  </div>

                  <div className="stats-list">
                    <div className="stat-item">
                      <span>Total Gross Income</span>
                      <span className="value">{formatCurrency(taxResult.totalGrossIncome)}</span>
                    </div>
                    <div className="stat-item">
                      <span>Benefits-in-Kind</span>
                      <span className="value">+ {formatCurrency(taxResult.bikAdjustments)}</span>
                    </div>
                    <div className="stat-item">
                      <span>Exemptions & Reliefs</span>
                      <span className="value text-success">- {formatCurrency(taxResult.totalExemptionsAndDeductions)}</span>
                    </div>
                    <hr className="divider" />
                    <div className="stat-item highlight">
                      <span>Net Chargeable Income</span>
                      <span className="value">{formatCurrency(taxResult.netChargeableIncome)}</span>
                    </div>
                  </div>

                  {taxResult.isExempt && (
                    <div className="exempt-badge">
                      <TrendingUp size={16} /> Fully Exempt (Below ₦800,000 threshold)
                    </div>
                  )}
                </div>

                <div className="breakdown-card glass mt-6 p-8">
                  <h2 className="section-title">Tax Bracket Breakdown</h2>
                  <div className="breakdown-table">
                    {taxResult.breakdown.length > 0 ? (
                      taxResult.breakdown.map((item, idx) => (
                        <div key={idx} className="breakdown-row">
                          <div className="bracket-info">
                            <span className="bracket-name">{item.bracket}</span>
                            <span className="bracket-rate">{item.rate}%</span>
                          </div>
                          <div className="bracket-stats">
                            <div className="progress-bar">
                              <motion.div
                                className="progress-fill"
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(100, (item.taxDue / (taxResult.totalTaxDue || 1)) * 300)}%` }}
                              />
                            </div>
                            <span className="bracket-value">{formatCurrency(item.taxDue)}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="no-tax">No tax due based on current inputs.</p>
                    )}
                  </div>
                </div>

                <div className="actions share-actions-container">
                  <div className="share-menu-wrapper">
                    <button
                      className="btn-secondary"
                      onClick={() => setIsShareMenuOpen(!isShareMenuOpen)}
                    >
                      <Share2 size={18} /> Share Estimate
                    </button>

                    <AnimatePresence>
                      {isShareMenuOpen && (
                        <motion.div
                          className="share-dropdown glass"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                        >
                          <button onClick={shareViaWhatsApp} className="share-option">
                            <MessageCircle size={18} /> WhatsApp
                          </button>
                          <button onClick={shareViaEmail} className="share-option">
                            <Mail size={18} /> Email
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <button className="btn-primary" onClick={handleExportPDF}><Download size={18} /> Export PDF</button>
                </div>
              </section>
            </motion.div>
          ) : currentPage === 'bands' ? (
            <motion.div
              key="bands"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="page-view bands-page"
            >
              <div className="glass container p-12">
                <h2 className="section-title">Official Tax Bands 2025</h2>
                <h1 className="display-title">Graduated Tax Rates (NTA 2025)</h1>
                <p className="subtitle">Under the Nigeria Tax Act 2025, personal income is taxed according to the following progressive bands:</p>

                <div className="bands-grid mt-6">
                  <div className="band-card">
                    <div className="band-rate highlight">0%</div>
                    <div className="band-details">
                      <h3>First ₦800,000</h3>
                      <p>Tax-Exempt Threshold (Minimum baseline)</p>
                    </div>
                  </div>
                  <div className="band-card">
                    <div className="band-rate">15%</div>
                    <div className="band-details">
                      <h3>Next ₦2,200,000</h3>
                      <p>Income from ₦800,001 to ₦3,000,000</p>
                    </div>
                  </div>
                  <div className="band-card">
                    <div className="band-rate">18%</div>
                    <div className="band-details">
                      <h3>Next ₦9,000,000</h3>
                      <p>Income from ₦3,000,001 to ₦12,000,000</p>
                    </div>
                  </div>
                  <div className="band-card">
                    <div className="band-rate">21%</div>
                    <div className="band-details">
                      <h3>Next ₦13,000,000</h3>
                      <p>Income from ₦12,000,001 to ₦25,000,000</p>
                    </div>
                  </div>
                  <div className="band-card">
                    <div className="band-rate">23%</div>
                    <div className="band-details">
                      <h3>Next ₦25,000,000</h3>
                      <p>Income from ₦25,000,001 to ₦50,000,000</p>
                    </div>
                  </div>
                  <div className="band-card highlight">
                    <div className="band-rate">25%</div>
                    <div className="band-details">
                      <h3>Above ₦50,000,000</h3>
                      <p>All income exceeding ₦50M</p>
                    </div>
                  </div>
                </div>

                <div className="note-card mt-12">
                  <Info className="info-icon" size={24} />
                  <div>
                    <h4>Important Note</h4>
                    <p>These rates apply to your <strong>Net Chargeable Income</strong> after all BIK adjustments and tax reliefs (Pension, NHF, etc.) have been deducted.</p>
                  </div>
                </div>

                <div className="actions mt-12">
                  <button onClick={() => setCurrentPage('calculator')} className="btn-primary">
                    <Calculator size={18} /> Back to Calculator
                  </button>
                </div>
              </div>
            </motion.div>
          ) : currentPage === 'guidelines' ? (
            <motion.div
              key="guidelines"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="page-view guidelines-page"
            >
              <div className="glass container p-12">
                <h2 className="section-title">Compliance Guide</h2>
                <h1 className="display-title">Tax Definitions & Guidelines</h1>
                <p className="guidelines-intro">
                  This guideline page is designed to help you navigate the key terms and rules of the Nigeria Tax Act (NTA) 2025
                  so you can accurately estimate your personal tax liability.
                </p>

                <div className="guidelines-layout">
                  <aside className="guidelines-sidebar">
                    <div className="sidebar-index">
                      <h3>Quick Navigator</h3>
                      <div className="index-nav">
                        <div className="index-group">
                          <span>1. Definitions</span>
                          <button onClick={() => scrollToId('bik')} className="index-btn">Benefits-in-Kind</button>
                          <button onClick={() => scrollToId('digital-assets')} className="index-btn">Digital Assets</button>
                          <button onClick={() => scrollToId('chargeable-gains')} className="index-btn">Chargeable Gains</button>
                          <button onClick={() => scrollToId('exemptions')} className="index-btn">Tax Exemptions</button>
                        </div>
                        <div className="index-group">
                          <span>2. Residency</span>
                          <button onClick={() => scrollToId('residency')} className="index-btn">Residency Rules</button>
                        </div>
                        <div className="index-group">
                          <span>3. Reliefs</span>
                          <button onClick={() => scrollToId('rent-relief')} className="index-btn">Rent Relief</button>
                          <button onClick={() => scrollToId('statutory')} className="index-btn">Statutory Deductions</button>
                          <button onClick={() => scrollToId('assurance')} className="index-btn">Life Assurance</button>
                        </div>
                        <div className="index-group">
                          <span>4. Losses</span>
                          <button onClick={() => scrollToId('losses')} className="index-btn">Loss Offsetting</button>
                        </div>
                      </div>
                    </div>
                  </aside>

                  <div className="guidelines-content">
                    <div className="guidelines-section" id="definitions">
                      <h2><Wallet size={24} /> 1. Key Definitions and Jargon</h2>
                      <ul className="guidelines-list">
                        <li className="guideline-item" id="bik">
                          <strong>Benefits-in-Kind (BIK)</strong>
                          <p>BIK refers to non-cash perks or "perquisites" provided to you by your employer, such as a company car or official housing. These are treated as taxable income.</p>
                          <ul className="sub-list">
                            <li className="sub-item"><strong>Housing:</strong> If your employer provides a house, the benefit added to your income is the annual rental value, but this amount is capped at 20% of your annual gross salary.</li>
                            <li className="sub-item"><strong>Other Assets:</strong> For use of assets like vehicles, the benefit is calculated as 5% of the cost the employer paid to acquire the asset.</li>
                          </ul>
                        </li>
                        <li className="guideline-item" id="digital-assets">
                          <strong>Digital Assets</strong>
                          <p>These are electronic representations of value that can be digitally traded, including cryptocurrencies, utility tokens, security tokens, and non-fungible tokens (NFTs). Profits made from selling or exchanging these assets are now explicitly taxable as income.</p>
                        </li>
                        <li className="guideline-item" id="chargeable-gains">
                          <strong>Chargeable Gains</strong>
                          <p>This is the profit (gain) you make when you sell or "dispose" of a personal asset, such as land, buildings, or shares. Under the new law, these gains are taxed at your applicable personal income tax rate (up to 25%) rather than the previous flat 10% rate.</p>
                        </li>
                        <li className="guideline-item" id="exemptions">
                          <strong>Tax Exemptions</strong>
                          <p>These are specific types of income that are not taxed at all. For example, if you earn the National Minimum Wage or less, you are fully exempt from paying income tax. Additionally, compensation for loss of employment (redundancy pay) is exempt up to ₦50,000,000.</p>
                        </li>
                      </ul>
                    </div>

                    <div className="guidelines-section" id="residency">
                      <h2><ShieldCheck size={24} /> 2. Understanding Residency</h2>
                      <p className="subtitle">Your residency status determines which parts of your income Nigeria can tax.</p>
                      <ul className="guidelines-list">
                        <li className="guideline-item">
                          <strong>Resident Individual</strong>
                          <p>You are considered a resident if you are domiciled in Nigeria, have a habitual abode here, or stay in the country for at least 183 days in a 12-month period. Residents are taxed on their worldwide income, meaning money earned both inside and outside Nigeria.</p>
                        </li>
                        <li className="guideline-item">
                          <strong>Non-Resident Individual</strong>
                          <p>If you do not meet the residency thresholds, you are only taxed on income derived from sources within Nigeria.</p>
                        </li>
                      </ul>
                    </div>

                    <div className="guidelines-section" id="reliefs">
                      <h2><TrendingUp size={24} /> 3. Reliefs and Deductions</h2>
                      <p className="subtitle">Reliefs are amounts you can subtract from your total income to arrive at your "Chargeable Income" (the amount actually taxed).</p>
                      <ul className="guidelines-list">
                        <li className="guideline-item" id="rent-relief">
                          <strong>Rent Relief</strong>
                          <p>The old Consolidated Relief Allowance (CRA) has been removed. It is replaced by a targeted Rent Relief, where you can deduct 20% of your actual annual rent paid, subject to a maximum limit of ₦500,000.</p>
                        </li>
                        <li className="guideline-item" id="statutory">
                          <strong>Statutory Deductions</strong>
                          <p>You can also deduct your contributions to the National Housing Fund (NHF), the National Health Insurance Scheme (NHIS), and Pension funds.</p>
                        </li>
                        <li className="guideline-item" id="assurance">
                          <strong>Life Assurance & Mortgage</strong>
                          <ul className="sub-list">
                            <li className="sub-item"><strong>Life Assurance:</strong> Premiums paid for insurance on your life or your spouse's life are deductible.</li>
                            <li className="sub-item"><strong>Mortgage Interest:</strong> If you have a loan for an owner-occupied residential house, the interest paid on that loan is deductible.</li>
                          </ul>
                        </li>
                      </ul>
                    </div>

                    <div className="guidelines-section" id="losses">
                      <h2><ShieldCheck size={24} /> 4. Loss Offsetting Rules</h2>
                      <p className="subtitle">If you lose money on a transaction, you can sometimes use that loss to reduce your tax on other profits.</p>
                      <ul className="guidelines-list">
                        <li className="guideline-item">
                          <strong>General Rule</strong>
                          <p>Losses from a trade or business can be carried forward to future years until the loss is fully recovered.</p>
                        </li>
                        <li className="guideline-item">
                          <strong>Digital Asset Restriction</strong>
                          <p>If you suffer a loss from trading digital assets (like crypto), you can only deduct that loss against profits made from other digital assets; you cannot use it to reduce the tax on your regular salary.</p>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="actions mt-12">
                  <button onClick={() => setCurrentPage('calculator')} className="btn-primary">
                    <Calculator size={18} /> Back to Calculator
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="fx-rates"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="page-view fx-page"
            >
              <FXConverter />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="page-footer container mt-12 pb-12">
        <p className="text-muted text-center">
          &copy; 2026 NaijaReceipt Personal Tax Estimator. Logic based on the Nigeria Tax Act (NTA) 2025.
          This tool is for estimation purposes only. Consult a tax professional for official filing.
        </p>
      </footer>

    </div>
  );
}

export default App;
