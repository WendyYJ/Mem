// css class for different card image
const CARD_TECHS = [
  'html5',
  'css3',
  'js',
  'sass',
  'nodejs',
  'react',
  'linkedin',
  'heroku',
  'github',
  'aws'
];

// only list out some of the properties,
// add more when needed
const game = {
  score: 0,
  level: 1,
  timer: 60,
  display:"",
  timerDisplay: null,
  scoreDisplay: null,
  levelDisplay: "",
  timerInterval: null,
  startButton: null,
  timeOut:null,
  barWidth:100,
  temp:null,// to record the status of the game
  board:null,
  card:null,
  cards:null,
  pics:[0,4,16,36]
};

setGame();

/*******************************************
/     game process
/******************************************/

/**
 * Set a new game
 */
function setGame() {
  setGameParameters();
  setGameBoardDisplay();
}

/**
 *  Start a new game
*/ 
function startGame() {
  clearGameBoard();
  setTimeout(function(){
    updateTimerDisplay();
  },1000)  
  setGameHandler();
}
/**
 * Set game parameters at the beginning of a new game
 */
function setGameParameters() {
  game.display = "";
  game.timer = 60;
  game.score = 0;
  game.barWidth = 100;
  game.board = null;
  game.timeOut = null;
  game.cards = null;
  game.card = null;
}

/**
 * Set the cards display on the game board at the beginning 
 * of a new game.
 */
function setGameBoardDisplay() {
  shiftCardArray("cardTech");
  var card = shiftCardArray("cardArray");
  if(game.temp === null && game.level == 1) {
    bindStartButton(); 
  }
  for(var i = 0; i < game.pics[game.level]; i++) {
      dataIndex = Math.ceil(card[i]/2);
    if(dataIndex >= 10) {
      dataIndex = Math.floor(dataIndex / 2);
    }
    dataValue = CARD_TECHS[dataIndex];
    game.display += '<div class = "card ' + dataValue + '"' + ' data-tech = "' + dataValue + '">';
    game.display += '<div class="card__face card__face--front"></div>';
    game.display += '<div class="card__face card__face--back"></div>';
    game.display += '</div>';
  }
}

/**
 * Set the DOM selectors to corresponding objects for handling 
 * the elements during the game.
 * 
 */
function setGameHandler() {
  var column = Math.sqrt(game.pics[game.level]);
  game.timerDisplay = document.querySelector('.game-timer__bar');
  game.timerDisplay.setAttribute('style','width:100%');
  game.scoreDisplay = document.querySelector('.game-stats__score--value');
  game.levelDisplay = document.querySelector('.game-stats__level--value');
  game.board = document.querySelector('.game-board');
  game.board.setAttribute('style',`grid-template-columns:repeat(${column},1fr)`);
  game.board.innerHTML = game.display; 
  game.scoreDisplay.innerHTML = 0;
  game.timerDisplay.innerHTML = '60s';
}

/**
 *  
 *Clear the game instruction before playing a new game.
 * 
 */
function clearGameBoard() {
  var content = document.querySelector('.game-instruction');
  if (content) {
    content.setAttribute('style','display:none');
  }
}

 
 /** 
  * Create a card array according to the level of game.
  * @return a card array
 */

function createCardArray() {
  var card = [];
  for(var i = 1; i <= game.pics[game.level]; i++) {
    card.push(i);
  } 
  return card;
}

/** 
  * Shift the cards in each new game session when the user chooses to 
  * start a new game.
  * @param  string   
  *         For identifying the objects for shift. There are two objects 
  *         for shift. One is card types and the other is the card array.
*/ 
function shiftCardArray(string) {
  if(string === "cardArray") {
    var card = createCardArray();
    for (var i = card.length - 1; i >= 0;i--) {
      var j = Math.floor(Math.random() * (i+1));
      var temp = card[i];
      card[i] = card[j];
      card[j] = temp;
  }
     return card;
  } else {
    for (var i = CARD_TECHS.length - 1; i >= 0;i--) {
      var j = Math.floor(Math.random() * (i+1));
      var temp = CARD_TECHS[i];
      CARD_TECHS[i] = CARD_TECHS[j];
      CARD_TECHS[j] = temp;
    }
  }
}

