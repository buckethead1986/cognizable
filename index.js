// const form = document.getElementById("form");
const form = document.getElementById("form");
const game = document.getElementById("game");
const gameDeck = [];
let currentUser = document.getElementById("current-user");
let howManyRows = 2;
let currentFlipped = 0;
let totalFlips = 0;
let matchId = [];
let timer;

document.addEventListener("DOMContentLoaded", () => {
  makeBoardOfXRows(howManyRows);
  form.addEventListener("submit", function(e) {
    e.preventDefault();
    logInUser();
  });

  fetch("https://cognizance.herokuapp.com/api/v1/users")
    .then(res => res.json())
    .then(json => {
      populateLeaderboard(json.data);
    });

  fetch("https://cognizance.herokuapp.com/api/v1/cards")
    .then(res => res.json())
    .then(json => {
      initiateGameListener(json.data);
    });
});

// sort through array of users in descending order based on score
function sortUserScoreDescending(data) {
  let users = data.slice(0);
  users.sort((a, b) => {
    return b.attributes.highscore - a.attributes.highscore;
  });
  return users;
}

// create tags for ranked user's name
function createUserNameTag(user) {
  let nameTag = document.createElement("p");
  nameTag.setAttribute("class", "title-3 has-text-info has-text-weight-bold");
  nameTag.innerText = `${user.name}: `;
  return nameTag;
}

// create tags for ranked user's score
function createUserScoreTag(user) {
  let scoreTag = document.createElement("p");
  scoreTag.setAttribute("class", "subtitle-3 margins");
  scoreTag.innerText = user.highscore;
  return scoreTag;
}

// iterate through scoreboard places and populate each rank with tags from cbs
function populateLeaderboard(data) {
  let sortedUsers = sortUserScoreDescending(data);
  sortedUsers.sort((a, b) => {
    return b.attributes.highscore - a.attributes.highscore;
  });
  let scoreboardPlace = document.querySelectorAll(".panel-block");
  for (let i = 0; i < scoreboardPlace.length; i++) {
    let rank = scoreboardPlace[i];
    let user = sortedUsers[i].attributes;
    let nameTag = createUserNameTag(user);
    let scoreTag = createUserScoreTag(user);
    rank.appendChild(nameTag);
    rank.appendChild(scoreTag);
  }
}

// starts timer and allows user to play when start button is clicked
function initiateGameListener(json) {
  const startButton = document.getElementById("start-button");
  startButton.addEventListener("click", () => {
    generateCards(json);
    startTimer();
  });
}

function startTimer() {
  let timeDiv = document.getElementsByClassName("timer-count");
  let time = timeDiv[0].innerText;
  time = 0;
  timer = setInterval(function() {
    checkGameStatus();
    if (!document.getElementsByClassName("win")[0]) {
      ++time;
      timeDiv[0].innerText = time;
    }
  }, 1000);
}

// reloads webpage when eventlistener on reset button is triggered
function resetGame() {
  const resetButton = document.getElementsByClassName("game-reset");
  resetButton.addEventListener("click", () => {
    let timeDiv = document.getElementsByClassName("timer-count");
    timeDiv[0].innerText = "Timer";
    fetch("https://cognizance.herokuapp.com/api/v1/users")
      .then(res => res.json())
      .then(json => {
        populateLeaderboard(json.data);
      });

    fetch("https://cognizance.herokuapp.com/api/v1/cards")
      .then(res => res.json())
      .then(json => {
        initiateGameListener(json.data);
      });
  });
}

function generateCards(json) {
  makeDecks(json);
  collectCards(json);
}

//gets random card from all json, addCardToDe adds to gameDeck,
// then removes from json array for next iteration
function makeDecks(json) {
  for (let i = 0; i < howManyRows * 4; i++) {
    let rand = json[Math.floor(Math.random() * json.length)];
    let index = json.indexOf(rand);
    addCardToDeck(rand);
    if (index > -1) {
      //removes from json array
      json.splice(index, 1);
    }
  }
}

//randomizes images, adds an event listener to each card div,
// specific to an image
function collectCards(json) {
  const shuffledArray = shuffleArray(gameDeck);
  //change shuffleArray(gameDeck) to gameDeck to troubleshoot (won't shuffle)
  const cards = document.getElementsByClassName("card");
  for (let i = 0; i < cards.length; i++) {
    addCardListener(cards[i], shuffledArray[i]);
  }
}

//modern version of fischer-yates shuffle algorithm, shuffles array.
function shuffleArray(array) {
  var j, x, i;
  for (i = array.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    x = array[i];
    array[i] = array[j];
    array[j] = x;
  }
  return array;
}
//push 2 of the same card to gameDeck (for matching)
function addCardToDeck(json) {
  gameDeck.push({
    id: json.id,
    image: json.attributes.img,
    name: json.attributes.name,
    matched: false
  });
  gameDeck.push({
    id: "a" + json.id,
    image: json.attributes.img,
    name: json.attributes.name,
    matched: false
  }); //2 of each card
}

