import express from "express";
import cors from "cors";
import {readXML, writeXML, addTree, removeTree, addPerson, editPerson, removePerson} from "./xmlTools.js";

const app = express();
app.use(cors());          // frontend can use this
app.use(express.json());  

app.get("/api/people", async (_req, res) => {
  res.json(await readXML());
});

app.post("/api/people", async (req, res) => {
  res.status(201).json(await addPerson(req.body));
});

app.patch("/api/people/:id", async (req, res) => {
  res.json(await editPerson(req.params.id, req.body));
});

app.delete("/api/people/:id", async (req, res) => {
  res.json(await removePerson(req.params.id));
});

app.use((err, _req, res, _next) => {
  res.status(500).json({ error: err.message });
});

app.listen(3000);

//Load People GET /api/people JSON returned by loadFamily()
//Add Person POST /api/people JSON body with person data returned by addPerson()
//Edit Person PATCH /api/people/:id JSON body with changes returned by editPerson()
//Remove Person DELETE /api/people/:id returned by removePerson()

//can connect to http://localhost:3000/api/people

//Invoke-RestMethod -Uri http://localhost:3000/api/people -Method Post -ContentType "application/json" -Body '{"firstName":"Sam","lastName":"Example","birthDate":"01/15/1990","bio":"Added from terminal"}'

//Invoke-RestMethod -Uri "http://localhost:3000/api/people/1" -Method Delete

//Invoke-RestMethod http://localhost:3000/api/people

//Invoke-RestMethod -Uri "http://localhost:3000/api/people/1" -Method Patch -ContentType "application/json" -Body '{"firstName":"Sam","lastName":"Example","bio":"Updated bio"}'