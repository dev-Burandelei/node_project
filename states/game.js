console.log("game.js carregado")

// ===== MAIN (antigo main.js) =====

window.canvas = document.getElementById("canvas")
window.ctx = canvas.getContext("2d")

window.w = window.innerWidth
window.h = window.innerHeight

canvas.width = w
canvas.height = h

window.timeScale = 1

//Variaveis básicas
//let canvas, ctx
let p1_y, p2_y, p1_points, p2_points
let ball_y_orientation, ball_x_orientation, ball_x, ball_y
let p1_key, p2_key
let ballSpeed = 400
//let w, h

//Variaveis do player
const p_w = 20
const p_h = 200
const p1_x = 10
let p2_x
let keys = {}

// Variaveis da fisica
let lastTime = 0
let deltaTime = 0

// Variaveis sobre a colisão da bola e e raquete 
let p1_velocity = 0
let p2_velocity = 0

// Variaveis rastro da bola
let ballTrail = []
const trailLength = 10

// Variaveis das particulas
let particles = []

//Variaveis de controle do tempo
//let timeScale = 1
let slowMotionTimer = 0

//Variaveis do bullet time
let bulletTimer = 0
let bulletStrength = 0

//Variaveis de shake scream
let shakeTime = 0
let shakeStrength = 0

let currentState = null
// Estados

//let currentState = gameState

window.gameState = {

    name: "GAME",
    
    onEnter(){
        setup()
        resetBall()
    },

    update(dt){

        updateInput(dt)
        updatePhysics(dt)

    },

    draw(){

        drawGame()
        

    }

}

const pauseState = {

    draw(){

        ctx.fillStyle = "rgba(0,0,0,0.5)"
        ctx.fillRect(0,0,w,h)

        ctx.fillStyle = "white"
        ctx.font = "60px monospace"
        ctx.fillText("PAUSED", w/2 - 120, h/2)

    }

}
///////////////////// Funções de loop///////////////////////////////////////////

function loop(time){

    if(!lastTime) lastTime = time

    deltaTime = (time - lastTime) / 1000
    lastTime = time

    deltaTime *= window.timeScale || 1

    if(currentState && currentState.update){
        currentState.update(deltaTime)
    }

    if(currentState && currentState.draw){
        currentState.draw()
    }

    //drawGame()

    requestAnimationFrame(loop)

}
//requestAnimationFrame(loop)


function updateInput(dt){
    movePlayers(dt)
}

function updatePhysics(dt){

    moveBall(dt)

    checkCollision()

    checkScore()

    updateParticles(dt)

    updateSlowMotion(dt)

    updateBulletTime(dt)

    updateShake(dt)
}

function drawGame(){

    ctx.save()

    if(shakeTime > 0){

        let intensity = shakeStrength * (shakeTime)

        let dx = (Math.random() - 0.5) * intensity
        let dy = (Math.random() - 0.5) * intensity

        ctx.translate(dx, dy)

    }

    drawRect(0,0,w,h,"#000")

    drawPaddle(p1_x, p1_y)
    drawPaddle(p2_x, p2_y)

    drawRect(w/2 -5,0,5,h)

    drawParticles()

    drawBallTrail()

    drawBall()

    writePoints()

    ctx.restore()

}

///////////////////// Funções de Inicialização///////////////////////////////////////////
function initBall(){

    console.log(`${p1_points} VS ${p2_points}`)

    ballSpeed = 400

    ball_y_orientation = Math.pow(2, Math.floor(Math.random()*2)+1) - 3
    ball_x_orientation = Math.pow(2, Math.floor(Math.random()*2)+1) - 3

    ball_x = w/2 - 10
    ball_y = h/2 - 10
}

function setup(){

    //canvas = document.getElementById("canvas")
    //ctx = canvas.getContext("2d")

    resizeCanvas()

    p1_y = p2_y = (h/2) - (p_h/2)

    p1_points = 0
    p2_points = 0

    //requestAnimationFrame(loop)

    initBall()

}

