const request = require('request');
const cheerio = require('cheerio');
const TelegramBot = require('node-telegram-bot-api');
const args = require('yargs').argv;
const cookiefile = require('cookiefile');

// Options
// -U string     : "url" Only works with coupang - Required
// -B string     : "TelegramBotKey" - Write in code possible
// -M string/int : Send Message to this ID - Write in code Possible
// -S int        : how often do you want to check - Default 10000 (10sec)
//
// -C string     : Coupang cookie file Used to Login - Optional
// Please Delete all lines starting with #HttpOnly_ on cookie file before start
// Please Enter the Full Path of link, only files avaliable.
// You can get and export to cookies.txt with Browser Extensions.

// Set Optional ones Default value
var TelegramBotKey = args.B;
var TelegramSendTo = args.M;
var sleeptime = args.S;
var cookiefiledir = args.C;

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

  var options = {
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

    const current_url = new URL(args.U);
    const search_params = current_url.searchParams;
    const vendorItemId = search_params.get('vendorItemId');
    // finding venderitemid works

    const itemifwparam = current_url.href.substring(current_url.href.lastIndexOf('/') + 1);
    const itemIDwq = itemifwparam.replace(search_params,'');
    const productId = itemIDwq.replace('?','');
    // console.log(productId, vendorItemId);
    // Will use for Checkout page generating

    
    var $ = cheerio.load(body);
    var $prod = $('.sold-out, .prod-not-find-known__buy__button').html(); // 품절 상태면 값이 있음, 판매중이면 값이 없음
    var $prodname = $('.prod-buy-header__title').text();  // 상품 이름 불러오기
    var $prod_option_name = $('.prod-option__selected .title').text(); // 옵션 이름 불러오기
    var $prod_option_value = $('.prod-option__selected .value').text(); // 옵션 값 불러오기
    var $aosLabel = $('.aos-label').text(); //aos-label

    var $thumbnail_link = $("meta[property='og:image']").attr("content"); //상품이미지 
    var $imagelink = "https:" + $thumbnail_link;

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

      if (!cookiefiledir) {  //  쿠키 여부에 따라 체크아웃 링크생성
        console.log("No Cookie");
        var checkout_url = url;
      } else {
        const cookiemap = new cookiefile.CookieMap(cookiefiledir);
        const cookies = cookiemap.toRequestHeader().replace ('Cookie: ','');
        MakeOrderURL(productId, vendorItemId, cookies);
      }

      console.log("In Stock : " + $prodname + set_options);
      var text = "[​​​​​​​​​​​](" + url + ")" + "*👍In Stock* : " + $prodname + aosLabelText + set_options + checkout_url; 
      // var text = "*👍In Stock* : " + $prodname + aosLabelText + set_options + url;
    } else { // 품절 상태인 경우
      console.log("Out of Stock : " + $prodname + set_options);
      var text = "Out of Stock : " + $prodname + set_options + url;
      return; // Delete this return; to get an message even out of stock
    }

    sendTelegram(text);
  });
}, sleeptime);


// Todo
// 사전예약 시작 전 작동 확인 (문제 있으면 일시품절 또는 시작 전으로 안내하도록 조치해야함)

// Todo
// 5분에 한번씩만 아래 스크립트가 돌도록 설정
// $checkout을 리턴하여  (리턴 전에는 위에 스크립트 일시정지) 메시지에서 바로 체크아웃할 수 있도록 해야함
var MakeOrderURL = function(productId, vendorItemId, cookies) {
  // console.log(productId, vendorItemId + "MakeOrder");
  // console.log(cookies)
  var options = {
    uri: 'https://www.coupang.com/vp/direct-order/'+ productId +'/items',
    headers: {
      'Host': 'www.coupang.com',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:71.0) Gecko/20100101 Firefox/71.0',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Accept-Language': 'ko-KR,ko;q=0.8,en-US;q=0.5,en;q=0.3',
      'Referer': 'https://www.coupang.com/',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Cache-Control': 'max-age=0',
      'TE': 'Trailers',
      'Cookie': cookies
    },
    form: {
      "items[]": vendorItemId +":+1",
      "clickProductId": productId,
      "landProductId": productId,
      "preOrder": true
    }
  };
  request.post(options, function(error, response, body) {
    if (error){
      console.error(error);
      process.exit();
    }

    var parsedjson = JSON.parse(body);
    var $checkout1 = parsedjson.orderCheckoutUrl;
    var $checkout = $checkout1.requestUrl;
    console.log($checkout)
  })
}

function sendTelegram(text) {
  const opts = {
//    reply_markup:{
//      keyboard: [
//        ['FAQ'],
//        ['Buy']
//      ]
//    },
    parse_mode: 'Markdown',
    disable_web_page_preview: false
  };
  telegramBot.sendMessage(sendto, text, opts);
}
