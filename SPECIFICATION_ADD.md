````md
# SPECIFICATION_ADD.md

**Project:** latex-table-composer  
**Version:** vNext (Post-MVP Expansion)  
**Target:** PR-10 ～ PR-14  
**Status:** Implementation Specification  
**Language:** TypeScript / React / Vite / Tailwind  
**Execution:** Client-side only（DB不要）

---

# 1. 目的

本仕様は `latex-table-composer` の **MVP（PR-1〜9）完了後拡張仕様** を定義する。

目的：

> **研究論文で実際に使える LaTeX table editor を完成させる**

現在：

```txt
Paste → Parse → Preview → LaTeX export
````

中心。

拡張後：

```txt
Create
Edit
Format
Annotate
Merge
Export
```

までを一貫して行えるようにする。

---

# 2. スコープ

## 対象

```txt
PR-10 行列編集
PR-11 Editing UX
PR-12 Multi-source Merge
PR-13 Booktabs正式対応
PR-14 Excel / PowerPoint最適化
```

## 対象外

```txt
Citation ⇄ BibTeX Converter 統合
database
authentication
server-side rendering
multirow
multicolumn
collaboration
```

---

# 3. 設計原則（固定）

## 3.1 Single Source of Truth

常に：

```ts
TableModel
```

のみを真実のデータとする。

### 禁止

```txt
Preview state
LaTeX state
editor local state
```

の重複管理。

### 構造

```txt
Input
 ↓
Parse
 ↓
Normalize
 ↓
TableModel
 ↓
Preview / Generator
```

---

## 3.2 Preview = LaTeX 一致

重要原則：

> Preview と LaTeX 出力は常に一致する

つまり：

```txt
Decimal precision
Missing value
Alignment
Bold
Italic
Underline
Background
Border
```

は **即座に Preview に反映**。

---

## 3.3 Reference UI Philosophy

UI は以下 repo の思想に寄せる：

```txt
Citation ⇄ BibTeX Converter
```

### 特徴

* clean card UI
* subtle shadow
* accent purple
* max-width layout
* compact controls
* mobile responsive

---

# 4. 完成目標

以下レベルの論文表を作成可能にする：

```latex
\begin{table*}[tb]
\begin{center}
\begin{threeparttable}
...
\textbf{}
\textit{}
\underline{}
\tnote{}
\hline
...
\end{threeparttable}
\end{center}
\end{table*}
```

研究論文向け：

* NLP
* ML
* CV
* HCI
* Systems
* Web3 / AI

を想定。

---

# 5. ファイル構造（完成形）

```txt
src/
├── components/
│   ├── InputPanel.tsx
│   ├── PreviewPanel.tsx
│   ├── LatexPanel.tsx
│   ├── FormattingBar.tsx
│   ├── TableEditorToolbar.tsx
│   ├── RowControls.tsx
│   ├── ColumnControls.tsx
│   ├── NoteEditor.tsx
│   ├── MergePanel.tsx
│   └── CreateTableDialog.tsx
│
├── lib/
│   └── table/
│
│       ├── types.ts
│
│       ├── parser/
│       │   ├── detect.ts
│       │   ├── parseTSV.ts
│       │   ├── parseCSV.ts
│       │   ├── parseClassificationReport.ts
│       │   ├── parseLog.ts
│       │   └── index.ts
│
│       ├── normalize/
│       │   ├── normalizeTable.ts
│       │   └── index.ts
│
│       ├── generators/
│       │   └── latexGenerator.ts
│
│       ├── editor/
│       │   ├── addRow.ts
│       │   ├── deleteRow.ts
│       │   ├── addColumn.ts
│       │   ├── deleteColumn.ts
│       │   ├── updateCellStyle.ts
│       │   ├── updateBorder.ts
│       │   └── selection.ts
│
│       ├── formatting/
│       │   ├── options.ts
│       │   ├── formatValue.ts
│       │   └── background.ts
│
│       ├── merge/
│       │   ├── sourceStack.ts
│       │   ├── mergeTables.ts
│       │   └── conflictResolver.ts
│
│       └── notes/
│           ├── noteRegistry.ts
│           └── noteGenerator.ts
│
└── App.tsx
```

---

# 6. TableModel 拡張仕様

`types.ts`

拡張：

```ts
type TableCellStyle = {
  bold?: boolean
  italic?: boolean
  underline?: boolean
  backgroundColor?: string
}

