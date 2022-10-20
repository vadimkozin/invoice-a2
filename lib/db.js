// модуль - заменитель DB
// ---------------------------------------
// адреса почты для отправки результата
// const emails = ['otrofimova@a2tele.com']
const emails = ['vkozin@a2tele.com']

const ooo = () => 'Общество с ограниченной ответственностью'
const ano = () => 'Автономная некоммерческая организация'
const pkk = () => 'Представительство Коммерческой компании'
const bvo = () => 'Британские Виргинские острова'

// номер и дата договора для ВЗ по умолчанию (используется в Акте)
const dogNumberVz = '27418/5'
const dogDateVz = '01.12.2012'

// Клиенты
// prettier-ignore
const customers = {
  "28956": {type: 'f', nameShort: 'Бегляров_ЮА', name: 'Бегляров Юрий Альбертович', nameFull: 'Бегляров Юрий Альбертович', inn: '', kpp: '', address: '...', dogNumberMg: '', dogDateMg: null, dogNumberVz, dogDateVz},
  "28962": {type: 'u', nameShort: 'Фолио-авто', name: 'ООО «Фолио-авто»', nameFull: `${ooo()} «Фолио-авто»`, inn: '7705339860', kpp: '770501001', address: '119049, г. Москва, 1-ый Добрынинский пер., дом № 15/7', dogNumberMg: '', dogDateMg: null, dogNumberVz, dogDateVz},
  "28965": {type: 'f', nameShort: 'Агуреев_АН', name: 'Агуреев Александр Николаевич', nameFull: `Агуреев Александр Николаевич`, inn: '', kpp: '', address: '...', dogNumberMg: '', dogDateMg: null, dogNumberVz, dogDateVz},
  "28967": {type: 'u', nameShort: 'Пойнт_Пассат', name: 'ООО «Пойнт Пассат»', nameFull: `${ooo()} «Пойнт Пассат»`, inn: '7727220604', kpp: '771501001', address: 'г. Москва, ул. Б. Новодмитровская, д.23, стр.3, этаж 6, пом.I, оф.20', dogNumberMg: '', dogDateMg: null, dogNumberVz, dogDateVz},
  "28973": {type: 'u', nameShort: 'Геокс_Рус', name: 'ООО «Геокс Рус»', nameFull: `${ooo()} «Геокс Рус»`, inn: '7718813164', kpp: '771501001', address: '127015, г. Москва, ул. Б.Новодмитровская, дом № 23, строение 3', dogNumberMg: '', dogDateMg: null, dogNumberVz, dogDateVz},
  "28984": {type: 'u', nameShort: 'Зиландия', name: 'ООО «Зиландия»', nameFull: `${ooo()} «Зиландия»`, inn: '5044080919', kpp: '504401001', address: '141421, Московская область, Солнечногорский район, д. Елино, ул.Зеленоградская, стр.1', dogNumberMg: '', dogDateMg: null, dogNumberVz, dogDateVz},
  "28987": {type: 'u', nameShort: 'Красноярскгазпром', name: 'ООО «Красноярскгазпром нефтегазпроект»', nameFull: `${ooo()} «Красноярскгазпром нефтегазпроект»`, inn: 'inn', kpp: 'kpp', address: '...', dogNumberMg: '', dogDateMg: null, dogNumberVz, dogDateVz},
  "29005": {type: 'u', nameShort: 'Соушиал_Дискавери', name: 'ООО «Соушиал Дискавери Инжиниринг»', nameFull: `${ooo()} «Соушиал Дискавери Инжиниринг»`, inn: '7714969160', kpp: '771401001', address: '127083, г. Москва, ул. 8 Марта, дом 1, строение 12, помещение LII', dogNumberMg: '', dogDateMg: null, dogNumberVz, dogDateVz},
  "29006": {type: 'u', nameShort: 'ТК_Корвет', name: 'ООО «ТК Корвет»', nameFull: `${ooo()} «ТК Корвет»`, inn: '7720783950', kpp: '772001001', address: '111402 г.Москва, ул.Кетчерская, д.10', dogNumberMg: '', dogDateMg: null, dogNumberVz, dogDateVz},
  "29007": {type: 'u', nameShort: 'Хайлон-Рус', name: 'ООО «ТД Хайлон-Рус»', nameFull: `${ooo()} «ТД Хайлон-Рус»`, inn: '7713765710', kpp: '773601001', address: '119331, г. Москва, Проспект Вернадского, д. 29', dogNumberMg: '', dogDateMg: null, dogNumberVz, dogDateVz},
  "29008": {type: 'u', nameShort: 'Континент', name: 'ООО «Континент»', nameFull: `${ooo()} «Континент»`, inn: '2374000391', kpp: '237201001', address: '352915, Краснодарский край, г. Армавир, улица Кропоткина, дом 387', dogNumberMg: '', dogDateMg: null, dogNumberVz, dogDateVz},
  "29011": {type: 'u', nameShort: 'Редакция_Парл_тел', name: 'АНО «Редакция Парламентского телевидения Государственной Думы Федерального Собрания Российской Федерации»', nameFull:`${ano()} «Редакция Парламентского телевидения Государственной Думы Федерального Собрания Российской Федерации»`, inn: '9710033173', kpp: '771001001', address: '103265, г. Москва, ул. Охотный Ряд, дом 1', dogNumberMg: '8C#ЁЗХ2', dogDateMg:'22.07.2020', dogNumberVz: '29011', dogDateVz: '22.07.2020'},
  "28970": {type: 'u', nameShort: 'ФинЮрКонсалтинг', name: 'ООО «ФинЮрКонсалтинг»', nameFull: `${ooo()} «ФинЮрКонсалтинг»`, inn: '7702707107', kpp: '771501001', address: '127015, г.Москва, ул.Б.Новодмитровская, д.23, стр.3,этаж 6, пом. I, ком 18', dogNumberMg: '', dogDateMg: null, dogNumberVz, dogDateVz},
  "28993": {type: 'u', nameShort: 'ЭйДжиАльянс', name: 'ООО «Эй Джи альянс"»', nameFull: `${ooo()} «Эй Джи альянс»`, inn: '5001094882', kpp: '500101001', address: '143900, Московская область, г.Балашиха, ул.Свердлова, д.26, пом.IIБ', dogNumberMg: '', dogDateMg: null, dogNumberVz, dogDateVz},
  "29013": {type: 'u', nameShort: 'НеметонГрупЛтд', name: '«НЕМЕТОН ГРУП ЛТД.»', nameFull: `${pkk()} «НЕМЕТОН ГРУП ЛТД.» (${bvo()})`, inn: '9909400972', kpp: '774751001', address: '127083, г. Москва, ул. 8 Марта, д. 1, корп. 12, оф. 2', dogNumberMg: '', dogDateMg: null, dogNumberVz: '29013', dogDateVz: '01.07.2022'},

}

