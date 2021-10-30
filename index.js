const fs = require('fs-extra')
const path = require('path')
const fn = require('./lib/func')
const act = require('./lib/act')
const invoice = require('./lib/invoice')

global.appRoot = path.resolve(__dirname)
const pathResult = `${appRoot}/result`
const pathData = `${appRoot}/data`

const fileMg = 'westcall-longdistance-2021-09.csv'
const fileVz = 'westcall-intrazone-2021-09.csv'
const fileNameMg = `${pathData}/${fileMg}`
const fileNameVz = `${pathData}/${fileVz}`

const main = (data) => {
  const [result, totalSum] = fn.prepareData(data)

  const customersIds = Object.keys(result).sort()

  customersIds.forEach(async (cid) => {
    const it = result[cid]
    if (it.customer.type === 'u') {
      const period = `${it.year}_${fn.padStart(it.month, 2, '0')}` // 2021_09
      const storage = `${pathResult}/${period}` // ../result/2021_09
      await fn.createDirectory(storage)
      const typeTraf = fn.getTrafficSymbol(it.trafficType)

      const nameFileAct = fn.getNameOutputFile(storage, period, it.customer, typeTraf, 'act')
      act.createAct(it, nameFileAct)

      const nameFileInvoice = fn.getNameOutputFile(storage, period, it.customer, typeTraf, 'invoice')
      invoice.createInvoice(it, nameFileInvoice)
    }
  })

  console.log('total sum:', totalSum)


}

fn.readFile(fileNameMg, main)
fn.readFile(fileNameVz, main)


function one (data) {
  const [result, totalSum] = fn.prepareData(data)
  const it = result['28984']
  const period = `${it.year}_${fn.padStart(it.month, 2, '0')}` // 2021_09
  const storage = `${pathResult}/${period}` // ../result/2021_09
  fn.createDirectory(storage)
  const typeTraf = fn.getTrafficSymbol(it.trafficType)
  const nameFileAct = fn.getNameOutputFile(storage, period, it.customer, typeTraf, 'act')
  act.createAct(it, nameFileAct)
  const nameFileInvoice = fn.getNameOutputFile(storage, period, it.customer, typeTraf, 'invoice')
  invoice.createInvoice(it, nameFileInvoice)
} 