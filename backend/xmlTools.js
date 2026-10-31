import { XMLBuilder, XMLParser, XMLValidator } from "fast-xml-parser";

const xmlOptions = {
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  parseAttributeValue: false,
  parseTagValue: false,
  trimValues: false,
  isArray: (name) => name === "person",
};

const parser = new XMLParser(xmlOptions);
const builder = new XMLBuilder({ ...xmlOptions, format: true });

export function parseFamily(xml) {
  const validation = XMLValidator.validate(xml);
  if (validation !== true) throw new Error(`Invalid XML: ${validation.err.msg}`);

  const people = parser.parse(xml)?.family?.person ?? [];
  return people.map((person) => ({
    id: person["@_id"],
    ...Object.fromEntries(
      Object.entries(person).filter(
        ([key]) => key !== "@_id" && key !== "#text" && !key.startsWith("@_"),
      ),
    ),
  }));
}

export const addPerson = (people, person) => [...people, person];

export const editPerson = (people, id, changes) =>
  people.map((person) =>
    person.id === String(id) ? { ...person, ...changes } : person,
  );

export const removePerson = (people, id) =>
  people.filter((person) => person.id !== String(id));

export function toXML(people) {
  return builder.build({
    "?xml": { "@_version": "1.0", "@_encoding": "UTF-8" },
    family: {
      person: people.map(({ id, ...fields }) => ({
        "@_id": id,
        ...Object.fromEntries(
          Object.entries(fields).filter(([, value]) => value != null),
        ),
      })),
    },
  });
}

export function saveXML(people, filename = "family.xml") {
  const url = URL.createObjectURL(
    new Blob([toXML(people)], { type: "application/xml" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
