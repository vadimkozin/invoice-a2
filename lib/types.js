const IOrganization = {
  name: '',
  inn: '',
  kpp: '',
  address: '',
  get textOrganization() {
    return `ИНН ${this.inn}, КПП ${this.kpp}, ${this.name}, ${this.address}`
  },
}

const IService = {
  name: '',
  quantity: 0,
  unit: '',
  price: 0,
  sum: '',
}

const IPeriod = {
  start: null,
  end: null,
}

const IDocument = {
  number: '',
  date: null,
  get textDocument() {
    return `CЧЁТ на оплату № ${this.number} от ${this.date}`
  },
}

const IContract = {
  number: '',
  date: null,
  period: IPeriod,
  get textContractPeriod() {
    return `Услуги связи согласно договора № ${this.number} от ${this.date} за период с ${this.period.start} по ${this.period.end}`
  },
}

const IManager = {
  fio: '',
  attorney: {
    number: '',
    date: null,
  },
  get textAnnorney() {
    return `По доверенности № ${this.attorney.number} от ${this.attorney.date}`
  },
}

// Счёт
const IAccount = {
  // получатель
  recipient: { name: '', bank: '', inn: '', bik: '', kpp: '', account: '', kaccount: '' },

  provider: IOrganization, // поставщик
  customer: IOrganization, // покупатель

  document: IDocument, // Счёт ... за ...
  isContractPrint: false, // Печать "Услуги по договору.. " в таблице "Товары(работы, услуги)"
  contract: IContract, // услуги по договору .. за период ..

  // массив услуг IService
  services: [],

  // итого
  total: { sum: 0, nds: 0, sumWords: '' },

  director: IManager, // директор
  accountant: IManager, // бухгалтер
}

/*
const org = IOrganization
org.name = 'ПАО МТС'
org.inn = '12345'
org.kpp = '6789'
org.address = 'Кривоколенный 5'

console.log(org.textOrganization)

const manager = IManager
manager.fio = 'Иванов'
manager.attorney.number = '234/bis'
manager.attorney.date = '21-11-2021'
console.log(manager.textAnnorney)

const document = IDocument
document.number = 'A2-295'
document.date = '31-10-2021'
console.log(document.textDocument)

const account = IAccount
account.document.doc.number = 'A2-295'
account.document.doc.date = '31 октября 2021'
account.document.period.start = '01-10-21'
account.document.period.end = '31-10-21'

console.log(account.document.textDocumAbout)
*/

module.exports = {
  IAccount,
  IOrganization,
  IManager,
  IDocument,
}
