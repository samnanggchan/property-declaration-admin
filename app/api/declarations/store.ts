import { LandDeclaration, emptyParty, emptyJoint } from "@/lib/types";

const sampleDeclaration: LandDeclaration = {
  id: "decl-001",
  certNumber: "១២០៩០៦០៥- ៤៥៧៥",
  location: "រាជធានីភ្នំពេញ ខណ្ឌពោធិ៍សែនជ័យ សង្កាត់ចោមចៅទី១ ភូមិត្រពាំងថ្លឹង១",
  seller: {
    husband: {
      idNumber: "010352372(02)/20.05.2025",
      name: "ឈូ ស៊ីសេង",
      dob: "22.02.1973",
      birthPlace: "ឃុំឫស្សីស្រុក ស្រុកស្រីសន្ធរ ខេត្តកំពង់ចាម",
      nationality: "ខ្មែរ",
      status: "មានប្រពន្ធ",
      fatherName: "ឈូ ម៉េងហោ",
      motherName: "ហម ហៃឡេង",
      address:
        "ផ្ទះលេខ១២E ផ្លូវ១៩៣ ភូមិ៤ សង្កាត់ទួលស្វាយព្រៃទី១ ខណ្ឌបឹងកេងកង រាជធានីភ្នំពេញ",
    },
    wife: {
      idNumber: "011017556(01)/20.05.2025",
      name: "លាង ធាវី",
      dob: "06.01.1980",
      birthPlace: "សង្កាត់ផ្សារចាស់ ក្រុងភ្នំពេញ",
      nationality: "ខ្មែរ",
      status: "មានប្ដី",
      fatherName: "លាង ឆេង",
      motherName: "សៀម ហ៊ាង",
      address:
        "ផ្ទះលេខ១២E ផ្លូវ១៩៣ ភូមិ៤ សង្កាត់ទួលស្វាយព្រៃទី១ ខណ្ឌបឹងកេងកង រាជធានីភ្នំពេញ",
    },
  },
  buyer: {
    husband: {
      idNumber: "010992381(01)/15.03.2024",
      name: "សុខ សំណាង",
      dob: "15.08.1982",
      birthPlace: "រាជធានីភ្នំពេញ",
      nationality: "ខ្មែរ",
      status: "មានប្រពន្ធ",
      fatherName: "សុខ គង់",
      motherName: "គឹម សុផល",
      address: "ផ្ទះលេខ៤៥ ផ្លូវ២៧១ សង្កាត់បឹងទំពុន ខណ្ឌមានជ័យ រាជធានីភ្នំពេញ",
    },
    wife: {
      idNumber: "010884912(01)/15.03.2024",
      name: "ម៉ម ចិន្តា",
      dob: "10.11.1986",
      birthPlace: "ខេត្តកណ្តាល",
      nationality: "ខ្មែរ",
      status: "មានប្ដី",
      fatherName: "ម៉ម ថុល",
      motherName: "អ៊ុំ សារ៉េត",
      address: "ផ្ទះលេខ៤៥ ផ្លូវ២៧១ សង្កាត់បឹងទំពុន ខណ្ឌមានជ័យ រាជធានីភ្នំពេញ",
    },
  },
  husband: {
    idNumber: "010352372(02)/20.05.2025",
    name: "ឈូ ស៊ីសេង",
    dob: "22.02.1973",
    birthPlace: "ឃុំឫស្សីស្រុក ស្រុកស្រីសន្ធរ ខេត្តកំពង់ចាម",
    nationality: "ខ្មែរ",
    status: "មានប្រពន្ធ",
    fatherName: "ឈូ ម៉េងហោ",
    motherName: "ហម ហៃឡេង",
    address:
      "ផ្ទះលេខ១២E ផ្លូវ១៩៣ ភូមិ៤ សង្កាត់ទួលស្វាយព្រៃទី១ ខណ្ឌបឹងកេងកង រាជធានីភ្នំពេញ",
  },
  wife: {
    idNumber: "011017556(01)/20.05.2025",
    name: "លាង ធាវី",
    dob: "06.01.1980",
    birthPlace: "សង្កាត់ផ្សារចាស់ ក្រុងភ្នំពេញ",
    nationality: "ខ្មែរ",
    status: "មានប្ដី",
    fatherName: "លាង ឆេង",
    motherName: "សៀម ហ៊ាង",
    address:
      "ផ្ទះលេខ១២E ផ្លូវ១៩៣ ភូមិ៤ សង្កាត់ទួលស្វាយព្រៃទី១ ខណ្ឌបឹងកេងកង រាជធានីភ្នំពេញ",
  },
  joint: {
    propertyType: "ទ្រព្យសម្បត្តិរួម (ទ្រព្យសម្បត្តិប្រពន្ធ)",
    area: "១៥៧ m²",
    landUse: "សាងសង់",
    usageNature: "ឯកជន",
    possessionSource: "ទិញ",
    date: "2005",
    charter: "",
    entity: "",
    officeAddress: "",
    repName: "",
    repRole: "",
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const declarations: LandDeclaration[] = [sampleDeclaration];

export function listDeclarations() {
  return declarations;
}

export function createDeclaration(
  initial?: Partial<LandDeclaration>,
): LandDeclaration {
  const now = new Date().toISOString();
  const seller = initial?.seller || emptyParty();
  const buyer = initial?.buyer || emptyParty();
  const declaration: LandDeclaration = {
    id: crypto.randomUUID(),
    certNumber: initial?.certNumber || "១២០៩០៦០៥- ០០០១",
    location: initial?.location || "រាជធានីភ្នំពេញ",
    seller,
    buyer,
    husband: seller.husband.name
      ? seller.husband
      : buyer.husband.name
        ? buyer.husband
        : seller.husband,
    wife: seller.wife.name
      ? seller.wife
      : buyer.wife.name
        ? buyer.wife
        : seller.wife,
    joint: initial?.joint || emptyJoint(),
    createdAt: now,
    updatedAt: now,
  };
  declarations.unshift(declaration);
  return declaration;
}

export function findDeclaration(id: string) {
  return declarations.find((d) => d.id === id);
}

export function updateDeclaration(id: string, input: Partial<LandDeclaration>) {
  const declaration = findDeclaration(id);
  if (!declaration) return undefined;
  if (input.certNumber) declaration.certNumber = input.certNumber;
  if (input.location) declaration.location = input.location;
  if (input.seller)
    declaration.seller = { ...declaration.seller, ...input.seller };
  if (input.buyer) declaration.buyer = { ...declaration.buyer, ...input.buyer };
  if (input.husband)
    declaration.husband = { ...declaration.husband, ...input.husband };
  if (input.wife) declaration.wife = { ...declaration.wife, ...input.wife };
  if (input.joint) declaration.joint = { ...declaration.joint, ...input.joint };
  if (input.cadastral)
    declaration.cadastral = {
      ...(declaration.cadastral || {}),
      ...input.cadastral,
    };
  declaration.updatedAt = new Date().toISOString();
  return declaration;
}

export function deleteDeclaration(id: string) {
  const index = declarations.findIndex((d) => d.id === id);
  if (index === -1) return false;
  declarations.splice(index, 1);
  return true;
}
