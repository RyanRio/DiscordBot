// simple logger so i can just read a file instead of cluttering the console

import * as fs from "fs"
const logFile = "log.txt"

let date = new Date()
const log =  function log(msg: any) {
    if(typeof msg !== "string") {
        msg = JSON.stringify(msg)
    }

    msg = "\n" + JSON.stringify({msg: msg, time: date.getTime()})

    fs.appendFile(logFile, msg, (err)=> {
        if (err) throw err
    })
}

const del = function deleteFile() {
    fs.exists(logFile, (exists)=> {
        if(exists)
        fs.unlink(logFile, err=> {
            if(err) throw err
        })
    })
}

export {log, del}