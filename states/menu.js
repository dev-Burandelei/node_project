console.log("menu.js carregado")

let menuParticles = []
let titleTime = 0

let stars = []

let warpSpeed = 50
let warpActive = false

let starMode = "parallax"

let flashAlpha = 0
let flashActive = false
let flashRadius = 0
let flashMaxRadius = 0

let crtFlicker = 0

let crtRoll = 0
let noiseTime = 0

let crtWobbleTime = 0

let mouse = {x:0, y:0}
let exitButton = null

let shutdownActive = false
let shutdownProgress = 0

window.menuState = {
    name :"Menu",
    onEnter(){

        stars = []
        menuParticles = []

        warpSpeed = 50
        warpActive = false

        flashActive = false
        flashAlpha = 0

        flashRadius = 0
        flashMaxRadius = Math.sqrt(w*w + h*h)
        createStars()
        spawnMenuParticles(120)

    },

    update(dt){

        titleTime += dt
        crtFlicker = Math.random() * 0.03
        crtWobbleTime += dt

        if(shutdownActive){
            shutdownProgress += dt * 1.8

            // começa a carregar antes de terminar (suaviza)
            if(shutdownProgress >= 0.72){
                window.location.href = "index.html"
            }
        }


        updateWarp(dt)
        updateStars(dt)
        updateMenuParticles(dt)
        updateFlash(dt)

    },

    draw(){

        ctx.fillStyle = "rgba(0,0,0,0.2)"
        ctx.fillRect(0,0,w,h)

        drawStars()
        drawMenuParticles()

        drawTitle()
        drawFlash()
        drawExitButton()
        drawCRT()
        drawShutdownEffect()
    },

    onKeyDown(e){

    if(e.code === "Space" && !warpActive){

        warpActive = true

        flashActive = true
        flashAlpha = 1
        flashRadius = 0

        setTimeout(()=>{
            changeState(gameState)
        },1200)

    }

}

}

function spawnMenuParticles(n){

    for(let i = 0; i < n; i++){

        menuParticles.push({
            x: Math.random() * w,
            y: Math.random() * h,
            vx: (Math.random() - 0.5) * 20,
            vy: (Math.random() - 0.5) * 20,
            size: Math.random() * 3 + 1,
            life: Math.random()
        })

    }

}

function updateMenuParticles(dt){

    for(let p of menuParticles){

        p.x += p.vx * dt
        p.y += p.vy * dt

        p.life -= dt * 0.1

        if(p.life <= 0){

            p.x = Math.random() * w
            p.y = Math.random() * h
            p.life = 1

        }

    }
}

function drawMenuParticles(){

    for(let p of menuParticles){

        ctx.save()

        ctx.globalAlpha = p.life
        ctx.fillStyle = "white"

        ctx.fillRect(p.x, p.y, p.size, p.size)

        ctx.restore()

    }

}

function drawTitle(){

    let glow = 20 + Math.sin(titleTime * 3) * 15

    ctx.save()

    ctx.shadowBlur = glow
    ctx.shadowColor = "cyan"

    ctx.fillStyle = "white"
    ctx.font = "80px monospace"
    ctx.textAlign = "center"

    ctx.fillText("PONG", w/2, h/2 - 80)

    ctx.restore()

    if(Math.sin(titleTime * 3) > 0){

        ctx.fillStyle = "cyan"
        ctx.font = "30px monospace"

        ctx.fillText("PRESS SPACE", w/2-90, h/2 + 40)

    }

}

function createStars(){

    for(let i = 0; i < 500; i++){

        let angle = Math.random() * Math.PI * 2
        let dist = Math.random() * 20

        stars.push({

            angle: angle,
            dist: dist,
            speed: Math.random() * 0.6 + 0.2,
            depth: Math.random() * 2 + 0.5

        })

    }

}

function updateStars(dt){

    for(let s of stars){

        s.dist += s.speed * warpSpeed * dt * s.depth

        if(s.dist > Math.max(w,h)){

            s.angle = Math.random() * Math.PI * 2
            s.dist = 1

        }

    }

}

