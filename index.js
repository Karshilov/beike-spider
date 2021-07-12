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
    const title = (curDOM('div .content').children('p').html()).trim()
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
    // console.log(title, features, price)
    let rent_type = '季付价'
    let house_type = ''
    let area = 0
    let floor = 0
    let total_floor = 0
    let decoration = ''
    let neighborhood = title.split('·')[1].split(/\s+/)[0]
    let equipments = 0

    curDOM('div .content__aside').children('ul').filter('.content__aside__list').children('li').each(function (idx, e) {
      const str = curDOM(e).text();
      const val = str.split('：')
      if (str.includes('类型')) {
        const el = val[1].split(/\s+/)
        house_type = el[0]
        area = parseFloat(el[1].slice(0, el[1].length - 1))
        decoration = el[2] ?? '简装修'
      } else if (str.includes('楼层')) {
        const el = val[1].split(/\s+/)
        const cnt = el[1].split('/')[1];
        const cur = el[1].split('/')[0];
        total_floor = parseInt(cnt.slice(0, cnt.length - 1))
        if (cur.includes('低')) {
          floor = Math.floor(total_floor / 3 - 0.5)
        } else if (cur.includes('中')) {
          floor = Math.floor(total_floor / 3 * 2 - 0.5)
        } else {
          floor = total_floor
        }
      }
    })
    curDOM('div .content__article').children('ul').filter('.content__article__info2').children('li').each(function (idx, e) {
      const str = curDOM(e).text().trim()
      const yesOrNo = curDOM(e).hasClass('facility_no')
      if (str === '洗衣机' && (!yesOrNo)) equipments |= (1 << 9);
      if (str === '空调' && (!yesOrNo)) equipments |= (1 << 8);
      if (str === '衣柜' && (!yesOrNo)) equipments |= (1 << 7);
      if (str === '电视' && (!yesOrNo)) equipments |= (1 << 6);
      if (str === '冰箱' && (!yesOrNo)) equipments |= (1 << 5);
      if (str === '热水器' && (!yesOrNo)) equipments |= (1 << 4);
      if (str === '床' && (!yesOrNo)) equipments |= (1 << 3);
      if (str === '暖气' && (!yesOrNo)) equipments |= (1 << 2);
      if (str === '宽带' && (!yesOrNo)) equipments |= (1 << 1);
      if (str === '天然气' && (!yesOrNo)) equipments |= (1 << 0);
    }) 
    console.log({
      title,
      photos,
      area,
      floor,
      total_floor,
      features,
      price,
      house_type,
      decoration,
      neighborhood,
      city: '北京',
      rent_type,
      equipments
    })
  })
}

main()