import {readXML, addPerson, addTree} from "./xmlTools.js";

// await addPerson(
//     {
//         firstName: "Billy",
//         middleName: "Bob",
//         lastName: "Joe",
//         suffix: "",
//         birthDate: "05/12/1985",
//         deathDate: "",
//         spouseID: { "@_xsi:nil": "true" },
//         parent1ID: { "@_xsi:nil": "true" },
//         parent2ID: { "@_xsi:nil": "true" },
//         bio: "added first person to the tree"
//     },
//     3
// );

// await addTree();

console.log(JSON.stringify(await readXML(), null, 2));