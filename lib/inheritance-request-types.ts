export const APPLICANT_SLOTS = 2;
export const WITNESS_SLOTS = 2;
export const CHILD_SLOTS = 10;
export const DECEASED_SLOTS = 2;
export const RELATIVE_SLOTS = 8;

export interface Deceased {
  name: string; // ឈ្មោះខ្មោច
  birthYear: string; // កើតនៅឆ្នាំ
  deathDate: string; // ស្លាប់នៅថ្ងៃ
  deathCertNo: string; // សំបុត្រមរណៈភាពលេខ
  deathCertDate: string; // ចុះថ្ងៃ
}

export interface Applicant {
  name: string;
  dob: string;
  address: string;
  village?: string;
  sangkat?: string;
  khan?: string;
  city?: string;
  fatherName: string;
  motherName: string;
  relationDeceased: string; // ត្រូវជា...នៃខ្មោច (ឧ. ប្រពន្ធ / ប្ដី)
  relationHeirs: string; // និងជា...នៃយើងខ្ញុំ (ឧ. ម្ដាយ / ឪពុក)
}

export interface Witness {
  name: string;
  dob: string;
  idNumber: string;
  address: string;
}

export interface Child {
  name: string;
  gender: "" | "ប្រុស" | "ស្រី";
  dob: string;
  birthCertDate: string; // ថ្ងៃខែឆ្នាំចុះ សំបុត្រកំណើត
  birthCertNo: string; // លេខសំបុត្រកំណើត
  commune: string; // ឃុំ/សង្កាត់
  district: string; // ក្រុង/ស្រុក/ខណ្ឌ
  note: string; // សម្គាល់
}

export interface Relative {
  name: string; // ឈ្មោះ
  gender: "" | "ប្រុស" | "ស្រី"; // ភេទ
  birthYear: string; // ឆ្នាំកំណើត
  address: string; // ទីលំនៅ
}

export interface InheritanceRequest {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
  title: string;
  refNo: string; // លេខយោង
  location: string; // ទីតាំង
  area: string; // ទំហំ
  propertyType: string; // ប្រភេទដី (ឧ. លំនៅឋាន)
  date: string; // dd.mm.yyyy – date printed above the signatures
  deceasedSangkat: string; // នៅសង្កាត់

  // Specific land & authority details for pages 3, 4, 5
  titleDeedNo: string; // ប័ណ្ណសម្គាល់សិទ្ធិកាន់កាប់អចលនវត្ថុលេខ
  plotNo: string; // ក្បាលដីលេខ
  streetNo: string; // ផ្លូវលេខ
  village: string; // ភូមិ
  sangkat: string; // សង្កាត់
  khan: string; // ខណ្ឌ
  city: string; // រាជធានី/ខេត្ត
  authorizedPerson: string; // ឈ្មោះអ្នកទទួលសិទ្ធិចាត់ចែង (ខាង)
  authorizedRelationDeceased: string; // ត្រូវជា...នៃខ្មោច (ឧ. ប្រពន្ធ / ប្ដី)
  authorizedRelationHeirs: string; // និងជា...នៃយើងខ្ញុំទាំងអស់គ្នា (ឧ. ម្ដាយ / ឪពុក)
  communeChiefName: string; // ឈ្មោះចៅសង្កាត់
  heirCertNo: string; // លេខសំបុត្របញ្ជាក់ទាយាទ
  letterRefNo: string; // លិខិតតំណាង/ដំណាលលេខ
  letterRefDate: string; // ចុះថ្ងៃទី

  deceased: Deceased[];
  applicants: Applicant[];
  witnesses: Witness[];
  children: Child[];
  relatives: Relative[];
}

export const emptyApplicant = (): Applicant => ({
  name: "",
  dob: "",
  address: "",
  village: "",
  sangkat: "",
  khan: "",
  city: "រាជធានីភ្នំពេញ",
  fatherName: "",
  motherName: "",
  relationDeceased: "",
  relationHeirs: "",
});

