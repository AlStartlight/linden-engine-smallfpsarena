export default class HudController {
  roundTime = 90
  comboWindow = 2.4
  score = 0
  shots = 0
  hits = 0
  streak = 0
  bestStreak = 0
  multiplier = 1
  timeLeft = 90
  playing = true
  private ctx: any
  private elapsed = 0
  private lastHitAt = -99
  private flash = 0
  private kick = 0
  private hintTime = 0
  private els: any = {}

  onInit(ctx: any) {
    this.ctx = ctx
    this.timeLeft = this.roundTime
    this.ensureEls()
    ctx.ui.bind('#hud-score', () => String(this.score))
    ctx.ui.bind('#hud-acc', () => this.accuracy() + '%')
    ctx.ui.bind('#hud-hits', () => this.hits + ' / ' + this.shots)
    ctx.ui.bind('#hud-time', () => Math.ceil(Math.max(0, this.timeLeft)) + 's')
    ctx.ui.bind('#hud-streak', () => 'x' + this.multiplier.toFixed(1) + ' combo')
    ctx.ui.on('#btn-restart', 'click', () => ctx.scene.load('scenes/Main.lscene'))
    ctx.ui.hide('#hud-gameover')
    ctx.on('shot', () => {
      if (!this.playing) return
      this.shots++
      this.kick = 1
      this.hideHint()
    })
    ctx.on('hit', (d: any) => this.onHit(d))
  }

  private accuracy() {
    if (this.shots <= 0) return 0
    return Math.round((this.hits / this.shots) * 100)
  }

  private ensureEls() {
    const q = this.ctx.ui.query
    const ids = ['hitmark', 'cross', 'bar', 'gameover', 'finalScore', 'finalAcc', 'finalStreak', 'hint']
    const el = this.els
    if (!el.hitmark) el.hitmark = q('#hud-hitmark')
    if (!el.cross) el.cross = q('#hud-cross')
    if (!el.bar) el.bar = q('#hud-timebar')
    if (!el.gameover) el.gameover = q('#hud-gameover')
    if (!el.finalScore) el.finalScore = q('#final-score')
    if (!el.finalAcc) el.finalAcc = q('#final-acc')
    if (!el.finalStreak) el.finalStreak = q('#final-streak')
    if (!el.hint) el.hint = q('#hud-hint')
    return ids.length
  }

  private hideHint() {
    if (this.els.hint && this.els.hint.style) this.els.hint.style.opacity = '0'
  }

  private onHit(d: any) {
    if (!this.playing) return
    this.hits++
    this.streak++
    if (this.streak > this.bestStreak) this.bestStreak = this.streak
    this.multiplier = 1 + Math.min(2, Math.floor(this.streak / 3) * 0.5)
    const base = d && d.bonus ? 300 : 100
    const dist = d && d.distance ? d.distance : 0
    this.score += Math.round((base + dist * 2) * this.multiplier)
    this.lastHitAt = this.elapsed
    this.flash = 1
    if (this.els.gameover) this.els.gameover.style.opacity = '0'
  }

  private endRound() {
    this.playing = false
    this.ensureEls()
    const e = this.els
    if (e.finalScore) e.finalScore.textContent = String(this.score)
    if (e.finalAcc) e.finalAcc.textContent = this.accuracy() + '%'
    if (e.finalStreak) e.finalStreak.textContent = String(this.bestStreak)
    if (e.hitmark) e.hitmark.style.opacity = '0'
    this.ctx.ui.hide('#hud-hint')
    this.ctx.ui.show('#hud-gameover')
  }

  onUpdate(dt: number) {
    this.elapsed += dt
    if (this.playing) {
      this.timeLeft -= dt
      if (this.timeLeft <= 0) {
        this.timeLeft = 0
        this.endRound()
      }
      if (this.streak > 0 && this.elapsed - this.lastHitAt > this.comboWindow) {
        this.streak = 0
        this.multiplier = 1
      }
    }

    this.flash = Math.max(0, this.flash - dt * 3.4)
    this.kick = Math.max(0, this.kick - dt * 4.5)

    if (!this.els.hitmark || !this.els.cross) this.ensureEls()
    const e = this.els
    if (e.hitmark) {
      e.hitmark.style.opacity = String(this.flash)
      e.hitmark.style.transform = 'rotate(45deg) scale(' + (1 + this.flash * 0.3) + ')'
    }
    if (e.cross) e.cross.style.transform = 'scale(' + (1 + this.kick * 0.28) + ')'
    if (e.bar) {
      const pct = Math.max(0, Math.min(1, this.timeLeft / this.roundTime)) * 100
      e.bar.style.width = pct + '%'
      if (this.playing && this.timeLeft <= 15) {
        e.bar.style.background = 'linear-gradient(90deg,#f97316,#ef4444)'
      }
    }
    this.hintTime += dt
    if (this.hintTime > 10) this.hideHint()
  }
}