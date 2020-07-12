if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const { Telegraf } = require('telegraf')
const request = require('axios')
const express = require('express')

const expressApp = express()

const PORT = process.env.PORT || 3000
const URL = process.env.URL
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN

expressApp.get('/', (req, res) => {
  res.send('It works!')
})
expressApp.listen(port, () => {
  console.log(`Listening on port ${port}`)
})

const bot = new Telegraf(TELEGRAM_TOKEN)

bot.telegram.setWebhook(`${URL}/bot${TELEGRAM_TOKEN}`)
bot.startWebhook(`/bot${TELEGRAM_TOKEN}`, null, PORT)

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
