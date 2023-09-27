const container = document.querySelector('.container')
const main = document.querySelector('main')
const canvas = document.querySelector('canvas')
const tempoText = document.getElementById('tempo')
const subdivisionText = document.getElementById('subdivision')
const ratio1Text = document.getElementById('ratio-1')
const ratio2Text = document.getElementById('ratio-2')
const iterationsText = document.getElementById('iterations')
const start = document.getElementById('start')

//change based on screen size/orientation
const resizeCanvas = () => {
    canvas.width = main.offsetWidth
    canvas.height = main.offsetHeight * (1 / 5)

    canvas.style.width = main.offsetWidth + 'px'
    canvas.style.height = main.offsetHeight * (1 / 5) + 'px'
}
resizeCanvas()
window.addEventListener('resize', resizeCanvas)

//draws a rectangle that takes an x coordinate
const rectangleDrawer = x => {
    const context = canvas.getContext('2d')
    context.fillRect(x, 0, canvas.offsetWidth * (1 / 10), canvas.offsetHeight)

    if (x <= canvas.offsetWidth * (1 / 20) || x >= canvas.offsetWidth * (17 / 20)) {
        context.fillStyle = '#6c757d'
    } else {
        context.fillStyle = '#000'
    }
}

//draws endzones
const drawEndzones = () => {
    const context = canvas.getContext('2d')

    context.moveTo(canvas.offsetWidth * (1 / 20), 0)
    context.lineTo(canvas.offsetWidth * (1 / 20), canvas.getBoundingClientRect().height)
    context.strokeStyle = '#dc3545'
    context.stroke()

    context.moveTo(canvas.offsetWidth * (19 / 20), 0)
    context.lineTo(canvas.offsetWidth * (19 / 20), canvas.getBoundingClientRect().height)
    context.strokeStyle = '#dc3545'
    context.stroke()
}

//erases the canvas
const canvasClearer = () => {
    const context = canvas.getContext('2d')
    context.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)
}

//returns an odd subdivision
const subdivisionMaker = () => {
    //random number between 3 and 21
    const subdivision = Math.floor(Math.random() * (21 - 3 + 1) + 3)
    //if subdivision is even, add 1, else return subdivision
    if (subdivision % 2 === 0) {
        return subdivision + 1
    } else {
        return subdivision
    }
}

//determines durations for right and left moving animations
const durationMaker = () => {
    let totalDuration, rightDuration, leftDuration, iterations

    //determines a random bpm between 60 and 84
    const bpm = Math.floor(Math.random() * (84 - 60 + 1) + 60)

    //converts bpm to milliseconds for total time
    totalDuration = 60000 / bpm 

    //subdivision for duration decision
    const subdivision = subdivisionMaker()

    //right duration = total * larger half. left duration = total * smaller half
    rightDuration = totalDuration * ((subdivision / 2 + 0.5) / subdivision)
    leftDuration = totalDuration * ((subdivision / 2 - 0.5) / subdivision)

    //number of repetitions
    iterations = Math.floor(Math.random() * (21 - 11 + 1) + 11)

    return {
        'tempo': bpm,
        'subdivision': subdivision,
        'big half': subdivision / 2 + 0.5,
        'little half': subdivision / 2 - 0.5,
        'total duration': totalDuration,
        'right duration': rightDuration,
        'left duration': leftDuration,
        'iterations': iterations
    }
}

//updates text info
const infoUpdate = (t, s, r1, r2, i) => {
    tempoText.textContent = t
    subdivisionText.textContent = s
    ratio1Text.textContent = r1
    ratio2Text.textContent = r2
    iterationsText.textContent = i
}

//animation controller
let startTime = null
let direction = 'right'
let duration = durationMaker()
let counter = duration['iterations']
const animation = timestamp => {
    //fades out piece if time finishes
    if (Date.now() >= pieceBegins + 300000) {
        endPiece()
    }

    //remakes durations when counter depletes
    if (counter === 1) {
        duration = durationMaker()
        counter = duration['iterations']
    }

    //set a reference point when the animation starts
    if (!startTime) {
        startTime = timestamp
    }

    //total time elapsed
    let runtime = timestamp - startTime

    //duration and target change based on direction
    let currentDuration
    if (direction === 'right') {
        currentDuration = duration['right duration']
    } else {
        currentDuration = duration['left duration']
    }

    //how far the duration is away
    const relativeProgress = runtime / currentDuration

    let x, xTarget = (canvas.offsetWidth - (canvas.offsetWidth * (1 / 10)))
    if (direction === 'right') {
        x = xTarget * Math.min(relativeProgress, 1)
    } else {
        x = xTarget * Math.max(0, 1 - relativeProgress)
    }

    infoUpdate(duration['tempo'], duration['subdivision'], duration['big half'], duration['little half'], counter)
    canvasClearer()
    rectangleDrawer(x)
    drawEndzones()

    //change direction based on animation
    if (direction === 'right') {
        if (runtime >= currentDuration) {
            startTime = null
            direction = 'left'
        }
    } else {
        if (runtime >= currentDuration) {
            startTime = null
            direction = 'right'
            counter--
        }
    }
    requestAnimationFrame(animation)
}

//begins the piece
let pieceBegins
const startPiece = () => {
    start.style.animation = 'fade-out 0.2s cubic-bezier(0.390, 0.575, 0.565, 1.000) both'

    for (const button of start.children) {
        button.disabled = true
    }

    pieceBegins = Date.now()

    let startCounter = 6

    const interval = setInterval(() => {
        if (startCounter === 0) {
            clearInterval(interval)
            requestAnimationFrame(animation)
        } else {
            startCounter--
        }
        iterationsText.textContent = startCounter
    }, 1000)
}

//ends the piece
const endPiece = () => {
    container.style.animation = 'fade-out 3s cubic-bezier(0.390, 0.575, 0.565, 1.000) both'
    setTimeout(() => {
        cancelAnimationFrame(animation)
        location.reload()
    }, 5000)
}