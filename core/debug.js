const Debug = {

    messages: [],
    errors: [],
    fps: 0,
    frameCount: 0,
    lastTime: 0,

    log(msg){
        this.messages.push(msg)

        if(this.messages.length > 8){
            this.messages.shift()
        }
    },

    error(msg){
        this.errors.push(msg)

        if(this.errors.length > 5){
            this.errors.shift()
        }
    },

    update(time){

        this.frameCount++

        if(time - this.lastTime >= 1000){
            this.fps = this.frameCount
            this.frameCount = 0
            this.lastTime = time
        }

    },

    draw(){

        if(!window.ctx) return

        ctx.save()

        ctx.font = "14px monospace"
        ctx.fillStyle = "lime"

        let y = 20

        ctx.fillText("FPS: " + this.fps, 20, y)
        y += 20

        ctx.fillText("STATE: " + (currentState?.name || "none"), 20, y)
        y += 20

        ctx.fillText("---- LOG ----", 20, y)
        y += 20

        for(let m of this.messages){
            ctx.fillText(m,20,y)
            y += 18
        }

        if(this.errors.length){

            y += 10
            ctx.fillStyle = "red"
            ctx.fillText("---- ERRORS ----",20,y)
            y += 20

            for(let e of this.errors){
                ctx.fillText(e,20,y)
                y += 18
            }

        }

        ctx.restore()

    }

}

window.Debug = Debug