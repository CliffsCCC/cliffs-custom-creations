import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";

export async function handler() {
  try {
    const sitePath = path.join(process.cwd(), "site.js");
    const productsPath = path.join(process.cwd(), "products.json");

    const siteJs = fs.readFileSync(sitePath, "utf8");

    const galleries = {};
    const galleryRegex =
      /(\w+):\s*{\s*label:\s*'([^']+)'.*?folder:\s*'([^']+)'.*?files:\s*\[([\s\S]*?)\]/g;

    let match;

    while ((match = galleryRegex.exec(siteJs)) !== null) {
      const category = match[1];
      const files = [...match[4].matchAll(/'([^']+)'/g)].map((m) => m[1]);

      galleries[category] = files;
    }

    const products = [];

    for (const [category, files] of Object.entries(galleries)) {
      for (const file of files) {
        products.push({
          id: randomUUID(),
          title: file.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "),
          category,
          price: "",
          description: "",
          imageUrl: `${category}/${file}`,
          featured: false,
          published: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
    }

    fs.writeFileSync(productsPath, JSON.stringify(products, null, 2));

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        migrated: products.length
      })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: err.message
    };
  }
}