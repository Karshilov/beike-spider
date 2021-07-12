const cheerio = require('cheerio')
const axios = require('axios').default
const cities = require('./city')
const header = require('./header')
const area = [
  'rt200600000001',
  'rt200600000002'
]

function delay () {
  return new Promise((res, rej) => {
    setTimeout(() => {
      res
    }, 3000)
  })
}

async function main() {
  const rootURL = `https://${cities.cityPrefixes[0]}.ke.com`;
  const res = await axios.get(`https://${cities.cityPrefixes[0]}.ke.com/zufang/${area[0]}/`, { header: header.getHeader() })
  $ = undefined
  if (res.status === 200) {
    $ = cheerio.load(res.data)
  }
  if ($ === undefined) return;
  console.log('enter')
  const totalPage = parseInt($('div .content__pg').data('totalpage'))
  const raw = $('div .content__list--item').children('a');
  raw.each(async function(i, elem) {
    const detail = rootURL + $(elem).attr('href');
    const htmlText = await axios.get(detail, { header: header.getHeader() })
    const curDOM = cheerio.load(htmlText.data)
    const title = (curDOM('div .content').children('p').html())
    const photos = []
    // if (i === 0) console.log(htmlText.data)
    curDOM('div .content__article__slide__item').children('img').each(function (idx, e) {
      photos.push(curDOM(e).data('src'))
    })
    const features = []
    curDOM('div .content__aside').find('p').children('i').each(function (idx, e) {
      features.push(curDOM(e).text())
    })
    const price = parseInt(curDOM('div .content__aside--title').children('span').text())
    console.log(title, features, price)
  })
}

main()