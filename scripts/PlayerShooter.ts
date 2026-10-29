export default class PlayerShooter {
  fireRate = 0.11
  hitRadius = 0.72
  range = 90
  private ctx: any
  private targets: any[] = []
  private alive: any = {}
  private cooldown = 0
  private playerId = ''

  onInit(ctx: any) {
    this.ctx = ctx
    const player = ctx.scene.findByTag('Player')[0]
    this.playerId = player ? player.id : ''
    const list = ctx.scene.findByTag('Target')
    for (let i = 0; i < list.length; i++) {
      this.targets.push(list[i])
      this.alive[list[i].id] = true
    }
    ctx.on('targetDown', (d: any) => { if (d && d.id) this.alive[d.id] = false })
    ctx.on('targetUp', (d: any) => { if (d && d.id) this.alive[d.id] = true })
  }

  onUpdate(dt: number) {
    if (this.cooldown > 0) this.cooldown -= dt
    if (!this.ctx.input.isActionPressed('Attack')) return
    if (this.cooldown > 0) return
    this.cooldown = this.fireRate
    this.fire()
  }

  private aim() {
    const cam = this.ctx.entity.getTransform()
    const player = this.ctx.scene.findByTag('Player')[0]
    const pr = player ? player.getTransform().rotation.y : 0
    const pp = player ? player.getTransform().position : { x: 0, y: 0, z: 0 }
    const yaw = (pr * Math.PI) / 180
    const pitch = ((cam.rotation.x || 0) * Math.PI) / 180
    const cp = Math.cos(pitch)
    const dir = { x: -cp * Math.sin(yaw), y: Math.sin(pitch), z: -cp * Math.cos(yaw) }
    const origin = { x: pp.x + cam.position.x, y: pp.y + cam.position.y, z: pp.z + cam.position.z }
    return { origin, dir }
  }

  private fire() {
    const a = this.aim()
    const origin = a.origin
    const dir = a.dir
    let best: any = null
    let bestDist = 0
    for (let i = 0; i < this.targets.length; i++) {
      const t = this.targets[i]
      if (!this.alive[t.id]) continue
      const p = t.getTransform().position
      const ox = p.x - origin.x
      const oy = p.y - origin.y
      const oz = p.z - origin.z
      const proj = ox * dir.x + oy * dir.y + oz * dir.z
      if (proj <= 0.4 || proj > this.range) continue
      const d2 = ox * ox + oy * oy + oz * oz - proj * proj
      if (d2 > this.hitRadius * this.hitRadius) continue
      if (!best || proj < bestDist) { best = t; bestDist = proj }
    }

    let blocked = false
    if (best) {
      const start = { x: origin.x + dir.x * 0.7, y: origin.y + dir.y * 0.7, z: origin.z + dir.z * 0.7 }
      const hit = this.ctx.physics.raycast(start, dir, bestDist, 0xffff)
      if (hit && hit.distance < bestDist - 1.0 && hit.entityId !== this.playerId) blocked = true
    }

    this.ctx.emit('shot', {})
    if (best && !blocked) {
      const bonus = best.hasTag && best.hasTag('Bonus')
      this.ctx.emit('targetHit', { id: best.id })
      this.ctx.emit('hit', { distance: bestDist, bonus: bonus })
    }
  }
}