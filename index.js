const request = require('request');
const cheerio = require('cheerio');
const TelegramBot = require('node-telegram-bot-api');

let telegramBot = new TelegramBot('[텔레그램 봇 Token]');

setInterval(function() {
  let url = '[쿠팡 상품 페이지 URL]';

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
  
    // 품절버튼인지 구매버튼인지 확인
    var text = $('.prod-pre-order-btn .prod-buy-btn__txt').text();
    if ('일시품절' === text) {
      return;
    }

    sendTelegram(text);
  });
}, 1000);

function sendTelegram(text) {
  console.log(text);
  
  telegramBot.sendMessage([텔레그램 채널 ID], text);
}
