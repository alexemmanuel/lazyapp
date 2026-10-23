import {
  CountryInfo,
  ServiceItem,
  ApartmentItem,
  Recipe,
  ContactItem,
  MarketProvider,
} from '../types';

export const COUNTRY_CODES_RAW = `AF AL DZ AS AD AO AI AQ AG AR AM AW AU AT AZ BS BH BD BB BY BE BZ BJ BM BT BO BQ BA BW BV BR IO BN BG BF BI CV KH CM CA KY CF TD CL CN CX CC CO KM CG CD CK CR CI HR CU CW CY CZ DK DJ DM DO EC EG SV GQ ER EE SZ ET FK FO FJ FI FR GF PF TF GA GM GE DE GH GI GR GL GD GP GU GT GG GN GW GY HT HM VA HN HK HU IS IN ID IR IQ IE IM IL IT JM JP JE JO KZ KE KI KP KR KW KG LA LV LB LS LR LY LI LT LU MO MG MW MY MV ML MT MH MQ MR MU YT MX FM MD MC MN ME MS MA MZ MM NA NR NP NL NC NZ NI NE NG NU NF MK MP NO OM PK PW PS PA PG PY PE PH PN PL PT PR QA RE RO RU RW BL SH KN LC MF PM VC WS SM ST SA SN RS SC SL SG SX SK SI SB SO ZA GS SS ES LK SD SR SJ SE CH SY TW TJ TZ TH TL TG TK TO TT TN TR TM TC TV UG UA AE GB US UM UY UZ VU VE VN VG VI WF EH YE ZM ZW`
  .trim()
  .split(/\s+/);

const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });

export const ALL_COUNTRIES: CountryInfo[] = COUNTRY_CODES_RAW.map((code) => ({
  code,
  name: regionNames.of(code) ?? code,
  flag: code
    .split('')
    .map((char) => String.fromCodePoint(char.charCodeAt(0) + 127397))
    .join(''),
}));

export const COUNTRY_SET = new Set(COUNTRY_CODES_RAW);

export const TIMEZONE_TO_COUNTRY: Record<string, string> = {
  'Africa/Lagos': 'NG',
  'Africa/Accra': 'GH',
  'Africa/Cairo': 'EG',
  'Africa/Johannesburg': 'ZA',
  'Africa/Nairobi': 'KE',
  'Africa/Casablanca': 'MA',
  'America/Argentina/Buenos_Aires': 'AR',
  'America/Bogota': 'CO',
  'America/Chicago': 'US',
  'America/Denver': 'US',
  'America/Los_Angeles': 'US',
  'America/Mexico_City': 'MX',
  'America/New_York': 'US',
  'America/Sao_Paulo': 'BR',
  'America/Toronto': 'CA',
  'Asia/Dhaka': 'BD',
  'Asia/Dubai': 'AE',
  'Asia/Hong_Kong': 'HK',
  'Asia/Jakarta': 'ID',
  'Asia/Kolkata': 'IN',
  'Asia/Manila': 'PH',
  'Asia/Singapore': 'SG',
  'Asia/Tokyo': 'JP',
  'Australia/Sydney': 'AU',
  'Europe/Berlin': 'DE',
  'Europe/London': 'GB',
  'Europe/Madrid': 'ES',
  'Europe/Paris': 'FR',
  'Europe/Rome': 'IT',
  'Europe/Moscow': 'RU',
};

export const COUNTRY_CURRENCY: Record<string, string> = {
  NG: 'NGN',
  US: 'USD',
  GB: 'GBP',
  CA: 'CAD',
  AU: 'AUD',
  NZ: 'NZD',
  IN: 'INR',
  GH: 'GHS',
  KE: 'KES',
  ZA: 'ZAR',
  EG: 'EGP',
  MA: 'MAD',
  BR: 'BRL',
  MX: 'MXN',
  CO: 'COP',
  AR: 'ARS',
  JP: 'JPY',
  CN: 'CNY',
  KR: 'KRW',
  SG: 'SGD',
  AE: 'AED',
  SA: 'SAR',
  CH: 'CHF',
  DE: 'EUR',
  FR: 'EUR',
  ES: 'EUR',
  IT: 'EUR',
  NL: 'EUR',
  PT: 'EUR',
  IE: 'EUR',
  NO: 'NOK',
  SE: 'SEK',
  DK: 'DKK',
  PL: 'PLN',
  CZ: 'CZK',
  HUF: 'HUF',
  RON: 'RON',
  ISK: 'ISK',
  TRY: 'TRY',
  RUB: 'RUB',
};

export const EU_COUNTRIES = new Set([
  'AT', 'BE', 'BG', 'CY', 'CZ', 'DE', 'DK', 'EE', 'ES', 'FI', 'FR', 'GR',
  'HR', 'HU', 'IE', 'IT', 'LT', 'LU', 'LV', 'MT', 'NL', 'PL', 'PT', 'RO',
  'SE', 'SI', 'SK',
]);

export function isEU(country: string): boolean {
  return EU_COUNTRIES.has(country);
}

export function getCountryCurrency(code: string): string {
  if (isEU(code)) return 'EUR';
  return COUNTRY_CURRENCY[code] ?? 'USD';
}

export function getCurrencySymbol(code: string): string {
  if (code === 'CA') return 'C$';
  if (code === 'KE') return 'KSh';
  if (code === 'NG') return '₦';
  try {
    const parts = new Intl.NumberFormat('en', {
      style: 'currency',
      currency: getCountryCurrency(code),
      currencyDisplay: 'narrowSymbol',
    }).formatToParts(0);
    return parts.find((p) => p.type === 'currency')?.value ?? '$';
  } catch {
    return '$';
  }
}

export function formatCurrency(
  amount: number,
  country: string,
  options: { maximumFractionDigits?: number } = {}
): string {
  if (country === 'CA') {
    return `C$${new Intl.NumberFormat('en-CA', {
      minimumFractionDigits: options.maximumFractionDigits === 0 ? 0 : 2,
      maximumFractionDigits: options.maximumFractionDigits ?? 2,
    }).format(amount)}`;
  }
  const curr = getCountryCurrency(country);
  return new Intl.NumberFormat('en', {
    style: 'currency',
    currency: curr,
    maximumFractionDigits:
      options.maximumFractionDigits ?? (curr === 'JPY' || country === 'NG' ? 0 : 2),
  }).format(amount);
}

