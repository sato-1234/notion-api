/**
 * Notion データベース ID からデータソース ID を取得するスクリプト
 *
 * 使用方法:
 * npx tsx scripts/get-datasource-id.ts
 */

import { config } from "dotenv";
import { Client } from "@notionhq/client";
import * as path from "path";

// .env.local ファイルを読み込む
config({ path: path.resolve(process.cwd(), ".env") });

// 環境変数から取得
const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

if (!NOTION_API_KEY) {
  console.error("❌ NOTION_API_KEY が設定されていません");
  process.exit(1);
}

if (!NOTION_DATABASE_ID) {
  console.error("❌ NOTION_DATABASE_ID が設定されていません");
  process.exit(1);
}

const notion = new Client({
  auth: NOTION_API_KEY,
});

async function getDataSourceId() {
  try {
    console.log("📊 データベース情報を取得中...");
    console.log(`データベース ID: ${NOTION_DATABASE_ID}\n`);

    // データベース情報を取得
    const database = await notion.databases.retrieve({
      database_id: NOTION_DATABASE_ID!,
    });

    console.log("✅ データベース情報:");
    console.log(
      `  タイトル: ${
        (database as any).title?.[0]?.plain_text || "（タイトルなし）"
      }`
    );

    // データソース情報を取得
    if ("data_sources" in database && Array.isArray(database.data_sources)) {
      const dataSources = database.data_sources;

      console.log(`\n📁 データソース数: ${dataSources.length}`);

      dataSources.forEach((ds: any, index: number) => {
        console.log(`\nデータソース ${index + 1}:`);
        console.log(`  データソース ID: ${ds.id}`);
        console.log(`  タイプ: ${ds.type || "database"}`);
      });

      if (dataSources.length > 0) {
        const firstDataSource = dataSources[0];
        console.log("\n" + "=".repeat(60));
        console.log("📝 .env に追加してください:");
        console.log("=".repeat(60));
        console.log(`NOTION_DATA_SOURCE_ID=${firstDataSource.id}`);
        console.log("=".repeat(60));
      }
    } else {
      console.log("\n⚠️  データソース情報が見つかりません");
      console.log(
        "このデータベースは v2025-09-03 に対応していない可能性があります"
      );
    }
  } catch (error: any) {
    console.error("\n❌ エラーが発生しました:");

    if (error.code === "object_not_found") {
      console.error("\nデータベースが見つかりません。以下を確認してください:");
      console.error("1. NOTION_DATABASE_ID が正しいか");
      console.error(
        "2. Notion インテグレーションがデータベースに接続されているか"
      );
    } else if (error.code === "unauthorized") {
      console.error("\nAPI キーが無効です。NOTION_API_KEY を確認してください");
    } else {
      console.error(error.message);
      console.error("\n詳細:", error);
    }
    process.exit(1);
  }
}

getDataSourceId();
