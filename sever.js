const express = require("express");
const path = require("path");

const app = express();
const port = Number(process.env.PORT) || 3000;

app.get("/", (request, response) => {
    response.sendFile(path.join(__dirname, "Index.html"));
});

app.get("/style.css", (request, response) => {
    response.sendFile(path.join(__dirname, "style.css"));
});

app.get("/LoginScript.js", (request, response) => {
    response.sendFile(path.join(__dirname, "LoginScript.js"));
});

app.use("/images", express.static(path.join(__dirname, "images")));

if (require.main === module) {
    app.listen(port, "127.0.0.1", () => {
        console.log(`Ohana test server is running at http://127.0.0.1:${port}`);
    });
}

module.exports = app;
