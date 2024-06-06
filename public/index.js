document.addEventListener('DOMContentLoaded', () => {
  let db;
  let editingEventId = null;

  // Open IndexedDB
  const request = indexedDB.open('eventsDB', 1);

  request.onupgradeneeded = (event) => {
      db = event.target.result;
      const objectStore = db.createObjectStore('events', { keyPath: 'id', autoIncrement: true });
      objectStore.createIndex('name', 'name', { unique: false });
      objectStore.createIndex('trigger', 'trigger', { unique: false });
      objectStore.createIndex('action', 'action', { unique: false });
  };

  request.onsuccess = (event) => {
      db = event.target.result;
      loadEvents();
  };

  request.onerror = (event) => {
      console.error('Database error:', event.target.errorCode);
  };

  const overlayEventAdd = document.getElementById('OverlayEventAdd');
  const overlayEventName = document.getElementById('OverlayEventName');
  const overlayEventTrigger = document.getElementById('OverlayEventTrigger');
  const overlayEventActions = document.getElementById('OverlayEventActions');
  const overlayEventcontent = document.getElementById('OverlayEventcontent');

  // Load events from localStorage and display them in the select
  const overlayevents = localStorage.getItem('existingFiles') || '[]';
  const parsedOverlayEvents = JSON.parse(overlayevents);

  function loadLocalStorageEvents() {
      parsedOverlayEvents.forEach(file => {
          const option = document.createElement('option');
          option.value = file.name;
          option.textContent = file.name;
          overlayEventActions.appendChild(option);
      });
  }

  function handleSelectChange(event) {
      const selectedFileName = event.target.value;
      const selectedFile = parsedOverlayEvents.find(file => file.name === selectedFileName);
      console.log('Selected file from localStorage:', selectedFile);
  }

  overlayEventActions.addEventListener('change', handleSelectChange);

  function loadEvents() {
      if (!db) {
          console.error('Database not initialized');
          return;
      }

      const transaction = db.transaction(['events'], 'readonly');
      const objectStore = transaction.objectStore('events');
      const request = objectStore.getAll();

      request.onsuccess = (event) => {
          const events = event.target.result;
          overlayEventActions.innerHTML = ''; // Clear previous options
          overlayEventcontent.innerHTML = ''; // Clear previous content

          // Load events from IndexedDB
          events.forEach(event => {
              const option = document.createElement('option');
              option.value = event.id;
              option.textContent = event.name;

              // Create event elements for display
              const eventElement = document.createElement('div');
              eventElement.classList.add('modal-body');
              eventElement.innerHTML = `
                  <p>Name: <span class="event-name">${event.name}</span></p>
                  <p>Trigger: <span class="event-trigger">${event.trigger}</span></p>
                  <p>Action: <span class="event-action">${event.action}</span></p>
                  <button class="edit-event" data-id="${event.id}">Edit</button>
                  <button class="delete-event" data-id="${event.id}">Delete</button>
              `;
              overlayEventcontent.appendChild(eventElement);
          });

          // Load events from localStorage
          loadLocalStorageEvents();
      };

      request.onerror = (event) => {
          console.error('Failed to load events:', event.target.errorCode);
      };
  }

  overlayEventAdd.addEventListener('click', () => {
      const name = overlayEventName.value;
      const trigger = overlayEventTrigger.value;
      const action = overlayEventActions.value;

      if (name && trigger) {
          const transaction = db.transaction(['events'], 'readwrite');
          const objectStore = transaction.objectStore('events');
          const request = objectStore.add({ name, trigger, action });

          request.onsuccess = (event) => {
              console.log('Event added to the database:', event.target.result);
              loadEvents(); // Refresh the list of events
          };

          request.onerror = (event) => {
              console.error('Failed to add event:', event.target.errorCode);
          };
      } else {
          alert('Please fill in all fields.');
      }
  });

  overlayEventcontent.addEventListener('click', (event) => {
      if (event.target.classList.contains('edit-event')) {
          editingEventId = parseInt(event.target.dataset.id);
          const eventElement = event.target.closest('.modal-body');
          const name = eventElement.querySelector('.event-name').textContent;
          const trigger = eventElement.querySelector('.event-trigger').textContent;
          const action = eventElement.querySelector('.event-action').textContent;

          eventElement.innerHTML = `
              <p>Name: <input type="text" class="edit-name" value="${name}" /></p>
              <p>Trigger: <input type="text" class="edit-trigger" value="${trigger}" /></p>
              <p>Action: <input type="text" class="edit-action" value="${action}" /></p>
              <button class="save-edit" data-id="${editingEventId}">Save</button>
              <button class="cancel-edit">Cancel</button>
          `;
      }

      if (event.target.classList.contains('delete-event')) {
          const eventId = parseInt(event.target.dataset.id);
          const transaction = db.transaction(['events'], 'readwrite');
          const objectStore = transaction.objectStore('events');
          const request = objectStore.delete(eventId);

          request.onsuccess = (event) => {
              console.log('Event deleted:', eventId);
              loadEvents(); // Refresh the list of events
          };

          request.onerror = (event) => {
              console.error('Failed to delete event:', event.target.errorCode);
          };
      }

      if (event.target.classList.contains('save-edit')) {
          const eventId = parseInt(event.target.dataset.id);
          const eventElement = event.target.closest('.modal-body');
          const name = eventElement.querySelector('.edit-name').value;
          const trigger = eventElement.querySelector('.edit-trigger').value;
          const action = eventElement.querySelector('.edit-action').value;

          if (name && trigger && action) {
              const transaction = db.transaction(['events'], 'readwrite');
              const objectStore = transaction.objectStore('events');
              const request = objectStore.put({ id: eventId, name, trigger, action });

              request.onsuccess = (event) => {
                  console.log('Event updated:', eventId);
                  loadEvents(); // Refresh the list of events
              };

              request.onerror = (event) => {
                  console.error('Failed to update event:', event.target.errorCode);
              };
          } else {
              alert('Please fill in all fields.');
          }
      }

      if (event.target.classList.contains('cancel-edit')) {
          loadEvents(); // Reload events to revert changes
      }
  });

  if (db) {
      loadEvents();
  }
});