/** 
 * It is for handling the card flip.
 *
 * @param e The target event
*/
function handleCardFlip(e) {
  if(e.target.parentNode.classList.contains("card--flipped")) {
    e.target.parentNode.classList.remove("card--flipped");
    if(e.target.parentNode === game.card) {
      game.card = null;
    }
  } else if(e.target.parentNode.classList.contains("card")){
      e.target.parentNode.classList.add("card--flipped");
      if(game.card === null) {
        game.card = e.target.parentNode;
      } else {
          var firstCard = game.card.getAttribute("data-tech");
          var secondCard = e.target.parentNode.getAttribute("data-tech");
          if (firstCard === secondCard && game.card != e.target.parentNode) {
            unBindCardClick(game.card);
            unBindCardClick(e.target.parentNode);
            updateScore();
            game.card = null;
          } else {
              var firstCard = game.card;
              game.card = null; 
              game.timerInterval = setTimeout(function(){
                                    firstCard.classList.remove("card--flipped");
                                    e.target.parentNode.classList.remove("card--flipped");                              
                                  },1000);                 
          }
      }
      
    }
}

/* 
 * The game level contains three level. This function is upgrading. When the level
 * is 4, the game will be leaded to the initial page.
*/
function nextLevel() {
    game.level++;
    if(game.level === 4) {
      location.reload(true);
    } else {
      game.levelDisplay.innerHTML = game.level;
      game.scoreDisplay = 0
      game.scoreDisplay.innerHTML = 0;
      game.score = 0;
      clearTimeout(game.timeOut);
      game.timeOut = null;
      setGame();
      startGame();
      bindCardClick(); 
  } 
}

/*
 * For ending the game when the game is played out of 60 seconds or user
 * click the 'end game' button.
 *
*/ 
function handleGameOver() {
    game.temp = true;
    clearTimeout(game.timeOut);
    alert(`Congraduation, your score is ${game.score}`);
    game.startButton.innerHTML = "Start Game";
}

/*******************************************
/     UI update
/******************************************/

/**
 * Update the score when the user clicked a pair of same card.
 * Each match will be granted 10 mark.
 * Full mark of level one is 20; Level two is 80; Level three is 320.
 *
*/ 
function updateScore() {
  game.score += 10;
  game.scoreDisplay.innerHTML = game.score;
  if((game.level === 1 && game.score === 20) || 
      (game.level === 2 && game.score === 80) ||
      (game.level === 3 && game.score === 320)) {
    var next = setTimeout(function() {
      nextLevel();
    },1000)   
  }
}

/*
 * Update the time display during playing the game.
 * The maximum time is 60 seconds which will be counted at the begining.
 * The minimum time is 0 second. The time bar will show the left time.
 *
*/
function updateTimerDisplay() {
  if(game.timer === 0) {
    game.timerDisplay.setAttribute('style','width:0');
    game.timerDisplay.innerHTML = game.timer + "s";
    handleGameOver();
  } else {
      game.timer--;
      game.barWidth = game.barWidth - 1.7;
      game.timerDisplay.setAttribute('style','width:' + game.barWidth + '%');
      game.timerDisplay.innerHTML = game.timer + "s";
      game.timeOut = setTimeout(function(){
                       updateTimerDisplay();
                     },1000)     
  }
}

/*******************************************
/     bindings
/******************************************/

/** 
 * The button on the game is the trigger handler.
 * When the user click the new game, the button will be shifted to 'end game'.
 * When the user click the end game, the button will be shifted to 'start game'.
 * The button will be binded to event listener at the begining of the game.
 *
*/
function bindStartButton() {
  game.startButton = document.querySelector('.game-stats__button');
  game.startButton.addEventListener('click',function() {
    if(game.startButton.innerHTML === "New Game") {
        game.startButton.innerHTML = "End Game";
        startGame();
        bindCardClick();  
    } else if(game.startButton.innerHTML === "End Game") {
      handleGameOver();
    } else if(game.startButton.innerHTML === "Start Game") {
      game.startButton.innerHTML = "End Game";
      clearTimeout(game.timeOut);
      setGame();
      startGame();
      bindCardClick();  
      game.temp = true;
    }
  });
}

/** 
 * Bind each card with an event listener.
 * The bind will be done each time when start a new game.
 * 
*/
function bindCardClick() {
  game.cards = document.querySelectorAll('.card');
  game.cards.forEach((card) => {  
    card.addEventListener('click',cardClick,true);
  });
}

/**
 * Unbind the card when a pair of cards is matched.
 * 
*/
function unBindCardClick(card) {
  card.removeEventListener('click',cardClick,true);
}

/**
 * The event function when the card is clicked
*/
function cardClick(e) {
  if(game.startButton.innerHTML === "End Game") {
    handleCardFlip(e);
  }   
}
