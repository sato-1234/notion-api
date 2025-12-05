# NotionAPI×Hono×cloudflare

前提で、Notion 側と cloudflare 側で適切な設定が必要になります。
以下の記事を参考にしてください ↓

XXXX.com

NotionAPI で取得する項目（データベース構成）は以下になります ↓

| プロパティ名 (Name) | 種類 (Type)       | 必須 | 説明                                               |
| :------------------ | :---------------- | :--: | :------------------------------------------------- |
| **Title**           | Title (タイトル)  |  ✅  | 記事のタイトル                                     |
| **Slug**            | Text (テキスト)   |  ✅  | URL 用スラッグ (例: `title1`)                      |
| **Category**        | Select (セレクト) |  ✅  | 記事カテゴリ (例: `カテゴリ1`)                     |
| **Status**          | Select (セレクト) |  ✅  | 公開ステータス (`draft` / `published` / `private`) |
| **PublishedAt**     | Date (日付)       |  ✅  | 記事の公開日                                       |
| **UpdatedAt**       | Date (日付)       |  -   | 記事の更新日                                       |
| **Description**     | Text (テキスト)   |  -   | 記事の概要・メタディスクリプション                 |

## ローカルにダウンロード後の設定手順

### 1.環境変数設定

.env ファイル作成して適切な値を設定 ↓

```.env
# Notion API Configuration
# API キー（Integration の設定ページで取得）
NOTION_API_KEY=

# データベース ID（32文字のID）
# データベース URL の https://notion.so/xxxxx の部分（クエリパラメータより前）
NOTION_DATABASE_ID=

# データソース ID（API v2025-09-03 以降で必要）
# 取得方法: npm run get-datasource-id を実行
NOTION_DATA_SOURCE_ID=

# APIのトークン
SERVICE_SECRET=test
```

```txt
npm install
```

`NOTION_DATA_SOURCE_ID`を取得するには、以下のスクリプトを実行して`.env`に貼り付けます ↓

```
npm run get-datasource-id
```

### 2.NotionAPI を実行

```
npm run dev
curl -X GET -H "x-revalidate-secret: test" "http://localhost:8787/api"
```

## ローカルから cloudflare 直接デプロイする場合

```txt
npx wrangler login
npm run deploy
```

## その他

[For generating/synchronizing types based on your Worker configuration run](https://developers.cloudflare.com/workers/wrangler/commands/#types):

```txt
npm run cf-typegen
```

Pass the `CloudflareBindings` as generics when instantiation `Hono`:

```ts
// src/index.ts
const app = new Hono<{ Bindings: CloudflareBindings }>();
```
