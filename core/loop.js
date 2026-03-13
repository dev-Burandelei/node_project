console.log("loop.js carregado")

let lastTime = 0
let deltaTime = 0

function loop(time){

    if(!lastTime) lastTime = time

    deltaTime = (time - lastTime) / 1000
    lastTime = time

    deltaTime *= window.timeScale || 1

    Debug.update(time)

    if(currentState){

        if(currentState.update){
            currentState.update(deltaTime)
        }

        if(currentState.draw){
            currentState.draw()
        }

    }

    Debug.draw()

    requestAnimationFrame(loop)

}