const a2 = {
  name: 'OOO «A2»',
  bank: 'АО «Aльфа-Банк»',
  bik: '044525593',
  kpp: '772801001',
  inn: '7728628139',
  kaccount: '30101810200000000593',
  account: '40702810102620001081',
}

// оператор услуг МГ/МН
const operatorMg = {
  name: 'Публичное акционерное общество «Вымпел-Коммуникации»',
  nameShort: 'ПАО «ВымпелКом»',
  address: '127083, г. Москва, ул. Восьмого марта, дом 10, строение 14',
  inn: '7713076301',
  kpp: '997750001',
}

// оператор услуг ВЗ
const operatorVz = {
  name: 'Общество с ограниченной ответственностью «ВЕСТ КОЛЛ ЛТД»',
  nameShort: 'ООО «ВЕСТ КОЛЛ ЛТД»',
  address: '107023, г. Москва, Семеновская площадь, д. 1А',
  inn: '7702388235',
  kpp: '771901001',
}

// оператор услуг ВЗ
const operatorMts = {
  name: 'Публичное акционерное общество «Мобильные ТелеСистемы»',
  nameShort: 'ПАО «МТС»',
  address: '109147, г. Москва, ул.Марксистская, д. 4',
  inn: '7740000076',
  kpp: '997750001',
}

// отображение названия файла на символьное обозначение типа трафика
const NameFileToSymbolMap = {
  intrazone: 'vz',
  longdistance: 'mg',
}

// отображение кода трафика на символьное обозначение
const TrafficCodeToSymbolMap = {
  3: 'mg',
  4: 'mn',
  5: 'vz',
}

// отображение кода трафика на оператора
const TrafficCodeToOperatorMap = {
  3: operatorMg,
  4: operatorMg,
  5: operatorVz,
}

// отображение символьноко кода трафика на оператора
const TrafficSymbolToOperatorMap = {
  mg: operatorMg,
  mn: operatorMg,
  vz: operatorVz,
}

