import { Client } from "@notionhq/client";

// 環境変数の型定義（index.tsと共通化してもOK）
export type Bindings = {
  NOTION_API_KEY: string;
  NOTION_DATA_SOURCE_ID: string;
};

/**
 * 環境変数を受け取って Notion Client と ID を返す関数
 */
export const getNotion = (env: Bindings) => {
  // --- 環境変数の検証 ---
  if (!env.NOTION_API_KEY) {
    throw new Error("NOTION_API_KEY が設定されていません");
  }

  if (!env.NOTION_DATA_SOURCE_ID) {
    throw new Error("NOTION_DATA_SOURCE_ID が設定されていません");
  }

  // --- Notion APIクライアントの初期化 ---
  const client = new Client({
    auth: env.NOTION_API_KEY,
    fetch: (url, init) => {
      return fetch(url, init);
    }, // Cloudflare Workersのネイティブfetchを明示的に渡します
  });

  // v2025-09-03 以降対応
  const dataSourceId = env.NOTION_DATA_SOURCE_ID;

  return {
    client,
    dataSourceId,
  };
};
