import * as fs from "fs";
import * as Discord from "discord.js";
import {GameData, Game} from './rpg'
import {log, del} from './logger'
const auth = JSON.parse(fs.readFileSync("./auth.json").toString())

interface People {
  [id: string] : PersonInfo
}

export interface EmojiUpdate {
    type: "emoji",
    number: number,
    emoji: Discord.Emoji | Discord.ReactionEmoji,
    user: string,
    msg: Discord.Message
}

export interface PersonInfo {
  classes: NEUClass[],
  swearNumber: number,
  game: string | undefined,
  playingGame: boolean
}
interface NEUClass {
  // CS or ...
  type: string,
  classNumber: number,
  section: number
}

let bot = new Discord.Client()

let people: People = {

}

bot.on("ready", function() {
  let wGuild = bot.guilds.get("432343677759651841 temp disabled")
  if(wGuild) {
    let wChannel: any = wGuild.channels
    .filter(wGuild => wGuild.type === "text" &&
    wGuild.permissionsFor(wGuild.client.user).has("SEND_MESSAGES")).get("460410488233132042")

    if(wChannel) {
      wChannel.send("Hello! " + bot.emojis.find("name", "monkaCozy"))
    }
  }
  del()
});


bot.on("messageDelete", (message) => {
  if(channel) {
    let messageTo = "Message: " + message.content + "\n" + 'User that deleted the message: <@' + message.author.id + ">\n" + "Deleted at: " + message.createdTimestamp
    channel.send(messageTo);
  }
})

let obj: any = {}
let channel: any
let channelAssigned = false;
let game: Game | null = null


bot.on("message", async message => {

  // getting individuals info

  let person: PersonInfo | null = null
  let authorID = message.author.id; //use this to fetch
  let returnCheck = checkIfExists(authorID);
  if(returnCheck===undefined) {
    people[authorID] = {
      classes: [],
      swearNumber: 0,
      game: undefined,
      playingGame: false
    }

    person = people[authorID]
  }
  else {
    person = returnCheck
  }

  /*
  if(message.author.username==="saulbot") {
    message.channel.send("worthless bot, don't listen to him")
  }
  */

  if(message.content[0]=="+") {
    
    let args = message.content.substring(1).split(' ');
    let cmd = args[0];
    let rest = message.content.substring(2 + cmd.length);

    if(cmd == "rpg-play") {
      game = new Game(authorID, person, message.channel, person.game)
      person.playingGame = true

      bot.on("messageReactionAdd", (reaction, user)=> {
        if(game && !user.bot) {
          game.handleMessage(
            {
              type: "emoji",
              number: reaction.count,
              emoji: reaction.emoji,
              user: user.id,
              msg: reaction.message,
            }
          )
        }
      })
      
    }
    if(cmd == "rpg-quit") {
      if(game !== null) {
        log("rpg-game cleanup initializing")
        person.playingGame = false
        people[message.author.id].game = game.sAExit()
        // garbage cleanup
        delete game._data
        delete game._channel
        delete game.registeredListener
      }

      game = null

      log("check to make sure game is intact..." + people[message.author.id].game)
    }

    /**
    if (cmd == "Shut") {
      if(message.author.username=="Winnie" || message.author.username=="Ryan") {
        if(!message.author.bot)
        message.channel.send("Shut the FUCK door to my anus because I like to suck lollipops in your nose");
      }
    }
    */

    if (cmd === "listemojis") {
      const emojiList = message.guild.emojis.map(e=>e.toString()).join(" ");
      message.channel.send(emojiList);
    }
    
    if(cmd=="peepoBirthday") {
      message.channel.send(`${bot.emojis.get("384214644258242560")}`)
    }
    if(cmd == "channel" && channelAssigned == false) {
      log("set channel");
      channelAssigned = true;
      channel = message.channel;
    }

    if(cmd == "sob") {
      message.channel.send(`${bot.emojis.find("name", "FeelsSobMan")}`)
    }
    if(cmd == "gamble") {

      if(message.author.username=="Ryan" || message.author.username=="jreiss1923") {
        message.channel.send("You win!")
        if(obj[message.author.username])
        obj[message.author.username] = obj[message.author.username] + 1
        else
        obj[message.author.username] = 1
      }
      else {
        message.channel.send("You lose!")
      }
    }

    if(cmd == "score") {
      message.channel.send(obj[message.author.username])
    }

    if(cmd == "search") {
      message.channel.send("https://www.google.com/search?q=" + rest)
    }

    if(cmd == "addClasses") {
      buildFromParse(rest, message.author)
      message.channel.send("You are taking: " + JSON.stringify(people[message.author.id]))
    }

    if(cmd == "editClass") {
      let msg = rest.split("=>")
      let initialClass = parse(msg[0])
      let postEdit = parse(msg[1])
      let foundClass = lookForReference(initialClass, message.author)
      if(foundClass !== undefined) {
        foundClass.classNumber = postEdit.classNumber
        foundClass.section = postEdit.section
        foundClass.type = postEdit.type
      }
    }

    if(cmd == "save") {
      fs.writeFileSync("recallPeople.json", JSON.stringify(people))
      message.channel.send("Data saved...")
    }

    if(cmd === "myClasses") {
      let me = people[message.author.id]
      if(me) {
        message.channel.send(JSON.stringify(me))
      }
    }
    
    if(cmd === "stop") {
      message.channel.send(`OK shutting down... ${bot.emojis.find("name", "FeelsSobMan")}`)
      bot.destroy()
    }
  }

  if(person.playingGame===true) {
    if(game !==null && !message.author.bot) {
      game.handleMessage(message)
    }

  }
});

