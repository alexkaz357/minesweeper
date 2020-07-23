'use strict';

const MINE = '💣';
const FLAG = '🚩';
const EMPTY = '';

var gBoard;
var gTimer;
var gIsFirstClick;
var gElapsedTime;
var gMarkedMinesCounter;
var gShownCellsCounter;
var gIsGameOver;
var gCellClickedPos;
var gIsShowingCells;
var gEmoji = document.querySelector('.emoji');
var gLifes = 3;

var gLevel = {
  SIZE: 4,
  MINES: 2
}

var gGame = {
  isOn: false,
  showCount: 0,
  markedCount: 0,
  secsPassed: 0
}

function initGame() {
  resetTimer();
  gCellClickedPos = null;
  gIsShowingCells = false;
  gIsFirstClick = false;
  gIsGameOver = false;
  gMarkedMinesCounter = 0;
  gShownCellsCounter = 0;
  gBoard = buildBoard(gLevel.SIZE);
  renderBoard(gBoard);
  showHints();
  gEmoji.innerText = '😁';
  gLifes = 3;
  showLife();
}

function buildBoard(size) {
  var board = [];
  for (var i = 0; i < size; i++) {
    board[i] = []
    for (var j = 0; j < size; j++) {
      var cell = {
        position: {i: i, j: j},
        minesAroundCount: 0,
        isShown: false,
        isMine: false,
        isMarked: false
      }
      board[i][j] = cell;
    }
  }
  return board;
}

function setMines(idxI, idxJ) {
  var empties = [];
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[i].length; j++) {
      var cell = gBoard[i][j];
      if (!cell.isMine) {
        coord = {i: i, j: j};
        if (coord.i === idxI && coord.j === idxJ) continue;
        empties.push(coord);
      }
    }
  }
  var coord = empties[getRandomInt(0, empties.length)];
  gBoard[coord.i][coord.j].isMine = true;
}

function renderBoard(board) {
  var strHTML = '';
  strHTML += '<table oncontextmenu="return false;">\n<tbody>';
  for (var i = 0; i < board.length; i++) {
    strHTML += '\n<tr>\n';
    for (var j = 0; j < board[0].length; j++) {
      var currCell = board[i][j];
      strHTML += `\t<td id="${i}_${j}" data-i="${i}" data-j="${j}" onclick="cellClicked(+this.dataset.i, +this.dataset.j)" oncontextmenu="cellMarked(+this.dataset.i, +this.dataset.j)">`;
      if (currCell.isMarked) strHTML += FLAG;
      if (currCell.isShown && currCell.isMine) strHTML += MINE;
      if (currCell.isShown && !currCell.isMine) {
        currCell.minesAroundCount = setMinesNegsCount({
          i,
          j
        });
        strHTML += currCell.minesAroundCount;
      }
      strHTML += '</td>\n';
    }
    strHTML += '</tr>\n';
  }
  strHTML += '</tbody>\n</table>';
  var elBoard = document.querySelector('.board');
  elBoard.innerHTML = strHTML;
}

function changeDiff() {
  var diff = document.querySelector('.diff');
  if (diff.innerText === 'Beginner') {
    diff.innerText = 'Medium';
    gLevel.SIZE = 8;
    gLevel.MINES = 12;
    initGame();
    return;
  } else if (diff.innerText === 'Medium') {
    diff.innerText = 'Expert';
    gLevel.SIZE = 12;
    gLevel.MINES = 30;
    initGame();
    return;
  } else if (diff.innerText === 'Expert') {
    diff.innerText = 'Beginner';
    gLevel.SIZE = 4;
    gLevel.MINES = 2;
    initGame();
    return;
  }
}

function setMinesNegsCount(pos) {
  var minesAroundCount = 0;
  for (var i = pos.i - 1; i <= pos.i + 1; i++) {
    if (i < 0 || i >= gBoard.length) continue;
    for (var j = pos.j - 1; j <= pos.j + 1; j++) {
      if (j < 0 || j >= gBoard[i].length) continue;
      var currItem = gBoard[i][j];
      if (currItem.isMine) minesAroundCount++;
    }
  }
  return minesAroundCount;
}

function cellClicked(i, j) {
  if (gIsShowingCells) {
    gCellClickedPos = {
      i,
      j
    };
    showCells();
    setTimeout(function () {
      hideCells();
      renderBoard(gBoard);
      gIsShowingCells = false;
    }, 1000);
  }

  if (gBoard[i][j].isMarked) return;
  if (gBoard[i][j].isMarked && gBoard[i][j].isMine) return;
  if (checkIfWon()) return;
  checkGameOver(i, j);
  if (gIsGameOver) {
    gEmoji.innerText = '🤬';
    return;
  }
  if (!gIsFirstClick) {
    gBoard[i][j].isShown = true;
    for (var idx = 0; idx < gLevel.MINES; idx++) setMines(i, j);
    timer();
    gIsFirstClick = true;
  }
  expandShown({
    i,
    j
  })
  renderBoard(gBoard);
  checkIfWon()
}

