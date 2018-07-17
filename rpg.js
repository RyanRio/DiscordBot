"use strict";
/**
 * Beginning of rpg files...
 */
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
Object.defineProperty(exports, "__esModule", { value: true });
var Discord = require("discord.js");
var events_1 = require("events");
var logger_1 = require("./logger");
/**
 * Personal to a single person, destroy instance as needed
 *
 *
 */
var Game = /** @class */ (function () {
    function Game(ID, _person, channel, gameData) {
        var _this = this;
        this.cMSGID = "";
        this.emojiList = [];
        //last message sent
        this.lms = undefined;
        if (!gameData) {
            logger_1.logger.log("game being created from default with person: " + JSON.stringify(_person));
            this._data = {
                person: _person,
                pID: ID,
                stats: {}
            };
        }
        else {
            logger_1.logger.log("game being created from inputted data");
            this._data = JSON.parse(gameData);
        }
        this._channel = channel;
        this.registeredListener = new events_1.EventEmitter();
        this.awaitingResponse = true;
        this.initialized = false;
        this.initGame().then(function (val) {
            logger_1.logger.log(val);
            _this.awaitingResponse = false;
            _this.initialized = true;
        });
    }
    Game.prototype.sAExit = function () {
        logger_1.logger.log("saving with data: " + JSON.stringify(this._data));
        return JSON.stringify(this._data);
    };
    Game.prototype.initGame = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, mapping, embed, result;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        //sending stat builder here
                        this.emojiList = ["🇫"];
                        mapping = (_a = {},
                            _a["🇫"] = "Fear",
                            _a);
                        embed = {
                            embed: {
                                color: 3447003,
                                title: "Stat Builder",
                                description: "Set your stats for your definitely not dark souls playthrough",
                                fields: [
                                    {
                                        name: "Strength",
                                        value: "0"
                                    },
                                    {
                                        name: "Dexterity",
                                        value: "0"
                                    },
                                    {
                                        name: "Vigor",
                                        value: "0"
                                    },
                                    {
                                        name: "Fear",
                                        value: "0"
                                    }
                                ],
                                timestamp: new Date(),
                            }
                        };
                        this._channel.send(embed).then(function (msg) {
                            _this.lms = msg;
                            if (msg instanceof Discord.Message) {
                                _this.emojiList.forEach(function (val) {
                                    msg.react(val).catch(function (err) {
                                        logger_1.logger.log("reaction failed because of: " + JSON.stringify(err));
                                    });
                                });
                                _this.registeredListener.on("emojiIncrease", function (emoji) {
                                    if (_this.lms) {
                                        if (_this.lms instanceof Discord.Message) {
                                            var name_1 = mapping[emoji.name];
                                            var fField = embed.embed.fields.find(function (field) {
                                                return field.name === name_1;
                                            });
                                            if (fField) {
                                                fField.value = (parseInt(fField.value) + 1).toString();
                                                _this._data.stats[fField.name] = parseInt(fField.value);
                                            }
                                            _this.lms.edit(embed).then(function (uMsg) {
                                                _this.lms = uMsg;
                                            });
                                        }
                                    }
                                });
                            }
                        });
                        // waiting for user to be done
                        this.awaitingResponse = true;
                        return [4 /*yield*/, new Promise(function (resolve) {
                                _this.registeredListener.on("complete", function () {
                                    logger_1.logger.log("heard complete!");
                                    // put stats into game data before resolving... TODO
                                    resolve(true);
                                });
                            }).catch(function (reason) {
                                logger_1.logger.log(reason);
                            })];
                    case 1:
                        result = _b.sent();
                        return [2 /*return*/, result];
                }
            });
        });
    };
    Game.prototype.handleMessage = function (msg) {
        var _this = this;
        if (msg instanceof Discord.Message) {
            if (msg.channel !== this._channel) {
                //update channel
                this._channel = msg.channel;
            }
            logger_1.logger.log("content: " + msg.content + " awaiting response: " + this.awaitingResponse);
            //figure out if msg is in response
            if (this.awaitingResponse) {
                if (msg.content === "complete") {
                    logger_1.logger.log("emitting complete");
                    this.registeredListener.emit("complete");
                }
            }
            //ignore if not awaiting response
        }
        else {
            // only notice the emoji update if the user is the same
            if (this.awaitingResponse) {
                logger_1.logger.log("received emoji with id: " + msg._reaction.emoji.name);
                if (this._data.pID === msg.user) {
                    if (this.emojiList.find(function (val) {
                        return msg._reaction.emoji.name === val;
                    })) {
                        logger_1.logger.log("found emoji");
                        // found the emoji
                        msg._reaction.remove(msg.user).then(function () {
                            _this.registeredListener.emit("emojiIncrease", msg._reaction.emoji);
                        });
                        /*
                        let reactionArray = msg.msg.reactions.array()

  
                        reactionArray.forEach(val=> {
                            val.fetchUsers().then(user=> {
                                let users = user.array()
                                users.forEach(usr=> {
                                    if(usr.bot===false) {
                                        val.remove(usr)
                                    }
                                })
                            })
                        })
                        */
                    }
                }
                else {
                    msg._reaction.message.clearReactions().then(function (resultMsg) {
                        resultMsg.react("<:regional_indicator_f:>");
                    });
                }
            }
        }
    };
    return Game;
}());
exports.Game = Game;
//# sourceMappingURL=rpg.js.map