# iwara_info
iwara検索ページデータを取得する

## 導入方法
- node.jsをインストールする（方法はググるなどで調べてください）
- clone or download > Download ZIP > 任意のディレクトリに展開
- npm i　→　必要なライブラリがダウンロードされる

## 利用方法
```
node get_search_info.js
```
 iwara検索ページを3秒毎に1ページ取得します

 出力ファイル名： isl_v2_full_20190407_070000.json (数字はyyyymmdd_hhmmss)
 
 出力フォーマット： json

|タグ|内容|
|:--|:--|
|id|動画ID。 https://ecchi.iwara.tv/videos/{id} で動画ページにアクセス可能|
|user|作者ID|
|title|タイトル。検索画面に表示するタイトルなので長い場合省略される場合がある|
|like|like数|
|view|view数|
|sdata|作成日|
|checkdata|このツールでチェックした日|
|thumurl|サムネイルのURL|
|otherlinks|作者コメント欄に含まれるlink(youtube,megaなど)|
