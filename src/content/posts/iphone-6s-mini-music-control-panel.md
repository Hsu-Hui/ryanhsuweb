---
title: 用一支舊 iPhone，做出迷你音樂中控台
description: 大家都在開箱 iPhone Duo，我用 spacedesk 將舊 iPhone 6s 變成 Windows 副螢幕，再結合 Macro Deck、YTM‑Immersion 與 Open-as-Popup，做出可觸控操作的迷你 YouTube Music 中控台。
pubDate: 2026-10-27T00:36:34+08:00
category: life-lab
tags: [iphone, spacedesk, macro-deck, youtube-music, chrome-extension]
cover: https://ryan-hsu.com/images/iphone-6s-mini-music-control-panel/cover.jpg
---

<figure>
  <img src="/images/iphone-6s-mini-music-control-panel/cover.jpg" alt="用一支舊 iPhone，做出迷你音樂中控台" width="1200" height="675" />
</figure>

## 讓 iPhone 6s 重新就業

看到新的 iPhone Duo 上市後，大家都在寫開箱文，但我沒買怎麼辦，想起還有台 iPhone 6s 沒有壞，只是現在的工作內容大概剩下充電、被遺忘，還有偶爾提醒我以前的手機真的比較小。

剛好我平常會用 YouTube Music，也在電腦上裝了 YTM‑Immersion，就是喜歡一邊聽音樂一邊看歌詞。問題是主螢幕有自己的工作，音樂畫面一直占著一個角落，多少有點占位置。

所以我決定替這支 iPhone 6s 安排一份新工作：專門顯示音樂、提供快捷控制，成為桌面上的迷你音樂中控台。

## 四個工具，各自負責一件事

整套組合用了四個工具：spacedesk、YTM‑Immersion、Macro Deck 與 Open-as-Popup。

### spacedesk：先多生出一塊螢幕

spacedesk 負責把 iPhone 變成 Windows 的第二螢幕。

電腦安裝 Driver，手機安裝 Viewer，連線後 Windows 就會多出一個可以延伸桌面的顯示器。接著可以把瀏覽器視窗從主螢幕移到手機上，看起來就像電腦突然長出一塊很小、而且可以觸控的副螢幕。

「長出來」只花幾分鐘，「讓它正常顯示」則比較尊重傳統，需要一些耐心。

### YTM‑Immersion：讓音樂值得被擺在桌上

YTM‑Immersion 是我在桌面版 Chrome 使用的 YouTube Music 擴充套件，它把原本偏向網站的播放介面，整理成更適合長時間展示的沉浸式畫面。

這也是為什麼我沒有直接在 iPhone 的 Chrome 開 YouTube Music：iOS 版 Chrome 不會執行桌面版 Chrome 擴充套件。透過 spacedesk，手機顯示的是電腦上的 Chrome，因此 YTM‑Immersion 仍然在 Windows 上正常工作，只是畫面搬到了手機。

技術上是第二螢幕，視覺上則比較像替音樂租了一間套房。

### Macro Deck：順便把控制按鈕也放進去

既然手機已經放在桌上，而且螢幕還能觸控，只拿來看專輯封面似乎有點浪費。

於是我又把 Macro Deck 的 Web Client 放進同一個顯示空間，用來安排播放、音量或其他常用快捷操作，例如快速打開 Steam、Chrome、Discord。原本只是副螢幕，現在開始有了一點控制室的自覺。

### Open-as-Popup：把網址列請出去

畫面都塞進 iPhone 6s 之後，Chrome 的分頁列、網址列和工具列突然顯得非常有存在感。小螢幕每一公分都很珍貴，沒有空間留給一串網址證明自己來過。

所以我又加上 **Open-as-Popup**，把目前頁面改用獨立彈出視窗開啟，順便隱藏網址列與多餘的瀏覽器介面。它只影響這個彈出視窗，其他螢幕上正常使用的 Chrome 不會一起進入極簡模式。

## 比想像中多一點的設定

概念很簡單：手機當副螢幕，把兩個網頁移過去，完成。

實際操作則證明，「完成」通常是技術文章裡最有想像力的兩個字。

### 解析度先決定手機願不願意工作

iPhone 6s 的螢幕不大，spacedesk 一開始也不一定會自動選到最合適的顯示設定。解析度不合時，可能出現黑畫面、比例不對。

我先用較低的解析度確認畫面能正常顯示，再慢慢調整比例與版面。至少在除錯時，一個不夠漂亮但看得到的畫面，遠比一個規格很高但完全黑掉的畫面實用。

### 手機版 Chrome 並不是桌面版 Chrome

另一個關鍵是，iPhone 上的 Chrome 與 Windows 上的 Chrome 看起來同名，但擴充套件能力不同。YTM‑Immersion 必須留在桌面版瀏覽器執行，再透過 spacedesk 將畫面送到手機。

最後我把 YouTube Music 與 Macro Deck 整理在同一個顯示畫面，再透過 Open-as-Popup 隱藏不需要的瀏覽器介面。iPhone 6s 的每一寸螢幕都很珍貴，沒有多餘空間可以給網址列。

## 想照著做？把這段交給 AI

如果你也有一支準備退休的舊手機或舊平板，可以把下面這段 Prompt 交給 Codex、Claude Code，或其他能協助操作電腦的 AI 助手。

