import { DateTime } from "luxon"
import { Telegraf } from "telegraf"
import { MyTelegrafContext } from ".."
import Stat from "../entities/Stat"
import User from "../entities/User"
import logger from "../log"

export default async function recordStat(
  bot: Telegraf<MyTelegrafContext>,
  type: string,
  recordCommand: string,
  undoCommand: string,
  infoCommand: string,
) {
  bot.command(recordCommand, async ctx => {
    const user = await ctx.db.getRepository(User).findOrCreate(ctx.message.from.id)
    const stat = new Stat(user, type)
    await ctx.db.persist(stat).flush()
    logger.trace({ user, type }, "new stat")
    const count = await ctx.db.count(Stat, { user })
    if (Math.random() > 0.95) {
      await ctx.reply(`Gast doe normaal, al ${count}`)
    } else {
      await ctx.reply(`Lekker hoor, je ${count}e`)
    }
  })

  bot.command(undoCommand, async ctx => {
    const user = await ctx.db.findOne(User, { telegramId: ctx.message.from.id })
    const stats = await ctx.db.find(Stat, { user, type })
    if (user != null) {
      if (stats.length > 0) {
        const lastStat = stats.reduce((last, curr) => (curr.date > last.date ? curr : last))
        ctx.db.remove(lastStat)
        await ctx.reply("Oke die is weg")
      } else {
        await ctx.reply("Moet je wel een hebben")
      }
    } else {
      await ctx.reply("Ik ken jou helemaal niet, flikker op")
    }
  })

  bot.command(infoCommand, async ctx => {
    const user = await ctx.db.findOne(User, { telegramId: ctx.message.from.id })
    const stats = await ctx.db.find(Stat, { user, type })
    if (user != null && stats.length > 0) {
      const firstStat = stats.reduce((first, curr) => (curr.date < first.date ? curr : first))
      const count = stats.length
      const todayStart = DateTime.now().set({ hour: 0, second: 0, minute: 0 })
      const countToday = stats.filter(stat => stat.date > todayStart).length
      await ctx.reply(
        `Al ${count} keer sinds ${firstStat.date.toLocaleString(DateTime.DATE_MED)}\n${countToday} waren vandaag`,
      )
    } else {
      await ctx.reply("Ik ken jou helemaal niet, flikker op")
    }
  })
}