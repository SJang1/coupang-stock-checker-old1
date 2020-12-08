const request = require('request');
const cheerio = require('cheerio');
const TelegramBot = require('node-telegram-bot-api');

let telegramBot = new TelegramBot('BotKey'); // Input Telegram Bot Key Here
let sendto = 'SendTo'; // Input SendTo here (like userid)
let sleeptime = 10000; // Run every (1000 = 1sec), (10000 = 10sec), etc..

setInterval(function() {
  let url = 'https://www.coupang.com/vp/products/4322481223?vendorItemId=72343056111'; // Input URL to check here

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
    var $prod = $('.sold-out, .prod-not-find-known__buy__button').html(); // 품절 상태면 값이 있음, 판매중이면 값이 없음
    var $prodname = $('.prod-buy-header__title').text();  // 상품 이름 불러오기

    if ( !$prod ) { // 품절 상태가 아닌 경우 (재고가 있는 경우)
      console.log("In Stock");
      var text = "In Stock : " + $prodname + "\n" + url;
    } else { // 품절 상태인 경우
      console.log("Out of Stock");
      var text = "Out of Stock : " + $prodname;
      return; // Delete this return; to get an message even out of stock
    }

    sendTelegram(text);
  });
}, sleeptime);

function sendTelegram(text) {
  telegramBot.sendMessage(sendto, text);
}


// Todo
// 사전예약 시작 전 작동 확인 (문제 있으면 일시품절 또는 시작 전으로 안내하도록 조치해야함)
