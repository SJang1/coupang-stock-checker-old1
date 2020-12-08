const request = require('request');
const cheerio = require('cheerio');
const TelegramBot = require('node-telegram-bot-api');

let telegramBot = new TelegramBot('TelegramBotKey');

setInterval(function() {
  let url = 'https://www.coupang.com/vp/products/4322481223?itemId=5033261176&vendorItemId=72343055826&isAddedCart=';

  const options = {
    uri: url,
    headers: {
      'Host': 'www.coupang.com',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:71.0) Gecko/20100101 Firefox/71.0',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'ko-KR,ko;q=0.8,en-US;q=0.5,en;q=0.3',
      'Referer': 'https://www.coupang.com/',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Cache-Control': 'max-age=0',
      'TE': 'Trailers'
    }
  };

  request(options, function(error, response, body) {
    if (error) {
      console.error(error);
      return;
    }
  
    var a = cheerio.load(body);
    // console.log(body);
  
    // 품절인지 도착 보장인지 확인
    var text = a('.prod-txt-onyx').text();
    console.log(text);

    if (text.indexOf('도착 보장') !== -1) {
      console.log("있음");
      var text = "재고있음";
    } else {
      console.log("없음");
      // var text = "로켓배송 재고없음";
      return;
    }

    sendTelegram(text);
  });
}, 10000);

function sendTelegram(text) {
  console.log(text);
  
  telegramBot.sendMessage([ChatID Here], text);
}
