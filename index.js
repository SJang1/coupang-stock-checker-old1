const request = require('request');
const cheerio = require('cheerio');
const TelegramBot = require('node-telegram-bot-api');

let telegramBot = new TelegramBot('BotKey'); // Input Telegram Bot Key Here
let sendto = 'SendTo'; // Input SendTo here

setInterval(function() {
  let url = 'https://www.coupang.com/vp/products/1555441862?vendorItemId=70651096136&isAddedCart='; // Input URL to check here

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
  
    var $ = cheerio.load(body);
    var $prod = $('.sold-out').html(); // 일시품절 상태면 값이 있음, 판매중이거나 품절이면 값이 없음

    if ( !$prod ) {
      // In stock
      console.log("stock");

      var $checkifunavaliable = $('.prod-not-find-known__buy__button').text();
      if ( !$checkifunavaliable ) {
        // console.log("재고있음", url)
        var text = "재고있음\n" + url;
      } else {
        console.log("품절");
        // var text = "품절";
        return;
      }
    } else {
      // Not in stock
      console.log("notinstock");
      // var text = "재고없음";
      return
    }

    sendTelegram(text);
  });
}, 10000); // 1000 = 1sec, 10000 = 10sec, etc..

function sendTelegram(text) {
  telegramBot.sendMessage(sendto, text);
}