type TableCell = {
  id: string
  value: string
  align?: 'left' | 'center' | 'right'
  hidden?: boolean
  style?: TableCellStyle
  noteMarker?: string
}

type BorderStyle =
  | 'none'
  | 'hline'
  | 'booktabs-midrule'

type TableRow = {
  id: string
  rowType: 'header' | 'normal' | 'summary'

  cells: TableCell[]

  separatorTop?: boolean
  separatorBottom?: boolean

  topBorder?: BorderStyle
  bottomBorder?: BorderStyle
}

type TableNote = {
  id: string
  marker: string
  text: string
}

type TableModel = {
  id: string

  title: string
  label: string

  environment: 'table' | 'table*'

  rows: TableRow[]

  notes: TableNote[]
}
```

---

# 7. PR-10 行列編集

## 目的

TablesGenerator ライクな編集体験を実現する。

---

## 7.1 行追加

### UI

```txt
＋
```

位置：

各行の上下。

### 動作

```txt
insert row above
insert row below
```

新規 row：

```txt
normal row
```

で生成。

UUID：

```ts
crypto.randomUUID()
```

使用。

---

## 7.2 行削除

### UI

```txt
－
```

header 行削除は禁止。

---

## 7.3 列追加

ヘッダー上：

```txt
Dataset [+][-]
```

### 位置指定

```txt
left
right
```

---

## 7.4 列削除

列全体削除。

確認ダイアログ：

```txt
Delete this column?
```

を表示。

---

## 7.5 Create Table Mode

Input 以外に：

```txt
Create Table
```

モード追加。

### 初期設定

```txt
Rows: 3
Cols: 4
```

### 生成

空テーブル。

そこから編集開始。

---

## 7.6 Border Editing

途中：

```latex
\hline
```

挿入可能。

### 行ごとの border editor

```txt
None
HLine
Booktabs Midrule
```

を選択可能。

これにより：

```latex
row A
row B
\hline
row C
```

のような途中区切りが可能になる。

---

```
```
````md
# 8. PR-11 Editing UX

## 目的

編集体験を研究論文向けに強化する。

単なる：

```txt
cell text editing
````

ではなく、

```txt
style editing
selection editing
formatted/raw editing
```

を可能にする。

---

## 8.0 PR-10 からの改良項目（必須）

PR-10 実装後に確認された以下の問題を PR-11 で対処する。

---

### 8.0.1 行列操作ボタンの視認性改善

**現状：**

PR-10 の行列操作ボタンは `18-20px / 0.55rem` で実装されており、小さく見づらい。

**PR-11 での対処：**

`TableEditorToolbar` コンポーネントを Preview 上部に追加する。

```txt
┌──────────────────────────────────┐
│ [＋行] [－行] │ [＋列] [－列]     │  ← TableEditorToolbar
├──────────────────────────────────┤
│ Preview                           │
└──────────────────────────────────┘
```

ツールバーのボタンは通常サイズ（32px 以上）とし、
hover 依存の小ボタンと併用できるようにする。

---

### 8.0.2 列操作を Preview 外からも実行可能にする

**現状：**

列操作ボタンは Preview 内のヘッダー上部にのみ存在し、
ホバーしないと表示されない。

**PR-11 での対処：**

`TableEditorToolbar` に列操作ボタンを配置する。

```txt
[＋列（左）] [－列] [＋列（右）]
```

選択列に対して操作できるようにする。

---

### 8.0.3 最終行・最終列への常設追加・削除ボタン

**現状：**

最終行を追加するには最終行にホバーして `＋↓` を押す必要があり、
直感的でない。削除も同様にホバー依存である。

**PR-11 での対処：**

テーブルの下部・右端に追加ボタンを、
各行・各列の末尾に削除ボタンを常設する。

