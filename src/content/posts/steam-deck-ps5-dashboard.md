---
title: Steam Deck 兼職 PS5
description: 用 Decky Loader 外掛 decky-ps5-dashboard 把 Steam Deck 遊戲模式改成 PS5 風格主畫面，安裝前先檢查外掛會碰哪些東西，再自己補上影片背景、自訂圖示，以及自動下載 Steam 商店預告片當背景。
pubDate: 2026-11-03T00:00:00+08:00
category: life-lab
tags: [steam-deck, decky-loader, steamos]
cover: https://ryan-hsu.com/images/steam-deck-ps5-dashboard/cover.jpg
---

<figure>
  <img src="/images/steam-deck-ps5-dashboard/cover.jpg" alt="Steam Deck 兼職 PS5：換上 PS5 風格主畫面的 Steam Deck 示意封面" width="1200" height="631" />
</figure>

之前才玩過把智能電視改成Apple TV的風格(參考文章：[智能家居系列（五）：我怎麼把 CleanYourTV 改成自己的電視首頁
](https://ryan-hsu.com/how-i-customized-cleanyourtv))，現在又要來改我的Steam Deck了。
<figure>
  <img src="/images/steam-deck-ps5-dashboard/before.webp" alt="Steam Deck 原本的遊戲模式首頁，上方是最近玩過的遊戲，下方是新鮮事、好友與推薦分頁" width="1600" height="1200" loading="lazy" />
  <figcaption>改造前：Steam Deck 原本的首頁，資訊很多，但看久了有點像在逛商店。</figcaption>
</figure>

只是每天打開，都覺得它比較像商店的延伸，不太像一台遊戲機的主畫面。
剛好在 GitHub 上看到 [decky-ps5-dashboard](https://github.com/kromossomom-debug/decky-ps5-dashboard) 這個專案，說可以讓 Steam Deck 的遊戲模式長得像 PS5，作者也另外有改成Xbox的版本（[decky-xbox-dashboard](https://github.com/kromossomom-debug/decky-xbox-dashboard)）可以參考。

## 先找主題：CSS Loader 裡沒有 PS5 的外觀

Steam Deck換主題，最常見的做法是 [Decky Loader](https://decky.xyz) 加上 [CSS Loader](https://github.com/DeckThemes/SDH-CssLoader)，再到DeckThemes的主題庫挑一款。
這條路最穩：從商店安裝，只改CSS，不喜歡一鍵關掉就好。

不過我在DeckThemes搜尋`PS5`和`PlayStation`，找到的全部是**音效和背景音樂包**，
例如PS5介面音效、PS5首頁音樂，要搭配Audio Loader使用，改成PS5主題的一個都沒有。
所以想要PS5的樣子，目前應該只能用decky-ps5-dashboard這種外掛，
它不只是換顏色，而是直接把 Steam 的首頁換成自己畫的畫面。

## decky-ps5-dashboard 做了什麼

它是一個Decky Loader外掛，前端用 TypeScript／React，後端是一小段 Python。
主要功能：
- **換掉首頁**：上方一排方形遊戲磚，選到的遊戲美術圖鋪滿整個畫面，下面是遊戲Logo、白色的開始按鈕。
- **資訊卡**：[HowLongToBeat](https://howlongtobeat.com)（玩家回報各遊戲破關時間的網站，簡稱 HLTB）的破關時間、自己的遊玩時數、評論和成就進度。
- **全站改色**：Steam的選單、按鈕、開關換成PS5的藍色與深色調，Quick Access改成類似Control Center的圓角面板。
- **14 種語言**：跟著Steam的語言設定走，有繁體中文。

### 安裝前，先看它會碰哪些東西

外掛不在Decky商店裡，要用ZIP安裝，等於跳過了商店審核。
所以老樣子先把原始碼看過一遍，確認幾件事：
| 項目 | 結果 |
| --- | --- |
| 需不需要 root 權限 | 不用，`plugin.json`沒有設定任何 flags |
| 會連到哪些網站 | 只有`howlongtobeat.com`，只送遊戲名稱 |
| 會不會下載或執行其他程式 | 沒有`subprocess`、`eval`、`exec` |
| 會寫入哪些檔案 | 只有自己的設定檔和HLTB快取 |
| 首頁畫不出來時 | 會退回Steam原本的首頁 |

比較需要注意的是它依賴Steam介面內部的class名稱，Steam更新後，部分樣式可能暫時失效，要等作者更新。
另外它不能和CSS Loader裡會改首頁的主題同時開，兩個會有衝突。

## 安裝：Decky Loader，再加一個 ZIP

步驟不多：
1. 切到桌面模式，從 [decky.xyz](https://decky.xyz) 下載安裝程式並執行，選Release版。
2. 回到遊戲模式，在Decky的設定 → General打開 **Developer mode**。
3. 下載專案的`ps5-dashboard.zip`，放進Deck的下載資料夾。
4. Decky設定 → Developer → **Install Plugin from ZIP**，選這個 ZIP。
5. 到Quick Access裡的PS5 Dashboard調整設定。

安裝Decky時，因為我沒設過`deck`帳號的密碼，安裝程式跳出了設定密碼的提示，我沒理它就按了確定。
後來確認Quick Access裡有出現插頭圖示，就代表已經裝好了。

## 改造後的PS5主題

<figure>
  <img src="/images/steam-deck-ps5-dashboard/after.webp" alt="Steam Deck換上PS5 Dashboard後的首頁，選到巫師 3，背景是美術圖，下方有破關時間、遊玩時數、評論與成就資訊卡" width="1600" height="1200" loading="lazy" />
  <figcaption>改造後上方是遊戲磚，選到的遊戲美術圖鋪滿背景，下面一排是資訊卡。</figcaption>
</figure>

第一次進首頁的感覺很明顯：遊戲變成主角，商店和推薦都退到後面去了，介面文字也是繁體中文，沒有出現方框字。
用了一下，也遇到兩個小問題。

### HowLongToBeat 對不到中文遊戲名稱

上圖的「破關時間」顯示**沒有 HowLongToBeat 資料**。外掛是用遊戲名稱去 HowLongToBeat 搜尋，而我的 Steam 是繁體中文，送出去的名稱是「巫師3：狂獵 — 重製版」，自然搜不到。

### 有些遊戲的封面不見了

部分遊戲磚沒有圖，只剩遊戲名稱，看了程式碼才知道，外掛找封面的順序是：
1. 自己設定過的自訂封面
2. Deck 本機的圖片快取
3. Steam CDN 上固定路徑的直式封面

非 Steam 遊戲只會讀第一項，沒設過就一定沒圖，有些 Steam 遊戲的圖片放在不同的網址，固定路徑也找不到。
問AI的解法是裝 [SteamGridDB](https://github.com/SteamGridDB/decky-steamgriddb) 外掛，替沒圖的遊戲補一張 Capsule，自訂封面排在第一順位，但我太懶了就沒有設定。

## 看Issue發現有人提了動態背景

逛專案的時候，看到 [issue #2](https://github.com/kromossomom-debug/decky-ps5-dashboard/issues/2)：有人用 Claude 加了三個功能，包括自訂圖示、直接開始遊戲和動態背景，還附了一段示範影片，這個看起來很厲害哦。
問題是只有影片，沒有程式碼，也沒有 PR，只是在問作者要不要這個版本。
看完示範影片之後，原本靜態的美術圖突然顯得有點普通，來路不明的 ZIP 我不想裝，於是決定 fork 一份。

### 自訂圖示與影片背景

關鍵在於外掛的前端怎麼讀到我放在Deck上的圖片和影片？

翻了Decky Loader的原始碼，它有一條`/plugins/<外掛名稱>/data/`的路徑，會直接提供`~/homebrew/data/<外掛資料夾>/`裡的檔案，而且這個資料夾一般使用者就能寫入，不需要 root。
所以最後的規則是：
```text
~/homebrew/data/ps5-dashboard/
├─ videos/
│  ├─ <appid>.webm    只用在這款遊戲
│  └─ default.mp4     其他沒有專屬影片的遊戲
└─ icons/
   └─ store.png       商店、遊戲庫、下載等圖塊的自訂圖示
```
影片背景另外做了一個開關，不想耗電的時候可以關掉，遊戲執行時影片也會自動暫停，不會在背景偷偷解碼。

### 再進一步：自動抓 Steam 商店的預告片

做到這裡，還要自己去找影片、轉檔、改檔名，對一個主畫面來說還是太勤勞了。
每款遊戲在Steam商店都有官方預告片，能不能讓它自己抓？
查了 Steam 商店的 API，現在預告片不再提供直接下載的 `.webm` 或 `.mp4`，只有HLS／DASH的串流。
原本以為要在Deck上裝ffmpeg才能處理，實際抓下來看了格式，發現它是 CMAF：
- 畫面和聲音是兩條分開的串流，可以只抓畫面。
- 每條串流是一個init片段，加上很多3秒一段的fMP4片段。
- 把init和前面幾段**直接接起來，就是一個能播的`.mp4`**，不用轉檔。

所以後端只要用 Python下載720p畫面的前30秒、接成一個檔案，存到`videos/auto/<appid>.mp4`，
在首頁停在某款遊戲上約1秒，它就會在背景下載，下次選到就直接播，
用Dota 2測試時，30秒的720p影片大約7.7MB。

自己放的影片優先，自動下載的預告片其次，最後才是`default`，
當然這個功能要有自己的開關，避免有一天Steam OS更新整個壞光光。

## 最後的成品

<figure>
  <video src="/images/steam-deck-ps5-dashboard/ps5-dashboard-video.mp4" width="854" height="480" autoplay muted loop playsinline controls preload="metadata"></video>
  <figcaption>加上動態背景之後的首頁：選到《伊莫》，背景從靜態美術圖變成會動的遊戲畫面。</figcaption>
</figure>

現在打開 Steam Deck，背景會動，遊戲磚在上面滑，看起來確實很像另一台主機的首頁，
這版改動目前只在我自己的 Deck 上使用，沒有發布，
如果原作者之後有官方支援動態背景，我大概會直接換回官方版本，省得每次更新都要自己合併。

## 想照著做？可以把這段交給 AI

整個過程我是讓 AI 協助看原始碼、查 Decky 的介面和測試下載流程，
如果你也想改自己的外掛，可以從這段開始：
```text
我想改 Steam Deck 的 Decky Loader 外掛 decky-ps5-dashboard。

我的需求：
- <列出想加的功能，例如影片背景、自訂圖示>
請先 clone 原始專案，讀懂首頁、啟動遊戲和背景圖的程式碼，
確認需求是不是已經內建，再開始修改。

需要讀取 Deck 上的檔案時，優先使用不需要 root 的位置，
不要修改 plugin.json 的權限設定。

每個新功能都要有可以關閉的設定。
改完後執行型別檢查與 build，打包成可以從 Decky 安裝的 ZIP，
並列出哪些已經驗證過、哪些需要我在 Deck 上實測。
```

## 結論

如果你也想幫 Steam Deck 換個樣子，我會這樣選：
- **只想換顏色或小細節**：CSS Loader 加 DeckThemes 就夠了，從商店安裝，最安全也最好還原。
- **想讓整個首頁變成 PS5**：decky-ps5-dashboard 是我目前找到最接近的選擇，裝之前花十分鐘看一下原始碼，心裡會踏實很多。
- **想要動態背景**：等官方支援最省事，等不及的話可以像我一樣 fork 一份自己改，但要有每次原作者更新、都得自己合併一次的心理準備。

這次改變的只有每次拿起來時看到的第一個畫面，但第一印象最重要。
唯一還沒適應新工作的是HowLongToBeat，它到現在還不知道「巫師3：狂獵 — 重製版」要玩多久。
說實話我也不知道，玩了23小時，成就才解開2/78，太少時間玩遊戲了，都跑去研究AI。