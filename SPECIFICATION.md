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

# 13. 画面構成（固定）

基本レイアウト：

```txt
┌──────────────────────────────┐
│ Header                       │
├──────────────────────────────┤
│ Input | Preview | LaTeX      │
└──────────────────────────────┘
```

3パネル構成を基本とする。

---

## Desktop Layout

横幅十分：

```txt
┌────────┬────────┬────────┐
│ Input  │Preview │ LaTeX  │
└────────┴────────┴────────┘
```

---

## Mobile / Narrow Width

responsive：

```txt
Tabs
```

へ切替。

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
Academic Table Generator for Research Papers
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

を配置。

デモ・動作確認用途。

---

# 15. Input Panel（固定）

Input は：

> **複数入力方式**

を提供する。

---

## Input Modes

最低限：

```txt
1. Paste Table
2. CSV Upload
3. Manual Edit
```

---

### 1. Paste Table

対象：

* Excel
* PowerPoint
* Google Sheets
* TSV

形式：

```txt
A<TAB>B<TAB>C
1<TAB>2<TAB>3
```

を parser。

textarea 入力。

---

### 2. CSV Upload

対応：

```txt
.csv
.tsv
.txt
```

アップロード後：

自動 parse。

---

### 3. Manual Edit

空表から作成。

初期値：

```txt
3 columns
3 rows
```

論文向け default。

---

## Advanced Input（MVP後半）

対応：

### sklearn classification report

例：

```txt
precision
recall
f1-score
support
```

を検出。

自動整形。

---

### log parser

例：

```txt
Accuracy:
Precision:
Recall:
F1:
```

を抽出。

研究ログ対応。

experimental 扱い。

---

# 16. Table Editing（重要）

本ツールの中心機能。

目的：

> **LaTeXを書かずに表編集**

。

---

## 編集方式

### セル直接編集

Preview 上で：

> inline editing

可能にする。

Excel風。

ただし：

> spreadsheet 化は禁止。

必要最小限。

---

## Row Operations

行単位：

```txt
+ Add Row
Delete Row
Move Up
Move Down
```

---

## Column Operations

列単位：

```txt
+ Add Column
Delete Column
Rename Column
Move Left
Move Right
```

---

## Hide / Show

重要：

CSV 全部を使わない用途。

各：

```txt
row
column
cell
```

に：

```txt
show / hide
```

を持つ。

LaTeX 出力から除外。

---

## Style Editing

セルごと：

### Bold

```txt
Bold
```

↓

```latex
\textbf{}
```

化。

---

### Italic

```txt
Italic
```

↓

```latex
\textit{}
```

化。

---

### Alignment

選択：

```txt
left
center
right
```

---

## Border Editing

目的：

> 論文向け minimal border

。

デフォルト：

```txt
横線のみ
```

。

設定：

### Header separator

見出し後。

---

### Summary separator

合計前。

---

### Custom separator

任意位置。

---

### Vertical border

デフォルト：

```txt
OFF
```

。

必要時のみ。

---

# 17. Preview仕様（必須）

重要：

> **即時 Preview**

。

変更後：

```txt
< 300ms
```

以内更新目標。

---

## Preview表示

HTML Table。

目的：

> 出力イメージ確認

。

見た目：

```txt
論文風
```

。

最低限：

* zebra 不要
* clean border
* academic spacing

---

## Preview Source

禁止：

```txt
preview専用 state
```

。

必ず：

```txt
TableModel
```

から生成。

---

## Preview Features

表示：

### Caption

---

### Label

---

### Table body

---

### Alignment

---

### Bold / Italic

---

### Hidden items exclusion

---

# 18. Formatting Controls（重要）

論文向け微調整。

---

## Decimal Precision

設定：

```txt
Auto
0
1
2
3
4
```

例：

```txt
0.57142857
```

↓

```txt
0.5714
```

---

## Missing Value Handling

設定：

```txt
---
N/A
-
blank
```

論文向け。

---

## Table Environment

選択：

```txt
table
table*
```

初期：

```txt
table*
```

論文向け。

---

## Alignment Template

テンプレ：

```txt
Academic Default
Compact
Wide
```

---

## Border Template

テンプレ：

### Academic Default

```txt
top
header
summary
bottom
```

のみ。

推奨。

---

### Full Grid

全罫線。

---

### Minimal

上・下のみ。

---

# 19. LaTeX Generator（固定）

出力形式：

```latex
\begin{table*}[tb]
\caption{}
\label{}
\begin{center}
\begin{tabular}{}
...
\end{tabular}
\end{center}
\end{table*}
```

---

## 出力ルール

### Caption

空でも許可。

---

### Label

