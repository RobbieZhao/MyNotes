/** FIPS state/territory code → display name from us-atlas. */
export const STATE_NAMES: Record<string, string> = {
  "01": "Alabama",
  "02": "Alaska",
  "04": "Arizona",
  "05": "Arkansas",
  "06": "California",
  "08": "Colorado",
  "09": "Connecticut",
  "10": "Delaware",
  "11": "District of Columbia",
  "12": "Florida",
  "13": "Georgia",
  "15": "Hawaii",
  "16": "Idaho",
  "17": "Illinois",
  "18": "Indiana",
  "19": "Iowa",
  "20": "Kansas",
  "21": "Kentucky",
  "22": "Louisiana",
  "23": "Maine",
  "24": "Maryland",
  "25": "Massachusetts",
  "26": "Michigan",
  "27": "Minnesota",
  "28": "Mississippi",
  "29": "Missouri",
  "30": "Montana",
  "31": "Nebraska",
  "32": "Nevada",
  "33": "New Hampshire",
  "34": "New Jersey",
  "35": "New Mexico",
  "36": "New York",
  "37": "North Carolina",
  "38": "North Dakota",
  "39": "Ohio",
  "40": "Oklahoma",
  "41": "Oregon",
  "42": "Pennsylvania",
  "44": "Rhode Island",
  "45": "South Carolina",
  "46": "South Dakota",
  "47": "Tennessee",
  "48": "Texas",
  "49": "Utah",
  "50": "Vermont",
  "51": "Virginia",
  "53": "Washington",
  "54": "West Virginia",
  "55": "Wisconsin",
  "56": "Wyoming",
  "60": "American Samoa",
  "66": "Guam",
  "69": "Commonwealth of the Northern Mariana Islands",
  "72": "Puerto Rico",
  "78": "United States Virgin Islands",
};

const STATE_ABBREVS: Record<string, string> = {
  al: "01",
  ak: "02",
  az: "04",
  ar: "05",
  ca: "06",
  co: "08",
  ct: "09",
  de: "10",
  dc: "11",
  fl: "12",
  ga: "13",
  hi: "15",
  id: "16",
  il: "17",
  in: "18",
  ia: "19",
  ks: "20",
  ky: "21",
  la: "22",
  me: "23",
  md: "24",
  ma: "25",
  mi: "26",
  mn: "27",
  ms: "28",
  mo: "29",
  mt: "30",
  ne: "31",
  nv: "32",
  nh: "33",
  nj: "34",
  nm: "35",
  ny: "36",
  nc: "37",
  nd: "38",
  oh: "39",
  ok: "40",
  or: "41",
  pa: "42",
  ri: "44",
  sc: "45",
  sd: "46",
  tn: "47",
  tx: "48",
  ut: "49",
  vt: "50",
  va: "51",
  wa: "53",
  wv: "54",
  wi: "55",
  wy: "56",
  as: "60",
  gu: "66",
  mp: "69",
  pr: "72",
  vi: "78",
};

const EXTRA_ALIASES: Record<string, string> = {
  "district of columbia": "11",
  "washington dc": "11",
  "washington d.c.": "11",
  "d.c.": "11",
  dc: "11",
  calif: "06",
  califonia: "06",
  cali: "06",
  california: "06",
  texas: "48",
  tex: "48",
  "new york": "36",
  "new york state": "36",
  "north carolina": "37",
  "south carolina": "45",
  "north dakota": "38",
  "south dakota": "46",
  "west virginia": "54",
  "new mexico": "35",
  "new jersey": "34",
  "new hampshire": "33",
  "rhode island": "44",
  "puerto rico": "72",
  "american samoa": "60",
  "northern mariana islands": "69",
  "us virgin islands": "78",
  "u.s. virgin islands": "78",
  "virgin islands": "78",
};

function normalizeStateKey(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[.'']/g, "")
    .replace(/\s+/g, " ");
}

function padFips(id: string): string {
  return id.padStart(2, "0");
}

const ALIAS_TO_ID: Record<string, string> = (() => {
  const map: Record<string, string> = { ...EXTRA_ALIASES };
  for (const [id, name] of Object.entries(STATE_NAMES)) {
    map[normalizeStateKey(name)] = id;
  }
  for (const [abbrev, id] of Object.entries(STATE_ABBREVS)) {
    map[abbrev] = id;
  }
  return map;
})();

export function resolveStateId(name: string): string | null {
  const key = normalizeStateKey(name);
  if (!key) return null;

  if (ALIAS_TO_ID[key]) return ALIAS_TO_ID[key];

  const geoFips = key.match(/^(\d{2})\d{3}$/);
  if (geoFips && STATE_NAMES[geoFips[1]]) return geoFips[1];

  if (/^\d{1,2}$/.test(key)) {
    const padded = padFips(key);
    if (STATE_NAMES[padded]) return padded;
  }

  if (key.length === 2 && STATE_ABBREVS[key]) return STATE_ABBREVS[key];

  for (const [alias, id] of Object.entries(ALIAS_TO_ID)) {
    if (alias.includes(key) || key.includes(alias)) {
      if (Math.min(alias.length, key.length) >= 4) return id;
    }
  }

  return null;
}

export function getStateDisplayName(id: string, fallback?: string): string {
  const padded = padFips(id);
  return STATE_NAMES[padded] ?? fallback ?? id;
}
