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
# 11. PR-14 File Upload + Source Manager + Clipboard Optimization

## 方針変更（重要）

旧方針：貼り付け中心の最適化
新方針：**ファイルアップロード中心の UX** に変更

理由：
- 実研究では TSV 手打ちより CSV / Excel ファイルを直接扱うケースが圧倒的に多い
- benchmark.csv / result.xlsx / classification_report.txt を直接ロードしたい
- 旧 MergePanel の「貼り付け → Stack」は UX 的に弱い

---

## 目的

CSV / TSV / TXT / Excel ファイルを直接読み込み可能にし、
MergePanel を Source Manager（複数データソース管理）へ変更する。

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

# 11.1 File Upload（主テーブル）

## 目的

Header に `[Upload File]` ボタンを追加し、ファイルを直接読み込んで主テーブルに設定する。

## 対応形式

```txt
.csv
.tsv
.txt
.xlsx
.xls
```

## 仕様

- Upload 後、自動 parse → `setModel()`（Replace 相当）
- テキスト系（.csv/.tsv/.txt）：`FileReader.readAsText()` → 既存 `parseInput()` 流用
- Excel（.xlsx/.xls）：SheetJS（xlsx ライブラリ）で読み込み → `normalizeTable()` 経由
- Selection は clear（PR-12 と同方針）

## Excel 実装

```ts
import * as XLSX from 'xlsx'

const workbook = XLSX.read(arrayBuffer)
const worksheet = workbook.Sheets[workbook.SheetNames[0]]
const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
// → string[][] として normalizeTable() に渡す
```

---

# 11.2 MergePanel を Source Manager へ変更

## 方針

旧 MergePanel（貼り付け → Stack）を廃止し、**Upload 中心の Source Manager** に変更する。

手入力 textarea / source name 入力 は廃止。

## 新 UI

```txt
┌────────────────────────────────────┐
│ Merge Sources                  [×] │
├────────────────────────────────────┤
│ [Upload Source File]               │
│ CSV / TSV / XLSX / TXT             │
├────────────────────────────────────┤
│ Source Stack                       │
│─────────────────────────────────── │
│ 📄 benchmark.csv (4×12)            │
│ [↓ Append Rows] [→ Append Cols]    │
│ [Replace] [✕]                      │
│─────────────────────────────────── │
│ 📄 results.xlsx (6×20)             │
│ [↓ Append Rows] [→ Append Cols]    │
│ [Replace] [✕]                      │
└────────────────────────────────────┘
```

## 仕様

- ファイル名を source name に自動利用
- 手入力 name UI は不要
- Upload → 自動 parse → Source Stack に追加
- Merge 操作（Append / Replace）は PR-12 実装を維持

---

# 11.3 Clipboard Optimization（Excel / PowerPoint）

## Paste 時の優先順位

1. HTML Table（`text/html` MIME）
2. TSV（`text/plain` にタブ含む）
3. Plain text（既存 detect 流用）

## 実装

```ts
textarea.onPaste = (e) => {
  const html = e.clipboardData?.getData('text/html')
  if (html) {
    const rows = parseHTMLTable(html)
    if (rows) {
      e.preventDefault()
      setText(rows.map(r => r.join('\t')).join('\n'))
      return
    }
  }
  // fallthrough: default paste → existing detect/parse pipeline
}
```

## 対象

- Excel コピー（HTML table が clipboard に含まれる）
- PowerPoint 表コピー
- Google Sheets コピー
- LLM Markdown テーブル出力（`| col | col |` 形式）→ HTML 変換後にパース

---

# 11.4 LLM Markdown Table Parser

対応形式：

```md
| Method | Accuracy |
|--------|----------|
| GPT    | 0.92     |
```

`parseHTMLTable` が失敗した場合のフォールバックとして実装。

または detect に 'markdown-table' を追加。

---

# 11.5 Manual Table Creation Mode（実装済み）

