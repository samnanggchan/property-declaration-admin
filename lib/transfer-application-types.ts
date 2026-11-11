import { calculateAgeFromDob, toArabicNum } from "./utils";
import { toKhmerDigits } from "./inheritance-request-types";

/* ═════════════════════════ Constants ═════════════════════════ */

export const MAX_PARTIES = 10;
export const WITNESS_SLOTS = 2;

export type PropertyType =
  | "ទ្រព្យខាងប្តី"
  | "ទ្រព្យខាងប្រពន្ធ"
  | "ទ្រព្យលីវ"
  | "ទ្រព្យរួមប្តីប្រពន្ធ"
  | "រដ្ឋ"
  | "នីតិបុគ្គលសាធារណៈផ្សេងពីរដ្ឋ"
  | "ទ្រព្យវត្ត"
  | "សហគមន៍ជនជាតិដើមភាគតិច"
  | "ទ្រព្យរួម"
  | "ទ្រព្យផ្ទាល់ខ្លួន"
  | string;

export const PROPERTY_TYPES: PropertyType[] = [
  "ទ្រព្យខាងប្តី",
  "ទ្រព្យខាងប្រពន្ធ",
  "ទ្រព្យលីវ",
  "ទ្រព្យរួមប្តីប្រពន្ធ",
  "រដ្ឋ",
  "នីតិបុគ្គលសាធារណៈផ្សេងពីរដ្ឋ",
  "ទ្រព្យវត្ត",
  "សហគមន៍ជនជាតិដើមភាគតិច",
  "ទ្រព្យរួម",
  "ទ្រព្យផ្ទាល់ខ្លួន",
];

export const PURPOSES = [
  { key: "whole", label: "ការផ្ទេរកម្មសិទ្ធិទាំងមូល" },
  { key: "part", label: "ការផ្ទេរកម្មសិទ្ធិមួយផ្នែក" },
  {
    key: "coWhole",
    label:
      "ការផ្ទេរចំណែកកម្មសិទ្ធិអវិភាគទាំងមូលរបស់ម្ចាស់កម្មសិទ្ធិអវិភាគឈ្មោះ",
  },
  {
    key: "coPart",
    label:
      "ការផ្ទេរចំណែកកម្មសិទ្ធិអវិភាគមួយផ្នែករបស់ម្ចាស់កម្មសិទ្ធិអវិភាគឈ្មោះ",
  },
] as const;

export const CAUSES = [
  { key: "sale", label: "ការលក់ទិញ" },
  { key: "gift", label: "ប្រទានកម្ម" },
  { key: "exchange", label: "ការដូរ" },
  { key: "succession", label: "សន្តតិកម្ម" },
  { key: "inheritanceSplit", label: "ការបែងចែកមត៌ក" },
  { key: "bequest", label: "អច្ច័យទាន" },
  { key: "judgment", label: "សាលក្រម/សាលដីកា" },
  { key: "coSplit", label: "ការបែងចែកកម្មសិទ្ធិអវិភាគ" },
  { key: "renounce", label: "ការលះបង់ចំណែកកម្មសិទ្ធិអវិភាគ" },
  { key: "other", label: "ផ្សេងៗ" },
] as const;

export type TransferPurpose = (typeof PURPOSES)[number]["key"];
export type TransferCause = (typeof CAUSES)[number]["key"];

export const LAND_USE_TYPES = [
  "សាងសង់",
  "លំនៅឋាន",
  "កសិកម្ម",
  "ពាណិជ្ជកម្ម",
  "ឧស្សាហកម្ម",
  "ចម្ការ",
];

export const USAGE_NATURES = ["ឯកជន", "រដ្ឋ", "សមូហភាព", "វត្តអារាម"];

export const POSSESSION_SOURCES = [
  "ទិញ",
  "ផ្ទេរសិទ្ធិ",
  "ទទួលមរតក",
  "ប្រទានកម្ម",
  "កាន់កាប់ស្របច្បាប់",
  "សម្បទាន",
];

/* ═════════════════════════ Interfaces ═════════════════════════ */

