// simple logger so i can just read a file instead of cluttering the console

import * as fs from "fs"
const logFile = "log.txt"

let date = new Date()

class Logger {
    debug: boolean = false
    log(msg: any, append?: boolean) {
        if(this.debug) {
            if(typeof msg !== "string") {
                msg = JSON.stringify(msg)
            }
        
            if(append) {
                msg = JSON.stringify({msg: msg, time: date.getTime()})
            }
            else {
                msg = "\n" + JSON.stringify({msg: msg, time: date.getTime()})
            }
        
        
            fs.appendFile(logFile, msg, (err)=> {
                if (err) throw err
            })
        }
    }
    
    del() {
        fs.exists(logFile, (exists)=> {
            if(exists)
            fs.unlink(logFile, err=> {
                if(err) throw err
            })
        })
    }
}

export const logger = new Logger()