function cellMarked(i, j) {
  if (gBoard[i][j].isShown) return;
  if (checkIfWon()) return;
  if (!gIsFirstClick) {
    setMines();
    timer();
    gIsFirstClick = true;
  }
  if (gIsGameOver) return;
  if (!gBoard[i][j].isMarked) gBoard[i][j].isMarked = true;
  else if (gBoard[i][j].isMarked) gBoard[i][j].isMarked = false;
  renderBoard(gBoard);
  checkIfWon();
}

function handleLife() {
  var elLife = document.querySelector(`.life${gLifes}`);
  elLife.style.visibility = 'hidden';
}

function showLife() {
  for (var i = 0; i < 3; i++) {
    var hint = document.querySelector(`.life${i+1}`);
    hint.style.visibility = 'visible';
  }
}

function checkGameOver(i, j) {
  if (gBoard[i][j].isMine) {
    handleLife();
    gLifes--;
  }
  if (gLifes === 0) {
    clearInterval(gTimer);
    for (var i = 0; i < gBoard.length; i++) {
      for (var j = 0; j < gBoard.length; j++) {
        if (gBoard[i][j].isMine) gBoard[i][j].isShown = true;
        if (gBoard[i][j].isMine && gBoard[i][j].isMarked) gBoard[i][j].isMarked = false;
      }
    }
    renderBoard(gBoard);
    gIsGameOver = true;
    return;
  }
}

function checkIfWon() {
  gShownCellsCounter = 0;
  gMarkedMinesCounter = 0;
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[0].length; j++) {
      if (gBoard[i][j].isShown && !gBoard[i][j].isMine) gShownCellsCounter++;
      if (gBoard[i][j].isMine && gBoard[i][j].isMarked) gMarkedMinesCounter++;
    }
  }
  if (gMarkedMinesCounter === gLevel.MINES && gShownCellsCounter === (gLevel.SIZE ** 2 - gLevel.MINES)) {
    gEmoji.innerText = '🥳';
    clearInterval(gTimer);
    return true;
  } else return false;
}

function expandShown(pos) {
  if (!setMinesNegsCount(pos)) {
    for (var i = pos.i - 1; i <= pos.i + 1; i++) {
      if (i < 0 || i >= gBoard.length) continue;
      for (var j = pos.j - 1; j <= pos.j + 1; j++) {
        if (j < 0 || j >= gBoard[i].length) continue;
        var currItem = gBoard[i][j];
        if (currItem.isMarked) continue;
        if (!currItem.isShown) currItem.isShown = true;
      }
    }
  } else if (setMinesNegsCount(pos)) {
    gBoard[pos.i][pos.j].isShown = true;
  }
}

function showCells() {
  var pos = gCellClickedPos;
  for (var i = pos.i - 1; i <= pos.i + 1; i++) {
    if (i < 0 || i >= gBoard.length) continue;
    for (var j = pos.j - 1; j <= pos.j + 1; j++) {
      if (j < 0 || j >= gBoard[i].length) continue;
      var currItem = gBoard[i][j];
      currItem.isShown = true;
    }
  }
}

function hideCells() {
  var pos = gCellClickedPos;
  for (var i = pos.i - 1; i <= pos.i + 1; i++) {
    if (i < 0 || i >= gBoard.length) continue;
    for (var j = pos.j - 1; j <= pos.j + 1; j++) {
      if (j < 0 || j >= gBoard[i].length) continue;
      var currItem = gBoard[i][j];
      currItem.isShown = false;
    }
  }
}

function hintHandle(elHint) {
  elHint.style.textShadow = '2px 2px 5px red';
  setTimeout(function () {
    elHint.style.visibility = 'hidden'
  }, 1000);
  gIsShowingCells = true;
}

function showHints() {
  for (var i = 0; i < 3; i++) {
    var hint = document.querySelector(`.hint${i+1}`);
    hint.style.visibility = 'visible';
    hint.style.textShadow = '';
  }
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function timer() {
  var startTime = Date.now();
  var time = document.querySelector('.timer')

  gTimer = setInterval(function () {
    gElapsedTime = Date.now() - startTime;
    time.innerText = (gElapsedTime / 1000).toFixed(0);
  }, 1000);
}

function resetTimer() {
  var elCounter = document.querySelector('.timer');
  elCounter.innerText = 0;
  clearInterval(gTimer);
  gTimer = 0;
}