```txt
┌─────────────────────────────────┐
│      │ Col1  │ Col2  │ Col3  [－]│  ← 列末尾の常設削除ボタン
│ [－] │ row1  │  ...  │       [＋]│  ← 列末尾の常設追加ボタン
│ [－] │ row2  │  ...  │          │  ← 行ごとの常設削除ボタン
├─────────────────────────────────┤
│ [＋ 行を追加]                    │  ← 行末尾の常設追加ボタン
└─────────────────────────────────┘
```

常設ボタンの仕様：

* 行削除 `[－]`：各行の左端に常設。header 行は非表示。
* 行追加 `[＋ 行を追加]`：テーブル直下に常設。
* 列削除 `[－]`：各列ヘッダーの上部に常設（confirm ダイアログあり）。
* 列追加 `[＋]`：テーブル右端に常設。

ホバー依存の小ボタンと**併存**する。用途に応じて使い分け可能。

---

## 8.1 formatted / raw editing

### 方針

編集モードを追加：

```txt
Formatted
Raw
```

。

### Formatted Mode（default）

表示：

```txt
0.9240
```

（decimal precision 反映済み）

編集：

```txt
0.9240 → 0.92
```

で反映。

---

### Raw Mode

生値を編集：

```txt
0.924012
```

。

Formatting は無視。

目的：

> precision loss 回避

。

---

## 8.2 Selection Editing

### 方針

drag selection は採用しない。

代わりに：

```txt
click select
shift multi select
```

を採用。

理由：

実装コストを抑えつつ、

論文用途では十分だから。

---

### 選択状態

セル：

```ts
selected?: boolean
```

。

複数選択可能。

---

### Selection Toolbar

表示：

```txt
[B] [I] [U]
[BG]
[Align]
[Hide]
```

。

選択セルへ一括適用。

---

## 8.3 太字・斜体・下線

### UI

Word風：

```txt
[B]
[I]
[U]
```

。

### 内部構造

```ts
style?: {
  bold?: boolean
  italic?: boolean
  underline?: boolean
}
```

。

---

### LaTeX 出力

#### bold

```latex
\textbf{...}
```

。

#### italic

```latex
\textit{...}
```

。

#### underline

```latex
\underline{...}
```

。

---

### ネスト順序

統一：

```latex
\underline{
  \textit{
    \textbf{...}
  }
}
```

。

順番固定。

---

## 8.4 セル背景色

### 目的

研究論文：

```txt
best result
second-best
ablation
comparison
```

を可視化。

---

### UI

選択肢：

```txt
None
Gray
Green
Blue
Yellow
Red
```

。

初版は preset のみ。

custom color picker は対象外。

---

### 内部構造

```ts
backgroundColor?: string
```

。

---

### LaTeX 出力

必要 package：

```latex
\usepackage[table]{xcolor}
```

。

生成：

```latex
\cellcolor{gray!20}
```

。

例：

```latex
\cellcolor{green!20}
\textbf{0.9646}
```

。

---

## 8.5 Alignment Editing

セル単位 alignment 編集。

### UI

```txt
L
C
R
```

。

内部：

```ts
align:
'left'
'center'
'right'
```

。

---

## 8.6 Column Visibility

### UI

列単位：

```txt
👁
```

。

hidden：

```ts
hidden: true
```

。

---

### Preview

非表示。

---

### LaTeX

出力対象外。

---

## 8.7 Preview 即時反映（固定）

重要：

Formatting変更は

**即座に Preview に反映**。

つまり：

```txt
decimal precision
missing value
background
bold
italic
underline
alignment
visibility
```

は：

```txt
state update
↓
Preview update
↓
LaTeX update
```

を即時同期。

禁止：

```txt
Apply button
Save button
```

。

リアルタイム反映のみ。

---

## 8.8 Done Definition

完了条件：

### B/I/U

動作。

### background

動作。

### multiple select

動作。

### Preview

LaTeX と一致。

### hidden

正しく除外。

### formatted/raw

切替動作。

### build

```bash
npm run build
```

