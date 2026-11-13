export interface PersonAddress {
  name: string;
  age: string;
  nationality: string;
  village: string;
  commune: string;
  district: string;
  province: string;
}

export interface CivilStatusPerson {
  birthYear: string;
  birthCommune: string;
  fatherName: string;
  motherName: string;
}

export interface MarriageCertificate {
  certNo: string;
  certDate: string;
  certCommune: string;
  certDistrict: string;
}

export interface FinalSaleDeedParcelRow {
  indexOrSheet: string;
  area: string;
  landType: string;
  boundaryNorth: string;
  boundarySouth: string;
  boundaryEast: string;
  boundaryWest: string;
  encumbrance: string;
}

export interface WitnessItem {
  name: string;
  age: string;
  commune: string;
  district: string;
  province: string;
}

export interface FinalSaleDeed {
  id: string;
  createdAt: string;
  updatedAt: string;

  // Page 1 Header
  drafterRefNo: string;
  paperNo: string; // default "6"

  // Page 1 Seller (អ្នកលក់)
  seller: PersonAddress;
  sellerExtraLine?: string;
  sellerCapacityNote?: string;

  // Page 1 Buyer (អ្នកទិញ)
  buyer: PersonAddress;
  buyerCapacityNote?: string;

  // Page 1 Civil Status (អត្រានុកូលដ្ឋាន)
  husband: CivilStatusPerson;
  wife: CivilStatusPerson;
  marriageCert: MarriageCertificate;

  // Page 1 Price (តម្លៃជាប្រាក់)
  priceKhmer: string;
  priceNumber: string;

  // Page 1 Taxes & Fees (ពន្ធ និងកម្រៃសេវា)
  stampFee: string;
  registrationFee: string;
  taxReceiptNo: string;
  taxReceiptDate: string;
  cadastralFee: string;
  cadastralFeeD1: string;
  cadastralFeeD2: string;
  surveyFee: string;
  surveyFeeD1: string;
  surveyFeeD2: string;
  totalFee: string;

  // Page 1 Original Receipt (បានទទួលសំបុត្រដើម)
  receivedDate: string;
  receiverName: string;

  // Page 2 Location Header
  propertyCommune: string;
  propertyDistrict: string;

  // Page 2 Land & Boundary Table (up to 6 rows)
  parcelRows: FinalSaleDeedParcelRow[];

  // Page 2 Certification Statement
  contractDateDay: string;
  contractDateMonth: string;
  contractDateYear: string;
  officialTitleAndName: string;
  sellerVerifiedNames: string;
  buyerVerifiedNames: string;

  // Page 2 Witnesses (សាក្សី)
  witness1: WitnessItem;
  witness1IdCard?: string;
  witness2: WitnessItem;
  witness2IdCard?: string;
  certRegistrationNo: string;
}

export const emptyFinalSaleDeed = (): FinalSaleDeed => ({
  id: crypto.randomUUID(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),

  drafterRefNo: "",
  paperNo: "6",

  seller: {
    name: "",
    age: "",
    nationality: "ខ្មែរ",
    village: "",
    commune: "",
    district: "",
    province: "",
  },
  sellerExtraLine: "",
  sellerCapacityNote: "",

  buyer: {
    name: "",
    age: "",
    nationality: "ខ្មែរ",
    village: "",
    commune: "",
    district: "",
    province: "",
  },
  buyerCapacityNote: "",

  husband: {
    birthYear: "",
    birthCommune: "",
    fatherName: "",
    motherName: "",
  },

  wife: {
    birthYear: "",
    birthCommune: "",
    fatherName: "",
    motherName: "",
  },

  marriageCert: {
    certNo: "",
    certDate: "",
    certCommune: "",
    certDistrict: "",
  },

  priceKhmer: "",
  priceNumber: "",

  stampFee: "",
  registrationFee: "",
  taxReceiptNo: "",
  taxReceiptDate: "",
  cadastralFee: "",
  cadastralFeeD1: "",
  cadastralFeeD2: "",
  surveyFee: "",
  surveyFeeD1: "",
  surveyFeeD2: "",
  totalFee: "",

  receivedDate: "",
  receiverName: "",

  propertyCommune: "",
  propertyDistrict: "",

  parcelRows: [
    {
      indexOrSheet: "",
      area: "",
      landType: "លំនៅដ្ឋាន",
      boundaryNorth: "",
      boundarySouth: "",
      boundaryEast: "",
      boundaryWest: "",
      encumbrance: "គ្មាន",
    },
  ],

  contractDateDay: "",
  contractDateMonth: "",
  contractDateYear: "",
  officialTitleAndName: "",
  sellerVerifiedNames: "",
  buyerVerifiedNames: "",

  witness1: {
    name: "",
    age: "",
    commune: "",
    district: "",
    province: "",
  },
  witness1IdCard: "",
  witness2: {
    name: "",
    age: "",
    commune: "",
    district: "",
    province: "",
  },
  witness2IdCard: "",
  certRegistrationNo: "",
});

