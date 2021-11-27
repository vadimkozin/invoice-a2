'use strict'
const path = require('path')
const db = require('./db')
const nodemailer = require('nodemailer')

/**
 * Подготовка email(s) - возвращает массив адресов
 * @param {string, array} item - варианты: 'addr@mailru'; 'addr1@mailru,addr2@mailru'; ['addr1@mailru','addr2@mailru']
 * @returns {array} массив адресов
 */
const _prepareEmail = (item) => {
  let emails = []

  if (typeof item === 'string') {
    emails = item.split(',')
  } else if (Array.isArray(item)) {
    emails = item
  } else {
    return false
  }

  return emails
}

/**
 * Проверка электронного адреса(ов) на корректность.
 * На входе: одиночный адрес, адреса через запятую, массив адресов
 * @param {Array|string} item
 * @returns true | false
 */
const _validateEmail = (item) => {
  const re = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/

  const emails = _prepareEmail(item)
  return emails ? emails.every((it) => re.test(it)) : false
}

const avatar = '👻'
/**
 * Отправка письма с вложением
 * @param {object} : { filename, emails }
 *        {string} filename - путь к вкладываемому файлу
 *        {string|array} emails - адрес, адреса через запятую или массив адресов
 * @return {Promise} { sendedTo, bytes } // кому послали и количество байтов
 */
const sendEmail = ({ filename, email = null }) => {
  return new Promise((resolve, reject) => {
    if (email && !_validateEmail(email)) {
      return reject(`email address is incorrect: ${email}`)
    }

    const post = {
      from: {
        name: `${db.emailTransport.nameFrom} ${avatar}`,
        email: db.emailTransport.auth.user,
      },
      to: email ? _prepareEmail(email) : db.emails,
      subject: `Documents: ${path.basename(filename)}`,
      text: 'Hello!/nDocuments (pdf) in the attachment',
      html: "Hello!<br><p>Documents (pdf) in the attachment</p><br><hr><div style='color:grey;'><em>This email is from a robot, so you don't need to answer it.</em></div><br>",
      attachments: [
        {
          filename: path.basename(filename),
          path: filename,
        },
      ],
      transport: db.emailTransport,
    }

    _send(post, resolve, reject)
  })
}

/**
 * Отправка письма
 * @param {object} post - объект с данными (см. sendMail)
 * @param {function} cbOk - колбэк - вызывается после отправки
 * @param {function} cbError - колбэк - вызывается если ошибка
 */
const _send = (post, cbOk, cbError) => {
  const transporter = nodemailer.createTransport({
    host: post.transport.host,
    port: post.transport.port,
    secure: post.transport.secure,
    auth: post.transport.auth,
  })

  const message = {
    from: `"${post.from.name}" <${post.from.email}>`,
    to: post.to.join(),
    subject: post.subject,
    text: post.text,
    html: post.html,
    attachments: post.attachments,
  }

  transporter.sendMail(message, (err, info) => {
    if (err) {
      return cbError(err.message)
    }
    return cbOk({ sendedTo: message.to, bytes: info.messageSize })
  })
}

module.exports = {
  sendEmail,
}
