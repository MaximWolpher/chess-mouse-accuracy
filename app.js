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
const GREEN = '#a7e05e'
const GRAY = '#333538'
const canvas = document.getElementById('game')
const headerInfo = document.getElementById('header-info')
const knight_option = document.getElementById("knight-option")
const bishop_option = document.getElementById("bishop-option")
const rook_option = document.getElementById("rook-option")
const stats_button = document.getElementById("stats-button")
const ctx = canvas.getContext('2d')

let gaugeStart = 80
let interval = null
let intervalReduce = 50
let minIntSpeed = 300
let gaugeIncrease = 3
let initIntervalSpeed = 1000
let intervalSpeed = 1000
let isPaused = true
let tiles = []
let moveList = []
let points = 0
let best = JSON.parse(localStorage.getItem('best-pts') ?? '{"points":0}')
let overallStartTime = Date.now()
let moveStartTime = null
let currentPiece = null
let pieceMap = ['knight', 'bishop', 'rook', 'random']
let spiderMap = ['overall', 'knight', 'random', 'rook', 'bishop']
let moveStats = {
    'knight': {
        'hit': 0,
        'miss': 0,
        'totalTime': 0
    },
    'bishop': {
        'hit': 0,
        'miss': 0,
        'totalTime': 0
    },
    'rook': {
        'hit': 0,
        'miss': 0,
        'totalTime': 0
    },
    'random': {
        'hit': 0,
        'miss': 0,
        'totalTime': 0
    },
    'overall': {
        'hit': 0,
        'miss': 0,
        'totalTime': 0
    },
}

const clearStats = () => {
    for (let statType in moveStats) {
        for (let keyName in moveStats[statType]) {
            moveStats[statType][keyName] = 0
        }
    }
    let statType,
        point,
        newVal
    if (chartSpider) {
        for (let pieceIndex in spiderMap) {
            statType = spiderMap[pieceIndex]
            point = chartSpider.series[0].data[pieceIndex]
	    	newVal = 200
    	    point.update(newVal)

	    }
	}
    
}

const gaugeOptions = {
    chart: {
        type: 'solidgauge',
        backgroundColor: '#333538'
    },

    title: null,

    pane: {
        center: ['50%', '70%'],
        size: '120%',
        startAngle: -90,
        endAngle: 90,
        background: {
            borderColor: '#333538',
            backgroundColor:'#e7e6e6',
            innerRadius: '60%',
            outerRadius: '100%',
            shape: 'arc'
        }
    },
    exporting: {
 		enabled: false
 	},

	tooltip: {
 		enabled: false
 	},

    yAxis: {
        visible: false,
        stops: [
            [0.1, RED], 
            [0.5, YELLOW], 
            [0.9, GREEN] 
        ],
        lineWidth: 0,
        tickWidth: 0,

        tickAmount: 0,
        labels: {
            y: 16
        }
    },

    plotOptions: {
        solidgauge: {
            dataLabels: {
                y: 5,
                borderWidth: 0,
                useHTML: true
            }
        }
    }
};

const chartGauge = Highcharts.chart('container-gauge', Highcharts.merge(gaugeOptions, {
    yAxis: {
        min: 0,
        max: 100

    },

    credits: {
        enabled: false
    },

    series: [{
        name: 'Energy',
        data: [80],
        dataLabels: {
            format:
                '<div style="text-align:center; margin-bottom: 50px; color:#99d9ea; font-family: \'Red Hat Display\', sans-serif;">' +
                '<span style="font-size:25px">{y}</span><br/>' +    
                '</div>'
        }
    }]

}));

const chartSpider = Highcharts.chart('container-spider', {
    chart: {
        polar: true,
        type: 'line',
        backgroundColor: '#333538'
    },

    pane: {
        size: '120%'
    },
    credits: {
        enabled: false
    },
    xAxis: {
        categories: ['Overall', 'Knight', 'Random', 'Rook', 'Bishop'],
        tickmarkPlacement: 'on',
        lineWidth: 0,
        labels:{
            style: {
                color: '#99d9ea'
            }
        }
    },
    yAxis: {
        gridLineInterpolation: 'polygon',
        lineWidth: 0,
        lineColor: '#e7e6e6',
        min: 0,
        //max: 1000,
        labels:{
        	enabled: false
        }
    },
    legend: {
        enabled: false
    },

    series: [{
        name: 'Avg speed (ms)',
        data: [200, 200, 200, 200, 200],
        pointPlacement: 'on',
		color: '#99d9ea',
    },{
        name: 'Speed goal (ms)',
        data: [200, 200, 200, 200, 200],
        pointPlacement: 'on',
		color: RED,
    }]
});

setInterval(function () {
    intervalSpeed -= intervalReduce
    if (intervalSpeed <= minIntSpeed){
        intervalSpeed = minIntSpeed
    }
    clearInterval(interval)
    interval = setInterval(function () {
        let point,
            newVal
        if (!isPaused){
            if (chartGauge) {
                point = chartGauge.series[0].points[0];
                newVal = point.y - 1;
    
                if (newVal < 0 ) {
                    newVal = 0;
                }
    
                point.update(newVal);
            }
        }
    }, intervalSpeed);

}, 5000);