推奨：

```txt
tab:xxxx
```

。

---

### Alignment

自動生成：

例：

```txt
lcccc
```

。

---

### Escape Rule

特殊文字：

```txt
&
%
$
#
_
{
}
```

は escape。

---

### Bold

```latex
\textbf{}
```

。

---

### Italic

```latex
\textit{}
```

。

---

## Academic Default Output

デフォルト出力：

```txt
横線中心
論文向け
見出し＋合計のみ
```

。

目的：

> **提出可能品質のLaTeXを即出力**

。

---

# 20. Example Dataset（必須）

最低限：

### classification report sample

---

### benchmark sample

---

### log parser sample

---

### custom csv sample

を内蔵。

理由：

> 動作確認を容易化

。

---

# 21. MVP完成条件（固定）

以下を満たせば MVP 完了。

### Input

* Paste
* CSV Upload
* Manual

---

### Edit

* row/column add
* hide/show
* bold
* separator
* alignment

---

### Preview

* HTML Preview

---

### Export

* LaTeX copy

---

### Formatting

* decimal control
* missing value

---

### UI

* responsive minimum
* academic usable

---

## 非MVP（後回し）

❌ drag & drop
❌ spreadsheet 完全再現
❌ dark mode
❌ collaboration
❌ history system
❌ AI auto correction


# 22. Claude Code 実装ルール（重要）

本プロジェクトは：

> **Claude Code による段階実装**

を前提とする。

そのため：

> **暴走防止ルール**

を固定する。

---

## 最重要ルール

### 一度に大きく実装しない

禁止：

```txt id="m9gqvr"
全部一括実装
```

。

必ず：

```txt id="ydxvlv"
小さく実装
↓
確認
↓
commit
↓
次へ
```

。

---

### 差分計画を先に出す

Claude は：

> **実装前に変更差分計画を提示すること**

。

例：

```txt id="8eh3ur"
変更予定：

1. TableModel追加
2. parser追加
3. Preview追加

変更ファイル：
- src/lib/table/*
- src/components/*
- App.tsx（最小変更）
```

確認後に実装。

---

### 勝手な architecture 変更禁止

禁止：

```txt id="ybhl5f"
勝手な directory 変更
責務変更
巨大 refactor
state 管理変更
```

。

仕様に従うこと。

---

### App.tsx の変更最小化

原則：

> **minimal diff**

。

禁止：

```txt id="d9g3kt"
全面 rewrite
```

。

---

### shared 化の条件

原則：

> **2回以上使う場合のみ**

。

禁止：

```txt id="o1ux1m"
future proof utility
premature abstraction
```

。

---

### Working State 必須

途中終了時でも：

```txt id="jlwm8m"
npm run dev
```

で動作可能状態を維持。

---

### Broken State 禁止

禁止：

```txt id="rnvclj"
build error
compile error
placeholder implementation
TODOで放置
```

。

最低限：

> runnable

であること。

---

# 23. 実装フェーズ（固定）

本プロジェクトは：

> **PR-like incremental development**

で進める。

---

## PR-1: Project Setup

目的：

repository 初期構築。

内容：

```txt id="pclh5m"
Vite
TypeScript
Tailwind
shadcn/ui minimal
```

。

完了条件：

```txt id="5l79hn"
npm run dev
```

成功。

UI skeleton 表示。

---

## PR-2: TableModel

目的：

Single Source of Truth 作成。

内容：

```txt id="8b0m0d"
types.ts
TableModel
row/cell structure
```

。

完了条件：

dummy model render。

---

## PR-3: Basic Parser

目的：

入力系実装。

対象：

```txt id="sldl0d"
CSV
TSV
Paste
Manual
```

。

完了条件：

input → model 化成功。

---

## PR-4: Normalize Layer

目的：

内部整形。

内容：

```txt id="ulhyz9"
column count normalization
empty cell handling
number normalization
```

。

完了条件：

preview 安定。

---

## PR-5: HTML Preview

目的：

見ながら編集。

内容：

```txt id="8s1h7g"
table preview
inline editing
basic formatting
```

。

完了条件：

編集結果反映。

---

## PR-6: LaTeX Generator

目的：

コード出力。

内容：

```txt id="ckktza"
table
table*
caption
label
tabular
alignment
```

。

完了条件：

copyable latex。

---

## PR-7: Formatting Controls

目的：

研究用途向け調整。

内容：

```txt id="e20jlwm"
decimal precision
missing values
separator control
alignment
```

。

完了条件：

論文用途で利用可能。

---

## PR-8: Advanced Parser

目的：

研究ログ対応。

対象：

### sklearn classification report

CSV から：

