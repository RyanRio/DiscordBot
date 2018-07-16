"use strict";
// simple logger so i can just read a file instead of cluttering the console
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var logFile = "log.txt";
var date = new Date();
var Logger = /** @class */ (function () {
    function Logger() {
        this.debug = true;
    }
    Logger.prototype.log = function (msg, append) {
        if (this.debug) {
            if (typeof msg !== "string") {
                msg = JSON.stringify(msg);
            }
            if (append) {
                msg = JSON.stringify({ msg: msg, time: date.getTime() });
            }
            else {
                msg = "\n" + JSON.stringify({ msg: msg, time: date.getTime() });
            }
            fs.appendFile(logFile, msg, function (err) {
                if (err)
                    throw err;
            });
        }
    };
    Logger.prototype.del = function () {
        fs.exists(logFile, function (exists) {
            if (exists)
                fs.unlink(logFile, function (err) {
                    if (err)
                        throw err;
                });
        });
    };
    return Logger;
}());
exports.logger = new Logger();
//# sourceMappingURL=logger.js.map