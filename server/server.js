const path = require("path");
const express = require("express");

const Data = require("./data");

const app = express();
const port = 3000;

app.use(express.static(path.resolve(process.cwd(), "./client"))); // Передавать содержимое папки client при входящес запросе
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// Получить все заметки
app.get("/api/get", (req, res) => {
  const data = new Data("1");
  const json = data.getAll();

  res.send(json);
});

// Получить одну заметку
app.get("/api/get/:id", (req, res) => {
  const data = new Data("1");
  const json = data.get(req.params["id"]);

  res.send(json);
});

// Создать одну заметку
app.post("/api/create", (req, res) => {
  const data = new Data("1");
  data.create(req.body);

  res.redirect("/");
});

// Обновить одну заметку
app.post("/api/update", (req, res) => {
  const data = new Data("1");
  data.update(req.body);

  res.redirect("/");
});

// Удалить одну заметку
app.post("/api/delete/:id", (req, res) => {
  const data = new Data("1");
  data.delete(req.params["id"]);

  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
