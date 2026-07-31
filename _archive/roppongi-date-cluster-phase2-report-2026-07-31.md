# 六本木デートクラスタ改修 第2段階 差分報告（2026-07-31）

5タスク（A/B統合、ピラーPのリンク構造修復、C/D/EのDEARROOM節短縮、検証、報告）を実施。
**コミットは未実施**。以下は編集直後の報告内容。

---

## 1. 変更ファイル一覧

| ファイル | 変更内容 |
|---|---|
| `src/content/blog/roppongi-indoor-date-spots.md`（A） | タスク1：新規H2追加、FAQ1問追加、`/dearroom`リンク追加、`updatedDate`更新 |
| `src/content/blog/roppongi-rainy-day-date-indoor-spots.md`（B） | タスク1：`git rm`で削除 |
| `_archive/roppongi-rainy-day-date-indoor-spots.md` | タスク1：削除前の全文バックアップ |
| `src/content/blog/roppongi-date-mae-basho-erabi.md`（G） | タスク1：Bへの参照をAへのリンクに書き換え（P以外に見つかった残存参照） |
| `vercel.json` | タスク1：redirects2件追記（計6件） |
| `src/content/blog/roppongi-date-kanzen-guide.md`（P） | タスク2：Bへのリンク削除、新規H2×2追加＋リンク、H・Iへのリンク追加、目次更新 |
| `src/content/blog/roppongi-date-nijikame-cinema-room.md`（C） | タスク3：DEARROOM節を1H2に圧縮、`updatedDate`更新 |
| `src/content/blog/roppongi-date-private-cinema-room.md`（D） | タスク3：DEARROOM節2つを1H2に圧縮・統合、目次から削除H2の項目を除去、`updatedDate`更新 |
| `src/content/blog/roppongi-kojitsu-date-restaurant-bar-cinemaroom.md`（E） | タスク3：DEARROOM節を1H2に圧縮、`updatedDate`更新 |

**要確認事項**：タスク1の指示にはAの目次(TOC)更新が含まれていなかったため、追加した新H2「🌧 雨の日でも六本木が室内デートに向いている理由」はAの目次に反映していない（タスク2ではP側に目次更新が明記されていたため対応済み）。意図的な省略か確認漏れか判断がつかなかったため、未編集のまま報告。

---

## 2. タスク1-1・1-2の全文

**追加したH2（Aの最初のH2の直前）**
```markdown
## 🌧 雨の日でも六本木が室内デートに向いている理由

### 大型複合施設が徒歩圏内に集まっている

六本木ヒルズ、東京ミッドタウン、国立新美術館といった大きな施設が徒歩圏内に集まっているため、一度エリアに入ってしまえば移動距離を短くまとめられます。建物の中で完結する過ごし方を組み立てやすいのが、この街の特徴です。

### 地下鉄直結でアクセスしやすい

東京メトロ日比谷線・都営大江戸線の六本木駅、東京メトロ南北線の六本木一丁目駅が使えます。駅から直結・地下通路でつながっている施設も多く、**雨に濡れる時間を最小限に抑えられます**。

### 天候に左右されずプランを組める

屋内で完結する選択肢が多いため、当日の天気予報を見てから予定を変える、といった調整がしやすいエリアです。雨が理由でデートそのものを組み直す必要がありません。
```

**追加したFAQ**
```markdown
**Q. 雨の日でも六本木駅から各スポットまで濡れずに移動できますか？**

A. 六本木ヒルズや東京ミッドタウンは、駅の出口から比較的近い位置にあります。完全に濡れないルートは限られますが、傘があれば問題なく移動できる距離です。DEARROOM六本木は六本木一丁目駅から徒歩4分・六本木駅から徒歩6分の立地です。
```

---

## 3. タスク3で短縮したC・D・Eの全文（変更後）

**C（roppongi-date-nijikame-cinema-room.md）**
```markdown
## 🏠 DEARROOM六本木について

DEARROOM六本木は、六本木エリアにある完全貸し切り型のプライベートシネマルームです。「こういう空間があったらいいのに」という思いから、推し活好きの私・ののかが作りました。大画面と高音質の映像体験に加え、LEDライティングを推し色に変えられるなど、ディナー後の2軒目としても気負わず使える落ち着いた個室空間になっています。

飲み物や軽食の持ち込みも自由で、ゴミ処理も無料です。24時間利用できるため、ディナー後の遅い時間帯からでも気兼ねなく予約できます。スペースマーケットでの評価は4.6と高く、多くの方にご利用いただいています。

**▶ 設備・料金の詳細はこちら：[DEARROOM六本木の設備・スペック](https://www.oshikatsu-room.com/dearroom)**
```

