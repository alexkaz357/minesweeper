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
var gIsClickable;
var gLifes;
var gEmoji;
var gShownCells;
var gIsHintProcess;

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
  gIsClickable = true;
  gIsFirstClick = false;
  gIsGameOver = false;
  gMarkedMinesCounter = 0;
  gShownCellsCounter = 0;
  gBoard = buildBoard(gLevel.SIZE);
  renderBoard(gBoard);
  showHints();
  gLifes = 3;
  showLife();
  gEmoji = document.querySelector('.emoji');
  changeEmoji();
  gShownCells = [];
  gIsHintProcess = false;
  showSafe();
}

function buildBoard(size) {
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
        isMarked: false,
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
        coord = {
          i: i,
          j: j
        };
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
  strHTML += '<table oncontextmenu="return false">\n<tbody>';
  for (var i = 0; i < board.length; i++) {
    strHTML += '\n<tr>\n';
    for (var j = 0; j < board[0].length; j++) {
      var currCell = board[i][j];
      if (currCell.isShown || currCell.isMarked) {
        strHTML += `\t<td id="${i}_${j}" class="shown" data-i="${i}" data-j="${j}" onclick="cellClicked(this, +this.dataset.i, +this.dataset.j)" oncontextmenu="cellMarked(+this.dataset.i, +this.dataset.j)">`;
      } else {
        strHTML += `\t<td id="${i}_${j}" class="not-shown" data-i="${i}" data-j="${j}" onclick="cellClicked(this, +this.dataset.i, +this.dataset.j)" oncontextmenu="cellMarked(+this.dataset.i, +this.dataset.j)">`;
      }
      if (currCell.isMarked) strHTML += FLAG;
      if (currCell.isShown && currCell.isMine) strHTML += MINE;
      if (currCell.isShown && !currCell.isMine) {
        currCell.minesAroundCount = setMinesNegsCount({
          i,
          j
        });

        if (currCell.minesAroundCount === 0) strHTML += EMPTY;
        else strHTML += currCell.minesAroundCount;
      }
      strHTML += '</td>\n';
    }
    strHTML += '</tr>\n';
  }
  strHTML += '</tbody>\n</table>';
  var elBoard = document.querySelector('.board');
  elBoard.innerHTML = strHTML;
}

function easyDiff() {
  var diff = document.querySelector('.diff');
  diff.innerText = 'Easy (4x4)';
  gLevel.SIZE = 4;
  gLevel.MINES = 2;
  initGame();
  gEmoji.innerText = '🙂';
}

function mediumDiff() {
  var diff = document.querySelector('.diff');
  diff.innerText = 'Medium (8x8)';
  gLevel.SIZE = 8;
  gLevel.MINES = 12;
  initGame();
  gEmoji.innerText = '😁';
}

function hardDiff() {
  var diff = document.querySelector('.diff');
  diff.innerText = 'Hard (12x12)';
  gLevel.SIZE = 12;
  gLevel.MINES = 30;
  initGame();
  gEmoji.innerText = '😎';
}

