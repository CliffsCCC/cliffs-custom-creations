const GITHUB_OWNER = "CliffsCCC";
const GITHUB_REPO = "cliffs-custom-creations";
const GITHUB_BRANCH = "main";
const PRODUCTS_PATH = "products.json";

const GALLERIES = {
  coasters: {
    folder: "assets/Coasters/",
    files: [
      "72-TA.jpg",
      "89-TA.jpg",
      "Faith-1.jpg",
      "Faith-2.jpg",
      "FHS-1.jpg",
      "Freedome-set.jpg",
      "LM-1.jpg",
      "LM-2.jpg",
      "LM-3.jpg",
      "LM-4.jpg",
      "riverside-set.jpg",
      "RS-1.jpg",
      "RS-2.jpg",
      "RS-3.jpg",
      "RS-4.jpg",
      "WF-1.jpg",
      "WF-2.jpg",
      "WF-3.jpg",
      "WF-4.jpg",
      "WF-5.jpg",
      "xmas-set-1.jpg"
    ]
  },

  keychains: {
    folder: "assets/keychains/",
    files: [
      "faith-1.jpg",
      "faith-2.jpg",
      "favorvers-1.jpg",
      "favorvers-2.jpg",
      "hisandhers-1.jpg",
      "iloveyou-1.jpg",
      "keychain-1.jpg",
      "lastnames-1.jpg",
      "sheisstrong-1.jpg",
      "teamwork-1.jpg"
    ]
  },

  tumblers: {
    folder: "assets/Tumblers/",
    files: [
      "getclean.png",
      "tumbler-1.png",
      "tumbler-2.png",
      "egale-1.jpg",
      "godisright.png",
      "grace.png",
      "happybirthday-1.jpg",
      "iamnotperfict-1.jpg",
      "jesusistheway.png",
      "love-1.jpg",
      "love-2.jpg",
      "skatebording-1.jpg",
      "texastech-1.jpg",
      "tumbler-3.jpg",
      "werstling-1.jpg",
      "wethepeople-1.jpg"
    ]
  },

  wallets: {
    folder: "assets/wallets/",
    files: [
      "acualhandwriting.jpg",
      "daughterandfather-1.jpg"
    ]
  },

  woodworks: {
    folder: "assets/woodworks/",
    files: [
      "baseballgame-1.jpg",
      "baseballgame-2.jpg",
      "nameplates.jpg",
      "pet-1.jpg",
      "pet-2.jpg",
      "pet-3.jpg",
      "pet-4.jpg",
      "pet-5.jpg",
      "pet-6.jpg",
      "pet-7.jpg",
      "pet-8.jpg",
      "pet-9.jpg",
      "pet-10.jpg",
      "pet-11.jpg",
      "woodenplaques-1.jpg",
      "woodenplaques-2.jpg",
      "woodenplaques-3.jpg",
      "xmas-1.jpg",
      "xmas-2.jpg",
      "xmas-3.jpg",
      "xmas-4.jpg",
      "xmas-5.jpg"
    ]
  }
};

const json = (data, status = 200) =>
  new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json"
    }
  });

const decodeBase64 = (value) =>
  Buffer.from(value, "base64").toString("utf8");

const encodeBase64 = (value) =>
  Buffer.from(value, "utf8").toString("base64");

const makeTitle = (file) =>
  file
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const makeId = (category, file) =>
  `legacy-${category}-${file
    .toLowerCase()
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}`;

export default async (request) => {
  const url = new URL(request.url);

  if (url.searchParams.get("run") !== "yes") {
    return json({
      success: false,
      message:
        "Migration not run. Add ?run=yes to the URL."
    });
  }

  const githubToken =
    Netlify.env.get("GITHUB_CONTENT_TOKEN");

  if (!githubToken) {
    return json(
      {
        success: false,
        message:
          "GITHUB_CONTENT_TOKEN is missing."
      },
      500
    );
  }

  const headers = {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${githubToken}`,
    "X-GitHub-Api-Version": "2022-11-28",
    "Content-Type": "application/json",
    "User-Agent": "ccc-product-migration"
  };

  const readUrl =
    `https://api.github.com/repos/` +
    `${GITHUB_OWNER}/${GITHUB_REPO}` +
    `/contents/${PRODUCTS_PATH}` +
    `?ref=${GITHUB_BRANCH}`;

  try {
    const readResponse = await fetch(readUrl, {
      headers
    });

    const readResult = await readResponse.json();

    if (!readResponse.ok) {
      throw new Error(
        readResult.message ||
          "Could not read products.json."
      );
    }

    let existingProducts = [];

    try {
      existingProducts = JSON.parse(
        decodeBase64(
          readResult.content.replace(/\n/g, "")
        )
      );
    } catch {
      throw new Error(
        "products.json contains invalid JSON."
      );
    }

    if (!Array.isArray(existingProducts)) {
      throw new Error(
        "products.json must contain an array."
      );
    }

    const existingImageUrls = new Set(
      existingProducts.map(
        (product) => product.imageUrl
      )
    );

    const migrationDate =
      new Date().toISOString();

    const legacyProducts = [];

    for (const [category, gallery] of Object.entries(
      GALLERIES
    )) {
      for (const file of gallery.files) {
        const imageUrl =
          `${gallery.folder}${file}`;

        if (existingImageUrls.has(imageUrl)) {
          continue;
        }

        legacyProducts.push({
          id: makeId(category, file),
          title: makeTitle(file),
          category,
          price: "",
          description: "",
          imageUrl,
          featured: false,
          published: true,
          createdAt: migrationDate,
          updatedAt: migrationDate
        });
      }
    }

    const combinedProducts = [
      ...existingProducts,
      ...legacyProducts
    ];

    const writeUrl =
      `https://api.github.com/repos/` +
      `${GITHUB_OWNER}/${GITHUB_REPO}` +
      `/contents/${PRODUCTS_PATH}`;

    const writeResponse = await fetch(writeUrl, {
      method: "PUT",
      headers,
      body: JSON.stringify({
        message:
          "Migrate existing gallery products",
        content: encodeBase64(
          `${JSON.stringify(
            combinedProducts,
            null,
            2
          )}\n`
        ),
        sha: readResult.sha,
        branch: GITHUB_BRANCH,
        committer: {
          name: "CCC Gallery Admin",
          email:
            "ccc-gallery-admin@users.noreply.github.com"
        }
      })
    });

    const writeResult =
      await writeResponse.json();

    if (!writeResponse.ok) {
      throw new Error(
        writeResult.message ||
          "GitHub could not save the migration."
      );
    }

    return json({
      success: true,
      existingProducts:
        existingProducts.length,
      migratedProducts:
        legacyProducts.length,
      totalProducts:
        combinedProducts.length,
      message:
        "Migration complete. Netlify will redeploy automatically."
    });
  } catch (error) {
    return json(
      {
        success: false,
        message: error.message
      },
      500
    );
  }
};