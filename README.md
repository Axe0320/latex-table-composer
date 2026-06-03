# LaTeX Table Composer

**表データを論文向け LaTeX に変換・整形するツール**

> 千葉工業大学「Web3・AI概論」第6回課題 — プロトタイプ v2

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Tailwind](https://img.shields.io/badge/Tailwind-3-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)

---

## 概要

研究・論文作成における **「表の LaTeX 化」** を自動化する Web アプリケーション。

Excel・Google Sheets のコピー、CSV ファイル、sklearn の classification report、実験ログなど、さまざまな形式のデータを貼り付けるだけで **論文投稿品質の LaTeX コード** を即座に生成します。

```
研究者の従来ワークフロー          LaTeX Table Composer
━━━━━━━━━━━━━━━━━━━━        ━━━━━━━━━━━━━━━━━━━━
Excel で表作成
  ↓                               データを貼り付け or アップロード
手作業で LaTeX 変換   ──→             ↓
  ↓                           リアルタイムプレビューで確認・編集
コンパイルして確認                      ↓
  ↓                           Copy LaTeX ボタン一発でコピー
見た目を修正して再編集
```

---

## 主な機能

### 入力方式

| モード | 対応形式 |
|--------|---------|
| **Paste** | TSV / CSV / Excel コピー / Google Sheets / Markdown テーブル / LLM 出力 |
| **Upload** | `.csv` / `.tsv` / `.txt` / `.xlsx` / `.xls` |
| **Create** | 空テーブルをゼロから作成（Quick presets: 2×2, 3×3, 4×4, 5×3） |
| **Merge** | 複数ソースの統合（行追加 / 列追加 / 置換） |

### 編集機能（Edit モード）

- **セル直接編集**（インライン）
- **行・列の追加・削除**（途中挿入対応）
- **スタイル編集**：太字 / 斜体 / 下線 / 背景色 / 揃え
- **範囲選択**：クリック / Shift+クリック（矩形）/ ドラッグ / 行・列まるごと
- **列の表示/非表示**
- **罫線スタイル**：行単位で `\hline` / `\midrule` を設定

### 出力設定

- **罫線スタイル**：Default（3線 `\hline`）/ Booktabs / Full Grid / 上下のみ
- **小数点桁数**：Auto（4桁）/ 0〜4桁
- **欠損値**：`---` / `N/A` / `-` / 空白
- **出力環境**：`table` / `table*`

### 注釈（PR-15C）

- `\tnote{}` / `\footnotemark` 両対応
- 自動採番：アルファベット（a, b, c…）/ 数字（1, 2, 3…）
- `\begin{threeparttable}` を自動で挿入・管理

---

## アーキテクチャ

```mermaid
flowchart TD
    classDef input fill:#6C63FF,color:#fff,stroke:#4a44cc
    classDef process fill:#10B981,color:#fff,stroke:#059669
    classDef model fill:#F59E0B,color:#fff,stroke:#D97706
    classDef output fill:#EF4444,color:#fff,stroke:#DC2626
    classDef ui fill:#3B82F6,color:#fff,stroke:#2563EB

    A([📋 Paste\nTSV / CSV / Excel\nMarkdown / Log]):::input
    B([📂 Upload\n.xlsx / .csv / .tsv]):::input
    C([🆕 Create\n空テーブル]):::input
    D([🔗 Merge\n複数ソース統合]):::input

    E[detect\nフォーマット自動判定]:::process
    F[parse\nCSV / TSV / Excel\nClassification Report\nLog]:::process
    G[normalize\n列数補正・数値判定\nセル trim]:::process

    H[(TableModel\nSingle Source of Truth)]:::model

    I[formatter\n小数点丸め・欠損値]:::process
    J[latexGenerator\nbooktabs / hline\ntnote / footnote]:::process

    K([👁 Preview\nリアルタイム表示\n論文風レンダリング]):::ui
    L([📝 Edit\nインライン編集\nスタイル・選択・注釈]):::ui
    M([📄 LaTeX Output\nCopy LaTeX]):::output

    A --> E
    B --> E
    C --> G
    D --> G
    E --> F
    F --> G
    G --> H
    H --> I
    I --> J
    H --> K
    H --> L
    J --> M
```

---

## 処理パイプライン詳細

```mermaid
flowchart LR
    classDef step fill:#6C63FF,color:#fff,stroke:none,rx:8
    classDef data fill:#EEF2FF,color:#374151,stroke:#6C63FF,stroke-width:2px
    classDef arrow color:#6C63FF

    R[Raw Input]:::data
    P[parse]:::step
    N[normalize]:::step
    T[(TableModel)]:::data
    F[formatter]:::step
    G[generator]:::step
    O[Preview / LaTeX]:::data

    R --> P --> N --> T --> F --> G --> O
```

### TableModel（Single Source of Truth）

```mermaid
classDiagram
    class TableModel {
        +string title
        +string label
        +string environment
        +string[] columns
        +TableRow[] rows
        +TableNote[] notes
        +NoteStyle noteStyle
        +NoteNumbering noteNumbering
    }
    class TableRow {
        +string id
        +TableCell[] cells
        +string rowType
        +boolean separatorTop
        +boolean separatorBottom
        +BorderStyle topBorder
        +BorderStyle bottomBorder
    }
    class TableCell {
        +string id
        +string value
        +boolean bold
        +boolean italic
        +boolean underline
        +boolean hidden
        +string align
        +string backgroundColor
        +string[] noteMarkers
    }
    class TableNote {
        +string id
        +string marker
        +string text
    }
    TableModel "1" --> "*" TableRow
    TableRow "1" --> "*" TableCell
    TableModel "1" --> "*" TableNote
```

---

## 出力例

### 入力（TSV 貼り付け）

```
Method	Accuracy	Precision	F1
Ours	0.924	0.918	0.911
BERT	0.901	0.895	0.887
Baseline	0.872	0.864	0.859
```

### 出力（LaTeX）

```latex
% Required Packages:
% \usepackage{booktabs}

\begin{table*}[tb]
\caption{}
\label{}
\begin{center}
\begin{tabular}{lrrr}
\toprule
\textbf{Method} & \textbf{Accuracy} & \textbf{Precision} & \textbf{F1} \\
\midrule
Ours & 0.9240 & 0.9180 & 0.9110 \\
BERT & 0.9010 & 0.8950 & 0.8870 \\
\midrule
Baseline & 0.8720 & 0.8640 & 0.8590 \\
\bottomrule
\end{tabular}
\end{center}
\end{table*}
```

---

## 対応する自動検出フォーマット

```mermaid
flowchart TD
    classDef detect fill:#6C63FF,color:#fff,stroke:none
    classDef format fill:#10B981,color:#fff,stroke:none
    classDef fallback fill:#9CA3AF,color:#fff,stroke:none

    IN([入力テキスト])
    TSV{タブ文字\nを含む？}:::detect
    REP{precision/recall/\nf1-score を含む？}:::detect
    LOG{Key: 数値\n3行以上？}:::detect
    CSV{カンマ区切り\n列数一致？}:::detect

    T([TSV]):::format
    C([CSV]):::format
    R([Classification Report]):::format
    L([Log Parser]):::format
    U([unknown]):::fallback

    IN --> TSV
    TSV -- Yes --> T
    TSV -- No --> REP
    REP -- Yes --> R
    REP -- No --> LOG
    LOG -- Yes --> L
    LOG -- No --> CSV
    CSV -- Yes --> C
    CSV -- No --> U
```

---

## 技術スタック

| カテゴリ | 採用技術 |
|---------|---------|
| フレームワーク | React 18 + TypeScript 5 |
| ビルド | Vite 5 |
| スタイリング | Tailwind CSS 3 + Custom CSS Variables |
| Excel 解析 | SheetJS（xlsx）※ dynamic import |
| デプロイ | Vercel |

---

## セットアップ

```bash
# リポジトリをクローン
git clone <repository-url>
cd latex-table-composer

# 依存パッケージをインストール
npm install

# 開発サーバーを起動
npm run dev
# → http://localhost:5173

# ビルド
npm run build
```

---

## ディレクトリ構成

```
src/
├── components/
│   ├── InputPanel.tsx        # 入力パネル（Paste/Upload/Create/Merge）
│   ├── PreviewPanel.tsx      # プレビュー + 編集
│   ├── TableEditorToolbar.tsx # 編集ツールバー
│   ├── FormattingBar.tsx     # 出力設定
│   └── MergePanel.tsx        # ソース統合
│
├── lib/table/
│   ├── types.ts              # TableModel / TableCell / TableNote 型定義
│   ├── parser/               # 各フォーマットのパーサー
│   │   ├── detect.ts
│   │   ├── parseCSV.ts
│   │   ├── parseTSV.ts
│   │   ├── parseClassificationReport.ts
│   │   ├── parseLog.ts
│   │   └── parseExcel.ts
│   ├── normalize/            # データ正規化
│   ├── formatters/           # 出力フォーマット設定
│   ├── generators/           # LaTeX 生成
│   │   └── latexGenerator.ts
│   ├── editor/               # 編集操作（純粋関数）
│   └── merge/                # マージ操作
│
└── App.tsx                   # アプリケーションルート
```

---

## 関連プロジェクト

本プロジェクトは [Citation ⇄ BibTeX Converter](https://github.com/Axe0320/citation-bibtex-converter) の UI 思想・設計哲学を継承し、将来的な統合を前提として開発されました。

---

## 課題情報

| 項目 | 内容 |
|------|------|
| 大学 | 千葉工業大学 |
| 科目 | Web3・AI概論 |
| 回 | 第6回 |
| 課題 | プロトタイプ v2 の作成 |

---

## License

MIT
