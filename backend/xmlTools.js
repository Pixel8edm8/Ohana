import { readFile, writeFile } from "node:fs/promises";
import { XMLParser } from "fast-xml-parser";
import XMLBuilder from "fast-xml-builder";

const file = new URL("Ohana.xml", import.meta.url);

const sharedOptions = {
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
};

const parser = new XMLParser({
  ...sharedOptions,
  parseTagValue: false,
  isArray: (_name, path) =>
    path === "families.family" || path === "families.family.person",
});

const builder = new XMLBuilder({
  ...sharedOptions,
  format: true,
  suppressEmptyNode: true,
});

export async function loadFamily() {
  const xml = await readFile(file, "utf8");
  const parsed = parser.parse(xml);
  const families = parsed?.families?.family ?? [];

  return families.flatMap((fam) =>
    (fam.person ?? []).map(({ "@_id": id, ...fields }) => ({
      id: String(id),
      familyId: String(fam["@_id"] ?? "1"),
      ...fields,
    }))
  );
}

async function saveFamily(people) {
  const byFamily = new Map();

  for (const { id, familyId = "1", ...fields } of people) {
    const fid = String(familyId);
    if (!byFamily.has(fid)) byFamily.set(fid, []);
    byFamily.get(fid).push({
      "@_id": String(id),
      ...fields,
    });
  }

  const family = [...byFamily.entries()].map(([fid, person]) => ({
    "@_id": fid,
    person,
  }));

  const xmlOutput = builder.build({
    "?xml": { "@_version": "1.0", "@_encoding": "UTF-8" },
    families: family.length > 0 ? { family } : "",
  });

  await writeFile(file, xmlOutput, "utf8");
  return people;
}

export async function addPerson(person) {
  const people = await loadFamily();
  const nextId = Math.max(0, ...people.map((p) => Number(p.id) || 0)) + 1;
  const id = person.id != null ? String(person.id) : String(nextId);

  if (people.some((p) => p.id === id)) {
    throw new Error(`Person with id ${id} already exists`);
  }

  people.push({ ...person, id });
  return saveFamily(people);
}

export async function editPerson(id, changes) {
  const people = await loadFamily();
  const person = people.find((p) => p.id === String(id));
  if (!person) throw new Error(`No person with id ${id}`);

  const { id: _ignoredId, ...safeChanges } = changes;
  Object.assign(person, safeChanges);
  return saveFamily(people);
}

export async function removePerson(id) {
  const people = await loadFamily();
  const filtered = people.filter((p) => p.id !== String(id));
  if (filtered.length === people.length) {
    throw new Error(`No person with id ${id}`);
  }
  return saveFamily(filtered);
}