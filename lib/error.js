class ReadError extends Error {
  constructor(message, cause) {
    super(message)
    this.cause = cause
    this.name = 'ReadError'
  }
}

class MyError extends Error {
  constructor(message) {
    super(message)
    this.name = this.constructor.name
  }
}

class ValidationError extends MyError {}

class PropertyRequiredError extends ValidationError {
  constructor(property) {
    super('Нет свойства: ' + property)
    this.property = property
  }
}

class PropertyValueError extends ValidationError {
  constructor(property, value) {
    super(`Для ${property} задано ошибочное значение:: '${value}''`)
    this.property = property
  }
}

//    const message = `error in source data. Not all fields. Required fields: ${db.requiredKeysInData}`

class DataStructError extends ValidationError {
  constructor(requiredKeys) {
    super(`Нехватает полей в данных. Необходимы поля: ${requiredKeys}`)
    this.requiredKeys = requiredKeys
  }
}
// console.log(new PropertyRequiredError('field').name) // PropertyRequiredError
// console.log(new PropertyRequiredError('field').message) // Нет свойства: field
// console.log(new PropertyRequiredError('field').stack) // stack ошибок

module.exports = {
  ReadError,
  ValidationError,
  PropertyRequiredError,
  PropertyValueError,
  DataStructError,
}
