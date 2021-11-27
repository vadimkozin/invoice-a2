const db = require('./db')
const types = require('./types')

/**
 * Возвращает объект с данными для выставления Счёта
 *
 * @param {*} customerId код клиента
 * @param {*} data объект с общими данными
 */
const getAccountData = (customerId, data) => {
  const account = Object.assign({}, types.IAccount)

  account.recipient = db.a2
  account.provider = data.operator

  const { name, inn, kpp, address, dogNumberMg, dogDateMg, dogNumberVz, dogDateVz } = db.customers[customerId]

  account.customer = { name, inn, kpp, address, dogNumberMg, dogDateMg, dogNumberVz, dogDateVz }

  // console.log(account.customer);
  
  account.document.number = data.docNumber
  account.document.date = data.docDate

  account.isContractPrint = true
  account.contract.number = '12345'
  account.contract.date = '29.01.2021'
  account.contract.period.start = '01-10-21'
  account.contract.period.end = '31-10-21'

  data.services.forEach((v) => {
    const { name, cost, nds, sum } = v.service
    const item = { cid: v.customerId, name, quantity: 1, unit: 'мес', price: sum, sum, nds }
    account.services.push(item)
  })

  account.total.sum = data.totalSum
  account.total.nds = data.totalCostNDS // ?
  account.total.sumWords = data.totalSumWords
  account.director.fio = data.executer.fio
  account.director.attorney.number = data.executer.attorneyNumber
  account.director.attorney.date = data.executer.attorneyDate

  account.accountant = account.director

  // console.log(`___account::: `, account)
  return account
}

module.exports = {
  getAccountData,
}
