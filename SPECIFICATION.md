# SPECIFICATION.md

# latex-table-composer

Version: v0.1
Status: MVP Development

---

# 1. プロジェクト概要

## 目的

`latex-table-composer` は、

**研究・論文向けの表を LaTeX コードへ変換する Web アプリケーション**

である。

主用途：

* Excel / PowerPoint の表を LaTeX 化
* Python 実験結果（CSV）を論文表へ変換
* sklearn classification report の整形
* 実験ログからの表作成
* 論文向け表レイアウト生成

本プロジェクトは、

> **単体 Web アプリとして動作可能**

でありつつ、

> **将来的に Citation ⇄ BibTeX Converter へ統合可能**

な構造で実装する。

---

## 背景

現在の研究ワークフローでは、

```txt
Excel
↓
手作業で整形
↓
LaTeX tabular
↓
compile
↓
見た目修正
↓
再編集
```

という非効率な作業が多い。

特に：

* PowerPoint / Excel の表
* Python 実験結果
* CSV 出力
* sklearn の classification report

を論文表へ整形する際に、

**大量の手作業が発生する。**

本ツールでは：

> **見ながら編集し、そのまま LaTeX を生成**

することを目標とする。

---

# 2. 開発方針（重要）

本プロジェクトは

> **将来統合前提の standalone repository**

として開発する。

つまり：

```txt
単体でも完成品として動く
+
後で既存 repo に merge 可能
```

を両立する。

---

## 最重要原則

### 1. 常に動作する状態を維持

途中で作業を止めても：

> **常に runnable state**

を維持する。

禁止：

* 大規模一括実装
* 壊れた状態で放置
* 未完成 feature の production 混入

推奨：

```txt
小さく実装
↓
動作確認
↓
commit
↓
次へ
```

---

### 2. regression zero

既存機能を壊さない。

新規実装時も：

> **working state を維持**

すること。

特に：

* parser
* generator
* preview

の既存動作を壊さない。

---

### 3. Architecture first

UI より先に：

> **内部構造を固定**

する。

Claude Code が暴走しやすいため、

**設計を先に固定してから実装する。**

---

### 4. 過度な abstraction 禁止

Citation ⇄ BibTeX Converter の思想を継承する。

禁止：

```ts
buildEverything()
genericTableBuilder()
megaRenderer()
```

のような巨大 abstraction。

原則：

> **必要最小限の分離**

のみ行う。

---

### 5. shared 化ルール

既存 repo 方針を継承。

原則：

> **2回以上使うものだけ shared 化**

例：

OK：

```txt
decimal formatter
latex escape
alignment helper
border helper
```

NG：

```txt
巨大 generic formatter
万能 renderer
過度な utility
```

---

# 3. Reference Repository（重要）

本 repository は以下を参考実装として扱う。

Reference Repository:

https://github.com/Axe0320/citation-bibtex-converter

Default Branch:

```txt
main
```

---

## UI 方針

本ツールは：

> **Citation ⇄ BibTeX Converter の UI 思想に寄せる**

ただし：

> **完全コピーは禁止**

とする。

目的：

```txt
統一感
+
将来統合容易性
```

を確保すること。

---

## 寄せる対象

### Layout philosophy

* Card based UI
* utility-first design
* simple interaction
* academic tool oriented

---

### Typography

* title size
* section hierarchy
* input readability

を既存 repo に近づける。

---

### Form design

以下を既存 repo に寄せる：

* Button
* Input
* Textarea
* Select
* spacing
* card margin

---

### Interaction pattern

既存 repo の：

```txt
入力
↓
結果確認
↓
copy
```

の流れを踏襲する。

---

## 寄せない対象

今回は以下は対象外：

❌ 完全一致 UI
❌ CSS class 完全共有
❌ pixel perfect 再現

理由：

standalone repo のため。

---

## Claude Code への要求

実装前に：

以下を確認すること。

