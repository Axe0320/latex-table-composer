# テストデータ

Merge UI のテスト用 CSV ファイル群。

| ファイル | 用途 |
|---|---|
| `main_table.csv` | メインテーブルとして読み込む基本データ |
| `append_rows.csv` | 行追加テスト用（同列構成） |
| `append_columns.csv` | 列追加テスト用（同行数、異なる列） |
| `replace_target.csv` | Replace テスト用（全く異なる表） |

## 使い方

1. `main_table.csv` を Upload タブで読み込む
2. Merge タブに切り替え
3. `append_rows.csv` または `append_columns.csv` を追加
4. 方向を選択して Apply
