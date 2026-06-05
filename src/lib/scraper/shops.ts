/**
 * Central registry of known Czech shops. The slug is what appears in
 * kupi.cz URLs (e.g. /letaky/tesco, /sleva/maslo → offers with shop slug).
 */
export const KNOWN_SHOPS: Record<string, { name: string; emoji?: string }> = {
  albert: { name: "Albert" },
  tesco: { name: "Tesco" },
  lidl: { name: "Lidl" },
  billa: { name: "BILLA" },
  kaufland: { name: "Kaufland" },
  globus: { name: "Globus" },
  penny: { name: "PENNY" },
  makro: { name: "MAKRO Cash & Carry" },
  norma: { name: "Norma" },
  "flop-top": { name: "Flop TOP" },
  "coop-jednota": { name: "COOP Jednota" },
  "dm-drogerie": { name: "dm drogerie" },
  rossmann: { name: "ROSSMANN" },
  "teta-drogerie": { name: "Teta drogerie" },
  pilulka: { name: "Pilulka lékárna" },
  benu: { name: "Benu lékárna" },
};
