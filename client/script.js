(() => {
  class App {
    // Ищем на странице кнопки и другие элементы, чтобы не делать этого в каждой функции
    constructor() {
      this.templateNew = document.querySelector("#new-note-template"); // шиблон
      this.templateFinished = document.querySelector("#finished-note-template"); // шиблон
      this.newNoteContainer = document.querySelector("#new-note-container"); // место вставки новых заметок
      this.finishedNoteContainer = document.querySelector(
        "#finished-note-container"
      ); // место вставки завершенных заметок

      this.modalId = document.querySelector("#modal-id"); // модальное окно
      this.modalCaption = document.querySelector("#modal-caption"); // текстовое поле в модальном окне
      this.modalContent = document.querySelector("#modal-content"); // текстовое поле в модальном окне
      this.modalFinished = document.querySelector("#modal-isfinished"); // флажок в модальном окне
      this.modalSave = document.querySelector("#modal-save"); // кнопка сохранить в модальном окне

      this.createNewNote = document.querySelector("#create-new-note"); // кнопка создания новой заметки
      this.createNote.bind(this); // закрепляем this, чтобы при вызове внутри события this оставался на этом классе
      this.createNewNote.onclick = this.createNote; // назначаем обработчик события на кнопку
      this.exampleModal = new bootstrap.Modal("#exampleModal", {
        backdrop: "static",
      }); // модальное окно для отображения

      this.editNote.bind(this); // закрепляем this, чтобы при вызове внутри события this оставался на этом классе
      this.completeNote.bind(this); // закрепляем this, чтобы при вызове внутри события this оставался на этом классе
      this.deleteNote.bind(this); // закрепляем this, чтобы при вызове внутри события this оставался на этом классе

      this.addOrUpdateNewNote.bind(this); // закрепляем this, чтобы при вызове внутри события this оставался на этом классе
      this.modalSave.onclick = this.addOrUpdateNewNote; // назначаем обработчик события на кнопку
    }

    // Получаем все заметки при открытии страницы и добавить их на страницу
    init = () => {
      fetch("/api/get", {
        method: "GET",
        credentials: "same-origin",
        headers: {
          authorization: `Bearer ${window.sessionStorage.getItem("token")}`,
        },
      }).then(async (res) => {
        if (res.status !== 200) {
          window.location.href = "/login";
          return;
        }

        const json = await res.json();
        this.notesList = json;
        for (let key in json) {
          json[key].isFinished
            ? this.addFinishedCard(json[key])
            : this.addNewCard(json[key]);
        }
      });
    };

    // Отображаем моальное окно для создания/редактирования заметки
    createNote = () => {
      this.modalId.value = "";
      this.modalCaption.value = "";
      this.modalContent.value = "";
      this.modalFinished.checked = "";

      this.exampleModal.show();
    };

    // Отображаем моальное окно для создания/редактирования заметки
    editNote = (id) => {
      if (!id || !this.notesList[id]) return;

      this.modalId.value = id;
      this.modalCaption.value = this.notesList[id].caption;
      this.modalContent.value = this.notesList[id].content;
      this.modalFinished.checked = this.notesList[id].isFinished;

      this.exampleModal.show();
    };

    // Завершить заметку
    completeNote = (id) => {
      if (!id || !this.notesList[id]) return;

      let url = "/api/update";

      let card = {
        id: id,
        caption: this.notesList[id].caption,
        content: this.notesList[id].content,
        isFinished: true,
      };

      fetch(url, {
        method: "POST",
        credentials: "same-origin",
        body: JSON.stringify(card),
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${window.sessionStorage.getItem("token")}`,
        },
      }).then((res) => {
        if (res.redirected) window.location.href = res.url;
      });
    };

    // Удалить заметку
    deleteNote = (id) => {
      if (!id || !this.notesList[id]) return;

      let url = `/api/delete/${id}`;

      fetch(url, {
        method: "POST",
        credentials: "same-origin",
        headers: {
          authorization: `Bearer ${window.sessionStorage.getItem("token")}`,
        }
      }).then((res) => {
        if (res.redirected) window.location.href = res.url;
      });
    };

    // При загрузке страницы добавляем заметки в раздел новых
    addNewCard = (card) => {
      if (!card) return;

      const cardEl = this.templateNew.cloneNode(true);

      const idEl = cardEl.content.querySelector("input[name='id']");
      idEl.value = card.id;

      const completeButtonEl = cardEl.content.querySelector(
        "button[name='note-complete']"
      );
      completeButtonEl.onclick = (e) => {
        const idEl = e.target
          .closest(".card")
          .querySelector("input[name='id']");
        this.completeNote(idEl.value);
      };

      const editButtonEl = cardEl.content.querySelector(
        "button[name='note-edit']"
      );
      editButtonEl.onclick = (e) => {
        const idEl = e.target
          .closest(".card")
          .querySelector("input[name='id']");
        this.editNote(idEl.value);
      };

      const deleteButtonEl = cardEl.content.querySelector(
        "button[name='note-delete']"
      );
      deleteButtonEl.onclick = (e) => {
        const idEl = e.target
          .closest(".card")
          .querySelector("input[name='id']");
        this.deleteNote(idEl.value);
      };

      const titleEl = cardEl.content.querySelector(".card-title");
      titleEl.textContent = card.caption;

      const contentEl = cardEl.content.querySelector(".card-text");
      contentEl.textContent = card.content;

      this.newNoteContainer.appendChild(cardEl.content);
    };

    // При загрузке страницы добавляем заметки в раздел завершенных
    addFinishedCard = (card) => {
      if (!card) return;

      const cardEl = this.templateFinished.cloneNode(true);

      const idEl = cardEl.content.querySelector("input[name='id']");
      idEl.value = card.id;

      const editButtonEl = cardEl.content.querySelector(
        "button[name='note-edit']"
      );
      editButtonEl.onclick = (e) => {
        const idEl = e.target
          .closest(".card")
          .querySelector("input[name='id']");
        this.editNote(idEl.value);
      };

      const deleteButtonEl = cardEl.content.querySelector(
        "button[name='note-delete']"
      );
      deleteButtonEl.onclick = (e) => {
        const idEl = e.target
          .closest(".card")
          .querySelector("input[name='id']");
        this.deleteNote(idEl.value);
      };

      const titleEl = cardEl.content.querySelector(".card-title");
      titleEl.textContent = card.caption;

      const contentEl = cardEl.content.querySelector(".card-text");
      contentEl.textContent = card.content;

      this.finishedNoteContainer.appendChild(cardEl.content);
    };

    // Обновить или создать новую заметку при нажатии кнопки Сохранить в модальном окне
    addOrUpdateNewNote = () => {
      let url = null;
      if (this.modalId.value) {
        url = "/api/update";
      } else {
        url = "/api/create";
      }

      if (!url) return;

      let card = {
        id: this.modalId.value,
        caption: this.modalCaption.value,
        content: this.modalContent.value,
        isFinished: this.modalFinished.checked,
      };

      fetch(url, {
        method: "POST",
        credentials: "same-origin",
        body: JSON.stringify(card),
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${window.sessionStorage.getItem("token")}`,
        },
      }).then((res) => {
        if (res.redirected) window.location.href = res.url;
      });
    };
  }

  const app = new App();

  app.init();
})();
