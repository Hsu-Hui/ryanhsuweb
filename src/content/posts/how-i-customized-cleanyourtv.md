---
title: 智能家居系列（五）：我怎麼把 CleanYourTV 改成自己的電視首頁
description: 電視首頁看起來有點髒，我用 CleanYourTV 保守地關掉推薦內容，換上只有常用 App 的繁中首頁，再加上一個會顯示天氣的寶可夢螢幕保護。這篇用不需要懂程式的方式，逐步整理我的實作方法。
pubDate: 2026-10-25T12:09:16+08:00
category: smart-home
tags: [android-tv, smart-home, cleanyourtv, adb]
cover: https://ryan-hsu.com/images/how-i-customized-cleanyourtv/cover.jpg
---

<figure>
  <img src="/images/how-i-customized-cleanyourtv/cover.jpg" alt="智能家居系列（五）：把充滿推薦內容的 Android TV 首頁改成自己的 CleanYourTV 首頁" width="1200" height="631" />
</figure>

突然覺得電視有點髒髒的，就開始動手 Clean 起來。
我把改造後的畫面發到 Threads，沒想到有人好奇是怎麼做的，所以乾脆把這次的實作過程整理成一篇文章。

這裡說的「髒」指的就是每次按下 Home，眼前都有推薦影片、宣傳內容、用不到的入口和一長排 App。明明只想開某一個APP或投放手機畫面，卻要先從一堆資訊裡把它們找出來。

<figure>
  <img src="/images/how-i-customized-cleanyourtv/01-before-tv.webp" alt="改造前的小米 Android TV 首頁，畫面包含大型推薦內容、通知、應用程式列與接著播放清單" width="1600" height="1200" loading="lazy" />
  <figcaption>這是原本的電視首頁。功能都能用，但我每天真正需要的 App，只占了畫面很小的一部分。</figcaption>
</figure>