export const emptyWitness = (): Witness => ({
  name: "",
  dob: "",
  idNumber: "",
  address: "",
});

export const emptyChild = (): Child => ({
  name: "",
  gender: "",
  dob: "",
  birthCertDate: "",
  birthCertNo: "",
  commune: "",
  district: "",
  note: "",
});

export const emptyRelative = (): Relative => ({
  name: "",
  gender: "",
  birthYear: "",
  address: "",
});

export const emptyDeceased = (): Deceased => ({
  name: "",
  birthYear: "",
  deathDate: "",
  deathCertNo: "",
  deathCertDate: "",
});

export const emptyRequest = (): InheritanceRequest => ({
  title: "ពាក្យស្នើសុំផ្ទេរសិទ្ធិកាន់កាប់អចលនវត្ថុជាមរតក",
  refNo: "",
  location: "",
  area: "",
  propertyType: "លំនៅដ្ឋាន",
  date: "",
  deceasedSangkat: "",
  titleDeedNo: "",
  plotNo: "",
  streetNo: "",
  village: "",
  sangkat: "",
  khan: "",
  city: "រាជធានីភ្នំពេញ",
  authorizedPerson: "",
  authorizedRelationDeceased: "",
  authorizedRelationHeirs: "",
  communeChiefName: "",
  heirCertNo: "",
  letterRefNo: "",
  letterRefDate: "",
  deceased: Array.from({ length: DECEASED_SLOTS }, emptyDeceased),
  applicants: Array.from({ length: APPLICANT_SLOTS }, emptyApplicant),
  witnesses: Array.from({ length: WITNESS_SLOTS }, emptyWitness),
  children: Array.from({ length: CHILD_SLOTS }, emptyChild),
  relatives: Array.from({ length: RELATIVE_SLOTS }, emptyRelative),
});

/** Fixed-size list: keeps known fields, fills the rest with blanks. */
function fixedList<T extends object>(
  raw: unknown,
  make: () => T,
  size: number,
): T[] {
  const src = Array.isArray(raw) ? raw : [];
  return Array.from({ length: size }, (_, i) => {
    const item = src[i];
    return { ...make(), ...(item && typeof item === "object" ? item : {}) };
  });
}

/** Extracts plot number (ក្បាលដីលេខ) from title deed number (e.g. "12060201-1608" → "1608") */
export function extractPlotNo(titleDeedNo: string | undefined | null): string {
  if (!titleDeedNo) return "";
  const cleaned = titleDeedNo.trim();
  const parts = cleaned.split("-");
  if (parts.length > 1) {
    return parts[parts.length - 1].trim();
  }
  return "";
}

/** Parses address string into village, sangkat/commune, khan/district, city */
export function splitAddress(address: string | undefined | null) {
  const a = (address || "").trim();
  if (!a) return { village: "", commune: "", district: "", city: "" };
  const pick = (re: RegExp, prefix: RegExp) => {
    const m = a.match(re);
    return m ? m[0].replace(prefix, "").trim() : "";
  };
  const village = pick(/ភូមិ[^\s,]+/, /^ភូមិ/);
  const commune = pick(/(សង្កាត់|ឃុំ)[^\s,]+/, /^(សង្កាត់|ឃុំ)/);
  const district = pick(/(ខណ្ឌ|ស្រុក|ក្រុង)[^\s,]+/, /^(ខណ្ឌ|ស្រុក|ក្រុង)/);
  const city = pick(/(រាជធានី|ខេត្ត)[^\s,]+/, /^(រាជធានី|ខេត្ត)/);
  if (!village && !commune && !district && !city)
    return { village: "", commune: a, district: "", city: "" };
  return { village, commune, district, city };
}

