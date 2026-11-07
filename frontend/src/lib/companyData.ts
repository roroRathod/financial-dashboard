export interface CompanyInfo {
  name: string
  symbol: string
  domain: string
  sector: string
  weight: number
}

export const KNOWN_COMPANIES: Record<string, CompanyInfo> = {
  // --- Indian Equities (Nifty 50, Bank Nifty, Sensex) matching Alphave structure ---
  'HDFCBANK': { name: 'HDFC Bank Ltd.', symbol: 'HDFCBANK', domain: 'hdfcbank.com', sector: 'Banking & Finance', weight: 11.5 },
  'ICICIBANK': { name: 'ICICI Bank Ltd.', symbol: 'ICICIBANK', domain: 'icicibank.com', sector: 'Banking & Finance', weight: 8.5 },
  'AXISBANK': { name: 'Axis Bank Ltd.', symbol: 'AXISBANK', domain: 'axisbank.com', sector: 'Banking & Finance', weight: 3.5 },
  'KOTAKBANK': { name: 'Kotak Mahindra Bank', symbol: 'KOTAKBANK', domain: 'kotak.com', sector: 'Banking & Finance', weight: 3.0 },
  'SBIN': { name: 'State Bank of India', symbol: 'SBIN', domain: 'sbi.co.in', sector: 'Banking & Finance', weight: 3.0 },
  'BAJFINANCE': { name: 'Bajaj Finance Ltd.', symbol: 'BAJFINANCE', domain: 'bajajfinserv.in', sector: 'Banking & Finance', weight: 2.2 },
  'BAJAJFINSV': { name: 'Bajaj Finserv Ltd.', symbol: 'BAJAJFINSV', domain: 'bajajfinserv.in', sector: 'Banking & Finance', weight: 1.2 },
  'JIOFIN': { name: 'Jio Financial Services', symbol: 'JIOFIN', domain: 'jiofinancialservices.com', sector: 'Banking & Finance', weight: 1.0 },
  'SBILIFE': { name: 'SBI Life Insurance', symbol: 'SBILIFE', domain: 'sbilife.co.in', sector: 'Banking & Finance', weight: 0.8 },
  'BSE': { name: 'BSE India Ltd.', symbol: 'BSE', domain: 'bseindia.com', sector: 'Banking & Finance', weight: 0.5 },
  'INDUSINDBK': { name: 'IndusInd Bank Ltd.', symbol: 'INDUSINDBK', domain: 'indusind.com', sector: 'Banking & Finance', weight: 1.4 },
  'BANKBARODA': { name: 'Bank of Baroda', symbol: 'BANKBARODA', domain: 'bankofbaroda.in', sector: 'Banking & Finance', weight: 1.2 },
  'PNB': { name: 'Punjab National Bank', symbol: 'PNB', domain: 'pnbindia.in', sector: 'Banking & Finance', weight: 1.0 },
  'FEDERALBNK': { name: 'Federal Bank Ltd.', symbol: 'FEDERALBNK', domain: 'federalbank.co.in', sector: 'Banking & Finance', weight: 0.9 },
  'IDFCFIRSTB': { name: 'IDFC FIRST Bank', symbol: 'IDFCFIRSTB', domain: 'idfcfirstbank.com', sector: 'Banking & Finance', weight: 0.8 },
  'AUBANK': { name: 'AU Small Finance Bank', symbol: 'AUBANK', domain: 'aubank.in', sector: 'Banking & Finance', weight: 0.8 },
  'BANDHANBNK': { name: 'Bandhan Bank', symbol: 'BANDHANBNK', domain: 'bandhanbank.com', sector: 'Banking & Finance', weight: 0.7 },
  'SHRIRAMFIN': { name: 'Shriram Finance', symbol: 'SHRIRAMFIN', domain: 'shriramfinance.in', sector: 'Banking & Finance', weight: 0.8 },

  'RELIANCE': { name: 'Reliance Industries Ltd.', symbol: 'RELIANCE', domain: 'reliance.com', sector: 'Energy & Power', weight: 9.5 },
  'NTPC': { name: 'NTPC Limited', symbol: 'NTPC', domain: 'ntpc.co.in', sector: 'Energy & Power', weight: 2.2 },
  'POWERGRID': { name: 'Power Grid Corp. of India', symbol: 'POWERGRID', domain: 'powergrid.in', sector: 'Energy & Power', weight: 1.8 },
  'ONGC': { name: 'Oil & Natural Gas Corp.', symbol: 'ONGC', domain: 'ongcindia.com', sector: 'Energy & Power', weight: 1.5 },
  'COALINDIA': { name: 'Coal India Ltd.', symbol: 'COALINDIA', domain: 'coalindia.in', sector: 'Energy & Power', weight: 0.92 },
  'BPCL': { name: 'Bharat Petroleum Corp.', symbol: 'BPCL', domain: 'bharatpetroleum.in', sector: 'Energy & Power', weight: 0.8 },
  'IOC': { name: 'Indian Oil Corporation', symbol: 'IOC', domain: 'iocl.com', sector: 'Energy & Power', weight: 0.7 },

  'ITC': { name: 'ITC Limited', symbol: 'ITC', domain: 'itcportal.com', sector: 'FMCG & Retail', weight: 4.5 },
  'HINDUNILVR': { name: 'Hindustan Unilever Ltd.', symbol: 'HINDUNILVR', domain: 'hul.co.in', sector: 'FMCG & Retail', weight: 3.2 },
  'NESTLEIND': { name: 'Nestle India Ltd.', symbol: 'NESTLEIND', domain: 'nestle.in', sector: 'FMCG & Retail', weight: 1.2 },
  'BRITANNIA': { name: 'Britannia Industries Ltd.', symbol: 'BRITANNIA', domain: 'britannia.co.in', sector: 'FMCG & Retail', weight: 1.0 },
  'TATACONSUM': { name: 'Tata Consumer Products', symbol: 'TATACONSUM', domain: 'tataconsumer.com', sector: 'FMCG & Retail', weight: 0.9 },

  'M&M': { name: 'Mahindra & Mahindra Ltd.', symbol: 'M&M', domain: 'mahindra.com', sector: 'Auto & Mobility', weight: 2.8 },
  'TMPV': { name: 'Tata Motors PV Ltd.', symbol: 'TMPV', domain: 'tatamotors.com', sector: 'Auto & Mobility', weight: 2.2 },
  'TATAMOTORS': { name: 'Tata Motors Ltd.', symbol: 'TATAMOTORS', domain: 'tatamotors.com', sector: 'Auto & Mobility', weight: 2.2 },
  'MARUTI': { name: 'Maruti Suzuki India Ltd.', symbol: 'MARUTI', domain: 'marutisuzuki.com', sector: 'Auto & Mobility', weight: 2.2 },
  'BAJAJ-AUTO': { name: 'Bajaj Auto Ltd.', symbol: 'BAJAJ-AUTO', domain: 'bajajauto.com', sector: 'Auto & Mobility', weight: 1.4 },
  'EICHERMOT': { name: 'Eicher Motors Ltd.', symbol: 'EICHERMOT', domain: 'eichermotors.com', sector: 'Auto & Mobility', weight: 1.0 },
  'HEROMOTOCO': { name: 'Hero MotoCorp Ltd.', symbol: 'HEROMOTOCO', domain: 'heromotocorp.com', sector: 'Auto & Mobility', weight: 0.8 },

  'INFY': { name: 'Infosys Ltd.', symbol: 'INFY', domain: 'infosys.com', sector: 'Technology', weight: 5.5 },
  'TCS': { name: 'Tata Consultancy Services', symbol: 'TCS', domain: 'tcs.com', sector: 'Technology', weight: 4.2 },
  'HCLTECH': { name: 'HCL Technologies Ltd.', symbol: 'HCLTECH', domain: 'hcltech.com', sector: 'Technology', weight: 2.2 },
  'TECHM': { name: 'Tech Mahindra Ltd.', symbol: 'TECHM', domain: 'techmahindra.com', sector: 'Technology', weight: 1.1 },
  'WIPRO': { name: 'Wipro Ltd.', symbol: 'WIPRO', domain: 'wipro.com', sector: 'Technology', weight: 1.0 },

  'LT': { name: 'Larsen & Toubro Ltd.', symbol: 'LT', domain: 'larsentoubro.com', sector: 'Infrastructure', weight: 4.2 },
  'GRASIM': { name: 'Grasim Industries Ltd.', symbol: 'GRASIM', domain: 'grasim.com', sector: 'Infrastructure', weight: 1.0 },
  'ULTRACEMCO': { name: 'UltraTech Cement Ltd.', symbol: 'ULTRACEMCO', domain: 'ultratechcement.com', sector: 'Infrastructure', weight: 1.4 },
  'BEL': { name: 'Bharat Electronics Ltd.', symbol: 'BEL', domain: 'bel-india.in', sector: 'Infrastructure', weight: 1.2 },

  'BHARTIARTL': { name: 'Bharti Airtel Ltd.', symbol: 'BHARTIARTL', domain: 'airtel.in', sector: 'Telecom & Comm', weight: 4.8 },

  'TATASTEEL': { name: 'Tata Steel Ltd.', symbol: 'TATASTEEL', domain: 'tatasteel.com', sector: 'Metal & Mining', weight: 1.6 },
  'JSWSTEEL': { name: 'JSW Steel Ltd.', symbol: 'JSWSTEEL', domain: 'jsw.in', sector: 'Metal & Mining', weight: 1.4 },
  'HINDALCO': { name: 'Hindalco Industries Ltd.', symbol: 'HINDALCO', domain: 'hindalco.com', sector: 'Metal & Mining', weight: 1.2 },
  'VEDL': { name: 'Vedanta Ltd.', symbol: 'VEDL', domain: 'vedantalimited.com', sector: 'Metal & Mining', weight: 0.9 },

  'CIPLA': { name: 'Cipla Ltd.', symbol: 'CIPLA', domain: 'cipla.com', sector: 'Pharma & Health', weight: 1.1 },
  'SUNPHARMA': { name: 'Sun Pharmaceutical Ltd.', symbol: 'SUNPHARMA', domain: 'sunpharma.com', sector: 'Pharma & Health', weight: 2.4 },
  'DRREDDY': { name: 'Dr. Reddy\'s Labs', symbol: 'DRREDDY', domain: 'drreddys.com', sector: 'Pharma & Health', weight: 1.0 },
  'APOLLOHOSP': { name: 'Apollo Hospitals', symbol: 'APOLLOHOSP', domain: 'apollohospitals.com', sector: 'Pharma & Health', weight: 0.9 },
  'DIVISLAB': { name: 'Divi\'s Laboratories', symbol: 'DIVISLAB', domain: 'divislabs.com', sector: 'Pharma & Health', weight: 0.8 },

  'TITAN': { name: 'Titan Company Ltd.', symbol: 'TITAN', domain: 'titancompany.in', sector: 'Consumer Services', weight: 1.8 },
  'TRENT': { name: 'Trent Ltd.', symbol: 'TRENT', domain: 'trentlimited.com', sector: 'Consumer Services', weight: 1.4 },
  'ASIANPAINT': { name: 'Asian Paints Ltd.', symbol: 'ASIANPAINT', domain: 'asianpaints.com', sector: 'Consumer Services', weight: 1.5 },

  'ADANIPORTS': { name: 'Adani Ports & SEZ', symbol: 'ADANIPORTS', domain: 'adaniports.com', sector: 'Aviation & Logistics', weight: 1.3 },
  'INDIGO': { name: 'InterGlobe Aviation', symbol: 'INDIGO', domain: 'goindigo.in', sector: 'Aviation & Logistics', weight: 1.0 },
  'ADANIENT': { name: 'Adani Enterprises Ltd.', symbol: 'ADANIENT', domain: 'adanienterprises.com', sector: 'Infrastructure', weight: 1.4 },
  'POLYCAB': { name: 'Polycab India', symbol: 'POLYCAB', domain: 'polycab.com', sector: 'Cables & Electricals', weight: 0.8 },
  'SUZLON': { name: 'Suzlon Energy', symbol: 'SUZLON', domain: 'suzlon.com', sector: 'Renewable Energy', weight: 0.7 },
  'DIXON': { name: 'Dixon Technologies', symbol: 'DIXON', domain: 'dixoninfo.com', sector: 'Electronics Manufacturing', weight: 0.8 },
  'MAXHEALTH': { name: 'Max Healthcare', symbol: 'MAXHEALTH', domain: 'maxhealthcare.in', sector: 'Healthcare & Hospitals', weight: 0.7 },
  'CUMMINSIND': { name: 'Cummins India', symbol: 'CUMMINSIND', domain: 'cummins.com', sector: 'Engines & Capital Goods', weight: 0.7 },
  'PERSISTENT': { name: 'Persistent Systems', symbol: 'PERSISTENT', domain: 'persistent.com', sector: 'Information Technology', weight: 0.7 },
  'COFORGE': { name: 'Coforge', symbol: 'COFORGE', domain: 'coforge.com', sector: 'Information Technology', weight: 0.6 },
  'AUROPHARMA': { name: 'Aurobindo Pharma', symbol: 'AUROPHARMA', domain: 'aurobindo.com', sector: 'Pharmaceuticals', weight: 0.7 },
  'LUPIN': { name: 'Lupin Limited', symbol: 'LUPIN', domain: 'lupin.com', sector: 'Pharmaceuticals', weight: 0.6 },
  'ASHOKLEY': { name: 'Ashok Leyland', symbol: 'ASHOKLEY', domain: 'ashokleyland.com', sector: 'Commercial Vehicles', weight: 0.7 },
  'BHEL': { name: 'BHEL', symbol: 'BHEL', domain: 'bhel.in', sector: 'Heavy Electricals', weight: 0.6 },
  'OBEROIRLTY': { name: 'Oberoi Realty', symbol: 'OBEROIRLTY', domain: 'oberoirealty.com', sector: 'Real Estate', weight: 0.6 },
  'VOLTAS': { name: 'Voltas Limited', symbol: 'VOLTAS', domain: 'voltas.com', sector: 'Consumer Appliances', weight: 0.6 },

  // --- US Equities (Nasdaq 100, S&P 500, Dow Jones) ---
  'AAPL': { name: 'Apple Inc.', symbol: 'AAPL', domain: 'apple.com', sector: 'Consumer Electronics', weight: 10.5 },
  'MSFT': { name: 'Microsoft Corporation', symbol: 'MSFT', domain: 'microsoft.com', sector: 'Enterprise Software & Cloud', weight: 9.8 },
  'NVDA': { name: 'NVIDIA Corporation', symbol: 'NVDA', domain: 'nvidia.com', sector: 'AI & Semiconductors', weight: 9.5 },
  'AMZN': { name: 'Amazon.com', symbol: 'AMZN', domain: 'amazon.com', sector: 'E-Commerce & Cloud', weight: 7.2 },
  'GOOGL': { name: 'Alphabet Inc. (Google)', symbol: 'GOOGL', domain: 'google.com', sector: 'Search & Digital Advertising', weight: 6.2 },
  'GOOG': { name: 'Alphabet Inc. (Google)', symbol: 'GOOG', domain: 'google.com', sector: 'Search & Digital Advertising', weight: 6.0 },
  'META': { name: 'Meta Platforms', symbol: 'META', domain: 'meta.com', sector: 'Social Media & AI', weight: 5.4 },
  'TSLA': { name: 'Tesla Inc.', symbol: 'TSLA', domain: 'tesla.com', sector: 'Electric Vehicles & Clean Tech', weight: 4.2 },
  'AVGO': { name: 'Broadcom Inc.', symbol: 'AVGO', domain: 'broadcom.com', sector: 'Semiconductors & Software', weight: 3.6 },
  'BRK-B': { name: 'Berkshire Hathaway', symbol: 'BRK-B', domain: 'berkshirehathaway.com', sector: 'Insurance & Conglomerates', weight: 3.5 },
  'JPM': { name: 'JPMorgan Chase', symbol: 'JPM', domain: 'jpmorganchase.com', sector: 'Investment Banking', weight: 3.4 },
  'V': { name: 'Visa Inc.', symbol: 'V', domain: 'visa.com', sector: 'Payment Networks', weight: 3.0 },
  'UNH': { name: 'UnitedHealth Group', symbol: 'UNH', domain: 'unitedhealthgroup.com', sector: 'Managed Healthcare', weight: 3.1 },
  'XOM': { name: 'Exxon Mobil', symbol: 'XOM', domain: 'exxonmobil.com', sector: 'Integrated Oil & Gas', weight: 2.8 },
  'LLY': { name: 'Eli Lilly & Co.', symbol: 'LLY', domain: 'lilly.com', sector: 'Biopharma & Therapeutics', weight: 3.0 },
  'MA': { name: 'Mastercard Inc.', symbol: 'MA', domain: 'mastercard.com', sector: 'Payment Networks', weight: 2.5 },
  'HD': { name: 'Home Depot', symbol: 'HD', domain: 'homedepot.com', sector: 'Home Improvement Retail', weight: 2.3 },
  'PG': { name: 'Procter & Gamble', symbol: 'PG', domain: 'pg.com', sector: 'Consumer Products', weight: 2.3 },
  'JNJ': { name: 'Johnson & Johnson', symbol: 'JNJ', domain: 'jnj.com', sector: 'Pharmaceuticals & MedTech', weight: 2.3 },
  'COST': { name: 'Costco Wholesale', symbol: 'COST', domain: 'costco.com', sector: 'Warehouse Retail', weight: 2.4 },
  'ABBV': { name: 'AbbVie Inc.', symbol: 'ABBV', domain: 'abbvie.com', sector: 'Biopharmaceuticals', weight: 2.1 },
  'BAC': { name: 'Bank of America', symbol: 'BAC', domain: 'bankofamerica.com', sector: 'Banking & Financials', weight: 2.1 },
  'NFLX': { name: 'Netflix Inc.', symbol: 'NFLX', domain: 'netflix.com', sector: 'Streaming Entertainment', weight: 2.2 },
  'AMD': { name: 'Advanced Micro Devices', symbol: 'AMD', domain: 'amd.com', sector: 'Semiconductors & Processors', weight: 2.0 },
  'ASML': { name: 'ASML Holding', symbol: 'ASML', domain: 'asml.com', sector: 'Semiconductor Equipment', weight: 2.0 },
  'PEP': { name: 'PepsiCo', symbol: 'PEP', domain: 'pepsico.com', sector: 'Beverages & Snacks', weight: 1.8 },
  'ADBE': { name: 'Adobe Inc.', symbol: 'ADBE', domain: 'adobe.com', sector: 'Creative & Digital Software', weight: 1.8 },
  'CSCO': { name: 'Cisco Systems', symbol: 'CSCO', domain: 'cisco.com', sector: 'Networking & Telecommunications', weight: 1.6 },
  'TMUS': { name: 'T-Mobile US', symbol: 'TMUS', domain: 't-mobile.com', sector: 'Wireless Carriers', weight: 1.6 },
  'QCOM': { name: 'Qualcomm', symbol: 'QCOM', domain: 'qualcomm.com', sector: 'Mobile Chips & Wireless Tech', weight: 1.6 },
  'INTC': { name: 'Intel Corporation', symbol: 'INTC', domain: 'intel.com', sector: 'Semiconductors & Foundries', weight: 1.3 },
  'TXN': { name: 'Texas Instruments', symbol: 'TXN', domain: 'ti.com', sector: 'Analog Semiconductors', weight: 1.4 },
  'AMGN': { name: 'Amgen Inc.', symbol: 'AMGN', domain: 'amgen.com', sector: 'Biotechnology', weight: 1.4 },
  'GS': { name: 'Goldman Sachs', symbol: 'GS', domain: 'goldmansachs.com', sector: 'Investment Banking', weight: 1.8 },
  'CAT': { name: 'Caterpillar Inc.', symbol: 'CAT', domain: 'caterpillar.com', sector: 'Heavy Machinery & Mining', weight: 1.6 },
  'CRM': { name: 'Salesforce', symbol: 'CRM', domain: 'salesforce.com', sector: 'Enterprise CRM Software', weight: 1.6 },
  'MCD': { name: 'McDonald\'s', symbol: 'MCD', domain: 'mcdonalds.com', sector: 'Fast Food Restaurants', weight: 1.7 },
  'BA': { name: 'Boeing', symbol: 'BA', domain: 'boeing.com', sector: 'Aerospace & Defense', weight: 1.3 },
  'HON': { name: 'Honeywell', symbol: 'HON', domain: 'honeywell.com', sector: 'Industrial Automation', weight: 1.4 },
  'TRV': { name: 'Travelers Companies', symbol: 'TRV', domain: 'travelers.com', sector: 'Commercial Insurance', weight: 1.1 },
  'AXP': { name: 'American Express', symbol: 'AXP', domain: 'americanexpress.com', sector: 'Payment & Cards', weight: 1.5 },
  'IBM': { name: 'IBM', symbol: 'IBM', domain: 'ibm.com', sector: 'Cloud & AI Infrastructure', weight: 1.5 },
  'WMT': { name: 'Walmart Inc.', symbol: 'WMT', domain: 'walmart.com', sector: 'Global Retail', weight: 2.3 },
  'DIS': { name: 'Walt Disney Company', symbol: 'DIS', domain: 'disney.com', sector: 'Media & Entertainment', weight: 1.5 },
  'CVX': { name: 'Chevron Corporation', symbol: 'CVX', domain: 'chevron.com', sector: 'Integrated Oil & Gas', weight: 1.9 },

  // --- European & Asian Heavyweights ---
  'SAP.DE': { name: 'SAP SE', symbol: 'SAP', domain: 'sap.com', sector: 'Enterprise Software', weight: 2.5 },
  'SIE.DE': { name: 'Siemens AG', symbol: 'SIE', domain: 'siemens.com', sector: 'Industrial Automation', weight: 2.2 },
  'AZN.L': { name: 'AstraZeneca', symbol: 'AZN', domain: 'astrazeneca.com', sector: 'Pharmaceuticals', weight: 2.5 },
  'SHEL.L': { name: 'Shell plc', symbol: 'SHEL', domain: 'shell.com', sector: 'Oil & Gas', weight: 2.4 },
  'HSBA.L': { name: 'HSBC Holdings', symbol: 'HSBA', domain: 'hsbc.com', sector: 'Global Banking', weight: 2.2 },
  '7203.T': { name: 'Toyota Motor', symbol: '7203', domain: 'toyota.com', sector: 'Automotive', weight: 3.0 },
  '6758.T': { name: 'Sony Group', symbol: '6758', domain: 'sony.com', sector: 'Consumer Electronics & Entertainment', weight: 2.5 },
}

