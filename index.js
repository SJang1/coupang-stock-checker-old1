const request = require('request');
const cheerio = require('cheerio');
const TelegramBot = require('node-telegram-bot-api');
const args = require('yargs').argv;


// Options
// -U string     : "url" Only works with coupang - Required
// -B string     : "TelegramBotKey" - Write in code possible
// -M string/int : Send Message to this ID - Write in code Possible
// -S int        :how often do you want to check - Default 10000 (10sec)

// Set Optional ones Default value
var TelegramBotKey = args.B;
var TelegramSendTo = args.M;
var sleeptime = args.S;

if ( !TelegramBotKey ) {
  var TelegramBotKey = ''; // Default Telegram Bot Key
}
if (!TelegramSendTo) {
  var TelegramSendTo = '' // Default SendTo here (like userid)
}
if ( !sleeptime ) {
  var sleeptime = 10000; // Default Sleep Time here
}

// Check if Everything is in
if ( !TelegramBotKey ) {
  console.error("NO -B TelegramBotKey Found");
  process.exit();
}
if (!TelegramSendTo) {
  console.error("NO -M Send_to_this_id Found");
  process.exit();
}
if ( !sleeptime ) {
  console.error("NO -S sleeptime Found");
  process.exit();
}
if ( !args.U ) {
  console.error("NO -U url Found");
  process.exit();
}

//Start Code
let telegramBot = new TelegramBot(TelegramBotKey); 
let sendto = TelegramSendTo;

setInterval(function() {
  let url = args.U; // Input URL to check

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
    var $prod_option_name = $('.prod-option__selected .title').text(); // 옵션 이름 불러오기
    var $prod_option_value = $('.prod-option__selected .value').text(); // 옵션 값 불러오기
    var $aosLabel = $('.aos-label').text(); //aos-label

    if ( !$prodname ) {
      console.error("It may be BANNED or Wrong URL");
      var text = "CANNOT CONNECT or Wrong URL";
      sendTelegram(text); // sending message NOT WORKING
      console.log("Exitting");
      process.exit();
    }
    
    if ( $prod_option_name ) {
      var set_options = "\n_" + $prod_option_name + " : " + $prod_option_value + "_\n"; //옵션 보여주기 위한 내용
    } else {
      var set_options = "\n_옵션확인실패_\n";
    }

    if ( $aosLabel.indexOf('품절임박') !== -1 ) { // 품절임박
      var aosLabelText = "\n*⌛" + $aosLabel + "⌛*";
    } else {
      var aosLabelText = "";
    }


    // 메시지 내용 확립
    if ( !$prod ) { // 품절 상태가 아닌 경우 (재고가 있는 경우)
      console.log("In Stock : " + $prodname + set_options);
      var text = "*👍In Stock* : " + $prodname + aosLabelText + set_options + url;
    } else { // 품절 상태인 경우
      console.log("Out of Stock : " + $prodname + set_options);
      var text = "Out of Stock : " + $prodname + set_options + url;
      return; // Delete this return; to get an message even out of stock
    }

    sendTelegram(text);
  });
}, sleeptime);

function sendTelegram(text) {
  const opts = {
//    reply_markup:{
//      keyboard: [
//        ['FAQ'],
//        ['Buy']
//      ]
//    },
    parse_mode: 'Markdown'
  };
  telegramBot.sendMessage(sendto, text, opts);
}


// Todo
// 사전예약 시작 전 작동 확인 (문제 있으면 일시품절 또는 시작 전으로 안내하도록 조치해야함)
