const fs = require('fs-extra')
const csv = require('csv-parser')
const stripBom = require('strip-bom-stream')

/**
 * Чтение файла (csv) с данными
 * @param {string} fileName полный путь к файлу
 * @param {function} cb - callback(err, data) для дальнейшей обработки полученных данных
 */
const readFileCsv__1 = (fileName, cb) => {
  const results = []
  fs.createReadStream(fileName)
    .on('error', (err) => cb(err, null))
    .pipe(stripBom())
    .pipe(csv({ separator: ';' }))
    .on('data', (data) => results.push(data))
    .on('end', () => cb(null, results))
}

/**
 * Чтение файла (csv) с данными
 * @param {string} fileName полный путь к файлу
 * @param {object} cfg = {filename, period, storage}
 * @param {function} cb - callback(err, data) для дальнейшей обработки полученных данных
 */
const readFileCsv__2 = (cfg, cb) => {
  const results = []
  fs.createReadStream(cfg.filename)
    .on('error', (err) => cb(err, cfg, null))
    .pipe(stripBom())
    .pipe(csv({ separator: ';' }))
    .on('data', (data) => results.push(data))
    .on('end', () => cb(null, cfg, results))
}

/**
const compressDirectory = (directory, outputFile, logger) => {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outputFile)

    output.on('end', resolve)
    output.on('close', () => {
      resolve({ bytes: archive.pointer() })
    })

    const archive = archiver('zip', { zlib: { level: 9 } })
    archive.on('error', reject)
    archive.on('warning', logger.add)
    archive.pipe(output)

    archive.directory(directory, false).finalize()
  })
}
/**
 * Чтение файла (csv) с данными
 * @param {string} fileName полный путь к файлу
 * @param {object} cfg = {filename, period, storage}
 * @return {Promise} промис
 */
const readFileCsv = (cfg) => {
  return new Promise((resolve, reject) => {
    const results = []
    fs.createReadStream(cfg.filename)
      .on('error', reject)
      .pipe(stripBom())
      .pipe(csv({ separator: ';' }))
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
  })
}

module.exports = {
  readFileCsv,
}