**D（roppongi-date-private-cinema-room.md）**※2つのH2を1つに統合
```markdown
## 🏠 DEARROOM六本木のシネマルームについて

DEARROOM六本木は、六本木エリアにある完全個室のプライベートシネマルームです。大型スクリーンと高音質なサウンドシステムを備え、映画館とは違う「ふたりだけの映画体験」ができる空間になっています。

LEDライティングは自由に色を変えられるほか、持ち込みも自由なので、観る作品や過ごし方に合わせて空間をアレンジできます。予約はスペースマーケットのオンラインページから完結し、初めての方でも当日すぐに鑑賞を始められます。

**▶ 設備・料金の詳細はこちら：[DEARROOM六本木の設備・スペック](https://www.oshikatsu-room.com/dearroom)**
```

**E（roppongi-kojitsu-date-restaurant-bar-cinemaroom.md）**
```markdown
## ✨ DEARROOM六本木のシネマルームとは？

六本木に、そのためだけにつくったプライベートシネマルームがあります。DEARROOM六本木は完全個室のプライベート空間で、大画面・高音質の映像設備とともに、レストランやバーとは違う「ふたりだけで完結する」過ごし方ができるのが特徴です。

飲食物の持ち込みが自由で、LEDライティングも好きな色に変えられるため、ふたりの好みに合わせて空間をアレンジできます。24時間利用可能で、スペースマーケットでの評価も4.6と高い水準です。

**▶ 設備・料金の詳細はこちら：[DEARROOM六本木の設備・スペック](https://www.oshikatsu-room.com/dearroom)**
```

**本文文字数（概算・空白除く）**

| 略称 | 変更前 | 変更後 |
|---|---|---|
| C | 6,066 | 5,812 |
| D | 6,367 | 5,366 |
| E | 6,699 | 6,392 |

---

## 4. Pの変更差分

```diff
@@ 目次 @@
+- [時間を気にせずゆっくり過ごしたいとき](#時間を気にせずゆっくり過ごしたいとき)
+- [付き合う前のデートで気をつけたいこと](#付き合う前のデートで気をつけたいこと)

@@ 雨の日セクション内 @@
-**▶ 詳しくはこちら：[六本木で雨の日デートするならどこ？濡れずに楽しめる室内スポットまとめ](https://www.oshikatsu-room.com/blog/roppongi-rainy-day-date-indoor-spots/)**
（本文は変更なし）

@@ 2軒目セクションの直後・デート以外セクションの直前 @@
+## ⏳ 時間を気にせずゆっくり過ごしたいとき
+（本文2段落＋Fへのリンク）
+---
+## 💬 付き合う前のデートで気をつけたいこと
+（本文2段落＋Gへのリンク）

@@ デート以外にも使える六本木の空間＞推し活・女子会・誕生日会にも @@
+**▶ 詳しくはこちら：[六本木で誕生日サプライズをするならどこ？失敗しない場所選びと演出のコツ](https://www.oshikatsu-room.com/blog/roppongi-birthday-surprise-spot/)**
+**▶ 詳しくはこちら：[六本木で女子会するなら個室が正解！気兼ねなく話せる場所の選び方](https://www.oshikatsu-room.com/blog/roppongi-joshikai-kojitsu/)**
```

（Pの`updatedDate`はタスク2の指示に明記がなかったため未更新のまま）

---

## 5. `vercel.json` の最終内容

```json
{
	"redirects": [
		{
			"source": "/blog/seinensai-yarikata",
			"destination": "/blog/oshi-seitansai-kanzen-guide/",
			"permanent": true
		},
		{
			"source": "/blog/seinensai-yarikata/",
			"destination": "/blog/oshi-seitansai-kanzen-guide/",
			"permanent": true
		},
		{
			"source": "/blog/birthday-celebration-karaoke-mochimono",
			"destination": "/blog/oshi-seitansai-karaoke-junbi-enshutu-mochimono/",
			"permanent": true
		},
		{
			"source": "/blog/birthday-celebration-karaoke-mochimono/",
			"destination": "/blog/oshi-seitansai-karaoke-junbi-enshutu-mochimono/",
			"permanent": true
		},
		{
			"source": "/blog/roppongi-rainy-day-date-indoor-spots",
			"destination": "/blog/roppongi-indoor-date-spots/",
			"permanent": true
		},
		{
			"source": "/blog/roppongi-rainy-day-date-indoor-spots/",
			"destination": "/blog/roppongi-indoor-date-spots/",
			"permanent": true
		}
	]
}
```

---

## 6. 検証結果

- `npm run build`：成功（50ページ）
- `dist/sitemap-0.xml`：`roppongi-rainy-day-date-indoor-spots` 0件／`roppongi-indoor-date-spots`・`roppongi-date-kanzen-guide`・`roppongi-date-yukkuri-sugoseru-basho`・`roppongi-date-mae-basho-erabi` 各1件
- `vercel.json` redirects：**6件**
- `src/` 配下の `roppongi-rainy-day-date-indoor-spots` 参照：**0件**

補足：Dの目次(TOC)に削除したH2「DEARROOM六本木へのアクセスと予約方法」への死んだアンカーリンクが残っていたため、指示にはなかったがリンク切れ回避のため除去した。
