---
title: 螢幕壞了，工作還沒做完：把舊 MacBook 變成 Batocera 遊戲機
description: 把螢幕故障的 MacBook Pro A1502 改成 USB 開機的 Batocera 遊戲機，從 Windows 製作開機碟、配對手把、離線搬遊戲，到關閉多螢幕解決黑畫面，最後成功啟動《薩爾達傳說：黃昏公主 HD》。
pubDate: 2026-11-01T00:00:00+08:00
category: life-lab
tags: [macbook, batocera, retro-gaming, cemu]
cover: https://ryan-hsu.com/images/macbook-a1502-batocera/cover.png
---

<figure>
  <img src="/images/macbook-a1502-batocera/cover.png" alt="把舊 MacBook 復活變成 Batocera 遊戲機：溫暖桌面風格示意封面" width="1672" height="941" />
</figure>

<figure>
  <img src="/images/macbook-a1502-batocera/system.png" alt="MacBook 透過 HDMI 外接螢幕，成功運行 Batocera 遊戲選單" width="2880" height="2160" />
  <figcaption>成功運行的 Batocera 主畫面，原本準備退休的 MacBook，現在復活了。</figcaption>
</figure>

之前[把舊 iPhone 6s 變成音樂中控台](/iphone-6s-mini-music-control-panel)之後，我又看上了另一台老設備。
現在大家都在討論「發光 Apple Logo」回歸，我的MacBook Pro蘋果也會亮啊，只不過我是2014年的版本，接上電源，鍵盤會亮，開機有聲音，Caps Lock 指示燈也能切換，只有螢幕始終沒有畫面，看起來已經壞的差不多了。
既然還算能用，那就替它安排一份不需要自己帶螢幕的工作：復古遊戲機。

## 這次用 Batocera，先從 USB 開機

