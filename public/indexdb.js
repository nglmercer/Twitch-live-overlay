// Open (or create) the database
let db;
const request = indexedDB.open("giftlistDatabase", 1);

request.onupgradeneeded = (event) => {
  db = event.target.result;
  if (!db.objectStoreNames.contains("gifts")) {
    db.createObjectStore("gifts", { keyPath: "id", autoIncrement: true });
  }
};

request.onsuccess = (event) => {
  db = event.target.result;
  displayGifts();
};

request.onerror = (event) => {
  console.error("Database error: ", event.target.errorCode);
};

function addGift() {
  const titleInput = document.getElementById("gift-title");
  const descriptionInput = document.getElementById("gift-description");

  const giftTitle = titleInput.value;
  const giftDescription = descriptionInput.value;

  if (giftTitle === "" || giftDescription === "") {
    alert("Ingrese tanto un título como una descripción.");
    return;
  }

  const transaction = db.transaction(["gifts"], "readwrite");
  const objectStore = transaction.objectStore("gifts");

  const request = objectStore.add({ title: giftTitle, description: giftDescription });

  request.onsuccess = () => {
    titleInput.value = "";
    descriptionInput.value = "";
    displayGifts();
  };

  request.onerror = (event) => {
    console.error("Agregar, error de regalo: ", event.target.errorCode);
  };
}

function deleteGift(id) {
  const transaction = db.transaction(["gifts"], "readwrite");
  const objectStore = transaction.objectStore("gifts");

  const request = objectStore.delete(id);

  request.onsuccess = () => {
    displayGifts();
  };

  request.onerror = (event) => {
    console.error("Borrar ,error de regalo: ", event.target.errorCode);
  };
}

function updateGift(id, newTitle, newDescription) {
  const transaction = db.transaction(["gifts"], "readwrite");
  const objectStore = transaction.objectStore("gifts");

  const request = objectStore.get(id);

  request.onsuccess = (event) => {
    const gift = event.target.result;
    gift.title = newTitle;
    gift.description = newDescription;

    const updateRequest = objectStore.put(gift);

    updateRequest.onsuccess = () => {
      displayGifts();
    };
    updateRequest.onerror = (event) => {
      console.error("Edit gift error: ", event.target.errorCode);
    };
  };

  request.onerror = (event) => {
    console.error("Retrieve gift error: ", event.target.errorCode);
  };
}

function displayGifts() {
  const transaction = db.transaction(["gifts"], "readonly");
  const objectStore = transaction.objectStore("gifts");

  const request = objectStore.getAll();
  console.log("displayGifts",request);

  request.onsuccess = (event) => {
    const giftList = document.getElementById("gift-list");
    giftList.innerHTML = "";

    event.target.result.forEach((gift) => {
      const listItem = document.createElement("li");

      const titleDiv = document.createElement("div");
      titleDiv.textContent = gift.title;

      const descriptionDiv = document.createElement("div");
      descriptionDiv.textContent = gift.description;

      const editButton = document.createElement("button");
      editButton.textContent = "Editar";
      editButton.className = "edit-button";
      editButton.onclick = () => {
        titleDiv.style.display = 'none';
        descriptionDiv.style.display = 'none';
        editButton.style.display = 'none';
        titleInput.style.display = 'inline-block';
        titleInput.style.width = '100%';
        descriptionInput.style.display = 'inline-block';
        descriptionInput.style.marginTop = '10px';
        descriptionInput.style.width = '100%';
        saveButton.style.display = 'inline-block';
      };

      const titleInput = document.createElement("input");
      titleInput.type = "text";
      titleInput.value = gift.title;
      titleInput.style.display = 'none';

      const descriptionInput = document.createElement("textarea");
      descriptionInput.value = gift.description;
      descriptionInput.style.display = 'none';

      const saveButton = document.createElement("button");
      saveButton.textContent = "Guardar";
      saveButton.className = "save-button";
      saveButton.style.display = 'none';
      saveButton.onclick = () => {
        updateGift(gift.id, titleInput.value, descriptionInput.value);
      };

      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Borrar";
      deleteButton.className = "delete-button";
      deleteButton.onclick = () => deleteGift(gift.id);

      listItem.appendChild(titleDiv);
      listItem.appendChild(descriptionDiv);
      listItem.appendChild(titleInput);
      listItem.appendChild(descriptionInput);
      listItem.appendChild(editButton);
      listItem.appendChild(saveButton);
      listItem.appendChild(deleteButton);

      giftList.appendChild(listItem);
    });
  };

  request.onerror = (event) => {
    console.error("Display gifts error: ", event.target.errorCode);
  };
}
