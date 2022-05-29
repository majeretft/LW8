const fs = require("fs-extra"); // Используем, чтобы писать меньше текста для работы с текстовыми файлами
const path = require("path");
const { v4: uuidv4 } = require('uuid'); // Используем, чтобы не ломать голову с цифрами

const cwd = process.cwd();
const dataDir = path.resolve(cwd, "./data");

class Data {
  // Передаем сюда ИД пользователя
  constructor(userId) {
    this.userId = userId;
  }

  // Получить все запись из файле пользователя
  getAll = () => {
    const dataPath = path.resolve(dataDir, `./${this.userId}.json`);
    fs.ensureFileSync(dataPath);
    const json = fs.readJSONSync(dataPath, { throws: false }) || {};

    return json;
  };

  // Получить одну запись из файле пользователя
  get = (id) => {
    const dataPath = path.resolve(dataDir, `./${this.userId}.json`);
    fs.ensureFileSync(dataPath);
    const json = fs.readJSONSync(dataPath, { throws: false }) || {};

    return json[id] || {};
  };

  // Обновить одну заметку в файле пользователя
  update = (note) => {
    if (!note) return;

    const dataPath = path.resolve(dataDir, `./${this.userId}.json`);
    fs.ensureFileSync(dataPath);
    const json = fs.readJSONSync(dataPath, { throws: false }) || {};

    json[note.id] = {
      id: note.id,
      caption: note.caption,
      content: note.content,
      isFinished: note.isFinished,
    };

    fs.writeJSONSync(dataPath, json, {
      spaces: 2,
    });
  };

  // Создать одну заметку в файле пользователя
  create = (note) => {
    if (!note || Object.keys(note).length === 0) return;

    const dataPath = path.resolve(dataDir, `./${this.userId}.json`);
    fs.ensureFileSync(dataPath);
    const json = fs.readJSONSync(dataPath, { throws: false }) || {};

    // Создает уникальный ИД заметки, чтобы не ломать голову с цифрами
    const id = uuidv4();

    json[id] = {
      id,
      caption: note.caption,
      content: note.content,
      isFinished: note.isFinished,
    };

    fs.writeJSONSync(dataPath, json, {
      spaces: 2,
    });
  };

  // Удалить одну заметку в файле пользователя, передаем сюда ИД заметка
  delete = (id) => {
    if (!id) return;

    const dataPath = path.resolve(dataDir, `./${this.userId}.json`);
    fs.ensureFileSync(dataPath);
    const json = fs.readJSONSync(dataPath, { throws: false }) || {};

    if (!json[id]) return;

    json[id] = undefined;

    fs.writeJSONSync(dataPath, json, {
      spaces: 2,
    });
  };
}

module.exports = Data;
