// netlify/functions/upload.js
// Drag-drop uploader that:
// 1) uploads image -> assets/<category>/<filename>
// 2) appends entry -> content/gallery/gallery.json
// 3) commits to GitHub using Contents API

const fetch = require("node-fetch");

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "content-type,x-admin-secret",
      "Access-Control-Allow-Methods": "POST,OPTIONS",
    },
    body: JSON.stringify(body),
  };
}

function slugifyFilename(name) {
  // keep extension, make rest safe
  const parts = name.split(".");
  const ext = parts.length > 1 ? "." + parts.pop().toLowerCase() : "";
  const base = parts.join(".")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return (base || "image") + ext;
}

function titleFromFilename(filename) {
  const base = filename.replace(/\.[^/.]+$/, "");
  return base
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

async function ghRequest(url, token, opts = {}) {
  const res = await fetch(url, {
    ...opts,
    headers: {
      Authorization: `token ${token}`,
      "User-Agent": "ccc-uploader",
      Accept: "application/vnd.github+json",
      ...(opts.headers || {}),
    },
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }
  if (!res.ok) {
    throw new Error(`GitHub API error ${res.status}: ${JSON.stringify(data).slice(0, 500)}`);
  }
  return data;
}

async function getContent(owner, repo, path, branch, token) {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}?ref=${encodeURIComponent(branch)}`;
  return ghRequest(url, token);
}

async function putContent(owner, repo, path, branch, token, message, contentBase64, sha = undefined) {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`;
  const body = {
    message,
    content: contentBase64,
    branch,
    ...(sha ? { sha } : {}),
  };
  return ghRequest(url, token, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return jsonResponse(200, { ok: true });
  }
  if (event.httpMethod !== "POST") {
    return jsonResponse(405, { error: "Use POST" });
  }

  // Simple shared-secret protection (easy + works)
  const requiredSecret = process.env.ADMIN_SECRET;
  const providedSecret = event.headers["x-admin-secret"];
  if (requiredSecret && providedSecret !== requiredSecret) {
    return jsonResponse(401, { error: "Unauthorized" });
  }

  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || "main";

  if (!token || !owner || !repo) {
    return jsonResponse(500, { error: "Missing env vars: GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO" });
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return jsonResponse(400, { error: "Invalid JSON body" });
  }

  const category = (payload.category || "").toLowerCase().trim();
  const allowed = ["coasters", "keychains", "tumblers", "wallets", "woodworks"];
  if (!allowed.includes(category)) {
    return jsonResponse(400, { error: `Invalid category. Use one of: ${allowed.join(", ")}` });
  }

  const files = Array.isArray(payload.files) ? payload.files : [];
  if (!files.length) {
    return jsonResponse(400, { error: "No files provided" });
  }

  const galleryPath = "content/gallery/gallery.json";

  try {
    // Load gallery.json (must exist)
    const galleryObj = await getContent(owner, repo, galleryPath, branch, token);
    const gallerySha = galleryObj.sha;
    const galleryJsonText = Buffer.from(galleryObj.content, "base64").toString("utf8");
    let gallery;
    try {
      gallery = JSON.parse(galleryJsonText);
      if (!Array.isArray(gallery)) gallery = [];
    } catch {
      gallery = [];
    }

    const results = [];

    for (const f of files) {
      const originalName = (f.name || "image").toString();
      const safeName = slugifyFilename(originalName);

      const b64 = (f.base64 || "").toString();
      if (!b64) continue;

      // handle data URL or raw base64
      const cleanedB64 = b64.includes("base64,") ? b64.split("base64,")[1] : b64;

      // final file path in repo
      const assetPath = `assets/${category}/${safeName}`;

      // Check if file exists (avoid overwrite)
      let finalPath = assetPath;
      let counter = 1;
      while (true) {
        try {
          await getContent(owner, repo, finalPath, branch, token);
          // exists -> increment
          const ext = safeName.includes(".") ? "." + safeName.split(".").pop() : "";
          const base = safeName.replace(ext, "");
          finalPath = `assets/${category}/${base}-${counter}${ext}`;
          counter++;
        } catch (e) {
          // not found -> good
          break;
        }
      }

      // Upload image file
      await putContent(
        owner,
        repo,
        finalPath,
        branch,
        token,
        `Add ${category} image: ${finalPath.split("/").pop()}`,
        cleanedB64
      );

      // Add gallery entry
      const src = finalPath; // relative path your site uses
      const title = f.title ? String(f.title) : titleFromFilename(finalPath.split("/").pop());

      gallery.push({
        title,
        category,
        src,
      });

      results.push({ title, category, src });
    }

    // Save updated gallery.json
    const newGalleryText = JSON.stringify(gallery, null, 2);
    const newGalleryB64 = Buffer.from(newGalleryText, "utf8").toString("base64");

    await putContent(
      owner,
      repo,
      galleryPath,
      branch,
      token,
      `Update gallery.json (${results.length} new image${results.length === 1 ? "" : "s"})`,
      newGalleryB64,
      gallerySha
    );

    return jsonResponse(200, { ok: true, added: results.length, items: results });
  } catch (err) {
    return jsonResponse(500, { error: err.message || String(err) });
  }
};
