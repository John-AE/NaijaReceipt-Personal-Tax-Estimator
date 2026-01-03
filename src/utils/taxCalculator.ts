export interface TaxInputs {
    residency: 'resident' | 'non-resident';
    annualGrossSalary: number;
    investingIncome: {
        dividends: number;
        interest: number;
        royalties: number;
    };
    chargeableGains: {
        digitalAssetGains: number;
        digitalAssetLosses: number;
        otherAssetGains: number;
    };
    employerBenefits: {
        housingProvided: boolean;
        housingRentalValue: number;
        carProvided: boolean;
        carAcquisitionCost: number;
    };
    reliefs: {
        annualPension: number;
        annualNHF: number;
        annualNHIS: number;
        annualRentPaid: number;
        lifeAssurancePremiums: number;
        mortgageInterest: number;
    };
}

export interface TaxBreakdown {
    bracket: string;
    rate: number;
    taxableAmount: number;
    taxDue: number;
}

export interface TaxResult {
    totalGrossIncome: number;
    bikAdjustments: number;
    totalExemptionsAndDeductions: number;
    netChargeableIncome: number;
    totalTaxDue: number;
    breakdown: TaxBreakdown[];
    annualTakeHomePay: number;
    monthlyTakeHomePay: number;
    isExempt: boolean;
}

const TAX_BANDS = [
    { limit: 800000, rate: 0, label: 'First ₦800,000 (Exempt)' },
    { limit: 2200000, rate: 0.15, label: 'Next ₦2,200,000 (15%)' },
    { limit: 9000000, rate: 0.18, label: 'Next ₦9,000,000 (18%)' },
    { limit: 13000000, rate: 0.21, label: 'Next ₦13,000,000 (21%)' },
    { limit: 25000000, rate: 0.23, label: 'Next ₦25,000,000 (23%)' },
    { limit: Infinity, rate: 0.25, label: 'Above ₦50,000,000 (25%)' },
];

const MINIMUM_WAGE_EXEMPTION = 800000;
const RENT_RELIEF_CAP = 500000;
const RENT_RELIEF_PERCENT = 0.2;
const HOUSING_BIK_CAP_PERCENT = 0.2;
const ASSET_BIK_PERCENT = 0.05;

export const calculateTax = (inputs: TaxInputs): TaxResult => {
    const {
        annualGrossSalary,
        investingIncome,
        chargeableGains,
        employerBenefits,
        reliefs,
    } = inputs;

    // 1. Calculate Total Gross Income
    // Note: For non-residents, only Nigerian source income is taxable. 
    // We assume the inputs provided are relevant to Nigerian tax based on the user's entry.
    const totalGrossSalary = annualGrossSalary + investingIncome.dividends + investingIncome.interest + investingIncome.royalties;

    // 2. Minimum Wage Exemption Check
    if (totalGrossSalary <= MINIMUM_WAGE_EXEMPTION) {
        return {
            totalGrossIncome: totalGrossSalary,
            bikAdjustments: 0,
            totalExemptionsAndDeductions: 0,
            netChargeableIncome: 0,
            totalTaxDue: 0,
            breakdown: [],
            annualTakeHomePay: totalGrossSalary,
            monthlyTakeHomePay: totalGrossSalary / 12,
            isExempt: true,
        };
    }

    // 3. BIK Adjustments
    let bikAdjustments = 0;
    if (employerBenefits.housingProvided) {
        bikAdjustments += Math.min(employerBenefits.housingRentalValue, HOUSING_BIK_CAP_PERCENT * annualGrossSalary);
    }
    if (employerBenefits.carProvided) {
        bikAdjustments += employerBenefits.carAcquisitionCost * ASSET_BIK_PERCENT;
    }

    const incomeWithBIK = totalGrossSalary + bikAdjustments;

    // 4. Deductions and Reliefs
    const rentRelief = Math.min(reliefs.annualRentPaid * RENT_RELIEF_PERCENT, RENT_RELIEF_CAP);
    const totalDeductions =
        reliefs.annualPension +
        reliefs.annualNHF +
        reliefs.annualNHIS +
        reliefs.lifeAssurancePremiums +
        reliefs.mortgageInterest +
        rentRelief;

    // 5. Chargeable Gains Calculation
    // Digital asset losses offset only against digital asset gains
    const digitalGains = Math.max(0, chargeableGains.digitalAssetGains - chargeableGains.digitalAssetLosses);
    const totalChargeableGains = digitalGains + chargeableGains.otherAssetGains;

    // 6. Net Chargeable Income
    const netChargeableIncome = Math.max(0, (incomeWithBIK - totalDeductions) + totalChargeableGains);

    // 7. Tax Banding
    let remainingIncome = netChargeableIncome;
    let totalTaxDue = 0;
    const breakdown: TaxBreakdown[] = [];

    for (const band of TAX_BANDS) {
        if (remainingIncome <= 0) break;

        const taxableInThisBand = Math.min(remainingIncome, band.limit);
        const taxInThisBand = taxableInThisBand * band.rate;

        breakdown.push({
            bracket: band.label,
            rate: band.rate * 100,
            taxableAmount: taxableInThisBand,
            taxDue: taxInThisBand,
        });

        totalTaxDue += taxInThisBand;
        remainingIncome -= taxableInThisBand;
    }

    const annualTakeHomePay = totalGrossSalary - totalTaxDue - (reliefs.annualPension + reliefs.annualNHF + reliefs.annualNHIS);

    return {
        totalGrossIncome: totalGrossSalary,
        bikAdjustments,
        totalExemptionsAndDeductions: totalDeductions,
        netChargeableIncome,
        totalTaxDue,
        breakdown,
        annualTakeHomePay,
        monthlyTakeHomePay: annualTakeHomePay / 12,
        isExempt: false,
    };
};
