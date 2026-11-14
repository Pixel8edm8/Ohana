import {readFile, writeFile} from "node:fs/promises";
import {XMLParser} from "fast-xml-parser";
import XMLBuilder from "fast-xml-builder";

const file = new URL("Ohana.xml", import.meta.url);

const options = {
  ignoreAttributes : false,
  attributeNamePrefix : "@_",
  parseTagValue : false,
  format : true,
  suppressBooleanAttributes : false,
  isArray: (_name, path) => path === "families.tree" || path === "families.tree.person"
};

const rootAttributes = {
  "@_xmlns:xsi":"http://www.w3.org/2001/XMLSchema-instance",
  "@_xsi:noNamespaceSchemaLocation":"OhanaXSD.xsd"
};

const parser = new XMLParser(options);
const builder = new XMLBuilder(options);

export async function readXML() {
  const read_xml = await readFile(file, "utf8");
  const parse_xml = parser.parse(read_xml);
  return parse_xml.families ?? [];
}

async function writeXML(people) {
  const buildXML = builder.build({families : {...rootAttributes, tree : people}});
  await writeFile(file, buildXML);
}

export async function addTree() {
  const arrayOfTrees = await readXML();

  let highestID = 0;
  for (const tree of arrayOfTrees) {
    highestID++;
  }
  const newTreeID = String(highestID + 1);

  arrayOfTrees.push({"@_id" : newTreeID});
  await writeXML(arrayOfTrees);
}

export async function removeTree(treeID) {
  //REMEMBER TO HANDLE TREE ID RE-NUMBERING AFTER A PERSON GETS REMOVED
}

export async function addPerson(personData, treeID) {
  const arrayOfTrees = await readXML();

  for (const tree of arrayOfTrees) {
    if (tree["@_id"] === String(treeID)) {
      let highestID = 0;
      if (tree.person === undefined) {
        highestID = "1";
        tree.person = [];
        tree.person.push({...personData, "@_id" : highestID});
        await writeXML(arrayOfTrees);
      }
      else {
        for (const person of tree.person) {
          highestID++;
        }
        const newPersonID = String(highestID + 1);
        tree.person.push({...personData, "@_id" : newPersonID});
        await writeXML(arrayOfTrees);
      }
    }
  }
}


export async function editPerson(personID, treeID, changes) {

}


export async function removePerson(personID, treeID) {
  //REMEMBER TO HANDLE PERSON ID RE-NUMBERING AFTER A PERSON GETS REMOVED
}