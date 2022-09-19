'use strict';

const SQUARE_SIZE = 85
const SQUARE_ROWS = 8
const SQUARE_COLS = 8
const SQUARE_INIT = 1
const PIECES = 3 // knight, bishop, rook
const WHITE = '#e7e6e6'
const BLACK = '#7196b2'
const YELLOW = '#d9a95e'
const RED = '#ed6767'
const canvas = document.getElementById('game')
const headerInfo = document.getElementById('header-info')
const gameStats = document.getElementById('game-stats')
const ctx = canvas.getContext('2d')

let tiles = []
let moveList = []
let points = 0
let best = JSON.parse(localStorage.getItem('best-pts') ?? '{"points":0}')

const rookMove = (from) => {
    moveList = []
    for (let j = 0; j < SQUARE_COLS; j++){
        let move = {
           x: from.x,
           y: j
        }
        moveList.push(move)
        move = {
           x: j,
           y: from.y
        }
        moveList.push(move)
        }
    moveList.splice(moveList.findIndex(t => t.x === from.x && t.y === from.y), 1)
    moveList.splice(moveList.findIndex(t => t.x === from.x && t.y === from.y), 1)
    return moveList
}

const bishMove = (from) => {
    moveList = []
    for (let j = 1; j < SQUARE_COLS; j++){
        if (from.x + j < SQUARE_COLS && from.y + j < SQUARE_ROWS){
            let move = {
                x: from.x + j,
                y: from.y + j
            
            }
            moveList.push(move)
        }
        if (from.x - j >= 0 && from.y - j >= 0){
            let move = {
                x: from.x - j,
                y: from.y - j
            
            }
            moveList.push(move)
        }
        if (from.x + j < SQUARE_COLS && from.y - j >= 0){
            let move = {
                x: from.x + j,
                y: from.y - j
            
            }
            moveList.push(move)
        }
        if (from.x - j >= 0 && from.y + j < SQUARE_ROWS){
            let move = {
                x: from.x - j,
                y: from.y + j
            
            }
            moveList.push(move)
        }
    }
    return moveList
}

const knightMove = (from) => {
    moveList = []
    for (let i = 1; i <= 2; i++){
        for (let j = 1; j <= 2; j++){
            if (i == j){
                continue
            }
            if (from.x + i < SQUARE_COLS && from.y + j < SQUARE_ROWS){
                let move = {
                    x: from.x + i,
                    y: from.y + j
                
                }
                moveList.push(move)
            }
            if (from.x - i >= 0 && from.y - j >= 0){
                let move = {
                    x: from.x - i,
                    y: from.y - j
                
                }
                moveList.push(move)
            }
            if (from.x + i < SQUARE_COLS && from.y - j >= 0){
                let move = {
                    x: from.x + i,
                    y: from.y - j
                
                }
                moveList.push(move)
            }
            if (from.x - i >= 0 && from.y + j < SQUARE_ROWS){
                let move = {
                    x: from.x - i,
                    y: from.y + j
                
                }
                moveList.push(move)
            }
                    
        }
    }
    return moveList
}

const queenMove = (from) => {
    moveList = []
    let rookMoves = rookMove(from)
    let bishMoves = bishMove(from)
    moveList = moveList.concat(rookMoves)
    moveList.concat(bishMoves)

    return moveList
}




const resetSession = () => {
    if (points === best.points) {
        localStorage.setItem('best-pts', JSON.stringify(best))
    }
    points = 0
    canvas.style.pointerEvents = "none"
    startPage()
}
const handleClick = event => {
    const tile = {
        x: Math.floor((event.clientX - canvas.offsetLeft + window.scrollX) / SQUARE_SIZE),
        y: Math.floor((event.clientY - canvas.offsetTop + window.scrollY) / SQUARE_SIZE)
    }

    const here = getTileHere(tile)
    if (here !== undefined && getTileColor(here) == YELLOW) {
        removeTileHere(here)
        update()
    } else {
        resetSession()
    }
}