function spawnParticles(x, y, count = 20){

    for(let i = 0; i < count; i++){

        let angle = Math.random() * Math.PI * 2
        let speed = Math.random() * 300

        particles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 0.5,
            maxLife: 0.5,
            size: Math.random() * 4 + 2
        })

    }

}

///////////////////// Funções de Desenho///////////////////////////////////////////


function drawRect(x,y,w,h,color="#fff"){
    ctx.fillStyle = color
    ctx.fillRect(x,y,w,h)
}

function drawBall(){

    ctx.save()

    ctx.shadowBlur = 30
    ctx.shadowColor = "#00ffff"

    ctx.fillStyle = "#fff"
    ctx.fillRect(ball_x, ball_y, 10, 10)

    ctx.restore()

}

function drawPaddle(x,y){

    ctx.save()

    ctx.shadowBlur = 15
    ctx.shadowColor = "#ffffff"

    ctx.fillStyle = "#fff"
    ctx.fillRect(x,y,p_w,p_h)

    ctx.restore()

}

function drawParticles(){

    ctx.save()

    ctx.shadowBlur = 10
    ctx.shadowColor = "white"

    for(let p of particles){

        let alpha = Math.max(p.life / p.maxLife, 0)

        ctx.globalAlpha = alpha

        ctx.fillStyle = `hsl(${200 + ballSpeed * 0.05},100%,70%)`

        let size = p.size * alpha

        ctx.fillRect(
            p.x - size/2,
            p.y - size/2,
            size,
            size
        )

    }

    ctx.restore()

}

function drawBallTrail(){

    for(let i = 0; i < ballTrail.length; i++){

        let pos = ballTrail[i]

        let alpha = i / trailLength

        ctx.fillStyle = `rgba(255,255,255,${alpha})`
        ctx.fillRect(pos.x, pos.y, 10, 10)

    }
}

///////////////////// Funções de Inputs///////////////////////////////////////////
document.addEventListener("keydown", function(e){
    keys[e.keyCode] = true
})

document.addEventListener("keyup", function(e){
    keys[e.keyCode] = false
})

document.addEventListener("keydown", e => {

    if(currentState && currentState.onKeyDown){
        currentState.onKeyDown(e)
    }

})

///////////////////// Funções de Colisão///////////////////////////////////////////

function checkCollision(){
    checkPaddleCollision(p1_x, p1_y, p1_velocity, 1)
    checkPaddleCollision(p2_x, p2_y, p2_velocity, -1)
    checkWallCollision()
}

function checkPaddleCollision(px, py, paddleVelocity, direction){

    const ballSize = 10
    const maxAngle = Math.PI / 4

    if(ball_x + ballSize >= px &&
       ball_x <= px + p_w &&
       ball_y + ballSize >= py &&
       ball_y <= py + p_h){

        let paddleCenter = py + p_h / 2
        let ballCenter = ball_y + ballSize / 2

        let relativeIntersect = paddleCenter - ballCenter
        let normalized = relativeIntersect / (p_h / 2)

        let edgeImpact = Math.abs(normalized)

        if(edgeImpact > 0.8){
            triggerBulletTime(edgeImpact)
            spawnParticles(ball_x, ball_y, 40)
        }

        bounceFromPaddle(py, paddleVelocity, direction)

        ballSpeed = Math.min(ballSpeed + 30, 900)

        spawnParticles(ball_x, ball_y, 25)
    }

}

function bounceFromPaddle(paddleY, paddleVelocity, direction){

    const maxAngle = Math.PI / 4
    const ballSize = 10

    let paddleCenter = paddleY + p_h / 2
    let ballCenter = ball_y + ballSize / 2

    let relativeIntersect = paddleCenter - ballCenter
    let normalized = relativeIntersect / (p_h / 2)

    let bounceAngle = normalized * maxAngle

    ball_x_orientation = direction * Math.cos(bounceAngle)
    ball_y_orientation = -Math.sin(bounceAngle)

    applySpin(paddleVelocity)

}

function checkWallCollision(){

    const ballSize = 10

    if(ball_y + ballSize >= h || ball_y <= 0){
        ball_y_orientation *= -1
    }

}

