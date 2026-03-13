

// function changeState(state){

    if(currentState && currentState.onExit){
        currentState.onExit()
    }

    currentState = state

    if(currentState.onEnter){
        currentState.onEnter()
    }

//}

 //function updateState(dt){

    if(currentState && currentState.update){
        currentState.update(dt)
    }

//}