export interface ParcelAndProperty {
  parcel_number: string;
  location: string;
  streetNo?: string;
  village?: string;
  sangkat?: string;
  khan?: string;
  city?: string;
  property_characteristics: {
    property_type: PropertyType;
    size: string;
    land_use_type: string;
    usage_nature: string;
    source_of_acquisition: string;
    acquisition_year: string;
  };
  boundaries: {
    north: string;
    south: string;
    east: string;
    west: string;
  };
  registration_date: string;
}

export interface PersonData {
  full_name: string;
  id_card_number: string;
  dob: string;
  nationality: string;
  gender?: string;
  marital_status?: string;
  pob: string;
  father_name: string;
  mother_name: string;
  current_address: string;
  spouse_name?: string;
}

export interface LegalEntityData {
  entity_name: string;
  charter_number: string;
  head_office_address: string;
  representative_name: string;
  representative_role: string;
  representative_id: string;
  representative_dob: string;
  representative_nationality: string;
  representative_pob: string;
  representative_father: string;
  representative_mother: string;
  representative_address: string;
}

export interface SellerParty {
  seller_type: "INDIVIDUAL" | "LEGAL_ENTITY";
  property_classification: PropertyType;
  marital_status: "MARRIED" | "SINGLE";
  husband: PersonData;
  wife: PersonData;
  person: PersonData;
  legal_entity: LegalEntityData;
}

export interface BuyerParty {
  buyer_type: "INDIVIDUAL" | "LEGAL_ENTITY";
  property_classification: PropertyType;
  marital_status: "MARRIED" | "SINGLE";
  person: PersonData;
  husband: PersonData;
  wife: PersonData;
  legal_entity: LegalEntityData;
}

export interface WitnessData {
  full_name: string;
  id_card_number: string;
  dob_or_age: string;
  residence_address: string;
}

export interface TransferApplication {
  id?: string;
  title?: string;
  parcel_and_property: ParcelAndProperty;
  purpose: TransferPurpose;
  coOwnerName?: string;
  coOwnerNo?: string;
  cause: TransferCause;
  causeOther?: string;
  causeDate?: string;
  newCoOwnerShare?: string;
  date: string; // Application date
  attachments: string;
  sellers: SellerParty[];
  buyers: BuyerParty[];
  witnesses: [WitnessData, WitnessData];
  createdAt?: string;
  updatedAt?: string;
}

/* ═════════════════════════ Factories ═════════════════════════ */

export function emptyPersonData(): PersonData {
  return {
    full_name: "",
    id_card_number: "",
    dob: "",
    nationality: "ខ្មែរ",
    gender: "",
    marital_status: "",
    pob: "",
    father_name: "",
    mother_name: "",
    current_address: "",
    spouse_name: "",
  };
}

export function emptyLegalEntityData(): LegalEntityData {
  return {
    entity_name: "",
    charter_number: "",
    head_office_address: "",
    representative_name: "",
    representative_role: "",
    representative_id: "",
    representative_dob: "",
    representative_nationality: "ខ្មែរ",
    representative_pob: "",
    representative_father: "",
    representative_mother: "",
    representative_address: "",
  };
}

export function emptySellerParty(): SellerParty {
  return {
    seller_type: "INDIVIDUAL",
    property_classification: "ទ្រព្យរួមប្តីប្រពន្ធ",
    marital_status: "MARRIED",
    husband: emptyPersonData(),
    wife: emptyPersonData(),
    person: emptyPersonData(),
    legal_entity: emptyLegalEntityData(),
  };
}

export function emptyBuyerParty(): BuyerParty {
  return {
    buyer_type: "INDIVIDUAL",
    property_classification: "ទ្រព្យរួមប្តីប្រពន្ធ",
    marital_status: "MARRIED",
    person: emptyPersonData(),
    husband: emptyPersonData(),
    wife: emptyPersonData(),
    legal_entity: emptyLegalEntityData(),
  };
}

export function emptyWitnessData(): WitnessData {
  return {
    full_name: "",
    id_card_number: "",
    dob_or_age: "",
    residence_address: "",
  };
}