成功。

---

```
```
````md
# 9. PR-12 Multi-source Merge

## 目的

複数ソースから table を統合可能にする。

例：

```txt
Gemini output
+
benchmark CSV
+
classification report
+
experiment log
````

↓

```txt
single publication-ready table
```

へ統合。

---

## 9.1 採用方針

### Source Stack 方式（採用）

構造：

```txt
Source A
Source B
Source C
```

を stack 管理。

ユーザーが：

```txt
merge
append
replace
```

を選択。

理由：

最も破壊的変更が少なく、

研究用途で扱いやすいため。

---

## 9.2 Source Model

新規：

```ts
type TableSource = {
  id: string
  name: string
  sourceType:
    | 'csv'
    | 'tsv'
    | 'classification-report'
    | 'log'
    | 'manual'

  model: TableModel
}
```

。

管理：

```ts
type SourceStack = {
  sources: TableSource[]
}
```

。

---

## 9.3 Merge UI

### パネル追加

新規：

```txt
Merge Sources
```

。

表示：

```txt
Benchmark CSV
Classification Report
Experiment Log
```

。

---

### Merge Actions

#### Append Rows

```txt
A
↓
B rows append
```

。

用途：

```txt
benchmark追加
ablation追加
```

。

---

#### Append Columns

```txt
A + B
```

列方向結合。

用途：

```txt
Metric追加
Score追加
```

。

---

#### Replace

既存置換。

---

## 9.4 Merge Rules

### Append Rows

列数不一致：

最大列数へ normalize。

不足：

```txt
blank
```

補完。

---

### Append Columns

行数不一致：

空セル追加。

---

### Header Conflict

競合：

```txt
Accuracy
ACC
```

。

UI確認：

```txt
Keep A
Keep B
Rename
```

。

---

## 9.5 Conflict Resolver

新規：

```txt
Conflict Resolver
```

。

ケース：

### column mismatch

### duplicated header

### incompatible alignment

### duplicated note marker

。

---

## 9.6 Preview

merge 後：

即 Preview 更新。

---

## 9.7 Example Workflow

### before

CSV：

```txt
Dataset Model Accuracy
```

。

Log：

```txt
Precision: 0.91
Recall: 0.92
```

。

---

### after merge

```txt
Dataset
Model
Accuracy
Precision
Recall
```

統合表。

---

## 9.8 Done Definition

### append row

動作。

### append column

動作。

### replace

動作。

### conflict resolver

動作。

### preview sync

動作。

### build

```bash
npm run build
```

成功。

---

```
```
````md
# 10. PR-13 Booktabs正式対応

## 目的

現在の：

```latex
\hline
````

中心の出力から、

論文投稿品質の：

```latex
booktabs
```

正式対応へ移行する。

対象：

```txt
ACL
EMNLP
NeurIPS
ICML
ICLR
CHI
IEEE
Springer
Elsevier
```

等。

---

## 10.0 PR-10 からの引き継ぎ事項（必須）

### midrule の現状動作と PR-13 での正式対応

**現状（PR-10 実装時点）：**

行単位の Border 設定で `midrule` を選択しても、
LaTeX 出力は `\hline` と同じになる。

```ts
// latexGenerator.ts（PR-10 時点の暫定実装）
if (row.bottomBorder === 'hline' || row.bottomBorder === 'midrule') return true
// → どちらも \hline を出力
```

Preview でも `hline` と視覚的区別なし（同じ細線）。

**理由：**

booktabs パッケージ（`\toprule` / `\midrule` / `\bottomrule`）の
正式対応は PR-13 で実施予定のため、PR-10 では暫定的に `\hline` で代替。

**PR-13 での正式対応内容：**

1. `BorderStyle = 'midrule'` → LaTeX 出力 `\midrule` に変更
2. Preview でも `midrule`（細線）と `hline`（標準線）を視覚的に区別
3. `\usepackage{booktabs}` を自動付加

**ユーザーへの影響：**

PR-10 の時点で `midrule` を設定しておけば、
PR-13 適用後に自動的に正しい `\midrule` 出力に切り替わる。
**再設定は不要。**

