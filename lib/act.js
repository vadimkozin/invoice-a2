const { jsPDF } = require('jspdf')
const pdf = require('./pdf-lib')

/**
 * Создание Акта
 * @param {object} data - объект с данными (IData - см. func.js) для формируемого акта
 * @param {string} nameFile - имя файла для результата
 */
const createAct = (data, nameFile) => {
  const widthArea = 180 // ширина документа
  const nameOffsetY = 10 // смещение по Y для строк: исполнитель, заказчик, основание
  const nameOffsetX = 25 // смещение по X для зачений :исполнитель, заказчик, основание
  const addRowY = 5 // прирост по Y для каждой дополнительной строки для 'длинных' строк
  const adding = {
    // дополнительное смещение по Y для 'длинного' названия:
    operator: 0, // -- Оператора
    customer: 0, // -- Заказчика
  }

  const [xb, yb] = [10, 10] // точка отсчёта

  console.log(nameFile)

  const doc = new jsPDF({ putOnlyUsedFonts: true })
  doc.addFont('./fonts/PT_Sans-Web-Regular.ttf', 'PT_Sans-Web-Regular', 'normal')
  doc.addFont('./fonts/PT_Sans-Web-Bold.ttf', 'PT_Sans-Web-Bold', 'normal')

  pdf.printText({
    doc,
    text: `Акт № ${data.docNumber} от ${data.date}`,
    x: xb,
    y: yb,
    fontSize: 12,
    fontName: 'PT_Sans-Web-Bold',
  })

  doc.setLineWidth(0.5)
  pdf.printLine({ doc, x: xb, y: yb + 2, width: widthArea })

  doc.setFont('PT_Sans-Web-Regular')

  const operator = pdf.breakString({
    doc,
    str: `${data.operator.nameShort}, ИНН ${data.operator.inn}, ${data.operator.address}`,
    widthMax: widthArea - nameOffsetX,
    fontSize: 10,
  })
  adding.operator = getOffset(operator, addRowY)

  const customer = pdf.breakString({
    doc,
    str: `${data.customer.nameFull}, ИНН ${data.customer.inn}, ${data.customer.address}`,
    widthMax: widthArea - nameOffsetX,
    fontSize: 10,
  })

  adding.customer = getOffset(customer, addRowY)

  const basis = data.actBasis

  const xn = xb + nameOffsetX
  const next = (index) => yb + nameOffsetY * index

  doc.text('Исполнитель:', xb, next(1))
  doc.text(operator, xn, next(1))

  doc.text('Заказчик:', xb, next(2) + adding.operator)
  doc.text(customer, xn, next(2) + adding.operator)

  doc.text('Основание:', xb, next(3) + adding.operator + adding.customer)
  doc.text(basis, xn, next(3) + adding.operator + adding.customer)

  // Таблица услуг
  let [x, y] = [xb, next(4) + adding.operator + adding.customer - 5] // начало таблицы
  const width = widthArea //  ширина 130
  let height = 18 // высота
  const deltaHeight = 8 // между строк с услугами

  if (data.services.length > 1) {
    height += deltaHeight * (data.services.length - 1)
  }
  doc.setLineWidth(0.5)
  doc.rect(x, y, width, height)
  doc.setLineWidth(0.25)
  doc.line(x, y + 10, x + width, y + 10)
  doc.setLineWidth(0.1)
  doc.line(x + 8, y, x + 8, y + height)
  doc.line(x + 120, y, x + 120, y + height)
  doc.line(x + 130, y, x + 130, y + height)
  doc.line(x + 140, y, x + 140, y + height)
  doc.line(x + 160, y, x + 160, y + height)

  const yh = 6 // смещение заголовка таблицы от верха
  doc.text('№', x + 2, y + yh)
  // doc.text('Наименование работ, услуг', x + 8, y + yh)
  pdf.printCenter({ doc, str: 'Наименование работ, услуг', x: x + 8, y: y + yh, width: 112, fontSize: 10 })

  doc.setFontSize(8)
  doc.text('Кол-во', x + 121, y + yh)
  doc.text('Ед.', x + 133, y + yh)
  doc.text('Цена', x + 147, y + yh)
  doc.text('Сумма', x + 166, y + yh)

  doc.setFontSize(8)
  let dy = 15 // смещение по высоте к данным

  data.services.forEach((el, i) => {
    // №, Услуги связи ..., кол-во, ед.
    doc.text(String(i + 1), x + 3, y + dy)
    doc.text(el.service.name, x + 10, y + dy)
    doc.text('1', x + 124, y + dy)
    doc.text('шт', x + 133.5, y + dy)

    // цена, сумма
    pdf.printLeft({ doc, str: el.service.cost.toFixed(2), x: x + 160, y: y + dy, fontSize: 8 })
    pdf.printLeft({
      doc,
      str: el.service.cost.toFixed(2),
      x: x + width,
      y: y + dy,
      fontSize: 8,
    })

    doc.line(x, y + dy + 3, x + width, y + dy + 3)
    dy += deltaHeight
  })

  // Итоги
  // новая точка отсчёта по Y
  const yy = y + dy

  const price = data.totalCost
  const nds = data.totalCostNDS
  const totalSum = data.totalSum
  const totalSumWords = data.totalSumWords

  pdf.printLeft({ doc, str: 'Итого:', x: x + 160, y: yy, fontSize: 8 })
  pdf.printLeft({ doc, str: 'Сумма НДС 20%', x: x + 160, y: yy + 5, fontSize: 8 })
  pdf.printLeft({ doc, str: price.toFixed(2), x: x + width, y: yy, fontSize: 8 })
  pdf.printLeft({ doc, str: nds.toFixed(2), x: x + width, y: yy + 5, fontSize: 8 })

  const serviceCount = data.services.length
  doc.setFontSize(8)
  const str = `Всего оказано услуг ${serviceCount}, на сумму ${totalSum} руб`
  pdf.printText({ doc, text: str, x, y: yy + 10, fontSize: 10 })
  pdf.printText({ doc, text: totalSumWords, x, y: yy + 15, fontSize: 10, fontName: 'PT_Sans-Web-Bold' })

  doc.setFontSize(8)
  doc.setFont('PT_Sans-Web-Regular')
  const text =
    'Вышеперечисленные услуги выполнены полностью и в срок. Заказчик претензий по объему, качеству и срокам оказания услуг не имеет.'
  doc.text(text, x, yy + 25)
  pdf.printLine({ doc, x, y: yy + 27, width: widthArea })

  const executerY = yy + 32 // ИСПОЛНИТЕЛЬ и ЗАКАЗЧИК по Y
  const heightSignatureSpace = 18 // пространство для подписей для ИСПОЛНИТЕЛЬ .. ЗАКАЗЧИК
  const lineSignatureY = yy + 37 + heightSignatureSpace // линия для подписей под ИСПОЛНИТЕЛЬ .. ЗАКАЗЧИК

  doc.setFontSize(10)
  doc.setFont('PT_Sans-Web-Bold')
  doc.text('ИСПОЛНИТЕЛЬ', x, executerY)
  doc.text('ЗАКАЗЧИК', x + 90, executerY)

  doc.setLineWidth(0.3)
  doc.setFont('PT_Sans-Web-Bold')
  doc.line(x, lineSignatureY, x + 80, lineSignatureY)
  doc.line(x + 90, lineSignatureY, x + widthArea, lineSignatureY)

  doc.setFontSize(6)
  doc.setFont('PT_Sans-Web-Regular')
  pdf.printCenterArray({ doc, arr: data.actExecuter, x: x + 2, y: lineSignatureY + 3, width: 70, fontSize: 6 })

  const executer = pdf.breakString({ doc, str: data.operator.name.toUpperCase(), widthMax: 80, fontSize: 8 })
  const offsetExecuter = pdf.getOffsetToCenterBlockInHeight({
    doc,
    str: executer,
    height: heightSignatureSpace,
    fontSize: 8,
  })

  const custom = pdf.breakString({ doc, str: data.customer.nameFull, widthMax: 90, fontSize: 8 })
  const offsetCustom = pdf.getOffsetToCenterBlockInHeight({
    doc,
    str: custom,
    height: heightSignatureSpace,
    fontSize: 8,
  })

  doc.setFontSize(8)
  doc.text(executer, x, executerY + offsetExecuter)
  doc.text(custom, x + 90, executerY + offsetCustom)

  doc.save(nameFile)
}

// возвращает смещение по Y для 'длинной' строки
// строка уже подготовлена и разделена '\n'
function getOffset(str, offset) {
  const rows = pdf.getCountRows(str)
  return rows > 2 ? offset * (rows - 2) : 0
}

module.exports = {
  createAct,
}
