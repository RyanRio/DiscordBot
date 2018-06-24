"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var Discord = require("discord.js");
var auth = JSON.parse(fs.readFileSync("./auth.json").toString());
var bot = new Discord.Client();
var people = [];
bot.on("ready", function (evt) {
});
bot.on("messageDelete", function (message) {
    if (channel) {
        var messageTo = "Message: " + message.content + "\n" + 'User that deleted the message: <@' + message.author.id + ">\n" + "Deleted at: " + message.createdTimestamp;
        channel.send(messageTo);
    }
});
var obj = {};
var channel;
var channelAssigned = false;
bot.on("message", function (message) { return __awaiter(_this, void 0, void 0, function () {
    var args, cmd, rest, emojiList, res;
    return __generator(this, function (_a) {
        if (message.content[0] == "+") {
            args = message.content.substring(1).split(' ');
            cmd = args[0];
            rest = message.content.substring(2 + cmd.length);
            console.log("check 1");
            if (cmd == "Shut") {
                if (message.author.username == "Winnie" || message.author.username == "Ryan") {
                    if (!message.author.bot)
                        message.channel.send("Shut the FUCK door to my anus because I like to suck lollipops in your nose");
                }
            }
            if (cmd === "listemojis") {
                emojiList = message.guild.emojis.map(function (e) { return e.toString(); }).join(" ");
                message.channel.send(emojiList);
            }
            if (cmd == "peepoBirthday") {
                message.channel.send("" + bot.emojis.get("384214644258242560"));
            }
            if (cmd == "channel" && channelAssigned == false) {
                console.log("set channel");
                channelAssigned = true;
                channel = message.channel;
            }
            if (cmd == "sob") {
                message.channel.send("" + bot.emojis.find("name", "FeelsSobMan"));
            }
            if (cmd == "gamble") {
                if (message.author.username == "Ryan" || message.author.username == "jreiss1923") {
                    message.channel.send("You win!");
                    if (obj[message.author.username])
                        obj[message.author.username] = obj[message.author.username] + 1;
                    else
                        obj[message.author.username] = 1;
                }
                else {
                    message.channel.send("You lose!");
                }
            }
            if (cmd == "score") {
                message.channel.send(obj[message.author.username]);
            }
            if (cmd == "search") {
                message.channel.send("https://www.google.com/search?q=" + rest);
            }
            if (cmd == "addClasses") {
                console.log("check2");
                res = parse(rest, message.author);
                message.channel.send("You are taking: " + JSON.stringify(res));
            }
        }
        return [2 /*return*/];
    });
}); });
function parse(classList, author) {
    var authorID = author.id; //use this to fetch
    console.log("check3");
    var returnCheck = checkIfExists(authorID);
    console.log("check 5..." + JSON.stringify(returnCheck));
    var newPerson;
    if (returnCheck === undefined) {
        newPerson = {
            classes: [],
            id: ""
        };
    }
    else {
        newPerson = returnCheck;
    }
    newPerson.id = authorID;
    // begin parsing... classes need to be of format (*area of study**number* *section*,)**
    var splitClassList = classList.split(",");
    console.log("class list: " + splitClassList);
    for (var _i = 0, splitClassList_1 = splitClassList; _i < splitClassList_1.length; _i++) {
        var sClass = splitClassList_1[_i];
        var siClass = sClass.split(" ");
        var newClass = {
            type: "",
            classNumber: 0,
            section: 0
        };
        newClass.section = parseInt(siClass[1]);
        var index = 0;
        while (index < siClass[0].length) {
            var siClassChar = siClass[0][index];
            console.log("checking parsing: " + JSON.stringify(siClass[0]) + ", on current char: " + siClassChar);
            var charInt = parseInt(siClassChar);
            if (!isNaN(charInt)) {
                console.log("stopping on int: " + charInt);
                var classNumber = siClass[0].substring(index);
                newClass.classNumber = parseInt(classNumber);
                newClass.type = siClass[0].substring(0, index);
                break;
            }
            index++;
        }
        newPerson.classes.push(newClass);
    }
    if (returnCheck === undefined) {
        people.push(newPerson);
    }
    console.log("result: " + JSON.stringify(newPerson));
    return newPerson;
}
function checkIfExists(authorID) {
    console.log("check4");
    for (var _i = 0, people_1 = people; _i < people_1.length; _i++) {
        var person = people_1[_i];
        if (person.id === authorID) {
            return person;
        }
    }
    console.log("about to return from checkifexists");
    return undefined;
}
bot.login(auth.token);
//# sourceMappingURL=main.js.map