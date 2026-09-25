export type PersonFields = {
  idNumber: string;
  name: string;
  dob: string;
  birthPlace: string;
  nationality: string;
  status: string;
  fatherName: string;
  motherName: string;
  address: string;
};

export type CadastralBoundaries = {
  north?: string;
  east?: string;
  south?: string;
  west?: string;
};

export type CadastralDetails = {
  sheetNumber?: string;
  parcelNumber?: string;
  khan?: string;
  sangkat?: string;
  village?: string;
  city?: string;
  landUseNature?: string;
  landType?: string;
  transferType?: string;
  transferDeedNo?: string;
  transferDeedDate?: string;
  transferDetails?: string;
  encumbrance?: string;
  otherRemarks?: string;
  variant?: "LMAP" | "HOUSE";
  houseNo?: string;
  streetNo?: string;
  roadNo?: string;
  idCode?: string;
  houseType?: string;
  houseGrade?: string;
  usableArea?: string;
  builtArea?: string;
  boundaries?: CadastralBoundaries;
};

export type JointFields = {
  propertyType: string;
  area: string;
  landUse: string;
  usageNature: string;
  possessionSource: string;
  date: string;
  charter: string;
  entity: string;
  officeAddress: string;
  repName: string;
  repRole: string;
  cadastral?: CadastralDetails;
};

export type PartyFields = {
  husband: PersonFields;
  wife: PersonFields;
};

export type LandDeclaration = {
  id: string;
  certNumber: string;
  location: string;
  seller: PartyFields;
  buyer: PartyFields;
  husband: PersonFields;
  wife: PersonFields;
  joint: JointFields;
  cadastral?: CadastralDetails;
  createdAt: string;
  updatedAt: string;
};

export type CoupleRecord = LandDeclaration;
export type DeclarationRecord = LandDeclaration;

export const personFields: Array<{
  key: keyof PersonFields;
  khmer: string;
  english: string;
}> = [
  { key: "idNumber", khmer: "អត្តសញ្ញាណប័ណ្ណលេខ", english: "ID CARD NO." },
  { key: "name", khmer: "ឈ្មោះ", english: "FULL NAME" },
  { key: "dob", khmer: "ថ្ងៃ ខែ ឆ្នាំ កំណើត", english: "DATE OF BIRTH" },
  { key: "birthPlace", khmer: "ទីកន្លែងកំណើត", english: "PLACE OF BIRTH" },
  { key: "nationality", khmer: "សញ្ជាតិ", english: "NATIONALITY" },
  { key: "status", khmer: "ស្ថានភាព", english: "MARITAL STATUS" },
  { key: "fatherName", khmer: "ឈ្មោះឪពុក", english: "FATHER'S NAME" },
  { key: "motherName", khmer: "ឈ្មោះម្តាយ", english: "MOTHER'S NAME" },
  { key: "address", khmer: "អាសយដ្ឋានបច្ចុប្បន្ន", english: "CURRENT ADDRESS" },
];

export const jointFields: Array<{
  key: keyof JointFields;
  khmer: string;
  english: string;
  group: "property" | "legal" | "representative";
}> = [
  {
    key: "propertyType",
    khmer: "ប្រភេទទ្រព្យ",
    english: "PROPERTY TYPE",
    group: "property",
  },
  { key: "area", khmer: "ក្រឡាផ្ទៃ", english: "AREA", group: "property" },
  {
    key: "landUse",
    khmer: "រូបភាពប្រើប្រាស់ដី",
    english: "LAND USE",
    group: "property",
  },
  {
    key: "usageNature",
    khmer: "លក្ខណៈនៃការប្រើប្រាស់",
    english: "NATURE OF USE",
    group: "property",
  },
  {
    key: "possessionSource",
    khmer: "ប្រភពនៃការកាន់កាប់",
    english: "SOURCE OF POSSESSION",
    group: "property",
  },
  { key: "date", khmer: "កាលបរិច្ឆេទ", english: "DATE", group: "property" },
  { key: "charter", khmer: "លក្ខន្តិកៈ", english: "CHARTER", group: "legal" },
  { key: "entity", khmer: "អង្គភាព", english: "ENTITY NAME", group: "legal" },
  {
    key: "officeAddress",
    khmer: "អាសយដ្ឋាន (ទីស្នាក់ការ)",
    english: "HEAD OFFICE ADDRESS",
    group: "legal",
  },
  {
    key: "repName",
    khmer: "ឈ្មោះអ្នកតំណាង",
    english: "REPRESENTATIVE NAME",
    group: "representative",
  },
  {
    key: "repRole",
    khmer: "មុខងារ",
    english: "POSITION",
    group: "representative",
  },
];

export const emptyPerson = (): PersonFields => ({
  idNumber: "",
  name: "",
  dob: "",
  birthPlace: "",
  nationality: "ខ្មែរ",
  status: "",
  fatherName: "",
  motherName: "",
  address: "",
});

export const emptyParty = (): PartyFields => ({
  husband: emptyPerson(),
  wife: emptyPerson(),
});

export const emptyJoint = (): JointFields => ({
  propertyType: "ទ្រព្យសម្បត្តិរួម (ទ្រព្យសម្បត្តិប្រពន្ធ)",
  area: "",
  landUse: "សាងសង់",
  usageNature: "ឯកជន",
  possessionSource: "ទិញ",
  date: new Date().getFullYear().toString(),
  charter: "",
  entity: "",
  officeAddress: "",
  repName: "",
  repRole: "",
});
