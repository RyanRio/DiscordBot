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
        if (!gameData) {
            logger_1.log("game being created from default with person: " + JSON.stringify(_person));
            this._data = {
                person: _person,
                pID: ID
            };
        }
        else {
            logger_1.log("game being created from inputted data");
            this._data = JSON.parse(gameData);
        }
        this._channel = channel;
        this.registeredListener = new events_1.EventEmitter();
        this.awaitingResponse = true;
        this.initialized = false;
        this.initGame().then(function (val) {
            logger_1.log(val);
            _this.awaitingResponse = false;
            _this.initialized = true;
        });
    }
    Game.prototype.sAExit = function () {
        logger_1.log("saving with data: " + JSON.stringify(this._data));
        return JSON.stringify(this._data);
    };
    Game.prototype.initGame = function () {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        //sending stat builder here
                        this.emojiList = ["regional_indicator_f"];
                        this._channel.send("abc").then(function (msg) {
                            if (msg instanceof Discord.Message) {
                                _this.emojiList.forEach(function (val) {
                                    logger_1.log("looking for emoji: " + val);
                                    msg.react("🇫");
                                });
                            }
                        });
                        // waiting for user to be done
                        this.awaitingResponse = true;
                        return [4 /*yield*/, new Promise(function (resolve) {
                                _this.registeredListener.on("complete", function () {
                                    logger_1.log("heard complete!");
                                    resolve(true);
                                });
                            }).catch(function (reason) {
                                logger_1.log(reason);
                            })];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result];
                }
            });
        });
    };
    Game.prototype.handleMessage = function (msg) {
        if (msg instanceof Discord.Message) {
            if (msg.channel !== this._channel) {
                //update channel
                this._channel = msg.channel;
            }
            logger_1.log("content: " + msg.content + " awaiting response: " + this.awaitingResponse);
            //figure out if msg is in response
            if (this.awaitingResponse) {
                if (msg.content === "complete") {
                    logger_1.log("emitting complete");
                    this.registeredListener.emit("complete");
                }
            }
            //ignore if not awaiting response
        }
        else {
            // only notice the emoji update if the user is the same
            if (this.awaitingResponse) {
                if (this._data.pID === msg.user) {
                    if (this.emojiList.find(function (val) {
                        return msg.emoji.id === val;
                    })) {
                        // found the emoji
                        var reaction = msg.msg.reactions.get(msg.emoji.id);
                        if (reaction)
                            reaction.count = 1;
                    }
                }
                else {
                    msg.msg.clearReactions().then(function (resultMsg) {
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