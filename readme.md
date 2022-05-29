# Лабораторная работа #7

Списоĸ дел. Web + Telegram. CRUD + списоĸ выполненных и не выполненных дел.

* Выпонлить `npm install`
* Переименовать `.env-example` в `.env` и заполнить токен бота

Для сервера
* Открыть консоль для сервера и выполнить `npm run server`
* При добавлении избраннок создается папка `data`, в ней хранится `1.json` со списком дел

Для бота (бот пока не сделан)
* Открыть консоль для бота и выполнить `npm run bot`
* Зайти к своему боту в личные сообщения, нажать Start или написать /start

Заметки:
1. По заданию для бота требуется использовать `node-telegram-bot-api`, но использую `grammy`, т.к. по нему есть адекватная документация