const GITHUB_OWNER = "CliffsCCC";
const GITHUB_REPO = "cliffs-custom-creations";
const GITHUB_BRANCH = "main";
const PRODUCTS_PATH = "products.json";

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "POST, OPTIONS"
    }
  });

const cleanText = (value, maxLength) => {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().slice(0, maxLength);
};

const decodeBase64 = (value) =>
  Buffer.from(value, "base64").toString("utf8");

const encodeBase64 = (value) =>
  Buffer.from(value, "utf8").toString("base64");

const validCategories = new Set([
  "tumblers",
  "wallets",
  "coasters",
  "keychains",
  "woodworks"
]);

export default async (request) => {
  if (request.method === "OPTIONS") {
    return json({
      success: true
    });
  }

  if (request.method !== "POST") {
    return json(
      {
        success: false,
        message: "Only POST requests are allowed."
      },
      405
    );
  }

  const githubToken =
    Netlify.env.get("GITHUB_CONTENT_TOKEN");

  if (!githubToken) {
    return json(
      {
        success: false,
        message:
          "The GitHub token is not configured in Netlify."
      },
      500
    );
  }

  let requestBody;

  try {
    requestBody = await request.json();
  } catch {
    return json(
      {
        success: false,
        message:
          "The product information was not valid JSON."
      },
      400
    );
  }

  const id = cleanText(requestBody.id, 150);

  const title = cleanText(
    requestBody.title,
    120
  );

  const category = cleanText(
    requestBody.category,
    40
  ).toLowerCase();

  const price = cleanText(
    requestBody.price,
    40
  );

  const description = cleanText(
    requestBody.description,
    1000
  );

  const imageUrl = cleanText(
    requestBody.imageUrl,
    1000
  );

  const featured =
    Boolean(requestBody.featured);

  if (!id) {
    return json(
      {
        success: false,
        message:
          "A product ID is required."
      },
      400
    );
  }

  if (!title) {
    return json(
      {
        success: false,
        message:
          "A product title is required."
      },
      400
    );
  }

  if (!validCategories.has(category)) {
    return json(
      {
        success: false,
        message:
          "Choose a valid product category."
      },
      400
    );
  }

  if (
    !imageUrl.startsWith(
      "https://res.cloudinary.com/"
    )
  ) {
    return json(
      {
        success: false,
        message:
          "A valid Cloudinary image address is required."
      },
      400
    );
  }

  const githubHeaders = {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${githubToken}`,
    "X-GitHub-Api-Version": "2022-11-28",
    "Content-Type": "application/json",
    "User-Agent": "ccc-gallery-editor"
  };

  const readUrl =
    `https://api.github.com/repos/` +
    `${GITHUB_OWNER}/${GITHUB_REPO}` +
    `/contents/${PRODUCTS_PATH}` +
    `?ref=${GITHUB_BRANCH}`;

  try {
    const readResponse = await fetch(
      readUrl,
      {
        headers: githubHeaders
      }
    );

    const readResult =
      await readResponse.json();

    if (!readResponse.ok) {
      throw new Error(
        readResult.message ||
          "GitHub could not read products.json."
      );
    }

    let products;

    try {
      products = JSON.parse(
        decodeBase64(
          readResult.content.replace(
            /\n/g,
            ""
          )
        )
      );
    } catch {
      throw new Error(
        "products.json does not contain valid JSON."
      );
    }

    if (!Array.isArray(products)) {
      throw new Error(
        "products.json must contain a JSON array."
      );
    }

    const productIndex =
      products.findIndex(
        (product) =>
          String(product.id) === id
      );

    if (productIndex === -1) {
      return json(
        {
          success: false,
          message:
            "That product could not be found."
        },
        404
      );
    }

    const existingProduct =
      products[productIndex];

    const updatedProduct = {
      ...existingProduct,
      title,
      category,
      price,
      description,
      imageUrl,
      featured,
      published:
        requestBody.published === false
          ? false
          : true,
      updatedAt:
        new Date().toISOString()
    };

    products[productIndex] =
      updatedProduct;

    const updatedProducts =
      `${JSON.stringify(
        products,
        null,
        2
      )}\n`;

    const writeUrl =
      `https://api.github.com/repos/` +
      `${GITHUB_OWNER}/${GITHUB_REPO}` +
      `/contents/${PRODUCTS_PATH}`;

    const writeResponse = await fetch(
      writeUrl,
      {
        method: "PUT",
        headers: githubHeaders,
        body: JSON.stringify({
          message:
            `Update gallery product: ${title}`,

          content:
            encodeBase64(
              updatedProducts
            ),

          sha: readResult.sha,
          branch: GITHUB_BRANCH,

          committer: {
            name:
              "CCC Gallery Admin",

            email:
              "ccc-gallery-admin@users.noreply.github.com"
          }
        })
      }
    );

    const writeResult =
      await writeResponse.json();

    if (!writeResponse.ok) {
      throw new Error(
        writeResult.message ||
          "GitHub could not save the updated product."
      );
    }

    return json({
      success: true,

      message:
        "Product updated. Netlify will redeploy shortly.",

      product: updatedProduct
    });
  } catch (error) {
    console.error(
      "Update product error:",
      error
    );

    return json(
      {
        success: false,

        message:
          error.message ||
          "The product could not be updated."
      },
      500
    );
  }
};