我就使用 [CleanYourTV](https://github.com/Gathin23/cleanyourtv) 換掉首頁，保守地停用九個和遙測、推薦內容有關的套件，再把四個最常用的 App 固定在第一排。除此之外，還另外做了一個寶可夢螢幕保護 App。

這篇會分成兩部分：前半段是任何人都能跟著做的 CleanYourTV 安裝流程；後半段則說明我的版本比官方多改了什麼。你不需要先會寫程式，但一定要願意在每個步驟停下來確認畫面，不要一路按到底。

> **先提醒：**以下是我在 Xiaomi `MiTV-MSSP3`、Android TV 9、韌體 `PI.6031` 上的實作紀錄。不同品牌、型號，甚至同型號不同韌體，能停用的項目都可能不同。請不要直接複製我的九個套件到另一台電視。

## 先弄懂我們要改什麼

### CleanYourTV 不會把整台電視重灌

CleanYourTV 做的事情其實很像整理手機桌面：先記下電視原本有哪些東西，再暫時關掉不需要的推薦與背景服務，最後換上一個乾淨的首頁。

它不需要 Root、不會刷機，也不會把系統 App 直接刪掉。正確的做法是「停用」而不是「解除安裝」，因此只要保存還原紀錄，之後仍能把原本的首頁和套件打開。

它也不會幫 YouTube 影片去廣告。這次清掉的是電視首頁上的推薦內容，不是串流平台播放中的廣告。

### 官方版本與我的版本差在哪裡

| 項目 | 官方 CleanYourTV | 我的實作 |
| --- | --- | --- |
| 清理方式 | 依電視型號與使用需求建立停用清單 | 先盤點 `PI.6031`，18 個候選中只停用 9 個 |
| 首頁 | 安裝乾淨的 CleanYourTV Launcher | 使用繁體中文，第一排固定四個常用 App |
| 常用 App | 由使用者自己選擇 | YouTube、Netflix、動畫瘋、極速投屏 |
| 螢幕保護 | 內建時鐘，或保留原本的螢幕保護 | 另外製作寶可夢圖片、時間與新北市天氣畫面 |
| 回復方式 | 使用官方 restore 工具 | 另外保存清單、還原腳本和自己編譯的 APK |

如果你只想把首頁整理乾淨，做到官方版本就可以停下來。四格快捷列和寶可夢螢幕保護是我的個人客製化，不是安裝 CleanYourTV 的必要條件。

## 開始前，先準備好回頭路

### 你需要的東西

我這次使用的是電腦加 AI 程式助手的官方流程，需要準備：

- 一台 Android TV 或 Google TV(Samsung Tizen、LG webOS 不適用這套方法)
- 一台和電視連到同一個家用網路的電腦
- 可以操作本機檔案與終端機的 AI 程式助手，例如 Codex、Claude Code 或 Gemini CLI，我甚至看到有人用豆包做的
- 約半小時不會被打斷的時間
- 一份「一定要保留的功能」清單

我的保留清單包括 Netflix、YouTube、Disney+、myVideo、動畫瘋、Prime Video、Chromecast、Google Assistant、韌體更新、HDMI、電視輸入、遙控器與輸入法。這一份清單很重要，因為 AI 不知道你平常會用哪些功能。

如果你只想做官方的基本清理、不需要修改首頁程式，也可以考慮社群提供的 [Clean Your TV Android 手機 App](https://github.com/udhaykumarbala/cleanyourtv-app/releases)。它會用連線、分析、清理三個步驟完成操作。這篇仍以我實際使用的「電腦加 AI 助手」流程為主。

### 先拍照、記錄型號，不要急著清

先替原本首頁拍一張照片，再到電視的「設定 → 裝置偏好設定 → 關於」記下：

- 電視型號；
- Android 版本；
- 韌體版本；
- 電視的區域網路 IP 位址；
- 平常會使用的 App 與輸入來源。

我的資料是 `MiTV-MSSP3`、Android TV 9、韌體 `PI.6031`，用這些資訊確認網路上的清理清單是不是真的適合這台電視。

## Step by Step：把電視首頁清乾淨

### Step 1：打開開發人員選項

在電視上依序進入：

1. 「設定 → 裝置偏好設定 → 關於」
2. 找到「版本」或「Build」
3. 用遙控器連按確認鍵七次
4. 回到上一層，進入新出現的「開發人員選項」
5. 打開「USB 偵錯」
   
雖然名稱叫 USB 偵錯，許多 Android TV 打開後就能讓同一個 Wi-Fi 裡的電腦連線，不一定真的要插 USB 線。設定名稱會因品牌不同而略有差異。

### Step 2：下載 CleanYourTV，交給 AI 先做唯讀檢查

到 [CleanYourTV GitHub](https://github.com/Gathin23/cleanyourtv) 下載專案 ZIP，解壓縮後，用 Codex 或其他 AI 程式助手開啟整個資料夾。

專案內已經準備好一份 `PROMPT.md`。最簡單的做法是把它交給 AI，再補上自己的型號、IP 和保留需求。為了避免 AI 一連上就開始修改，我建議直接貼下面這段：

```text
請依照這個 CleanYourTV 專案協助我整理 Android TV。

我的電視型號：<填入型號>
Android／韌體版本：<填入版本>
電視 IP：<填入 IP>

請先只做唯讀盤點與完整備份，不要立刻停用任何套件。
不要 Root、不要刷機、不要使用 pm uninstall，也不要套用其他韌體的完整清單。

請保留 HDMI、電視輸入、遙控器、藍牙、輸入法、Play 商店、
Play Services、Chromecast、語音助理與韌體更新。

我常用的 App 是：<填入自己的 App>
我希望首頁第一排是：<依順序填入 4 個 App>

完成盤點後，先用白話列出準備停用的每個項目與用途，
等我確認後再執行。安裝新首頁前必須先準備還原方式。
```

這段文字最重要的不是指定畫面風格，而是要求「先盤點、先備份、先詢問」。不懂套件名稱沒有關係，讓 AI 把每一項翻成白話，你只要判斷那是不是自己仍會使用的功能。

### Step 3：允許電腦連線

AI 開始連接電視後，電視畫面會跳出「是否允許 USB 偵錯」之類的訊息。確認畫面上的電腦是自己的，再按允許。

如果沒有跳出視窗，依序檢查：

1. 電視與電腦是否在同一個網路
2. 填入的 IP 是否正確
3. USB／網路偵錯是否仍然開啟
4. 電視是否保持開機

連線成功後，先讓 AI 備份已安裝套件、已停用套件、系統資訊和原本的首頁。看到備份完成，再進到下一步。

### Step 4：逐項確認要停用的內容

CleanYourTV 官方資料裡有許多不同品牌和型號的參考清單，但參考清單不是「全部照做」清單。

我的電視上共找到 18 個候選項目，最後只停用其中 9 個，主要是小米與 Google 的遙測、PatchWall、贊助內容和舊首頁推薦。我沒有停用韌體更新、語音助理、Chromecast、TV Manager、HDMI、電視輸入、遙控器、輸入法和串流 App。

<details>
  <summary>展開查看我在 PI.6031 停用的九個套件</summary>

```text
com.miui.tv.analytics
com.xiaomi.statistic
com.google.android.feedback
com.mitv.tvhome.atv
com.mitv.tvhome.michannel
com.xm.webcontent
com.xiaomi.floatingframe
com.google.android.tvrecommendations
android.autoinstalls.config.xiaomi.amelie
```

這份清單只記錄我的實作，不是給其他電視直接複製的指令。

</details>

### Step 5：安裝新首頁，再測試每一個入口

確認清單後，讓 AI 依官方流程編譯並安裝 Launcher。安裝過程若需要 ADB、JDK 17 或 Android SDK，請讓 AI 說明缺少什麼並使用官方來源準備，不要隨便下載來路不明的安裝檔。

新首頁第一次出現時，先不要急著關閉偵錯，也不要馬上拔掉電源。照下面的順序逐項測試：

1. 按 Home，能否回到 CleanYourTV
2. 開啟第一排的每一個 App
3. 打開 HDMI 或其他輸入來源
4. 進入 Wi-Fi 與系統設定
5. 測試遙控器方向鍵、確認鍵與返回鍵
6. 重新啟動電視，再把以上項目測一次

<figure>
  <img src="/images/how-i-customized-cleanyourtv/02-after-cleanyourtv.webp" alt="改造後的 CleanYourTV 繁體中文首頁，上方顯示時間、輸入來源、Wi-Fi 與設定，第一排是四個常用 App" width="1600" height="1200" loading="lazy" />
  <figcaption>改造後首頁第一眼只剩我每天真的會用的入口</figcaption>
</figure>

到這裡基本版 CleanYourTV 就完成了，原本的 Google 首頁在我的電視上只是停用，沒有被解除安裝。

## 我的客製化：四格首頁與寶可夢螢幕保護

### 四格快捷列是我每天真正會按的 App

我的第一排依序放 YouTube、Netflix、動畫瘋與極速投屏，其他已安裝的 App 仍然留在下方，不是從電視消失，只是不再搶占首頁最醒目的位置。

官方 Launcher 本來就能調整 Dock、App 排列、欄數和動畫。如果要和我一樣固定四個 App，可以直接在前面的提示文字寫出名稱與順序，讓 AI 查出這台電視上的正確套件名稱，再修改設定並編譯，不需要自己手動編輯程式碼。

我保留 Launcher 不上網，它只負責顯示 App、時間、輸入來源和系統設定，不需要天氣或其他網路資料。

### 螢幕保護是另一個獨立 App

寶可夢螢幕保護不是 CleanYourTV 官方功能，而是我另外製作的 APK，負責輪播 4K 圖片，每 10 分鐘換一張，並每 30 分鐘向 Open-Meteo 取得一次天氣資訊。

我把它拆成獨立 App，是因為天氣需要連網，但首頁本身不需要。這樣 Launcher 可以繼續保持沒有網路權限，螢幕保護則只取得 `INTERNET` 與 `ACCESS_NETWORK_STATE`，不需要定位、相機、麥克風、帳號或儲存空間權限。

如果你也想做自己的版本，可以把準備好的圖片交給 AI，要求它「另外建立 Android TV DreamService，不要修改 CleanYourTV Launcher」，再清楚指定換圖時間、天氣城市與允許的權限。APK 安裝後，到電視的「設定 → 裝置偏好設定 → 螢幕保護程式」選取它即可。

<figure>
  <img src="/images/how-i-customized-cleanyourtv/03-charizard-screensaver.webp" alt="改造後的 Android TV 螢幕保護畫面，以寶可夢桌布為背景，左下顯示天氣、時間與日期" width="1600" height="1200" loading="lazy" />
  <figcaption>完成後的螢幕保護畫面。時間和天氣留在角落，主角剛好是超帥的噴火龍。</figcaption>
</figure>

## 出問題時，怎麼回到原本的首頁

### 畫面不對時先別慌，也不要再繼續停用

如果新首頁沒有出現、Home 鍵跑到奇怪的畫面，或常用功能突然不見，先停止下一步。只要沒有刷機、Root 或解除安裝，通常都還能把停用的項目重新開啟。

把錯誤畫面拍下來，回到同一個 AI 對話，告訴它「停止所有新變更，依剛才保存的紀錄還原」。不要臨時改用網路上另一份清單補救，否則會愈來愈難知道究竟改了什麼。

### 用原本的清單執行 restore

官方專案提供 restore 工具，作用是重新啟用剛才停用的套件，並把原本的 Launcher 設回 Home。我的資料夾裡也另外保存了 `restore-conservative.ps1`，只會還原這次停用的九個套件與 Google 原首頁。

所以備份資料夾、實際套用的停用清單與還原腳本都不要刪掉。電視目前看起來正常，不代表以後更新韌體或改設定時永遠用不到它們。

## 最後一步：關掉 ADB

### 完成測試後，把維修入口關起來

CleanYourTV 平常運作不需要 ADB。全部確認正常後，我會做以下收尾：

1. 回到電視的「開發人員選項」
2. 關閉 USB／網路偵錯
3. 選擇「撤銷 USB 偵錯授權」
4. 重新啟動電視
5. 再測一次 Home、四個常用 App、HDMI 與螢幕保護

下次需要更新首頁或螢幕保護時，再暫時把偵錯打開就好。不要為了方便維護，讓這個入口一直留在家用網路上。

## 從「有點髒」變成每天想看的畫面

實際做完後，最明顯的改變也不是跑分變高，而是按下 Home 時，不必先穿過一整片推薦內容，
四個常用 App 就在第一排，輸入來源和設定仍然找得到，螢幕保護畫面是我自己挑的寶可夢圖片(挑圖片花了我兩小時...)。

CleanYourTV 真正好用的地方，是它沒有要求我把整台電視推倒重來。先備份、只停用、逐步測試、保留還原方式，即使完全不懂程式，也可以在 AI 協助下知道每一步正在改什麼。

對我來說，「Clean」不是把能刪的全部刪掉，而是只留下每天真的需要的東西，同時知道哪一天想回頭時，還有路可以走。
