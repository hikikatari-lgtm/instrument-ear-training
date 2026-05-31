# Instrument Ear Training

楽器別の音を聴いて理論を学ぶ初心者向けアプリ。ピアノ・ギター・ベースの3楽器を Tone.js で再生し、3択クイズで出題する。

## 技術スタック

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS（ダークテーマ：黒背景 `#0a0a0a` / ゴールド `#d4af37`）
- Tone.js（楽器音の再生）
- SVG で鍵盤・フレットボードを描画

## ディレクトリ構成

```
src/
  app/
    layout.tsx        ルートレイアウト（lang="ja"）
    page.tsx          トップ画面（3楽器カード + 進捗バッジ）
    piano/page.tsx    ピアノ編（20問）
    guitar/page.tsx   ギター編（20問）
    bass/page.tsx     ベース編（20問）
    globals.css
  components/
    QuizRunner.tsx    3楽器共通のクイズ進行・結果表示
    Piano.tsx         SVGピアノ鍵盤（C3〜B4、ピッチクラスでハイライト）
    Fretboard.tsx     SVGフレットボード（5フレット窓、ドット表示）
    BassLine.tsx      ベースのルート音シーケンス表示
  lib/
    music.ts          コード記号 → 構成音/ピッチクラス、ギター運指 → 音
    audio.ts          Tone.js シンセ生成と再生（piano/guitar/bass）
    questions.ts      全60問のデータ（楽器ごと20問）
    progress.ts       localStorage への進捗保存
```

## 設計メモ

- Tone.js はクライアント専用。`audio.ts` 内で初回ユーザー操作後に `Tone.start()` し、シンセを遅延生成する（SSR の window エラー回避）。
- ピアノのハイライトは**ピッチクラス単位**。両オクターブの一致キーをゴールドで塗る。
- ギターの音は運指 `frets`（6弦→1弦）から標準チューニングで算出して鳴らすため、コード名と音が常に一致する。
- 出題データを増やす場合は `src/lib/questions.ts` の `*_SPECS` 配列に追加するだけでよい。
- 進捗は `iet:progress:<instrument>` キーで localStorage に保存。

## 開発

```
npm install
npm run dev      # http://localhost:3000
npm run build
```

## 関連プロジェクト

Directline Studio の音楽理論ツール群（theory-test / song-master / chord-analysis-lab / theory-lab）と同じダークテーマ・構成を踏襲。