export const sampleFinalSaleDeed = (): FinalSaleDeed => ({
  id: crypto.randomUUID(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),

  drafterRefNo: "",
  paperNo: "6",

  // Authentic legal deed sample data matching real-world deed
  seller: {
    name: "(១) ស៊ិន វិសិដ្ឋ",
    age: "២១",
    nationality: "ខ្មែរ",
    village: "១",
    commune: "សង្កាត់ទឹកល្អក់ទី២",
    district: "ខណ្ឌទួលគោក",
    province: "ភ្នំពេញ",
  },
  sellerExtraLine:
    "(២) ឈ្មោះ នាង ស៊ិន ស៊ីថាវាត អាយុ ២៦ ឆ្នាំ ជាតិ ខ្មែរ ទីលំនៅភូមិ១៣ សង្កាត់ទឹកល្អក់ទី២ ខណ្ឌទួលគោក រាជធានីភ្នំពេញ",
  sellerCapacityNote:
    "(១) អត្ត: ០១០៥៤៧៥៩ (០១) / ០៦.១០.២០២០    បំពេញកិច្ចនូវទ្រព្យរួមជាម្ចាស់សិទ្ធិអវិភាគ    (២) អត្ត: ០១០៣៣៣៣៦ (០២) / ០២.០៩.២០២២",

  buyer: {
    name: "ជង់ វិទូរ",
    age: "៣៨",
    nationality: "ខ្មែរ",
    village: "ផ្លូវកោង២",
    commune: "សង្កាត់ចោមចៅទី២",
    district: "ខណ្ឌពោធិ៍សែនជ័យ",
    province: "ភ្នំពេញ",
  },
  buyerCapacityNote:
    "អត្ត: ១៩០៥០០៧១៤ / ០២.០៥.២០១៩    បំពេញកិច្ចនូវទ្រព្យផ្ទាល់ខ្លួន    (ពោះម៉ាយលែងលះពីនាង លឹម ស៊ីវ៉ី)",

  husband: {
    birthYear: "១៩៨៤",
    birthCommune: "ឬស្សីកែវ",
    fatherName: "ជង់ ប៊ុនធួន",
    motherName: "លឹម សិរិវិច្ឆិកា",
  },

  wife: {
    birthYear: "",
    birthCommune: "",
    fatherName: "",
    motherName: "",
  },

  marriageCert: {
    certNo: "",
    certDate: "",
    certCommune: "",
    certDistrict: "",
  },

  priceKhmer: "ហាសិបប្រាំបួនលានរៀលគត់ (៥៩,០០០,០០០ ៛.00)",
  priceNumber: "",

  stampFee: "",
  registrationFee: "",
  taxReceiptNo: "",
  taxReceiptDate: "",
  cadastralFee: "",
  cadastralFeeD1: "",
  cadastralFeeD2: "",
  surveyFee: "",
  surveyFeeD1: "",
  surveyFeeD2: "",
  totalFee: "",

  receivedDate: "",
  receiverName: "",

  propertyCommune: "សង្កាត់គោកឃ្លាង",
  propertyDistrict: "សែនសុខ",

  parcelRows: [
    {
      indexOrSheet: "ប័ណ្ណលេខ ១២០៨០១០៣-១៦៩៤",
      area: "៥៩ ម²",
      landType: "លំនៅឋាន",
      boundaryNorth: "ផ្លូវ",
      boundarySouth: "",
      boundaryEast: "ក្បាលដី ១៦៩៥",
      boundaryWest: "ក្បាលដី ១៦៩៣",
      encumbrance: "",
    },
  ],

  contractDateDay: "",
  contractDateMonth: "",
  contractDateYear: "",
  officialTitleAndName: "ប្រធានការិយាល័យ ដែនសក ខណ្ឌសែនសុខ",
  sellerVerifiedNames: "ស៊ិន វិសិដ្ឋ និងនាង ស៊ិន ស៊ីថាវាត (ម្ចាស់សិទ្ធិអវិភាគ)",
  buyerVerifiedNames: "ជង់ វិទូរ (ពោះម៉ាយលែងលះពីនាង លឹម ស៊ីវ៉ី)",

  witness1: {
    name: "នាង ឃុន សុជាតា",
    age: "៣៧",
    commune: "ទឹកល្អក់ទី២",
    district: "ទួលគោក",
    province: "ភ្នំពេញ",
  },
  witness1IdCard: "អត្ត: ០១០៦៥៤៧០៦ (០១) / ០១.១២.២០២៥",

  witness2: {
    name: "សុខ សឿន",
    age: "៤៣",
    commune: "គោកឃ្លាង",
    district: "សែនសុខ",
    province: "ភ្នំពេញ",
  },
  witness2IdCard: "អត្ត: ០១១១៥២៩០២ (០១) / ២០.០២.២០២៦",

  certRegistrationNo: "",
});