export function getCountryInfo(code: string): CountryInfo {
  if (code === 'GLOBAL') {
    return { code: 'GLOBAL', name: 'Global default', flag: '🌍' };
  }
  return (
    ALL_COUNTRIES.find((c) => c.code === code) ?? {
      code: 'GLOBAL',
      name: 'Global default',
      flag: '🌍',
    }
  );
}

export function detectDefaultCountry(): string {
  if (typeof navigator !== 'undefined') {
    const langs = [...(navigator.languages ?? []), navigator.language];
    for (const lang of langs) {
      try {
        const region = new Intl.Locale(lang).region?.toUpperCase();
        if (region && COUNTRY_SET.has(region)) return region;
      } catch {
        // continue
      }
    }
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz && TIMEZONE_TO_COUNTRY[tz]) return TIMEZONE_TO_COUNTRY[tz];
    } catch {
      // continue
    }
  }
  return 'NG';
}

export function getIdentityVerificationBadge(country: string): string {
  if (country === 'NG') return 'BVN/NIN Verified';
  if (country === 'US') return 'SSN Background Checked';
  if (country === 'GB') return 'DBS & ID Verified';
  if (country === 'CA') return 'RCMP & ID Checked';
  if (isEU(country)) return 'eIDAS / National ID Verified';
  return 'Gov. ID & Biometric Verified';
}

export function getArtisanNetworkName(country: string): string {
  if (country === 'NG') return 'local artisan networks';
  if (country === 'US') return 'TaskRabbit / Angi';
  if (country === 'GB') return 'Checkatrade / Bark.com';
  if (country === 'CA') return 'Jiffy / HomeStars';
  if (isEU(country)) return 'Helpling / local craft networks';
  return 'nearby independent providers';
}

export function getDispatchSuccessMessage(country: string, name: string): string {
  if (country === 'NG') return `🇳🇬 Local artisan assigned: ${name} is 1.5 km away.`;
  if (country === 'US') return `🇺🇸 TaskRabbit Pro confirmed: ${name} accepted your request.`;
  if (country === 'GB') return `🇬🇧 Checkatrade engineer dispatched: ${name} is on their way.`;
  if (country === 'CA') return `🇨🇦 Jiffy professional confirmed: ${name} accepted your request.`;
  return `🌍 Nearby provider confirmed: ${name} accepted your request.`;
}

export function getArtisanSearchLoadingText(country: string): string {
  if (country === 'NG') return 'Scanning verified Nigerian artisans...';
  if (country === 'US') return 'Sourcing nearby US TaskRabbit pros...';
  if (country === 'GB') return 'Finding nearby UK Checkatrade pros...';
  if (country === 'CA') return 'Searching nearby Jiffy and HomeStars pros...';
  if (isEU(country)) return 'Checking Helpling and local craft networks...';
  return 'Contacting nearby verified freelance providers...';
}

/* =========================================================================
   COMPARE SERVICE GENERATOR
   ========================================================================= */

export const LOADING_STEPS_NG = [
  'Checking Chowdeck...',
  'Checking Bolt Food...',
  'Pinging Rida drivers...',
  'Asking Glovo riders...',
  'Comparing prices so you can stay in bed...',
];

export const LOADING_STEPS_US = [
  'Checking DoorDash rates...',
  'Pinging Uber drivers...',
  'Querying Lyft nearby...',
  'Checking Grubhub coupons...',
  'Comparing prices so you don’t have to get up...',
];

export const LOADING_STEPS_GB = [
  'Checking Deliveroo nearby... 🚲',
  'Pinging Just Eat... 🍽️',
  'Finding a local Bolt ride... 🚗',
  'Asking UberEats to hurry... 🥡',
  'Comparing prices so you can put the kettle on... ☕',
];

export const LOADING_STEPS_KE = [
  'Checking Jumia Food... 🍛',
  'Pinging Bolt Food... 🚗',
  'Finding a Little Ride nearby... 🛺',
  'Checking Glovo... 🛵',
  'Comparing prices so you can relax... 😴',
];

export const LOADING_STEPS_GLOBAL = [
  'Checking local ride options...',
  'Searching food delivery rates...',
  'Finding available drivers...',
  'Comparing delivery fees...',
  'Finding the cheapest & fastest option...',
];

