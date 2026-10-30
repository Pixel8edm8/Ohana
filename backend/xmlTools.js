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
 
/*function parseFamily(xml) {
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
 */