Create Table ボタン（PR-10 で実装済み）。仕様変更なし。

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

### File Upload（主テーブル）

.csv / .tsv / .txt / .xlsx / .xls を Upload → parse → Preview に反映。

### MergePanel Source Manager

Upload → Source Stack → Append/Replace が動作。

### Clipboard Optimization

Excel / Google Sheets コピー時に HTML Table 優先パース。

### Markdown Table Parse

`| col |` 形式を parse 可能。

### preview sync

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
PR-14 File Upload + Source Manager + Clipboard Optimization
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

---

````md
# 13. PR-15: UI Redesign + Caption + Annotation

## 概要

本 PR は以下を目的とする：

1. Input / Upload / Create / Merge を Input Panel に統合
2. Alignment UI をアイコン化
3. Caption / Label のインライン編集
4. Table Annotation（tnote / tablenotes / threeparttable）対応
5. Edit mode UX の改善

本 PR により、論文投稿レベルの表作成体験へ近づける。

---

# 15A. Input Panel 統合

## 背景

現状：

* Header に機能ボタンが散在（Create Table / Upload File / Merge）
* MergePanel が独立
* Create Table が dialog
* Input パネルの CSV / Manual タブが未実装

これを Input panel に統合する。

---

## 新 UI

### Input tabs

```txt
┌──────────────────────────────────────┐
│ [Paste] [Upload] [Create] [Merge]    │
├──────────────────────────────────────┤
│ （各タブ内容）                        │
└──────────────────────────────────────┘
```

### タブ構成

| タブ    | 内容                          |
| ------ | ---------------------------- |
| Paste  | 既存 textarea（clipboard 最適化含む） |
| Upload | ファイルアップロード（PR-14 移植）         |
| Create | 空テーブル作成（Dialog 廃止）            |
| Merge  | Source Stack 管理（PR-14 MergePanel 移植）|

---

## Header の変更

### 削除

```txt
[Create Table]
[Upload File]
[Merge]
```

### 維持

```txt
[Load Example]
[Copy LaTeX]
```

---

## Edit mode 時の Input

### 変更前

Input panel を完全非表示。

### 変更後

Collapse 方式に変更。

```txt
Desktop

┌─────────┬──────────────────────┐
│ Input   │ Preview / Edit       │
│ [<<]    │                      │
└─────────┴──────────────────────┘
```

### 動作

* Preview mode：Input 展開状態
* Edit mode：自動 collapse（初回のみ）
* `[>>]` でいつでも再表示可能

---

## Create Table（Dialog 廃止）

Create タブ UI：

```txt
Rows: [4]
Cols: [5]

[Create Table]
```

Create 時：
1. createEmptyTable(rows, cols)
2. setModel()
3. Edit mode に切替
4. Input panel collapse

---

## Merge（Input タブ内移植）

MergePanel をそのまま Input の Merge タブ内に移植。
Replace は必ず `window.confirm()`。

---

# 15B. Caption / Label + Toolbar UX

## Alignment アイコン化

### 変更前

```txt
[L][C][R]
```

### 変更後

Word / Google Docs 型アイコン。inline SVG で実装。currentColor 対応。

```txt
[←≡]   左揃え
[≡≡]   中央揃え
[≡→]   右揃え
```

---

## Caption / Label 編集

PreviewPanel の sticky ヘッダー内に常設フィールドを追加。

```txt
┌──────────────────────────────────┐
│ Caption: [___________________]   │
│ Label:    [___________________]  │
├──────────────────────────────────┤
│ table                            │
└──────────────────────────────────┘
```

### Label

`tab:` は強制しない。placeholder のみ（`tab:accuracy_result`）。
値は完全自由入力。

### 更新方式

```txt
onChange → 300ms debounce → setModel()
```

onBlur 廃止。Preview / LaTeX 即時同期。

---

# 15C. Table Annotation

## 目的

論文表の注釈（tnote / tablenotes / threeparttable）対応。

---