// отображение кода тарифа на текст услуги
const TrafficCodeToServiceMap = {
  3: 'Услуги междугородной связи за',
  4: 'Услуги международной связи за',
  5: 'Услуги внутризоновой связи за',
}

// отображение кода месяца на название месяца
const MonthDigitToNameMap = {
  1: 'январь',
  2: 'февраль',
  3: 'март',
  4: 'апрель',
  5: 'май',
  6: 'июнь',
  7: 'июль',
  8: 'август',
  9: 'сентябрь',
  10: 'октябрь',
  11: 'ноябрь',
  12: 'декабрь',
}

// отображение кода месяца на название месяца - отдельный случай (склонение)
const MonthDigitToNameCaseMap = {
  1: 'января',
  2: 'февраля',
  3: 'марта',
  4: 'апреля',
  5: 'мая',
  6: 'июня',
  7: 'июля',
  8: 'августа',
  9: 'сентября',
  10: 'октября',
  11: 'ноября',
  12: 'декабря',
}

// исполнитель 1
const executer = {
  fio: 'Трофимова О.А.', // для подписей по доверенности
  attorneyNumber: '16', // доверенность №
  attorneyDate: '31.07.2020', // доверенность Дата
}

// исполнитель 2
const executerVz = {
  fio: 'Петухов Н.А.', // для подписей по доверенности
  attorneyNumber: '16', // доверенность №
  attorneyDate: '31.07.2020', // доверенность Дата
}

const executerMg = {
  fio: 'Петухов Н.А.', // для подписей по доверенности
  attorneyNumber: 'ШК-20-145', // доверенность №
  attorneyDate: '10.02.2020', // доверенность Дата
}

// исполнитель 2 для всех кроме АНО Редакция(29011)
const executer2 = {
  vz: executerVz,
  mg: executerMg,
  mn: executerMg,
}

// исполнитель только для АНО Редакция(29011)
const executerSpecial = {
  vz: executerVz,
  mg: executerMg,
  mn: executerMg,
}

const invoice = {
  unit: {
    code: '362', // колонка 2 в СФ
    sym: 'мес', // колонка 2а в СФ
  },
}

const specialCustomers = {
  // АНО "Редакция парламентского телевидения .."
  29011: {
    executer: executerSpecial, // исполнитель
    accountant: executerSpecial, // бухгалтер
    actBasis: {
      vz: 'ВЗ', // основание в акте для ВЗ-связи
      mn: '8C', // основание в акте для МН-связи
      mg: '8C', // основание в акте для МГ-связи
    },
    sf: {
      // unitCode: '796', // графа 2 в СФ
    },
    invoice: {
      unit: {
        code: '362', // колонка 2 в СФ
        sym: 'мес', // колонка 2а в СФ
      },
    },
  },
}

// главный бухгалтер
const accountant = executer

// основание в Акте для ВЗ для всех по умолчанию если в customers не заведено значение для клиента в полях: dogNumberVz и dogDateVz
const actBasisVZ = 'Агент.ВЗ №27418/5 от 01.12.12г.'

const NDS = 20
const currencyName = 'Российский рубль, 643'

const emailTransport = {
  host: 'smtp.yandex.ru',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  nameFrom: 'obrabotka-400', // имя отправителя
}

// необходимые ключи(поля) в исходных данных
const requiredKeysInData = ['customer_id', 'doc_name', 'doc_date', 'traffic_type', 'summ_rub']

module.exports = {
  customers, // клиенты
  actBasisVZ, // основание для Акта ВЗ
  NDS, // НДС, 20%
  currencyName, // наименование валюты для СФ
  NameFileToSymbolMap, // отображение названия файла на символьное обозначение типа трафика
  TrafficCodeToSymbolMap, // отображенеи кода трафика на символьное обозначение
  TrafficCodeToOperatorMap, // отображение символьноко кода трафика на оператора
  TrafficCodeToServiceMap, // отображение кода тарифа на текст услуги
  MonthDigitToNameMap, // отображение цифры месяца на название
  MonthDigitToNameCaseMap, // отображение цифры месяца на название + склонение
  executer, // исполнитель
  executer2, // исполнитель 2
  accountant, // бухгалтер
  specialCustomers, // опции "особенных" клиентов
  emails, // адреса почты для отправки результата (2021_09_wc.zip)
  emailTransport, // настройки транспорта для почты
  requiredKeysInData, // необходимые ключи(поля) в исходных данных
  a2, // реквизиты A2
  invoice, // СФ - постоянные значения
}
