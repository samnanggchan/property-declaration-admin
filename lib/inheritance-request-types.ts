export const APPLICANT_SLOTS = 2;
export const WITNESS_SLOTS = 2;
export const CHILD_SLOTS = 10;

export interface Applicant {
  name: string;
  dob: string;
  address: string;
  fatherName: string;
  motherName: string;
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
  note: string;
}

export interface InheritanceRequest {
  title: string;
  refNo: string; // លេខយោង
  location: string; // ទីតាំង
  area: string; // ទំហំ
  date: string; // dd.mm.yyyy – date printed above the signatures
  applicants: Applicant[];
  witnesses: Witness[];
  children: Child[];
}

export const emptyApplicant = (): Applicant => ({
  name: "",
  dob: "",
  address: "",
  fatherName: "",
  motherName: "",
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
  note: "",
});

export const emptyRequest = (): InheritanceRequest => ({
  title: "ពាក្យស្នើសុំ",
  refNo: "",
  location: "",
  area: "",
  date: "",
  applicants: Array.from({ length: APPLICANT_SLOTS }, emptyApplicant),
  witnesses: Array.from({ length: WITNESS_SLOTS }, emptyWitness),
  children: Array.from({ length: CHILD_SLOTS }, emptyChild),
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

/** Safe to call with anything read from localStorage / an API. */
export function normalizeRequest(raw: unknown): InheritanceRequest {
  const base = emptyRequest();
  if (!raw || typeof raw !== "object") return base;
  const r = raw as Partial<InheritanceRequest>;
  return {
    title: typeof r.title === "string" && r.title ? r.title : base.title,
    refNo: typeof r.refNo === "string" ? r.refNo : "",
    location: typeof r.location === "string" ? r.location : "",
    area: typeof r.area === "string" ? r.area : "",
    date: typeof r.date === "string" ? r.date : "",
    applicants: fixedList(r.applicants, emptyApplicant, APPLICANT_SLOTS),
    witnesses: fixedList(r.witnesses, emptyWitness, WITNESS_SLOTS),
    children: fixedList(r.children, emptyChild, CHILD_SLOTS),
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
  r.location = "ភូមិ​ឧទាហរណ៍ សង្កាត់ឧទាហរណ៍ ខណ្ឌឧទាហរណ៍ រាជធានីភ្នំពេញ";
  r.area = "93 ម²";
  r.date = "08.10.2026";
  r.applicants[0] = {
    name: "សុខ សុភា",
    dob: "12.03.1985",
    address: "ផ្ទះលេខ ១២ ផ្លូវ ១៩៣ រាជធានីភ្នំពេញ",
    fatherName: "សុខ ចាន់",
    motherName: "ជា សុវណ្ណា",
  };
  r.applicants[1] = {
    name: "ជា សុភី",
    dob: "05.07.1988",
    address: "ផ្ទះលេខ ១២ ផ្លូវ ១៩៣ រាជធានីភ្នំពេញ",
    fatherName: "ជា ធី",
    motherName: "ឈួន សុខា",
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
  r.children[0] = { name: "សុខ វិសាល", gender: "ប្រុស", dob: "01.02.2010", note: "" };
  r.children[1] = { name: "សុខ សោភា", gender: "ស្រី", dob: "14.09.2012", note: "" };
  r.children[2] = { name: "សុខ ដារា", gender: "ប្រុស", dob: "30.06.2015", note: "ស្លាប់" };
  return r;
}