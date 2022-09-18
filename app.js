'use strict';

const SQUARE_SIZE = 85
const SQUARE_ROWS = 8
const SQUARE_COLS = 8
const SQUARE_INIT = 1
const WHITE = '#e7e6e6'
const BLACK = '#7196b2'
const YELLOW = '#d9a95e'
const RED = '#ed6767'
const canvas = document.getElementById('game')
const infos = document.getElementById('game-info')
const ctx = canvas.getContext('2d')

let tiles = []
let points = 0
let best = JSON.parse(localStorage.getItem('best-pts') ?? '{"points":0}')

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
        x: Math.floor((event.clientX - canvas.offsetLeft) / SQUARE_SIZE),
        y: Math.floor((event.clientY - canvas.offsetTop) / SQUARE_SIZE)
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
        x: Math.floor((event.clientX - canvas.offsetLeft) / SQUARE_SIZE),
        y: Math.floor((event.clientY - canvas.offsetTop) / SQUARE_SIZE)
    }

    const here = getTileHere(tile)
    if (here !== undefined && getTileColor(here) == RED && tiles.length == 1) {
        newTile(RED)
        newTile(YELLOW)

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

const newTile = (new_color) => {
    let tile = {}
    do {
        tile = {
            x: Math.floor(Math.random() * SQUARE_COLS),
            y: Math.floor(Math.random() * SQUARE_ROWS),
            color: new_color 
        }
    } while (getTileHere(tile) !== undefined)
    tiles.push(tile)
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
        newTile(YELLOW)
        newTile(RED)
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
    infos.innerHTML = textInfo
    resetBoard()
    requestAnimationFrame(update)
}

const startPage = () => {
    const startText= `Press any key to start`
    infos.innerHTML = startText 

    ctx.clearRect(0, 0, canvas.width, canvas.height) 
    requestAnimationFrame(startPage)

}


window.onload = () => {
    startPage()

    document.addEventListener('keydown', initBoard)
    canvas.addEventListener('mousedown', handleClick)
    canvas.addEventListener('mouseup', handleRelease)

}
