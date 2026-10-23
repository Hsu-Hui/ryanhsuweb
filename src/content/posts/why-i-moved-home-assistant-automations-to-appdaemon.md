---
title: 智能家居系列（二）：我為什麼把 Home Assistant 自動化從 YAML 搬到 AppDaemon
description: YAML 並沒有不好，但當離家模式開始需要啟動補判斷、狀態驗證、失敗重試與取消排程，我需要的已經不只是一條自動化，而是一個能清楚管理狀態的小程式。
pubDate: 2026-10-23T16:28:05+08:00
tags: [home-assistant, appdaemon, python, yaml, smart-home]
cover: https://ryan-hsu.com/images/why-i-moved-home-assistant-automations-to-appdaemon/cover.png
---

<figure>
  <img src="/images/why-i-moved-home-assistant-automations-to-appdaemon/cover.png" alt="智能家居系列（二）：我為什麼把 Home Assistant 自動化從 YAML 搬到 AppDaemon" width="1730" height="909" />
</figure>

上一篇寫到，我用 Home Assistant 把原本分散在 Aqara、Apple Home 與各家 App 裡的設備接了起來。臥室濕度過高時自動除濕，按下料理模式後，小米電視也會自己開機並播放音樂。

最初看到設備照著設定動起來時，我覺得自動化已經完成了。

但真正把它放進每天的生活後，我開始在意另一件事：**如果它沒有照預期完成，我能不能知道停在哪一步？**

我不只想送出「關閉」指令，還想確認設備真的關了；不只想在狀態改變時執行，也希望系統重啟後能補做一次判斷；如果第一次控制失敗，我想讓它隔幾秒再試，但又不能無限重試。

當這些問題陸續出現，我才發現自己需要的已經不只是一條自動化，而是一個會記得目前進度、會檢查結果，也知道什麼時候該停止的小程式。

這就是我開始把較複雜的 Home Assistant 自動化從 YAML 搬到 AppDaemon 的原因。

## 一開始，YAML 其實很好用

Home Assistant 的 YAML automation 很適合描述一條清楚的因果關係：什麼事情發生、符合哪些條件，接著執行哪些動作。

像臥室除濕這種流程就很直觀：濕度高於 70% 持續 5 分鐘就開機，低於 60% 持續 10 分鐘就關機。觸發、條件和動作都能排成一條線，在 Home Assistant 介面裡也很容易查看。

所以我並不是因為 YAML 不好，才決定全部改寫成 Python。

問題是，自動化開始貼近真實生活後，那條原本很短的線會慢慢長出分支：先等待設備啟動、再查一次狀態、失敗時重試、成功或逾時後通知、系統重啟時重新判斷，使用者又按了一次按鈕時還要取消前一次尚未完成的排程。

<figure>
  <img src="/images/why-i-moved-home-assistant-automations-to-appdaemon/yaml-complexity-story.png" alt="Home Assistant 自動化從單一步驟逐漸增加等待、驗證與通知分支" width="1776" height="888" loading="lazy" />
  <figcaption>需求每增加一點，原本線性的自動化就多一層狀態、等待與例外處理。</figcaption>
</figure>

YAML 仍然寫得出來，但我愈來愈難一眼看懂整段流程現在走到哪裡。每次修改也不再只是加一個動作，而是要小心新的延遲、分支和舊的排程會不會互相影響。

## 讓我決定搬家的，是離家模式

真正讓我重新思考寫法的，是離家模式。

我的需求表面上很簡單：當家裡進入 `armed_away` 狀態，就關閉不該繼續運作的設備。目前清單裡先放了電視盒的電源，以後還能繼續加入其他燈、開關或風扇。

但把這句話拆開後，其實藏著好幾個問題：

- 我要監聽的是「家裡現在是否進入離家狀態」，不是那條自動化本身有沒有啟用；
- 如果 AppDaemon 重新載入時，家裡早就已經離家，不能只等下一次狀態變化；
- 送出關閉指令後，要隔幾秒確認設備是否真的變成 `off`；
- 如果設備沒有關閉，可以重試，但重試次數必須有上限；
- 驗證期間如果離家模式已解除，後面的動作應該立刻停止。

第一點尤其容易混淆。`automation.li_jia_mo_shi` 的 `on` 或 `off`，只代表這條自動化有沒有被啟用，不能代表人是否真的離家。因此我的程式實際監聽的是保全系統的 entity：

```yaml
mode_entity: alarm_control_panel.ke_ting_m3_security_system
away_states:
  - armed_away
```

這個差異也改變了我理解 Home Assistant 的方式。我要判斷的不是「哪一條自動化被打開」，而是家裡現在處於什麼狀態。

## AppDaemon 讓流程變成一個有狀態的小程式