export function emptyTransferApplication(): TransferApplication {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const todayStr = `${dd}.${mm}.${yyyy}`;

  return {
    parcel_and_property: {
      parcel_number: "",
      location: "",
      streetNo: "",
      village: "",
      sangkat: "",
      khan: "",
      city: "រាជធានីភ្នំពេញ",
      property_characteristics: {
        property_type: "ទ្រព្យរួមប្តីប្រពន្ធ",
        size: "",
        land_use_type: "សាងសង់",
        usage_nature: "ឯកជន",
        source_of_acquisition: "ទិញ",
        acquisition_year: String(yyyy),
      },
      boundaries: {
        north: "",
        south: "",
        east: "",
        west: "",
      },
      registration_date: `${yyyy}-${mm}-${dd}`,
    },
    purpose: "whole",
    coOwnerName: "",
    coOwnerNo: "",
    cause: "sale",
    causeOther: "",
    causeDate: todayStr,
    newCoOwnerShare: "",
    date: todayStr,
    attachments: "",
    sellers: [emptySellerParty()],
    buyers: [emptyBuyerParty()],
    witnesses: [emptyWitnessData(), emptyWitnessData()],
  };
}

export function createSampleTransferApplication(): TransferApplication {
  return {
    id: "sample-transfer-01",
    title: "ពាក្យសុំផ្ទេរកម្មសិទ្ធិ - ក្បាលដី 12050605-4575",
    parcel_and_property: {
      parcel_number: "12050605-4575",
      location:
        "ភូមិត្រពាំងថ្លឹង១ សង្កាត់ចោមចៅទី១ ខណ្ឌពោធិ៍សែនជ័យ រាជធានីភ្នំពេញ",
      streetNo: "២១៧",
      village: "ត្រពាំងថ្លឹង១",
      sangkat: "ចោមចៅទី១",
      khan: "ពោធិ៍សែនជ័យ",
      city: "រាជធានីភ្នំពេញ",
      property_characteristics: {
        property_type: "ទ្រព្យរួមប្តីប្រពន្ធ",
        size: "157 m²",
        land_use_type: "សាងសង់",
        usage_nature: "ឯកជន",
        source_of_acquisition: "ទិញ",
        acquisition_year: "2005",
      },
      boundaries: {
        north: "ដីឡូត៍លេខ ១២០៥០៦០៥-៤៥៧៤",
        south: "ដីឡូត៍លេខ ១២០៥០៦០៥-៤៥៧៦",
        east: "ផ្លូវលេខ ២១៧",
        west: "ដីឡូត៍លេខ ១២០៥០៦០៥-៤៥៦០",
      },
      registration_date: "06.11.2026",
    },
    purpose: "whole",
    coOwnerName: "",
    coOwnerNo: "",
    cause: "sale",
    causeOther: "",
    causeDate: "06.11.2026",
    newCoOwnerShare: "",
    date: "06.11.2026",
    attachments:
      "វិញ្ញាបនប័ត្រសម្គាល់ម្ចាស់អចលនវត្ថុ, អត្តសញ្ញាណប័ណ្ណ, សៀវភៅគ្រួសារ",
    sellers: [
      {
        seller_type: "INDIVIDUAL",
        property_classification: "ទ្រព្យរួមប្តីប្រពន្ធ",
        marital_status: "MARRIED",
        husband: {
          full_name: "ឈូ ស៊ីសេង",
          id_card_number: "010352372(02)",
          dob: "22.02.1973",
          nationality: "ខ្មែរ",
          gender: "ប្រុស",
          marital_status: "មានប្តីប្រពន្ធ",
          pob: "ឃុំត្រពាំងក្រញូង ស្រុកត្រាំកក់ ខេត្តតាកែវ",
          father_name: "ឈូ ស៊ាន",
          mother_name: "សោម យ៉ាន",
          current_address:
            "ភូមិត្រពាំងថ្លឹង១ សង្កាត់ចោមចៅទី១ ខណ្ឌពោធិ៍សែនជ័យ រាជធានីភ្នំពេញ",
        },
        wife: {
          full_name: "ណាង គឹមហុង",
          id_card_number: "010488219(01)",
          dob: "18.05.1976",
          nationality: "ខ្មែរ",
          gender: "ស្រី",
          marital_status: "មានប្តីប្រពន្ធ",
          pob: "ឃុំត្រពាំងក្រញូង ស្រុកត្រាំកក់ ខេត្តតាកែវ",
          father_name: "ណាង សឿន",
          mother_name: "អ៊ុច សុផាត",
          current_address:
            "ភូមិត្រពាំងថ្លឹង១ សង្កាត់ចោមចៅទី១ ខណ្ឌពោធិ៍សែនជ័យ រាជធានីភ្នំពេញ",
        },
        person: emptyPersonData(),
        legal_entity: emptyLegalEntityData(),
      },
    ],
    buyers: [
      {
        buyer_type: "INDIVIDUAL",
        property_classification: "ទ្រព្យរួមប្តីប្រពន្ធ",
        marital_status: "MARRIED",
        husband: {
          full_name: "លាង ពៅ",
          id_card_number: "010887766(01)",
          dob: "14.08.1985",
          nationality: "ខ្មែរ",
          gender: "ប្រុស",
          marital_status: "មានប្តីប្រពន្ធ",
          pob: "សង្កាត់ផ្សារដេប៉ូ ខណ្ឌទួលគោក រាជធានីភ្នំពេញ",
          father_name: "លាង ហេង",
          mother_name: "តន់ សារី",
          current_address:
            "ផ្ទះលេខ ៤៥ ផ្លូវលេខ ៣៧១ ភូមិត្នោតជ្រុំ សង្កាត់បឹងទំពន់ទី១ ខណ្ឌមានជ័យ រាជធានីភ្នំពេញ",
        },
        wife: {
          full_name: "មិត្ត ភាព",
          id_card_number: "010998877(02)",
          dob: "12.05.1988",
          nationality: "ខ្មែរ",
          gender: "ស្រី",
          marital_status: "មានប្តីប្រពន្ធ",
          pob: "សង្កាត់ផ្សារដេប៉ូ ខណ្ឌទួលគោក រាជធានីភ្នំពេញ",
          father_name: "មិត្ត គង់",
          mother_name: "ចាន់ ថន",
          current_address:
            "ផ្ទះលេខ ៤៥ ផ្លូវលេខ ៣៧១ ភូមិត្នោតជ្រុំ សង្កាត់បឹងទំពន់ទី១ ខណ្ឌមានជ័យ រាជធានីភ្នំពេញ",
        },
        person: emptyPersonData(),
        legal_entity: emptyLegalEntityData(),
      },
    ],
    witnesses: [
      {
        full_name: "ឡឺក សុជា",
        id_card_number: "090 203 564 (01)",
        dob_or_age: "23.10.2004",
        residence_address: "១ឃុំ ចក្រី ស្រុក រមាសហែក ខេត្ត ស្វាយរៀង",
      },
      {
        full_name: "ទន់ សុភាព",
        id_card_number: "090 455 823 (02)",
        dob_or_age: "23.10.1980",
        residence_address:
          "ភូមិព្រែកតាគង់ សង្កាត់ចាក់អង្រែលើ ខណ្ឌមានជ័យ រាជធានីភ្នំពេញ",
      },
    ],
  };
}

