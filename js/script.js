'use strict';

const MINE = '💣';
const FLAG = '🚩';

var gBoard;
var gTimer;
var gIsFirstClick;
var gElapsedTime;
var gIsGameOver;
var gMarkedMinesCounter;
var gShownCellsCounter;

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
  clearInterval(gTimer); ///////////////// check if needed
  gTimer = 0;
  gIsGameOver = false;
  gIsFirstClick = false;
  gMarkedMinesCounter = 0;
  gShownCellsCounter = 0;
  gBoard = buildBoard();
  renderBoard(gBoard);
}

function buildBoard(size = 4) {
  var board = [];

  for (var i = 0; i < size; i++) {
    board[i] = []
    for (var j = 0; j < size; j++) {
      var cell = {
        position: {
          i: i,
          j: j
        },
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

function setMines() { /////////////same place bombs
  for (var i = 0; i < gLevel.MINES; i++) {
    var randNumI = getRandomInt(0, gBoard.length);
    var randNumJ = getRandomInt(0, gBoard.length);
    gBoard[randNumI][randNumJ].isMine = true;
  }
}

function renderBoard(board) {
  var strHTML = '';
  strHTML += '<table>\n<tbody>';
  for (var i = 0; i < board.length; i++) {
    strHTML += '\n<tr>\n';
    for (var j = 0; j < board[0].length; j++) {
      var currCell = board[i][j];
      strHTML += `\t<td data-i="${i}" data-j="${j}" onclick="cellClicked(this, +this.dataset.i, +this.dataset.j)" oncontextmenu="cellMarked(this, +this.dataset.i, +this.dataset.j)">`;
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

// function renderCell(location, value) {
// 	var cellSelector = '.' + getClassName(location)
// 	var elCell = document.querySelector(cellSelector);
// 	elCell.innerHTML = value;
// }

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

function firstClick() {
  ///////////////////////////////first click DRY
}

function cellClicked(elCell, i, j) { /////////// elCell
  if (gBoard[i][j].isMarked) return;
  if (gBoard[i][j].isMarked && gBoard[i][j].isMine) return;
  if (checkIfWon()) return;
  checkGameOver(i, j);
  if (gIsGameOver) return; ///////////// check
  console.log('ggg'); ////////////////log
  if (!gIsFirstClick) {
    setMines();
    timer();
    gIsFirstClick = true;
  }
  gBoard[i][j].isShown = true;
  renderBoard(gBoard); ////////////////////////try with render cell

  if (!gBoard[i][j].isMine && gBoard[i][j].isShown) gShownCellsCounter++;
  checkIfWon()

  console.log(gShownCellsCounter);

  console.log(gBoard);
}

function cellMarked(elCell, i, j) { //////////////elCell
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
  if (gBoard[i][j].isMine && gBoard[i][j].isMarked) gMarkedMinesCounter++;
  checkIfWon();
  console.log(gMarkedMinesCounter);
  console.log(gBoard);
}

function checkGameOver(i, j) {
  if (gBoard[i][j].isMine) {
    clearInterval(gTimer);
    for (var i = 0; i < gBoard.length; i++) {
      for (var j = 0; j < gBoard.length; j++) {
        if (gBoard[i][j].isMine) gBoard[i][j].isShown = true;
      }
    }
    renderBoard(gBoard);
    gIsGameOver = true;
    return;
  }
}

function checkIfWon() {
  if (gMarkedMinesCounter === gLevel.MINES && gShownCellsCounter === (gLevel.SIZE ** 2 - gLevel.MINES)) {
    console.log('you won');
    clearInterval(gTimer);
    return true;
  } else return false;
}


function expandShown(board, elCell, i, j) {

  // When user clicks a cell with no
  // mines around, we need to open
  // not only that cell, but also its
  // neighbors.
  // NOTE: start with a basic
  // implementation that only opens
  // the non-mine 1st degree
  // neighbors

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

document.addEventListener('contextmenu', event => event.preventDefault());