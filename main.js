// const CARD_INFO = {
//   AmountPerSymbol: 3,
//   Symbol: 2 
// }

const GAME_STATE = {
  FirstCardAwaits: 'FirstCardAwaits',
  SecondCardAwaits: 'SecondCardAwaits',
  CardMatchFailed: 'CardMatchFailed',
  CardMatched: 'CardMatched',
  GameFinished: 'GameFinished'
}

const Symbols = [
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png',
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png',
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png',
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png'
]

const utility = {
  getRandomNumberArray(count) {
    const number = Array.from(Array(count).keys())
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1))
        ;[number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }
    return number
  }
}

const model = {
  revealedCards: [],
  score: 0,
  triedTimes: 0,
  AmountPerSymbol: 0,
  Symbol: 0, 

  isRevealedCardsMatched() {
    return this.revealedCards[0].dataset.index % model.AmountPerSymbol === this.revealedCards[1].dataset.index % model.AmountPerSymbol 
  }
}

const view = {
  getCardContent(index) {
    const number = this.transformNumber(index % model.AmountPerSymbol + 1)
    const symbol = Symbols[Math.floor(index / model.AmountPerSymbol)]
    // <img src="${symbol}" alt="">
    return `
        <p>${number}</p>
        <img src="${symbol}" alt="">
        <p>${number}</p>
    `
  },

  getCardElement(index) {
    return `
      <div data-index="${index}" class="card back">
      </div>
    `
  },

  transformNumber(number) {
    switch(number) {
      case 1:
        return 'A'
      case 11:
        return 'J'
      case 12:
        return 'Q'
      case 13:
        return 'K'
      default:
        return number
    }
  },

  renderCards(cards) {
    const cardPanel = document.querySelector('#card-panel')

    cardPanel.innerHTML = cards
    .map(index => this.getCardElement(index))
    .join('')
  },
  renderScore(score) {
    return document.querySelector('.score').innerText = `Score: ${score}`
  },
  renderTriedTimes(times) {
    return document.querySelector('.tried').innerHTML = `You've tried: ${times} times`
  },
  flipCards(...cards) {
    cards.forEach(card => {
      // 背面 > 正面
      if (card.classList.contains('back')) {
        card.classList.remove('back')
        card.innerHTML = this.getCardContent(Number(card.dataset.index))
        return
      }
      // 正面 > 背面
      card.classList.add('back')
      card.innerHTML = null
    })
  },
  pairCards(...cards) {
    cards.map(card => card.classList.add('paired'))
  },
  appendWrongAnimation(...cards) {
    cards.map(card => {
      card.classList.add('wrong')
      card.addEventListener('animationend', e => e.target.classList.remove('wrong'), {once: true})
    })
  },
  showGameFinished() {
    const completed = document.querySelector('.completed')
    
    completed.innerHTML = `
      <p>Complete!</p>
      <p>Score: ${model.score}</p>
      <p>You've tried: ${model.triedTimes} times</p>
    `
    completed.classList.remove('hide')
    // const div = document.createElement('div')
    // div.classList.add('completed')
    // div.innerHTML = `
    //   <p>Complete!</p>
    //   <p>Score: ${model.score}</p>
    //   <p>You've tried: ${model.triedTimes} times</p>
    // `
    // const header = document.querySelector('#header')
    // header.before(div)
  },
  hideGameFinished() {
    const completed = document.querySelector('.completed')
    if (!completed) return
    
    completed.classList.add('hide')
  }
}
const controller = {
  currentState: GAME_STATE.FirstCardAwaits,

  getGameCards(cardSelect, symbolSelect) {
    model.AmountPerSymbol = cardSelect
    model.Symbol = symbolSelect
    // const cards = utility.getRandomNumberArray(model.AmountPerSymbol * model.Symbol)
    // view.displayCards(utility.getRandomNumberArray(52))
    // const cards = Array.from(Array().keys())
    // console.log(cards)
    view.renderCards(utility.getRandomNumberArray(model.AmountPerSymbol * model.Symbol))
  },

  dispatchGameState(card) {
    // front > return
    if(!card.classList.contains('back')) return

    switch(this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card)
        model.revealedCards.push(card)
        this.currentState = GAME_STATE.SecondCardAwaits
        break

      case GAME_STATE.SecondCardAwaits:
        view.flipCards(card)
        view.renderTriedTimes(++model.triedTimes)
        model.revealedCards.push(card)

        // matched ?
        if(model.isRevealedCardsMatched(...model.revealedCards)) {
          // match success
          this.currentState = GAME_STATE.CardMatched
          view.pairCards(...model.revealedCards)
          view.renderScore(model.score += 10)
          model.revealedCards = []

          if (model.score === (model.AmountPerSymbol * model.Symbol ) / 2 * 10){
            console.log('finished')
            this.currentState = GAME_STATE.GameFinished
            view.showGameFinished()
            return
          }
         
          // score isn't enough >> continue game
          this.currentState = GAME_STATE.FirstCardAwaits
        }else {
          // match failed
          this.currentState = GAME_STATE.CardMatchFailed
          view.appendWrongAnimation(...model.revealedCards)
          setTimeout(this.resetCards, 1000)
        }
        break
    }
    console.log('current state = ' + this.currentState)
    console.log('revealedCards = ' + model.revealedCards)
  },
  resetCards() {
    view.flipCards(...model.revealedCards)
    model.revealedCards = []
    controller.currentState = GAME_STATE.FirstCardAwaits
  },
  initalCardGame() {
    view.renderScore(model.score = 0)
    view.renderTriedTimes(model.triedTimes = 0)
    view.hideGameFinished()
    model.revealedCards = []
    this.currentState = GAME_STATE.FirstCardAwaits
    
  }
}
document.querySelector('#game-choose').addEventListener('click', e => {
  //Start
  if (e.target.matches('.btn-play')){
    const cardSelect = document.querySelector('.card-select').value
    const symbolSelect = document.querySelector('.symbol-select').value
    
    if (cardSelect === '請選擇' || symbolSelect === '請選擇'){
      return alert('請選擇「 有幾張牌 / 花色 」')
    }

    controller.initalCardGame()
    controller.getGameCards(cardSelect, symbolSelect)
    document.querySelectorAll('.card').forEach(card => {
      card.addEventListener('click', e => controller.dispatchGameState(card))
    })
  }
  
})


// controller.getGameCards()
// document.querySelectorAll('.card').forEach(card => {
//   card.addEventListener('click', e => controller.dispatchGameState(card))
// })

// // Restart
// document.querySelector('.btn-play').addEventListener('click', e => {
//   controller.initalCardGame()
//   controller.getGameCards()
//   document.querySelectorAll('.card').forEach(card => {
//     card.addEventListener('click', e => controller.dispatchGameState(card))
//   })
// })





