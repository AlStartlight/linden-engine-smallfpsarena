export default class Validate {
  t = 0
  shots = 0
  hits = 0
  last: any = null
  done = false
  ctxRef: any
  onInit(ctx: any) {
    this.ctxRef = ctx
    ctx.on('shot', () => { this.shots++ })
    ctx.on('hit', (d: any) => { this.hits++; this.last = d })
  }
  onUpdate(dt: number) {
    this.t += dt
    if (this.t > 3.4 && !this.done && this.shots > 0) {
      this.done = true
      const tg = this.ctxRef.scene.findByTag('Target')
      const scales = tg.map((t: any) => Math.round(t.getTransform().scale.x * 100) / 100).join(',')
      throw new Error('VALID shots=' + this.shots + ' hits=' + this.hits + ' last=' + JSON.stringify(this.last) + ' scales=' + scales)
    }
  }
}