const modal = {
  open() {
    document.querySelector('.modal-overlay').classList.add('active')
  },
  close() {
    document.querySelector('#description').value = ''
    document.querySelector('#amount').value = ''
    document.querySelector('#date').value = ''
    document.querySelector('.modal-overlay').classList.remove('active')
  }
}

const form = {
  description: document.querySelector('#description'),
  amount: document.querySelector('#amount'),
  date: document.querySelector('#date'),

  getValues() {
    return {
      description: form.description.value,
      amount: form.amount.value,
      date: form.date.value
    }
  },
  validateFields() {
    const { description, amount, date } = form.getValues()

    if (
      description.trim() === '' ||
      amount.trim() === '' ||
      date.trim() === ''
    ) {
      throw new Error('Por favor, preencha todos os campos!')
    }
  },
  formatValues() {
    let { description, amount, date } = form.getValues()

    amount = utils.formatAmount(amount)
    date = utils.formatDate(date)

    return { description, amount, date }
  },
  submit() {
    try {
      form.validateFields()
      const newTransaction = form.formatValues()
      Transaction.add(newTransaction)
      modal.close()
    } catch (error) {
      alert(error.message)
    }
  }
}

const storage = {
  get() {
    return JSON.parse(localStorage.getItem('transactions')) || []
  },
  set(transactions) {
    localStorage.setItem('transactions', JSON.stringify(transactions))
  }
}

const Transaction = {
  all: storage.get(),
  add(transaction) {
    Transaction.all.push(transaction)
    app.reload()
  },
  remove(index) {
    Transaction.all.splice(index, 1)
    app.reload()
  },
  incomes() {
    let income = 0
    Transaction.all.forEach(transaction => {
      if (transaction.amount > 0) {
        income += transaction.amount
      }
    })
    return income
  },
  expenses() {
    let expense = 0
    Transaction.all.forEach(transaction => {
      if (transaction.amount < 0) {
        expense += transaction.amount
      }
    })
    return expense
  },
  total() {
    return Transaction.incomes() + Transaction.expenses()
  }
}

const DOM = {
  transactionsContainer: document.querySelector('tbody'),
  addTransaction(transaction, index) {
    const tr = document.createElement('tr')
    tr.innerHTML = DOM.innerHtmlTransaction(transaction, index)
    DOM.transactionsContainer.appendChild(tr)
    document
      .getElementById(`button${index}`)
      .addEventListener('click', function () {
        Transaction.remove(index, 1)
      })
  },
  innerHtmlTransaction(transaction, index) {
    const cssClass = transaction.amount > 0 ? 'income' : 'expense'

    const amount = utils.formatCurrency(transaction.amount)

    const html = `<td class="description">${transaction.description}</td>
    <td class="${cssClass}">${amount}</td>
    <td class="date">${transaction.date}</td>
    <td id = "${
      'button' + index
    }"><img src="./assets/minus.svg" alt="Remover alteração" /></td>`

    return html
  },
  updateBalance() {
    document.getElementById('incomeDisplay').innerText = utils.formatCurrency(
      Transaction.incomes()
    )
    document.getElementById('expenseDisplay').innerText = utils.formatCurrency(
      Transaction.expenses()
    )
    document.getElementById('totalDisplay').innerText = utils.formatCurrency(
      Transaction.total()
    )
  },
  clearTransactions() {
    DOM.transactionsContainer.innerHTML = ''
  }
}

const utils = {
  formatDate(date) {
    const splittedDate = date.split('-')

    return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
  },
  formatAmount(value) {
    value = Number(value) * 100

    return value
  },
  formatCurrency(value) {
    const signal = Number(value) < 0 ? '-' : ''

    value = String(value).replace(/\D/g, '')

    value = Number(value) / 100

    value = value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })

    return signal + value
  }
}

const app = {
  init() {
    Transaction.all.forEach((transaction, index) => {
      DOM.addTransaction(transaction, index)
    })

    DOM.updateBalance()
    storage.set(Transaction.all)
  },
  reload() {
    DOM.clearTransactions()
    app.init()
  }
}

document.querySelector('.button.new').addEventListener('click', function () {
  modal.open()
})

document.querySelector('.button.cancel').addEventListener('click', function () {
  modal.close()
})

document.querySelector('.button.save').addEventListener('click', function (ev) {
  ev.preventDefault()
  form.submit()
})

app.init()