[AppDaemon](https://appdaemon.readthedocs.io/) 是一個可以和 Home Assistant 溝通的 Python 自動化框架。它能監聽 entity 的狀態、呼叫 Home Assistant 服務、安排延遲工作，也能在程式裡保存計時器或目前處理到哪一步。

搬到 AppDaemon 後，我把離家模式拆成幾個有名字的動作：監聽模式變化、啟動時檢查目前狀態、送出關閉指令、稍後驗證結果，以及在必要時重試。

```python
self.listen_state(self._on_mode_change, self._mode_entity)

if self._startup_check:
    self.run_in(self._check_current_mode, 2)
```

狀態進入 `armed_away` 時，程式只關閉目前還沒關閉的目標。送出指令後不直接宣告成功，而是保留一個計時器，五秒後再檢查一次。

<figure>
  <img src="/images/why-i-moved-home-assistant-automations-to-appdaemon/away-mode-story.png" alt="AppDaemon 在離家後關閉電視盒電源、等待、驗證並在需要時重試" width="1776" height="888" loading="lazy" />
  <figcaption>離家只是起點；真正重要的是送出指令後，系統還會回頭確認結果。</figcaption>
</figure>

我目前設定的驗證間隔是 5 秒，最多重試 2 次：

```yaml
startup_check: true
verify_delay: 5
max_retries: 2
```

如果目標已經全部關閉，日誌會留下成功紀錄；如果還有設備維持在其他狀態，程式會再次送出指令。超過上限後，它不再假裝一切正常，而是把失敗設備與最後狀態記進錯誤日誌。

這正是我想從 AppDaemon 得到的東西：不是比較炫的語法，而是能把「發生什麼事、接著做什麼、怎麼確認、失敗後怎麼辦」寫成一段可以追蹤的流程。

## 重啟之後，規則仍然應該成立

單純的狀態監聽只能看到未來發生的改變。

如果我已經離家，這時 AppDaemon 剛好更新或重新啟動，`armed_away` 並不會再變一次。只靠監聽事件，程式就會錯過這個狀態。

所以 AppDaemon 啟動兩秒後，我會主動讀取目前的保全狀態。如果當下已經是離家模式，就直接執行相同的關閉與驗證流程。

這個設計看起來只是多一個檢查，背後的想法卻很重要：**自動化不只要處理事件，也要維持家裡應該成立的規則。**

離家時，指定設備應該關閉。無論這個狀態是剛剛發生，還是系統重啟前就已經存在，規則都不應該失效。

## 料理模式讓我看見「取消排程」的重要

上一篇提到的料理模式，也被我搬進 AppDaemon。

按下 Home Assistant 的料理模式按鈕後，程式會先打開電視相關電源，等待 5 秒讓小米電視完成啟動，再從預先設定的影片清單隨機挑一支，連同 playlist ID 一起交給 Android TV Remote 播放。

這裡最容易忽略的情況，是等待的 5 秒內又按了一次按鈕。

如果每次按下都建立新的延遲工作，幾秒後就可能連續送出兩次播放要求。因此我的程式在開始新流程前，會先取消前一次尚未執行的計時器：

```python
def _cancel_pending_launch(self):
    if self._launch_handle:
        self.cancel_timer(self._launch_handle)
        self._launch_handle = None
```

接著才建立新的排程：

```python
self._launch_handle = self.run_in(
    self._launch_playlist,
    self._power_on_delay,
)
```

這讓「再按一次」的意思變得很清楚：重新計時，以最後一次操作為準，而不是讓每一次按鈕事件都排隊執行。

在 YAML 裡不是做不到這件事，但對我來說，當流程開始需要保存計時器 handle、取消舊工作，再建立新工作時，Python 已經更接近我理解問題的方式。

## 設定留在 YAML，行為交給 Python

改用 AppDaemon 後，我沒有完全離開 YAML，而是重新分配兩者的工作。

在 `apps.yaml` 裡，我放容易調整的設定：要監聽哪個 entity、哪些狀態算離家、要關閉哪些設備、等待幾秒，以及最多重試幾次。Python 檔案則負責共用的判斷與流程。

```yaml
turn_off_entities:
  - light.dian_shi_he

verify_delay: 5
max_retries: 2
```

以後要增加一個離家時關閉的設備，只要把 entity ID 加進清單，不需要再複製一整段判斷與重試邏輯。

這種分工也讓我比較容易看出一個修改是在改「政策」還是在改「程式行為」。要關哪些設備是設定；如何關閉、驗證與重試則是程式。

## 我沒有一次把所有 YAML 都關掉

自動化會直接影響家裡的設備，所以搬移時最怕的不是新程式沒動，而是新舊兩套同時動。

我的做法是先保留原本的 YAML automation，讓 AppDaemon 版本載入並觀察日誌。確認它能偵測離家、送出關閉要求，最後留下 `Away-mode turn-off verified successfully` 的成功紀錄後，才停用重複的 YAML 自動化。

這個順序讓我可以逐步確認新版本，而不是在還不知道 AppDaemon 是否正常運作時，就先拆掉原本可用的流程。

最後同一件事只交給一個實作負責。否則看到設備被關閉時，我甚至無法確定是哪一套自動化做的，更不用說除錯。

## 什麼留在 YAML，什麼搬到 AppDaemon

現在我不會看到 YAML 就急著改寫成 Python。我使用的判斷方式很簡單：

- 觸發、條件和動作可以清楚排成一條線，留在 Home Assistant YAML；
- 開始需要保存狀態、取消計時器、驗證結果、限制重試或處理啟動補判斷時，再考慮 AppDaemon；
- 如果只是為了讓程式看起來比較「工程化」，卻沒有降低理解與維護成本，就不值得搬。

YAML 的優點是靠近 Home Assistant，也容易在介面中查看與修改；AppDaemon 的優點則是當流程長出狀態與生命週期後，我能用函式、變數與清楚的日誌把它整理好。

所以這次搬家不是從簡單工具升級到高級工具，而是讓不同複雜度的問題回到適合自己的地方。

## 自動化真正完成，是我能信任它

剛開始做智能家居時，我在意的是按下按鈕後設備會不會動。後來我更在意的是：系統重啟後規則還在不在、送出的指令有沒有真的完成、失敗時會不會留下線索，以及重複操作會不會產生意外的排程。

把複雜自動化搬到 AppDaemon，沒有讓設備變得更智能，卻讓我更清楚整套系統正在做什麼。

對我來說，這才是從 YAML 搬到 Python 最大的改變：我不再只描述一串理想情況下會依序發生的動作，而是開始設計一段能面對重啟、延遲與失敗的生活流程。
