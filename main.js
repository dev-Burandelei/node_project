console.log("main.js carregado")
window.onerror = function(message, source, line){

    console.error(message + " @ " + line)

}
let currentState = null
let lastTime = 0

window.canvas = document.getElementById("canvas")
window.ctx = canvas.getContext("2d")

window.w = window.innerWidth
window.h = window.innerHeight

canvas.width = w
canvas.height = h

window.timeScale = 1

function changeState(newState){

    if(currentState && currentState.onExit){
        currentState.onExit()
    }

    currentState = newState

    if(currentState && currentState.onEnter){
        currentState.onEnter()
    }

}


document.addEventListener("keydown", e => {

    if(currentState && currentState.onKeyDown){
        currentState.onKeyDown(e)
    }

})


changeState(menuState)

requestAnimationFrame(loop)