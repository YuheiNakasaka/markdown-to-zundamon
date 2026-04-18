# markdown-to-zundamon

Markdownからずんだもん解説動画を生成するプロジェクト。Remotionベース。

## 前提条件

- Node.js
- VOICEVOX が `localhost:50021` で起動していること（前処理時）

## ビルド・実行手順

```bash
# 1. 前処理: Markdown解析 + VOICEVOX音声生成 → public/<project>/manifest.json
npm run preprocess -- example/my-video.md

# 2. プレビュー
npm run studio -- my-video

# 3. レンダリング → out/<project>.mp4
npm run render -- my-video
```

複数の動画を扱う場合はそれぞれ前処理→レンダリングを実行:

```bash
npm run preprocess -- projects/intro.md
npm run render -- intro

npm run preprocess -- projects/chapter1.md
npm run render -- chapter1
```

## PDFからの動画生成

PDF形式のスライド資料を元に動画を作成できます。PDFの各ページを画像に変換し、1ページ=1スライドのmanuscript Markdownを自動生成します。

### 前提条件

- Ghostscript (`gs`) がインストールされていること（`brew install ghostscript`）

### 手順

```bash
# 1. PDFからmanuscript + ページ画像を生成
npm run pdf-to-manuscript -- ./public/software_engineering_01.pdf
#    → manuscripts/software_engineering_01.md
#    → manuscripts/software_engineering_01/images/page-001.png, page-002.png, ...

# 2. 生成されたMarkdownを編集し、各ページのトークスクリプトを記入
#    「ここにページNのトークスクリプトを書くのだ」の部分を書き換える

# 3. 通常の動画生成パイプラインを実行
npm run preprocess -- manuscripts/software_engineering_01.md
npm run studio -- software_engineering_01
npm run render -- software_engineering_01
```

生成されるMarkdownの構造:

```markdown
# ページ1

> ![](./software_engineering_01/images/page-001.png)

ここにページ1のトークスクリプトを書くのだ

# ページ2

> ![](./software_engineering_01/images/page-002.png)

ここにページ2のトークスクリプトを書くのだ
```

## アーキテクチャ

2フェーズ構成:
1. **前処理** (`scripts/preprocess.ts`): Markdown → VOICEVOX音声生成 → JSONマニフェスト
2. **動画生成** (`src/`): マニフェストを読み込み、Remotionで音声・字幕・スライド・キャラ画像を合成

- blockquote → スライド表示
- それ以外のテキスト → ずんだもんが喋る（VOICEVOX）

## ファイル構成

- `scripts/preprocess.ts` - 前処理スクリプト
- `scripts/pdf-to-manuscript.ts` - PDF → manuscript変換スクリプト
- `scripts/studio.ts` - Remotion Studio 起動ヘルパースクリプト
- `scripts/render.ts` - レンダリングヘルパースクリプト
- `src/index.ts` - Remotion registerRoot
- `src/Root.tsx` - Composition登録（calculateMetadata で動的マニフェスト読み込み）
- `src/Composition.tsx` - メイン合成コンポーネント
- `src/components/` - UI コンポーネント群
- `src/types.ts` - 型定義
- `public/<project>/manifest.json` - 前処理出力（生成物）
- `public/<project>/audio/` - 生成された音声ファイル（生成物）
- `public/<project>/images/` - スライド用画像（生成物）
- `public/characters/default.png` - ずんだもんキャラ画像（共有、生成物）
- `characters/` - キャラクター画像（ソース）
- `out/<project>.mp4` - レンダリング出力（生成物）

## コーディング規約

- TypeScript strict
- Remotion のコンポーネント規約に従う
