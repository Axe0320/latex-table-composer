````md
# INTEGRATION_PLAN.md

**Project:** Citation ⇄ BibTeX Converter × latex-table-composer  
**Status:** Future Integration Plan  
**Target:** Post PR-14  
**Execution Timing:** After standalone stabilization

---

# 1. 目的

本ドキュメントは：

```txt
latex-table-composer
````

を、

```txt
Citation ⇄ BibTeX Converter
```

へ統合するための設計計画を定義する。

重要：

> 現時点では統合しない

。

理由：

latex-table-composer を

> 単体で完成・安定化

させる必要があるため。

統合は：

```txt
PR-15 以降
```

で実施する。

---

# 2. 統合方針（固定）

採用：

> Git repository integration

。

つまり：

```txt
別 repo 開発
↓
安定化
↓
必要部分のみ import
↓
Citation ⇄ BibTeX Converter に統合
```

。

---

## 不採用

### monorepo

理由：

管理コスト増。

---

### 同時開発

理由：

regression risk 高。

---

### main branch 直接実装

禁止。

---

# 3. 開発順序（固定）

Phase：

```txt
① Citation ⇄ BibTeX V2 提出
↓
② latex-table-composer 完成
(PR-10〜14)
↓
③ 統合設計
↓
④ Citation ⇄ BibTeX V3
```

。

重要：

> V2 と V3 を分離する

。

---

# 4. Repository Strategy

## 現在

### Repo A

```txt
citation-bibtex-converter
```

用途：

```txt
Citation ⇄ BibTeX
```

。

---

### Repo B

```txt
latex-table-composer
```

用途：

```txt
LaTeX table editor
```

。

---

## 将来

### Repo A（統合後）

名称維持：

```txt
citation-bibtex-converter
```

。

内部：

```txt
Citation
BibTeX
LaTeX Table
```

を統合。

---

# 5. 統合後ビジョン

完成形：

```txt
Academic Utility Suite
```

。

機能：

### Citation ⇄ BibTeX

### Citation formatter

### Bib formatter

### Table composer

### Table parser

### Academic export

。

---

# 6. UI 統合哲学

重要：

UI は：

```txt
Citation ⇄ BibTeX Converter
```

へ寄せる。

つまり：

### accent purple

```txt
#6C63FF
```

。

### card-based layout

。

### max-width centered

。

### subtle shadow

。

### compact toolbar

。

### same typography

。

---

## 統合後 UI

Header：

```txt
Academic Converter Suite
```

。

Tab：

```txt
Citation
BibTeX
Table
```

。

---

### Citation Tab

現行維持。

---

### Table Tab

latex-table-composer を配置。

基本：

```txt
Input
Preview
LaTeX
```

構造維持。

---

# 7. 技術方針

## frontend

統一：

```txt
React
TypeScript
Tailwind
```

。

---

## backend

不要。

完全：

```txt
client-side only
```

。

---

## database

不要。

理由：

保存機能を持たないため。

---

## authentication

不要。

---

## server

不要。

---

# 8. Node.js 方針

採用：

```txt
Node.js LTS
```

。

推奨：

```txt
Node 24 LTS
```

。

理由：

### Vite compatibility

### React compatibility

### crypto.randomUUID()

安定。

---

# 9. Branch Strategy

禁止：

```txt
main 直編集
```

。

必ず：

```txt
feature/*
```

。

例：

```txt
feature/table-editor
feature/booktabs
feature/integration
```

。

---

## Merge Policy

順序：

```txt
feature
↓
local test
↓
npm run build
↓
preview test
↓
commit
↓
push
↓
merge判断
```

。

原則：

> regression zero

。

---

# 10. Integration Boundary

重要：

統合時、

latex-table-composer 全体をコピーしない。

必要部分のみ。

対象：

```txt
src/components
src/lib/table
```

。

---

## 禁止

```txt
node_modules copy
package overwrite
config overwrite
```

。

---

# 11. 依存整理

統合時：

重複依存を整理。

例：

```txt
tailwind
react
typescript
shadcn
```

。

---

# 12. Done Definition

以下成立：

### standalone stable

latex-table-composer 単体完成。

### regression zero

Citation 側を壊さない。

### UI consistency

統一。

### build success

```bash
npm run build
```

成功。

### deploy success

ローカル動作。

---

# 13. 非目標

現時点でやらない：

```txt
AI table generation
OCR
PDF parsing
cloud sync
multi-user
online storage
backend
```

。

すべて：

```txt
future possibility
```

扱い。

```
```
````md
# 14. PR-15 統合仕様（Citation ⇄ BibTeX Converter 統合）

## 目的

`latex-table-composer`

を：

```txt
Citation ⇄ BibTeX Converter
````

に安全に統合する。

重要：

> 単なる copy-paste ではない

。

目的：

```txt
UI統一
責務分離
回帰ゼロ
```

を維持した統合。

---

# 15. 統合戦略（固定）

採用：

> selective integration

。

つまり：

```txt
必要コードだけ移植
```

。

禁止：

```txt
repo merge
git subtree
project overwrite
```

。

理由：

Citation ⇄ BibTeX 側を壊すリスクが高いため。

---

# 16. 移植対象

## 移植する

### table logic

```txt
src/lib/table/
```

。

---

### reusable components

```txt
src/components/
```

のうち：

```txt
PreviewPanel
LatexPanel
FormattingBar
TableEditorToolbar
RowControls
ColumnControls
NoteEditor
MergePanel
```

。

---

### shared UI

必要最小限。

---

## 移植しない

### App.tsx

理由：

親構造が異なる。

---

### vite config

### tsconfig

### tailwind config

### package overwrite

### node_modules

禁止。

---

# 17. 統合後のファイル構造

最終：

```txt
src/
├── components/
│
│   ├── converter/
│   │   ├── CitationPanel.tsx
│   │   ├── BibtexPanel.tsx
│   │   └── StyleSelector.tsx
│   │
│   └── table/
│       ├── InputPanel.tsx
│       ├── PreviewPanel.tsx
│       ├── LatexPanel.tsx
│       ├── FormattingBar.tsx
│       ├── TableEditorToolbar.tsx
│       ├── RowControls.tsx
│       ├── ColumnControls.tsx
│       └── NoteEditor.tsx
│
├── lib/
│   ├── bibtex/
│   ├── citation/
│   └── table/
│
└── App.tsx
```

。

---

# 18. UI 統合方式

## Header

維持：

```txt
Citation ⇄ BibTeX Converter
```

。

subtitle 更新：

```txt
Citation, BibTeX, and Academic Table Utilities
```

。

---

## Main Navigation

追加：

```txt
[Citation]
[Table]
```

。

tab UI。

---

### Citation tab

現行完全維持。

後方互換：

```txt
regression zero
```

。

---

### Table tab

latex-table-composer を配置。

レイアウト：

```txt
Input | Preview
LaTeX (full width)
```

維持。

---

# 19. 状態管理

統合時：

Citation state と Table state を分離。

禁止：

```txt
single mega state
```

。

推奨：

```ts
const [converterState]
const [tableState]
```

。

理由：

責務分離。

---

# 20. package 統合

依存：

### react

### tailwind

### typescript

共有。

---

### shadcn

必要 component のみ。

---

### new packages

必要時のみ：

```txt
threeparttable
booktabs
```

※ LaTeX package であり npm package ではない。

---

# 21. CSS 統合

重要：

UI を揃える。

統一：

```txt
card
button hierarchy
spacing
border radius
shadow
```

。

色：

```txt
accent:
#6C63FF
```

。

背景：

```txt
#F8FAFC
```

。

---

# 22. 実際の統合手順（固定）

順序：

## Step 1

Citation repo：

```bash
git checkout -b feature/table-integration
```

。

---

## Step 2

以下コピー：

```txt
src/lib/table/
```

。

---

## Step 3

以下コピー：

```txt
src/components/table/
```

。

---

## Step 4

App.tsx：

tab layout を追加。

---

## Step 5

動作確認：

### parse

### preview

### latex export

### row edit

### note

### merge

。

---

## Step 6

```bash
npm run build
```

。

---

## Step 7

ローカル動作確認。

---

## Step 8

commit。

---

## Step 9

push。

---

## Step 10

merge 判断。

---

# 23. 回帰防止ルール（固定）

統合時：

以下必須確認。

### Citation → BibTeX

正常。

### BibTeX → Citation

正常。

### Classic mode

正常。

### Citation style mode

正常。

### Table

正常。

### UI 崩れ

なし。

### mobile

崩れなし。

---

# 24. 将来拡張余地（PR-16以降）

※ 別フェーズ

可能性：

### AI Table Generator

例：

```txt
classification report を論文表へ変換
```

。

---

### OCR Table Import

画像表解析。

---

### PDF Table Import

論文表の抽出。

---

### CSL integration

Citation 側強化。

---

### Research Utility Suite

最終像。

---

# 25. Done Definition

以下成立：

### Citation機能

壊れていない。

### Table機能

壊れていない。

### UI統一

完了。

### regression zero

達成。

### build success

```bash
npm run build
```

成功。

### local run

成功。

### deploy safe

成功。

```
```
