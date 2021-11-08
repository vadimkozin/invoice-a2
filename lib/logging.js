const fs = require('fs-extra')

class Logging {
  constructor(path, filename) {
    this.filename = filename
    fs.ensureDirSync(path)
  }

  add(message, outConsole = false) {
    if (outConsole) {
      console.log(message)
    }
    const txt = `${this._getDate()} ${message}\n`
    fs.appendFileSync(this.filename, txt)
  }

  _getDate() {
    const addz = (value) => String(value).padStart(2, '0') // 7 -> '07'

    const today = new Date()
    const yyyy = today.getFullYear()
    const mm = addz(today.getMonth() + 1)
    const dd = addz(today.getDate())
    const hh = addz(today.getHours())
    const nn = addz(today.getMinutes())
    const ss = addz(today.getSeconds())

    return `${yyyy}-${mm}-${dd} ${hh}:${nn}:${ss}`
  }
}

module.exports.Logging = Logging