```text
我想把一支舊手機或舊平板變成 Windows 電腦的迷你音樂中控台。

裝置可能使用 Android 或 iOS，請先詢問我的作業系統版本與設備型號，再選擇相容的安裝方式，不要預設一定是 iPhone。

預計使用：

- spacedesk：把舊手機或舊平板變成 Windows 延伸螢幕
- YTM‑Immersion：顯示 YouTube Music 的沉浸式介面與歌詞
- Macro Deck：提供播放、音量與程式快捷按鈕
- Open-as-Popup：以獨立 Chrome 視窗開啟網頁並隱藏網址列

我的設備：

- Windows 版本：<請填寫>
- 手機或平板型號：<請填寫>
- 行動裝置系統與版本：<Android／iOS，請填寫版本>
- 電腦與行動裝置是否連到同一個 Wi-Fi：<是／否>
- 是否已安裝 Macro Deck：<是／否>
- Macro Deck 版本：<2／3／不知道>
- 是否已安裝桌面版 Chrome：<是／否>

請持續協助我，直到音樂中控台可以正常使用，不要只列出安裝說明就結束。

如果你具備操作電腦的能力，請在取得我的同意後，實際協助完成 Windows 端的下載、安裝、設定與驗證。遇到手機操作、商店安裝、UAC、授權或防火牆確認時，請清楚告訴我要在畫面上按什麼，等我完成後再繼續。

請依照以下順序進行：

1. 先檢查設備相容性與目前已安裝的軟體。
2. 所有軟體只使用官方網站、Google Play 或 App Store，不使用第三方下載站。
3. 在 Windows 安裝 spacedesk Driver。
4. Android 裝置從 Google Play 安裝 spacedesk Viewer；iOS 裝置從 App Store 安裝 spacedesk Viewer。
5. 讓電腦與行動裝置連到同一個區域網路，完成 spacedesk 連線。
6. 將 Windows 顯示模式設為「延伸這些顯示器」，確認舊手機或舊平板是第二螢幕。
7. 如果出現黑畫面、比例錯誤或視窗消失，先用 1024 × 768 等較低解析度測試，再逐步調整。
8. 在 Windows 桌面版 Chrome 安裝並設定 YTM‑Immersion。不要嘗試在 Android 或 iOS 的 Chrome 安裝桌面版 Chrome 擴充套件。
9. 檢查電腦使用的是 Macro Deck 2 還是 Macro Deck 3。不要擅自升級或混用不同版本的手機客戶端。
10. 如果使用 Macro Deck Web Client，請從 Macro Deck 的網路設定取得正確 IP 位址與連接埠，再用行動裝置的瀏覽器開啟。
11. 如果使用 Macro Deck 行動 App，請依目前版本選擇正確的 Android 或 iOS App。
12. 在 Macro Deck 建立播放／暫停、上一首、下一首、音量增加、音量降低與靜音按鈕。需要外掛時，只使用官方或 Macro Deck 內建商店的來源，安裝前先取得我的同意。
13. 把 YouTube Music／YTM‑Immersion 與 Macro Deck 畫面排列到第二螢幕。
14. 安裝 Open-as-Popup，將需要的頁面開成沒有網址列的獨立 Chrome 視窗，不要影響主螢幕上的其他 Chrome 視窗。
15. 最後逐項測試顯示、觸控、音樂播放、音量控制與快捷按鈕，確認全部可以使用後才算完成。

排查順序：

- 確認電腦與行動裝置在同一個網路
- 確認 spacedesk 與 Macro Deck 正在執行
- 確認 Windows 使用延伸顯示而不是只顯示在其中一個螢幕
- 確認 IP 位址與連接埠來自目前這台電腦
- 確認防火牆只允許必要的區域網路連線
- 確認 VPN、訪客 Wi-Fi 或 AP Isolation 沒有隔離裝置
- 找不到被移走的視窗時，協助我用 Windows 快捷鍵把視窗移回主螢幕

安全要求：

- 不要關閉整台電腦的防火牆。
- 不要猜測 IP 位址、連接埠或設定名稱。
- 不要擅自升級 Macro Deck 或移除現有設定。
- 修改解析度、顯示模式或網路設定前，先說明復原方式。
- 每次只執行一個階段，驗證成功後再繼續。
```

這份 Prompt 的重點，是讓 AI 一步一步帶著做，不會一口氣送出二十個步驟，然後在第三步時就把視窗弄丟。

## 完成後，它真的有用嗎

<figure>
  <img src="/images/iphone-6s-mini-music-control-panel/iphone6s-mini-music-console-clean.webp" alt="清潔後的 iPhone 6s 同時顯示 YTM‑Immersion 與 Macro Deck" width="1448" height="1086" loading="lazy" />
  <figcaption>左邊是 YTM‑Immersion，右邊是 Macro Deck。原本吃灰的手機，現在開始負責桌面值班。</figcaption>
</figure>

實際用起來，比我原本預期的更合理。
YouTube Music 有了固定的位置，不再占用主螢幕；YTM‑Immersion 負責讓畫面好看；Macro Deck 提供可以直接點擊的控制按鈕。iPhone 6s 的螢幕雖然小，但拿來顯示正在播放的內容與幾個大按鈕，反而剛剛好。

它不適合拿來閱讀長文件，也不適合處理試算表，但非常適合負責那些「需要一直看得到，卻不值得占用主螢幕」的資訊。

最重要的是，我沒有為此多買一塊螢幕。只是花了一個晚上證明，避免消費有時候也是一種很花時間的興趣。

## 一支舊手機的新職稱

於是，隆重推出 iPhone 6s Pro Control Edition。
搭載 spacedesk、Macro Deck、YTM‑Immersion 與 Open-as-Popup，支援 Windows 副螢幕、沉浸式音樂畫面、無網址列顯示與觸控快捷操作。採用經典 4.7 吋面板、實體 Home 鍵，以及一顆對長時間亮屏略有意見的多年熟成電池。

免費的最貴，研發成本是花一個晚上，以及數次「我的視窗到底去哪了？」
