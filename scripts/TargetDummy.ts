export default class TargetDummy {
  bobAmp = 0
  bobSpeed = 2.2
  swayAmp = 0
  swaySpeed = 1.4
  phase = 0
  respawnDelay = 1.9
  private ctx: any
  private base: any = { x: 0, y: 0, z: 0 }
  private baseRotY = 0
  private baseScale: any = { x: 1, y: 1, z: 1 }
  private alive = true
  private t = 0
  private deadT = 0
  private growT = 1

  onInit(ctx: any) {
    this.ctx = ctx
    const tr = ctx.entity.getTransform()
    this.base = { x: tr.position.x, y: tr.position.y, z: tr.position.z }
    this.baseRotY = tr.rotation.y || 0
    this.baseScale = { x: tr.scale.x, y: tr.scale.y, z: tr.scale.z }
    this.growT = 1
    ctx.on('targetHit', (d: any) => {
      if (!d || d.id !== ctx.entity.id || !this.alive) return
      this.alive = false
      this.deadT = 0
      ctx.emit('targetDown', { id: ctx.entity.id })
    })
  }

  onUpdate(dt: number) {
    const tr = this.ctx.entity.getTransform()
    if (!this.alive) {
      this.deadT += dt
      const k = Math.min(1, this.deadT / 0.28)
      const s = Math.max(0.02, 1 - k)
      tr.scale.x = this.baseScale.x * s
      tr.scale.y = this.baseScale.y * s
      tr.scale.z = this.baseScale.z * s
      tr.rotation.z = k * 200
      if (this.deadT >= this.respawnDelay) {
        this.alive = true
        this.deadT = 0
        this.t = 0
        this.growT = 0
        tr.position.x = this.base.x
        tr.position.y = this.base.y
        tr.position.z = this.base.z
        tr.rotation.z = 0
        this.ctx.emit('targetUp', { id: this.ctx.entity.id })
      }
      return
    }

    this.t += dt
    this.growT = Math.min(1, this.growT + dt * 2.6)
    const ease = 1 - (1 - this.growT) * (1 - this.growT)
    const pop = 1 + 0.07 * Math.sin(this.growT * Math.PI)
    const s = (0.35 + 0.65 * ease) * pop
    tr.scale.x = this.baseScale.x * s
    tr.scale.y = this.baseScale.y * s
    tr.scale.z = this.baseScale.z * s
    tr.position.x = this.base.x
    tr.position.z = this.base.z
    tr.position.y = this.base.y + Math.sin(this.t * this.bobSpeed + this.phase) * this.bobAmp
    tr.rotation.y = this.baseRotY + Math.sin(this.t * this.swaySpeed + this.phase) * this.swayAmp
  }
}