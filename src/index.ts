import { Hono } from "hono";
import { getNotion } from "./client";

// 環境変数の型定義
type Bindings = {
  NOTION_API_KEY: string;
  NOTION_DATA_SOURCE_ID: string;
  SERVICE_SECRET: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// ルートパス（動作確認用）
app.get("/", (c) => {
  return c.text("Notion API 起動中");
});

// サンプルデータ取得API
app.get("/api", async (c) => {
  // 1. セキュリティチェック（Next.jsからのアクセスか確認）
  const authHeader = c.req.header("x-service-secret");
  if (authHeader !== c.env.SERVICE_SECRET) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  // Cloudflareのエッジサーバーやブラウザに対し「このレスポンスは保存するな」と命令（念のため）
  c.header("Cache-Control", "no-store, no-cache, must-revalidate");

  const { searchParams } = new URL(c.req.url);
  const slug = searchParams.get("slug")!;

  // 2. Notion クライアントの初期化
  const { client, dataSourceId } = getNotion(c.env);

  try {
    console.log("Notion API 取得開始");
    // 3. Notion API 実行
    const data = await client.dataSources.query({
      data_source_id: dataSourceId,
      filter: {
        and: [
          {
            property: "Title",
            title: {
              is_not_empty: true,
            },
          },
          {
            property: "Slug",
            rich_text: slug ? { equals: slug } : { is_not_empty: true },
          },
          {
            property: "Status",
            select: {
              equals: "published", // 公開記事のみ取得
            },
          },
          {
            property: "Category",
            select: { is_not_empty: true },
          },
          {
            property: "PublishedAt",
            date: {
              is_not_empty: true,
            },
          },
        ],
      },
      sorts: [
        {
          property: "PublishedAt",
          direction: "descending",
        },
      ],
    });

    if (data.results.length === 0) {
      return c.json({ error: "Not found", message: "取得記事は0件です" }, 404);
    }

    // data.results が Notion から返ってきた全レコードの配列
    const posts = data.results.map((item: any) => {
      const p = item.properties; // 短く書くために変数に入れます

      return {
        id: item.id, // NotionのページID

        // 1. タイトル (Titleプロパティ)
        title: p.Title?.title?.[0]?.plain_text ?? "No Title",

        // 2. テキスト (Slug, Description) -> rich_text配列の中身を取得
        slug: p.Slug?.rich_text?.[0]?.plain_text ?? "",
        description: p.Description?.rich_text?.[0]?.plain_text ?? "",

        // 3. セレクト (Category, Status) -> selectオブジェクトのnameを取得
        category: p.Category?.select?.name ?? null,
        status: p.Status?.select?.name ?? null,

        // 4. 日付 (PublishedAt, UpdatedAt) -> dateオブジェクトのstartを取得
        publishedAt: p.PublishedAt?.date?.start ?? null,
        updatedAt: p.UpdatedAt?.date?.start ?? null,
      };
    });

    // 4. JSONを返す
    return c.json({
      count: posts.length,
      results: posts,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error(error);
    return c.json({ error: "Notion API Error" }, 500);
  }
});

export default app;
