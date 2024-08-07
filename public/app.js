import { TTS } from './functions/tts.js';

document.getElementById("listenBtn").addEventListener("click", function(event){
  event.preventDefault()
});
const btnlisten = document.getElementById('listenBtn');
btnlisten.addEventListener('click', function(event){
  event.preventDefault()
  startListening();
});

class Validator {
  /*
       * Determina si el nombre del canal es válido
       * la cadena de parámetros es el nombre del canal
     */
    isAZ(string) {
      var res = string.match(/^(#)?[a-zA-Z0-9_]{4,25}$/); 
      return (res !== null)
    }
}

const eventselects = ['chat', 'bits', 'sub', 'resub', 'logon'];
function startListening() {
  var validator = new Validator;
  const statusElement = document.querySelector('#status'); 
  const channel = document.querySelector("#channelname").value;
  if(validator.isAZ(channel) == false) {
    statusElement.className = "alert alert-danger"; 
    statusElement.textContent = "Please enter a valid channel name."; 
  }
  else {
    const client = new tmi.Client({
      connection: {
        secure: true,
        reconnect: true,
      },
      channels: [channel],
    });

    document.getElementById("listenBtn").textContent = "Listening...";
    document.getElementById("listenBtn").disabled = true; 
    statusElement.className = "alert alert-success"; 

    client.connect().then((data) => {
      statusElement.textContent = `Connected to twitch. Listening for messages in ${channel}...`;
      addChatItem('connect', data, `Connected to twitch ^^`, '#007bff');
    });

    client.on('message', (wat, tags, message, self) => {
      localStorage.setItem('lastMessage',JSON.stringify(tags));
      addChatItem('chat', tags, message, '#007bff');
      // console.log("message event/ tags wat self y message", message, tags, self,wat);
      // addChatItem("chat", tags);
    });
    client.on('cheer', (wat, tags, message, self) => {
      console.log("wat:", wat);
      console.log("cheer event/ tags:", tags);
      console.log("message:", message);
      console.log("cheer/ self:", self);
      addChatItem("bits", tags);

    });
    
    client.on('sub', (wat, tags, message, self) => {
      console.log("wat:", wat);
      console.log("sub event:","tags:", tags);
      console.log("message:", message);
      console.log("self:", self);
      manageEvent('likes', tags);
      addChatItem("sub", tags);
    });
    
    client.on('resub', (wat, tags, message, self) => {
      console.log("wat:", wat);
      console.log("resub event/tags:", tags);
      console.log("message:", message);
      console.log("self:", self);
      manageEvent(tags, message);
      addChatItem("resub", tags);
    });
    
    client.on("logon", (tags) => {
      console.log("logon event/tags:", tags);
    });
    client.on('join', (tags) => {
      console.log("join event/tags:", tags);
    });
    client.on('subscription', (tags) => {
      console.log("subscription event/tags:", tags);
    });
    client.on('resub', (tags) => {
      console.log("resub event/tags:", tags);
    });
    client.on("follow", (tags) => {
      console.log("follow event/tags:", tags);
      addChatItem("follow", tags);

    });
  }
}
if (localStorage.getItem('lastMessage')) {
  const lastMessage = JSON.parse(localStorage.getItem('lastMessage'));
  setTimeout(() => {
    // const evalbadgesvalue = evalBadge(lastMessage);
    // console.log('evalbadgesvalue', evalbadgesvalue);  
    addChatItem("chat", lastMessage, lastMessage.message, "gold");
  }, 1000);
}
function sanitize(text) {
  if (text) { // Verifica si la entrada no es undefined
      return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  } else {
      return ''; // Devuelve una cadena vacía si la entrada es undefined
  }
}
function addChatItem(eventype,tags, message, color) {
  const container = location.href.includes('obs.html') ? $('.eventcontainer') : $('.chatcontainer');
  if (container.find('div').length > 500) {
      container.find('div').slice(0, 200).remove();
  }
  const messageHTML = getMessageHTML(message, tags);
  console.log(eventype, tags, message, color);
  container.find('.temporary').remove();
  // si color color ? es true static si no es false temporary
  container.append(`
      <div class=${tags ? 'static' : 'temporary'}>
          <span>
              <b>${tags.username}</b>
              <span style="color:${color}">${messageHTML}</span>
          </span>
      </div>
  `);
  evalBadge(tags);
}
function evalBadge(tags) {
  let userid = tags['user-id'];
  const checkboxes = document.querySelectorAll('.card-content input[type="checkbox"]');
  let values = {};
  let evalresult = false;
  // Recolectar el estado de los checkboxes y inputs adicionales
  checkboxes.forEach(checkbox => {
      const relatedInput = document.getElementById(`${checkbox.id}-value`);
      if (relatedInput) {
          values[checkbox.id] = {
              checked: checkbox.checked,
              value: relatedInput.value
          };
      } else {
          values[checkbox.id] = checkbox.checked;
      }
  });
  getuserinfo(userid);
  console.log("values", values);
  console.log(tags, "data uniqueId evalBadge", values);
  
  // Evaluar si el usuario cumple al menos uno de los criterios
  for (const [key, value] of Object.entries(values)) {
      if (values.allUsers === true) {
          console.log("allUsers retornamos true y no hacemos nada", values.allUsers);
          evalresult = true;
      }

      // Verificar si la clave es 'badges' y si tiene subpropiedades

          for (const [badgeKey, badgeValue] of Object.entries(tags.badges || {})) {
              if (badgeKey === key && value.checked) {
                  if (badgeValue >= value.value) {
                    console.log(`Condition met for ${key} with value ${badgeValue} and additional value ${value.value}`);
                    evalresult = true;
                  }
                  console.log(badgeValue, value, badgeKey);
              }
          }
      

      if (typeof value === 'object' && tags[key] !== undefined) {
          // Verificar si el valor es un objeto con un campo "checked" y "value"
          if (value.checked && ((typeof tags[key] === 'number' && tags[key] > 0) || (typeof tags[key] === 'boolean' && tags[key]))) {
              console.log(`Condition met for ${key} with value ${tags[key]} and additional value ${value.value}`);
              evalresult = true;
          }
          console.log(tags[key], value);
      } else if (value === true && ((typeof tags[key] === 'boolean' && tags[key]) || (typeof tags[key] === 'number' && tags[key] > 0))) {
          console.log(`Condition met for ${key} with value ${tags[key]}`);
          evalresult = true;
      }
  }

  return evalresult;
}
function getMessageHTML(message, { emotes }) {
  if (!emotes) return sanitize(message);

  // store all emote keywords
  // ! you have to first scan through 
  // the message string and replace later
  const stringReplacements = [];

  // iterate of emotes to access ids and positions
  Object.entries(emotes).forEach(([id, positions]) => {
    // use only the first position to find out the emote key word
    const position = positions[0];
    const [start, end] = position.split("-");
    const stringToReplace = message.substring(
      parseInt(start, 10),
      parseInt(end, 10) + 1
    );

    stringReplacements.push({
      stringToReplace: stringToReplace,
      replacement: `<img src='https://static-cdn.jtvnw.net/emoticons/v2/${id}/animated/dark/1.0' onerror="this.src=src='https://static-cdn.jtvnw.net/emoticons/v1/${id}/1.0'">`,
    });
  });

  // generate HTML and replace all emote keywords with image elements
  const messageHTML = stringReplacements.reduce(
    (acc, { stringToReplace, replacement }) => {
      // obs browser doesn't seam to know about replaceAll
      return acc.split(stringToReplace).join(replacement);
    },
    message
  );

  return messageHTML;
}
function getuserinfo(user) {
  let responseresult = false;
//   fetch(`https://api.twitch.tv/helix/users/follows?to_id=${user}`, {
//     headers: new Headers({
//       Authorization: `Bearer ${this.twitch.$auth.oauth_access_token}`,
//       "Client-ID": `${this.twitch.$auth.oauth_client_id}`,
//     })
// }).then(response => response.json()).then(data => {
//     responseresult = data;
// });
return responseresult;
}
const request1 = indexedDB.open("giftlistDatabase", 1);
// console.log("request",request1);
let dataMinecraft = JSON.parse(localStorage.getItem('dataminecraft'));
let keyplayerName = dataMinecraft && dataMinecraft['playerName'] 
    ? dataMinecraft['playerName'] 
    : document.getElementById('playerNameInput').value;console.log("keyplayerName?=",keyplayerName);
let currentPlayerIndex = 0;
const COMMAND_LIMIT = 1; // Límite de comandos por minuto
const DELAY_PER_COMMAND = 10; // Retraso en milisegundos por cada comando adicional
let commandCount = 0;

function testHandleEvent() {
  var eventType = document.getElementById('eventType').value;
  var data = document.getElementById('data').value;
  
  if (!['gifts', 'comments', 'likes', 'subscribes', 'chat'].includes(eventType)) {
    console.error("Invalid event type:", eventType);
    return;
  }

  const transaction = db.transaction([eventType], "readonly");
  const objectStore = transaction.objectStore(eventType);

  const request = objectStore.getAll();

  request.onsuccess = (event) => {
    const allEvents = event.target.result;
    console.log(`All ${eventType}:`, allEvents);

    const trimmedData = data.trim().toLowerCase();
    const foundEvent = allEvents.find(event => event.title.toLowerCase() === trimmedData || event.description.toLowerCase() === trimmedData);
    console.log (foundEvent);
    if (foundEvent) {
      const eventCommands = foundEvent.description;
      window.api.sendChatMessage(`${eventType} ${eventCommands}`);
      Replacecommandtest(eventCommands);
      // console.log(`eventType ${eventType} find:`, eventType, eventCommands);
    } else {
      console.log(`eventType ${eventType} else:`, eventType, data);
    }
  };

  request.onerror = (event) => {
    console.error(`Error fetching ${eventType} from IndexedDB:`, event.target.errorCode);
    console.log(`ONERROR testHandleEvent:`, eventType, data);
  };
}
const Replacecommandtest = (command) => {
  // console.log("eventype",eventype);
  let replacedCommand = command
    .replace('playername', keyplayerName || '')

  replacedCommand = replacedCommand.replace(/\\/g, '');
  replacedCommand = replacedCommand.toLowerCase();
  console.log("replacedCommand",replacedCommand);
  return replacedCommand;
}

function sendReplacedCommand(replacedCommand) {
  window.api.sendChatMessage(replacedCommand);
}
function handleEvent(eventType, tags, message) {
  // const transaction = db.transaction([eventType], "readonly");
  // const objectStore = transaction.objectStore(eventType);

  // const request = objectStore.getAll();

  // request.onsuccess = (event) => {
  //   const allEvents = event.target.result;
  //   console.log(`All ${eventType}:`, allEvents);

  //   const trimmedData = event.trim().toLowerCase();
  //   const foundEvent = allEvents.find(event => event.title.toLowerCase() === trimmedData || event.description.toLowerCase() === trimmedData);
  //   console.log (foundEvent);
  //   if (foundEvent) {
  //     const eventCommands = foundEvent.description;
  //     Replacevalues(eventCommands, tags, message);
  //     // console.log(`eventType ${eventType} find:`, eventType, eventCommands);
  //   } else {
  //     console.log(`eventType ${eventType} else:`, eventType, event);
  //   }
  // };

  // request.onerror = (event) => {
  //   console.error(`Error fetching ${eventType} from IndexedDB:`, event.target.errorCode);
  //   console.log(`ONERROR testHandleEvent:`, eventType, data);
  // };
}
const Replacevalues = (command, tags, message) => {
  // console.log("eventype",eventype);
  let replacedCommand = command
    .replace('playername', keyplayerName || '')
    .replace('username', tags.username || '')
    .replace('message', message || '')
    .replace('bits', tags.bits || '')
    .replace('comment', message || '')
    .replace('gift', tags.bits || '')
    .replace('uniqueId', tags.username || '')

  replacedCommand = replacedCommand.replace(/\\/g, '');
  replacedCommand = replacedCommand.toLowerCase();

  return replacedCommand;
}

function manageOptions(tags, message) {
  const badges = tags.badges || {};
  const isBroadcaster = badges.broadcaster;
  const isMod = badges.moderator;

  const excludedChattersTextArea = document.getElementById('excluded-chatters');
  const excludedLines = excludedChattersTextArea.value.split('\n').map(line => line.toLowerCase());

  const options = document.querySelectorAll('.option input[type="checkbox"]:checked');

  if (options.length === 0) {
    new TTS(message, tags);
    return;
  }

  options.forEach(option => {
    switch (option.getAttribute('data-option')) {
      case 'modsonly':
        if (isBroadcaster || isMod) {
          new TTS(message, tags);
        }
        break;
      case 'cheersonly':
        if (tags.bits > 0) {
          new TTS(message, tags);
        }
        break;
      case 'exclude-toggle':
        if (!excludedLines.includes(tags['display-name'].toLowerCase())) {
          new TTS(message, tags);
        }
        break;
      default:
        new TTS(message, tags);
    }
  });
}


/*
  * Changes the volume of Polly speech. 
*/
let volumechange = document.getElementById('volume');
volumechange.addEventListener('change', function(event){
  event.preventDefault()
  document.getElementById("audiotrack").volume = volumechange.value;
});



function populateVoiceList() {
  if (typeof speechSynthesis === "undefined") {
    return;
  }
  const voices = speechSynthesis.getVoices();
  for (let i = 0; i < voices.length; i++) {
    const option = document.createElement("option");
    option.textContent = `${voices[i].name} (${voices[i].lang})`;

    option.setAttribute("data-lang", voices[i].lang);
    option.setAttribute("data-name", voices[i].name);
    document.getElementById("voiceSelect").appendChild(option);
  }
}


window.speechSynthesis.onvoiceschanged = function() {
  populateVoiceList();
}


function skipMessage() {
  //stops Polly Speech
  document.getElementById("audiotrack").pause();
  document.getElementById("audiotrack").currentTime = 0;

  //stops Browser speech
  window.speechSynthesis.cancel();
}

/*
  * If Channel Name is in the URL, autostart listening
*/

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
if(urlParams.get('channelname') !== null) {
  document.querySelector("#channelname").value = urlParams.get('channelname');
  startListening();
};

window.speechSynthesis.onvoiceschanged = function() {
  populateVoiceList();
}
/*
   Si la casilla de verificación está seleccionada para excluir a los usuarios del chat, muestre las opciones para ello.
*/

/*
   Completa la lista de usuarios excluidos del chat con una lista predefinida de robots de moderación conocidos.
*/
