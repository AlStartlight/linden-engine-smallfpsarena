export default class Probe {
  ctxRef: any
  t = 0
  ys: any[] = []
  onInit(ctx: any) { this.ctxRef = ctx }
  onUpdate(dt: number) {
    this.t += dt
    const c: any = this.ctxRef
    if (this.t >= 0.6 && this.t < 2.01) {
      const pl = c.entity
      this.ys.push(Math.round(pl.getTransform().position.y * 1000) / 1000)
      this.t = 2.01
    }
    if (this.t >= 2.0 && this.ys.length) {
      const m = c.movement || {}
      throw new Error('YS=' + this.ys.join(',') + ' movKeys=' + Object.keys(m).join('|') + ' grounded=' + JSON.stringify(m.isGrounded) + ' vel=' + JSON.stringify(m.velocity))
    }
  }
}