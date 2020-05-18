const express = require("express");
const path = require("path");
const app = express();
const bodyParser = require("body-parser");

const cookies = new Set();
const parseCookie = (cookies, id) => {
    if (!cookies) {
        return false;
    }

    for (const cookie of cookies.split(";")) {
        if (cookie.trim().split("=")[0] === id) return cookie.split("=")[1];
    }
    
    return false;
};

app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", function(req, res) {
    if (cookies.has(parseCookie(req.headers.cookie,"id"))) {
        res.sendFile(path.join(__dirname, "build", "index.html"));
    } else {
        res.redirect("/login");
    }
});

app.use(express.static(path.join(__dirname, "build")));

app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.post("/login", (req, res) => {
    if (req.body.password === "randomPassword") {
        var randomNumber = Math.random().toString();
        randomNumber = randomNumber.substring(2, randomNumber.length);
        cookies.add(randomNumber);
        res.cookie("id", randomNumber);
        res.redirect("/");
    } else {
        res.status(404).send("Unauthorized");
    }
});

app.listen(process.env.PORT, () => {
    console.log("Listening on ", process.env.PORT);
});
