import * as fs from "fs";
import * as Discord from "discord.js";
const auth = JSON.parse(fs.readFileSync("./auth.json").toString())

interface Person {
  classes: NEUClass[]
  id: string;
}

interface NEUClass {
  // CS or ...
  type: string,
  classNumber: number,
  section: number
}

let bot = new Discord.Client()


let people: Person[] = [];

bot.on("ready", function() {
   let wGuild = bot.guilds.get("432343677759651841")
  if(wGuild) {
    let wChannel: any = wGuild.channels
    .filter(wGuild => wGuild.type === "text" &&
    wGuild.permissionsFor(wGuild.client.user).has("SEND_MESSAGES")).get("460410488233132042")

    if(wChannel) {
      wChannel.send("Hello! " + bot.emojis.find("name", "monkaCozy"))
    }
  }

  people = JSON.parse(fs.readFileSync("recallPeople.json").toString())
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
bot.on("message", async message => {

  
  if(message.content[0]=="+") {
    
    let args = message.content.substring(1).split(' ');
    let cmd = args[0];
    let rest = message.content.substring(2 + cmd.length);
    console.log("check 1");
    if (cmd == "Shut") {
      if(message.author.username=="Winnie" || message.author.username=="Ryan") {
        if(!message.author.bot)
        message.channel.send("Shut the FUCK door to my anus because I like to suck lollipops in your nose");
      }
    }

    if (cmd === "listemojis") {
      const emojiList = message.guild.emojis.map(e=>e.toString()).join(" ");
      message.channel.send(emojiList);
    }
    
    if(cmd=="peepoBirthday") {
      message.channel.send(`${bot.emojis.get("384214644258242560")}`)
    }
    if(cmd == "channel" && channelAssigned == false) {
      console.log("set channel");
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
      console.log("check2")
      let res = buildFromParse(rest, message.author)
      message.channel.send("You are taking: " + JSON.stringify(res))
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
      let me = people.find(person => person.id===message.author.id)
      if(me) {
        message.channel.send(JSON.stringify(me))
      }
    }
    
    if(cmd === "stop") {
      message.channel.send(`OK shutting down... ${bot.emojis.find("name", "FeelsSobMan")}`)
      bot.destroy()
    }
  }
  else {
    // parse
    let swearFound = false
    let swearList = ["bitch", "fuck", "ass", "dumbass", "shit", "bullshit", "hell", "cunt", "dick", "asshat", "anus"]
    let puncList = ["?"," ",".",";"]
    for(let swear of swearList) {
      let location = message.content.toLowerCase().search(swear)
      if(location!==-1) {
        if(location===0) {
          console.log("location is 0: " + message.content)
          if(find(message.content[swear.length], puncList) || message.content.length===swear.length) {
            message.delete()
            message.channel.send("No swearing in this good doggy channel!")
            console.log("found swear")
          }
        }
        else if((find(message.content[location-1], puncList) && find(message.content[swear.length+location], puncList)) || (find(message.content[location-1], puncList) && message.content.length-location-swear.length===0)) {
          message.delete()
          message.channel.send("No swearing in this good doggy channel!")
          console.log("found swear")
        }
      }
    }
    /*
    Disgusting old code before I remembered that a search function existed
    let index = 0
    let swearFound = {exists:false, type: "null"}


    while(index < message.content.length) {
      const cChar = message.content.charAt(index)
      switch(cChar) {
        case "s": {
          if(index===0) {
            if(message.content.substring(index, index + 5)==="shit ") {
              swearFound.exists = true
              swearFound.type = "s"
              message.delete()
              message.channel.send("no swearing on this good christian server")
            }
            else if(message.content.substring(index, index + 4)==="shit" && message.content.length === index + 4) {
              swearFound.exists = true
              swearFound.type = "f"
              message.delete()
              message.channel.send("no swearing on this good christian server")
            }
          }
          else if(message.content.substring(index-1, index + 5)===" shit ") {
            swearFound.exists = true
            swearFound.type = "s"
            message.delete()
            message.channel.send("no swearing on this good christian server")
          }
          break
        }
        case "f": {
          if(index===0) {
            if(message.content.substring(index, index + 5)==="fuck ") {
              swearFound.exists = true
              swearFound.type = "f"
              message.delete()
              message.channel.send("no swearing on this good christian server")
            }
            else if(message.content.substring(index, index + 4)==="fuck" && message.content.length === index + 4) {
              swearFound.exists = true
              swearFound.type = "f"
              message.delete()
              message.channel.send("no swearing on this good christian server")
            }
          }
          else if(message.content.substring(index-1, index + 5)===" fuck ") {
            swearFound.exists = true
            swearFound.type = "f"
            message.delete()
            message.channel.send("no swearing on this good christian server")
          }
          break
        }
        case "a": {
          if(index===0) {
            console.log(`"${message.content}"`)
            if(message.content.substring(index, index + 4)==="ass ") {
              swearFound.exists = true
              swearFound.type = "a"
              message.delete()
              message.channel.send("no swearing on this good christian server")
            }
            else if(message.content.substring(index, index + 3)==="ass" && message.content.length === index + 3) {
              swearFound.exists = true
              swearFound.type = "a"
              message.delete()
              message.channel.send("no swearing on this good christian server")
            }
          }
          else if(message.content.substring(index-1, index + 4)===" ass ") {
            swearFound.exists = true
            swearFound.type = "a"
            message.delete()
            message.channel.send("no swearing on this good christian server")
          }
          break
        }
        case "b": {
          if(index===0) {
            if(message.content.substring(index, index + 6)==="bitch ") {
              swearFound.exists = true
              swearFound.type = "b"
              message.delete()
              message.channel.send("no swearing on this good christian server")
            }
            else if(message.content.substring(index, index + 5)==="bitch" && message.content.length === index + 5) {
              swearFound.exists = true
              swearFound.type = "b"
              message.delete()
              message.channel.send("no swearing on this good christian server")
            }
          }
          else if(message.content.substring(index-1, index + 6)===" bitch ") {
            swearFound.exists = true
            swearFound.type = "b"
            message.delete()
            message.channel.send("no swearing on this good christian server")
          }
          break
        }
        case "g": {
          let swear1 = "goddamn"
          let sLength = "goddamn".length
          if(index===0) {
            if(message.content.substring(index, index + sLength + 1)===swear1 + " ") {
              swearFound.exists = true
              message.delete()
              message.channel.send("no swearing on this good christian server")
            }
            else if(message.content.substring(index, index + sLength)===swear1 && message.content.length === index + sLength) {
              swearFound.exists = true
              message.delete()
              message.channel.send("no swearing on this good christian server")
            }
          }
          else if(message.content.substring(index-1, index + sLength)===" " + swear1 + " ") {
            swearFound.exists = true
            message.delete()
            message.channel.send("no swearing on this good christian server")
          }
          break
        }
      }
      index++
    }
    swearFound.exists = false
    */
  }

});

function find(valueToSearhFor: string, valuesToSearchAgainst: string[]): boolean {
  let res = valuesToSearchAgainst.find((value) => {
    if (value === valueToSearhFor) {
        return true        
    }
    else {
        return false
    }

  })

  if(res!==undefined) {
    return true
  }
  return false
}
/**
 * returns reference to the class in people
 * @param initialClass 
 * @param author 
 */
function lookForReference(initialClass: NEUClass, author:Discord.User): NEUClass | undefined {
  let asdfClass: NEUClass | undefined
  let me = people.find(person => person.id===author.id)
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
  console.log("check3")
  let returnCheck = checkIfExists(authorID);
  console.log("check 5..." + JSON.stringify(returnCheck))
  let newPerson: Person
  if(returnCheck === undefined) {
    newPerson = {
      classes: [],
      id: ""
    }
  }
  else  {
    newPerson = returnCheck
  }
  newPerson.id = authorID
  // begin parsing... classes need to be of format (*area of study**number* *section*,)**
  let splitClassList = classList.split(",");
  if(splitClassList[1][0]==" ") {
    splitClassList = classList.split(", ")
  }
  console.log(`class list: ${splitClassList}`)
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
      console.log("checking parsing: " + JSON.stringify(siClass[0]) + ", on current char: " + siClassChar)
      let charInt: number = parseInt(siClassChar)

      if(!isNaN(charInt)) {
        console.log("stopping on int: " + charInt)
        let classNumber = siClass[0].substring(index)
        newClass.classNumber = parseInt(classNumber)
        newClass.type = siClass[0].substring(0, index)
        break
      }
      index++
    }
    newPerson.classes.push(newClass)
  }

  if(returnCheck === undefined) {
    people.push(newPerson)
  }
  console.log("result: " + JSON.stringify(newPerson))
  return newPerson
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
    console.log("checking parsing: " + JSON.stringify(siClass[0]) + ", on current char: " + siClassChar)
    let charInt: number = parseInt(siClassChar)

    if(!isNaN(charInt)) {
      console.log("stopping on int: " + charInt)
      let classNumber = siClass[0].substring(index)
      newClass.classNumber = parseInt(classNumber)
      newClass.type = siClass[0].substring(0, index)
      break
    }
    index++
  }

  return newClass
}

function checkIfExists(authorID: string): Person | undefined {
  console.log("check4")
  for (let person of people) {
    if(person.id === authorID) {
      return person
    }
  }
  console.log("about to return from checkifexists")
  return undefined;
}

bot.login(auth.token);