export function generateServicesComparison(query: string, country: string): ServiceItem[] {
  const isRide = /ride|taxi|car|drive|airport|downtown|hotel|station|uber|bolt|rida|lyft|indrive/i.test(query);
  const qLen = query.length || 6;
  const num = (min: number, max: number, seed = 0) =>
    Math.round((min + ((qLen + seed) % (max - min + 1))) * 100) / 100;

  let base: ServiceItem[] = [];

  if (country === 'NG') {
    if (isRide) {
      base = [
        {
          id: 'rida',
          name: 'Rida',
          initials: 'R',
          category: 'ride',
          price: num(2500, 7500, 1),
          time: num(3, 15, 2),
          available: true,
          color: 'bg-emerald-950',
          textColor: 'text-emerald-300',
          borderColor: 'border-emerald-800',
        },
        {
          id: 'indrive',
          name: 'InDrive',
          initials: 'ID',
          category: 'ride',
          price: num(2000, 6500, 4),
          time: num(5, 18, 6),
          surge: Math.random() > 0.6 ? parseFloat((1 + Math.random() * 0.3).toFixed(1)) : undefined,
          available: true,
          color: 'bg-sky-950',
          textColor: 'text-sky-300',
          borderColor: 'border-sky-800',
        },
        {
          id: 'bolt',
          name: 'Bolt',
          initials: 'Bo',
          category: 'ride',
          price: num(2800, 8000, 7),
          time: num(4, 16, 3),
          available: true,
          color: 'bg-lime-950',
          textColor: 'text-lime-300',
          borderColor: 'border-lime-800',
        },
        {
          id: 'glovo',
          name: 'Glovo',
          initials: 'G',
          category: 'delivery',
          price: num(1500, 3500, 9),
          time: num(20, 45, 5),
          available: false,
          color: 'bg-amber-950',
          textColor: 'text-amber-300',
          borderColor: 'border-amber-800',
        },
      ];
    } else {
      base = [
        {
          id: 'chowdeck',
          name: 'Chowdeck',
          initials: 'CD',
          category: 'delivery',
          price: num(1200, 3200, 3),
          time: num(20, 40, 9),
          available: true,
          color: 'bg-orange-950',
          textColor: 'text-orange-300',
          borderColor: 'border-orange-800',
        },
        {
          id: 'boltfood',
          name: 'Bolt Food',
          initials: 'BF',
          category: 'delivery',
          price: num(1000, 2800, 8),
          time: num(25, 50, 4),
          available: true,
          color: 'bg-lime-950',
          textColor: 'text-lime-300',
          borderColor: 'border-lime-800',
        },
        {
          id: 'glovo',
          name: 'Glovo',
          initials: 'G',
          category: 'delivery',
          price: num(1500, 3800, 1),
          time: num(22, 45, 2),
          available: true,
          color: 'bg-amber-950',
          textColor: 'text-amber-300',
          borderColor: 'border-amber-800',
        },
        {
          id: 'rida',
          name: 'Rida',
          initials: 'R',
          category: 'ride',
          price: num(3000, 8000, 5),
          time: num(5, 15, 7),
          available: false,
          color: 'bg-emerald-950',
          textColor: 'text-emerald-300',
          borderColor: 'border-emerald-800',
        },
      ];
    }
  } else if (country === 'US') {
    if (isRide) {
      base = [
        {
          id: 'uber',
          name: 'Uber',
          initials: 'U',
          category: 'ride',
          price: num(8, 22, 1),
          time: num(3, 12, 2),
          surge: Math.random() > 0.6 ? parseFloat((1 + Math.random() * 0.5).toFixed(1)) : undefined,
          available: true,
          color: 'bg-zinc-900',
          textColor: 'text-zinc-100',
          borderColor: 'border-zinc-700',
        },
        {
          id: 'lyft',
          name: 'Lyft',
          initials: 'L',
          category: 'ride',
          price: num(7, 20, 5),
          time: num(4, 14, 7),
          available: true,
          color: 'bg-pink-950',
          textColor: 'text-pink-300',
          borderColor: 'border-pink-800',
        },
        {
          id: 'doordash',
          name: 'DoorDash',
          initials: 'DD',
          category: 'delivery',
          price: num(8, 18, 3),
          time: num(20, 40, 9),
          available: false,
          color: 'bg-red-950',
          textColor: 'text-red-400',
          borderColor: 'border-red-900',
        },
        {
          id: 'grubhub',
          name: 'Grubhub',
          initials: 'GH',
          category: 'delivery',
          price: num(7, 16, 8),
          time: num(25, 50, 4),
          available: false,
          color: 'bg-orange-950',
          textColor: 'text-orange-300',
          borderColor: 'border-orange-800',
        },
      ];
    } else {
      base = [
        {
          id: 'doordash',
          name: 'DoorDash',
          initials: 'DD',
          category: 'delivery',
          price: num(4, 12, 3),
          time: num(20, 40, 9),
          available: true,
          color: 'bg-red-950',
          textColor: 'text-red-400',
          borderColor: 'border-red-900',
        },
        {
          id: 'ubereats',
          name: 'UberEats',
          initials: 'UE',
          category: 'delivery',
          price: num(5, 15, 1),
          time: num(22, 45, 2),
          available: true,
          color: 'bg-zinc-900',
          textColor: 'text-zinc-300',
          borderColor: 'border-zinc-700',
        },
        {
          id: 'grubhub',
          name: 'Grubhub',
          initials: 'GH',
          category: 'delivery',
          price: num(4, 13, 8),
          time: num(25, 50, 4),
          available: true,
          color: 'bg-orange-950',
          textColor: 'text-orange-300',
          borderColor: 'border-orange-800',
        },
        {
          id: 'lyft',
          name: 'Lyft',
          initials: 'L',
          category: 'ride',
          price: num(12, 25, 5),
          time: num(5, 15, 7),
          available: false,
          color: 'bg-pink-950',
          textColor: 'text-pink-300',
          borderColor: 'border-pink-800',
        },
      ];
    }
  } else if (country === 'GB') {
    base = [
      {
        id: 'deliveroo',
        name: 'Deliveroo',
        initials: 'D',
        category: 'delivery',
        price: num(5, 14, 3),
        time: num(20, 42, 9),
        available: true,
        color: 'bg-cyan-950',
        textColor: 'text-cyan-300',
        borderColor: 'border-cyan-800',
      },
      {
        id: 'just-eat',
        name: 'Just Eat',
        initials: 'JE',
        category: 'delivery',
        price: num(4, 13, 1),
        time: num(22, 45, 2),
        available: true,
        color: 'bg-orange-950',
        textColor: 'text-orange-300',
        borderColor: 'border-orange-800',
      },
      {
        id: 'ubereats',
        name: 'UberEats',
        initials: 'UE',
        category: 'delivery',
        price: num(5, 15, 8),
        time: num(25, 50, 4),
        available: true,
        color: 'bg-zinc-900',
        textColor: 'text-zinc-300',
        borderColor: 'border-zinc-700',
      },
      {
        id: 'bolt',
        name: 'Bolt',
        initials: 'B',
        category: 'ride',
        price: num(7, 18, 5),
        time: num(5, 15, 7),
        available: false,
        color: 'bg-lime-950',
        textColor: 'text-lime-300',
        borderColor: 'border-lime-800',
      },
    ];
  } else if (country === 'CA') {
    base = [
      {
        id: 'doordash',
        name: 'DoorDash',
        initials: 'DD',
        category: 'delivery',
        price: num(6, 18, 3),
        time: num(20, 40, 9),
        available: true,
        color: 'bg-red-950',
        textColor: 'text-red-400',
        borderColor: 'border-red-900',
      },
      {
        id: 'ubereats',
        name: 'UberEats',
        initials: 'UE',
        category: 'delivery',
        price: num(7, 20, 1),
        time: num(22, 45, 2),
        available: true,
        color: 'bg-zinc-900',
        textColor: 'text-zinc-300',
        borderColor: 'border-zinc-700',
      },
      {
        id: 'instacart',
        name: 'Instacart',
        initials: 'IC',
        category: 'delivery',
        price: num(8, 24, 8),
        time: num(30, 55, 4),
        available: true,
        color: 'bg-emerald-950',
        textColor: 'text-emerald-300',
        borderColor: 'border-emerald-800',
      },
      {
        id: 'lyft',
        name: 'Lyft',
        initials: 'L',
        category: 'ride',
        price: num(14, 28, 5),
        time: num(5, 16, 7),
        available: false,
        color: 'bg-pink-950',
        textColor: 'text-pink-300',
        borderColor: 'border-pink-800',
      },
    ];
  } else {
    base = [
      {
        id: 'uber',
        name: 'Uber',
        initials: 'U',
        category: 'ride',
        price: num(8, 22, 1),
        time: num(4, 16, 2),
        available: true,
        color: 'bg-zinc-900',
        textColor: 'text-zinc-100',
        borderColor: 'border-zinc-700',
      },
      {
        id: 'bolt',
        name: 'Bolt',
        initials: 'B',
        category: 'ride',
        price: num(7, 20, 5),
        time: num(5, 18, 7),
        available: true,
        color: 'bg-lime-950',
        textColor: 'text-lime-300',
        borderColor: 'border-lime-800',
      },
      {
        id: 'glovo',
        name: 'Glovo',
        initials: 'G',
        category: 'delivery',
        price: num(5, 16, 3),
        time: num(20, 42, 9),
        available: true,
        color: 'bg-amber-950',
        textColor: 'text-amber-300',
        borderColor: 'border-amber-800',
      },
      {
        id: 'localexpress',
        name: 'Local Express',
        initials: 'LE',
        category: 'delivery',
        price: num(4, 14, 8),
        time: num(25, 50, 4),
        available: false,
        color: 'bg-violet-950',
        textColor: 'text-violet-300',
        borderColor: 'border-violet-800',
      },
    ];
  }

  return base.map((item, index) => ({
    ...item,
    isIdentityVerified: index !== 2,
    safetyScore: index === 1 ? 96 : index === 2 ? 91 : 99,
    reportCount: index === 2 ? 1 : 0,
  }));
}