## 型変更

### TableNote（新規）

```ts
type TableNote = {
  id: string
  marker: string
  text: string
}
```

### TableCell（追加）

```ts
noteMarkers?: string[]   // 複数注釈対応 \tnote{a,b}
```

### TableModel（追加）

```ts
notes: TableNote[]   // default: []
```

既存互換維持（notes 未定義 → []）。

---

## Toolbar

選択セル時に `[Attach Note]` ボタンを有効化。

---

## 注釈 UI（PreviewPanel 下部）

```txt
Notes

[a] [___________________] [✕]
[b] [___________________] [✕]

[+ Add Note]
```

### Add Note

自動採番（a → b → c → … → *）。

### Attach

セル選択状態で `[Attach Note]` → marker 選択。

---

## Preview 表示

```html
Gemini<sup>a</sup>
GPT<sup>b</sup>
```

---

## LaTeX 出力

### セル

```latex
Gemini\tnote{a}
Gemini\tnote{a,b}   ← 複数
```

### Wrapper 条件

以下いずれかで `threeparttable` ラッパーを有効化：

* セルに `noteMarkers` が存在する
* `notes.length > 0`

### 出力例

```latex
% Required Packages:
% \usepackage{booktabs}
% \usepackage{threeparttable}

\begin{threeparttable}
\begin{tabular}{lrr}
\toprule
Method & Acc & F1 \\
\midrule
Gemini\tnote{a} & 0.924 & 0.911 \\
GPT\tnote{b} & 0.952 & 0.946 \\
\bottomrule
\end{tabular}
\begin{tablenotes}
\item[a] Accuracy reported on test set.
\item[b] Averaged over 3 runs.
\end{tablenotes}
\end{threeparttable}
```

注釈なし時は従来通り（threeparttable なし）。

---

# 実装順序

```txt
15A: Input 統合（Header 簡略化 + タブ化 + collapse）
↓
15B: Caption/Label + Alignment アイコン
↓
15C: Annotation（型変更 + generator 改修）
```

---

# バックアップポイント

```txt
git tag pre-pr15          ← 実装開始前（作成済み）
git tag pr-15a-complete   ← 15A 完了後
git tag pr-15b-complete   ← 15B 完了後
git tag pre-pr15c-types   ← 15C 開始前（型変更前）
```

---

# Regression Requirements

* parse pipeline を壊さない
* Merge / Upload / selection state を維持（PR-12〜14）
* zoom 環境で崩れない
* annotation 未使用時は LaTeX 出力完全互換
* `notes: []` デフォルトで既存 model との互換維持

---

# 変更ファイル一覧（予定）

## 15A

| ファイル | 変更内容 |
|---------|---------|
| `src/App.tsx` | Header 簡略化、Input collapse 管理、タブルーティング |
| `src/components/InputPanel.tsx` | 新規（App.tsx インライン → 独立コンポーネント） |
| `src/components/CreateTableDialog.tsx` | Create タブに移植後廃止 |
| `src/components/MergePanel.tsx` | Input タブ内に移植（コンポーネント維持） |

## 15B

| ファイル | 変更内容 |
|---------|---------|
| `src/components/TableEditorToolbar.tsx` | L/C/R → SVG アイコン |
| `src/components/PreviewPanel.tsx` | Caption/Label フィールド追加 |
| `src/App.tsx` | debounce ハンドラ追加 |

## 15C

| ファイル | 変更内容 |
|---------|---------|
| `src/lib/table/types.ts` | `TableNote`, `noteMarkers`, `notes` 追加 |
| `src/lib/table/generators/latexGenerator.ts` | threeparttable ラッパー、`\tnote{}` 出力 |
| `src/components/PreviewPanel.tsx` | `<sup>` 表示、Notes 管理 UI |
| `src/components/TableEditorToolbar.tsx` | `[Attach Note]` ボタン追加 |
| `src/App.tsx` | notes state ハンドラ追加 |
````
