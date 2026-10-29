export default class ProbeB {
  ctxRef: any
  got: any = null
  t = 0
  onInit(ctx: any) {
    this.ctxRef = ctx
    ctx.on('ping', (d: any) => { this.got = d })
  }
  onUpdate(dt: number) {
    this.t += dt
    const c: any = this.ctxRef
    if (this.t > 1.5 && !this.thrown) {
      this.thrown = true
      let obj = 'none'
      try {
        const o = c.object3D
        if (o) {
          const p = o.getWorldPosition(new c.three.Vector3())
          const d = o.getWorldDirection(new c.three.Vector3())
          obj = 'name=' + o.name + ' type=' + o.type + ' pos=' + JSON.stringify([Math.round(p.x*100)/100, Math.round(p.y*100)/100, Math.round(p.z*100)/100]) + ' dir=' + JSON.stringify([Math.round(d.x*100)/100, Math.round(d.y*100)/100, Math.round(d.z*100)/100]) + ' children=' + o.children.length
        } else obj = 'null'
      } catch (e: any) { obj = 'err:' + e.message }
      const q = c.ui.query ? c.ui.query('#hud-root') : 'no-query'
      const ray = c.physics.raycast({ x: 0, y: 1.7, z: 0 }, { x: 0, y: 0, z: -1 }, 50)
      throw new Error('PING=' + JSON.stringify(this.got) + ' OBJ=' + obj + ' uiQuery=' + (q ? (q.tagName + '#' + q.id) : String(q)) + ' uiRoot=' + (c.ui.root ? c.ui.root.tagName : 'null') + ' ray=' + JSON.stringify(ray && { d: Math.round(ray.distance*100)/100, id: ray.entityId, name: ray.entity && ray.entity.name }) + ' typeofFind=' + typeof c.scene.find + ' load=' + typeof c.scene.load)
    }
  }
}