---

## 10.1 方針

初期状態：

```txt
Academic
```

は維持。

ただし内部実装を：

```txt
hline based
↓
booktabs based
```

へアップグレードする。

### 原則

論文用途では：

```txt
縦線なし
booktabs
```

を推奨。

---

## 10.2 Border Template 拡張

現在：

```txt
Academic
Full Grid
Minimal
```

。

変更後：

```txt
Academic (Booktabs)
Classic (HLine)
Full Grid
Minimal
```

。

---

### Academic (Booktabs)

出力：

```latex
\toprule
Header
\midrule
Body
\midrule
Summary
\bottomrule
```

。

用途：

> 学術論文の標準

。

---

### Classic (HLine)

現行維持。

出力：

```latex
\hline
```

。

後方互換保持。

---

### Full Grid

全行：

```latex
\hline
```

。

用途：

```txt
授業資料
内部共有
PowerPoint
```

。

---

### Minimal

上下のみ。

出力：

```latex
\toprule
...
\bottomrule
```

。

---

## 10.3 BorderStyle 拡張

追加：

```ts
type BorderStyle =
  | 'none'
  | 'hline'
  | 'toprule'
  | 'midrule'
  | 'bottomrule'
```

。

---

## 10.4 行単位 Border Editor

### UI

各行左：

```txt
≡
```

border menu。

選択：

```txt
None
HLine
Midrule
Toprule
Bottomrule
```

。

---

### 使用例

例：

```txt
Method
---
Gemini
GPT
---
Our Method
```

。

↓

```latex
\toprule
Method ...
\midrule
Gemini ...
GPT ...
\midrule
Our Method ...
\bottomrule
```

。

---

## 10.5 booktabs package

自動判定：

booktabs 使用時：

```latex
\usepackage{booktabs}
```

必要。

出力欄上部に：

```txt
Required Packages
```

表示。

例：

```latex
\usepackage{booktabs}
\usepackage[table]{xcolor}
\usepackage{threeparttable}
```

。

---

## 10.6 Border Preview

Preview 側も一致。

### 表示

#### toprule

太線。

#### midrule

細線。

#### bottomrule

太線。

#### hline

標準線。

---

## 10.7 Drag Border Editing（採用しない）

今回：

```txt
drag line editing
```

は不採用。

理由：

### 実装複雑度が高い

### React table selection と衝突

### 論文用途では過剰

代替：

```txt
row-level border menu
```

で十分。

---

## 10.8 Done Definition

### booktabs export

動作。

### Preview sync

一致。

### row border editor

動作。

### package detection

動作。

### build

```bash
npm run build
```

成功。

---

```
```
````md
# 11. PR-14 Excel / PowerPoint Paste 最適化

## 目的

実運用で最も多い：

