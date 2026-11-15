import {readXML, addPerson, addTree, removeTree, removePerson, editPerson} from "./xmlTools.js";

// await addPerson(
//     {
//         firstName: "ben",
//         middleName: "jack",
//         lastName: "tom",
//         suffix: "",
//         birthDate: "04/22/1975",
//         deathDate: "",
//         spouseID: { "@_xsi:nil": "true" },
//         parent1ID: { "@_xsi:nil": "true" },
//         parent2ID: { "@_xsi:nil": "true" },
//         bio: "added second person to the tree"
//     },
//     1
// );

//await addTree();

//await removeTree(1)

//await removePerson(1, 1);

// await editPerson(
//     1,
//     1,
//     {
//             birthDate: "09/06/1996",
//             bio: "hehe look at my birthd... oh wait"
//     }
// );

//console.log(JSON.stringify(await readXML(), null, 2));