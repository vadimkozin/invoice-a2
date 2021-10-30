const fn = require('./func')

/**
 * Разбивает строку на несколько если строка шире чем widthMax
 * @param {object} doc - указатель на new jsPDF()
 * @param {string} str - разбираемая строка
 * @param {number} widthMax - максимальная ширина в unit (default unit='мм')
 * @returns Возвращает строку с внедрённым '\n' или оригинальную если она < widthMax
 */
const breakString = ({ doc, str, widthMax = 105, fontSize = 10 }) => {
  if (str.length > 1000) {
    return str
  }

  doc.setFontSize(fontSize)
  const widthStr = doc.getTextWidth(str)

  if (widthStr <= widthMax) {
    return str
  }

  const words = str.split(/\s+/).map((w) => w + ' ')

  let [text, widthText, result] = ['', 0, '']

  for (let i = 0; i < words.length; i++) {
    const widthWord = doc.getTextWidth(words[i])
    widthText = doc.getTextWidth(text)

    if (widthText + widthWord < widthMax) {
      text += words[i]
    } else {
      remains = words.slice(i).join('')
      widthRemains = doc.getTextWidth(remains)

      result += text + '\n'

      if (widthRemains < widthMax) {
        result += remains
        break
      } else {
        text = ''
      }
    }
  }
  return result
}

// печать слева от границы по X
const printLeft = ({ doc, str, x, y, fontSize = 10 }) => {
  doc.setFontSize(fontSize)
  doc.text(str, x - (doc.getTextWidth(str) + 1), y)
}

// печать по центру
const printCenter = ({ doc, str, x, y, width, fontSize = 10 }) => {
  doc.setFontSize(fontSize)
  const widthStr = doc.getTextWidth(str)
  let offset = 0

  if (width > widthStr) {
    offset = (width - widthStr) / 2
  }

  doc.text(str, x + offset, y)
}

// возвращает высоту строк в миллиметрах (mm)
const getHeightInMm = ({ doc, rows = 1, fontSize = 10 }) => {
  // 72pt = 1in = 25.4mm
  const pt2mm = 25.4 / 72 // 0.352(7)
  const heightPunkt = fontSize * (rows - 1) * doc.getLineHeightFactor()
  return heightPunkt * pt2mm
}

/**
 * врзвращает Смещение К Центру Блоку По Высоте
 * @param {object} doc - ссылка на экземляр jsPDF
 * @param {string} str - строка (если длинная, то уже внедрён разделитель '\n')
 * @param {number} height - высота блока (мм)
 * @param {number} fontSize - размер фонта
 * @return {numder} смещение
 *
 */
const getOffsetToCenterBlockInHeight = ({ doc, str, height, fontSize = 10 }) => {
  const rows = getCountRows(str)
  const heightRows = getHeightInMm({ doc, rows, fontSize })
  const offset = (height - heightRows) / 2
  return offset
}

// возвращает количество строк
const getCountRows = (str) => fn.getCountSymbolInString(str, '\n') + 1

module.exports = {
  breakString,
  printLeft,
  printCenter,
  getHeightInMm,
  getCountRows,
  getOffsetToCenterBlockInHeight,
}
