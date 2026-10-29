---
title: 從 OpenClaw、Codex 到 Claude Code：我換過三個 AI Agent，最後留下兩個
description: 颱風假待在家，我用 AI Agent 做了這個部落格和一些自動化。這篇記錄我從 OpenClaw、Codex 換到 Claude Code 的原因，以及現在 Claude Code 當主力、Codex 當備援的分工方式。
pubDate: 2026-10-24T00:26:51+08:00
category: ai
tags: [ai-agent, claude-code, codex, openclaw, ollama]
cover: https://ryan-hsu.com/images/my-ai-agent-journey/cover.jpg
---

<figure>
  <img src="/images/my-ai-agent-journey/cover.jpg" alt="AI Agent 使用歷程：OpenClaw、Codex 到 Claude Code，現在 Claude Code 當主力、Codex 當備援" width="1200" height="630" />
</figure>

這次颱風假待在家，我用 AI Agent 做了不少事，這個部落格就是其中之一。

我用過的 AI Agent 依序是 OpenClaw、Codex，然後是 Claude Code。現在主要用後面兩個：大部分的工作在 Claude Code 上完成，碰到 5 小時的用量上限，就換到 Codex 繼續做。

這篇記錄每一次換工具的原因，還有現在兩個怎麼搭配。

## 第一站：OpenClaw，用了大約一個月

最早吸引我的，是 OpenClaw 可以直接用 ChatGPT Plus 帳號透過 OAuth 登入，不一定要申請 API 金鑰。其他工具多半要先付費儲值才拿得到 API 金鑰，OpenClaw 用已經有的訂閱就能開始，門檻低很多。

我是用 Docker 自己架的。光是讓它正常跑起來，就遇到權限、網路、資料存放位置、更新後設定會不會不見這些問題。AI 可以幫忙看錯誤訊息，但環境出問題時，最後還是要自己收拾。

那段時間我主要是在 Discord 上跟它互動，例如讓它幫我整理新聞晨報。

<figure>
  <img src="/images/my-ai-agent-journey/openclaw-discord-news.webp" alt="OpenClaw 在 Discord 上發出的台灣新聞晨報，列出重大頭條、重點摘要和決策性影響" width="1225" height="916" loading="lazy" />
  <figcaption>OpenClaw 在 Discord 上整理的新聞晨報。</figcaption>
</figure>

用了大約一個月之後，我決定不再繼續，原因有三個：

1. **資安的疑慮。** Agent 能操作我的電腦，又接著我的帳號，它到底能碰到哪些東西，我心裡一直不太踏實。
2. **沒有一台可以一直開著的機器。** 我本來打算買一台 Mac mini M4 專門跑它，但沒趕上漲價前的價格。
3. **電腦關掉就停擺。** 跑在我自己的電腦上，關機之後它什麼都做不了。

這一個月讓我學到的是：想要一個隨時待命的 Agent，就得一起負擔一台 24 小時開機的機器，還有後續的維護。對我來說，這筆成本不划算。

## 第二站：Codex

離開 OpenClaw 之後，我改用 OpenAI 的 Codex。選它的原因很單純：公司本來就在用 Codex，我自己也有 ChatGPT Plus，這樣工作和私人的專案都用同一套工具，不用在兩邊切換。CLI 和桌面版我都有在用。

和 OpenClaw 最大的差別是不用自己架環境，裝好、登入就能開始用。

Plus 方案也包含 ChatGPT 的深度研究。我在研究 Home Assistant 的時候就用過，它會整理成一份附來源的報告，從架構、安裝方式到安全性都有。

<figure>
  <img src="/images/my-ai-agent-journey/chatgpt-deep-research-home-assistant.webp" alt="ChatGPT 深度研究產生的 Home Assistant 研究報告，包含執行摘要與研究假設" width="1600" height="1108" loading="lazy" />
  <figcaption>用 ChatGPT 深度研究整理的 Home Assistant 報告。</figcaption>
</figure>

## 第三站：Claude Code

用了一段時間 Codex 之後，我才想換成 Claude Code。起因是去參加了 iThome 的 Hello World Dev Conference。在現場我發現，大概七成的觀眾都在用 Claude Code。這麼多人在用，我也想試試看。

我訂的是 Claude Pro 方案。用了之後，它很快就變成我的主力。這個網站的幾項工作都是用它完成的：

