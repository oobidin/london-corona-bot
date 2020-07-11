if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const { Telegraf } = require('telegraf')
const fs = require('fs-extra')
const request = require('axios')

const bot = new Telegraf(process.env.TELEGRAM_TOKEN)

const CSV_URL =
  'https://data.london.gov.uk/download/coronavirus--covid-19--cases/7a3c305c-fa4e-47db-8843-aed537cde495/phe_cases_london_england.csv'

const downloadData = async () => {
  try {
    const { data } = await request(CSV_URL)

    if (data) {
      const jsonData = data
        .split('\n')
        .map((item) => item.split(',').slice(0, 3))
        .filter((item) => item[1] === '"London"')
        .slice(-3)
        .map((item) => [`Date: ${item[0]}`, ` New cases: ${item[2]}`])

      return jsonData.join('\n')
    }
  } catch (e) {
    return ''
  }
}

bot.hears(['data', 'Data'], async (ctx) => {
  ctx.reply('Thinking...')

  const data = await downloadData()

  ctx.reply(data)
})

bot.launch()
