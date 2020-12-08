# coupang-restock-checker

1. [쿠팡 상품 페이지 URL] 변경
2. [텔레그램 봇 Token] 변경
3. [텔레그램 채널 ID] 변경

# Known Bug
- 사전예약 시작 안했을 때를 테스트해보지 못함
- 지금은 아래와 같은 옵션 선택만 설정값을 넘겨줌    
![image](https://user-images.githubusercontent.com/29011440/101475916-4fb0e900-3990-11eb-867f-de44f7f7bd5f.png)
- 설정값이 두개 이상인 경우 그 모든 설정값이 붙어있음 예시 : `CPU : 10세대 i516GB × SSD 512GB × 스페이스 그레이` 으로 표시됨 : `CPU : 10세대 i5 / 16GB × SSD 512GB × 스페이스 그레이` 이여야 하기에 고쳐야함
 

# Why?
- 쿠팡 푸쉬알림 맨날 늦어서 못믿겠고 쿠팡알림 수취거부해놨어요 >_<
- 텔레그램 좋아용!

- 판매 시작 시간을 모르는 일시품절로만 처리된 상품을 살 때 유용합니다  
2020년 M1 맥미니가 그랬어요 그래서 어쩔수없이 이런거를 겨우... 힝힝

# How To
1. git clone
2. cd into it
3. npm install
4. Change Those Things on top
5. node ./index.js