function drawStars(){

    ctx.strokeStyle = "white"

    for(let s of stars){

        let x = w/2 + Math.cos(s.angle) * s.dist
        let y = h/2 + Math.sin(s.angle) * s.dist

        let trail = warpSpeed * 0.03 * s.depth

        ctx.globalAlpha = Math.min(1, s.depth)

        ctx.beginPath()
        ctx.moveTo(x,y)
        ctx.lineTo(
            x + Math.cos(s.angle) * trail,
            y + Math.sin(s.angle) * trail
        )
        ctx.stroke()

    }

    ctx.globalAlpha = 1
}

function projectStar(s){

    let sx = (s.wx / s.z) * w + w/2
    let sy = (s.wy / s.z) * h + h/2

    return {x:sx,y:sy}
}

function updateWarp(dt){

    if(warpActive){

        warpSpeed += 3000 * dt
        warpSpeed = Math.min(warpSpeed, 4000)

    }

}

function updateFlash(dt){

    if(!flashActive) return

    flashRadius += 2000 * dt
    flashAlpha -= 1 * dt

    if(flashRadius > flashMaxRadius){
        flashRadius = flashMaxRadius
    }

    if(flashAlpha <= 0){
        flashAlpha = 0
        flashActive = false
    }

}

function drawFlash(){

    if(flashAlpha <= 0) return

    ctx.save()

    let gradient = ctx.createRadialGradient(
        w/2, h/2, 0,
        w/2, h/2, flashRadius
    )

    gradient.addColorStop(0, `rgba(255,255,255,${flashAlpha})`)
    gradient.addColorStop(0.4, `rgba(255,255,255,${flashAlpha*0.7})`)
    gradient.addColorStop(1, "rgba(255,255,255,0)")

    ctx.fillStyle = gradient
    ctx.fillRect(0,0,w,h)

    ctx.restore()

}

function drawCRT(){

    noiseTime += 0.05
    crtRoll += 1.5

    ctx.save()

    // WOBBLE
    applyScreenWobble()

    // CURVATURA
    ctx.translate(w/2,h/2)

    const curve = 0.04

    ctx.transform(
        1,
        curve,
        -curve,
        1,
        0,
        0
    )

    ctx.translate(-w/2,-h/2)

    // FLICKER GLOBAL
    let flicker = 0.97 + Math.random()*0.06

    ctx.fillStyle = `rgba(255,255,255,${(flicker-1)*0.5})`
    ctx.fillRect(0,0,w,h)

    // SCANLINES
    ctx.globalAlpha = 0.15 + crtFlicker

    for(let y=0; y<h; y+=3){

        let intensity = 0.08 + Math.random()*0.05
        ctx.fillStyle = `rgba(0,0,0,${intensity})`

        ctx.fillRect(0,y,w,1)

    }

    ctx.globalAlpha = 1

    // PHOSPHOR GLOW
    ctx.globalAlpha = 0.04

    ctx.fillStyle = "cyan"
    ctx.fillRect(-1,0,w,h)

    ctx.fillStyle = "magenta"
    ctx.fillRect(1,0,w,h)

    ctx.globalAlpha = 1

    // ROLL BAR
    let rollY = crtRoll % h

    let rollGradient = ctx.createLinearGradient(
        0, rollY-60,
        0, rollY+60
    )

    rollGradient.addColorStop(0,"rgba(255,255,255,0)")
    rollGradient.addColorStop(0.5,"rgba(255,255,255,0.06)")
    rollGradient.addColorStop(1,"rgba(255,255,255,0)")

    ctx.fillStyle = rollGradient
    ctx.fillRect(0,rollY-60,w,120)

    // STATIC NOISE
    ctx.globalAlpha = 0.05

    for(let i=0;i<350;i++){

        let x = Math.random()*w
        let y = Math.random()*h
        let s = Math.random()*2

        ctx.fillRect(x,y,s,s)

    }

    ctx.globalAlpha = 1

    // DISTORÇÃO HORIZONTAL
    if(Math.random() < 0.015){

        let y = Math.random()*h
        let height = 4 + Math.random()*6
        let shift = (Math.random()-0.5)*15

        ctx.save()

        ctx.globalAlpha = 0.12

        ctx.drawImage(
            canvas,
            0,y,w,height,
            shift,y,w,height
        )

        ctx.restore()

    }

    // BLOOM
    drawBloom()

    // SHADOW MASK
    drawShadowMask()

    // VIGNETTE FINAL
    let gradient = ctx.createRadialGradient(
        w/2, h/2, w*0.25,
        w/2, h/2, w*0.9
    )

    gradient.addColorStop(0,"rgba(0,0,0,0)")
    gradient.addColorStop(1,"rgba(0,0,0,0.65)")

    ctx.fillStyle = gradient
    ctx.fillRect(0,0,w,h)

    ctx.restore()

}