```txt id="jmfjhf"
precision
recall
f1-score
support
```

抽出。

---

### benchmark report

複数 CSV 統合。

---

### log parser

ログ：

```txt id="hmrmq9"
Accuracy
Precision
Recall
F1
```

抽出。

experimental。

---

## PR-9: UI Polish

目的：

提出品質。

内容：

```txt id="mt0zbr"
spacing
responsive
button hierarchy
card cleanup
```

。

禁止：

```txt id="zt6rjb"
大規模 redesign
```

。

---

# 24. Git Workflow（固定）

## main branch 直接変更禁止

必須：

```txt id="xpjdr9"
feature/*
```

。

例：

```txt id="dn9k4u"
feature/parser
feature/preview
feature/latex-generator
```

。

---

## 実装手順

固定：

```txt id="1ws7xg"
branch 作成
↓
差分計画
↓
実装
↓
npm run dev
↓
manual confirm
↓
push
↓
preview deploy
```

。

---

## Commit Rule

推奨：

```txt id="0oc7zh"
feat:
fix:
refactor:
ui:
parser:
```

prefix。

例：

```txt id="vwrvgn"
feat(parser): add CSV parser
ui(preview): improve table editor
```

。

---

# 25. Preview Deployment（固定）

Vercel Preview を必須化。

フロー：

```txt id="kg6smm"
push
↓
preview url
↓
manual confirm
↓
merge decision
```

。

重要：

> preview を見ず merge 禁止

。

---

# 26. Error Handling

エラー時：

> 落ちないこと

を優先。

---

## CSV Parse Error

表示：

```txt id="h8mztz"
CSV parsing failed
Please check file format.
```

。

---

## Invalid Table

表示：

```txt id="bdm4a7"
Invalid table structure detected.
```

。

---

## Empty Input

許可。

初期 table 表示。

---

# 27. Performance Target

MVP 目標：

### Preview update

```txt id="1jq0g9"
<300ms
```

。

---

### CSV parse

```txt id="5wllw3"
<2sec
```

。

---

### Table size

最低：

```txt id="d98rli"
100 rows
20 columns
```

対応。

---

# 28. 将来統合戦略（重要）

目的：

将来的に

```txt id="8o13ww"
citation-bibtex-converter
```

へ統合。

---

## 統合方法

禁止：

```txt id="st4a9o"
repository merge
```

。

必ず：

> transplant（移植）

。

例：

```txt id="nrz55q"
src/lib/table/
components/TableComposer/
```

のみ移植。

---

## 統合先想定

将来：

```txt id="5vf0pi"
src/features/table/
```

化。

---

## UI統合方針

Citation ⇄ BibTeX Converter の：

```txt id="8xyr8u"
layout
spacing
button style
card design
```

へ寄せる。

---

## Dependency Policy

禁止：

```txt id="4bryud"
repo固有依存
tight coupling
```

。

理由：

移植容易化。

---

# 29. Non-goals（重要）

本プロジェクトは：

以下を目指さない。

---

### spreadsheet 完全再現

Excel clone 化禁止。

---

### WYSIWYG editor

不要。

---

### full Overleaf replacement

不要。

---

### collaborative editing

不要。

---

### AI auto formatting

後回し。

---

### citation manager 統合

別プロジェクト。

---

# 30. Acceptance Criteria（完成条件）

以下を満たせば：

> MVP 完成

とする。

---

## Input

以下対応：

* Paste
* CSV Upload
* Manual Table

---

## Edit

以下可能：

* add/remove row
* add/remove column
* hide/show
* bold
* italic
* alignment
* separator

---

## Preview

以下表示：

* HTML table
* caption
* label
* hidden exclusion

---

## Export

以下可能：

```txt id="2jq0fx"
Copy LaTeX
```

成功。

---

## Formatting

以下対応：

* decimal precision
* missing value style
* border template
* alignment template

---

## UI

以下満たす：

```txt id="pmjlwm"
clean
academic
usable
responsive minimum
```

。

---

## Development

以下満たす：

```txt id="m4p5ev"
runnable
regression zero
feature branch
preview confirmed
```

。

---

# 31. Claude Code 開始プロンプト

初回開始時：

```txt id="7lyj7l"
前回の続きです。

SPECIFICATION.md に従って実装してください。

まずは repository structure を確認し、
Reference Repository
(https://github.com/Axe0320/citation-bibtex-converter)
の UI と architecture を確認してください。

その後、

「今回変更する差分計画」

を先に提示してください。

一括実装は禁止。
PR-like に小さく進めてください。

Working state を維持し、
npm run dev が常に動く状態で進めてください。

最初は PR-1（Project Setup）から開始してください。
```