```txt
src/App.tsx
src/components
UI spacing
button hierarchy
layout
```

既存 repository の

**UI 哲学を理解してから実装すること。**

---

# 4. Repository 方針

## Repository Name

```txt
latex-table-composer
```

---

## Repository Type

完全別 repository。

目的：

> Citation ⇄ BibTeX Converter を壊さない

ため。

---

## 将来の統合方針

最終的には：

```txt
citation-bibtex-converter
```

へ

> transplant（機能移植）

する。

repository merge は行わない。

例：

```txt
src/lib/table/
components/TableComposer/
```

のみ移植。

---

# 5. Branch 運用（固定）

## main branch を直接変更禁止

禁止：

```txt
main commit
```

必ず：

```txt
feature/*
```

branch を作成。

例：

```txt
feature/table-core
feature/preview
feature/latex-generator
feature/log-parser
```

---

## 実装フロー

固定：

```txt
feature branch
↓
実装
↓
動作確認
↓
push
↓
Vercel Preview
↓
確認
↓
merge 判断
```

---

## merge 原則

即 merge 禁止。

原則：

```txt
preview deploy
↓
manual confirm
↓
merge
```

---

# 6. 技術スタック

## 必須

* React
* TypeScript
* Vite

---

## 推奨

* Tailwind CSS
* shadcn/ui（必要最低限のみ）

---

## UI 方針

重要：

> **CSS 後回し禁止**

ただし：

> **高級 UI は後回し**

とする。

MVP 時点で：

```txt
見やすい
使いやすい
研究用途で普通に使える
```

を満たす。

---

## 最低限必要な UI 品質

必須：

* spacing
* readable typography
* card layout
* clean table preview
* usable buttons
* responsive minimum support

後回し：

❌ animation
❌ dark mode
❌ fancy transition
❌ drag & drop
❌ resize panel

---

# 7. システム全体構造（固定）

本 repository は：

```txt
Input
↓
Parser
↓
Normalize
↓
Formatter
↓
Generator
↓
Preview + LaTeX Output
```

の流れで構成する。

---

## 理由

Citation ⇄ BibTeX Converter の：

```txt
parse
↓
normalize
↓
formatter
```

思想を継承するため。

---

## 禁止事項

以下は禁止：

```txt
Raw input → direct LaTeX
```

必ず：

> TableModel

を経由すること。

---

# 8. Architecture

固定構造：

```txt
Raw Input
↓
parse
↓
normalize
↓
TableModel
↓
formatter
↓
generator
↓
preview / latex
```

---

## Single Source of Truth

重要：

> **TableModel を唯一の真実源とする**

Preview と LaTeX は：

同じ model を参照。

禁止：

```txt
preview 専用 state
latex 専用 state
```

の二重管理。

---

# 9. Directory Structure（固定）

```txt
src/
├── components/
│
├── lib/
│   └── table/
│       ├── types.ts
│       │
│       ├── parser/
│       │   ├── parseCSV.ts
│       │   ├── parseTSV.ts
│       │   ├── parseText.ts
│       │   ├── parseClassificationReport.ts
│       │   └── parseLog.ts
│       │
│       ├── normalize/
│       │   ├── normalizeTable.ts
│       │   └── index.ts
│       │
│       ├── formatters/
│       │   ├── academic.ts
│       │   ├── ieee.ts
│       │   ├── acm.ts
│       │   ├── classic.ts
│       │   ├── shared/
│       │   │   ├── decimal.ts
│       │   │   ├── alignment.ts
│       │   │   ├── border.ts
│       │   │   └── latexEscape.ts
│       │   └── index.ts
│       │
│       ├── generators/
│       │   ├── htmlPreview.ts
│       │   └── latexGenerator.ts
│       │
│       └── tableToLatex.ts
│
└── App.tsx
```

---

# 10. TableModel（固定）

すべての parser は：

> この model に変換すること。