const handleRelease = event => {
    const tile = {
        x: Math.floor((event.clientX - canvas.offsetLeft + window.scrollX) / SQUARE_SIZE),
        y: Math.floor((event.clientY - canvas.offsetTop + window.scrollY) / SQUARE_SIZE)
    }

    const here = getTileHere(tile)
    if (here !== undefined && getTileColor(here) == RED && tiles.length == 1) {
        newTile()

        removeTileHere(here)
        points++

        if (points > best.points) {
            best.points = points
        }
        update()
    } else {
        resetSession()
    }
    
}
const newTile = () => {
    let tile = {}
    tile = {
        x: Math.floor(Math.random() * SQUARE_COLS),
        y: Math.floor(Math.random() * SQUARE_ROWS),
        color: YELLOW
    }
    let piece = Math.floor(Math.random() * PIECES)
    switch (piece){
        case 0:
            moveList = knightMove(tile)
            console.log("Knight move")
            break
        case 1:
            moveList = bishMove(tile)
            console.log("Bishop move")
            break
        case 2:
            moveList = rookMove(tile)
            console.log("Rook move")
            break
    }
    let index = Math.floor(Math.random() * moveList.length)
    tiles.push(tile)
    let destination = moveList[index]
    destination.color = RED
    tiles.push(destination)
}


const getTileHere = ({x, y}) => tiles.find(t => t.x === x && t.y === y)
const getTileColor = (tile) => tile.color
const removeTileHere = ({x, y}) => tiles.splice(tiles.findIndex(t => t.x === x && t.y === y), 1)

const resetBoard = () => {
    for (let i = 0; i < SQUARE_ROWS; i++) {
        for (let j = 0; j < SQUARE_COLS; j++) {
            if ((i % 2 == 0) && (j % 2 != 0) || (i % 2 != 0) && (j % 2 == 0)){
                ctx.fillStyle = BLACK
            } else {
                ctx.fillStyle = WHITE 
            }
            ctx.fillRect(j * SQUARE_SIZE, i * SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE)
        }
    }
    for (const tile of tiles) {
        ctx.fillStyle = tile.color
        ctx.fillRect(tile.x * SQUARE_SIZE, tile.y * SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE)
    }
    
}

const initBoard = () => {
    points = 0
    canvas.style.pointerEvents = "auto"
    tiles = []
    for (let i = 0; i < SQUARE_INIT; i++) {
        newTile()
    }
    for (let i = 0; i < SQUARE_ROWS; i++) {
        for (let j = 0; j < SQUARE_COLS; j++) {
            if ((i % 2 == 0) && (j % 2 != 0) || (i % 2 != 0) && (j % 2 == 0)){
                ctx.fillStyle = BLACK
            } else {
                ctx.fillStyle = WHITE 
            }
            ctx.fillRect(j * SQUARE_SIZE, i * SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE)
        }
    }
    for (const tile of tiles) {
        ctx.fillStyle = tile.color
        ctx.fillRect(tile.x * SQUARE_SIZE, tile.y * SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE)
    }
    update()
}

const update = () => {
    let textInfo = `Score: ${points}<br>`
    if (points === best.points) {
        textInfo += `Best Score:${best.points}`
    } else {
        textInfo += `Best Score: ${best.points}`
    }
    gameStats.innerHTML = textInfo
    resetBoard()
    requestAnimationFrame(update)
}

const startPage = () => {
    const startText= `Chess Mouse Accuracy Trainer`
    headerInfo.innerHTML = startText 
    let textInfo = `Score: ${points}<br>`
    if (points === best.points) {
        textInfo += `Best Score:${best.points}`
    } else {
        textInfo += `Best Score: ${best.points}`
    }
    gameStats.innerHTML = textInfo

    ctx.clearRect(0, 0, canvas.width, canvas.height) 
    requestAnimationFrame(startPage)

}


window.onload = () => {
    startPage()

    document.addEventListener('keydown', initBoard)
    canvas.addEventListener('mousedown', handleClick)
    canvas.addEventListener('mouseup', handleRelease)

}
