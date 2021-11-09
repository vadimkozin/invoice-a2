require('dotenv').config()
const fs = require('fs-extra')
const path = require('path')
const fn = require('./lib/func')
const file = require('./lib/file')
const act = require('./lib/act')
const invoice = require('./lib/invoice')
const Logging = require('./lib/logging').Logging
const arh = require('./lib/arhiver')
const mail = require('./lib/mail')
const xlsx = require('./lib/xlsx')
const error = require('./lib/error')
const opts = require('minimist')(process.argv.slice(2), {
  alias: { help: 'h', file: 'f', compress: 'c', send: 's', email: 'e' },
})

const nameProgramm = path.basename(process.argv[1])

const help = `Creating pdf documents (invoice, act) and sending the result by e-mail.
used: node ${nameProgramm} -f file.csv [-cs] [-e]
-f (--file)     name source file(csv) 
-c (--compress) compress result
-s (--send)     sending compress result by e-mail
-e (--email)    email recipient's address instead of the default address
example:
node ${nameProgramm} -f file.csv -cs --email=addr@mail.ru
`

global.appRoot = path.resolve(__dirname)
const pathResult = `${appRoot}/result`
const pathLog = `${appRoot}/log`
const pathZip = pathResult
const fileLog = `${pathLog}/invoice.log`

const log = new Logging(pathLog, fileLog)

const createDocuments = (result, cfg) => {
  const customersIds = Object.keys(result).sort()
  let totalDocuments = 0

  customersIds.forEach((cid) => {
    const it = result[cid]
    if (it.customer.type === 'u') {
      const typeTraf = fn.getTrafficSymbol(it.trafficType)
      // prettier-ignore
      const nameFileAct = fn.getNameOutputFile(cfg.storage, cfg.period, it.customer, typeTraf, 'act')
      act.createAct(it, nameFileAct)
      totalDocuments += 1
      // prettier-ignore
      const nameFileInvoice = fn.getNameOutputFile(cfg.storage, cfg.period, it.customer, typeTraf, 'invoice')
      invoice.createInvoice(it, nameFileInvoice)
      totalDocuments += 1
    }
  })

  return totalDocuments
}

const run = async (cfg, data) => {
  try {
    // подготовка данных
    const [result, totalSum] = fn.prepareData(data)

    // создание документов
    const totalDocs = createDocuments(result, cfg)
    log.add(
      `result: ${cfg.typeTraf.toUpperCase()}, total docs: ${totalDocs}, total sum: ${totalSum.toFixed(2)}`,
      true,
    )

    // сжатие
    if (opts.compress) {
      const { bytes } = await arh.compressDirectory(`${cfg.storage}/`, cfg.fileZip, log)
      log.add(`compress: ${path.basename(cfg.fileZip)}, ${fn.bytesToMb(bytes)} mb`, true)

      // отправка результата
      if (opts.send) {
        try {
          const { sendedTo, bytes } = await mail.sendEmail({ filename: cfg.fileZip, email: opts.email })
          log.add(`mail: ${sendedTo}, ${fn.bytesToMb(bytes)} mb`, true)
        } catch (e) {
          log.add(`error: ${e}`, true)
        }
        log.add('.', true)
      }
    }
  } catch (err) {
    if (err.code === 'ENOENT') {
      return log.add(`error: ${err.message}`, true)
    } else if (err instanceof error.ValidationError) {
      return log.add(`error: ${err.message}`, true)
    } else {
      log.add(err.stack, true)
      throw err
    }
  }
}

const main = async () => {
  log.add(`cmd: ${process.argv.slice(2).join(' ')}`)

  if (opts.help) {
    console.log(help)
  }

  if (!opts.file) {
    console.log(help)
  } else {
    log.add(`file: ${path.basename(opts.file)}`)
    const period = fn.getPeriodFromNameFile(opts.file) // 2021_09
    const typeTraf = fn.getTypeTrafficFromNameFile(opts.file) // mg | vz
    const periodTraf = `${period}_${typeTraf.toUpperCase()}` // 2021_09_VZ
    const storage = `${pathResult}/${periodTraf}` // ../result/2021_09_VZ/
    const fileZip = `${pathZip}/${periodTraf}_wc.zip` // ../result/2021_09_VZ_wc.zip

    const cfg = {
      filename: opts.file,
      period,
      typeTraf,
      storage,
      fileZip,
      sheetNumber: 0, // номер листа в xls-файле с данными, если исходым является xls-файл
      fieldSeparator: ';', // разделитель полей в csv-файле
    }

    try {
      fs.ensureDirSync(cfg.storage)

      const ext = fn.getFileExtension(opts.file).toLocaleLowerCase()

      if (ext === 'csv') {
        run(cfg, await file.readFileCsv(cfg))
      } else if (ext === 'xls' || ext === 'xlsx') {
        run(cfg, await xlsx.makeCsvFromXls(cfg))
      } else {
        log.add(`Неизвестное расширение файла: ${ext}`, true)
      }
    } catch (err) {
      if (err.code === 'ENOENT') {
        log.add(`error: ${err.message}`, true)
      } else {
        throw err
      }
    }
  }
}

process.on('uncaughtException', (err) => {
  log.add(`exception: ${err}`)
  console.error(err.message)
  process.exit(1)
})

main()
