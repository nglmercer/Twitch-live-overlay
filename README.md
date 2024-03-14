# Twitch-TTS
speechchat chat de voz y conexion con minecraft
![image](https://github.com/nglmercer/Twitch-MineTTS/assets/128845117/3ea9f9d0-153b-4e59-8751-31447ea91470)
![image](https://github.com/nglmercer/Twitch-MineTTS/assets/128845117/a8a4392e-e656-4b08-a544-89b6b4418a91)

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
