// Code your JavaScript / jQuery solution here

var turn = 0;
var currentGame = false;
const wins = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
]

$(document).ready(function() {
  attachListeners();
});

function attachListeners() {
  $('td').on('click', function() {
    if (!$.text(this) && !checkWinner()) {
      doTurn(this);
    }
  });

  $('button#save').on('click', saveGame);
  $('button#previous').on('click', previousGames);
  $('button#clear').on('click', clearGame);
}

function player() {
  return (turn % 2 === 0 ? 'X' : 'O');
}

function updateState(square) {
  $(square).append(player());
}

function setMessage(string) {
  document.getElementById('message').innerHTML = string;
}

function checkWinner() {
  let win = false;

  for (const arr of wins) {
    if ($('td')[arr[0]].innerHTML !== '' && $('td')[arr[0]].innerHTML === $('td')[arr[1]].innerHTML && $('td')[arr[1]].innerHTML === $('td')[arr[2]].innerHTML) {
      setMessage(`Player ${$('td')[arr[0]].innerHTML} Won!`)
      win = true;
    }
  }
  return win;
}

function doTurn(ele) {
  updateState(ele);
  turn +=1;
  if (checkWinner()){
    turn = 0;
    saveGame();
    clearGame();
  }else if (turn === 9) {
    setMessage('Tie game.');
    saveGame();
    clearGame();
  }
}

function previousGames() {
  $.get('/games', function(response) {
    $('#games').html(response);
    let myGames = '';
    for (var i=0; i < response.data.length; i++) {
      let game = response.data[i];
      myGames += `<button onclick="loadGame(${game.id})">${game.id}</button>`;
    }
    $("#games").html(myGames);
  });
}

function clearGame(){
  $('td').empty();
  turn = 0;
  currentGame = 0;
}

function loadGame(currentGame) {
  $.get(`/games/${currentGame}`, function(game) {
    var state = game['data']['attributes']['state'];
    $('td').empty();
    $('td').text(function(index) {
      return state[index];
    });
    turn = state.join("").length
    currentGame = game['data']['id'];
  });
}

function saveGame() {
  var state = [];
  $('td').text((index, ele) => {state.push(ele)});
  if(currentGame) {
    $.ajax({
      type: 'PATCH',
      url: `/games/${currentGame}`,
      data: {state: state}
    });
  } else {
    $.post('/games', {state: state}, function(game) {
      currentGame = game['data']['id'];
    });
  }
}