/* =========================================================================
   APARTMENT GENERATOR
   ========================================================================= */

export const APARTMENT_PLATFORM_THEMES: Record<
  string,
  { color: string; textColor: string; borderColor: string; emoji: string }
> = {
  Airbnb: {
    color: 'bg-rose-950/80',
    textColor: 'text-rose-300',
    borderColor: 'border-rose-800/60',
    emoji: '🏠',
  },
  'Booking.com': {
    color: 'bg-blue-950/80',
    textColor: 'text-blue-300',
    borderColor: 'border-blue-800/60',
    emoji: '🔵',
  },
  PropertyPro: {
    color: 'bg-emerald-950/80',
    textColor: 'text-emerald-300',
    borderColor: 'border-emerald-800/60',
    emoji: '🏘️',
  },
  VRBO: {
    color: 'bg-teal-950/80',
    textColor: 'text-teal-300',
    borderColor: 'border-teal-800/60',
    emoji: '🏖️',
  },
};

export const REPORT_REASONS = [
  'Suspicious behavior',
  'Unsafe pricing',
  'Fake listing',
];

export function generateApartments(city: string, country: string): ApartmentItem[] {
  const cLen = city.trim().length || 6;
  const num = (min: number, max: number, seed = 0) => min + ((cLen + seed) % (max - min + 1));
  const dec = (min: number, max: number, seed = 0) =>
    parseFloat((min + (((cLen + seed) / (max - min + 1)) % (max - min))).toFixed(1));

  const platforms =
    country === 'NG'
      ? ['Airbnb', 'Booking.com', 'PropertyPro']
      : ['Airbnb', 'Booking.com', 'VRBO'];

  const ngNames: Record<string, [string, string]> = {
    Airbnb: [`${city} Luxury 2BR Suite`, `${city} Cozy Studio Lekki`],
    'Booking.com': [`${city} Business Apartment`, `${city} City Center Flat`],
    PropertyPro: [`${city} Serviced Apt Ikoyi`, `${city} Modern Duplex VI`],
  };

  const globalNames: Record<string, [string, string]> = {
    Airbnb: [`${city} Stylish Downtown Apt`, `${city} Cozy Neighborhood Flat`],
    'Booking.com': [`${city} Boutique Suites`, `${city} Extended Stay Premium`],
    VRBO: [`${city} Entire Home — Central`, `${city} Family Retreat Near Park`],
  };

  const namesMap = country === 'NG' ? ngNames : globalNames;
  const results: ApartmentItem[] = [];

  platforms.forEach((plat, index) => {
    const [name1, name2] = namesMap[plat] ?? [`${city} ${plat} A`, `${city} ${plat} B`];
    const theme = APARTMENT_PLATFORM_THEMES[plat] ?? APARTMENT_PLATFORM_THEMES.Airbnb;

    const dist1 = parseFloat((0.2 + num(1, 25, index * 3) / 10).toFixed(1));
    const dist2 = parseFloat((dist1 + 0.5 + num(0, 30, index * 7) / 10).toFixed(1));

    const price1 = country === 'NG' ? num(28000, 95000, index * 11) : num(85, 340, index * 11);
    const price2 = country === 'NG' ? num(20000, 70000, index * 13) : num(65, 260, index * 13);

    const rating1 = parseFloat(Math.min(5, 4.0 + dec(0, 10, index * 5) / 10).toFixed(1));
    const rating2 = parseFloat(Math.min(5, 3.8 + dec(0, 10, index * 9) / 10).toFixed(1));

    const safe1 = rating1 >= 4.6 && (plat === 'Airbnb' || plat === 'Booking.com' || plat === 'PropertyPro');
    const safe2 = rating2 >= 4.7 && plat === 'Airbnb';

    results.push({
      id: `${plat}-1`,
      platform: plat,
      name: name1,
      distanceKm: dist1,
      pricePerNight: price1,
      rating: rating1,
      reviews: num(50, 480, index * 17),
      verifiedSafe: safe1,
      isIdentityVerified: safe1,
      safetyScore: safe1 ? 98 : 91,
      reportCount: 0,
      emoji: theme.emoji,
      color: theme.color,
      textColor: theme.textColor,
      borderColor: theme.borderColor,
    });

    results.push({
      id: `${plat}-2`,
      platform: plat,
      name: name2,
      distanceKm: dist2,
      pricePerNight: price2,
      rating: rating2,
      reviews: num(20, 280, index * 19),
      verifiedSafe: safe2,
      isIdentityVerified: safe2,
      safetyScore: safe2 ? 97 : 89,
      reportCount: index === 1 ? 1 : 0,
      emoji: theme.emoji,
      color: theme.color,
      textColor: theme.textColor,
      borderColor: theme.borderColor,
    });
  });

  return results;
}