function drawShadowMask(){

    ctx.save()

    ctx.globalAlpha = 0.06

    for(let x = 0; x < w; x += 3){

        ctx.fillStyle = "red"
        ctx.fillRect(x,0,1,h)

        ctx.fillStyle = "green"
        ctx.fillRect(x+1,0,1,h)

        ctx.fillStyle = "blue"
        ctx.fillRect(x+2,0,1,h)

    }

    ctx.restore()

}

function drawBloom(){

    ctx.save()

    ctx.globalAlpha = 0.08
    ctx.filter = "blur(6px)"

    ctx.drawImage(canvas,0,0)

    ctx.filter = "none"
    ctx.restore()

}

function applyScreenWobble(){

    let wobbleX = Math.sin(crtWobbleTime * 2) * 2
    let wobbleY = Math.cos(crtWobbleTime * 1.7) * 2

    ctx.translate(wobbleX, wobbleY)

}

function drawExitButton(){

    const btnW = 180
    const btnH = 50
    const x = w/2 - btnW/2
    const y = h/2 + 120

    ctx.save()

    // Hover simples (mouse)
    let hover = mouse.x > x && mouse.x < x+btnW &&
                mouse.y > y && mouse.y < y+btnH

    ctx.fillStyle = hover ? "cyan" : "transparent"
    ctx.strokeStyle = "cyan"
    ctx.lineWidth = 2

    ctx.fillRect(x,y,btnW,btnH)
    ctx.strokeRect(x,y,btnW,btnH)

    ctx.fillStyle = hover ? "black" : "cyan"
    ctx.font = "20px monospace"
    ctx.textAlign = "center"

    ctx.fillText("SAIR", w/2, y + 32)

    ctx.restore()

    // salvar área clicável
    exitButton = {x,y,w:btnW,h:btnH}
}

canvas.addEventListener("mousemove", e => {
    mouse.x = e.clientX
    mouse.y = e.clientY
})

canvas.addEventListener("click", () => {

    if(!exitButton) return

    if(
        mouse.x > exitButton.x &&
        mouse.x < exitButton.x + exitButton.w &&
        mouse.y > exitButton.y &&
        mouse.y < exitButton.y + exitButton.h
    ){
        if(typeof showExitMenu === "function"){
            showExitMenu()
        }
    }

})

function drawShutdownEffect(){

    if(!shutdownActive) return

    ctx.save()

    let p = shutdownProgress

    // ===== 1. COMPRESSÃO VERTICAL =====
    let scaleY = Math.max(0.001, 1 - p * 1.2)

    ctx.translate(w/2, h/2)
    ctx.scale(1, scaleY)
    ctx.translate(-w/2, -h/2)

    ctx.drawImage(canvas, 0, 0)

    ctx.restore()

    // ===== 2. LINHA BRANCA CENTRAL =====
    if(p > 0.6){

        let intensity = (p - 0.6) * 2.5

        ctx.save()

        let glow = 40 + Math.sin(p * 50) * 20

        ctx.shadowBlur = glow
        ctx.shadowColor = "white"

        ctx.fillStyle = `rgba(255,255,255,${intensity})`

        let lineHeight = 2 + (1 - p) * 20

        ctx.fillRect(0, h/2 - lineHeight/2, w, lineHeight)

        ctx.restore()
    }

    // ===== 3. FLASH FINAL =====
    if(p > 0.85){

        let fade = (p - 0.85) * 6

        ctx.fillStyle = `rgba(0,0,0,${fade})`
        ctx.fillRect(0,0,w,h)
    }

}

function triggerShutdown(){
    shutdownActive = true
    shutdownProgress = 0
}