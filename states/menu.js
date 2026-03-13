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

        updateWarp(dt)
        updateStars(dt)
        updateMenuParticles(dt)
        updateFlash(dt)

    },

    draw(){

        ctx.fillStyle = "black"
        ctx.fillRect(0,0,w,h)

        drawStars()
        drawMenuParticles()

        drawTitle()
        drawFlash()
        drawCRT()
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

    ctx.save()

    // Curvatura da tela
    ctx.translate(w/2, h/2)
    ctx.scale(1.01, 0.98)
    ctx.translate(-w/2, -h/2)

    // Scanlines
    //ctx.globalAlpha = 0.15
    //ctx.fillStyle = "black"
    ctx.globalAlpha = 0.12 + crtFlicker

    for(let y = 0; y < h; y += 4){
        ctx.fillRect(0, y, w, 2)
    }

    ctx.globalAlpha = 0.04
    ctx.fillStyle = "red"
    ctx.fillRect(-1,0,w,h)

    ctx.fillStyle = "blue"
    ctx.fillRect(1,0,w,h)

    ctx.globalAlpha = 1

    // Vinheta
    let gradient = ctx.createRadialGradient(
        w/2, h/2, w*0.3,
        w/2, h/2, w
    )

    gradient.addColorStop(0, "rgba(0,0,0,0)")
    gradient.addColorStop(1, "rgba(0,0,0,0.5)")

    ctx.fillStyle = gradient
    ctx.fillRect(0,0,w,h)

    ctx.restore()

}