- **這個部落格本身。** 搭配 Spectra，先寫規格再實作，兩天內從空資料夾做到上線。過程寫在[用 Spectra 從零做出這個部落格](/build-blog-with-spectra)。
- **Threads 自動草稿。** 文章發布之後，GitHub Actions 會用 Claude Code 讀文章、產生 Threads 貼文草稿，並附上封面圖。
- **接上 Home Assistant。** 透過 MCP 讓 Claude Code 可以讀取和修改家裡的 Home Assistant 設定，[儀表板](/how-i-built-my-home-assistant-dashboard)和 [AppDaemon 自動化](/why-i-moved-home-assistant-automations-to-appdaemon)都是這樣做出來的。

除了這個網站，我的[寶可夢每日看板](/pokemon-daily-dashboard)也是用 Claude Code 桌面版在改。我提出需求，它先做示意圖給我確認，做完再開 PR，合併之後自動部署。中間遇到需要我決定的事，它也會停下來問我。

<figure>
  <img src="/images/my-ai-agent-journey/claude-code-pokemon-dashboard.webp" alt="Claude Code 桌面版的對話畫面，左邊是需求與進度回報，右邊是討論串裡的決定、截圖和 PR #10 的完成清單" width="2000" height="1304" loading="lazy" />
  <figcaption>在 Claude Code 桌面版改寶可夢看板：從示意圖、詢問決定到 PR 合併部署。</figcaption>
</figure>

## 現在怎麼分工

| | Claude Code | Codex | Ollama 雲端模型 |
| --- | --- | --- | --- |
| 角色 | 主力 | 備援 | 有裝，但幾乎沒用 |
| 方案 | Claude Pro | ChatGPT Plus | 免費額度 |
| 什麼時候用 | 平常的工作 | Claude Code 碰到 5 小時用量上限時 | － |

規則很簡單：工作都先交給 Claude Code。Pro 方案每 5 小時有用量上限，用完的時候，我就切到 Codex 把手上的事情做完，不用乾等額度恢復。

這樣其中一個額度用完時，工作不會整個停下來。

### 換手時怎麼接著做

兩個 Agent 不共用對話紀錄，Claude Code 裡聊過什麼，Codex 完全不知道。但它們讀得到同一個專案。

這時候 [Spectra](/build-blog-with-spectra) 就派上用場了。每個變更都有一份 `tasks.md` 工作清單，做完的項目已經打勾，每一項也寫好了怎麼驗證。切到 Codex 時，我請它先讀 `docs/spectra/changes/` 底下那個變更的文件，它就知道做到哪裡、下一步要做什麼。

要注意的是，Codex 預設讀的是專案裡的 `AGENTS.md`，不是 Claude Code 用的 `CLAUDE.md`。如果只有 `CLAUDE.md`，切換時就要記得提醒它去讀 Spectra 的文件。

### Ollama：有裝，但用不太到

除了這兩個，我也申請了 Ollama 的免費雲端模型額度，接到我的 Discord 上，另外還裝了 Open WebUI 當聊天介面。

<figure>
  <img src="/images/my-ai-agent-journey/open-webui-ollama.webp" alt="Open WebUI 使用 gpt-oss:120b 的對話，模型回覆無法直接讀取電腦裡的設定檔，請使用者自行貼上內容" width="1438" height="1005" loading="lazy" />
  <figcaption>Open WebUI 接上 Ollama 的 gpt-oss:120b，但它沒辦法直接讀我電腦裡的檔案，要我自己貼上。</figcaption>
</figure>

不過實際上我幾乎沒在用它。Claude Code 和 Codex 已經夠方便了，需要 AI 幫忙的時候，我自然會打開那兩個。這也讓我發現，一個工具會不會真的被用到，看的是它是不是最順手的那一個，不是功能夠不夠多。

## 我怎麼挑 AI Agent

換了三次工具，我現在挑 Agent 會看這幾件事：

- **維護成本。** 自己架設的 Agent 很有彈性，但機器、環境和更新都要自己顧。我寧可把時間花在要做的事情上。
- **安全性。** Agent 能碰到的範圍越大，越要清楚它能做什麼、會把資料送到哪裡。
- **有多少人在用。** 用的人多，遇到問題比較容易找到解法，外掛和整合也比較多。我會試 Claude Code，就是因為在研討會上看到這麼多人在用。
- **額度和價格。** 每個方案都有上限。準備一個備援，比被上限卡住更實際。

## 結語

我沒有找到一個能包辦所有事的 AI Agent。現在的做法是挑一個當主力，再留一個備援：Claude Code 負責大部分的工作，Codex 在額度用完時接手。

如果你也有在用 AI Agent，歡迎在下面留言分享你是怎麼搭配的。