/** Composes structured address pieces into a full Cambodian address string */
export function buildAddressString(parts: {
  streetNo?: string;
  village?: string;
  sangkat?: string;
  khan?: string;
  city?: string;
}): string {
  const items: string[] = [];
  if (parts.streetNo?.trim()) {
    const s = parts.streetNo.trim();
    items.push(s.startsWith("ផ្លូវ") ? s : `ផ្លូវលេខ ${s}`);
  }
  if (parts.village?.trim()) {
    const v = parts.village.trim();
    items.push(v.startsWith("ភូមិ") ? v : `ភូមិ${v}`);
  }
  if (parts.sangkat?.trim()) {
    const s = parts.sangkat.trim();
    items.push(s.startsWith("សង្កាត់") ? s : `សង្កាត់${s}`);
  }
  if (parts.khan?.trim()) {
    const k = parts.khan.trim();
    items.push(k.startsWith("ខណ្ឌ") ? k : `ខណ្ឌ${k}`);
  }
  if (parts.city?.trim()) {
    items.push(parts.city.trim());
  }
  return items.join(" ");
}

/** Normalizes an applicant record, splitting legacy single address into village/sangkat/khan */
export function normalizeApplicant(raw: unknown): Applicant {
  const base = emptyApplicant();
  if (!raw || typeof raw !== "object") return base;
  const a = raw as Partial<Applicant>;
  let village = typeof a.village === "string" ? a.village : "";
  let sangkat = typeof a.sangkat === "string" ? a.sangkat : "";
  let khan = typeof a.khan === "string" ? a.khan : "";
  let city = typeof a.city === "string" ? a.city : "រាជធានីភ្នំពេញ";
  let address = typeof a.address === "string" ? a.address : "";

  // If address exists but village/sangkat/khan were not set, split address
  if (address && (!village || !sangkat || !khan)) {
    const parsed = splitAddress(address);
    if (!village && parsed.village) village = parsed.village;
    if (!sangkat && parsed.commune) sangkat = parsed.commune;
    if (!khan && parsed.district) khan = parsed.district;
    if (!city && parsed.city) city = parsed.city;
  }

  // If village/sangkat/khan exist but address is empty, compose address
  if (!address && (village || sangkat || khan)) {
    address = buildAddressString({ village, sangkat, khan, city });
  }

  return {
    name: typeof a.name === "string" ? a.name : "",
    dob: typeof a.dob === "string" ? a.dob : "",
    address,
    village,
    sangkat,
    khan,
    city,
    fatherName: typeof a.fatherName === "string" ? a.fatherName : "",
    motherName: typeof a.motherName === "string" ? a.motherName : "",
    relationDeceased:
      typeof a.relationDeceased === "string" ? a.relationDeceased : "",
    relationHeirs: typeof a.relationHeirs === "string" ? a.relationHeirs : "",
  };
}