///////////////////// Funções de UI///////////////////////////////////////////
function checkScore(){

    if(ball_x + 10 > w){

        spawnGoalParticles(ball_x, ball_y)

        triggerSlowMotion()

        p1_points++
        resetBall()

    }

    else if(ball_x < 0){

        spawnGoalParticles(ball_x, ball_y)

        triggerSlowMotion()

        p2_points++
        resetBall()

    }

}

function resizeCanvas(){

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    w = canvas.width
    h = canvas.height

    p2_x = w - p_w - 10

}

///////////////////// Funções de responsivas///////////////////////////////////////////


function writePoints(){

    ctx.font = "50px monospace"
    ctx.fillStyle = "#fff"

    ctx.fillText(p1_points, w/4, 50)

    ctx.fillText(p2_points, 3*(w/4), 50)

}

function applySpin(paddleVelocity){

    const spinFactor = 0.002

    ball_y_orientation += paddleVelocity * spinFactor

    normalizeBallVector()

}

function resetBall(){
    initBall()
}

function spawnGoalParticles(x, y){

    const count = 120

    for(let i = 0; i < count; i++){

        let angle = Math.random() * Math.PI * 2
        let speed = Math.random() * 800 + 200

        particles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1 + Math.random() * 0.5,
            maxLife: 1.5,
            size: Math.random() * 8 + 3
        })

    }

}

function changeState(newState){

    if(currentState && currentState.onExit){
        currentState.onExit()
    }

    currentState = newState

    if(currentState && currentState.onEnter){
        currentState.onEnter()
    }

}
///////////////////// Funções de atualizadas por flames///////////////////////////////////////////

function normalizeBallVector(){

    let length = Math.sqrt(
        ball_x_orientation * ball_x_orientation +
        ball_y_orientation * ball_y_orientation
    )

    ball_x_orientation /= length
    ball_y_orientation /= length

}

function updateParticles(dt){

    for(let i = particles.length - 1; i >= 0; i--){

        let p = particles[i]

        p.x += p.vx * dt
        p.y += p.vy * dt

        p.life -= dt

        if(p.life <= 0){
            particles.splice(i,1)
        }

    }

}

function moveBall(dt){

    ball_x += ballSpeed * dt * ball_x_orientation
    ball_y += ballSpeed * dt * ball_y_orientation

    ballTrail.push({x: ball_x, y: ball_y})

    if(ballTrail.length > trailLength){
        ballTrail.shift()
    }

}

function movePlayers(dt){

    const speed = 500

    p1_velocity = 0
    p2_velocity = 0

    if(keys[87] && p1_y > 0){
        p1_y -= speed * dt
        p1_velocity = -speed
    }

    if(keys[83] && p1_y + p_h < h){
        p1_y += speed * dt
        p1_velocity = speed
    }

    if(keys[38] && p2_y > 0){
        p2_y -= speed * dt
        p2_velocity = -speed
    }

    if(keys[40] && p2_y + p_h < h){
        p2_y += speed * dt
        p2_velocity = speed
    }

}

function updateSlowMotion(dt){

    if(slowMotionTimer > 0){

        slowMotionTimer -= dt

        if(slowMotionTimer <= 0){
            timeScale = 1
        }

    }

}

function triggerSlowMotion(){

    timeScale = 0.25
    slowMotionTimer = 0.6

}

function triggerBulletTime(intensity = 1){

    timeScale = 0.15
    bulletTimer = 0.25
    bulletStrength = intensity

}

function updateBulletTime(dt){

    if(bulletTimer > 0){

        bulletTimer -= dt

        if(bulletTimer <= 0){
            timeScale = 1
        }

    }

}

function triggerShake(strength, duration){

    shakeStrength = strength
    shakeTime = duration

}

function updateShake(dt){

    if(shakeTime > 0){

        shakeTime -= dt

        shakeStrength *= 0.92

    }

}
///////////////////// Funções principal///////////////////////////////////////////

changeState(menuState)
//setup()
requestAnimationFrame(loop)
window.addEventListener("resize", resizeCanvas)