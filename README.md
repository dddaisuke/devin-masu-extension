# devin-masu-extension
Devinで "**ます**" が豆腐になってしまう問題を解消するChrome拡張機能です。

# 仕組み
このChrome拡張は、ページ上で `font-family` に `Inter` が使われている要素に対して、
`Inter` の直後へ `"Noto Sans JP"` を挿入した `font-family` を強制適用します。

## インストール方法
1. ZIPを展開
2. Chromeで `chrome://extensions` を開く
3. 右上の「デベロッパー モード」をON
4. 「パッケージ化されていない拡張機能を読み込む」
5. 展開したフォルダを選択

## 注意
- ページの見た目を維持しつつ、日本語グリフのフォールバックを改善するための拡張です。
- `"Noto Sans JP"` 自体がOSに入っていない環境では、別途インストールやWebフォント配信が必要です。
- コンテンツスクリプトで要素ごとに `font-family: ... !important;` を適用します。
