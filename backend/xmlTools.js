function parseFamily(xml) {
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  return [...doc.getElementsByTagName("person")].map((el) => {
    const person = { id: el.getAttribute("id") };
    for (const child of el.children) person[child.tagName] = child.textContent;
    return person;
  });
}

const addPerson = (people, person) => [...people, person];
 
const editPerson = (people, id, changes) =>
  people.map((p) => (p.id === String(id) ? { ...p, ...changes } : p));
 
const removePerson = (people, id) => people.filter((p) => p.id !== String(id));
 
function toXML(people) {
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const body = people
    .map(({ id, ...fields }) =>
      `  <person id="${esc(id)}">\n` +
      Object.entries(fields)
        .filter(([, v]) => v != null)
        .map(([k, v]) => `    <${k}>${esc(v)}</${k}>\n`)
        .join("") +
      `  </person>\n`)
    .join("");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<family>\n${body}</family>\n`;
}
 

function saveXML(people, filename = "family.xml") {
  const url = URL.createObjectURL(new Blob([toXML(people)], { type: "application/xml" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
 
/*const { XMLParser, XMLBuilder, XMLValidator } = require('fast-xml-parser');
const db = require('./db');

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  parseTagValue: false,                  // keep ids/dates as text
  trimValues: true,
  isArray: (name) => name === 'person'   // always a list, even for one person
});

const insertPerson = db.prepare(`
  INSERT INTO people (user_id, first_name, last_name, birth_date, photo)
  VALUES (?, ?, ?, ?, ?)
`);
const linkPerson = db.prepare(`
  UPDATE people SET father_id = ?, mother_id = ?, spouse_id = ?
  WHERE id = ? AND user_id = ?
`);

function importXml(xmlText, userId) {
  const check = XMLValidator.validate(xmlText);
  if (check !== true) throw new Error('Invalid XML: ' + check.err.msg);

  const list = parser.parse(xmlText)?.family?.person;
  if (!list || list.length === 0) {
    throw new Error('No <person> entries found inside <family>');
  }

  const run = db.transaction(() => {
    // Pass 1: insert everyone, remember XML id -> database id
    const idMap = new Map();
    for (const p of list) {
      const xmlId = p['@_id'];
      if (!xmlId) throw new Error('Every <person> needs an id attribute');
      if (idMap.has(xmlId)) throw new Error(`Duplicate person id "${xmlId}"`);
      if (!p.firstName) throw new Error(`Person "${xmlId}" is missing <firstName>`);

      const result = insertPerson.run(
        userId, p.firstName, p.lastName || null, p.birthDate || null, p.photo || null
      );
      idMap.set(xmlId, result.lastInsertRowid);
    }

    // Pass 2: fill in father / mother / spouse using the new ids
    const lookup = (ref, owner) => {
      if (!ref) return null;
      if (!idMap.has(ref)) throw new Error(`Person "${owner}" points to unknown id "${ref}"`);
      return idMap.get(ref);
    };
    for (const p of list) {
      const xmlId = p['@_id'];
      linkPerson.run(
        lookup(p.father, xmlId),
        lookup(p.mother, xmlId),
        lookup(p.spouse, xmlId),
        idMap.get(xmlId),
        userId
      );
    }
    return list.length;
  });

  return run(); // all-or-nothing
}

function exportXml(userId) {
  const people = db.prepare('SELECT * FROM people WHERE user_id = ?').all(userId);
  const builder = new XMLBuilder({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    format: true
  });
  return builder.build({
    '?xml': { '@_version': '1.0', '@_encoding': 'UTF-8' },
    family: {
      person: people.map(p => ({
        '@_id': p.id,
        firstName: p.first_name,
        lastName: p.last_name ?? '',
        birthDate: p.birth_date ?? '',
        photo: p.photo ?? '',
        father: p.father_id ?? '',
        mother: p.mother_id ?? '',
        spouse: p.spouse_id ?? ''
      }))
    }
  });
}

module.exports = { importXml, exportXml };

*/