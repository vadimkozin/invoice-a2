const XLSX = require('xlsx')

/**
 * Получает csv из xls
 * @param {string} filename - имя файла (xls)
 * @param {number} sheetNumber - номер листа (по умолчанию - первый)
 * @param {string} fieldSeparator - разделитель полей в csv-строках
 * @return {array} массив объектов
 */
// const makeCsvFromXls = (filename, sheetNumber = 0, fieldSeparator = ';') => {
const makeCsvFromXls = (cfg) => {
  return new Promise((resolve, reject) => {
    try {
      const wb = XLSX.readFile(cfg.filename)
      const sheetNumber = cfg.sheetNumber ? cfg.sheetNumber : 0
      const sheetName = wb.SheetNames[sheetNumber]
      const csv = XLSX.utils.make_csv(wb.Sheets[sheetName], { FS: cfg.fieldSeparator })
      const result =  makeArrayObjectFromCsv(csv, cfg.fieldSeparator)
      resolve(result)
    } catch (e) {
      reject (e)
    }
  })
}

/**
 * Преобразует строку с csv-данными в массив объектов
 * @param {string} csv csv-данные (csv-строки разделены '\n')
 * @param {string} fieldSeparator - разделитель полей в csv-строках
 * @returns: {array} [{k1: v1, k2: v2,..}, {},..]
 */
function makeArrayObjectFromCsv(csv, fieldSeparator) {
  const data = csv.split('\n')
  const array = []

  // первая строка содержит ключи
  const keys = data[0].split(fieldSeparator)

  data.slice(1).forEach((row) => {
    if (row.length > 0) {
      const values = row.split(fieldSeparator)
      const obj = {}
      values.forEach((v, i) => {
        obj[keys[i]] = v
      })
      array.push(obj)
    }
  })

  return array
}

module.exports = {
  makeCsvFromXls,
}
