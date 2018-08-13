import * as fs from "fs";
import * as Discord from "discord.js";
import { GameData, Game, Games } from './assets/lib/poke-types'
import { logger } from './assets/lib/logger'
import { Lib, PersonInfo, People, NEUClass } from './assets/lib/main-lib'
const auth = JSON.parse(fs.readFileSync("./assets/auth.json").toString())

let bot = new Discord.Client()

let games: Games = {

}

let lib = new Lib()

bot.on("ready", function () {
  let wGuild = bot.guilds.get("432343677759651841 temp disabled")
  if (wGuild) {
    let wChannel: any = wGuild.channels
      .filter(wGuild => wGuild.type === "text" &&
        wGuild.permissionsFor(wGuild.client.user).has("SEND_MESSAGES")).get("460410488233132042")

    if (wChannel) {
      wChannel.send("Hello! " + bot.emojis.find("name", "monkaCozy"))
    }
  }
  logger.del()
});


bot.on("messageDelete", (message) => {
  if (channel) {
    let messageTo = "Message: " + message.content + "\n" + 'User that deleted the message: <@' + message.author.id + ">\n" + "Deleted at: " + message.createdTimestamp
    channel.send(messageTo);
  }
})

let obj: any = {}
let channel: any
let channelAssigned = false;


bot.on("message", async message => {

  // getting individuals info

  if (!message.author.bot) {
    let person: PersonInfo
    let authorID = message.author.id; //use this to fetch
    let returnCheck = lib.checkIfExists(authorID);
    if (returnCheck === undefined) {
      logger.log("couldnt find person, returncheck undefined")
      lib.people[authorID] = {
        classes: [],
        swearNumber: 0,
        game: undefined,
        playingGame: false,
      }

      person = lib.people[authorID]
    }
    else {
      logger.log("found person")
      person = returnCheck
    }
    /*
    if(message.author.username==="saulbot") {
      message.channel.send("worthless bot, don't listen to him")
    }
    */

    if (message.content[0] == "+") {

      let args = message.content.substring(1).split(' ');
      let cmd = args[0];
      let rest = message.content.substring(2 + cmd.length);

      if (cmd == "poke-play") {
        if (!person.playingGame) {
          games[authorID] = new Game(authorID, person, message.channel, person.game)
          logger.log("game ref created")
          bot.on("messageReactionAdd", (reaction, user) => {
            let gref = games[authorID]
            if (gref && !user.bot) {
              logger.log("reaction added!")
              gref.handleMessage(
                {
                  type: "emoji",
                  user: user.id,
                  _reaction: reaction
                }
              )
            }
          })
        }
        person.playingGame = true
      }
      if (cmd == "poke-quit") {
        let gref = games[authorID]
        if (gref !== null) {
          logger.log("poke-game cleanup initializing")
          person.playingGame = false
          person.game = gref.sAExit()
          // garbage cleanup
          games[authorID] = null
          logger.log("garbage cleanup execution status: ")
          logger.log(delete games[authorID], true)
        }

        // person[1].GameRef = undefined

        logger.log("check to make sure game is intact..." + person.game)
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
        const emojiList = message.guild.emojis.map(e => e.toString()).join(" ");
        message.channel.send(emojiList);
      }

      if (cmd == "peepoBirthday") {
        message.channel.send(`${bot.emojis.get("384214644258242560")}`)
      }
      if (cmd == "channel" && channelAssigned == false) {
        logger.log("set channel");
        channelAssigned = true;
        channel = message.channel;
      }

      if (cmd == "sob") {
        message.channel.send(`${bot.emojis.find("name", "FeelsSobMan")}`)
      }
      if (cmd == "gamble") {

        if (message.author.username == "Ryan" || message.author.username == "jreiss1923") {
          message.channel.send("You win!")
          if (obj[message.author.username])
            obj[message.author.username] = obj[message.author.username] + 1
          else
            obj[message.author.username] = 1
        }
        else {
          message.channel.send("You lose!")
        }
      }

      if (cmd == "score") {
        message.channel.send(obj[message.author.username])
      }

      if (cmd == "search") {
        message.channel.send("https://www.google.com/search?q=" + rest)
      }

      if (cmd == "addClasses") {
        lib.buildFromParse(rest, message.author)
        let eMsg = lib.embedMsg(lib.people[message.author.id].classes, "Your classes!", "The list of all the classes you currently have saved with WinnieBot", lib.cDisplayCB, "Class")
        message.channel.send(eMsg)
      }

      if (cmd == "editClass") {
        let msg = rest.split("=>")
        let initialClass = lib.parse(msg[0])
        let postEdit = lib.parse(msg[1])
        let foundClass = lib.lookForReference(initialClass, message.author)
        if (foundClass !== undefined) {
          foundClass.classNumber = postEdit.classNumber
          foundClass.section = postEdit.section
          foundClass.type = postEdit.type
        }
      }

      if (cmd == "save") {
        fs.writeFileSync("recallPeople.json", JSON.stringify(lib.people))
        message.channel.send("Data saved...")
      }

      if (cmd === "myClasses") {
        let eMsg = lib.embedMsg(lib.people[message.author.id].classes, "Your classes!", "The list of all the classes you currently have saved with WinnieBot", lib.cDisplayCB, "Class")
        message.channel.send(eMsg)
      }

      if (cmd === "stop") {
        message.channel.send(`OK shutting down... ${bot.emojis.find("name", "FeelsSobMan")}`)
        bot.destroy()
      }
    }

    if (person.playingGame === true) {
      let gref = games[authorID]
      if (gref !== null && !message.author.bot) {
        gref.handleMessage(message)
      }

    }
  }
});

console.log("logging in")
bot.login(auth.token).then(() => {
  console.log("logged in")
}).catch(err => {
  console.log(err)
})