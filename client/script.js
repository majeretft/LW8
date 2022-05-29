(() => {
  class App {
    constructor() {
      this.templateNew = document.querySelector("#new-note-template");
      this.templateFinished = document.querySelector("#finished-note-template");
      this.newNoteContainer = document.querySelector("#new-note-container");
      this.finishedNoteContainer = document.querySelector(
        "#finished-note-container"
      );

      this.modalId = document.querySelector("#modal-id");
      this.modalCaption = document.querySelector("#modal-caption");
      this.modalContent = document.querySelector("#modal-content");
      this.modalFinished = document.querySelector("#modal-isfinished");
      this.modalSave = document.querySelector("#modal-save");

      this.createNewNote = document.querySelector("#create-new-note");
      this.createNote.bind(this);
      this.createNewNote.onclick = this.createNote;
      this.exampleModal = new bootstrap.Modal("#exampleModal", {
        backdrop: "static",
      });

      this.editNote.bind(this);
      this.completeNote.bind(this);
      this.deleteNote.bind(this);

      this.addOrUpdateNewNote.bind(this);
      this.modalSave.onclick = this.addOrUpdateNewNote;
    }

    init = () => {
      fetch("/api/get", {
        method: "GET",
        credentials: "same-origin",
      }).then(async (res) => {
        const json = await res.json();
        this.notesList = json;
        for (let key in json) {
          json[key].isFinished
            ? this.addFinishedCard(json[key])
            : this.addNewCard(json[key]);
        }
      });
    };

    createNote = () => {
      this.modalId.value = "";
      this.modalCaption.value = "";
      this.modalContent.value = "";
      this.modalFinished.checked = "";

      this.exampleModal.show();
    };

    editNote = (id) => {
      if (!id || !this.notesList[id]) return;

      this.modalId.value = id;
      this.modalCaption.value = this.notesList[id].caption;
      this.modalContent.value = this.notesList[id].content;
      this.modalFinished.checked = this.notesList[id].isFinished;

      this.exampleModal.show();
    };

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
        },
      }).then((res) => {
        if (res.redirected) window.location.href = res.url;
      });
    };

    deleteNote = (id) => {
      if (!id || !this.notesList[id]) return;

      let url = `/api/delete/${id}`;

      fetch(url, {
        method: "POST",
        credentials: "same-origin",
      }).then((res) => {
        if (res.redirected) window.location.href = res.url;
      });
    };

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
        },
      }).then((res) => {
        if (res.redirected) window.location.href = res.url;
      });
    };
  }

  const app = new App();

  app.init();
})();