const delta = (startTime) => ((Date.now() - startTime) / 1000.0).toFixed(3)

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
    isPaused = true
    if (points === best.points) {
        localStorage.setItem('best-pts', JSON.stringify(best))
    }
    let point,
        newVal
    points = 0
    canvas.style.pointerEvents = "none"
    if (chartGauge) {
        point = chartGauge.series[0].points[0]
        newVal = gaugeStart
    	point.update(newVal);
	}
	//clearStats()
	//updateStats()
	intervalSpeed = initIntervalSpeed
	clearInterval(interval)
    startPage()
}

const updateStats = () => {
    let statType,
        point,
        newVal
    if (chartSpider) {
        for (let pieceIndex in spiderMap) {
            statType = spiderMap[pieceIndex]
            point = chartSpider.series[0].data[pieceIndex]
	    	if (moveStats[statType]['hit'] > 0){
	    	    newVal = Math.round(1000 * (moveStats[statType]['totalTime'] / (moveStats[statType]['hit'])))
    	        point.update(newVal);
            }

	    }
	}
}

const handleButton = event => {
	clearStats()
    updateStats()

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
        moveStartTime = Date.now()
    } else {
        moveStats['overall']['miss']++
        resetSession()
    }
}

const handleRelease = event => {
    const tile = {
        x: Math.floor((event.clientX - canvas.offsetLeft + window.scrollX) / SQUARE_SIZE),
        y: Math.floor((event.clientY - canvas.offsetTop + window.scrollY) / SQUARE_SIZE)
    }

    let moveTime = delta(moveStartTime)
    let point,
        newVal
    const here = getTileHere(tile)
    if (here !== undefined && getTileColor(here) == RED && tiles.length == 1) {
        moveStats['overall']['hit']++
        moveStats['overall']['totalTime'] += parseFloat(moveTime)
        moveStats[pieceMap[currentPiece]]['hit']++
        moveStats[pieceMap[currentPiece]]['totalTime'] += parseFloat(moveTime)
        
    	if (chartGauge) {
    	    point = chartGauge.series[0].points[0];
    	    newVal = point.y + gaugeIncrease;

    	    if (newVal > 100) {
    	        newVal = 100;
    	    }

        	point.update(newVal);
		}
        newTile()
        removeTileHere(here)
        update()
        updateStats() 

    } else {
        moveStats['overall']['miss']++
        moveStats['overall']['totalTime'] += parseFloat(moveTime)
        moveStats[pieceMap[currentPiece]]['miss']++
        moveStats[pieceMap[currentPiece]]['totalTime'] += parseFloat(moveTime)
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
    tiles.push(tile)
    let found = false
    let piece = null
    let moveList = []
    let destination = {}
    if (!(knight_option.checked || bishop_option.checked || rook_option.checked)){
        do {
            destination = {
                x: Math.floor(Math.random() * SQUARE_COLS),
                y: Math.floor(Math.random() * SQUARE_ROWS),
                color: RED
            }
        } while (getTileHere(destination) !== undefined)
        tiles.push(destination)
        currentPiece = 3

    } else {
        
        while(!found){
            piece = Math.floor(Math.random() * PIECES)

            switch (piece){
                case 0:
                    moveList = knightMove(tile)
                    if (knight_option.checked){
                        found = true
                        currentPiece = piece
                    }
                    break
                case 1:
                    moveList = bishMove(tile)
                    if (bishop_option.checked){
                        found = true
                        currentPiece = piece
                    }
                    break
                case 2:
                    moveList = rookMove(tile)
                    if (rook_option.checked){
                        found = true
                        currentPiece = piece
                    }
                    break
            }
        }
        let index = Math.floor(Math.random() * moveList.length)
        destination = moveList[index]
        destination.color = RED
        tiles.push(destination)
    }
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
    overallStartTime = Date.now()
    canvas.style.pointerEvents = "auto"
    tiles = []
    isPaused = false
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
    let point,
        newVal
    if (chartGauge) {
        point = chartGauge.series[0].points[0]
        newVal = gaugeStart
    	point.update(newVal);
	}
	//clearStats()
    updateStats()
    update()
}

const update = () => {
    resetBoard()
    requestAnimationFrame(update)
}

const startPage = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height) 
    ctx.font = "35px sans-serif"
	ctx.fillStyle = "#99d9ea"
	ctx.textAlign = "center"
	ctx.fillText("Press any key to start", canvas.width/2, canvas.height/2)
	ctx.font = "20px sans-serif"
	ctx.fillText("Click on the yellow square and release on the red", canvas.width/2, 3*canvas.height/4)
	ctx.fillStyle = RED
	ctx.fillText("Don't let the gauge run out!", canvas.width/2, 3.5*canvas.height/4)
    requestAnimationFrame(startPage)

}

startPage()

const checkGauge = () => {
    let point
    if (chartGauge) {
        point = chartGauge.options.series[0].data[0];
        if (point <= 0) {
            resetSession()
        }
    }
}

setInterval(checkGauge, 200)
window.onload = () => {

    document.addEventListener('keydown', initBoard)
    canvas.addEventListener('mousedown', handleClick)
    canvas.addEventListener('mouseup', handleRelease)
    stats_button.addEventListener('click', handleButton)

}

