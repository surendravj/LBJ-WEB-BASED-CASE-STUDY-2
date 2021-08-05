const express = require("express");
const app = require("express")();
const port = process.env.PORT || 8000;
const ObjectsToCsv = require("objects-to-csv");
const fs = require("fs");
const parser = require("csv-parser");

app.use(express.json());
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

const filePath = "./student.csv";

app.get("/", (req, res) => {
  return res.render("homepage", { data: [] });
});

app.get("/all", (req, res) => {
  var students = [];
  fs.createReadStream(filePath)
    .pipe(parser())
    .on("data", function (data) {
      try {
        students.push(data);
      } catch (err) {
        console.log(err);
      }
    })
    .on("end", function () {
      if (Object.keys(req.query).length === 0) {
        return res.render("homepage", { data: students });
      }
      const { id } = req.query;
      let index = students.findIndex((student) => student.id === id);
      if (index === -1) {
        return res.render("homepage", { data: [] });
      }
      return res.render("homepage", { data: [students[index]] });
    });
});

app.get("/search", (req, res) => {
  return res.render("searchStudent");
});

app.get("/add", (req, res) => {
  res.render("addStudent");
});

app.post("/add", async (req, res) => {
  var data = [];
  data.push(req.body);
  const csv = new ObjectsToCsv(data);
  await csv.toDisk("./student.csv", { append: true });
  return res.redirect("/all");
});

app.post("/search", (req, res) => {
  const { id } = req.body;
  return res.redirect(`/all/?id=${id}`);
});

app.listen(port, () => console.log("Server running at port 8000"));