/**
 * returns reference to the class in people
 * @param initialClass 
 * @param author 
 */
function lookForReference(initialClass: NEUClass, author:Discord.User): NEUClass | undefined {
  let asdfClass: NEUClass | undefined
  let me = people[author.id]
  if(me) {
    asdfClass = me.classes.find(sClass => {
      if (sClass.classNumber === initialClass.classNumber) {
        if (sClass.section === initialClass.section) {
          if (sClass.type === initialClass.type) {
            // found it... these 2 extra if statements may be unnecesary, but I don't know if there are duplicate classnumbers or etc.
            return true
          }
        }
      }
      return false
    })
  }
  return asdfClass
}
function buildFromParse(classList: string, author: Discord.User) {
  let authorID = author.id; //use this to fetch

  // begin parsing... classes need to be of format (*area of study**number* *section*,)**
  let splitClassList = classList.split(",");
  if(splitClassList[1][0]==" ") {
    splitClassList = classList.split(", ")
  }
  log(`class list: ${splitClassList}`)
  for(let sClass of splitClassList) {
    let siClass = sClass.split(" ");
    let newClass: NEUClass = {
      type: "",
      classNumber: 0,
      section: 0
    }
    newClass.section = parseInt(siClass[1]);
    let index: number = 0;
    while(index < siClass[0].length) {
      let siClassChar = siClass[0][index]
      log("checking parsing: " + JSON.stringify(siClass[0]) + ", on current char: " + siClassChar)
      let charInt: number = parseInt(siClassChar)

      if(!isNaN(charInt)) {
        log("stopping on int: " + charInt)
        let classNumber = siClass[0].substring(index)
        newClass.classNumber = parseInt(classNumber)
        newClass.type = siClass[0].substring(0, index)
        break
      }
      index++
    }
    log("adding class")
    people[author.id].classes.push(newClass)
  }
}

/**
 * function for modifying a class later on
 * @param classList 
 */
function parse(classList: string) {
  let siClass = classList.split(" ");
  let newClass: NEUClass = {
    type: "",
    classNumber: 0,
    section: 0
  }
  newClass.section = parseInt(siClass[1]);
  let index: number = 0;
  while(index < siClass[0].length) {
    let siClassChar = siClass[0][index]
    log("checking parsing: " + JSON.stringify(siClass[0]) + ", on current char: " + siClassChar)
    let charInt: number = parseInt(siClassChar)

    if(!isNaN(charInt)) {
      log("stopping on int: " + charInt)
      let classNumber = siClass[0].substring(index)
      newClass.classNumber = parseInt(classNumber)
      newClass.type = siClass[0].substring(0, index)
      break
    }
    index++
  }

  return newClass
}

function checkIfExists(authorID: string): PersonInfo | undefined {
  if(people[authorID]!==undefined) {
    return people[authorID]
  }
  return undefined;
}

bot.login(auth.token);