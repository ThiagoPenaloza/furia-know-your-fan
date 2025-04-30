// // pages/api/validateLink.js
// import fetch from 'isomorphic-unfetch'
// import * as cheerio from 'cheerio'
// import { validateLinkContent } from '../../utils/api'

// export default async function handler(req, res) {
//   try {
//     let { url } = req.body
//     if (!/^https?:\/\//i.test(url)) url = 'https://' + url

//     const htmlRaw = await fetch(url).then(r => r.text())
//     const $ = cheerio.load(htmlRaw)
//     const text = $('body').text().slice(0, 10000)

//     const { relevant } = await validateLinkContent(text)
//     return res.json({ relevant })
//   } catch (e) {
//     console.error('validateLink error', e)
//     return res.status(500).json({ error: e.message })
//   }
// }