/* ═════════════════════════ Normalizer ═════════════════════════ */

export function normalizeTransferApplication(
  raw: unknown,
): TransferApplication {
  const base = emptyTransferApplication();
  if (!raw || typeof raw !== "object") return base;
  const o = raw as Record<string, unknown>;

  const rawP = (
    o.parcel_and_property && typeof o.parcel_and_property === "object"
      ? o.parcel_and_property
      : {}
  ) as Record<string, unknown>;
  const rawChar = (
    rawP.property_characteristics &&
    typeof rawP.property_characteristics === "object"
      ? rawP.property_characteristics
      : {}
  ) as Record<string, unknown>;
  const rawBound = (
    rawP.boundaries && typeof rawP.boundaries === "object"
      ? rawP.boundaries
      : {}
  ) as Record<string, unknown>;

  const parcel_and_property: ParcelAndProperty = {
    parcel_number: String(rawP.parcel_number || "").trim(),
    location: String(rawP.location || "").trim(),
    streetNo: String(rawP.streetNo || "").trim(),
    village: String(rawP.village || "").trim(),
    sangkat: String(rawP.sangkat || "").trim(),
    khan: String(rawP.khan || "").trim(),
    city: String(rawP.city || "រាជធានីភ្នំពេញ").trim(),
    property_characteristics: {
      property_type:
        (rawChar.property_type as PropertyType) || "ទ្រព្យរួមប្តីប្រពន្ធ",
      size: String(rawChar.size || "").trim(),
      land_use_type: String(rawChar.land_use_type || "សាងសង់").trim(),
      usage_nature: String(rawChar.usage_nature || "ឯកជន").trim(),
      source_of_acquisition: String(
        rawChar.source_of_acquisition || "ទិញ",
      ).trim(),
      acquisition_year: String(
        rawChar.acquisition_year || new Date().getFullYear(),
      ).trim(),
    },
    boundaries: {
      north: String(rawBound.north || "").trim(),
      south: String(rawBound.south || "").trim(),
      east: String(rawBound.east || "").trim(),
      west: String(rawBound.west || "").trim(),
    },
    registration_date: String(
      rawP.registration_date || base.parcel_and_property.registration_date,
    ).trim(),
  };

  const cleanPerson = (p?: PersonData): PersonData => {
    if (!p) return emptyPersonData();
    return {
      ...p,
      full_name: (p.full_name || "")
        .replace(/^([ក-អ]|[A-Za-z0-9]+)\s*[\.\)\-]\s*/, "")
        .trim(),
    };
  };

  const sellers =
    Array.isArray(o.sellers) && o.sellers.length > 0
      ? o.sellers.slice(0, MAX_PARTIES).map((s) => ({
          ...emptySellerParty(),
          ...(typeof s === "object" && s !== null ? s : {}),
          husband: cleanPerson((s as any)?.husband),
          wife: cleanPerson((s as any)?.wife),
          person: cleanPerson((s as any)?.person),
          property_classification:
            (s as any)?.property_classification || "ទ្រព្យរួមប្តីប្រពន្ធ",
        }))
      : [emptySellerParty()];

  const buyers =
    Array.isArray(o.buyers) && o.buyers.length > 0
      ? o.buyers.slice(0, MAX_PARTIES).map((b) => ({
          ...emptyBuyerParty(),
          ...(typeof b === "object" && b !== null ? b : {}),
          husband: cleanPerson((b as any)?.husband),
          wife: cleanPerson((b as any)?.wife),
          person: cleanPerson((b as any)?.person),
          property_classification:
            (b as any)?.property_classification || "ទ្រព្យរួមប្តីប្រពន្ធ",
        }))
      : [emptyBuyerParty()];

  const rawW = Array.isArray(o.witnesses) ? o.witnesses : [];
  const witnesses: [WitnessData, WitnessData] = [
    (rawW[0] as WitnessData) || emptyWitnessData(),
    (rawW[1] as WitnessData) || emptyWitnessData(),
  ];

  return {
    id: typeof o.id === "string" ? o.id : undefined,
    title: typeof o.title === "string" ? o.title : undefined,
    parcel_and_property,
    purpose: (o.purpose as TransferPurpose) || "whole",
    coOwnerName: String(o.coOwnerName || "").trim(),
    coOwnerNo: String(o.coOwnerNo || "").trim(),
    cause: (o.cause as TransferCause) || "sale",
    causeOther: String(o.causeOther || "").trim(),
    causeDate: String(o.causeDate || base.causeDate).trim(),
    newCoOwnerShare: String(o.newCoOwnerShare || "").trim(),
    date: String(o.date || base.date).trim(),
    attachments: String(o.attachments || "").trim(),
    sellers,
    buyers,
    witnesses,
    createdAt: typeof o.createdAt === "string" ? o.createdAt : undefined,
    updatedAt: typeof o.updatedAt === "string" ? o.updatedAt : undefined,
  };
}
