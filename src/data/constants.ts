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

export function getReportToastMessage(country: string): string {
  if (country === 'US') {
    return 'Report logged with Trust & Safety team. Local authorities will be notified if necessary.';
  }
  if (country === 'GB') {
    return 'Flagged to UK Trading Standards & Safety team.';
  }
  if (country === 'NG') {
    return 'Report logged with the Nigerian Trust & Safety team.';
  }
  return 'Report logged with the regional Trust & Safety team.';
}

export function getLocationBadgeText(country: string): string {
  const sym = getCurrencySymbol(country);
  const codeName =
    country === 'NG'
      ? 'NGA'
      : country === 'US'
      ? 'USA'
      : country === 'GB'
      ? 'UK'
      : country === 'CA'
      ? 'CAN'
      : isEU(country)
      ? 'EUR'
      : country;
  return `📍 ${codeName} (${sym})`;
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

    // Determine occupancy status (filled_up, few_left, available)
    // Deterministic distribution: index 0 (item1: available, item2: filled_up), index 1 (item1: few_left, item2: available), index 2 (item1: filled_up, item2: few_left)
    const occ1: { status: 'available' | 'few_left' | 'filled_up'; units: number; label: string } =
      index === 0
        ? { status: 'available', units: 3, label: 'Vacancies Available (3 spots)' }
        : index === 1
        ? { status: 'few_left', units: 1, label: 'Limited Space · Only 1 room left' }
        : { status: 'filled_up', units: 0, label: 'No Space · Fully Booked' };

    const occ2: { status: 'available' | 'few_left' | 'filled_up'; units: number; label: string } =
      index === 0
        ? { status: 'filled_up', units: 0, label: 'No Space · Fully Booked' }
        : index === 1
        ? { status: 'available', units: 5, label: 'Vacancies Available (5 rooms)' }
        : { status: 'few_left', units: 2, label: 'Limited Space · 2 units left' };

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
      occupancyStatus: occ1.status,
      availableUnits: occ1.units,
      occupancyLabel: occ1.label,
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
      occupancyStatus: occ2.status,
      availableUnits: occ2.units,
      occupancyLabel: occ2.label,
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

export const TASK_CATEGORIES = [
  'Carpenter',
  'Tiler',
  'Plasterer',
  'Painter',
  'Mason',
  'Welder',
  'Plumber',
  'Electrician',
  'Mechanic',
  'Roofer',
  'AC Technician',
  'Generator Tech',
  'Locksmith',
  'Laundry',
  'Cleaner',
  'Handyman',
];

export const CATEGORY_CONFIG: Record<
  string,
  { emoji: string; color: string; bg: string; border: string; ring: string }
> = {
  Carpenter: {
    emoji: '🪵',
    color: 'text-amber-400',
    bg: 'bg-amber-500/12',
    border: 'border-amber-500/30',
    ring: 'ring-amber-500/15',
  },
  Tiler: {
    emoji: '📐',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/12',
    border: 'border-emerald-500/30',
    ring: 'ring-emerald-500/15',
  },
  Plasterer: {
    emoji: '🏛️',
    color: 'text-purple-400',
    bg: 'bg-purple-500/12',
    border: 'border-purple-500/30',
    ring: 'ring-purple-500/15',
  },
  Painter: {
    emoji: '🎨',
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/12',
    border: 'border-indigo-500/30',
    ring: 'ring-indigo-500/15',
  },
  Mason: {
    emoji: '🧱',
    color: 'text-orange-400',
    bg: 'bg-orange-500/12',
    border: 'border-orange-500/30',
    ring: 'ring-orange-500/15',
  },
  Welder: {
    emoji: '👨‍🏭',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/12',
    border: 'border-cyan-500/30',
    ring: 'ring-cyan-500/15',
  },
  Plumber: {
    emoji: '🔧',
    color: 'text-blue-400',
    bg: 'bg-blue-500/12',
    border: 'border-blue-500/30',
    ring: 'ring-blue-500/15',
  },
  Electrician: {
    emoji: '⚡',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/12',
    border: 'border-yellow-500/30',
    ring: 'ring-yellow-500/15',
  },
  Mechanic: {
    emoji: '🚗',
    color: 'text-rose-400',
    bg: 'bg-rose-500/12',
    border: 'border-rose-500/30',
    ring: 'ring-rose-500/15',
  },
  Roofer: {
    emoji: '🏠',
    color: 'text-red-400',
    bg: 'bg-red-500/12',
    border: 'border-red-500/30',
    ring: 'ring-red-500/15',
  },
  'AC Technician': {
    emoji: '❄️',
    color: 'text-sky-400',
    bg: 'bg-sky-500/12',
    border: 'border-sky-500/30',
    ring: 'ring-sky-500/15',
  },
  'Generator Tech': {
    emoji: '⚙️',
    color: 'text-amber-300',
    bg: 'bg-amber-400/12',
    border: 'border-amber-400/30',
    ring: 'ring-amber-400/15',
  },
  Locksmith: {
    emoji: '🔑',
    color: 'text-violet-400',
    bg: 'bg-violet-500/12',
    border: 'border-violet-500/30',
    ring: 'ring-violet-500/15',
  },
  Laundry: {
    emoji: '👕',
    color: 'text-teal-400',
    bg: 'bg-teal-500/12',
    border: 'border-teal-500/30',
    ring: 'ring-teal-500/15',
  },
  Cleaner: {
    emoji: '✨',
    color: 'text-emerald-300',
    bg: 'bg-emerald-400/12',
    border: 'border-emerald-400/30',
    ring: 'ring-emerald-400/15',
  },
  Handyman: {
    emoji: '🛠️',
    color: 'text-lime-400',
    bg: 'bg-lime-500/12',
    border: 'border-lime-500/30',
    ring: 'ring-lime-500/15',
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
    Carpenter: [
      { name: 'Adekunle Master Woodworks & Cabinetry', rating: 4.9, reviews: 215, distance: '1.1 km', phone: '+234 803 445 1190', badge: 'Artisan Guild Vetted' },
      { name: 'Lekki Bespoke Joinery & Furniture', rating: 4.8, reviews: 148, distance: '2.4 km', phone: '+234 812 678 3341', badge: 'Certified Woodcrafter' },
      { name: 'Yaba Wardrobe & Door Specialist', rating: 4.7, reviews: 92, distance: '3.6 km', phone: '+234 901 882 4501', badge: 'Community Trusted' },
    ],
    Tiler: [
      { name: 'Engr. Ibrahim Precision Marble & Tiling', rating: 4.9, reviews: 240, distance: '0.9 km', phone: '+234 802 331 8844', badge: 'Porcelain & Granite Vetted' },
      { name: 'Victoria Island Wall & Floor Pavers', rating: 4.8, reviews: 165, distance: '1.8 km', phone: '+234 814 559 2200', badge: 'Laser Level Certified' },
      { name: 'Surulere Mosaic & Terrazzo Pros', rating: 4.6, reviews: 110, distance: '3.1 km', phone: '+234 703 129 9940', badge: 'Community Trusted' },
    ],
    Plasterer: [
      { name: 'Kunle POP Ceilings & Screeding Master', rating: 4.9, reviews: 198, distance: '1.2 km', phone: '+234 806 771 4450', badge: 'Master POP Craftsman' },
      { name: 'Apex Gypsum Board & Wall Plastering', rating: 4.8, reviews: 135, distance: '2.0 km', phone: '+234 809 332 1187', badge: 'Smooth Screed Specialist' },
      { name: 'Mainland Interior Plaster & Cornice', rating: 4.7, reviews: 88, distance: '3.5 km', phone: '+234 818 901 2234', badge: 'Community Trusted' },
    ],
    Painter: [
      { name: 'Segun Elite Spray Painting & Screed', rating: 4.9, reviews: 260, distance: '0.8 km', phone: '+234 803 992 1102', badge: 'Dulux / Berger Vetted' },
      { name: 'Dulux Certified House Painters Lagos', rating: 4.8, reviews: 172, distance: '1.7 km', phone: '+234 816 443 8812', badge: 'Exterior & Interior Pro' },
      { name: 'Ikeja Wall Decorators & Texture Paint', rating: 4.6, reviews: 95, distance: '2.9 km', phone: '+234 705 661 3349', badge: 'Community Trusted' },
    ],
    Mason: [
      { name: 'Alhaji Musa Concrete & Bricklaying Crew', rating: 4.9, reviews: 185, distance: '1.4 km', phone: '+234 802 774 2231', badge: 'Structural Mason Vetted' },
      { name: 'Lekki Solid Block & Foundation Masonry', rating: 4.7, reviews: 124, distance: '2.6 km', phone: '+234 813 908 6611', badge: 'Foundation Specialist' },
      { name: 'Oshodi Interlocking Paver & Wall Pro', rating: 4.6, reviews: 81, distance: '3.8 km', phone: '+234 902 441 5567', badge: 'Community Trusted' },
    ],
    Welder: [
      { name: 'David Wrought Iron Gates & Metal Works', rating: 4.9, reviews: 220, distance: '1.0 km', phone: '+234 803 558 7701', badge: 'Argon & Arc Certified' },
      { name: 'Gbagada Burglar Proof & Steel Fabricator', rating: 4.8, reviews: 153, distance: '2.1 km', phone: '+234 817 220 9945', badge: 'Heavy Steel Specialist' },
      { name: 'Lagos Island Tank & Railing Fabrications', rating: 4.6, reviews: 90, distance: '3.3 km', phone: '+234 706 881 2290', badge: 'Community Trusted' },
    ],
    Plumber: [
      { name: 'Oluwaseun - Verified Plumber', rating: 4.9, reviews: 182, distance: '1.2 km', phone: '+234 803 123 4567', badge: 'Local artisan vetted' },
      { name: 'Chidi - Pipe & Pump Specialist', rating: 4.8, reviews: 141, distance: '2.1 km', phone: '+234 809 456 7812', badge: 'Same-day response' },
      { name: 'Lekki Pipe & Drain Crew', rating: 4.6, reviews: 96, distance: '3.4 km', phone: '+234 706 218 9034', badge: 'Community trusted' },
    ],
    Electrician: [
      { name: 'Emeka - Certified Electrician & Solar Pro', rating: 4.9, reviews: 164, distance: '0.8 km', phone: '+234 812 234 5678', badge: 'Local artisan vetted' },
      { name: 'Aisha Power Solutions & Inverters', rating: 4.7, reviews: 119, distance: '1.9 km', phone: '+234 901 345 6789', badge: 'Fast response' },
      { name: 'Ikeja VoltWorks', rating: 4.6, reviews: 83, distance: '3.0 km', phone: '+234 805 987 6543', badge: 'Community trusted' },
    ],
    Mechanic: [
      { name: 'Engr. Femi Japanese & German Auto Clinic', rating: 4.9, reviews: 280, distance: '1.5 km', phone: '+234 802 884 9912', badge: 'Computer Diagnostics Pro' },
      { name: 'Lekki Mobile Auto Rescue & Brake Tech', rating: 4.8, reviews: 160, distance: '2.3 km', phone: '+234 813 440 2219', badge: '24/7 Roadside Assistance' },
      { name: 'Surulere Transmission & Engine Works', rating: 4.6, reviews: 104, distance: '3.7 km', phone: '+234 701 559 8830', badge: 'Community Trusted' },
    ],
    Roofer: [
      { name: 'Austin Aluminum Roofing & Leak Doctor', rating: 4.9, reviews: 175, distance: '1.3 km', phone: '+234 803 661 9920', badge: 'Waterproofing Certified' },
      { name: 'Lagos Stone-Coated Tile & Truss Specialist', rating: 4.7, reviews: 118, distance: '2.5 km', phone: '+234 815 330 7712', badge: 'Roof Frame Pro' },
      { name: 'Mainland Gutter & Roof Patch Services', rating: 4.6, reviews: 76, distance: '3.9 km', phone: '+234 903 881 4455', badge: 'Community Trusted' },
    ],
    'AC Technician': [
      { name: 'Babatunde Inverter AC & Chiller Services', rating: 4.9, reviews: 230, distance: '0.7 km', phone: '+234 802 994 3311', badge: 'Gas Refill & Repair Vetted' },
      { name: 'CoolBreeze Air Conditioning Repairs', rating: 4.8, reviews: 150, distance: '1.9 km', phone: '+234 818 221 6650', badge: 'HVAC Specialist' },
      { name: 'Victoria Island Central Cooling Care', rating: 4.6, reviews: 92, distance: '3.2 km', phone: '+234 708 440 1123', badge: 'Community Trusted' },
    ],
    'Generator Tech': [
      { name: 'Baba Mike Mikano & Perkins Plant Specialist', rating: 4.9, reviews: 255, distance: '0.9 km', phone: '+234 803 770 1289', badge: 'Diesel & Petrol Certified' },
      { name: 'Lekki Rapid Gen Servicing & Carburetor Pro', rating: 4.8, reviews: 174, distance: '1.8 km', phone: '+234 814 662 9901', badge: 'Same-Day Field Tech' },
      { name: 'Mainland Heavy Generator Overhaulers', rating: 4.6, reviews: 103, distance: '3.4 km', phone: '+234 909 331 4456', badge: 'Community Trusted' },
    ],
    Laundry: [
      { name: "Ada's FreshPress Dry Cleaning", rating: 4.9, reviews: 210, distance: '0.5 km', phone: '+234 803 876 5412', badge: 'Pickup available' },
      { name: 'Yaba Wash & Fold Express', rating: 4.7, reviews: 132, distance: '1.6 km', phone: '+234 814 223 6790', badge: 'Same-day service' },
      { name: 'Tolu Clean Threads & Starch Pro', rating: 4.6, reviews: 78, distance: '2.8 km', phone: '+234 706 456 8123', badge: 'Community trusted' },
    ],
    Locksmith: [
      { name: 'Bayo - Secure Key & Smart Lock Expert', rating: 4.9, reviews: 155, distance: '0.9 km', phone: '+234 809 765 4321', badge: '24/7 response' },
      { name: 'Mariam Safe & Digital Lock Solutions', rating: 4.8, reviews: 108, distance: '1.7 km', phone: '+234 812 678 9012', badge: 'Local artisan vetted' },
      { name: 'Surulere Master Key Rescue', rating: 4.6, reviews: 71, distance: '3.2 km', phone: '+234 901 234 5678', badge: 'Community trusted' },
    ],
    Cleaner: [
      { name: 'Spotless Homes Post-Construction Deep Clean', rating: 4.9, reviews: 265, distance: '0.6 km', phone: '+234 803 118 7720', badge: 'Fumigation & Steam Vetted' },
      { name: 'Lekki Janitorial & Upholstery Cleaners', rating: 4.8, reviews: 180, distance: '1.4 km', phone: '+234 817 992 4431', badge: 'Eco Chemical Certified' },
      { name: 'Sparkle Fresh Pest Control & Maid Services', rating: 4.6, reviews: 94, distance: '2.7 km', phone: '+234 705 330 9912', badge: 'Community Trusted' },
    ],
    Handyman: [
      { name: 'Ifeanyi Multi-Skilled Home Repair Pro', rating: 4.9, reviews: 290, distance: '0.5 km', phone: '+234 802 441 8890', badge: 'All-Round Fixer Vetted' },
      { name: 'QuickFix TV Mounts & Fixture Assembly', rating: 4.8, reviews: 195, distance: '1.3 km', phone: '+234 813 770 2245', badge: 'Same-Day Dispatch' },
      { name: 'Lagos Express Odd Job Specialists', rating: 4.6, reviews: 115, distance: '2.8 km', phone: '+234 906 119 3378', badge: 'Community Trusted' },
    ],
  },
  US: {
    Carpenter: [
      { name: 'Bay Area Custom Woodwork via TaskRabbit', rating: 4.9, reviews: 310, distance: '0.6 mi', phone: '+1 (415) 555-0182', badge: 'TaskRabbit Pro' },
      { name: 'Golden Gate Cabinet & Joinery Pros', rating: 4.8, reviews: 198, distance: '1.4 mi', phone: '+1 (628) 555-0144', badge: 'Angi Screened' },
      { name: 'City Trim & Framing Craftsmen', rating: 4.6, reviews: 120, distance: '2.5 mi', phone: '+1 (510) 555-0199', badge: 'Yelp Top Rated' },
    ],
    Tiler: [
      { name: 'San Francisco Tile & Stone via Angi', rating: 4.9, reviews: 285, distance: '0.5 mi', phone: '+1 (415) 555-0191', badge: 'Angi Screened' },
      { name: 'Bay Tile, Mosaic & Grout Specialists', rating: 4.8, reviews: 176, distance: '1.2 mi', phone: '+1 (650) 555-0138', badge: 'TaskRabbit Pro' },
      { name: 'Metro Marble & Backsplash Pros', rating: 4.6, reviews: 104, distance: '2.3 mi', phone: '+1 (408) 555-0177', badge: 'Yelp Top Rated' },
    ],
    Plasterer: [
      { name: 'Drywall Masters & Plastering via TaskRabbit', rating: 4.9, reviews: 240, distance: '0.7 mi', phone: '+1 (415) 555-0163', badge: 'TaskRabbit Pro' },
      { name: 'Golden State Drywall Patch & Texture Pro', rating: 4.8, reviews: 162, distance: '1.5 mi', phone: '+1 (510) 555-0149', badge: 'Angi Screened' },
      { name: 'Precision Skim Coat & Ceiling Repair', rating: 4.6, reviews: 98, distance: '2.8 mi', phone: '+1 (628) 555-0112', badge: 'Yelp Top Rated' },
    ],
    Painter: [
      { name: 'Elite Color Interior Painters via TaskRabbit', rating: 4.9, reviews: 345, distance: '0.4 mi', phone: '+1 (415) 555-0128', badge: 'TaskRabbit Pro' },
      { name: 'Bay Area Exterior & Cabinet Painting', rating: 4.8, reviews: 220, distance: '1.1 mi', phone: '+1 (650) 555-0174', badge: 'Angi Screened' },
      { name: 'Metro FreshCoat Pro Decorators', rating: 4.6, reviews: 130, distance: '2.1 mi', phone: '+1 (408) 555-0153', badge: 'Yelp Top Rated' },
    ],
    Mason: [
      { name: 'Bay Stone & Brick Masonry Specialists', rating: 4.9, reviews: 190, distance: '0.8 mi', phone: '+1 (415) 555-0185', badge: 'Angi Screened' },
      { name: 'Concrete Pavers & Retaining Wall Pros', rating: 4.8, reviews: 134, distance: '1.7 mi', phone: '+1 (510) 555-0168', badge: 'TaskRabbit Pro' },
      { name: 'City Chimney & Brick Repair Services', rating: 4.6, reviews: 88, distance: '2.9 mi', phone: '+1 (628) 555-0130', badge: 'Yelp Top Rated' },
    ],
    Welder: [
      { name: 'Pacific Mobile Welding & Fabrication', rating: 4.9, reviews: 210, distance: '0.9 mi', phone: '+1 (415) 555-0171', badge: 'Certified Welder AWS' },
      { name: 'Iron Gate & Railing Repairs via Angi', rating: 4.8, reviews: 145, distance: '1.6 mi', phone: '+1 (650) 555-0195', badge: 'Angi Screened' },
      { name: 'Structural Steel Emergency On-Site Welder', rating: 4.6, reviews: 92, distance: '3.0 mi', phone: '+1 (510) 555-0140', badge: 'Yelp Top Rated' },
    ],
    Plumber: [
      { name: "Mike's Plumbing via TaskRabbit", rating: 4.9, reviews: 312, distance: '0.4 mi', phone: '+1 (415) 555-0148', badge: 'TaskRabbit Pro' },
      { name: 'Bay Area Plumbing Pros', rating: 4.8, reviews: 204, distance: '1.1 mi', phone: '+1 (628) 555-0192', badge: 'Angi screened' },
      { name: 'Yelp Local Pipe Repair', rating: 4.6, reviews: 127, distance: '2.2 mi', phone: '+1 (510) 555-0166', badge: 'Yelp top rated' },
    ],
    Electrician: [
      { name: 'Bay Area Electricians via Angi', rating: 4.9, reviews: 287, distance: '0.6 mi', phone: '+1 (415) 555-0175', badge: 'Angi screened' },
      { name: 'BrightWire via TaskRabbit', rating: 4.8, reviews: 193, distance: '1.3 mi', phone: '+1 (650) 555-0124', badge: 'TaskRabbit Pro' },
      { name: 'Yelp Home Electric', rating: 4.6, reviews: 104, distance: '2.0 mi', phone: '+1 (408) 555-0188', badge: 'Yelp top rated' },
    ],
    Mechanic: [
      { name: 'Mobile Auto Doctor Diagnostic Tech', rating: 4.9, reviews: 320, distance: '0.7 mi', phone: '+1 (415) 555-0139', badge: 'ASE Certified' },
      { name: 'Bay Brakes & Battery Mobile Service', rating: 4.8, reviews: 215, distance: '1.4 mi', phone: '+1 (510) 555-0152', badge: 'Angi Screened' },
      { name: 'City German & Import Auto Mechanic', rating: 4.6, reviews: 140, distance: '2.6 mi', phone: '+1 (650) 555-0181', badge: 'Yelp Top Rated' },
    ],
    Roofer: [
      { name: 'Bay Area Shingle & Roof Leak Pros', rating: 4.9, reviews: 185, distance: '0.8 mi', phone: '+1 (415) 555-0165', badge: 'Licensed Roofing Pro' },
      { name: 'Gutter Clean & Roof Patch via Angi', rating: 4.7, reviews: 129, distance: '1.8 mi', phone: '+1 (628) 555-0142', badge: 'Angi Screened' },
      { name: 'Pacific Roof Inspection & Repair', rating: 4.6, reviews: 84, distance: '3.1 mi', phone: '+1 (408) 555-0197', badge: 'Yelp Top Rated' },
    ],
    'AC Technician': [
      { name: 'AirPro HVAC & Heating Specialist', rating: 4.9, reviews: 295, distance: '0.5 mi', phone: '+1 (415) 555-0118', badge: 'EPA Certified' },
      { name: 'Bay Heat Pump & AC Repair via TaskRabbit', rating: 4.8, reviews: 184, distance: '1.2 mi', phone: '+1 (650) 555-0169', badge: 'TaskRabbit Pro' },
      { name: 'Metro Climate Control Care', rating: 4.6, reviews: 110, distance: '2.4 mi', phone: '+1 (510) 555-0125', badge: 'Yelp Top Rated' },
    ],
    'Generator Tech': [
      { name: 'Generac & Standby Power Specialists', rating: 4.9, reviews: 165, distance: '1.0 mi', phone: '+1 (415) 555-0159', badge: 'Generac Certified' },
      { name: 'Emergency Backup Generator Tech via Angi', rating: 4.8, reviews: 118, distance: '1.9 mi', phone: '+1 (628) 555-0186', badge: 'Angi Screened' },
      { name: 'Home Power Transfer Switch Pros', rating: 4.6, reviews: 75, distance: '3.2 mi', phone: '+1 (408) 555-0141', badge: 'Yelp Top Rated' },
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
    Cleaner: [
      { name: 'Sparkle Clean Deep House Cleaning', rating: 4.9, reviews: 380, distance: '0.4 mi', phone: '+1 (415) 555-0176', badge: 'TaskRabbit Pro' },
      { name: 'EcoGreen Home Cleaners via Angi', rating: 4.8, reviews: 225, distance: '1.0 mi', phone: '+1 (510) 555-0194', badge: 'Angi Screened' },
      { name: 'Move-in Move-out Maid Pro', rating: 4.6, reviews: 135, distance: '2.0 mi', phone: '+1 (628) 555-0167', badge: 'Yelp Top Rated' },
    ],
    Handyman: [
      { name: 'QuickFix All-in-One Handyman via TaskRabbit', rating: 4.9, reviews: 410, distance: '0.3 mi', phone: '+1 (415) 555-0154', badge: 'TaskRabbit Pro' },
      { name: 'Bay Assembly & Mounting Services', rating: 4.8, reviews: 260, distance: '0.9 mi', phone: '+1 (650) 555-0129', badge: 'Angi Screened' },
      { name: 'Neighborhood Fixer & Odd Jobs', rating: 4.6, reviews: 145, distance: '1.9 mi', phone: '+1 (408) 555-0198', badge: 'Yelp Top Rated' },
    ],
  },
  GB: {
    Carpenter: [
      { name: 'London Bespoke Joinery via Checkatrade', rating: 4.9, reviews: 250, distance: '0.6 mi', phone: '+44 20 7946 0912', badge: 'Checkatrade Vetted' },
      { name: 'Thames Carpentry & Cabinet Makers', rating: 4.8, reviews: 170, distance: '1.3 mi', phone: '+44 20 7946 0451', badge: 'Rated People' },
      { name: 'Bespoke Wardrobes & Flooring UK', rating: 4.6, reviews: 98, distance: '2.4 mi', phone: '+44 161 496 0772', badge: 'Bark.com Top Rated' },
    ],
    Tiler: [
      { name: 'London Precision Tiling via Checkatrade', rating: 4.9, reviews: 235, distance: '0.5 mi', phone: '+44 20 7946 0834', badge: 'Checkatrade Vetted' },
      { name: 'Royal Tile, Granite & Victorian Pavers', rating: 4.8, reviews: 158, distance: '1.4 mi', phone: '+44 121 496 0399', badge: 'Rated People' },
      { name: 'Westminster Porcelain & Bathroom Tilers', rating: 4.6, reviews: 92, distance: '2.5 mi', phone: '+44 113 496 0521', badge: 'Bark.com Verified' },
    ],
    Plasterer: [
      { name: 'Callum Plastering & Skimming Pro', rating: 4.9, reviews: 215, distance: '0.7 mi', phone: '+44 20 7946 0719', badge: 'Checkatrade Vetted' },
      { name: 'Thames Drywall & Coving Specialists', rating: 4.8, reviews: 142, distance: '1.5 mi', phone: '+44 20 7946 0288', badge: 'Rated People' },
      { name: 'Smooth Wall & Ceiling Plasterers', rating: 4.6, reviews: 85, distance: '2.7 mi', phone: '+44 117 496 0612', badge: 'Bark.com Top Rated' },
    ],
    Painter: [
      { name: 'London Decorators via Checkatrade', rating: 4.9, reviews: 290, distance: '0.4 mi', phone: '+44 20 7946 0643', badge: 'Checkatrade Vetted' },
      { name: 'Kensington Interior & Exterior Painters', rating: 4.8, reviews: 185, distance: '1.2 mi', phone: '+44 20 7946 0194', badge: 'Rated People' },
      { name: 'Crown & Dulux Approved UK Painters', rating: 4.6, reviews: 110, distance: '2.2 mi', phone: '+44 161 496 0885', badge: 'Bark.com Verified' },
    ],
    Mason: [
      { name: 'British Heritage Brickwork via Checkatrade', rating: 4.9, reviews: 180, distance: '0.8 mi', phone: '+44 20 7946 0551', badge: 'Checkatrade Vetted' },
      { name: 'Stone & Mortar Restoration Specialists', rating: 4.7, reviews: 120, distance: '1.7 mi', phone: '+44 121 496 0714', badge: 'Rated People' },
      { name: 'London Garden Walls & Pointing Pro', rating: 4.6, reviews: 80, distance: '2.9 mi', phone: '+44 113 496 0432', badge: 'Bark.com Verified' },
    ],
    Welder: [
      { name: 'Thames Mobile Welding & Gate Repair', rating: 4.9, reviews: 195, distance: '0.9 mi', phone: '+44 20 7946 0382', badge: 'Checkatrade Vetted' },
      { name: 'Wrought Iron Railing & Steelwork London', rating: 4.8, reviews: 130, distance: '1.8 mi', phone: '+44 20 7946 0991', badge: 'Rated People' },
      { name: 'Emergency On-Site Metal Fabricators', rating: 4.5, reviews: 78, distance: '3.1 mi', phone: '+44 161 496 0224', badge: 'Bark.com Verified' },
    ],
    Plumber: [
      { name: 'Oliver - Gas Safe Engineer via Checkatrade', rating: 4.9, reviews: 264, distance: '0.5 mi', phone: '+44 20 7946 0958', badge: 'Checkatrade vetted' },
      { name: 'Callum - Emergency Plumber', rating: 4.8, reviews: 187, distance: '1.2 mi', phone: '+44 20 7946 0314', badge: 'Rated People' },
      { name: 'Thames Pipe & Heating Ltd', rating: 4.6, reviews: 112, distance: '2.0 mi', phone: '+44 161 496 0821', badge: 'Bark.com top rated' },
    ],
    Electrician: [
      { name: 'London Electricians via Checkatrade', rating: 4.9, reviews: 231, distance: '0.7 mi', phone: '+44 20 7946 0742', badge: 'Checkatrade vetted' },
      { name: 'Rated People Electrical Pro', rating: 4.8, reviews: 159, distance: '1.4 mi', phone: '+44 121 496 0288', badge: 'Rated People' },
      { name: 'Bristol BrightSpark Services', rating: 4.6, reviews: 103, distance: '2.5 mi', phone: '+44 117 496 0516', badge: 'Bark.com top rated' },
    ],
    Mechanic: [
      { name: 'Mobile Mechanic London via Checkatrade', rating: 4.9, reviews: 280, distance: '0.8 mi', phone: '+44 20 7946 0883', badge: 'Checkatrade Vetted' },
      { name: 'UK Emergency Roadside Diagnostics', rating: 4.8, reviews: 190, distance: '1.5 mi', phone: '+44 121 496 0915', badge: 'Rated People' },
      { name: 'Brake & Clutch Mobile Clinic', rating: 4.6, reviews: 115, distance: '2.8 mi', phone: '+44 161 496 0441', badge: 'Bark.com Verified' },
    ],
    Roofer: [
      { name: 'London Roof Care & Chimney Repair', rating: 4.9, reviews: 210, distance: '0.7 mi', phone: '+44 20 7946 0255', badge: 'Checkatrade Vetted' },
      { name: 'Slate & Tile Roofers via Rated People', rating: 4.7, reviews: 135, distance: '1.6 mi', phone: '+44 113 496 0899', badge: 'Rated People' },
      { name: 'Emergency Leak Patch & Gutter Clean', rating: 4.6, reviews: 88, distance: '2.9 mi', phone: '+44 117 496 0371', badge: 'Bark.com Verified' },
    ],
    'AC Technician': [
      { name: 'London HVAC & Heat Pump Specialists', rating: 4.9, reviews: 205, distance: '0.9 mi', phone: '+44 20 7946 0148', badge: 'Checkatrade Vetted' },
      { name: 'EcoClimate Air Con Installations', rating: 4.8, reviews: 140, distance: '1.7 mi', phone: '+44 121 496 0633', badge: 'Rated People' },
      { name: 'Commercial & Home Chiller Services', rating: 4.5, reviews: 82, distance: '3.0 mi', phone: '+44 161 496 0992', badge: 'Bark.com Verified' },
    ],
    'Generator Tech': [
      { name: 'London Diesel Plant & Generator Services', rating: 4.9, reviews: 150, distance: '1.1 mi', phone: '+44 20 7946 0977', badge: 'Checkatrade Vetted' },
      { name: 'Backup Power & Uninterruptible Systems UK', rating: 4.7, reviews: 98, distance: '2.0 mi', phone: '+44 113 496 0244', badge: 'Rated People' },
      { name: 'Perkins & Cummins Service Engineers', rating: 4.6, reviews: 68, distance: '3.3 mi', phone: '+44 161 496 0553', badge: 'Bark.com Verified' },
    ],
    Laundry: [
      { name: 'Checkatrade Laundry & Ironing', rating: 4.9, reviews: 198, distance: '0.4 mi', phone: '+44 20 7946 0127', badge: 'Checkatrade vetted' },
      { name: 'Rated People Home Care', rating: 4.7, reviews: 144, distance: '1.1 mi', phone: '+44 113 496 0674', badge: 'Rated People' },
      { name: 'Manchester FreshPress', rating: 4.6, reviews: 89, distance: '2.1 mi', phone: '+44 161 496 0135', badge: 'Bark.com verified' },
    ],
    Locksmith: [
      { name: 'Checkatrade 24/7 Locksmiths', rating: 4.9, reviews: 221, distance: '0.6 mi', phone: '+44 20 7946 0881', badge: 'Checkatrade vetted' },
      { name: 'Rated People Key Experts', rating: 4.8, reviews: 163, distance: '1.3 mi', phone: '+44 121 496 0749', badge: 'Rated People' },
      { name: 'Yorkshire Secure Entry', rating: 4.6, reviews: 92, distance: '2.3 mi', phone: '+44 113 496 0196', badge: 'Bark.com verified' },
    ],
    Cleaner: [
      { name: 'Pristine London Deep Cleaning Pro', rating: 4.9, reviews: 310, distance: '0.5 mi', phone: '+44 20 7946 0501', badge: 'Checkatrade Vetted' },
      { name: 'End of Tenancy Cleaning Specialists', rating: 4.8, reviews: 215, distance: '1.2 mi', phone: '+44 121 496 0844', badge: 'Rated People' },
      { name: 'Domestic Steam & Carpet Cleaners UK', rating: 4.6, reviews: 120, distance: '2.2 mi', phone: '+44 161 496 0619', badge: 'Bark.com Verified' },
    ],
    Handyman: [
      { name: 'London Multi-Trade Handyman Services', rating: 4.9, reviews: 360, distance: '0.4 mi', phone: '+44 20 7946 0377', badge: 'Checkatrade Vetted' },
      { name: 'Odd Jobs & Flat Pack Assembly Pro', rating: 4.8, reviews: 230, distance: '1.0 mi', phone: '+44 113 496 0918', badge: 'Rated People' },
      { name: 'QuickFix Household Repair Crew', rating: 4.6, reviews: 140, distance: '2.0 mi', phone: '+44 161 496 0735', badge: 'Bark.com Verified' },
    ],
  },
};

export const GLOBAL_FALLBACK_PROVIDERS: Record<
  string,
  { name: string; rating: number; reviews: number; distance: string; phone: string; badge: string }[]
> = {
  Carpenter: [
    { name: 'Precision Woodcraft & Cabinetry', rating: 4.9, reviews: 260, distance: '0.6 mi', phone: '(555) 492-3310', badge: 'Guild Certified' },
    { name: 'Master Joinery & Custom Furniture', rating: 4.8, reviews: 175, distance: '1.2 mi', phone: '(555) 881-2294', badge: 'Vetted Artisan' },
    { name: 'Door & Trim Woodworking Pro', rating: 4.6, reviews: 110, distance: '2.1 mi', phone: '(555) 304-8855', badge: 'Fast Response' },
  ],
  Tiler: [
    { name: 'Porcelain & Marble Tile Craftsmen', rating: 4.9, reviews: 245, distance: '0.5 mi', phone: '(555) 671-8840', badge: 'Tile Guild Vetted' },
    { name: 'Precision Floor & Wall Pavers', rating: 4.8, reviews: 160, distance: '1.1 mi', phone: '(555) 902-1144', badge: 'Laser Leveled' },
    { name: 'Kitchen & Bathroom Mosaic Masters', rating: 4.6, reviews: 98, distance: '2.0 mi', phone: '(555) 441-7729', badge: 'Top Rated' },
  ],
  Plasterer: [
    { name: 'Master Plastering & Drywall Finishers', rating: 4.9, reviews: 220, distance: '0.7 mi', phone: '(555) 551-9922', badge: 'Smooth Skim Pro' },
    { name: 'POP & Gypsum Ceiling Specialists', rating: 4.8, reviews: 145, distance: '1.4 mi', phone: '(555) 782-3311', badge: 'Vetted Craftsman' },
    { name: 'Wall Crack & Patching Crew', rating: 4.6, reviews: 90, distance: '2.5 mi', phone: '(555) 219-4408', badge: 'Open Now' },
  ],
  Painter: [
    { name: 'Elite Interior & Exterior Painters', rating: 4.9, reviews: 310, distance: '0.4 mi', phone: '(555) 330-9941', badge: 'Top Rated' },
    { name: 'Precision Spray Finishing & Wall Decor', rating: 4.8, reviews: 195, distance: '1.0 mi', phone: '(555) 774-2219', badge: 'Color Consultant' },
    { name: 'FreshCoat Fast Turnaround Crew', rating: 4.6, reviews: 125, distance: '1.9 mi', phone: '(555) 891-6602', badge: 'Same Day' },
  ],
  Mason: [
    { name: 'Master Bricklayer & Block Masonry', rating: 4.9, reviews: 195, distance: '0.8 mi', phone: '(555) 882-1190', badge: 'Structural Vetted' },
    { name: 'Stone & Concrete Paver Specialists', rating: 4.7, reviews: 130, distance: '1.6 mi', phone: '(555) 440-6623', badge: 'Foundation Pro' },
    { name: 'Retaining Wall & Chimney Repairs', rating: 4.6, reviews: 85, distance: '2.7 mi', phone: '(555) 319-5501', badge: 'Licensed' },
  ],
  Welder: [
    { name: 'Certified Mobile Arc & Argon Welder', rating: 4.9, reviews: 215, distance: '0.7 mi', phone: '(555) 662-8819', badge: 'AWS Certified' },
    { name: 'Wrought Iron Gates & Metal Railings', rating: 4.8, reviews: 140, distance: '1.5 mi', phone: '(555) 901-3342', badge: 'Heavy Steel' },
    { name: 'Structural Steel Emergency Repairs', rating: 4.6, reviews: 92, distance: '2.6 mi', phone: '(555) 412-7780', badge: '24/7 Mobile' },
  ],
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
  Mechanic: [
    { name: 'Mobile Diagnostic Auto Mechanic', rating: 4.9, reviews: 295, distance: '0.6 mi', phone: '(555) 771-4401', badge: 'ASE Certified' },
    { name: 'Brake, Battery & Engine Techs', rating: 4.8, reviews: 180, distance: '1.3 mi', phone: '(555) 990-2218', badge: 'Roadside Pro' },
    { name: 'Precision Transmission Specialist', rating: 4.6, reviews: 110, distance: '2.3 mi', phone: '(555) 334-9912', badge: 'Top Rated' },
  ],
  Roofer: [
    { name: 'Precision Roof Leak Doctor', rating: 4.9, reviews: 190, distance: '0.8 mi', phone: '(555) 880-1129', badge: 'Waterproof Vetted' },
    { name: 'Tile, Shingle & Metal Roofing Pro', rating: 4.7, reviews: 125, distance: '1.7 mi', phone: '(555) 441-8830', badge: 'Licensed Roofer' },
    { name: 'Gutter & Flashing Repair Services', rating: 4.6, reviews: 80, distance: '2.8 mi', phone: '(555) 219-6644', badge: 'Fast Dispatch' },
  ],
  'AC Technician': [
    { name: 'ClimateCool HVAC & Refrigeration', rating: 4.9, reviews: 270, distance: '0.5 mi', phone: '(555) 331-8890', badge: 'EPA Certified' },
    { name: 'Rapid AC Gas Refill & Compressor Tech', rating: 4.8, reviews: 165, distance: '1.2 mi', phone: '(555) 772-4411', badge: 'Same Day' },
    { name: 'Home & Office Chiller Services', rating: 4.6, reviews: 95, distance: '2.2 mi', phone: '(555) 904-1188', badge: 'Top Rated' },
  ],
  'Generator Tech': [
    { name: 'Perkins & Diesel Plant Engineers', rating: 4.9, reviews: 185, distance: '0.9 mi', phone: '(555) 661-3320', badge: 'Certified Tech' },
    { name: 'Backup Power Generator Overhaulers', rating: 4.7, reviews: 115, distance: '1.8 mi', phone: '(555) 884-2291', badge: 'Field Service' },
    { name: 'Automatic Transfer Switch Specialists', rating: 4.5, reviews: 70, distance: '3.0 mi', phone: '(555) 449-7705', badge: 'Open Now' },
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
  Cleaner: [
    { name: 'Spotless Deep Home Cleaning Pro', rating: 4.9, reviews: 340, distance: '0.4 mi', phone: '(555) 552-1109', badge: 'Eco Certified' },
    { name: 'Post-Construction & Carpet Steam', rating: 4.8, reviews: 210, distance: '1.0 mi', phone: '(555) 778-9932', badge: 'Vetted Maids' },
    { name: 'Pest Fumigation & Sanitizing Crew', rating: 4.6, reviews: 125, distance: '2.0 mi', phone: '(555) 331-4480', badge: 'Top Rated' },
  ],
  Handyman: [
    { name: 'All-Pro Multi-Trade Handyman', rating: 4.9, reviews: 395, distance: '0.4 mi', phone: '(555) 119-8844', badge: 'Top Rated' },
    { name: 'Rapid Fixture & Assembly Specialists', rating: 4.8, reviews: 240, distance: '0.9 mi', phone: '(555) 662-3310', badge: 'Same Day' },
    { name: 'Neighborhood Fixer & Odd Jobs', rating: 4.6, reviews: 130, distance: '1.8 mi', phone: '(555) 904-7722', badge: 'Open Now' },
  ],
};

export function detectArtisanTrade(query: string): string {
  const q = query.toLowerCase();
  if (/\b(tile|tiler|tiling|marble|granite|terrazzo|porcelain|paver)\b/.test(q)) return 'Tiler';
  if (/\b(plaster|plasterer|plastering|pop|drywall|gypsum|ceiling|screeding)\b/.test(q)) return 'Plasterer';
  if (/\b(carpenter|carpentry|wood|woodwork|joiner|cabinet|wardrobe|furniture|joinery)\b/.test(q)) return 'Carpenter';
  if (/\b(paint|painter|painting|wall\s*paint|decorator|screed)\b/.test(q)) return 'Painter';
  if (/\b(mason|masonry|brick|bricklayer|block|blocklayer|concrete|stone\s*mason|foundation)\b/.test(q)) return 'Mason';
  if (/\b(weld|welder|welding|iron|fabricat|metal|ironmonger|gate|burglar\s*proof)\b/.test(q)) return 'Welder';
  if (/\b(ac|air\s*con|hvac|chiller|cooling|refrigerat)\b/.test(q)) return 'AC Technician';
  if (/\b(gen|generator|plant|diesel\s*gen|mikano|perkins)\b/.test(q)) return 'Generator Tech';
  if (/\b(mechanic|auto|car\s*repair|engine|brake|transmission|panel\s*beater)\b/.test(q)) return 'Mechanic';
  if (/\b(roof|roofer|roofing|gutter|leak\s*roof|aluminum\s*roof|truss)\b/.test(q)) return 'Roofer';
  if (/\b(clean|cleaner|cleaning|fumigat|pest\s*control|janitor|deep\s*clean)\b/.test(q)) return 'Cleaner';
  if (/\b(lock|locksmith|key|padlock|deadbolt|safe)\b/.test(q)) return 'Locksmith';
  if (/\b(laundry|dry\s*clean|wash|washman|ironing)\b/.test(q)) return 'Laundry';
  if (/\b(plumb|plumber|pipe|drain|leak|water\s*pipe|tap|faucet|borehole|sink)\b/.test(q)) return 'Plumber';
  if (/\b(electric|electrician|wire|wiring|power|fuse|circuit|solar|inverter)\b/.test(q)) return 'Electrician';
  if (/\b(handy|handyman|repair|fixer|odd\s*jobs|mounting)\b/.test(q)) return 'Handyman';

  const cleaned = query.trim().replace(/^(find|search|hire|get|need|a|an|the|verified|pro|skilled)\s+/i, '');
  if (cleaned.length > 2 && cleaned.length < 25) {
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }
  return 'Handyman';
}

export function detectCountryInQuery(query: string): string | null {
  const q = query.toLowerCase();
  for (const c of ALL_COUNTRIES) {
    if (q.includes(c.name.toLowerCase()) || q.includes(c.code.toLowerCase())) {
      return c.code;
    }
  }
  if (/\b(lagos|abuja|ibadan|portharcourt|enugu|kano|nigeria|naija)\b/.test(q)) return 'NG';
  if (/\b(london|manchester|birmingham|leeds|glasgow|uk|britain|england)\b/.test(q)) return 'GB';
  if (/\b(new york|san francisco|los angeles|chicago|austin|miami|houston|seattle|usa|united states)\b/.test(q)) return 'US';
  if (/\b(toronto|vancouver|montreal|calgary|ottawa|canada)\b/.test(q)) return 'CA';
  if (/\b(paris|berlin|madrid|rome|amsterdam|dublin|europe)\b/.test(q)) return 'DE';
  if (/\b(accra|kumasi|ghana)\b/.test(q)) return 'GH';
  if (/\b(nairobi|mombasa|kenya)\b/.test(q)) return 'KE';
  if (/\b(johannesburg|cape town|durban|south africa)\b/.test(q)) return 'ZA';
  return null;
}

export function generateMarketProviders(
  category: string,
  country: string,
  searchQuery = category
): MarketProvider[] {
  const cName = getCountryInfo(country).name;
  const normalizedCategory = detectArtisanTrade(searchQuery || category);
  const targetCat = TASK_CATEGORIES.includes(category) ? category : normalizedCategory;

  const regionalSet =
    REGIONAL_MARKET_PROVIDERS[country]?.[targetCat] ||
    REGIONAL_MARKET_PROVIDERS[country]?.[normalizedCategory];

  const fallbackSet =
    GLOBAL_FALLBACK_PROVIDERS[targetCat] ||
    GLOBAL_FALLBACK_PROVIDERS[normalizedCategory];

  // If a completely unique trade was searched that is not in hardcoded lists, synthesize 3 verified artisans for that trade
  const list =
    regionalSet ??
    fallbackSet ??
    [
      {
        name: `${cName} Master ${targetCat} Craftsman`,
        rating: 4.9,
        reviews: 215,
        distance: country === 'US' || country === 'GB' ? '0.6 mi' : '1.2 km',
        phone: country === 'NG' ? '+234 803 771 9920' : '+1 (555) 392-4410',
        badge: 'Trade Guild Verified',
      },
      {
        name: `Elite ${targetCat} Precision Services`,
        rating: 4.8,
        reviews: 148,
        distance: country === 'US' || country === 'GB' ? '1.4 mi' : '2.3 km',
        phone: country === 'NG' ? '+234 812 449 8831' : '+1 (555) 771-8892',
        badge: 'Identity Screened',
      },
      {
        name: `Local Independent ${targetCat} Pro`,
        rating: 4.7,
        reviews: 94,
        distance: country === 'US' || country === 'GB' ? '2.5 mi' : '3.8 km',
        phone: country === 'NG' ? '+234 901 332 5540' : '+1 (555) 880-3321',
        badge: 'Community Vetted',
      },
    ];

  return list.map((item, index) => {
    let startingPrice = 35 + index * 15;
    if (country === 'NG') startingPrice = 8500 + index * 3500;
    else if (country === 'GB') startingPrice = 45 + index * 20;
    else if (country === 'CA') startingPrice = 60 + index * 25;
    else if (isEU(country)) startingPrice = 40 + index * 20;
    else if (country === 'US') startingPrice = 55 + index * 25;

    return {
      id: `${country}-${targetCat}-${index}`,
      category: targetCat,
      name: searchQuery === category ? item.name : `${cName} · ${item.name}`,
      distance: item.distance || (country === 'US' || country === 'GB' ? `${(0.4 + index * 0.7).toFixed(1)} mi` : `${(0.8 + index * 1.2).toFixed(1)} km`),
      phone: item.phone,
      badge: item.badge,
      isIdentityVerified: true,
      safetyScore: index === 0 ? 99 : index === 1 ? 98 : 96,
      reportCount: 0,
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
