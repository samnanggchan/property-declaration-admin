import { CoupleRecord, emptyJoint, emptyPerson } from "@/lib/types"

const records: CoupleRecord[] = []

export function listRecords() { return records }

export function createRecord(): CoupleRecord {
  const now = new Date().toISOString()
  const record: CoupleRecord = { id: crypto.randomUUID(), husband: emptyPerson(), wife: emptyPerson(), joint: emptyJoint(), certNumber: "", location: "ការិយាល័យចុះបញ្ជីអាពាហ៍ពិពាហ៍", createdAt: now, updatedAt: now }
  records.unshift(record)
  return record
}

export function findRecord(id: string) { return records.find((record) => record.id === id) }

export function updateRecord(id: string, input: Partial<CoupleRecord>) {
  const record = findRecord(id)
  if (!record) return undefined
  Object.assign(record, input, { husband: input.husband ? { ...record.husband, ...input.husband } : record.husband, wife: input.wife ? { ...record.wife, ...input.wife } : record.wife, joint: input.joint ? { ...record.joint, ...input.joint } : record.joint, updatedAt: new Date().toISOString() })
  return record
}

export function deleteRecord(id: string) {
  const index = records.findIndex((record) => record.id === id)
  if (index === -1) return false
  records.splice(index, 1)
  return true
}