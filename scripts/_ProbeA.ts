export default class ProbeA {
  t = 0
  onInit(ctx: any) { (globalThis as any).__pa = ctx }
  onUpdate(dt: number) {
    this.t += dt
    const c: any = (globalThis as any).__pa
    if (this.t > 1.0 && !(globalThis as any).__pinged) {
      (globalThis as any).__pinged = true
      c.emit('ping', { v: 42 })
    }
  }
}