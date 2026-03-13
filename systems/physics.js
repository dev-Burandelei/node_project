function updatePhysics(dt){

    moveBall(dt)

    checkCollision()

    checkScore()

    updateParticles(dt)

    updateSlowMotion(dt)

    updateBulletTime(dt)

    updateShake(dt)
}