const path = require("path");
const express = require("express");
const { v4: uuidv4 } = require("uuid"); // Используем, чтобы не ломать голову с цифрами
const jwt = require("jsonwebtoken");

const Data = require("./data");

const accessTokenSecret = "youraccesstokensecret";
const users = [
  {
    id: null,
    name: "bot",
    password: "botpassword",
    role: "bot",
  },
  {
    id: "1",
    name: "admin",
    password: "",
    role: "web",
  },
];

const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const telegramUserId = req.get("telegram-user-id");

  if (authHeader) {
    const token = authHeader.split(" ")[1];

    jwt.verify(token, accessTokenSecret, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }

      const userFound = users.find((u) => {
        return u.name === (user.user || user.name);
      });
      if (!userFound) return res.sendStatus(403);

      req.user = user;
      if (telegramUserId) req.user.telegramUserId = telegramUserId;

      next();
    });
  } else {
    res.sendStatus(401);
  }
};

const app = express();
const port = 3000;

app.use(express.static(path.resolve(process.cwd(), "./client"))); // Передавать содержимое папки client при входящес запросе
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.post("/api/login", (req, res) => {
  const { name, password } = req.body;

  const user = users.find((u) => {
    return u.name === name && u.password === password;
  });

  if (user) {
    const accessToken = jwt.sign(
      { name: user.name, role: user.role },
      accessTokenSecret
    );

    res.json({
      success: true,
      accessToken,
    });
  } else {
    res.json({
      success: false,
      message: "Неправильный логин или пароль",
    });
  }
});

app.post("/api/register", (req, res) => {
  const { name, password } = req.body;

  if (users.indexOf((u) => u.name === name) >= 0) {
    res.json({
      success: false,
      message: "Пользователь с таким именем уже существует",
    });
    return;
  }

  const user = {
    id: uuidv4(),
    name,
    password,
    role: "web",
  };

  users.push(user);

  const accessToken = jwt.sign(
    { name: user.name, role: user.role, id: user.id },
    accessTokenSecret
  );

  res.json({
    success: true,
    accessToken,
  });
});

// Привязать телеграм к пользователю
app.post("/api/link", authenticateJWT, (req, res) => {
  if (req.user.role !== "bot") {
    res.sendStatus(401);
    return;
  }

  const { name, password } = req.body;
  const user = users.find((u) => {
    return u.name === name && u.password === password;
  });

  if (!user) {
    res.json({
      success: false,
      message: "Указанный логин или пароль не подходит",
    });
    return;
  }

  user.telegramId = req.user.telegramUserId;

  res.json({
    success: true,
    message: "Телеграм привязан успешно",
    userId: user.id,
  });
});

// Получить все заметки
app.get("/api/get", authenticateJWT, (req, res) => {
  const userId =
    req.user.role === "bot" ? req.user.telegramUserId : req.user.id;

  const data = new Data(userId);
  const json = data.getAll();

  res.send(json);
});

// Получить одну заметку
app.get("/api/get/:id", authenticateJWT, (req, res) => {
  const userId =
    req.user.role === "bot" ? req.user.telegramUserId : req.user.id;

  const data = new Data(userId);
  const json = data.get(req.params["id"]);

  res.send(json);
});

// Создать одну заметку
app.post("/api/create", authenticateJWT, (req, res) => {
  const userId =
    req.user.role === "bot" ? req.user.telegramUserId : req.user.id;

  const data = new Data(userId);
  data.create(req.body);

  res.redirect("/");
});

// Обновить одну заметку
app.post("/api/update", authenticateJWT, (req, res) => {
  const userId =
    req.user.role === "bot" ? req.user.telegramUserId : req.user.id;

  const data = new Data(userId);
  data.update(req.body);

  res.redirect("/");
});

// Удалить одну заметку
app.post("/api/delete/:id", authenticateJWT, (req, res) => {
  const userId =
    req.user.role === "bot" ? req.user.telegramUserId : req.user.id;

  const data = new Data(userId);
  data.delete(req.params["id"]);

  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