//adds a 'flipping' listener to each card on click
function addCardListener(card, shuffledArray) {
  card.addEventListener("click", function() {
    //fixes bug where you could click the
    // same card twice and get a match
    if (this.id != matchId[1]) {
      //currentFlipped resets every 2nd click,
      // and triggers a match check (doTheyMatch)
      if (currentFlipped != 2) {
        currentFlipped += 1;
        if (currentFlipped % 2 === 0) {
          totalFlips += 1;
          //increments score, by pair of clicks.
        }
        card.style.backgroundImage = `
          url('${shuffledArray.image}')
        `; //changes div image
        card.style.id = shuffledArray.id;
        matchId.push(card.style.id, card.id);
        //card.style.id is the id of the json image,
        // card.id is the id of the div, used for determining matches
        if (currentFlipped === 2) {
          doTheyMatch();
        }
      }
    }
  });
}

//makes a game board of a certain number of rows of 8 cards.
function makeBoardOfXRows(rows) {
  gameBoardDimensions(rows);
  for (var i = 0; i < rows; i++) {
    for (var j = 0; j < 8; j++) {
      const card = document.createElement("div");
      card.className = "card";
      card.id = `id-${i}${j}`;
      game.appendChild(card);
    }
  }
}

function gameBoardDimensions(rows) {
  switch (rows) {
    case 1:
      game.style.height = "185px";
      break;
    case 2:
      game.style.height = "350px";
      break;
    case 3:
      game.style.height = "520px";
      break;
    default:
      game.style.height = "690px";
  }
}

function doTheyMatch() {
  if (
    matchId[0].toString() === "a" + matchId[2] ||
    "a" + matchId[0] === matchId[2].toString()
  ) {
    // if (matchId[0] === matchId[2] && matchId[1] != matchId[3])
    // { //also works, remove the "a" assignment from addCardToDeck. Less good, as id's should be unique
    theyMatch();
  } else {
    setTimeout(changeBack, 900);
    //Want to make this a click event, not a timeout,
    // but cant get the click working over the entire page.
    // Currently, it only works 'not on a card div'
  }
}

function theyMatch() {
  window.setTimeout(changeMatching, 500);
}

//makes a clone of the divs, removes the original
// (and their associated event listeners), sets the new clone opacity,
// resets the matchId array, resets the currently flipped cards counter
function changeMatching() {
  document.getElementById(matchId[1]).className = "matched";
  document.getElementById(matchId[3]).className = "matched";
  // document.getElementById(matchId[1]).style.opacity = 0.4;
  // document.getElementById(matchId[3]).style.opacity = 0.4;
  matchId = [];
  currentFlipped = 0;
}

//removes all event listeners, clones and appends div (so no more clicks can occur)
function makeClone(e) {
  const element = document.getElementById(matchId[e]);
  var clone = element.cloneNode();
  while (element.firstChild) {
    clone.appendChild(element.lastChild);
  }
  element.parentNode.replaceChild(clone, element);
}

//on wrong guesses, changes card image back
// to the 'back' of the card. resets matchId and currentFlipped
function changeBack() {
  document.getElementById(matchId[1]).style.background = "#209CEE";
  document.getElementById(matchId[3]).style.background = "#209CEE";
  matchId = [];
  currentFlipped = 0;
}

function checkGameStatus() {
  const matchedCards = document.getElementsByClassName("matched");
  const currentTime = document.getElementsByClassName("timer-count")[0]
    .innerText;
  if (matchedCards.length === howManyRows * 8) {
    const win = document.createElement("div");
    win.innerText = `YOU WIN! You took ${totalFlips} tries in ${currentTime} seconds.`;
    win.className = "win";
    game.appendChild(win);
    document.getElementsByClassName("timer-count")[0].innerText = currentTime;
    // postGameData();
  }
}

// 'Log in' a user. Just checks input name against json data, makes a new user in api if the name doesnt match any records
function logInUser() {
  const username = document.getElementById("nameInput").value;
  // WE NEED TO MAKE THIS THE HEROKU URL
  fetch("https://cognizance.herokuapp.com/api/v1/users")
    .then(res => res.json())
    .then(json => checkCurrentUser(json.data, username));
  document.getElementById("nameInput").value = "";
}

function checkCurrentUser(json, username) {
  let userHere = false;
  json.forEach(function(json) {
    // debugger;
    if (json.attributes.name === username) {
      userHere = true;
      fetchUser(json, username);
    }
  });
  if (!userHere) {
    makeUser(username);
  }
}

function fetchUser(json, username) {
  // debugger;
  currentUser.innerText = username;
}

function makeUser(username) {
  // debugger;
  fetch("https://cognizance.herokuapp.com/api/v1/users", {
    method: "post",

    body: JSON.stringify({ user: { name: username, highscore: 0 } }),
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    }
  });
  setUser(username);
}

function setUser(username) {
  currentUser.innerText = username;
}

//-------------------

// FUNCTIONS THAT NEED TO BE WORKED ON

// function postGameData() {
//   fetch("http://localhost:3000/users", {
//     method: "post",
//     headers: {
//       "Content-Type": "application/json"
//     },
//     body: JSON.stringify({ highscore: `${totalFlips}` })
//   });
// }

// function updateGame() {
//   const body = { gameArray: shuffledArray };
//   fetch("http://localhost:3000/cards", {
//     method: "patch",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(body)
//   });
// }
