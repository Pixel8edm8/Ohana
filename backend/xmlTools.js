import { readFile, writeFile } from "node:fs/promises";
import { XMLBuilder, XMLParser } from "fast-xml-parser";

const file = new URL("Ohana.xml", import.meta.url);
const options = {
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  parseTagValue: false,
  isArray: (_name, path) => path === "families.family" || path === "families.family.person",
};
const parser = new XMLParser(options);
const builder = new XMLBuilder({ ...options, format: true });


export async function loadFamily() {
  const { families } = parser.parse(await readFile(file, "utf8"));
  return (families?.family ?? []).flatMap((fam) =>
    (fam.person ?? []).map(({ "@_id": id, ...fields }) => ({
      id,
      familyId: fam["@_id"],
      ...fields,
    }))
  );
}

async function saveFamily(people) {
  const byFamily = new Map();
  for (const { id, familyId = "1", ...fields } of people) {
    if (!byFamily.has(familyId)) byFamily.set(familyId, []);
    byFamily.get(familyId).push({ "@_id": String(id), ...fields });
  }
  const family = [...byFamily].map(([fid, person]) => ({ "@_id": fid, person }));
  await writeFile(file, builder.build({ families: { family } }));
  return people;
}

export async function addPerson(person) {
  const people = await loadFamily();
  const nextId = Math.max(0, ...people.map((p) => Number(p.id) || 0)) + 1;
  people.push({ ...person, id: person.id ?? String(nextId) });
  return saveFamily(people);
}

export async function editPerson(id, changes) {
  const people = await loadFamily();
  const person = people.find((p) => p.id === String(id));
  if (!person) throw new Error(`No person with id ${id}`);
  Object.assign(person, changes);
  return saveFamily(people);
}

export async function removePerson(id) {
  const people = await loadFamily();
  return saveFamily(people.filter((p) => p.id !== String(id)));
}

// export async function addFamily() {
//
// }
//
// export async function removeFamily(id) {
//
// }