[Batocera](https://batocera.org/) 是整合多種模擬器與遊戲選單的系統。開機後可以用手把選主機、選遊戲，不需要每次先進桌面，再找模擬器和檔案。
把 Batocera 裝在 USB 隨身碟上，讓 MacBook 從 USB 開機，沒有把系統寫進 MacBook 的內建硬碟。
這樣比較適合先試用：設備能不能跑、手把能不能連、畫面能不能正常顯示，都先確認，再決定要不要做後續調整。

### 準備設備與測試環境

實際準備的東西是：
| 設備 | 用途 |
| --- | --- |
| MacBook Pro((一台舊設備)  | 執行 Batocera |
| Windows 電腦 | 下載系統、製作開機 USB、整理遊戲 |
| 128GB USB 隨身碟 | Batocera 開機與儲存空間 |
| HDMI 線與外接螢幕 | 顯示選單與遊戲 |
| 鍵盤、滑鼠 | 初次設定與搬檔案 |
| 藍牙手把 | 日常操作 |
| 外接硬碟 | 離線搬運遊戲 |

這篇記錄的是我在 **Batocera 43.1** 上的實作。不同年份的 MacBook、無線網卡與系統版本，結果不一定完全相同。

## 在 Windows 製作，拿到 MacBook 開機


### 下載映像檔，製作開機 USB
開機 USB 可以在 Windows 做好，再拿去 MacBook 使用。
先到 [Batocera 官方下載頁](https://batocera.org/download)，選擇適合目標電腦架構的映像檔，我這台是 Intel Mac，使用的是適用於這台處理器的 x86-64-v3 版本。
接著用 Raspberry Pi Imager 寫入：

1. 在作業系統選單選「使用自訂映像檔」。
2. 選下載好的 Batocera `.img.gz`。
3. 選擇準備當開機碟的 USB。
4. 核對型號與容量，確認後開始寫入。
5. 等待寫入與驗證完成，再安全退出。

**寫入映像檔會清除目標 USB 的資料。** 這一步值得多看兩眼，尤其電腦同時接了好幾顆硬碟時，不能只憑磁碟代號猜。
寫好之後，如果 Windows 又跳出「需要格式化磁碟」，按取消即可。Batocera 的資料分割區不一定能被 Windows 直接讀取，不代表製作失敗。[官方安裝說明](https://wiki.batocera.org/install_batocera)
### 在 MacBook 選擇 USB 開機

把 USB 插到 MacBook，接好 HDMI 與電源，開機時按住 **Option**，在開機選單選擇 USB 對應的 **EFI Boot**，使用外接 Windows 鍵盤時，通常對應的是 **Alt**。
第一次啟動會整理並擴充資料分割區，先讓它完成，不要看到等待畫面就急著拔 USB。

## 先讓自己看得懂，也讓手把能用

進入系統後，我先處理語言與手把。
### 切換繁體中文
繁體中文在：
```text
主選單 → SYSTEM SETTINGS → LANGUAGE → 繁體中文
```
### 配對藍牙手把與設定按鍵
藍牙手把則到：
```text
主選單 → CONTROLLER & BLUETOOTH SETTINGS → 配對藍牙裝置
```
讓手把進入配對模式，再從清單選擇它。配對成功後，先測方向鍵、確認、返回與 Start，如果按鍵不符合習慣，可以進入 **Controller Mapping** 重新設定。
Hotkey 也要記得自己設在哪裡，它會和其他按鍵組合，負責退出遊戲等操作，能順利進入遊戲很重要，能順利離開也很重要，尤其是還在除錯的時候。
我原本以為設定到這裡，大概就能開始玩了。
後來證明，我只是完成了「看起來可以開始玩」的階段。

## 最大的坑：遊戲有聲音，畫面卻不知道去哪裡

### 先分清楚遊戲畫面與介紹副畫面

一開始的症狀很混亂。
有時候 HDMI 螢幕會顯示遊戲圖片和介紹文字，按方向鍵似乎有變化，但又不像真的在玩，有時候啟動遊戲後只剩聲音，畫面黑掉，手把按了也看不出結果。
接著我們開始懷疑圖形後端、模擬器、遊戲格式，甚至打開紀錄檔找錯誤，
直到測試原本附的 2048，我才注意到螢幕上顯示的是一張遊戲示意圖，旁邊還有介紹文字，
我一直盯著的，很可能是遊戲的介紹副畫面。
這台 MacBook 的內建螢幕雖然不顯示，系統仍可能把它視為一個顯示器，外接 HDMI 有畫面，也不代表每個遊戲都會出現在我看得到的位置。

### 保留 HDMI，關閉多螢幕輸出

最後真正讓情況改變的，是這個設定：
```text
系統設定
├─ 主要影像輸出：HDMI
└─ 多螢幕／MULTISCREENS
   └─ 影像輸出：無／NONE
```
**關掉的是多螢幕區塊裡的輸出，主要 HDMI 輸出仍然保留。**Batocera 官方也有說明多螢幕輸出的關閉位置。[顯示問題排查](https://wiki.batocera.org/display_issues)

關閉後，2048 終於能正常玩，再啟動薩爾達，遊戲畫面也出現了。
折騰一輪之後，最大的進展是確認：電腦有在工作，只是之前沒有把工作成果給我看。
如果你的筆電也有故障的內建螢幕，而且外接顯示時出現類似症狀，值得先查這一項，再開始重裝模擬器。

## 用外接硬碟，把遊戲搬進 Batocera

### 準備搬運硬碟與來源資料夾

開機 USB 與搬遊戲的硬碟，是兩個不同角色，
前者負責啟動 Batocera，後者只是把 Windows 上準備好的檔案帶過去，不需要再寫入 Batocera 映像檔。
我的搬運硬碟使用 exFAT，如果你的硬碟原本就能被兩邊讀取，可以直接新增資料夾放檔案，**不需要因為要搬遊戲就重新格式化**。

這次在 Windows 整理好的主遊戲位置是：
```text
D:\Batocera_Ready\wiiu\TwilightPrincessHD
```

### 複製遊戲並更新列表

安全退出硬碟、接到 MacBook 後，在 Batocera 主畫面按 **F1** 開啟檔案管理員：
1. 找到外接硬碟。
2. 進入 `Batocera_Ready/wiiu`。
3. 選取整個 `TwilightPrincessHD` 資料夾，按 **Ctrl + C**。
4. 在網址列輸入 `/userdata/roms/wiiu/`。
5. 按 **Ctrl + V**，等待複製完成。
6. 回主選單，執行「遊戲設定 → 更新遊戲列表」。

## Wii U 遊戲需要先整理格式

Batocera 已經整合模擬器，不代表任何壓縮檔丟進去都能直接玩。
這次處理的 Wii U 資料是 WUP 格式，裡面有 `.app`、`.h3`、`title.tmd` 等檔案。使用原作者發布的 [CDecrypt](https://github.com/VitaSmith/cdecrypt)，另行轉出 Cemu 能載入的資料夾，並保留原始壓縮檔。

### 確認 Cemu 需要的資料夾結構

整理後的主遊戲結構大致是：
```text
TwilightPrincessHD/
├─ code/
│  └─ Zelda.rpx
├─ content/
└─ meta/
   └─ meta.xml
```
複製時要保留整個資料夾，不能只拿 `Zelda.rpx`。它是啟動檔，遊戲需要的內容仍在其他資料夾裡。Batocera 使用 Cemu 執行 Wii U 遊戲，對應目錄是 `/userdata/roms/wiiu/`。[Wii U 格式說明](https://wiki.batocera.org/systems:wiiu)
這篇著重在設備改造、檔案整理與排錯，不提供遊戲下載包。

## 薩爾達終於出現在我看得到的螢幕上

<figure>
  <img src="/images/macbook-a1502-batocera/zelda.png" alt="MacBook 透過 Batocera 與 Cemu 成功啟動薩爾達傳說黃昏公主 HD，外接螢幕顯示遊戲場景" width="2880" height="2160" loading="lazy" />
  <figcaption>《薩爾達傳說：黃昏公主 HD》成功進入遊戲場景，這次有聲音，也終於有畫面。</figcaption>
</figure>

### 最後的設定與實測範圍

最後測試成功時，主要輸出保持 HDMI、多螢幕關閉，Zelda 的圖形後端使用 OpenGL，裝飾也已關閉。
不過要分清楚：**這次已確認改善顯示問題的關鍵是關閉多螢幕**，不能因為最後幾個選項都改過，就把每一項都寫成必做設定。
目前確認的是系統能正常操作、2048 可以遊玩，以及《黃昏公主 HD》成功啟動並顯示遊戲場景。還沒有做完整的長時間測試，也沒有記錄各場景幀率，因此不能直接說這台老 MacBook 能順跑所有 Wii U 遊戲。
但對一台原本螢幕不亮、差點被判定退休的筆電來說，已經是一份很具體的新工作。

## 想照著做？可以把這段交給 AI

這次我也是一邊操作，一邊讓 AI 協助查資料、檢查檔案與整理錯誤訊息。最有用的是讓它跟著實際畫面判斷，而不是一直重複同一套快捷鍵。

```text
我想把一台舊 Intel MacBook 或 PC，改成從 USB 開機的 Batocera 遊戲機。

我的設備：
- 電腦型號與年份：<填寫>
- 內建螢幕是否正常：<填寫>
- 外接螢幕與連接方式：<填寫>
- 製作 USB 的電腦作業系統：<填寫>
- USB 型號與容量：<填寫>
- 手把型號：<填寫>

請先確認處理器架構與相容的 Batocera 版本，
使用官方映像檔，協助我完成開機 USB、外接顯示、
語言設定、手把配對及一款遊戲的實際測試。

寫入前核對目標磁碟的型號與容量，明確說明會清除資料，
不要修改電腦的內建硬碟。

如果內建螢幕故障，優先檢查主要輸出與多螢幕設定。
看到遊戲圖片和介紹，不要直接當成正在運行的遊戲畫面。

先測試系統附帶的小遊戲，再測試較複雜的模擬器。
遇到問題時一次只改一項，根據畫面與紀錄判斷，
不要把成功開啟選單當成遊戲已正常運作。

沒有網路時，協助我用外接硬碟離線搬檔案。
最後分別列出已驗證成功的功能與尚未解決的問題。
```

## 一台舊 MacBook 變成新遊戲機

於是這台從螢幕故障的筆電，轉職成需要外接螢幕的遊戲機，它已經能從 USB 開機、連上手把，讓薩爾達出現在桌上的螢幕裡。
這次最花時間的不是安裝系統，而是確認自己到底在看哪一個畫面。
舊設備重新就業，有時候只需要一支 USB。
