
---
title: 從 PHP2Shell、Zeabur 到 91APP：三起資安事件後，我檢查了自己的網站
description: PHP 核心漏洞、雲端憑證失守、電商資料庫遭攻擊，三起不同的資安事件讓我回頭檢查自己的部落格，並用 Spectra 補強 GitHub Actions 與 Firebase 部署流程。
pubDate: 2026-10-22T22:02:06+08:00
category: ai
tags: [security, spectra, github-actions, firebase]
cover: https://ryan-hsu.com/images/php2shell-zeabur-security-lessons/cover.png
---
<figure>
  <img src="/images/php2shell-zeabur-security-lessons/cover.png" alt="三起資安事件後，我檢查了自己的網站：PHP2Shell、Zeabur 與 91APP" width="1730" height="909" />
</figure>

其實資安事件一直發生，只是有鬧成多大的新聞和有多少人受害的差別。

## PHP 核心重大漏洞
PHP2Shell 不是 WordPress 或某一套網站程式寫錯，而是底下負責執行網站的 PHP 本身出了問題。攻擊者在特定條件下，不需要帳號密碼，就可能讀到伺服器記憶體裡的資料，甚至遠端執行程式。PHP 官方因此緊急釋出新版本，並提醒所有會處理網頁請求的 PHP 環境盡快更新。換句話說，就算網站程式平常維護得很好，只要底層 PHP 沒更新，門還是可能被打開。
## Zeabur：一把沒換的鑰匙，打開了整座平台
前幾天發生的Zeabur 事件則是另一種故事。這次不是一個新發現的程式漏洞，而是攻擊者拿到了長期沒有更換的內部憑證，接著一路進入共享叢集、部分 GCP 伺服器與平台資料庫。Zeabur 的初步報告確認，大量使用者的環境變數、帳號資料與伺服器都受到影響；有些伺服器甚至被 root 登入並加入陌生的 SSH key。原本分散在設定、環境變數和內部服務裡的秘密，因為權限太大、存放位置彼此牽連，最後像骨牌一樣一個接一個倒下。

## 91APP：電商資料庫也遭到自動化攻擊

同一週，台灣電商技術服務商 91APP 也公告資安事件。官方表示，Commerce Cloud 資料庫遭到自動化攻擊，部分資訊被未經授權擷取；目前攻擊已經控制、案件也已報警，並委託第三方資安單位協助調查。數位產業署隨後進行行政檢查，要求 91APP 盤點遭擷取的資料、受影響品牌與消費者。截至目前，實際涉及哪些個人資料、影響多少人與多少筆資料，仍待進一步確認。

這起事件讓我特別有感，因為使用者把資料交給品牌，品牌又把電商系統交給平台服務商。對消費者來說，信任看起來只交給了一家商店，背後其實連著一整串服務。供應鏈裡只要有一個環節失守，影響就可能沿著平台擴散到不同品牌與會員。

今天原本只是想了解這三則資安事件，沒想到看著看著，我開始想到自己的網站。它雖然只是靜態部落格，但部署流程裡同樣有 GitHub token、Firebase service account，以及會在雲端執行的外部套件。於是我決定不只是看新聞，而是趁這個機會回頭檢查自己的專案。

## 我的網站不是 PHP，還需要擔心嗎？

這個網站是用 Astro 產生的靜態網站，部署在 Firebase Hosting，沒有 PHP，也沒有自己的資料庫。因此 PHP2Shell 並不會直接打到我的網站。

但這不代表完全沒有風險。

網站每次 push 到 GitHub 之後，GitHub Actions 會自動下載程式碼、安裝 npm 套件、執行測試、建置網站，最後再交給 Firebase 的部署工具上線。這條自動化流程會接觸部署憑證，也會執行外部提供的 Action。只要其中一個環節被換掉，或拿到超過需要的權限，靜態網站一樣可能出問題。

這也是今天三起事件給我的提醒：資安不只是在找「我的程式有沒有漏洞」，還要看整條供應鏈和部署流程相信了誰。

## 第一個修補：把 GitHub Actions 固定在確定的版本

原本的部署檔使用這種寫法：

```yaml
uses: actions/checkout@v4
```

`v4` 很方便，會自動使用第四版的最新內容，但它其實是一個可以移動的標籤。假如上游標籤日後指向不同的程式碼，我的建置流程也會在沒有修改專案的情況下跟著改變。

所以今天我把部署流程使用的三個官方 Action 都固定到完整的 commit SHA：

- GitHub 官方的 `actions/checkout`，負責把網站程式碼下載到建置環境；
- GitHub 官方的 `actions/setup-node`，負責安裝指定版本的 Node.js；
- Firebase 官方的 `FirebaseExtended/action-hosting-deploy`，負責把建置結果部署到 Firebase Hosting。

版本功能沒有改變，但執行內容被鎖定了。以後要升級時，我會看過新版內容再主動更新，而不是讓部署流程在不知情的情況下漂移。

這個做法不能保證第三方程式永遠安全，但至少讓每一次部署都更容易重現與追查。

## 第二個修補：部署只拿需要的權限