export function formatDistance(distanceKm: number, country: string): string {
  if (country === 'US' || country === 'GB') {
    return `${(distanceKm * 0.621371).toFixed(1)} mi`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

/* =========================================================================
   RECIPES & PANTRY DATA (LAZY COOK)
   ========================================================================= */

export const PANTRY_PRESETS = [
  { label: '🥚 Eggs', value: 'eggs' },
  { label: '🧀 Cheese', value: 'cheese' },
  { label: '🍝 Pasta', value: 'pasta' },
  { label: '🍗 Chicken', value: 'chicken' },
  { label: '🧄 Garlic', value: 'garlic' },
  { label: '🍚 Rice', value: 'rice' },
  { label: '🧈 Butter', value: 'butter' },
  { label: '🍞 Bread', value: 'bread' },
  { label: '🥑 Avocado', value: 'avocado' },
  { label: '🍅 Tomatoes', value: 'tomatoes' },
  { label: '🌿 Spinach', value: 'spinach' },
  { label: '🐟 Tuna', value: 'tuna' },
  { label: '🍌 Banana', value: 'banana' },
  { label: '🌾 Oats', value: 'oats' },
  { label: '🫒 Olive Oil', value: 'olive oil' },
];

export const COOK_LOADING_MESSAGES = [
  'Raiding the pantry...',
  "Consulting Gordon Ramsay's ghost...",
  'Checking what pairs well...',
  'Pretending we have Michelin stars...',
  'Keeping it under 10 minutes, promise...',
];

export const RECIPES_CATALOG: { keys: string[]; recipe: Recipe }[] = [
  {
    keys: ['eggs', 'cheese', 'butter'],
    recipe: {
      name: 'Cheesy Scrambled Eggs',
      emoji: '🍳',
      prepMins: 5,
      servings: 1,
      tags: ['Breakfast', 'Protein', 'Keto'],
      funFact: "Gordon Ramsay takes 8 minutes. You're doing it in 5. You win.",
      steps: [
        'Crack 2–3 eggs into a bowl, whisk with a pinch of salt.',
        'Melt butter in a non-stick pan over medium-low heat.',
        'Pour in eggs and gently fold with a spatula — slow and lazy wins here.',
        'When almost set, pull off heat and fold in a generous handful of cheese.',
        'Serve immediately before you second-guess yourself.',
      ],
    },
  },
  {
    keys: ['eggs', 'rice'],
    recipe: {
      name: 'Fried Rice, No Drama',
      emoji: '🍚',
      prepMins: 8,
      servings: 1,
      tags: ['Asian-ish', 'Quick', 'Leftover Magic'],
      funFact: 'Day-old rice is actually better here. Laziness = superior flavor.',
      steps: [
        'Heat a splash of oil in a pan over high heat until shimmering.',
        'Add cold rice and press into the pan — let it crisp for 2 min.',
        'Push rice aside, crack in 1–2 eggs and scramble them.',
        'Mix eggs through the rice, season with soy sauce and black pepper.',
        'Eat straight from the pan. One fewer dish to wash.',
      ],
    },
  },
  {
    keys: ['pasta', 'garlic', 'olive oil'],
    recipe: {
      name: 'Aglio e Olio (Fancy Lazy)',
      emoji: '🍝',
      prepMins: 9,
      servings: 2,
      tags: ['Italian', 'Pantry Hero', 'Vegetarian'],
      funFact: "This is what Italians eat at midnight. You're practically European.",
      steps: [
        'Boil salted water and cook pasta until al dente.',
        'While pasta cooks, thinly slice 4 garlic cloves.',
        'Warm ¼ cup olive oil in a pan, add garlic and toast until golden.',
        'Drain pasta, reserve ½ cup pasta water.',
        'Toss pasta in garlic oil, splash in pasta water to make it silky.',
      ],
    },
  },
  {
    keys: ['bread', 'eggs', 'butter'],
    recipe: {
      name: 'Perfect French Toast',
      emoji: '🍞',
      prepMins: 7,
      servings: 2,
      tags: ['Breakfast', 'Sweet', 'Classic'],
      funFact: "Neither French nor toast. But nobody's complaining.",
      steps: [
        'Whisk 2 eggs with a splash of milk and a pinch of cinnamon.',
        'Melt butter in a pan over medium heat.',
        'Dip bread slices in the egg mix — both sides, 10 seconds each.',
        'Cook in butter 2–3 min per side until golden brown.',
        'Top with maple syrup or powdered sugar. Your call.',
      ],
    },
  },
  {
    keys: ['avocado', 'bread'],
    recipe: {
      name: 'Lazy Avo Toast',
      emoji: '🥑',
      prepMins: 4,
      servings: 1,
      tags: ['Millennial Classic', 'Vegetarian', 'Quick'],
      funFact: 'Responsible for an entire generation not owning houses. Worth it.',
      steps: [
        "Toast your bread until golden. Yes, that's the hardest part.",
        'Halve the avocado, scoop flesh into a bowl.',
        "Mash with a fork — chunky is fine, you're not at a restaurant.",
        'Spread on toast, season with salt, pepper, squeeze of lemon.',
        'Add chili flakes or everything bagel seasoning if you’re feeling fancy.',
      ],
    },
  },
  {
    keys: ['chicken', 'garlic'],
    recipe: {
      name: 'Garlic Pan Chicken',
      emoji: '🍗',
      prepMins: 9,
      servings: 2,
      tags: ['High Protein', 'Weeknight', 'Easy Win'],
      funFact: 'Garlic is basically a cheat code for making anything taste intentional.',
      steps: [
        'Pound chicken thin or buy thin-cut. Season with salt and pepper.',
        'Heat oil in a skillet over medium-high until shimmering.',
        'Cook chicken 3–4 min per side until golden and cooked through.',
        'Add smashed garlic cloves in the last 2 min — let them infuse the oil.',
        'Rest 2 min before cutting. Drizzle pan juices over the top.',
      ],
    },
  },
  {
    keys: ['tuna', 'pasta'],
    recipe: {
      name: 'Tuna Pasta, No Apologies',
      emoji: '🐟',
      prepMins: 9,
      servings: 2,
      tags: ['Pantry Hero', 'Cheap Eats', 'Omega-3s'],
      funFact: 'Italians actually eat this. Tonno e pasta is totally a thing.',
      steps: [
        'Boil pasta in well-salted water until al dente.',
        'Drain a can of tuna and break it up with a fork.',
        'Warm olive oil, add a clove of garlic, cook 1 min.',
        'Add tuna and a splash of pasta water, toss to coat.',
        'Drain pasta, mix through. Lemon and parmesan strongly encouraged.',
      ],
    },
  },
  {
    keys: ['tomatoes', 'eggs'],
    recipe: {
      name: 'Shakshuka Shortcut',
      emoji: '🍅',
      prepMins: 9,
      servings: 2,
      tags: ['Middle Eastern', 'One Pan', 'Brunch Flex'],
      funFact: "Sounds exotic. Is basically eggs in tomato sauce. You've got this.",
      steps: [
        'Pour crushed tomatoes (1 can) into a skillet.',
        'Season with cumin, paprika, garlic powder, salt. Simmer 3 min.',
        'Make little wells in the sauce with a spoon.',
        'Crack eggs directly into the wells. Cover and cook 5–6 min.',
        'Serve with bread to scoop it all up. You’re welcome.',
      ],
    },
  },
  {
    keys: ['banana', 'oats'],
    recipe: {
      name: '2-Minute Banana Oats',
      emoji: '🍌',
      prepMins: 3,
      servings: 1,
      tags: ['Breakfast', 'Vegan', 'No Excuses'],
      funFact: '3 minutes including the time it takes you to find a bowl.',
      steps: [
        'Mash a ripe banana in a bowl until mostly smooth.',
        'Add ½ cup quick oats and ¾ cup milk (any kind).',
        'Microwave for 90 seconds. Stir. Microwave 30 more seconds.',
        'Top with honey, peanut butter, or whatever you have.',
        "It's basically a hug in a bowl. You're welcome.",
      ],
    },
  },
  {
    keys: ['cheese', 'bread', 'butter'],
    recipe: {
      name: 'The Perfect Grilled Cheese',
      emoji: '🧀',
      prepMins: 6,
      servings: 1,
      tags: ['Comfort Food', 'Childhood', 'Perfect'],
      funFact: 'There are 500 ways to make this. All of them are correct.',
      steps: [
        'Butter one side of each bread slice generously.',
        'Place one slice butter-side down in a cold pan. Add cheese.',
        'Top with second slice, butter-side up.',
        'Turn heat to medium-low. Cook 3 min until underside is golden.',
        'Flip, press gently, cook 2 more min. Pull off. Devour.',
      ],
    },
  },
  {
    keys: ['spinach', 'eggs', 'garlic'],
    recipe: {
      name: 'Green Eggs, No Ham',
      emoji: '🥬',
      prepMins: 7,
      servings: 1,
      tags: ['Healthy-ish', 'Quick', 'Dr. Seuss Approved'],
      funFact: "You'll feel like a functioning adult after eating this.",
      steps: [
        'Heat oil over medium, add minced garlic and sauté 30 seconds.',
        'Throw in a big handful of spinach — it will shrink, don’t panic.',
        'Push spinach aside, crack in 2 eggs.',
        'Cook to your liking. Season with salt and pepper.',
        'Eat and feel briefly virtuous.',
      ],
    },
  },
  {
    keys: ['avocado', 'eggs'],
    recipe: {
      name: 'Eggs in Avo Boats',
      emoji: '🥑',
      prepMins: 8,
      servings: 2,
      tags: ['Keto', 'Trendy', 'Actually Tasty'],
      funFact: "This costs $18 at brunch. You're making it at home. Genius.",
      steps: [
        'Preheat oven to 425°F (220°C).',
        'Cut avocado in half, remove pit, scoop out a little extra flesh.',
        'Crack one egg into each avocado half.',
        'Bake 12–15 min until egg whites are set but yolk is runny.',
        'Season with salt, pepper, chili flakes. Eat with a spoon.',
      ],
    },
  },
];

export const FALLBACK_RECIPES: Recipe[] = [
  {
    name: 'Fridge Roulette Bowl',
    emoji: '🎲',
    prepMins: 5,
    servings: 1,
    tags: ['Improvised', 'Brave', 'YOLO'],
    funFact: 'No recipe required when confidence is your main ingredient.',
    steps: [
      'Open fridge. Stare for 30 seconds. Close. Open again.',
      'Grab whatever you’ve been avoiding and commit.',
      'Heat a pan with a splash of oil over medium heat.',
      'Add ingredients in order of how long they take to cook.',
      'Season with salt, pepper, hot sauce. Call it fusion cuisine.',
    ],
  },
  {
    name: 'Mystery Pantry Stir-Fry',
    emoji: '🫙',
    prepMins: 8,
    servings: 2,
    tags: ['Creative', 'Adventurous', 'No Judgment'],
    funFact: 'Every great chef started with random ingredients and zero plan.',
    steps: [
      'Dice everything into roughly equal bite-sized pieces.',
      'Get a pan screaming hot — medium-high, don’t be shy.',
      'Add ingredients starting with the hardest ones.',
      'Stir frequently, add soft items last (leafy greens, eggs).',
      "Splash in soy sauce or any sauce you own. It'll work.",
    ],
  },
];

export function findRecipeForIngredients(ingredients: string[]): Recipe {
  const lower = ingredients.map((i) => i.toLowerCase().trim());
  let bestRecipe: Recipe | null = null;
  let maxMatches = 0;

  for (const item of RECIPES_CATALOG) {
    const matches = item.keys.filter((key) =>
      lower.some((ing) => ing.includes(key) || key.includes(ing))
    ).length;
    if (matches > maxMatches) {
      maxMatches = matches;
      bestRecipe = item.recipe;
    }
  }

  if (bestRecipe && maxMatches >= 1) {
    return bestRecipe;
  }
  return FALLBACK_RECIPES[Math.floor(Math.random() * FALLBACK_RECIPES.length)];
}

/* =========================================================================
   TASK & ARTISANS DATA (LAZY TASK)
   ========================================================================= */

export const TASK_CATEGORIES = ['Plumber', 'Electrician', 'Laundry', 'Locksmith'];

export const CATEGORY_CONFIG: Record<
  string,
  { emoji: string; color: string; bg: string; border: string; ring: string }
> = {
  Plumber: {
    emoji: '🔧',
    color: 'text-blue-400',
    bg: 'bg-blue-500/12',
    border: 'border-blue-500/30',
    ring: 'ring-blue-500/15',
  },
  Electrician: {
    emoji: '⚡',
    color: 'text-amber-400',
    bg: 'bg-amber-500/12',
    border: 'border-amber-500/30',
    ring: 'ring-amber-500/15',
  },
  Laundry: {
    emoji: '👕',
    color: 'text-sky-400',
    bg: 'bg-sky-500/12',
    border: 'border-sky-500/30',
    ring: 'ring-sky-500/15',
  },
  Locksmith: {
    emoji: '🔑',
    color: 'text-violet-400',
    bg: 'bg-violet-500/12',
    border: 'border-violet-500/30',
    ring: 'ring-violet-500/15',
  },
  Mechanic: {
    emoji: '🚗',
    color: 'text-rose-400',
    bg: 'bg-rose-500/12',
    border: 'border-rose-500/30',
    ring: 'ring-rose-500/15',
  },
  Cleaner: {
    emoji: '✨',
    color: 'text-teal-400',
    bg: 'bg-teal-500/12',
    border: 'border-teal-500/30',
    ring: 'ring-teal-500/15',
  },
  Painter: {
    emoji: '🎨',
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/12',
    border: 'border-indigo-500/30',
    ring: 'ring-indigo-500/15',
  },
  Carpenter: {
    emoji: '🪵',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/12',
    border: 'border-yellow-500/30',
    ring: 'ring-yellow-500/15',
  },
  Handyman: {
    emoji: '🛠️',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/12',
    border: 'border-emerald-500/30',
    ring: 'ring-emerald-500/15',
  },
};

export const DEFAULT_CONTACTS: ContactItem[] = [
  {
    id: 1,
    name: 'Baba Tunde',
    category: 'Plumber',
    phone: '+234 000 000 0001',
    notes: 'Saved personal contact. Verify current availability directly.',
    country: 'NG',
    isIdentityVerified: false,
    reportCount: 0,
  },
  {
    id: 2,
    name: 'Chidi',
    category: 'Electrician',
    phone: '+234 000 000 0002',
    notes: 'Saved personal contact. Verify current availability directly.',
    country: 'NG',
    isIdentityVerified: false,
    reportCount: 0,
  },
];

export const REGIONAL_MARKET_PROVIDERS: Record<
  string,
  Record<string, { name: string; rating: number; reviews: number; distance: string; phone: string; badge: string }[]>
> = {
  NG: {
    Plumber: [
      { name: 'Oluwaseun - Verified Plumber', rating: 4.9, reviews: 182, distance: '1.2 km', phone: '+234 803 123 4567', badge: 'Local artisan vetted' },
      { name: 'Chidi - AC Specialist', rating: 4.8, reviews: 141, distance: '2.1 km', phone: '+234 809 456 7812', badge: 'Same-day response' },
      { name: 'Lekki Pipe & Drain Crew', rating: 4.6, reviews: 96, distance: '3.4 km', phone: '+234 706 218 9034', badge: 'Community trusted' },
    ],
    Electrician: [
      { name: 'Emeka - Certified Electrician', rating: 4.9, reviews: 164, distance: '0.8 km', phone: '+234 812 234 5678', badge: 'Local artisan vetted' },
      { name: 'Aisha Power Solutions', rating: 4.7, reviews: 119, distance: '1.9 km', phone: '+234 901 345 6789', badge: 'Fast response' },
      { name: 'Ikeja VoltWorks', rating: 4.6, reviews: 83, distance: '3.0 km', phone: '+234 805 987 6543', badge: 'Community trusted' },
    ],
    Laundry: [
      { name: "Ada's FreshPress", rating: 4.9, reviews: 210, distance: '0.5 km', phone: '+234 803 876 5412', badge: 'Pickup available' },
      { name: 'Yaba Wash & Fold', rating: 4.7, reviews: 132, distance: '1.6 km', phone: '+234 814 223 6790', badge: 'Same-day service' },
      { name: 'Tolu Clean Threads', rating: 4.6, reviews: 78, distance: '2.8 km', phone: '+234 706 456 8123', badge: 'Community trusted' },
    ],
    Locksmith: [
      { name: 'Bayo - Secure Key Expert', rating: 4.9, reviews: 155, distance: '0.9 km', phone: '+234 809 765 4321', badge: '24/7 response' },
      { name: 'Mariam Lock & Safe', rating: 4.8, reviews: 108, distance: '1.7 km', phone: '+234 812 678 9012', badge: 'Local artisan vetted' },
      { name: 'Surulere Key Rescue', rating: 4.6, reviews: 71, distance: '3.2 km', phone: '+234 901 234 5678', badge: 'Community trusted' },
    ],
  },
  US: {
    Plumber: [
      { name: "Mike's Plumbing via TaskRabbit", rating: 4.9, reviews: 312, distance: '0.4 mi', phone: '+1 (415) 555-0148', badge: 'TaskRabbit Pro' },
      { name: 'Bay Area Plumbing Pros', rating: 4.8, reviews: 204, distance: '1.1 mi', phone: '+1 (628) 555-0192', badge: 'Angi screened' },
      { name: 'Yelp Local Pipe Repair', rating: 4.6, reviews: 127, distance: '2.2 mi', phone: '+1 (510) 555-0166', badge: 'Yelp top rated' },
    ],
    Electrician: [
      { name: 'Bay Area Electricians', rating: 4.9, reviews: 287, distance: '0.6 mi', phone: '+1 (415) 555-0175', badge: 'Angi screened' },
      { name: 'BrightWire via TaskRabbit', rating: 4.8, reviews: 193, distance: '1.3 mi', phone: '+1 (650) 555-0124', badge: 'TaskRabbit Pro' },
      { name: 'Yelp Home Electric', rating: 4.6, reviews: 104, distance: '2.0 mi', phone: '+1 (408) 555-0188', badge: 'Yelp top rated' },
    ],
    Laundry: [
      { name: 'FreshFold via TaskRabbit', rating: 4.9, reviews: 356, distance: '0.3 mi', phone: '+1 (415) 555-0133', badge: 'TaskRabbit Pro' },
      { name: 'Sparkle Laundry Co.', rating: 4.7, reviews: 168, distance: '1.0 mi', phone: '+1 (510) 555-0119', badge: 'Angi screened' },
      { name: 'Yelp Laundry Pickup', rating: 4.6, reviews: 98, distance: '1.8 mi', phone: '+1 (628) 555-0157', badge: 'Yelp top rated' },
    ],
    Locksmith: [
      { name: '24/7 Lock Pros via Angi', rating: 4.9, reviews: 245, distance: '0.5 mi', phone: '+1 (415) 555-0107', badge: 'Angi screened' },
      { name: 'TaskRabbit Key Rescue', rating: 4.8, reviews: 180, distance: '1.2 mi', phone: '+1 (650) 555-0161', badge: 'TaskRabbit Pro' },
      { name: 'Yelp Secure Entry', rating: 4.6, reviews: 113, distance: '2.4 mi', phone: '+1 (408) 555-0199', badge: 'Yelp top rated' },
    ],
  },
  GB: {
    Plumber: [
      { name: 'London Boiler & Plumbing Ltd via Checkatrade', rating: 4.9, reviews: 264, distance: '0.5 mi', phone: '+44 20 7946 0958', badge: 'Checkatrade vetted' },
      { name: 'Rated People London Plumbers', rating: 4.8, reviews: 187, distance: '1.2 mi', phone: '+44 20 7946 0314', badge: 'Rated People' },
      { name: 'Thames Pipe & Heating', rating: 4.6, reviews: 112, distance: '2.0 mi', phone: '+44 161 496 0821', badge: 'Local top rated' },
    ],
    Electrician: [
      { name: 'London Electricians via Checkatrade', rating: 4.9, reviews: 231, distance: '0.7 mi', phone: '+44 20 7946 0742', badge: 'Checkatrade vetted' },
      { name: 'Rated People Electrical Pro', rating: 4.8, reviews: 159, distance: '1.4 mi', phone: '+44 121 496 0288', badge: 'Rated People' },
      { name: 'Bristol BrightSpark Services', rating: 4.6, reviews: 103, distance: '2.5 mi', phone: '+44 117 496 0516', badge: 'Local top rated' },
    ],
    Laundry: [
      { name: 'Checkatrade Laundry & Ironing', rating: 4.9, reviews: 198, distance: '0.4 mi', phone: '+44 20 7946 0127', badge: 'Checkatrade vetted' },
      { name: 'Rated People Home Care', rating: 4.7, reviews: 144, distance: '1.1 mi', phone: '+44 113 496 0674', badge: 'Rated People' },
      { name: 'Manchester FreshPress', rating: 4.6, reviews: 89, distance: '2.1 mi', phone: '+44 161 496 0135', badge: 'Local top rated' },
    ],
    Locksmith: [
      { name: 'Checkatrade 24/7 Locksmiths', rating: 4.9, reviews: 221, distance: '0.6 mi', phone: '+44 20 7946 0881', badge: 'Checkatrade vetted' },
      { name: 'Rated People Key Experts', rating: 4.8, reviews: 163, distance: '1.3 mi', phone: '+44 121 496 0749', badge: 'Rated People' },
      { name: 'Yorkshire Secure Entry', rating: 4.6, reviews: 92, distance: '2.3 mi', phone: '+44 113 496 0196', badge: 'Local top rated' },
    ],
  },
};

export const GLOBAL_FALLBACK_PROVIDERS: Record<
  string,
  { name: string; rating: number; reviews: number; distance: string; phone: string; badge: string }[]
> = {
  Plumber: [
    { name: 'AquaFix Pro', rating: 4.9, reviews: 312, distance: '0.3 mi', phone: '(555) 201-4488', badge: 'Open Now' },
    { name: 'City Pipe Masters', rating: 4.7, reviews: 189, distance: '0.8 mi', phone: '(555) 309-7712', badge: 'Top Rated' },
    { name: 'Rapid Plumb & Drain', rating: 4.6, reviews: 97, distance: '1.2 mi', phone: '(555) 417-2230', badge: 'Fast Response' },
  ],
  Electrician: [
    { name: 'VoltEdge Electric', rating: 4.8, reviews: 274, distance: '0.5 mi', phone: '(555) 102-6641', badge: 'Certified' },
    { name: 'BrightSpark Co.', rating: 4.7, reviews: 158, distance: '0.9 mi', phone: '(555) 203-8834', badge: 'Open Now' },
    { name: 'WireWise Services', rating: 4.5, reviews: 88, distance: '1.4 mi', phone: '(555) 307-1195', badge: 'Top Rated' },
  ],
  Laundry: [
    { name: 'FreshPress Cleaners', rating: 4.9, reviews: 501, distance: '0.2 mi', phone: '(555) 401-3372', badge: 'Open Now' },
    { name: 'SpinCycle Express', rating: 4.6, reviews: 203, distance: '0.6 mi', phone: '(555) 502-9918', badge: 'Same Day' },
    { name: 'PristineThreads', rating: 4.5, reviews: 134, distance: '1.1 mi', phone: '(555) 608-4450', badge: 'Eco-Friendly' },
  ],
  Locksmith: [
    { name: 'KeyMaster 24/7', rating: 4.9, reviews: 399, distance: '0.4 mi', phone: '(555) 701-2267', badge: '24/7' },
    { name: 'SecureLock Co.', rating: 4.8, reviews: 211, distance: '0.7 mi', phone: '(555) 802-5531', badge: 'Licensed' },
    { name: 'QuickKey Locksmiths', rating: 4.6, reviews: 122, distance: '1.3 mi', phone: '(555) 903-8845', badge: 'Fast Response' },
  ],
};

export function generateMarketProviders(
  category: string,
  country: string,
  searchQuery = category
): MarketProvider[] {
  const cName = getCountryInfo(country).name;
  const regionalSet = REGIONAL_MARKET_PROVIDERS[country]?.[category];
  const list = regionalSet ?? GLOBAL_FALLBACK_PROVIDERS[category] ?? GLOBAL_FALLBACK_PROVIDERS.Plumber;

  return list.map((item, index) => {
    let startingPrice = 30 + index * 15;
    if (country === 'NG') startingPrice = 8500 + index * 3500;
    else if (country === 'GB') startingPrice = 45 + index * 20;
    else if (country === 'CA') startingPrice = 60 + index * 25;
    else if (isEU(country)) startingPrice = 40 + index * 20;
    else if (country === 'US') startingPrice = 55 + index * 25;

    return {
      id: `${country}-${category}-${index}`,
      category,
      name: searchQuery === category ? item.name : `${cName} · ${item.name}`,
      distance: item.distance || (country === 'US' || country === 'GB' ? `${(0.4 + index * 0.7).toFixed(1)} mi` : `${(0.8 + index * 1.2).toFixed(1)} km`),
      phone: item.phone,
      badge: item.badge,
      isIdentityVerified: index !== 2,
      safetyScore: index === 1 ? 96 : index === 2 ? 91 : 99,
      reportCount: index === 2 ? 1 : 0,
      startingPrice,
      rating: item.rating,
      reviews: item.reviews,
    };
  });
}

export function formatGoogleCalendarUrl(title: string, dateTimeStr: string): string {
  const start = new Date(dateTimeStr);
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  const toGCalDate = (d: Date) => d.toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z';
  return `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    title
  )}&dates=${toGCalDate(start)}/${toGCalDate(end)}`;
}

export const LAZY_AI_WELCOME_MSG =
  "Yo, I'm LazyAI. Tell me what you need, and I'll jump across tabs to do the heavy lifting for you. What's the vibe today?";