```txt
Excel
Google Sheets
PowerPoint
Word
論文PDF
LLM出力
````

からのコピペを壊れず扱えるようにする。

加えて：

```txt
footnote
tnote
manual table creation
```

まで対応し、

> 「このツールだけで論文表を完成」

を目指す。

---

# 11.1 Paste Optimization

## 方針

現在：

```txt
TSV / CSV
classification report
log
```

対応。

PR-14 では：

```txt
real-world clipboard
```

最適化を追加する。

---

## 11.2 Excel Paste 最適化

### 問題

Excel コピペ：

```txt
末尾空列
空行
hidden tab
```

が混入。

---

### 対応

normalize 強化：

#### trailing empty column remove

既存維持。

#### duplicated empty rows remove

追加。

#### whitespace normalize

追加：

```txt
full-width space
tab
multiple spaces
```

を整理。

#### numeric inference 強化

以下：

```txt
25.6M
1,024
98%
```

も数値候補として扱う。

---

### 例

入力：

```txt
Dataset	Model	Acc	F1
CIFAR	ResNet	0.9531	0.9524
```

。

そのまま：

```txt
parse → preview
```

可能。

---

## 11.3 PowerPoint Paste 最適化

### 問題

PowerPoint 表コピー：

列区切りが不安定。

改行崩れ。

---

### 対応

heuristic parser 追加。

優先順位：

```txt
tsv
ppt-table
classification
log
csv
```

。

---

### ppt-table detect

条件：

```txt
space-aligned columns
```

検出。

---

### 例

入力：

```txt
Method       Accuracy     F1
Gemini       0.9184       0.8889
GPT          0.9592       0.9646
```

。

↓

自動列推定。

---

## 11.4 LLM Markdown Table Parser

追加。

対応：

```md
| Method | Accuracy |
|---------|----------|
| GPT     | 0.92     |
```

。

自動 parse。

---

# 11.5 Manual Table Creation Mode

## 目的

Input なしでも：

```txt
0から表作成
```

可能にする。

---

## UI

Header：

```txt
Create Table
```

ボタン。

---

### Dialog

入力：

```txt
Rows
Columns
```

。

例：

```txt
4 rows
5 cols
```

。

---

### 出力

空テーブル：

```txt
editable table
```

生成。

そのまま編集可能。

---

### 初期 header

デフォルト：

```txt
Column 1
Column 2
...
```

。

---

# 11.6 表注釈（Footnote / TNote）

## 目的

論文表：

```latex
\tnote{}
\footnotemark
```

対応。

---

## 方針

初版：

```txt
threeparttable
```

採用。

---

## TableNote Model

追加：

```ts
type TableNote = {
  id: string
  marker: string
  text: string
}
```

。

---

## Cell Note

セル：

```ts
noteMarker?: string
```

。

例：

```txt
[b]
[c]
[*]
```

。

---

## UI

セル選択：

```txt
Add Note
```

。

入力：

```txt
marker
note text
```

。

---

### 表示

Preview：

```txt
Geminiᵇ
```

のように superscript。

---

## LaTeX 出力

自動：

```latex
\begin{threeparttable}
...
Gemini\tnote{b}
...
\begin{tablenotes}
\item[b] Accuracy reported...
\end{tablenotes}
\end{threeparttable}
```

。

---

## package detection

必要時：

```latex
\usepackage{threeparttable}
```

追加。

---

# 11.7 multirow / multicolumn（今回は不採用）

理由：

### UI複雑度が急増

### merge設計が大幅変更

### selection実装が難化

### 論文初版で優先度低

---

### 将来対応余地

別PR：

```txt
Advanced Cell Merge
```

として切り出し可能。

---

# 11.8 TablesGenerator 反映要素

採用：

### 行列追加

```txt
+
-
```

編集。

---

### Alignment

```txt
L C R
```

。

---

### Border Editing

```txt
hline
midrule
toprule
bottomrule
```

。

---

### Cell Formatting

```txt
bold
italic
underline
background
```

。

---

### Hidden Column

列非表示。

---

### Manual Table Creation

0から表作成。

---

### Notes

```txt
tnote
footnote
```

。

---

### Real-time Preview

即反映。

---

## 見送り

### drag resize

理由：

Tailwind table 実装複雑。

---

### drag border editing

row menuで代替。

---

### merged cells

別PR。

---

### custom color picker

preset で十分。

---

### Excel export

優先度低。

---

# 11.9 Done Definition

以下が可能：

### Excel paste

正常。

### PowerPoint paste

正常。

### markdown table parse

正常。

### manual create

正常。

### notes

正常。

### preview sync

正常。

### package auto detect

正常。

### build

```bash
npm run build
```

成功。

---

# 12. 実装順序（固定）

順序：

```txt
PR-10 行列編集
↓
PR-11 Editing UX
↓
PR-12 Multi-source Merge
↓
PR-13 Booktabs正式対応
↓
PR-14 Paste最適化 + Notes
```

禁止：

```txt
飛ばし実装
大規模同時変更
```

。

理由：

> regression zero

維持のため。

---

# 13. 非目標（固定）

以下は対象外：

```txt
database
backend
login
cloud sync
collaborative editing
real-time multiuser
citation-bibtex integration
multirow
multicolumn
```

。

すべて：

```txt
client-side only
```

で完結する。

```
```