正式網站的部署工作只需要讀取 repository，並不需要修改原始碼。因此我在 GitHub Actions 裡明確加入：

```yaml
permissions:
  contents: read
```

這是一個很小的設定，但背後的概念很重要：能只給讀取權限，就不要給寫入權限。

如果建置時執行的某個 npm 套件或 Action 出現問題，它能使用的 GitHub token 權限也會受到限制。這和 Zeabur 事件裡看到的情況正好相反——一把長效、權限又大的憑證，往往會把原本局部的問題放大成整條攻擊鏈。

## 第三個修補：替 Firebase 加上安全標頭

接著我替 Firebase Hosting 加了四個 HTTP security headers：

- `X-Content-Type-Options: nosniff`：不要讓瀏覽器自己猜測檔案類型；
- `Referrer-Policy: strict-origin-when-cross-origin`：減少跨網站時送出的來源資訊；
- `X-Frame-Options: SAMEORIGIN`：不允許其他網站任意把頁面放進 iframe；
- `Content-Security-Policy: frame-ancestors 'self'`：再用較新的規則限制頁面只能被自己的網站嵌入。

這些標頭不會讓網站變成「絕對安全」，但可以補上一些瀏覽器端的基本防護，尤其是降低內容類型誤判與 clickjacking 的風險。

我也替這些設定補了自動測試。未來如果有人修改 `firebase.json`，不小心把安全標頭拿掉，測試會直接失敗，而不是等網站上線後才發現。

## Spectra 加上 Claude 官方資安套件

這個網站原本就是用 Spectra 的規格驅動流程完成的。今天做安全檢查時，我也把 Spectra 的 audit 功能打開：

```yaml
audit: true
```

對我來說，這次最有用的不是讓工具替我說「網站安全」，而是讓它提醒我重新檢查規格以外的風險：部署 Action 有沒有固定、token 權限是不是太大、Hosting 有沒有基本安全標頭，以及修改之後有沒有測試保護。

Spectra 幫我留下的不只是幾行設定，而是一個可以重複的流程：先找出風險，再把修補寫進設定，最後用測試確認它不會在未來悄悄消失。

除了 Spectra，我今天也安裝了 Anthropic 官方的 `security-guidance` 外掛。它會在 Claude Code 修改程式時提醒常見的危險寫法，在一輪工作結束時檢查程式碼差異，並在 commit 時進一步查看相關檔案、追蹤資料怎麼流動。它檢查的範圍包含 injection、XSS、SSRF、寫死在程式裡的 secrets、權限繞過與路徑穿越等常見問題。

這兩套工具扮演的角色不太一樣。Spectra audit 比較像是從設計與變更範圍回頭檢查：預設值是否安全、權限邊界是否清楚、失敗時會不會默默被忽略；Claude 官方的 `security-guidance` 則更貼近實際修改過的程式碼與 commit。兩邊一起使用，就像一個看規格與流程，另一個盯著真正送進版本庫的差異。

當然，裝了資安套件不代表網站從此不會有漏洞。官方也提醒，這類檢查仍可能漏掉問題或產生誤判，不能取代人工 code review、弱點掃描與滲透測試。但對我這種自己維護的小型網站來說，它至少多了一道會主動提醒我的關卡。

## 今天最後留下的一個 commit

完成後，我把這次修改整理成 commit：

```text
fix: harden deploy workflow and add security headers
```

裡面包含四件事：

1. 把 GitHub 與 Firebase 官方 Actions 固定到 commit SHA；
2. 將正式部署的 GitHub token 限制為只讀；
3. 替 Firebase Hosting 加入安全標頭；
4. 開啟 Spectra audit，並用測試守住這些設定。

在 commit 前後，Claude 官方的 `security-guidance` 也會針對變更內容進行安全檢查。它不是寫進 repository 的網站套件，而是安裝在 Claude Code 裡、陪著開發流程一起運作的審查工具。

這些修改都不算華麗，訪客打開網站時甚至看不出差別。但我覺得資安很多時候就是這樣：不是等出事後才做一個很大的動作，而是看到別人的事件後，願意回頭問自己一句：「同樣的問題，有沒有可能也發生在我這裡？」

今天的答案是，PHP2Shell 不直接影響我的 Astro 網站，Zeabur 的事件也不是我的網站遭入侵。但它們確實讓我找到幾個可以先補起來的地方。

網站還是那個網站，只是部署它的每一步，現在比昨天更清楚，也更收斂了一點。

## 參考資料

- [PHP 官方 2026 年安全公告](https://www.php.net/archive/2026.php)
- [Zeabur 2026 年 10 月資安事件初步報告](https://dash-new.zeabur.com/blogs/october-2026-security-incident)
- [91APP Commerce Cloud 資安事件說明](https://91app.com/blog/91app-202610-security/)
- [數位產業署：91APP 資料庫遭未授權存取](https://moda.gov.tw/ADI/news/latest-news/21118)
- [GitHub Actions：Security hardening for GitHub Actions](https://docs.github.com/en/actions/security-for-github-actions/security-guides/security-hardening-for-github-actions)
- [Firebase Hosting：設定 HTTP headers](https://firebase.google.com/docs/hosting/full-config#headers)
