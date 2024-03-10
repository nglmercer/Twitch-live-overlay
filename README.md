# Twitch-TTS
speechchat chat de voz y conexion con minecraft
#reemplaza valores
equivalencias y hay buen soporta puede usar gift como bits --- username o uniqueId
```
        .replace('playername', playerName || '')
        .replace('username', tags.username || '')
        .replace('message', message || '')
        .replace('bits', tags.bits || '')
        .replace('comment', message || '')
        .replace('gift', tags.bits || '')
        .replace('uniqueId', tags.username || '')
```
EJEMPLO
```
chat:
  - "/tellraw @a {\"text\":\"{uniqueId} : {comment} \", \"color\":\"green\"}"
  - "/tellraw @a {\"text\":\"{uniqueId} : {message} \", \"color\":\"green\"}"
bits:
  default:
    - "/tellraw @a {\"text\":\"{uniqueId}  sent a {giftName} x{repeatCount} \", \"color\":\"gold\"}"
    - "/title @a subtitle {\"text\":\"ENVIO {giftName} x{repeatCount} \",\"bold\":true,\"color\":\"gold\"}"
    - "/execute at {playername} run summon minecraft:zombie ~ ~ ~ {CustomName:'{\"text\":\"{uniqueId} \"}', CustomNameVisible:1}"
    - "/execute at {playername} run playsound minecraft:entity.player.levelup ambient @p"
    - "/execute at {playername} run give @a minecraft:golden_apple 1"
    - "/title @a title {\"text\":\"{uniqueId} \"}"
```
10 bits a comando seria 
```
bits:
 10:
   - "/tellraw @a {\"text\":\" {uniqueId}  sent a  {giftName} } \", \"color\":\"gold\"}"
 25:
   - "/tellraw @a {\"text\":\" {username}  sent a  {bits} } \", \"color\":\"gold\"}"