const DRAFT_KEY = "final_sale_deed_draft_v1";
const RECORDS_KEY = "final_sale_deed_records_v1";

export const finalSaleDeedStorage = {
  getDraft: (): FinalSaleDeed => {
    if (typeof window === "undefined") return emptyFinalSaleDeed();
    try {
      const data = localStorage.getItem(DRAFT_KEY);
      if (data) return JSON.parse(data);
    } catch {}
    return emptyFinalSaleDeed();
  },

  saveDraft: (deed: FinalSaleDeed) => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(deed));
    } catch {}
  },

  clearDraft: () => {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {}
  },

  listRecords: (): FinalSaleDeed[] => {
    if (typeof window === "undefined") return [];
    try {
      const data = localStorage.getItem(RECORDS_KEY);
      if (data) return JSON.parse(data);
    } catch {}
    return [];
  },

  saveRecord: (deed: FinalSaleDeed): FinalSaleDeed[] => {
    if (typeof window === "undefined") return [];
    try {
      const records = finalSaleDeedStorage.listRecords();
      const updatedDeed = { ...deed, updatedAt: new Date().toISOString() };
      const idx = records.findIndex((r) => r.id === deed.id);
      let nextRecords: FinalSaleDeed[];
      if (idx !== -1) {
        nextRecords = [...records];
        nextRecords[idx] = updatedDeed;
      } else {
        nextRecords = [updatedDeed, ...records];
      }
      localStorage.setItem(RECORDS_KEY, JSON.stringify(nextRecords));
      return nextRecords;
    } catch {}
    return [];
  },

  deleteRecord: (id: string): FinalSaleDeed[] => {
    if (typeof window === "undefined") return [];
    try {
      const records = finalSaleDeedStorage.listRecords();
      const nextRecords = records.filter((r) => r.id !== id);
      localStorage.setItem(RECORDS_KEY, JSON.stringify(nextRecords));
      return nextRecords;
    } catch {}
    return [];
  },

  duplicateRecord: (id: string): FinalSaleDeed | null => {
    if (typeof window === "undefined") return null;
    try {
      const records = finalSaleDeedStorage.listRecords();
      const target = records.find((r) => r.id === id);
      if (!target) return null;
      const copy: FinalSaleDeed = {
        ...target,
        id: crypto.randomUUID(),
        drafterRefNo: target.drafterRefNo
          ? `${target.drafterRefNo} (ចម្លង)`
          : "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const nextRecords = [copy, ...records];
      localStorage.setItem(RECORDS_KEY, JSON.stringify(nextRecords));
      return copy;
    } catch {}
    return null;
  },
};
