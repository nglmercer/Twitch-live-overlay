let db;
const request = indexedDB.open("eventDatabase", 1);

request.onupgradeneeded = (event) => {
  db = event.target.result;

  const stores = ["gifts", "chat", "follows", "subscribes"];
  stores.forEach(store => {
    if (!db.objectStoreNames.contains(store)) {
      db.createObjectStore(store, { keyPath: "id", autoIncrement: true });
    }
  });
};

request.onsuccess = (event) => {
  db = event.target.result;
  displayEvents("gifts");
  displayEvents("chat");
  displayEvents("follows");
  displayEvents("subscribes");
};
request.onerror = (event) => {
  console.error("Database error: ", event.target.errorCode);
};
function addEvent(storeName) {
  const titleInput = document.getElementById(`${storeName}-title`);
  const descriptionInput = document.getElementById(`${storeName}-description`);

  const eventTitle = titleInput.value;
  const eventDescription = descriptionInput.value;

  if (eventTitle === "" || eventDescription === "") {
    alert("Ingrese tanto un título como una descripción.");
    return;
  }

  const transaction = db.transaction([storeName], "readwrite");
  const objectStore = transaction.objectStore(storeName);

  const request = objectStore.add({ title: eventTitle, description: eventDescription });

  request.onsuccess = () => {
    titleInput.value = "";
    descriptionInput.value = "";
    displayEvents(storeName);
  };

  request.onerror = (event) => {
    console.error(`Agregar ${storeName}, error: `, event.target.errorCode);
  };
}

function deleteEvent(storeName, id) {
  const transaction = db.transaction([storeName], "readwrite");
  const objectStore = transaction.objectStore(storeName);

  const request = objectStore.delete(id);

  request.onsuccess = () => {
    displayEvents(storeName);
  };

  request.onerror = (event) => {
    console.error(`Borrar ${storeName}, error: `, event.target.errorCode);
  };
}

function updateEvent(storeName, id, newTitle, newDescription) {
  const transaction = db.transaction([storeName], "readwrite");
  const objectStore = transaction.objectStore(storeName);

  const request = objectStore.get(id);

  request.onsuccess = (event) => {
    const eventItem = event.target.result;
    eventItem.title = newTitle;
    eventItem.description = newDescription;

    const updateRequest = objectStore.put(eventItem);

    updateRequest.onsuccess = () => {
      displayEvents(storeName);
    };
    updateRequest.onerror = (event) => {
      console.error(`Editar ${storeName} error: `, event.target.errorCode);
    };
  };

  request.onerror = (event) => {
    console.error(`Retrieve ${storeName} error: `, event.target.errorCode);
  };
}

function displayEvents(storeName) {
  const transaction = db.transaction([storeName], "readonly");
  const objectStore = transaction.objectStore(storeName);

  const request = objectStore.getAll();

  request.onsuccess = (event) => {
    const eventList = document.getElementById(`${storeName}-list`);
    eventList.innerHTML = "";

    event.target.result.forEach((eventItem) => {
      const listItem = document.createElement("li");

      const titleDiv = document.createElement("div");
      titleDiv.textContent = eventItem.title;

      const descriptionDiv = document.createElement("div");
      descriptionDiv.textContent = eventItem.description;

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
      titleInput.value = eventItem.title;
      titleInput.style.display = 'none';

      const descriptionInput = document.createElement("textarea");
      descriptionInput.value = eventItem.description;
      descriptionInput.style.display = 'none';

      const saveButton = document.createElement("button");
      saveButton.textContent = "Guardar";
      saveButton.className = "save-button";
      saveButton.style.display = 'none';
      saveButton.onclick = () => {
        updateEvent(storeName, eventItem.id, titleInput.value, descriptionInput.value);
      };

      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Borrar";
      deleteButton.className = "delete-button";
      deleteButton.onclick = () => deleteEvent(storeName, eventItem.id);

      listItem.appendChild(titleDiv);
      listItem.appendChild(descriptionDiv);
      listItem.appendChild(titleInput);
      listItem.appendChild(descriptionInput);
      listItem.appendChild(editButton);
      listItem.appendChild(saveButton);
      listItem.appendChild(deleteButton);

      eventList.appendChild(listItem);
    });
  };

  request.onerror = (event) => {
    console.error(`Display ${storeName} error: `, event.target.errorCode);
  };
}