/** Safe to call with anything read from localStorage / an API. */
export function normalizeRequest(raw: unknown): InheritanceRequest {
  const base = emptyRequest();
  if (!raw || typeof raw !== "object") return base;
  const r = raw as Partial<InheritanceRequest>;

  const deed = typeof r.titleDeedNo === "string" ? r.titleDeedNo : "";
  const rawPlot = typeof r.plotNo === "string" ? r.plotNo : "";
  const plotNo = rawPlot || extractPlotNo(deed);

  const village = typeof r.village === "string" ? r.village : "";
  const sangkat = typeof r.sangkat === "string" ? r.sangkat : "";
  const khan = typeof r.khan === "string" ? r.khan : "";
  const city = typeof r.city === "string" ? r.city : "រាជធានីភ្នំពេញ";
  const streetNo = typeof r.streetNo === "string" ? r.streetNo : "";
  let location = typeof r.location === "string" ? r.location : "";
  if (!location && (village || sangkat || khan)) {
    location = buildAddressString({ streetNo, village, sangkat, khan, city });
  }

  const rawTitle = typeof r.title === "string" ? r.title.trim() : "";
  const title =
    !rawTitle || rawTitle === "ពាក្យស្នើសុ" || rawTitle === "ពាក្យស្នើសុំ"
      ? base.title
      : rawTitle;

  return {
    id: typeof r.id === "string" ? r.id : undefined,
    createdAt: typeof r.createdAt === "string" ? r.createdAt : undefined,
    updatedAt: typeof r.updatedAt === "string" ? r.updatedAt : undefined,
    title,
    refNo: typeof r.refNo === "string" ? r.refNo : "",
    location,
    area: typeof r.area === "string" ? r.area : "",
    propertyType:
      typeof r.propertyType === "string" ? r.propertyType : "លំនៅដ្ឋាន",
    date: typeof r.date === "string" ? r.date : "",
    deceasedSangkat:
      typeof r.deceasedSangkat === "string" ? r.deceasedSangkat : "",
    titleDeedNo: deed,
    plotNo,
    streetNo,
    village,
    sangkat,
    khan,
    city,
    authorizedPerson:
      typeof r.authorizedPerson === "string" ? r.authorizedPerson : "",
    authorizedRelationDeceased:
      typeof r.authorizedRelationDeceased === "string"
        ? r.authorizedRelationDeceased
        : "",
    authorizedRelationHeirs:
      typeof r.authorizedRelationHeirs === "string"
        ? r.authorizedRelationHeirs
        : "",
    communeChiefName:
      typeof r.communeChiefName === "string" ? r.communeChiefName : "",
    heirCertNo: typeof r.heirCertNo === "string" ? r.heirCertNo : "",
    letterRefNo: typeof r.letterRefNo === "string" ? r.letterRefNo : "",
    letterRefDate: typeof r.letterRefDate === "string" ? r.letterRefDate : "",
    deceased: fixedList(r.deceased, emptyDeceased, DECEASED_SLOTS),
    applicants: Array.isArray(r.applicants)
      ? Array.from({ length: APPLICANT_SLOTS }, (_, i) =>
          normalizeApplicant(r.applicants?.[i]),
        )
      : Array.from({ length: APPLICANT_SLOTS }, emptyApplicant),
    witnesses: fixedList(r.witnesses, emptyWitness, WITNESS_SLOTS),
    children: fixedList(r.children, emptyChild, CHILD_SLOTS),
    relatives: fixedList(r.relatives, emptyRelative, RELATIVE_SLOTS),
  };
}

const KHMER_DIGITS = ["០", "១", "២", "៣", "៤", "៥", "៦", "៧", "៨", "៩"];

/** "22.02.1980" → "២២.០២.១៩៨០" */
export function toKhmerDigits(value: string | number | undefined | null) {
  if (value === undefined || value === null) return "";
  return String(value).replace(/[0-9]/g, (d) => KHMER_DIGITS[Number(d)]);
}

/** "08.10.2026" → { day: "08", month: "10", year: "2026" } */
export function parseDateParts(date: string) {
  const parts = (date || "").trim().split(/[./\-\s]+/);
  if (parts.length >= 3) {
    return { day: parts[0], month: parts[1], year: parts[2] };
  }
  return { day: "", month: "", year: "" };
}

/** How many entries have a name – used for the little progress chips. */
export const countNamed = (list: { name: string }[]) =>
  list.filter((x) => x.name.trim()).length;

