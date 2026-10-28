---
title: 讓 Claude Code 在桌面養一隻寵物：Clawd on Desk 安裝與使用心得
description: Clawd on Desk 是一個會跟著 AI 寫程式工具換動作的桌面寵物，還能看到每個對話的進度、直接在桌面上允許或拒絕權限請求。這篇整理我在 Windows 上的安裝過程和常用功能。
pubDate: 2026-10-23T21:50:00+08:00
category: ai
tags: [claude-code, desktop-pet, windows, tools]
cover: https://ryan-hsu.com/images/clawd-on-desk/cover.png
---

<figure>
  <img src="/images/clawd-on-desk/cover.png" alt="Clawd on Desk：讓 Claude Code 在桌面養一隻寵物" width="1200" height="630" />
</figure>

我同時開好幾個 Claude Code 對話的時候，常常不知道哪一個做完了、哪一個卡在等我按允許。Claude 的桌面 App 縮小之後就什麼都看不到，切來切去很浪費時間。

後來找到 [Clawd on Desk](https://github.com/rullerzhou-afk/clawd-on-desk)，一個會浮在桌面上的小寵物。它會跟著 Claude Code 的狀態換動作：在想事情就冒思考泡泡，在跑工具就打字，做完了會開心跳起來。旁邊還有一個小面板，列出每個對話目前的狀態。

先說明一下：Clawd on Desk 是社群作者做的非官方專案，不是 Anthropic 出的。程式碼是 AGPL-3.0 開源，但 Clawd 這個角色屬於 Anthropic，美術素材不在開源授權範圍內。這篇文章裡出現的 Clawd 圖，都是從 Clawd on Desk 內建的素材直接拿來說明用的。

## Clawd 會做什麼

Clawd 一共有 12 種動畫狀態，全部由 Claude Code 的 hooks 自動驅動，不用自己設定。

<figure>
  <img src="/images/clawd-on-desk/states.png" alt="Clawd 的幾種狀態：待機、思考、打字、蓋東西、兩個以上 subagent 時拋球、出錯、做完開心、通知、睡覺" width="1200" height="660" />
  <figcaption>Clawd on Desk 內建的幾種狀態。動畫截取自 App 內建的 SVG 素材。</figcaption>
</figure>

- **待機**：眼睛會跟著滑鼠游標轉
- **思考、打字、蓋東西**：Claude 在讀程式碼、跑工具的時候
- **戴耳機、拋球**：開了一個 subagent 會戴耳機聽音樂，兩個以上就開始拋三顆球
- **出錯、做完、通知**：工具失敗、工作完成、需要你注意的時候
- **睡覺**：閒置 60 秒後打哈欠、打瞌睡，最後倒下睡著；滑鼠一動就會被嚇醒

同時開好幾個對話時，Clawd 會顯示所有對話裡優先度最高的那個狀態。所以只要它還在打字，就代表還有對話在跑。

## 它是怎麼知道 Claude 在做什麼的

<figure>
  <img src="/images/clawd-on-desk/how-it-works.png" alt="運作方式：Claude Code 的 hooks 呼叫 clawd-hook.js 通知 Clawd，權限請求透過 HTTP 送到本機 127.0.0.1:23333，再顯示成桌面上的泡泡" width="1200" height="520" />
  <figcaption>Clawd 靠 Claude Code 的 hooks 收到狀態（我自己畫的示意圖）。</figcaption>
</figure>

Clawd 第一次啟動時，會自動在 Claude Code 的設定檔 `~/.claude/settings.json` 加上一批 hooks。我這台加了 12 個：

- **11 個指令型 hook**：在開始對話、送出訊息、呼叫工具、工作結束這些時間點，執行 Clawd 的 `clawd-hook.js`，把目前狀態告訴 Clawd
- **1 個 `PermissionRequest` hook**：Claude 要請你允許某個操作時，把請求用 HTTP 送到本機的 `127.0.0.1:23333`，Clawd 再把它顯示成桌面上的泡泡

如果你有用 Codex，它也會一起改 `~/.codex/hooks.json`。之後 Clawd 每次啟動都會檢查並「保持 hooks 同步」。

知道這件事很重要，因為它代表 Clawd 改了你的 Claude Code 設定。我建議安裝前先把 `settings.json` 備份一份。

## 安裝

1. 到 [Releases 頁面](https://github.com/rullerzhou-afk/clawd-on-desk/releases/latest)，在 **Assets** 下載 `Clawd-on-Desk-Setup-<版本>-x64.exe`（Snapdragon 這類 ARM 電腦選 `-arm64.exe`）
2. 執行安裝檔。如果 Windows 跳出「Windows 已保護您的電腦」，點 **其他資訊 → 仍要執行**。這是因為它沒有付費的程式碼簽章，社群軟體很常見
3. 打開 Clawd，桌面上會出現一隻橘色的像素螃蟹，Claude Code 和 Codex 會自動連上

其他工具（Copilot、Gemini、Cursor 等等）可以到 **Settings… → AI Coding Tools** 打開。

## 常用功能

### 拖曳和迷你模式

Clawd 在任何狀態下都可以用滑鼠抓著拖走，也可以拖到另一個螢幕，重開之後會記得位置。
把它拖到螢幕右邊邊緣，或按右鍵選 **Mini Mode**，它就會縮在螢幕邊緣，只露出一點點，滑鼠移過去會探頭出來。不想佔畫面又想知道狀態的時候很好用。

### 看每個對話的進度

Clawd 旁邊有一個小 HUD，列出目前進行中的對話。要看完整清單，在 Clawd 身上按右鍵，選 **Open Dashboard**，裡面有每個對話的狀態、最近的事件，也可以幫對話取別名。

<figure>
  <img src="/images/clawd-on-desk/dashboard.png" alt="Clawd on Desk 的工作階段視窗，列出進行中的 Codex 與 Claude Code 對話，以及跳至終端機按鈕" width="570" height="622" />
  <figcaption>右鍵 → Open Dashboard。介面設成中文時，這個視窗叫「工作階段」，Codex 和 Claude Code 的對話會列在一起。</figcaption>
</figure>

Dashboard 有「跳到這個對話」的功能，但它跳的是**終端機視窗**。我主要用 Claude 的桌面 App，這個功能就幫不上忙，只能當成狀態清單看。

### 在桌面上允許或拒絕權限

Claude 要執行需要你同意的操作時，Clawd 會從右下角跳出一張泡泡卡片，可以直接按 **Allow** 或 **Deny**，不用切回對話。泡泡出現的時候也可以用快捷鍵：

| 快捷鍵 | 作用 |
| --- | --- |
| `Ctrl` + `Shift` + `Y` | 允許最新的那個請求 |
| `Ctrl` + `Shift` + `N` | 拒絕最新的那個請求 |
| `Ctrl` + `Shift` + `Alt` + `C` | 顯示或隱藏 Clawd |

最後一個是我在 Clawd 的設定檔裡找到的，Clawd 不見的時候按這組就能叫回來。
如果你已經在對話裡回答了，泡泡會自己消失。在 **Settings… → AI Coding Tools** 可以改成「每次都問」、「只有問題才問」或「自動允許」，也可以針對單一工具關掉泡泡。

### 勿擾模式

開會或專心做事的時候，右鍵或系統匣選 **DND**，Clawd 會睡覺，不跳泡泡也不出聲音。這時候 Claude Code 會改回用它自己的權限確認流程。

### 開機自動啟動

在系統匣的 Clawd 圖示按右鍵，可以打開開機自動啟動。不開也沒關係，Clawd 加的 `SessionStart` hook 會在你開新的 Claude Code 對話時，順便把沒在跑的 Clawd 叫起來。

### 換角色

**Settings… → Theme** 裡除了預設的 Clawd，還有 Calico、Cloudling 兩隻內建角色，以及可以另外下載的官方主題。也可以從這裡匯入 Codex 的寵物 zip，或照官方的教學自己做一套主題。

## 用了幾天的感想

**好用的地方：**

- 同時開好幾個對話時，看 Clawd 的動作就知道還有沒有在跑，不用一直切視窗
- 權限泡泡加上快捷鍵，按一下就能讓 Claude 繼續做，不用回到 App 裡找
- 安裝之後幾乎不用設定，Claude Code 會自動連上

**要注意的地方：**

- 它會改你的 Claude Code 設定，安裝前先備份 `settings.json`
- 「跳到對話」只支援終端機，用桌面 App 的人用不到
- 權限請求會經過本機的 `127.0.0.1:23333`，雖然只在自己電腦上，還是知道一下比較好

如果你跟我一樣常同時開好幾個 Claude Code 對話，Clawd on Desk 很值得裝來試試看。