```ts
type TableCell = {
  id: string
  value: string
  bold?: boolean
  italic?: boolean
  hidden?: boolean
  align?: 'left' | 'center' | 'right'
}

type TableRow = {
  id: string
  cells: TableCell[]
  separatorTop?: boolean
  separatorBottom?: boolean
  rowType?: 'normal' | 'header' | 'summary'
}

type TableModel = {
  title: string
  label: string
  environment: 'table' | 'table*'
  columns: string[]
  rows: TableRow[]
}
```

---

# 11. 実装優先順位（固定）

Claude Code は：

以下順で実装すること。

```txt
1. project setup
2. TableModel
3. parser
4. normalize
5. preview
6. latex generator
7. UI
8. formatting
9. advanced parser
```

禁止：

```txt
全部一気に実装
```

# 12. UI仕様（固定）

本ツールは：

> **研究用途で“普通に使える”UI**

を目標とする。

目的：

```txt
見やすい
迷わない
論文作業が速くなる
```

である。

過度な装飾は禁止。

---

## UIデザイン原則

以下を満たすこと：

### 1. academic-first

研究用途を最優先。

禁止：

* 派手な animation
* dashboard 的UI
* unnecessary graphics

---

### 2. utility-first

目的：

> **最短で表を作る**

こと。

つまり：

```txt
入力
↓
編集
↓
プレビュー
↓
LaTeXコピー
```

までを短くする。

---

### 3. Citation ⇄ BibTeX Converter 準拠

以下を参考：

Repository:

https://github.com/Axe0320/citation-bibtex-converter

UI哲学：

```txt
simple
minimal
clean
card-based
```

に寄せる。

---

# 13. 画面構成

基本レイアウト：

```txt
┌──────────────────────────────┐
│ Header                       │
├──────────────────────────────┤
│ 出力設定（FormattingBar）     │
├──────────────────────────────┤
│ Input        │ Preview       │
├──────────────────────────────┤
│ LaTeX（全幅）                 │
└──────────────────────────────┘
```

---

## Desktop Layout

```txt
┌──────────────────────────────┐
│ 出力設定                      │
├───────────────┬──────────────┤
│    Input      │   Preview    │
├───────────────┴──────────────┤
│         LaTeX（全幅）         │
└──────────────────────────────┘
```

上段：Input / Preview を 1fr 1fr で横並び。

下段：LaTeX パネルを全幅で配置。

---

## Mobile / Narrow Width

responsive：タブ切替。

```txt
Input
Preview
LaTeX
```

の順。

---

# 14. Header仕様

Header に含める：

### Title

```txt
LaTeX Table Composer
```

---

### Subtitle

```txt
表データを論文向け LaTeX に変換・整形するツール
```

---

### Export Button

右上：

```txt
Copy LaTeX
```

成功時：

```txt
Copied!
```

toast 表示。

---

### Example Button

```txt
Load Example
```

クリックするたびに4種類のサンプルをサイクルで切り替える。

---

# 15. Input Panel

Input は複数入力方式を提供する。

---

## Input Modes

```txt
1. Paste Table（実装済み）
2. CSV Upload（将来）
3. Manual Edit（将来）
```

---

### 1. Paste Table（実装済み）

textarea に貼り付け後、**Parse Table** ボタンで自動検出・変換。

対応フォーマット（自動検出、優先順）：

```txt
1. TSV       — タブ文字を含む（Excel・Google Sheets コピペ）
2. classification-report — sklearn classification_report() テキスト出力
3. log       — "Key: 数値" 形式が3行以上
4. CSV       — カンマ区切り
```

textarea は縦横スクロール対応（`wrap="off"`、固定高さ）。

---

### 2. CSV Upload（将来）

`.csv` / `.tsv` / `.txt` ファイルのアップロード対応。

---

### 3. Manual Edit（将来）

空表から作成。初期値：3列 × 3行。

