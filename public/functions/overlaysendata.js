import { getDataFromIndexedDB  } from './indexedDB.js';
async function eventmanager(eventType, data) {
    // console.log('eventmanager', eventType, "eventype data -------------------", data);

    let eventsfind = await getDataFromIndexedDB(databases.MyDatabaseActionevent);

    // Conjunto para almacenar los tipos de archivo que ya se han procesado
    let processedTypes = new Set();

    // Iteramos sobre cada evento encontrado
    eventsfind.forEach(eventname => {
        Object.entries(eventname).forEach(([key, value]) => {
            let splitkey = key.split('-');

            // Verificamos si el tipo de evento coincide y si el evento no tiene check
            if (splitkey[1] === eventType && !value.check) {
                console.log(splitkey[1] === eventType && !value.check);
                // console.log(splitkey, "eventsfind---------------------", eventsfind, "eventname---------------------", eventname, "eventType------------------", eventType, "value------------------", value, "key data -------------------", key);
                return true;
            }

            // Verificamos si el tipo de evento coincide
            if (splitkey[1] === eventType) {
                // console.log('eventname', eventname["type-imagen"], "value", value, "key data -------------------", key);
                // console.log('eventname', eventname["type-video"], "value", value, "key data -------------------", key);
                // console.log('eventname', eventname["type-audio"], "value", value, "key data -------------------", key);
                // console.log("eventname---------------------", eventname, "eventType------------------", eventType, "value------------------", value, "key data -------------------", key);
                if (eventType === 'gift') {
                    value.select = Number(value.select);
                    if (value.select === data.giftId) {
                        console.log("value.select === data.giftId valor del select es igual al nombre del gift recibido", value.select === data.giftId, "data.giftId", data.giftId, "value.select", value.select);
                    } else if (value.select !== data.giftId) {
                        return true;
                    }
                }
                if (eventType === 'likes') {
                    if (value.number === undefined || value.number === null) {
                        value.number = 2;
                    }
                    value.number = Number(value.number);
                    console.log("LIKES likes value.select", value.number, "data.likeCount", data.likeCount);

                    if (value.number === data.likeCount) {
                        console.log("value.number es menor a likeCount recibido", value.number <= data.likeCount, "data.likeCount", data.likeCount, "value.select", value.select);
                    } else if (value.number <= data.likeCount) {
                        console.log("value.number es menor a likeCount recibido", value.number <= data.likeCount, "data.likeCount", data.likeCount, "value.select", value.select);
                    } else if (value.number >= data.likeCount) {
                        console.log("value.number es mayor a likeCount recibido", value.number >= data.likeCount, "data.likeCount", data.likeCount, "value.select", value.select);
                        return true;
                    }
                }

                // if (data.giftId) {
                //     console.log("data.giftId", data.giftId,"value", value);
                // }
                // Procesamos el tipo de imagen si no ha sido procesado aún
                if (eventname["type-imagen"] && eventname["type-imagen"].check && !processedTypes.has("image")) {
                    processedTypes.add("image");
                    getfileId(eventname["type-imagen"].select).then(srcoverlay => {
                        // if (srcoverlay !== null) {
                        //     window.api.createOverlayWindow();
                        //     window.api.sendOverlayData('play', { src: srcoverlay.path, fileType: srcoverlay.type, options: eventname["type-imagen"] });
                        //     console.log("srcoverlay encontrado", "index", eventname["type-imagen"].select, "src", srcoverlay.path, "fileType", srcoverlay.type);
                        // }
                        sendbyeventname(srcoverlay.path, srcoverlay.type, eventname["type-imagen"]);
                    });
                }

                // Procesamos el tipo de video si no ha sido procesado aún
                if (eventname["type-video"] && eventname["type-video"].check && !processedTypes.has("video")) {
                    processedTypes.add("video");
                    getfileId(eventname["type-video"].select).then(srcoverlay => {
                        // if (srcoverlay !== null) {
                        //     window.api.createOverlayWindow();
                        //     window.api.sendOverlayData('play', { src: srcoverlay.path, fileType: srcoverlay.type, options: eventname["type-video"] });
                        //     console.log("srcoverlay encontrado", srcoverlay, "index", eventname["type-video"].select, "src", srcoverlay.path, "fileType", srcoverlay.type);
                        // }
                        sendbyeventname(srcoverlay.path, srcoverlay.type, eventname["type-video"]);
                    });
                }

                // Procesamos el tipo de audio si no ha sido procesado aún
                if (eventname["type-audio"] && eventname["type-audio"].check && !processedTypes.has("audio")) {
                    processedTypes.add("audio");
                    getfileId(eventname["type-audio"].select).then(srcoverlay => {
                        // if (srcoverlay !== null) {
                        //     window.api.createOverlayWindow();
                        //     window.api.sendOverlayData('play', { src: srcoverlay.path, fileType: srcoverlay.type, options: eventname["type-audio"] });
                        //     console.log("srcoverlay encontrado", srcoverlay, "index", eventname["type-audio"].select, "src");
                        // }
                        sendbyeventname(srcoverlay.path, srcoverlay.type, eventname["type-audio"]);
                    });
                }
                if (eventname["type-profile"] && eventname["type-profile"].check && !processedTypes.has("profile")) {
                    processedTypes.add("profile");
                    sendbyeventname(data.profilePictureUrl, "image/png", eventname["type-profile"], true);
                            // window.api.createOverlayWindow();
                            // eventname["type-profile"].texto = replaceVariables(eventname["type-profile"].texto, data);
                            // console.log("text profile", eventname["type-profile"]);
                            // window.api.sendOverlayData('play', { src: data.profilePictureUrl, fileType: "image/png", options: eventname["type-profile"] },true);
                            // console.log("dataprofile encontrado", data.profilePictureUrl, "src");
                }
                // if (eventname["type-text"] && eventname["type-text"].check && !processedTypes.has("text")) {
                //     processedTypes.add("text");
                //     window.api.createOverlayWindow();
                //     window.api.sendOverlayData('play', { src: eventname["type-text"].select, fileType: "text/plain", options: eventname["type-text"] },true);
                //     console.log("text overlay", eventname["type-text"]);
                // }
            }
        });
    });
}
function sendbyeventname(srcdata, typedata, optionsdata, boolean) {
    window.api.createOverlayWindow();
    window.api.sendOverlayData('play', { src: srcdata, fileType: typedata, options: optionsdata },boolean);
    console.log("data encontrado", srcdata, "type", typedata, "options", optionsdata, "boolean", boolean);
}
export { eventmanager, sendbyeventname };