/** Fake data so you can see the layout filled in. */
export function sampleRequest(): InheritanceRequest {
  const r = emptyRequest();
  r.refNo = "០០១/២៦";
  r.area = "58 (ម២)";
  r.propertyType = "លំនៅដ្ឋាន";
  r.date = "08.10.2026";
  r.deceasedSangkat = "បឹងទំពុនទី១";
  r.titleDeedNo = "12060201-1608";
  r.plotNo = "1608";
  r.streetNo = "១៩៣";
  r.village = "ចំរើនផល";
  r.sangkat = "បឹងទំពុនទី១";
  r.khan = "មានជ័យ";
  r.city = "រាជធានីភ្នំពេញ";
  r.location = buildAddressString({
    streetNo: r.streetNo,
    village: r.village,
    sangkat: r.sangkat,
    khan: r.khan,
    city: r.city,
  });
  r.authorizedPerson = "ទី ម៉ារី";
  r.authorizedRelationDeceased = "ប្រពន្ធ";
  r.authorizedRelationHeirs = "ម្ដាយ";
  r.communeChiefName = "";
  r.heirCertNo = "០៤២/២៦";
  r.letterRefNo = "០១២/២៦";
  r.letterRefDate = "០៥.១០.២០២៦";
  r.deceased[0] = {
    name: "រស់ ហន",
    birthYear: "1947",
    deathDate: "19.02.2023",
    deathCertNo: "៣២",
    deathCertDate: "23.05.2023",
  };
  r.applicants[0] = {
    name: "ទី ម៉ារី",
    dob: "01.01.1949",
    village: "ចំរើនផល",
    sangkat: "បឹងទំពុនទី១",
    khan: "មានជ័យ",
    city: "រាជធានីភ្នំពេញ",
    address: "ភូមិចំរើនផល សង្កាត់បឹងទំពុនទី១ ខណ្ឌមានជ័យ រាជធានីភ្នំពេញ",
    fatherName: "",
    motherName: "",
    relationDeceased: "ប្រពន្ធ",
    relationHeirs: "ម្ដាយ",
  };
  r.applicants[1] = {
    name: "ជា សុភី",
    dob: "05.07.1988",
    address: "ផ្ទះលេខ ១២ ផ្លូវ ១៩៣ រាជធានីភ្នំពេញ",
    fatherName: "ជា ធី",
    motherName: "ឈួន សុខា",
    relationDeceased: "កូន",
    relationHeirs: "ប្អូន",
  };
  r.witnesses[0] = {
    name: "លី វុទ្ធី",
    dob: "20.01.1975",
    idNumber: "010123456",
    address: "សង្កាត់ឧទាហរណ៍ រាជធានីភ្នំពេញ",
  };
  r.witnesses[1] = {
    name: "ហេង ស្រីនាង",
    dob: "11.11.1979",
    idNumber: "010654321",
    address: "សង្កាត់ឧទាហរណ៍ រាជធានីភ្នំពេញ",
  };
  r.children[0] = {
    name: "សុខ វិសាល",
    gender: "ប្រុស",
    dob: "01.02.2010",
    birthCertDate: "15.02.2010",
    birthCertNo: "១២",
    commune: "ទឹកល្អក់ទី១",
    district: "ទួលគោក",
    note: "",
  };
  r.children[1] = {
    name: "សុខ សោភា",
    gender: "ស្រី",
    dob: "14.09.2012",
    birthCertDate: "20.09.2012",
    birthCertNo: "៣៥",
    commune: "ទឹកល្អក់ទី១",
    district: "ទួលគោក",
    note: "",
  };
  r.children[2] = {
    name: "សុខ ដារា",
    gender: "ប្រុស",
    dob: "30.06.2015",
    birthCertDate: "05.07.2015",
    birthCertNo: "៨៨",
    commune: "ទឹកល្អក់ទី១",
    district: "ទួលគោក",
    note: "ស្លាប់",
  };
  r.relatives[0] = {
    name: "សុខ វិសាល",
    gender: "ប្រុស",
    birthYear: "2010",
    address: "ទឹកល្អក់ទី១ ទួលគោក",
  };
  r.relatives[1] = {
    name: "សុខ សោភា",
    gender: "ស្រី",
    birthYear: "2012",
    address: "ទឹកល្អក់ទី១ ទួលគោក",
  };
  r.relatives[2] = {
    name: "សុខ ដារា",
    gender: "ប្រុស",
    birthYear: "2015",
    address: "ទឹកល្អក់ទី១ ទួលគោក",
  };
  return r;
}