export function cleanSymbol(ticker: string): string {
  return ticker
    .replace('.NS', '')
    .replace('.BO', '')
    .replace('.DE', '')
    .replace('.L', '')
    .replace('.PA', '')
    .replace('.AX', '')
    .replace('.HK', '')
    .replace('.T', '')
    .replace('^', '')
}

function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function inferSector(name: string, isIndian: boolean): string {
  const n = name.toLowerCase()
  if (n.includes('bank') || n.includes('finance') || n.includes('finserv') || n.includes('capital') || n.includes('insurance')) {
    return 'Banking & Finance'
  }
  if (n.includes('power') || n.includes('energy') || n.includes('oil') || n.includes('gas') || n.includes('petroleum') || n.includes('solar') || n.includes('wind')) {
    return 'Energy & Power'
  }
  if (n.includes('tech') || n.includes('software') || n.includes('info') || n.includes('consultancy') || n.includes('system') || n.includes('digital') || n.includes('cyber')) {
    return 'Technology'
  }
  if (n.includes('motor') || n.includes('auto') || n.includes('vehicle') || n.includes('tyre')) {
    return 'Auto & Mobility'
  }
  if (n.includes('pharma') || n.includes('lab') || n.includes('health') || n.includes('hospital') || n.includes('bio') || n.includes('medic')) {
    return 'Pharma & Health'
  }
  if (n.includes('steel') || n.includes('metal') || n.includes('mining') || n.includes('alum') || n.includes('zinc') || n.includes('copper')) {
    return 'Metal & Mining'
  }
  if (n.includes('telecom') || n.includes('comm') || n.includes('wireless') || n.includes('broadband')) {
    return 'Telecom & Comm'
  }
  if (n.includes('cement') || n.includes('infra') || n.includes('engineer') || n.includes('heavy') || n.includes('defense') || n.includes('port')) {
    return 'Infrastructure'
  }
  if (n.includes('retail') || n.includes('food') || n.includes('fmcg') || n.includes('beverage') || n.includes('paint') || n.includes('fashion') || n.includes('consumer')) {
    return 'FMCG & Retail'
  }
  return isIndian ? 'Diversified Equities' : 'Global Equities'
}

export function getCompanyInfo(ticker: string, liveName?: string, liveSector?: string): CompanyInfo {
  const sym = cleanSymbol(ticker).toUpperCase()

  // Exact symbol match from cache/seed
  if (KNOWN_COMPANIES[sym]) {
    const known = KNOWN_COMPANIES[sym]
    if (liveName && liveName !== sym) {
      return { ...known, name: toTitleCase(liveName) }
    }
    return known
  }

  // Exact ticker match
  if (KNOWN_COMPANIES[ticker]) {
    return KNOWN_COMPANIES[ticker]
  }

  // Fallback heuristic for ANY unknown or newly added company
  const isIndian = ticker.includes('.NS') || ticker.includes('.BO')
  const cleanName = liveName ? toTitleCase(liveName) : sym
  const domain = isIndian ? `${sym.toLowerCase()}.com` : `${sym.toLowerCase()}.com`
  const sector = liveSector || inferSector(cleanName, isIndian)

  return {
    name: cleanName,
    symbol: sym,
    domain,
    sector,
    weight: 1.0,
  }
}
