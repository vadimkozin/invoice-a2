const fs = require('fs-extra')
const path = require('path')
const db = require('./db')
const error = require('./error')
const getCostInWords = require('./cost-in-words')

// услуги
const IServices = {
  name: '', // назание услуги, например, Услуги внутризоновой связи [за август 2021 года]
  cost: 0, // стомость (без НДС)
  nds: 0, // НДС
}

// данные для "формирования" документов: СФ, акта
const IData = {
  customerId: 0, // код клиента
  docNumber: '', // номер документа, например, B3289621781
  docDate: null, // дата документа, например, 2021-08-31
  trafficType: '', // 3|4|5 -> mg|mn|vz -> operator
  //
  year: 0, // год предоставления услуги (2021)
  month: 0, // месяц предоставления услуги (8)
  day: 0, // последний день месяца (31)
  date: '', // дата выставления СФ, акта ( 31 августа 2021 )
  customer: null, // инфо по customerId (ИНН, КПП, адрес, ..)
  operator: null, // инфо по вышестоящему оператору (зависит от trafficType)
  services: IServices, // список оказанных услуг со стоимостью (из исходных данных)
  executer: null, // инфо по исполнителю (для подписи)
  accountant: null, // инфо по главному бухгалтеру (для подписи)
  totalCost: 0, // общая сумма цифрами (без НДС)
  totalCostNDS: 0, // общий НДС
  totalSum: 0, // totalCost + totalCostNDS
  totalSumWords: '', // общая сумма с НДС прописью
  actBasis: '', // основание для Акта
  currencyName: '', // наименованеи валюты для СФ
  procentNDS: 0, // НДС в % (20)
}

const round = (cost, fixed = 2) => Number(cost.toFixed(fixed))
const getNDS = (cost) => (cost * db.NDS) / 100
const getProcentNDS = () => db.NDS
const getCustomer = (customerId) => db.customers[customerId]
const getOperator = (trafficType) => db.TrafficCodeToOperatorMap[trafficType]
const getExecuter = () => db.executer
const getAccountant = () => db.accountant
const trimFirstZero = (str) => str.replace(/^0/, '')
const transformStringToNumber = (str) => Number(str.replace(',', '.'))
const getNameOutputFile = (path, period, customer, typeTraf = '??', typeDoc = '??') => {
  return `${path}/${period}_${customer.nameShort}__${typeTraf}_${typeDoc}.pdf`
}
const padStart = (str, maxLength, fillString) => {
  return String(str).padStart(maxLength, fillString)
}

// 8C#ЁЗС2811 --> 8C
const getPartDocNumber = (docNumber, divider = '#') => docNumber.split(divider)[0]

// 3, 4, 5 --> mg, mn, vz
const getTrafficSymbol = (trafficType) => db.TrafficCodeToSymbolMap[trafficType].toUpperCase()

// '08/31/2021' --> [2021, 8, 31]
const getYearMonthDay = (date) => {
  const s = date.split('/') // date = 08/31/2021
  return [s[2], trimFirstZero(s[0]), trimFirstZero(s[1])] // [2021, 8, 31]
}

// 2021, 9, '3', 123.56  --> {name: 'Услуги междугородной связи за сентябрь 2021 года', cost:123.56, nds:xx, sum:xx}
const getService = (year, month, trafficType, costStr) => {
  const service = db.TrafficCodeToServiceMap[trafficType]
  const period = db.MonthDigitToNameMap[month] + ` ${year} года`
  const name = `${service} ${period}`
  const cost = transformStringToNumber(costStr)
  const nds = round(getNDS(cost))
  const sum = cost + nds

  return { name, cost, nds, sum }
}

// 2021, 8, 31 --> 31 августа 2021 г.
const getDate = (year, month, day) => {
  return `${day} ${db.MonthDigitToNameCaseMap[month]} ${year} г.`
}

const isAN = (value) => {
  if (value instanceof Number) {
    value = value.valueOf() // Если это объект числа, то берём значение, которое и будет числом
  }

  return isFinite(value) && value === parseInt(value, 10)
}

// подсчёт количества символа symb в строке str
const getCountSymbolInString = (str, symb) => {
  let count = -1
  for (let index = 0; index != -1; count++, index = str.indexOf(symb, index + 1));
  return count
}

/*
  # Cтрока из файла:
  customer_id: '29007',
  bill_name: 'ООО «ТД Хайлон-Рус»',
  sov_contnum: '8C#ЁЗС2',
  doc_name: '8C#ЁЗС2811',
  doc_date: '08/31/2021',
  traffic_type: '4',
  summ_min: '12',
  summ_rub: '153,86'
*/
/**
 * Проверка структуры данных - всех объектов в массиве на наличие в объекте необходимых ключей
 * @param {array objects} data
 * @param {array} keys - массив необходимых ключей
 * @returns {boolean} true| false - все есть ключи или нет в data
 */
