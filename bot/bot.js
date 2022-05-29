const { Bot } = require("grammy");
require("dotenv").config();

if (!process.env.BOT_TOKEN) throw "Требуется BOT_TOKEN";

const bot = new Bot(`${process.env.BOT_TOKEN}`);

bot.command("start", (ctx) => ctx.reply("Welcome! Up and running."));
bot.on("message", (ctx) => ctx.reply("Got another message!"));

bot.start();