---

## Advanced Input（実装済み）

### sklearn classification report

sklearn `classification_report()` のテキスト出力を検出・パース。

```txt
              precision    recall  f1-score   support

           0       0.85      0.88      0.86        50
    accuracy                           0.88       153
   macro avg       0.84      0.83      0.83       153
```

出力列：Class / Precision / Recall / F1-Score / Support

`accuracy` 行は Precision・Recall が空セル（欠損値表示）として処理される。

---

### log parser

`Key: 値` 形式のログを縦表（Metric / Value）に変換。

```txt
Accuracy: 0.9243
Precision: 0.9182
F1 Score: 0.9112
```

---

# 16. Table Editing

本ツールの中心機能。目的：**LaTeX を書かずに表編集**。

---

## セル直接編集（実装済み）

Preview 上でセルをクリックするとインライン編集が可能。

- フォーカス中: accent 色（薄紫）でハイライト
- フォーカス外れ時: モデルに即反映 → LaTeX も即更新

---

## Row / Column Operations（将来）

行単位：Add Row / Delete Row / Move Up / Move Down

列単位：Add Column / Delete Column / Rename Column / Move Left / Move Right

---

## Hide / Show（将来）

各 row・column・cell に show / hide を持つ。LaTeX 出力から除外。

---

## Style Editing（モデル対応済み、UI は将来）

- Bold → `\textbf{}`
- Italic → `\textit{}`
- Alignment: left / center / right（normalize 時に列単位自動設定）

---

## Border Editing

出力設定（FormattingBar）の罫線スタイルで制御：

- Academic（論文向け）
- Full Grid（全罫線）
- Minimal（上下のみ）

---

# 17. Preview仕様

> **即時 Preview**

変更後 300ms 以内更新目標。

---

## Preview表示

HTML Table。論文風スタイル（booktabs ライク）：

- 上端・下端：2px 太線
- ヘッダー後区切り：1px
- summary 行前区切り：1px
- 縦線なし、zebra なし

---

## Preview Source

TableModel から生成。preview 専用 state は持たない。

---

## 出力設定の反映

**出力設定（FormattingBar）の値が Preview にも反映される。**

- データセルに `formatValue(cell.value, options)` を適用
- ヘッダー行は formatting 対象外

Preview と LaTeX 出力の値は一致する。

---

## Preview Features

- Caption / Label 表示
- Table body（bold / italic / alignment）
- Hidden items 除外
- セルのインライン編集

---

# 18. Formatting Controls

論文向け微調整。**パネル上部（Input・Preview の上）に配置。**

---

## 出力環境

```txt
table*（初期値・2段組向け）
table（1段組）
```

---

## 小数点桁数

```txt
Auto（小数点を含む値を4桁に丸め、整数はそのまま）
0 〜 4
```

例：`0.57142857` → Auto → `0.5714`

---

## 欠損値

空セルの表示形式：

```txt
---（初期値）
N/A
-
blank（空文字）
```

---

## 罫線スタイル

```txt
Academic（初期値）— header後・summary前・上下
Full Grid          — 全行間
Minimal            — 上下のみ
```

---

## Alignment Template（将来）

列揃えのテンプレート指定。現在は normalize 時に列単位で自動判定（数値列 → right）。

---

# 19. LaTeX Generator（固定）

出力形式：

```latex
\begin{table*}[tb]
\caption{}
\label{}
\begin{center}
\begin{tabular}{lrrr}
\hline
\textbf{Method} & \textbf{Acc} & ... \\
\hline
Ours & 0.9240 & ... \\
\hline
\end{tabular}
\end{center}
\end{table*}
```

---

## 出力ルール

