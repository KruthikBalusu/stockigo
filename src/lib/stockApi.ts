const API_KEY = "demo";
const BASE_URL = "https://www.alphavantage.co/query";

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  volume: number;
}

export interface TimeSeriesData {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export const INDIAN_STOCKS = [
  // NIFTY 50 Stocks
  { symbol: "RELIANCE.BSE", name: "Reliance Industries", basePrice: 2450, sector: "Energy" },
  { symbol: "TCS.BSE", name: "Tata Consultancy Services", basePrice: 3850, sector: "IT" },
  { symbol: "HDFCBANK.BSE", name: "HDFC Bank", basePrice: 1650, sector: "Banking" },
  { symbol: "INFY.BSE", name: "Infosys", basePrice: 1480, sector: "IT" },
  { symbol: "ICICIBANK.BSE", name: "ICICI Bank", basePrice: 1050, sector: "Banking" },
  { symbol: "HINDUNILVR.BSE", name: "Hindustan Unilever", basePrice: 2580, sector: "FMCG" },
  { symbol: "SBIN.BSE", name: "State Bank of India", basePrice: 620, sector: "Banking" },
  { symbol: "BHARTIARTL.BSE", name: "Bharti Airtel", basePrice: 1180, sector: "Telecom" },
  { symbol: "ITC.BSE", name: "ITC Limited", basePrice: 435, sector: "FMCG" },
  { symbol: "KOTAKBANK.BSE", name: "Kotak Mahindra Bank", basePrice: 1780, sector: "Banking" },
  { symbol: "LT.BSE", name: "Larsen & Toubro", basePrice: 3420, sector: "Infrastructure" },
  { symbol: "AXISBANK.BSE", name: "Axis Bank", basePrice: 1120, sector: "Banking" },
  { symbol: "ASIANPAINT.BSE", name: "Asian Paints", basePrice: 2890, sector: "Consumer" },
  { symbol: "MARUTI.BSE", name: "Maruti Suzuki", basePrice: 10250, sector: "Automobile" },
  { symbol: "SUNPHARMA.BSE", name: "Sun Pharmaceutical", basePrice: 1120, sector: "Pharma" },
  { symbol: "TITAN.BSE", name: "Titan Company", basePrice: 3180, sector: "Consumer" },
  { symbol: "BAJFINANCE.BSE", name: "Bajaj Finance", basePrice: 6850, sector: "Finance" },
  { symbol: "WIPRO.BSE", name: "Wipro", basePrice: 480, sector: "IT" },
  { symbol: "HCLTECH.BSE", name: "HCL Technologies", basePrice: 1320, sector: "IT" },
  { symbol: "ULTRACEMCO.BSE", name: "UltraTech Cement", basePrice: 9850, sector: "Cement" },
  { symbol: "TATAMOTORS.BSE", name: "Tata Motors", basePrice: 780, sector: "Automobile" },
  { symbol: "POWERGRID.BSE", name: "Power Grid Corp", basePrice: 285, sector: "Power" },
  { symbol: "NTPC.BSE", name: "NTPC Limited", basePrice: 320, sector: "Power" },
  { symbol: "M&M.BSE", name: "Mahindra & Mahindra", basePrice: 1580, sector: "Automobile" },
  { symbol: "ONGC.BSE", name: "Oil & Natural Gas Corp", basePrice: 245, sector: "Energy" },
  { symbol: "TATASTEEL.BSE", name: "Tata Steel", basePrice: 142, sector: "Metal" },
  { symbol: "JSWSTEEL.BSE", name: "JSW Steel", basePrice: 865, sector: "Metal" },
  { symbol: "ADANIENT.BSE", name: "Adani Enterprises", basePrice: 2450, sector: "Conglomerate" },
  { symbol: "ADANIPORTS.BSE", name: "Adani Ports", basePrice: 1180, sector: "Infrastructure" },
  { symbol: "COALINDIA.BSE", name: "Coal India", basePrice: 425, sector: "Mining" },
  { symbol: "TECHM.BSE", name: "Tech Mahindra", basePrice: 1280, sector: "IT" },
  { symbol: "DRREDDY.BSE", name: "Dr. Reddy's Labs", basePrice: 5420, sector: "Pharma" },
  { symbol: "CIPLA.BSE", name: "Cipla", basePrice: 1380, sector: "Pharma" },
  { symbol: "NESTLEIND.BSE", name: "Nestle India", basePrice: 24500, sector: "FMCG" },
  { symbol: "BAJAJFINSV.BSE", name: "Bajaj Finserv", basePrice: 1580, sector: "Finance" },
  { symbol: "GRASIM.BSE", name: "Grasim Industries", basePrice: 2180, sector: "Cement" },
  { symbol: "DIVISLAB.BSE", name: "Divi's Laboratories", basePrice: 3650, sector: "Pharma" },
  { symbol: "BRITANNIA.BSE", name: "Britannia Industries", basePrice: 4850, sector: "FMCG" },
  { symbol: "APOLLOHOSP.BSE", name: "Apollo Hospitals", basePrice: 5680, sector: "Healthcare" },
  { symbol: "EICHERMOT.BSE", name: "Eicher Motors", basePrice: 4250, sector: "Automobile" },
  { symbol: "INDUSINDBK.BSE", name: "IndusInd Bank", basePrice: 1420, sector: "Banking" },
  { symbol: "HEROMOTOCO.BSE", name: "Hero MotoCorp", basePrice: 4180, sector: "Automobile" },
  { symbol: "BPCL.BSE", name: "Bharat Petroleum", basePrice: 385, sector: "Energy" },
  { symbol: "HINDALCO.BSE", name: "Hindalco Industries", basePrice: 520, sector: "Metal" },
  { symbol: "TATACONSUM.BSE", name: "Tata Consumer Products", basePrice: 1050, sector: "FMCG" },
  { symbol: "SBILIFE.BSE", name: "SBI Life Insurance", basePrice: 1420, sector: "Insurance" },
  { symbol: "HDFCLIFE.BSE", name: "HDFC Life Insurance", basePrice: 580, sector: "Insurance" },
  { symbol: "BAJAJ-AUTO.BSE", name: "Bajaj Auto", basePrice: 8250, sector: "Automobile" },
  { symbol: "SHREECEM.BSE", name: "Shree Cement", basePrice: 25800, sector: "Cement" },
  { symbol: "PIDILITIND.BSE", name: "Pidilite Industries", basePrice: 2650, sector: "Chemicals" },
  // NIFTY Next 50
  { symbol: "ADANIGREEN.BSE", name: "Adani Green Energy", basePrice: 1850, sector: "Power" },
  { symbol: "AMBUJACEM.BSE", name: "Ambuja Cements", basePrice: 580, sector: "Cement" },
  { symbol: "BANKBARODA.BSE", name: "Bank of Baroda", basePrice: 245, sector: "Banking" },
  { symbol: "BERGEPAINT.BSE", name: "Berger Paints", basePrice: 520, sector: "Consumer" },
  { symbol: "BIOCON.BSE", name: "Biocon", basePrice: 285, sector: "Pharma" },
  { symbol: "BOSCHLTD.BSE", name: "Bosch", basePrice: 28500, sector: "Automobile" },
  { symbol: "CANBK.BSE", name: "Canara Bank", basePrice: 105, sector: "Banking" },
  { symbol: "CHOLAFIN.BSE", name: "Cholamandalam Finance", basePrice: 1180, sector: "Finance" },
  { symbol: "COLPAL.BSE", name: "Colgate-Palmolive", basePrice: 2580, sector: "FMCG" },
  { symbol: "DLF.BSE", name: "DLF Limited", basePrice: 820, sector: "Real Estate" },
  { symbol: "DABUR.BSE", name: "Dabur India", basePrice: 545, sector: "FMCG" },
  { symbol: "DMART.BSE", name: "Avenue Supermarts", basePrice: 3850, sector: "Retail" },
  { symbol: "GAIL.BSE", name: "GAIL India", basePrice: 185, sector: "Energy" },
  { symbol: "GODREJCP.BSE", name: "Godrej Consumer Products", basePrice: 1280, sector: "FMCG" },
  { symbol: "HAVELLS.BSE", name: "Havells India", basePrice: 1420, sector: "Consumer" },
  { symbol: "ICICIPRULI.BSE", name: "ICICI Prudential Life", basePrice: 580, sector: "Insurance" },
  { symbol: "ICICIGI.BSE", name: "ICICI Lombard", basePrice: 1480, sector: "Insurance" },
  { symbol: "INDUSTOWER.BSE", name: "Indus Towers", basePrice: 320, sector: "Telecom" },
  { symbol: "IOC.BSE", name: "Indian Oil Corp", basePrice: 145, sector: "Energy" },
  { symbol: "IRCTC.BSE", name: "IRCTC", basePrice: 880, sector: "Travel" },
  { symbol: "JINDALSTEL.BSE", name: "Jindal Steel & Power", basePrice: 780, sector: "Metal" },
  { symbol: "JUBLFOOD.BSE", name: "Jubilant FoodWorks", basePrice: 520, sector: "Consumer" },
  { symbol: "LUPIN.BSE", name: "Lupin Limited", basePrice: 1580, sector: "Pharma" },
  { symbol: "MARICO.BSE", name: "Marico Limited", basePrice: 580, sector: "FMCG" },
  { symbol: "MCDOWELL-N.BSE", name: "United Spirits", basePrice: 1180, sector: "Consumer" },
  { symbol: "MUTHOOTFIN.BSE", name: "Muthoot Finance", basePrice: 1520, sector: "Finance" },
  { symbol: "NAUKRI.BSE", name: "Info Edge (Naukri)", basePrice: 5850, sector: "IT" },
  { symbol: "NMDC.BSE", name: "NMDC Limited", basePrice: 185, sector: "Mining" },
  { symbol: "PAGEIND.BSE", name: "Page Industries", basePrice: 38500, sector: "Textile" },
  { symbol: "PEL.BSE", name: "Piramal Enterprises", basePrice: 920, sector: "Finance" },
  { symbol: "PFC.BSE", name: "Power Finance Corp", basePrice: 420, sector: "Finance" },
  { symbol: "PGHH.BSE", name: "P&G Hygiene", basePrice: 15200, sector: "FMCG" },
  { symbol: "PNB.BSE", name: "Punjab National Bank", basePrice: 105, sector: "Banking" },
  { symbol: "POLYCAB.BSE", name: "Polycab India", basePrice: 5280, sector: "Consumer" },
  { symbol: "RECLTD.BSE", name: "REC Limited", basePrice: 480, sector: "Finance" },
  { symbol: "SAIL.BSE", name: "Steel Authority", basePrice: 125, sector: "Metal" },
  { symbol: "SIEMENS.BSE", name: "Siemens India", basePrice: 5850, sector: "Industrial" },
  { symbol: "SRF.BSE", name: "SRF Limited", basePrice: 2350, sector: "Chemicals" },
  { symbol: "TATAPOWER.BSE", name: "Tata Power", basePrice: 380, sector: "Power" },
  { symbol: "TRENT.BSE", name: "Trent Limited", basePrice: 4850, sector: "Retail" },
  { symbol: "TORNTPHARM.BSE", name: "Torrent Pharma", basePrice: 2580, sector: "Pharma" },
  { symbol: "UPL.BSE", name: "UPL Limited", basePrice: 520, sector: "Chemicals" },
  { symbol: "VEDL.BSE", name: "Vedanta Limited", basePrice: 420, sector: "Mining" },
  { symbol: "VOLTAS.BSE", name: "Voltas Limited", basePrice: 1180, sector: "Consumer" },
  { symbol: "ZOMATO.BSE", name: "Zomato Limited", basePrice: 185, sector: "Consumer" },
  { symbol: "ZYDUSLIFE.BSE", name: "Zydus Lifesciences", basePrice: 880, sector: "Pharma" },
  // Mid Cap Stocks
  { symbol: "AARTIIND.BSE", name: "Aarti Industries", basePrice: 580, sector: "Chemicals" },
  { symbol: "ABCAPITAL.BSE", name: "Aditya Birla Capital", basePrice: 185, sector: "Finance" },
  { symbol: "ABFRL.BSE", name: "Aditya Birla Fashion", basePrice: 285, sector: "Retail" },
  { symbol: "ACC.BSE", name: "ACC Limited", basePrice: 2280, sector: "Cement" },
  { symbol: "ALKEM.BSE", name: "Alkem Laboratories", basePrice: 4850, sector: "Pharma" },
  { symbol: "ASHOKLEY.BSE", name: "Ashok Leyland", basePrice: 185, sector: "Automobile" },
  { symbol: "ASTRAL.BSE", name: "Astral Limited", basePrice: 1850, sector: "Industrial" },
  { symbol: "AUROPHARMA.BSE", name: "Aurobindo Pharma", basePrice: 1050, sector: "Pharma" },
  { symbol: "BALKRISIND.BSE", name: "Balkrishna Industries", basePrice: 2580, sector: "Automobile" },
  { symbol: "BANDHANBNK.BSE", name: "Bandhan Bank", basePrice: 220, sector: "Banking" },
  { symbol: "BATAINDIA.BSE", name: "Bata India", basePrice: 1480, sector: "Consumer" },
  { symbol: "BEL.BSE", name: "Bharat Electronics", basePrice: 185, sector: "Defence" },
  { symbol: "BHEL.BSE", name: "Bharat Heavy Electricals", basePrice: 185, sector: "Industrial" },
  { symbol: "CANFINHOME.BSE", name: "Can Fin Homes", basePrice: 780, sector: "Finance" },
  { symbol: "COFORGE.BSE", name: "Coforge Limited", basePrice: 5280, sector: "IT" },
  { symbol: "CONCOR.BSE", name: "Container Corp", basePrice: 780, sector: "Logistics" },
  { symbol: "CROMPTON.BSE", name: "Crompton Greaves", basePrice: 320, sector: "Consumer" },
  { symbol: "CUMMINSIND.BSE", name: "Cummins India", basePrice: 2580, sector: "Industrial" },
  { symbol: "DEEPAKNTR.BSE", name: "Deepak Nitrite", basePrice: 2180, sector: "Chemicals" },
  { symbol: "DELTACORP.BSE", name: "Delta Corp", basePrice: 145, sector: "Consumer" },
  { symbol: "ESCORTS.BSE", name: "Escorts Kubota", basePrice: 3250, sector: "Automobile" },
  { symbol: "EXIDEIND.BSE", name: "Exide Industries", basePrice: 320, sector: "Automobile" },
  { symbol: "FEDERALBNK.BSE", name: "Federal Bank", basePrice: 145, sector: "Banking" },
  { symbol: "FORTIS.BSE", name: "Fortis Healthcare", basePrice: 420, sector: "Healthcare" },
  { symbol: "GLAND.BSE", name: "Gland Pharma", basePrice: 1680, sector: "Pharma" },
  { symbol: "GLENMARK.BSE", name: "Glenmark Pharma", basePrice: 1050, sector: "Pharma" },
  { symbol: "GMRINFRA.BSE", name: "GMR Infrastructure", basePrice: 78, sector: "Infrastructure" },
  { symbol: "GODREJPROP.BSE", name: "Godrej Properties", basePrice: 2180, sector: "Real Estate" },
  { symbol: "GRANULES.BSE", name: "Granules India", basePrice: 420, sector: "Pharma" },
  { symbol: "GUJGASLTD.BSE", name: "Gujarat Gas", basePrice: 480, sector: "Energy" },
  { symbol: "HAL.BSE", name: "Hindustan Aeronautics", basePrice: 3850, sector: "Defence" },
  { symbol: "HINDPETRO.BSE", name: "Hindustan Petroleum", basePrice: 385, sector: "Energy" },
  { symbol: "IDFCFIRSTB.BSE", name: "IDFC First Bank", basePrice: 78, sector: "Banking" },
  { symbol: "IEX.BSE", name: "Indian Energy Exchange", basePrice: 145, sector: "Energy" },
  { symbol: "IGL.BSE", name: "Indraprastha Gas", basePrice: 480, sector: "Energy" },
  { symbol: "INDHOTEL.BSE", name: "Indian Hotels", basePrice: 520, sector: "Hospitality" },
  { symbol: "IRFC.BSE", name: "Indian Railway Finance", basePrice: 145, sector: "Finance" },
  { symbol: "JKCEMENT.BSE", name: "JK Cement", basePrice: 3850, sector: "Cement" },
  { symbol: "JSWENERGY.BSE", name: "JSW Energy", basePrice: 520, sector: "Power" },
  { symbol: "L&TFH.BSE", name: "L&T Finance", basePrice: 145, sector: "Finance" },
  { symbol: "LAURUSLABS.BSE", name: "Laurus Labs", basePrice: 420, sector: "Pharma" },
  { symbol: "LICHSGFIN.BSE", name: "LIC Housing Finance", basePrice: 580, sector: "Finance" },
  { symbol: "LTIM.BSE", name: "LTIMindtree", basePrice: 5280, sector: "IT" },
  { symbol: "LTTS.BSE", name: "L&T Technology Services", basePrice: 4850, sector: "IT" },
  { symbol: "MANAPPURAM.BSE", name: "Manappuram Finance", basePrice: 185, sector: "Finance" },
  { symbol: "MAXHEALTH.BSE", name: "Max Healthcare", basePrice: 680, sector: "Healthcare" },
  { symbol: "MCX.BSE", name: "Multi Commodity Exchange", basePrice: 3250, sector: "Finance" },
  { symbol: "METROPOLIS.BSE", name: "Metropolis Healthcare", basePrice: 1580, sector: "Healthcare" },
  { symbol: "MGL.BSE", name: "Mahanagar Gas", basePrice: 1280, sector: "Energy" },
  { symbol: "MPHASIS.BSE", name: "Mphasis Limited", basePrice: 2380, sector: "IT" },
  { symbol: "MRF.BSE", name: "MRF Limited", basePrice: 125000, sector: "Automobile" },
  { symbol: "NAM-INDIA.BSE", name: "Nippon Life India AMC", basePrice: 520, sector: "Finance" },
  { symbol: "NATIONALUM.BSE", name: "National Aluminium", basePrice: 145, sector: "Metal" },
  { symbol: "NIACL.BSE", name: "New India Assurance", basePrice: 185, sector: "Insurance" },
  { symbol: "OBEROIRLTY.BSE", name: "Oberoi Realty", basePrice: 1480, sector: "Real Estate" },
  { symbol: "OFSS.BSE", name: "Oracle Financial Services", basePrice: 8850, sector: "IT" },
  { symbol: "PATANJALI.BSE", name: "Patanjali Foods", basePrice: 1480, sector: "FMCG" },
  { symbol: "PERSISTENT.BSE", name: "Persistent Systems", basePrice: 4850, sector: "IT" },
  { symbol: "PETRONET.BSE", name: "Petronet LNG", basePrice: 285, sector: "Energy" },
  { symbol: "PIIND.BSE", name: "PI Industries", basePrice: 3580, sector: "Chemicals" },
  { symbol: "PRESTIGE.BSE", name: "Prestige Estates", basePrice: 1180, sector: "Real Estate" },
  { symbol: "PVRINOX.BSE", name: "PVR INOX", basePrice: 1480, sector: "Entertainment" },
  { symbol: "RAJESHEXPO.BSE", name: "Rajesh Exports", basePrice: 420, sector: "Consumer" },
  { symbol: "RAMCOCEM.BSE", name: "Ramco Cements", basePrice: 880, sector: "Cement" },
  { symbol: "RBLBANK.BSE", name: "RBL Bank", basePrice: 185, sector: "Banking" },
  { symbol: "SBICARD.BSE", name: "SBI Cards", basePrice: 780, sector: "Finance" },
  { symbol: "SHRIRAMFIN.BSE", name: "Shriram Finance", basePrice: 2180, sector: "Finance" },
  { symbol: "SONACOMS.BSE", name: "Sona BLW Precision", basePrice: 580, sector: "Automobile" },
  { symbol: "STAR.BSE", name: "Star Health Insurance", basePrice: 580, sector: "Insurance" },
  { symbol: "SUMICHEM.BSE", name: "Sumitomo Chemical", basePrice: 420, sector: "Chemicals" },
  { symbol: "SUNTV.BSE", name: "Sun TV Network", basePrice: 620, sector: "Media" },
  { symbol: "SYNGENE.BSE", name: "Syngene International", basePrice: 780, sector: "Pharma" },
  { symbol: "TATACHEM.BSE", name: "Tata Chemicals", basePrice: 1050, sector: "Chemicals" },
  { symbol: "TATACOMM.BSE", name: "Tata Communications", basePrice: 1780, sector: "Telecom" },
  { symbol: "TATAELXSI.BSE", name: "Tata Elxsi", basePrice: 6850, sector: "IT" },
  { symbol: "THERMAX.BSE", name: "Thermax Limited", basePrice: 2850, sector: "Industrial" },
  { symbol: "TIINDIA.BSE", name: "Tube Investments", basePrice: 3580, sector: "Industrial" },
  { symbol: "TITAN.BSE", name: "Titan Company", basePrice: 3250, sector: "Consumer" },
  { symbol: "TVSMOTOR.BSE", name: "TVS Motor", basePrice: 1850, sector: "Automobile" },
  { symbol: "UBL.BSE", name: "United Breweries", basePrice: 1680, sector: "Consumer" },
  { symbol: "UNIONBANK.BSE", name: "Union Bank of India", basePrice: 125, sector: "Banking" },
  { symbol: "VBL.BSE", name: "Varun Beverages", basePrice: 1580, sector: "Consumer" },
  { symbol: "WHIRLPOOL.BSE", name: "Whirlpool India", basePrice: 1280, sector: "Consumer" },
  { symbol: "YESBANK.BSE", name: "Yes Bank", basePrice: 22, sector: "Banking" },
  // Small Cap / Popular Stocks
  { symbol: "ADANIPOWER.BSE", name: "Adani Power", basePrice: 520, sector: "Power" },
  { symbol: "AFFLE.BSE", name: "Affle India", basePrice: 1180, sector: "IT" },
  { symbol: "AMARAJABAT.BSE", name: "Amara Raja Batteries", basePrice: 680, sector: "Automobile" },
  { symbol: "ATUL.BSE", name: "Atul Limited", basePrice: 6850, sector: "Chemicals" },
  { symbol: "APLAPOLLO.BSE", name: "APL Apollo Tubes", basePrice: 1480, sector: "Metal" },
  { symbol: "BAJAJELEC.BSE", name: "Bajaj Electricals", basePrice: 1050, sector: "Consumer" },
  { symbol: "BHARATFORG.BSE", name: "Bharat Forge", basePrice: 1280, sector: "Automobile" },
  { symbol: "BSE.BSE", name: "BSE Limited", basePrice: 2380, sector: "Finance" },
  { symbol: "CENTRALBK.BSE", name: "Central Bank of India", basePrice: 52, sector: "Banking" },
  { symbol: "CDSL.BSE", name: "CDSL", basePrice: 1480, sector: "Finance" },
  { symbol: "CGPOWER.BSE", name: "CG Power", basePrice: 520, sector: "Industrial" },
  { symbol: "CLEAN.BSE", name: "Clean Science", basePrice: 1280, sector: "Chemicals" },
  { symbol: "COROMANDEL.BSE", name: "Coromandel International", basePrice: 1180, sector: "Chemicals" },
  { symbol: "CYIENT.BSE", name: "Cyient Limited", basePrice: 1850, sector: "IT" },
  { symbol: "DCMSHRIRAM.BSE", name: "DCM Shriram", basePrice: 1050, sector: "Chemicals" },
  { symbol: "DIXON.BSE", name: "Dixon Technologies", basePrice: 5280, sector: "Consumer" },
  { symbol: "ELGIEQUIP.BSE", name: "Elgi Equipments", basePrice: 520, sector: "Industrial" },
  { symbol: "EMAMILTD.BSE", name: "Emami Limited", basePrice: 520, sector: "FMCG" },
  { symbol: "FINCABLES.BSE", name: "Finolex Cables", basePrice: 1050, sector: "Industrial" },
  { symbol: "FINPIPE.BSE", name: "Finolex Industries", basePrice: 280, sector: "Industrial" },
  { symbol: "FSL.BSE", name: "Firstsource Solutions", basePrice: 185, sector: "IT" },
  { symbol: "GNFC.BSE", name: "Gujarat Narmada Fertilizers", basePrice: 580, sector: "Chemicals" },
  { symbol: "GSFC.BSE", name: "Gujarat State Fertilizers", basePrice: 185, sector: "Chemicals" },
  { symbol: "GSPL.BSE", name: "Gujarat State Petronet", basePrice: 320, sector: "Energy" },
  { symbol: "HAPPSTMNDS.BSE", name: "Happiest Minds", basePrice: 780, sector: "IT" },
  { symbol: "HATSUN.BSE", name: "Hatsun Agro", basePrice: 1050, sector: "FMCG" },
  { symbol: "HONAUT.BSE", name: "Honeywell Automation", basePrice: 42500, sector: "Industrial" },
  { symbol: "IBREALEST.BSE", name: "Indiabulls Real Estate", basePrice: 105, sector: "Real Estate" },
  { symbol: "IDEA.BSE", name: "Vodafone Idea", basePrice: 12, sector: "Telecom" },
  { symbol: "INDIACEM.BSE", name: "India Cements", basePrice: 220, sector: "Cement" },
  { symbol: "INTELLECT.BSE", name: "Intellect Design Arena", basePrice: 780, sector: "IT" },
  { symbol: "IRB.BSE", name: "IRB Infrastructure", basePrice: 52, sector: "Infrastructure" },
  { symbol: "JAMNAAUTO.BSE", name: "Jamna Auto Industries", basePrice: 105, sector: "Automobile" },
  { symbol: "JINDALSAW.BSE", name: "Jindal Saw", basePrice: 320, sector: "Metal" },
  { symbol: "JMFINANCIL.BSE", name: "JM Financial", basePrice: 85, sector: "Finance" },
  { symbol: "JSL.BSE", name: "Jindal Stainless", basePrice: 580, sector: "Metal" },
  { symbol: "JYOTHYLAB.BSE", name: "Jyothy Labs", basePrice: 420, sector: "FMCG" },
  { symbol: "KAJARIACER.BSE", name: "Kajaria Ceramics", basePrice: 1280, sector: "Consumer" },
  { symbol: "KALPATPOWR.BSE", name: "Kalpataru Projects", basePrice: 1050, sector: "Infrastructure" },
  { symbol: "KEC.BSE", name: "KEC International", basePrice: 680, sector: "Infrastructure" },
  { symbol: "KEI.BSE", name: "KEI Industries", basePrice: 3280, sector: "Industrial" },
  { symbol: "KPITTECH.BSE", name: "KPIT Technologies", basePrice: 1380, sector: "IT" },
  { symbol: "KRBL.BSE", name: "KRBL Limited", basePrice: 320, sector: "FMCG" },
  { symbol: "KSB.BSE", name: "KSB Limited", basePrice: 2850, sector: "Industrial" },
  { symbol: "LALPATHLAB.BSE", name: "Dr Lal PathLabs", basePrice: 2180, sector: "Healthcare" },
  { symbol: "LATENTVIEW.BSE", name: "Latent View Analytics", basePrice: 420, sector: "IT" },
  { symbol: "LINDEINDIA.BSE", name: "Linde India", basePrice: 5850, sector: "Chemicals" },
  { symbol: "LTI.BSE", name: "Larsen & Toubro Infotech", basePrice: 4850, sector: "IT" },
  { symbol: "MASTEK.BSE", name: "Mastek Limited", basePrice: 2580, sector: "IT" },
  { symbol: "MINDTREE.BSE", name: "Mindtree Limited", basePrice: 3850, sector: "IT" },
  { symbol: "NATCOPHARM.BSE", name: "Natco Pharma", basePrice: 880, sector: "Pharma" },
  { symbol: "NAVINFLUOR.BSE", name: "Navin Fluorine", basePrice: 3580, sector: "Chemicals" },
  { symbol: "NETWORK18.BSE", name: "Network18 Media", basePrice: 78, sector: "Media" },
  { symbol: "NH.BSE", name: "Narayana Hrudayalaya", basePrice: 1180, sector: "Healthcare" },
  { symbol: "NLCINDIA.BSE", name: "NLC India", basePrice: 220, sector: "Power" },
  { symbol: "OLECTRA.BSE", name: "Olectra Greentech", basePrice: 1580, sector: "Automobile" },
  { symbol: "ORIENTELEC.BSE", name: "Orient Electric", basePrice: 280, sector: "Consumer" },
  { symbol: "PAYTM.BSE", name: "One97 Communications", basePrice: 520, sector: "IT" },
  { symbol: "PHOENIXLTD.BSE", name: "Phoenix Mills", basePrice: 1680, sector: "Real Estate" },
  { symbol: "PNBHOUSING.BSE", name: "PNB Housing Finance", basePrice: 780, sector: "Finance" },
  { symbol: "POLICYBZR.BSE", name: "PB Fintech", basePrice: 1050, sector: "Insurance" },
  { symbol: "POWERINDIA.BSE", name: "ABB Power Products", basePrice: 4280, sector: "Industrial" },
  { symbol: "PRSMJOHNSN.BSE", name: "Prism Johnson", basePrice: 145, sector: "Cement" },
  { symbol: "QUESS.BSE", name: "Quess Corp", basePrice: 520, sector: "Services" },
  { symbol: "RADICO.BSE", name: "Radico Khaitan", basePrice: 1580, sector: "Consumer" },
  { symbol: "RAIN.BSE", name: "Rain Industries", basePrice: 185, sector: "Chemicals" },
  { symbol: "RALLIS.BSE", name: "Rallis India", basePrice: 280, sector: "Chemicals" },
  { symbol: "RAYMOND.BSE", name: "Raymond Limited", basePrice: 1850, sector: "Textile" },
  { symbol: "REDINGTON.BSE", name: "Redington India", basePrice: 185, sector: "IT" },
  { symbol: "RELAXO.BSE", name: "Relaxo Footwears", basePrice: 780, sector: "Consumer" },
  { symbol: "ROUTE.BSE", name: "Route Mobile", basePrice: 1680, sector: "IT" },
  { symbol: "SCHAEFFLER.BSE", name: "Schaeffler India", basePrice: 3280, sector: "Automobile" },
  { symbol: "SPARC.BSE", name: "Sun Pharma Advanced", basePrice: 220, sector: "Pharma" },
  { symbol: "SOBHA.BSE", name: "Sobha Limited", basePrice: 780, sector: "Real Estate" },
  { symbol: "SOLARA.BSE", name: "Solara Active Pharma", basePrice: 420, sector: "Pharma" },
  { symbol: "SPICEJET.BSE", name: "SpiceJet Limited", basePrice: 52, sector: "Aviation" },
  { symbol: "STARCEMENT.BSE", name: "Star Cement", basePrice: 185, sector: "Cement" },
  { symbol: "SUVENPHAR.BSE", name: "Suven Pharma", basePrice: 520, sector: "Pharma" },
  { symbol: "SUZLON.BSE", name: "Suzlon Energy", basePrice: 38, sector: "Power" },
  { symbol: "SYMPHONY.BSE", name: "Symphony Limited", basePrice: 1050, sector: "Consumer" },
  { symbol: "TATACOMM.BSE", name: "Tata Communications", basePrice: 1780, sector: "Telecom" },
  { symbol: "TATAMETALI.BSE", name: "Tata Metaliks", basePrice: 880, sector: "Metal" },
  { symbol: "TEAMLEASE.BSE", name: "TeamLease Services", basePrice: 2850, sector: "Services" },
  { symbol: "THYROCARE.BSE", name: "Thyrocare Technologies", basePrice: 580, sector: "Healthcare" },
  { symbol: "TIMKEN.BSE", name: "Timken India", basePrice: 3050, sector: "Industrial" },
  { symbol: "TRIDENT.BSE", name: "Trident Limited", basePrice: 35, sector: "Textile" },
  { symbol: "TRITURBINE.BSE", name: "Triveni Turbine", basePrice: 420, sector: "Industrial" },
  { symbol: "TV18BRDCST.BSE", name: "TV18 Broadcast", basePrice: 42, sector: "Media" },
  { symbol: "UJJIVANSFB.BSE", name: "Ujjivan Small Finance Bank", basePrice: 45, sector: "Banking" },
  { symbol: "VAKRANGEE.BSE", name: "Vakrangee Limited", basePrice: 28, sector: "IT" },
  { symbol: "VARROC.BSE", name: "Varroc Engineering", basePrice: 480, sector: "Automobile" },
  { symbol: "VGUARD.BSE", name: "V-Guard Industries", basePrice: 420, sector: "Consumer" },
  { symbol: "VINATIORGA.BSE", name: "Vinati Organics", basePrice: 1850, sector: "Chemicals" },
  { symbol: "WELCORP.BSE", name: "Welspun Corp", basePrice: 420, sector: "Metal" },
  { symbol: "WELSPUNIND.BSE", name: "Welspun India", basePrice: 145, sector: "Textile" },
  { symbol: "WESTLIFE.BSE", name: "Westlife Foodworld", basePrice: 780, sector: "Consumer" },
  { symbol: "ZEEL.BSE", name: "Zee Entertainment", basePrice: 145, sector: "Media" },
  { symbol: "ZENSARTECH.BSE", name: "Zensar Technologies", basePrice: 520, sector: "IT" },
];

export async function fetchIntradayData(symbol: string): Promise<TimeSeriesData[]> {
  try {
    const response = await fetch(
      `${BASE_URL}?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=5min&apikey=${API_KEY}`
    );
    const data = await response.json();
    
    if (data["Time Series (5min)"]) {
      const timeSeries = data["Time Series (5min)"];
      return Object.entries(timeSeries)
        .slice(0, 60)
        .map(([timestamp, values]: [string, unknown]) => {
          const v = values as Record<string, string>;
          return {
            timestamp,
            open: parseFloat(v["1. open"]),
            high: parseFloat(v["2. high"]),
            low: parseFloat(v["3. low"]),
            close: parseFloat(v["4. close"]),
            volume: parseInt(v["5. volume"]),
          };
        })
        .reverse();
    }
    return [];
  } catch {
    return [];
  }
}

export async function fetchGlobalQuote(symbol: string): Promise<StockQuote | null> {
  try {
    const response = await fetch(
      `${BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`
    );
    const data = await response.json();
    
    if (data["Global Quote"]) {
      const quote = data["Global Quote"];
      const stock = INDIAN_STOCKS.find(s => s.symbol === symbol);
      return {
        symbol: quote["01. symbol"],
        name: stock?.name || symbol,
        price: parseFloat(quote["05. price"]),
        change: parseFloat(quote["09. change"]),
        changePercent: parseFloat(quote["10. change percent"]?.replace("%", "") || "0"),
        high: parseFloat(quote["03. high"]),
        low: parseFloat(quote["04. low"]),
        volume: parseInt(quote["06. volume"]),
      };
    }
    return null;
  } catch {
    return null;
  }
}

export function generateRealisticStockData(basePrice: number, points: number = 60): TimeSeriesData[] {
  const data: TimeSeriesData[] = [];
  let price = basePrice;
  const now = new Date();
  
  for (let i = points - 1; i >= 0; i--) {
    const volatility = 0.002;
    const drift = 0.0001;
    const randomWalk = (Math.random() - 0.5) * 2 * volatility * price;
    const trend = drift * price;
    
    price = Math.max(basePrice * 0.95, Math.min(basePrice * 1.05, price + randomWalk + trend));
    
    const high = price * (1 + Math.random() * 0.005);
    const low = price * (1 - Math.random() * 0.005);
    const open = low + Math.random() * (high - low);
    
    const timestamp = new Date(now.getTime() - i * 5 * 60 * 1000);
    
    data.push({
      timestamp: timestamp.toISOString(),
      open,
      high,
      low,
      close: price,
      volume: Math.floor(Math.random() * 1000000) + 100000,
    });
  }
  
  return data;
}

export function generateLivePrice(currentPrice: number): number {
  const change = (Math.random() - 0.48) * currentPrice * 0.001;
  return currentPrice + change;
}
