const { Bot, session, InlineKeyboard } = require("grammy");
const axios = require("axios").default;
require("dotenv").config();

if (!process.env.BOT_TOKEN) throw "Требуется BOT_TOKEN";

const urlBase = "http://localhost:3000/api";
const bot = new Bot(`${process.env.BOT_TOKEN}`);

let token = null;
const getToken = () => {
  return axios({
    url: `${urlBase}/login`,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: JSON.stringify({
      name: "bot",
      password: "botpassword",
    }),
  }).then((res) => {
    token = res.data.accessToken;
  });
};

function initial() {
  return {};
}
bot.use(session({ initial }));

const initialKeyboard = new InlineKeyboard()
  .text("Новые заметки", "button-getnew")
  .text("Завершенные заметки", "button-getfinished")
  .row()
  .text("Создать заметку", "button-create");

bot.command("start", (ctx) =>
  ctx.reply(
    "Лабораторная работа №7\nСписоĸ дел. Web + Telegram. CRUD + списоĸ выполненных и не выполненных дел.",
    {
      reply_markup: initialKeyboard,
    }
  )
);

bot.callbackQuery("button-getnew", async (ctx) => {
  const data = await axios({
    url: `${urlBase}/get`,
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`,
      "telegram-user-id": ctx.from.id,
    },
  });
  const json = data.data;

  const notesListKeyboard = new InlineKeyboard();

  for (let key in json) {
    if (json[key].isFinished) continue;
    notesListKeyboard
      .text(`"${json[key].caption}"`, `note=${json[key].id}`)
      .row();
  }

  await ctx.reply("Список новых заметок", {
    reply_markup: notesListKeyboard,
  });
});

bot.callbackQuery("button-getfinished", async (ctx) => {
  const data = await axios({
    url: `${urlBase}/get`,
    method: "GET",
    headers: {
      authorization: `Bearer ${token}`,
      "telegram-user-id": ctx.from.id,
    },
  });
  const json = data.data;

  const notesListKeyboard = new InlineKeyboard();

  for (let key in json) {
    if (!json[key].isFinished) continue;
    notesListKeyboard
      .text(`"${json[key].caption}"`, `note=${json[key].id}`)
      .row();
  }

  await ctx.reply("Список завершенных заметок", {
    reply_markup: notesListKeyboard,
  });
});

bot.callbackQuery("button-getsingle", async (ctx) => {
  const data = await axios({
    url: `${urlBase}/get`,
    method: "GET",
    headers: {
      authorization: `Bearer ${token}`,
      "telegram-user-id": ctx.from.id,
    },
  });
  const json = data.data;

  const notesListKeyboard = new InlineKeyboard();

  for (let key in json) {
    if (!json[key].isFinished) continue;
    notesListKeyboard.text(json[key].caption, `note=${json[key].id}`).row();
  }

  await ctx.reply("Список завершенных заметок", {
    reply_markup: notesListKeyboard,
  });
});

bot.callbackQuery("button-create", async (ctx) => {
  ctx.session.createNewNote = true;

  await ctx.reply(
    "Создание заметки:" +
      "\n1. На первой строке введите название новой заметки" +
      "\n2. На второй строке введите описание новой заметки" +
      "\n3. На третьей строке введите ДА, если требуется создать завершенную заметку"
  );
});

bot.callbackQuery(/note=.*/, async (ctx) => {
  const id = ctx.callbackQuery.data.split("=")[1];

  const data = await axios({
    url: `${urlBase}/get/${id}`,
    method: "GET",
    headers: {
      authorization: `Bearer ${token}`,
      "telegram-user-id": ctx.from.id,
    },
  });
  const json = data.data;

  const kbd = new InlineKeyboard();

  if (!json.isFinished) kbd.text("Завершить", `note-finish=${json.id}`);

  kbd
    .text("Редактировать", `note-edit=${json.id}`)
    .text("Удалить", `note-delete=${json.id}`);

  const text = `Заметка № ${json.id}\n\nЗаголовок: ${
    json.caption
  }\n\nТекст заметки: ${json.content}\n\nЗаметка завершена: ${
    json.isFinished ? "Да" : "Нет"
  }`;

  await ctx.reply(text, {
    reply_markup: kbd,
  });
});

bot.callbackQuery(/note-finish=.*/, async (ctx) => {
  const id = ctx.callbackQuery.data.split("=")[1];

  const data = await axios({
    url: `${urlBase}/get/${id}`,
    method: "GET",
    headers: {
      authorization: `Bearer ${token}`,
      "telegram-user-id": ctx.from.id,
    },
  });
  const json = data.data;

  json.isFinished = true;

  await axios({
    url: `${urlBase}/update`,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`,
      "telegram-user-id": ctx.from.id,
    },
    data: JSON.stringify(json),
  });

  await ctx.reply("Заметка завершена. Начните со /start");
});

bot.callbackQuery(/note-edit=.*/, async (ctx) => {
  const id = ctx.callbackQuery.data.split("=")[1];
  ctx.session.editNote = true;
  ctx.session.editNoteId = id;

  await ctx.reply(
    "Редактирование заметки:" +
      "\n1. На первой строке введите обновленное название заметки или '-' (оставить как было)" +
      "\n2. На второй строке введите обновленное описание заметки или '-' (оставить как было)" +
      "\n3. На третьей строке введите ДА или НЕТ (требуется завершить заметку или нет) или '-' (оставить как было)"
  );
});

bot.callbackQuery(/note-delete=.*/, async (ctx) => {
  const id = ctx.callbackQuery.data.split("=")[1];

  await axios({
    url: `${urlBase}/delete/${id}`,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`,
      "telegram-user-id": ctx.from.id,
    },
  });

  await ctx.reply("Заметка удалена. Начните со /start");
});

const createOrUpdateNote = async (note, id) => {
  if (!note) return;

  let url = `${urlBase}/${note.id ? "update" : "create"}`;

  await axios({
    url,
    method: "POST",
    data: JSON.stringify(note),
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`,
      "telegram-user-id": id,
    },
  });
};

bot.on("message", (ctx) => {
  if (ctx.session.createNewNote) {
    ctx.session.createNewNote = false;

    const array = ctx.message.text.split("\n");

    if (array.length === 2 || array.length === 3) {
      const json = {
        caption: array[0],
        content: array[1],
        isFinished: array.length === 3 && /ДА/i.test(array[2]),
      };
      createOrUpdateNote(json, ctx.from.id);
      ctx.reply("Заметка создана. Отправьте /start чтобы ее посмотреть");
    } else {
      ctx.reply("Создать заметку не удалось, начните со /start");
    }
  } else if (ctx.session.editNote) {
    ctx.session.editNote = false;

    const array = ctx.message.text.split("\n");

    if (array.length === 2 || array.length === 3) {
      let json = {
        id: ctx.session.editNoteId,
        caption: /-/.test(array[0]) ? undefined : array[0],
        content: /-/.test(array[1]) ? undefined : array[1],
      };
      if (array[2] && /ДА/i.test(array[2])) json.isFinished = true;
      if (array[2] && /НЕТ/i.test(array[2])) json.isFinished = false;
      createOrUpdateNote(json, ctx.from.id);
      ctx.reply("Заметка изменена. Отправьте /start чтобы ее посмотреть");
    } else {
      ctx.reply("Создать заметку не удалось, начните со /start");
    }
  } else {
    ctx.reply("Начните со /start");
  }
});

getToken().then(() => {
  bot.start();
});
