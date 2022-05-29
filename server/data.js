const fs = require("fs-extra");
const path = require("path");
const { v4: uuidv4 } = require('uuid');

const cwd = process.cwd();
const dataDir = path.resolve(cwd, "./data");

class Data {
  constructor(userId) {
    this.userId = userId;
  }

  getAll = () => {
    const dataPath = path.resolve(dataDir, `./${this.userId}.json`);
    fs.ensureFileSync(dataPath);
    const json = fs.readJSONSync(dataPath, { throws: false }) || {};

    return json;
  };

  get = (id) => {
    const dataPath = path.resolve(dataDir, `./${this.userId}.json`);
    fs.ensureFileSync(dataPath);
    const json = fs.readJSONSync(dataPath, { throws: false }) || {};

    return json[id] || {};
  };

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

  create = (note) => {
    if (!note || Object.keys(note).length === 0) return;

    const dataPath = path.resolve(dataDir, `./${this.userId}.json`);
    fs.ensureFileSync(dataPath);
    const json = fs.readJSONSync(dataPath, { throws: false }) || {};

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