function changeEmoji() {
  var diff = document.querySelector('.diff');
  if (diff.innerText === 'Easy (4x4)') {
    gEmoji.innerText = '🙂';
  } else if (diff.innerText === 'Medium (8x8)') {
    gEmoji.innerText = '😁';
  } else if (diff.innerText === 'Hard (12x12)') {
    gEmoji.innerText = '😎';
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

function cellClicked(elCell, i, j) {
  if (!gIsClickable) return;
  if (gIsShowingCells) {
    gIsClickable = false;
    gCellClickedPos = {
      i,
      j
    };
    showCells();
    setTimeout(function () {
      hideCells();
      renderBoard(gBoard);
      gIsShowingCells = false;
      gIsClickable = true;
      gIsHintProcess = false;
    }, 1000);
  }
  if (gIsHintProcess) {
    renderBoard(gBoard);
    return;
  }
  if (gBoard[i][j].isMarked) return;
  if (gBoard[i][j].isMarked && gBoard[i][j].isMine) return;
  if (checkIfWon()) return;
  checkGameOver(elCell, i, j);
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
  checkIfWon();

  if (gBoard[i][j].isMine) {
    var cellId = elCell.id.split('_');
    document.getElementById(`${cellId[0]}_${cellId[1]}`).style.backgroundColor = 'red';
  }
}

function cellMarked(i, j) {
  if (!gIsClickable) return;
  if (gBoard[i][j].isShown) return;
  if (checkIfWon()) return;
  if (!gIsFirstClick) {
    for (var idx = 0; idx < gLevel.MINES; idx++) setMines(i, j);
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
  if (gLifes < 1) return;
  var elLife = document.querySelector(`.life${gLifes}`);
  elLife.style.visibility = 'hidden';
}

function showLife() {
  for (var i = 0; i < 3; i++) {
    var hint = document.querySelector(`.life${i+1}`);
    hint.style.visibility = 'visible';
  }
}

function checkGameOver(elCell, i, j) {
  if (gLifes < 1) return;
  if (gBoard[i][j].isMine) {
    setTimeout(() => {
      if (gLifes >= 1) {
        gBoard[i][j].isShown = false;
        renderBoard(gBoard);
      }
    }, 1000);
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
    var cellId = elCell.id.split('_');
    document.getElementById(`${cellId[0]}_${cellId[1]}`).style.backgroundColor = 'red';
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
  gBoard[pos.i][pos.j].isShown = true;
  if (!setMinesNegsCount(pos)) {
    for (var i = pos.i - 1; i <= pos.i + 1; i++) {
      if (i < 0 || i >= gBoard.length) continue;
      for (var j = pos.j - 1; j <= pos.j + 1; j++) {
        if (j < 0 || j >= gBoard[i].length) continue;
        var currItem = gBoard[i][j];
        if (currItem.isMarked) continue;
        if (currItem.isShown) continue;
        expandShown({
          i,
          j
        });
      }
    }
  } else if (setMinesNegsCount(pos)) {
    gBoard[pos.i][pos.j].isShown = true;
  }
}

function showCells() {
  gIsHintProcess = true;
  var pos = gCellClickedPos;
  for (var i = pos.i - 1; i <= pos.i + 1; i++) {
    if (i < 0 || i >= gBoard.length) continue;
    for (var j = pos.j - 1; j <= pos.j + 1; j++) {
      if (j < 0 || j >= gBoard[i].length) continue;
      var currItem = gBoard[i][j];
      if (currItem.isMarked) continue;
      if (currItem.isShown) gShownCells.push({
        i: currItem.position.i,
        j: currItem.position.j
      });
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
  for (var idx = 0; idx < gShownCells.length; idx++) gBoard[gShownCells[idx].i][gShownCells[idx].j].isShown = true;
  gShownCells = [];
}

function hintHandle(elHint) {
  if (!gIsClickable) return;
  if (gIsGameOver) return;
  if (!gIsFirstClick) return;
  elHint.style.textShadow = '0px 0px 15px gold';
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

function safeHandle(elSafe) {
  if (!gIsClickable) return;
  if (gIsGameOver) return;
  if (!gIsFirstClick) return;
  elSafe.style.textShadow = '0px 0px 15px greenyellow';
  setTimeout(function () {
    elSafe.style.visibility = 'hidden'
  }, 1000);
  showSafeClick();
}

function showSafe() {
  for (var i = 0; i < 3; i++) {
    var hint = document.querySelector(`.click${i+1}`);
    hint.style.visibility = 'visible';
    hint.style.textShadow = '';
  }
}

function showSafeClick() {
  gIsClickable = false;
  var empties = [];
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[i].length; j++) {
      var cell = gBoard[i][j];
      if (cell.isShown) continue;
      if (cell.isMarked) continue;
      if (!cell.isMine) {
        coord = {
          i: i,
          j: j
        };
        empties.push(coord);
      }
    }
  }
  var coord = empties[getRandomInt(0, empties.length)];
  var elCell = document.getElementById(`${coord.i}_${coord.j}`);
  elCell.style.backgroundColor = 'rgb(242, 175, 255)';
  setTimeout(() => {
    renderBoard(gBoard);
    gIsClickable = true;
  }, 1000);
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