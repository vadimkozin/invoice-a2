const fs = require('fs-extra')
const path = require('path')
const db = require('./db')
const error = require('./error')
const getCostInWords = require('./cost-in-words')
const acnt = require('./account-utils')

// услуги
const IServices = {
  name: '', // назание услуги, например, Услуги внутризоновой связи [за август 2021 года]
  cost: 0, // стомость (без НДС)
  nds: 0, // НДС
}

// опции для "особой" СФ
const IInvoiceOpts = {
  fioDirector: '', //  директор
  fioAccountant: '', // бухгалтер
  signDirector: [], // техт `По доверенности .. для директора`
  signAccountant: [], // техт `По доверенности .. для бухгалтера`
  unitCode: '', // графа 2 в СФ
  unitSym: '', // графа 2a в СФ
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
  specialOptions: null, // у клиента могут быть особенные "причуды"
  actExecuter: '', // исполнитель для Акта
  invoiceExecuter: '', // исполнитель для СФ
  invoice: IInvoiceOpts, // доп.данные для СФ
  account: {}, // types.IAccount, // все данные для Счёта
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

// Возвращает основание для Акта
const getActBasis = (customerId, trafficType, actBasisVZ) => {
  const getText = (dogNumber, dogDate) => {
    return !(dogNumber && dogDate) ? '' : `Договор № ${dogNumber} от ${dogDate} г.`
  }

  const customer = getCustomer(customerId)

  let basis =
    trafficType === '5' // ВЗ ?
      ? getText(customer.dogNumberVz, customer.dogDateVz)
      : getText(customer.dogNumberMg, customer.dogDateMg)

  if (!basis) {
    basis = trafficType === '5' ? actBasisVZ : '8C'
  }

  return basis
}

const getNameOutputFile = (path, period, customer, typeTraf = '??', typeDoc = '??') => {
  return `${path}/${period}_${customer.nameShort}__${typeTraf}_${typeDoc}.pdf`
}

const padStart = (str, maxLength, fillString) => {
  return String(str).padStart(maxLength, fillString)
}

// 8C#ЁЗС2811 --> 8C
const getPartDocNumber = (docNumber, divider = '#') => docNumber.split(divider)[0]

// 3, 4, 5 --> mg, mn, vz
const getTrafficSymbol = (trafficType) => db.TrafficCodeToSymbolMap[trafficType].toLowerCase()

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

// возвращает текст `По доверенности..`
const getTextAttorney = (executer) => `по доверенности № ${executer.attorneyNumber} от ${executer.attorneyDate}г`

// возвращает подпись(и)
const getSignature = (opts, trafficType) => {
  const result = []
  const trafficTypeSymbol = getTrafficSymbol(trafficType) // mg, mn, vz

  // vz: [доверенность по ВЗ]
  // mg: [доверенность по МГ, доверенность по ВЗ]
  if (trafficTypeSymbol === 'vz') {
    result.push(getTextAttorney(opts['vz']))
  } else if (['mg', 'mn'].includes(trafficTypeSymbol)) {
    result.push(getTextAttorney(opts['mg']))
    result.push(getTextAttorney(opts['vz']))
  }

  return result
}

// возвращает исполнителя (fio)
const getExecuterFio = (opts, trafficType) => {
  const trafficTypeSymbol = getTrafficSymbol(trafficType) // mg, mn, vz
  const executer = opts[trafficTypeSymbol]
  return executer.fio
}

// возвращает исполнителя c подписями
const getExecuterSign = (opts, trafficType) => {
  const result = []

  result.push(getExecuterFio(opts, trafficType))
  result.push(...getSignature(opts, trafficType))

  return result
}

// возвращает опции для заполнения документа 'особого' клиента
const getSpecial = ({ what = 'actBasis', opts, trafficType }) => {
  let result = []

  const trafficTypeSymbol = getTrafficSymbol(trafficType)
  const executer = opts.executer[trafficTypeSymbol]
  const accountant = opts.accountant[trafficTypeSymbol]

  switch (what) {
    // case 'actBasis': // основание для Акта
    //   result.push(opts.actBasis[trafficTypeSymbol])
    //   break

    case 'actExecuter': // исполнитель для "особого" Акта
      // vz: [fio, доверенность по ВЗ]
      // mg: [fio, доверенность по МГ, доверенность по ВЗ]
      result.push(executer.fio)

      if (trafficTypeSymbol === 'vz') {
        result.push(getTextAttorney(executer))
      } else if (['mg', 'mn'].includes(trafficTypeSymbol)) {
        result.push(getTextAttorney(executer))
        result.push(getTextAttorney(opts.executer['vz']))
      }
      break

    case 'invoice': // опции для "особой" СФ
      const invoice = Object.assign({}, IInvoiceOpts)

      invoice.fioDirector = executer.fio
      invoice.fioAccountant = accountant.fio

      invoice.unitCode = opts.invoice.unit.code
      invoice.unitSym = opts.invoice.unit.sym

      invoice.signDirector.push[executer.fio]
      invoice.signAccountant.push[accountant.fio]

      if (trafficTypeSymbol === 'vz') {
        invoice.signDirector.push(getTextAttorney(executer))
        invoice.signAccountant.push(getTextAttorney(executer))
      } else if (['mg', 'mn'].includes(trafficTypeSymbol)) {
        invoice.signDirector.push(getTextAttorney(opts.executer['mg']))
        invoice.signDirector.push(getTextAttorney(opts.executer['vz']))
        invoice.signAccountant.push(getTextAttorney(opts.accountant['mg']))
        invoice.signAccountant.push(getTextAttorney(opts.accountant['vz']))
      }

      return invoice

    default:
      break
  }

  return result
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
 * @returns [result, totalSum, errors]:
 *          result-Объект - готовые к выводу данные (ключи объекта - customerId)
 *          totalSum - общая сумма по всем клиентам из result
 *          errors - [] или [ошибки], ошибки в виде текста, можно выводить в консоль
 */
const prepareData = (data) => {
  // проверка данных
  verificationDataStruct(data, db.requiredKeysInData)
  verificationDataValues(data)

  const d = IData
  const result = {}
  const services = []
  let totalSum = 0
  const errors = []

  for (let i = 0; i < data.length; i++) {
    // data.forEach((v) => {
    const v = data[i]
    d.customerId = v.customer_id
    d.docNumber = v.doc_name
    d.docDate = v.doc_date
    d.trafficType = v.traffic_type
    ;[d.year, d.month, d.day] = getYearMonthDay(d.docDate)
    d.date = getDate(d.year, d.month, d.day)
    d.customer = getCustomer(d.customerId)
    if (!d.customer) {
      const msg = `Warning: There is no information about the client with customerId:${d.customerId} (bill_name: ${v.bill_name})`
      errors.push(msg)
      continue
    }

    d.operator = getOperator(d.trafficType)
    d.executer = getExecuter()
    d.accountant = getAccountant()
    d.currencyName = db.currencyName
    d.actBasis = getActBasis(d.customerId, d.trafficType, db.actBasisVZ)
    // d.actExecuter = [`${d.executer.fio} ${getTextAttorney(d.executer)}`]
    d.actExecuter = getExecuterSign(db.executer2, d.trafficType)
    d.invoiceExecuter = d.actExecuter

    d.invoice = {
      fioDirector: getExecuterFio(db.executer2, d.trafficType),
      fioAccountant: getExecuterFio(db.executer2, d.trafficType),
      signDirector: getSignature(db.executer2, d.trafficType),
      signAccountant: getSignature(db.executer2, d.trafficType),
      unitCode: db.invoice.unit.code,
      unitSym: db.invoice.unit.sym,
    }

    d.specialOptions = d.customerId in db.specialCustomers ? db.specialCustomers[d.customerId] : null

    if (d.specialOptions) {
      const opts = d.specialOptions
      const trafficType = d.trafficType
      d.actExecuter = getSpecial({ what: 'actExecuter', opts, trafficType })
      d.invoice = getSpecial({ what: 'invoice', opts, trafficType })
    }

    services.push({
      customerId: d.customerId,
      service: getService(d.year, d.month, d.trafficType, v.summ_rub),
    })

    d.procentNDS = getProcentNDS()
    result[v.customer_id] = Object.assign({}, d)

    totalSum += transformStringToNumber(v.summ_rub)
  }

  const customersIds = Object.keys(result).sort()

  customersIds.forEach((cid) => {
    // все услуги клиента
    const sericesByCustomer = services.filter((v) => v.customerId === cid)
    result[cid].services = sericesByCustomer

    // общая сумма клиента
    const price = sericesByCustomer.reduce((a, b) => a + b.service.cost, 0)
    const nds = round(getNDS(price))
    const total = round(price + nds)

    result[cid].totalCost = price
    result[cid].totalCostNDS = nds
    result[cid].totalSum = total
    result[cid].totalSumWords = getCostInWords(total)

    // данные для выставления Счёта
    result[cid].account = acnt.getAccountData(cid, result[cid])
  })

  return [result, totalSum, errors]
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
