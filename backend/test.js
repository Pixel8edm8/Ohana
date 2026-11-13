import {readXML, addPerson, addTree} from "./xmlTools.js";

// await addPerson(
//     {
//         firstName: "Test",
//         middleName: "Person",
//         lastName: "Example",
//         suffix: "",
//         birthDate: "05/12/1985",
//         deathDate: "",
//         spouseID: { "@_xsi:nil": "true" },
//         parent1ID: { "@_xsi:nil": "true" },
//         parent2ID: { "@_xsi:nil": "true" },
//         bio: "Added from a test script"
//     },
//     1
// );

await addTree();

console.log(JSON.stringify(await readXML(), null, 2));