const verificationDataStruct = (data, keys) => {
  const isOk = data.every((it) => {
    current = Object.keys(it)
    return keys.every((k) => current.includes(k))
  })

  if (!isOk) {
    throw new error.DataStructError(keys)
  }
}

const verificationDataValues = (data) => {
  const re = {
    customer_id: /^\d{1,}$/, // '29007' or '1'
    doc_name: /^.{3,}$/, // '8C#ЁЗС2811' or '123'
    doc_date: /^\d{2}[/-]\d{2}[/-]\d{4}$/, // '08/31/2021' or '08-31-2021'
    traffic_type: /^\d{1}$/, // 3,4,5
    summ_rub: /^\d{1,}$|^\d{1,}[.,]\d{1,}$/, // 18 or 153,86 or 153.86
  }

  for (let i = 0; i < data.length; i++) {
    const item = data[i]
    for (let [key, value] of Object.entries(item)) {
      if (key in re && !re[key].test(value)) {
        throw new error.PropertyValueError(key, value)
      }
    }
  }
}

/**
 * Подготовка данных перед выводом в pdf-формате
 * @param {Array} data - массив объектов с исходными данными (формат - см.выше)
 * @returns Объект - готовые к выводу данные (ключи объекта - customerId)
 */
const prepareData = (data) => {
  // проверка данных
  verificationDataStruct(data, db.requiredKeysInData)
  verificationDataValues(data)

  const d = IData
  const result = {}
  const services = []
  let totalSum = 0

  data.forEach((v) => {
    d.customerId = v.customer_id
    d.docNumber = v.doc_name
    d.docDate = v.doc_date
    d.trafficType = v.traffic_type
    ;[d.year, d.month, d.day] = getYearMonthDay(d.docDate)
    d.date = getDate(d.year, d.month, d.day)
    d.customer = getCustomer(d.customerId)
    d.operator = getOperator(d.trafficType)
    d.executer = getExecuter()
    d.accountant = getAccountant()
    d.actBasis = d.trafficType === '5' ? db.actBasisVZ : getPartDocNumber(d.docNumber)
    d.currencyName = db.currencyName

    services.push({
      customerId: d.customerId,
      service: getService(d.year, d.month, d.trafficType, v.summ_rub),
    })

    d.procentNDS = getProcentNDS()
    totalSum += transformStringToNumber(v.summ_rub)
    result[v.customer_id] = Object.assign({}, d)
  })

  const customersIds = Object.keys(result).sort()

  customersIds.forEach((cid) => {
    // все услуги клиента
    const sericesByCustomer = services.filter((v) => v.customerId === cid)
    result[cid].services = sericesByCustomer

    // общая сумма
    const price = sericesByCustomer.reduce((a, b) => a + b.service.cost, 0)
    const nds = round(getNDS(price))
    const total = round(price + nds)

    result[cid].totalCost = price
    result[cid].totalCostNDS = nds
    result[cid].totalSum = total
    result[cid].totalSumWords = getCostInWords(total)
  })

  return [result, totalSum]
}

async function createDirectory(directory) {
  try {
    await fs.ensureDir(directory)
    // console.log('success!')
  } catch (err) {
    console.error(err)
  }
}

// возвращает период из имени файла
// westcall-intrazone-2021-09.csv --> 2021_09
const getPeriodFromNameFile = (str) => {
  const result = str.match(/(\d{4}-\d{2})/)
  return result ? result[1].replace('-', '_') : null
}

// westcall-intrazone-2021-09.csv --> vz
// westcall-longdistance-2021-09.csv --> mg
const getTypeTrafficFromNameFile = (str) => {
  const result = str.match(/(intrazone|longdistance)/)
  return result ? db.NameFileToSymbolMap[result[1]] : null
}

const bytesToMb = (bytes) => (bytes / (1024 * 1024)).toFixed(2)

// возвращает расширение файла или undefined если расширения нет
const getFileExtension = (filename) => {
  const re = /(?:\.([^.]+))?$/
  return re.exec(path.basename(filename))[1]
}

module.exports = {
  round,
  getNDS,
  getCustomer,
  getOperator,
  getExecuter,
  getAccountant,
  prepareData,
  getDate,
  getNameOutputFile,
  getTrafficSymbol,
  padStart,
  createDirectory,
  isAN,
  getCountSymbolInString,
  getPeriodFromNameFile,
  getTypeTrafficFromNameFile,
  bytesToMb,
  getFileExtension,
}