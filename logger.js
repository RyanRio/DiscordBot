"use strict";
// simple logger so i can just read a file instead of cluttering the console
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var logFile = "log.txt";
var date = new Date();
var log = function log(msg) {
    if (typeof msg !== "string") {
        msg = JSON.stringify(msg);
    }
    msg = "\n" + JSON.stringify({ msg: msg, time: date.getTime() });
    fs.appendFile(logFile, msg, function (err) {
        if (err)
            throw err;
    });
};
exports.log = log;
var del = function deleteFile() {
    fs.exists(logFile, function (exists) {
        if (exists)
            fs.unlink(logFile, function (err) {
                if (err)
                    throw err;
            });
    });
};
exports.del = del;
//# sourceMappingURL=logger.js.map