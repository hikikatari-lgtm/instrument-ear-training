# 🎹 Instrument Ear Training

楽器の音を聴いて、理論力を鍛える — ピアノ・ギター・ベースの3楽器の音を Tone.js で再生し、3択クイズで音楽理論を学ぶ初心者向けアプリ。

## 特徴

- 🎹 **Piano** — コードを聴いてコードタイプ（major / minor / 7th / M7 / m7）を当てる（20問）
- 🎸 **Guitar** — コードフォームの音を聴いて当てる。バレーコードや分数コードも（20問）
- 🎸 **Bass** — ベースラインのルート移動からコード進行（ディグリー）を当てる（20問）
- 回答後に鍵盤／フレットボード上で正解の構成音をハイライト表示
- 楽器ごとに進捗を localStorage 保存

## 開発

```bash
npm install
npm run dev
```

http://localhost:3000 を開く。

## ビルド

```bash
npm run build
npm start
```

## 技術スタック

Next.js 15 (App Router) / TypeScript / Tailwind CSS / Tone.js / SVG
