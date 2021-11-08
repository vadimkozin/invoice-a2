const fs = require('fs')
const path = require('path')
const archiver = require('archiver')
const fn = require('./func')

/**
 * Сжатие директории с файлами
 * @param {string} directory  -  директория для сжатия
 * @param {string} outputFile  -  файл с результатом
 * @param {invoice Logger} logger  -  экземпляр логгера
 * @return {Promise}
 */
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

module.exports = {
  compressDirectory,
}