- **Caption**: 空でも許可
- **Label**: 推奨形式 `tab:xxxx`
- **Alignment**: 最初のデータ行の `cell.align` から自動生成（l / c / r）
- **Escape**: `& % $ # _ { } \` をエスケープ
- **Bold**: `\textbf{}`、**Italic**: `\textit{}`
- **Hidden 除外**: `cell.hidden` / 全セル hidden の行はスキップ
- **環境切替**: `FormattingOptions.environment` で `table` / `table*` を切替

---

# 20. Example Dataset（実装済み）

Load Example ボタンで4種類をサイクル：

### 1. Benchmark (TSV)

メソッド比較表。列：Method / Accuracy / Precision / Recall / F1

### 2. Classification Report

sklearn `classification_report()` 形式。3クラス + accuracy + macro avg + weighted avg。

### 3. Log Parser

実験ログ形式。Accuracy / Precision / Recall / F1 Score / Loss / Val Accuracy / Val Loss。

### 4. Custom CSV

CIFAR-10/100 ベンチマーク。列：Dataset / Model / Acc / F1 / Params。

---

# 21. MVP完成条件

以下を満たせば MVP 完了。

### Input（実装状況）

- ✅ Paste（TSV / CSV / classification-report / log 自動検出）
- 🔲 CSV Upload（将来）
- 🔲 Manual Edit（将来）

---

### Edit（実装状況）

- ✅ セルのインライン編集
- 🔲 row / column add / delete（将来）
- 🔲 hide / show（将来）
- 🔲 bold / italic の UI 操作（将来。モデルは対応済み）
- ✅ separator（罫線スタイルで制御）
- ✅ alignment（normalize 時に自動設定）

---

### Preview

- ✅ HTML Preview（論文風スタイル）
- ✅ 出力設定の値を Preview に反映

---

### Export

- ✅ LaTeX Copy（Header ボタン / パネルボタン両方）

---

### Formatting

- ✅ decimal precision（Auto 含む）
- ✅ missing value
- ✅ border template
- ✅ 出力環境（table / table*）
- 🔲 alignment template（将来）

---

### UI

- ✅ responsive minimum（mobile タブ切替）
- ✅ academic usable

---

## 非MVP（後回し）

❌ drag & drop
❌ spreadsheet 完全再現
❌ dark mode
❌ collaboration
❌ history system
❌ AI auto correction

---

# 22. Claude Code 実装ルール（重要）

本プロジェクトは Claude Code による段階実装を前提とする。

---

## 最重要ルール

### 一度に大きく実装しない

```txt
小さく実装 → 確認 → commit → 次へ
```

### 差分計画を先に出す

実装前に変更差分計画を提示し、確認後に実装。

### 勝手な architecture 変更禁止

directory 変更・責務変更・巨大 refactor・state 管理変更は禁止。

### App.tsx の変更最小化

原則 minimal diff。全面 rewrite 禁止。

### shared 化の条件

2回以上使う場合のみ shared 化。premature abstraction 禁止。

### Working State 必須

途中終了時でも `npm run dev` で動作可能状態を維持。

---

# 23. 実装フェーズ（完了）

---

## PR-1: Project Setup ✅

Vite + TypeScript + Tailwind CSS による初期構築。UI skeleton 表示。

---

## PR-2: TableModel ✅

`src/lib/table/types.ts` に TableCell / TableRow / TableModel 定義。
ID は `crypto.randomUUID()` で生成。

---

## PR-3: Basic Parser ✅

`detect → parse → normalize → TableModel` パイプライン実装。
TSV / CSV 対応。`parseInput(text): TableModel | null` エントリポイント。

---

## PR-4: Normalize Layer ✅

- 末尾の全空白列を除去
- 列単位の数値判定（過半数が数値 → right align）
- `cell.trim()` 適用

---

## PR-5: HTML Preview ✅

- booktabs ライクな論文風スタイル
- `contentEditable` によるインライン編集
- `PreviewPanel` を独立コンポーネント化

---

## PR-6: LaTeX Generator ✅

- `latexEscape.ts`・`latexGenerator.ts` 実装
- `useMemo` でリアルタイム生成
- Copy LaTeX ボタン接続

---

## PR-7: Formatting Controls ✅

- `FormattingOptions` 型・`DEFAULT_OPTIONS`
- `formatValue.ts`（decimal / missing value）
- `FormattingBar` コンポーネント（日本語ラベル）

---

## PR-8: Advanced Parser ✅

- `parseClassificationReport.ts`：sklearn テキスト形式対応
- `parseLog.ts`：Key: value 形式対応
- `detect.ts` に classification-report / log 判定追加
- `src/lib/example/examples.ts`：4種サンプル
- Load Example ボタン接続

---

## PR-9: UI Polish ✅

- Desktop 2段レイアウト（Input+Preview 上段、LaTeX 全幅下段）
- Preview に `formatValue` 反映（Preview と LaTeX 出力が一致）
- LaTeXPanel "Copy LaTeX" を primary ボタンに格上げ
- FormattingBar をパネル上部に移動
- Input textarea に横縦スクロール対応
- Subtitle 日本語化

---

# 24. Git Workflow（固定）

## main branch 直接変更禁止

必須：`feature/*` ブランチを作成。

## Commit Rule

推奨 prefix：`feat:` / `fix:` / `refactor:` / `ui:` / `parser:`

---

# 25. Preview Deployment（固定）

Vercel Preview を必須化。

```txt
push → preview url → manual confirm → merge decision
```

preview を見ず merge 禁止。

---

# 26. Error Handling

エラー時：落ちないことを優先。

- 検出失敗: `Could not detect format. Please paste TSV or CSV.`
- Invalid Table: `Invalid table structure detected.`
- Empty Input: 許可（初期ダミーテーブル表示）

---

# 27. Performance Target

- Preview update: < 300ms
- CSV parse: < 2sec
- 対応サイズ: 100行 × 20列

---

# 28. 将来統合戦略（重要）

将来的に `citation-bibtex-converter` へ transplant（移植）。
repository merge は行わない。

移植対象：

```txt
src/lib/table/
components/PreviewPanel.tsx
components/FormattingBar.tsx
```

統合先想定：`src/features/table/`

---

# 29. Non-goals（重要）

- spreadsheet 完全再現（Excel clone 化禁止）
- WYSIWYG editor
- full Overleaf replacement
- collaborative editing
- AI auto formatting（後回し）
- citation manager 統合（別プロジェクト）

---

# 30. Acceptance Criteria（完成条件）

MVP 完成条件（現時点の実装状況）：

## Input
- ✅ Paste（TSV / CSV / classification-report / log）
- 🔲 CSV Upload
- 🔲 Manual Table

## Edit
- ✅ インライン編集
- 🔲 add/remove row/column
- 🔲 hide/show
- 🔲 bold/italic UI
- ✅ separator（罫線スタイル）
- ✅ alignment（自動）

## Preview
- ✅ HTML table（論文風）
- ✅ formatting 反映
- ✅ caption / label 表示
- 🔲 hidden exclusion UI

## Export
- ✅ Copy LaTeX

## Formatting
- ✅ decimal precision
- ✅ missing value style
- ✅ border template
- ✅ 出力環境（table / table*）
- 🔲 alignment template

## UI
- ✅ clean / academic / usable
- ✅ responsive minimum（mobile タブ切替）

## Development
- ✅ runnable
- ✅ regression zero
- ✅ feature branch
- 🔲 preview confirmed（Vercel deploy 待ち）

---

# 31. Claude Code 開始プロンプト

継続開発時：

```txt
前回の続きです。

SPECIFICATION.md を読み、現在の実装状況を確認してください。
（§30 の ✅ / 🔲 が現時点の状態です）

実装前に「今回変更する差分計画」を先に提示してください。
一括実装は禁止。PR-like に小さく進めてください。
Working state を維持し、npm run dev が常に動く状態で進めてください。
```
