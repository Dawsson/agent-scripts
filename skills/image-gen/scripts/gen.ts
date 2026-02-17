#!/usr/bin/env bun

// image-gen — OpenRouter image generation CLI
// Usage: bun run ~/.claude/skills/image-gen/scripts/gen.ts --prompt "..." [options]

const MODEL_ALIASES: Record<string, string> = {
  flux: "black-forest-labs/flux.2-pro",
  "flux-fast": "black-forest-labs/flux.2-klein-4b",
  "flux-max": "black-forest-labs/flux.2-max",
  "flux-text": "black-forest-labs/flux.2-flex",
  nano: "google/gemini-2.5-flash-image-preview",
  "nano-pro": "google/gemini-3-pro-image-preview",
  gpt: "openai/gpt-5-image",
  riverflow: "sourceful/riverflow-v2-pro",
  "riverflow-fast": "sourceful/riverflow-v2-fast",
  seedream: "bytedance-seed/seedream-4.5",
};

function resolveModel(alias: string): string {
  return MODEL_ALIASES[alias] ?? alias;
}

function stamp(): string {
  const now = new Date();
  const pad = (n: number, w = 2) => String(n).padStart(w, "0");
  return (
    `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}` +
    `-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
  );
}

function slug(text: string, maxLen = 50): string {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, maxLen) || "image"
  );
}

interface Args {
  prompt: string;
  model: string;
  count: number;
  resolution: string;
  aspect: string;
  inputImage: string | null;
  outDir: string;
  gallery: boolean;
  apiKey: string | null;
  dryRun: boolean;
}

function parseArgs(argv: string[]): Args {
  const args: Args = {
    prompt: "",
    model: "flux",
    count: 1,
    resolution: "1K",
    aspect: "1:1",
    inputImage: null,
    outDir: process.cwd(),
    gallery: false,
    apiKey: null,
    dryRun: false,
  };

  const it = argv[Symbol.iterator]();
  for (const arg of it) {
    const next = () => {
      const r = it.next();
      if (r.done) throw new Error(`${arg} requires a value`);
      return r.value;
    };
    switch (arg) {
      case "--prompt":
      case "-p":
        args.prompt = next();
        break;
      case "--model":
      case "-m":
        args.model = next();
        break;
      case "--count":
      case "-n":
        args.count = parseInt(next(), 10);
        break;
      case "--resolution":
      case "-r":
        args.resolution = next().toUpperCase();
        break;
      case "--aspect":
      case "-a":
        args.aspect = next();
        break;
      case "--input-image":
      case "-i":
        args.inputImage = next();
        break;
      case "--out-dir":
      case "-o":
        args.outDir = next();
        break;
      case "--gallery":
      case "-g":
        args.gallery = true;
        break;
      case "--api-key":
      case "-k":
        args.apiKey = next();
        break;
      case "--dry-run":
        args.dryRun = true;
        break;
      default:
        if (arg.startsWith("-")) {
          console.error(`Unknown flag: ${arg}`);
          process.exit(1);
        }
    }
  }

  return args;
}

interface GalleryItem {
  file: string;
  prompt: string;
  model: string;
  aspect: string;
  resolution: string;
}

function writeGallery(outDir: string, items: GalleryItem[]): void {
  const cards = items
    .map(
      (it) => `
  <div class="card">
    <a href="${it.file}" target="_blank"><img src="${it.file}" loading="lazy"></a>
    <pre>${escapeHtml(it.prompt)}</pre>
    <div class="meta">${it.model} · ${it.aspect} · ${it.resolution}</div>
  </div>`
    )
    .join("\n");

  const html = `<!doctype html>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>image-gen</title>
<style>
  *{box-sizing:border-box}
  body{font-family:ui-sans-serif,system-ui,-apple-system;margin:0;padding:24px 32px;background:#0a0a0a;color:#e8e8e8;max-width:1200px}
  h1{font-size:1.1rem;font-weight:500;color:#888;margin:0 0 24px;letter-spacing:.05em;text-transform:uppercase}
  .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:20px}
  .card{background:#141414;border-radius:16px;overflow:hidden;border:1px solid #222}
  .card img{width:100%;aspect-ratio:1;object-fit:cover;display:block}
  pre{white-space:pre-wrap;margin:0;padding:12px 14px;font-size:.78rem;line-height:1.5;color:#ccc;font-family:ui-monospace,monospace}
  .meta{padding:0 14px 12px;font-size:.72rem;color:#555}
  a{color:inherit;text-decoration:none}
</style>
<h1>image-gen · ${items.length} image${items.length === 1 ? "" : "s"}</h1>
<div class="grid">
${cards}
</div>
`;

  const path = `${outDir}/index.html`;
  Bun.write(path, html);
  console.log(`gallery → ${path}`);
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function readImageAsBase64(
  filePath: string
): Promise<{ base64: string; mimeType: string }> {
  const file = Bun.file(filePath);
  if (!(await file.exists())) {
    throw new Error(`Input image not found: ${filePath}`);
  }
  const buf = await file.arrayBuffer();
  const base64 = Buffer.from(buf).toString("base64");
  const name = filePath.toLowerCase();
  let mimeType = "image/png";
  if (name.endsWith(".jpg") || name.endsWith(".jpeg")) mimeType = "image/jpeg";
  else if (name.endsWith(".webp")) mimeType = "image/webp";
  else if (name.endsWith(".gif")) mimeType = "image/gif";
  return { base64, mimeType };
}

async function generateImage(opts: {
  prompt: string;
  model: string;
  resolution: string;
  aspect: string;
  inputImage: string | null;
  apiKey: string;
}): Promise<Buffer> {
  const { prompt, model, resolution, aspect, inputImage, apiKey } = opts;

  type ContentItem =
    | { type: "text"; text: string }
    | { type: "image_url"; image_url: { url: string } };

  let content: string | ContentItem[];

  if (inputImage) {
    const { base64, mimeType } = await readImageAsBase64(inputImage);
    content = [
      { type: "text", text: prompt },
      {
        type: "image_url",
        image_url: { url: `data:${mimeType};base64,${base64}` },
      },
    ];
  } else {
    content = prompt;
  }

  const body = {
    model,
    messages: [{ role: "user", content }],
    modalities: ["image"],
    image_config: {
      aspect_ratio: aspect,
      image_size: resolution,
    },
  };

  const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const text = await resp.text();
    let detail = text.slice(0, 1200);
    try {
      detail = JSON.stringify(JSON.parse(text), null, 2).slice(0, 1200);
    } catch {}
    throw new Error(`OpenRouter HTTP ${resp.status}: ${detail}`);
  }

  const data = await resp.json();
  const imageUrl: string | undefined =
    data?.choices?.[0]?.message?.images?.[0]?.image_url?.url;

  if (!imageUrl) {
    throw new Error(
      `Unexpected response (no image URL):\n${JSON.stringify(data, null, 2).slice(0, 1200)}`
    );
  }

  // Strip data URL prefix if present
  const b64 = imageUrl.startsWith("data:")
    ? imageUrl.replace(/^data:[^;]+;base64,/, "")
    : imageUrl;

  return Buffer.from(b64, "base64");
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);

  if (argv.includes("--help") || argv.includes("-h")) {
    console.log(`Usage: image-gen --prompt <text> [options]

Options:
  -p, --prompt <text>          Image prompt (required unless --dry-run)
  -m, --model <alias|id>       Model alias or full OpenRouter model ID (default: flux)
  -n, --count <N>              Generate N images (default: 1)
  -r, --resolution <1K|2K|4K>  Image resolution (default: 1K)
  -a, --aspect <ratio>         Aspect ratio: 1:1 16:9 9:16 4:3 3:4 21:9 (default: 1:1)
  -i, --input-image <path>     Input image for editing (base64 encoded)
  -o, --out-dir <path>         Output directory (default: CWD)
  -g, --gallery                Write index.html gallery (auto when --count > 1)
  -k, --api-key <key>          Override OPENROUTER_API_KEY env
      --dry-run                Print config, skip API calls

Model aliases:
  flux          black-forest-labs/flux.2-pro       (default; photorealistic)
  flux-fast     black-forest-labs/flux.2-klein-4b  (fast/cheap exploration)
  flux-max      black-forest-labs/flux.2-max        (highest quality)
  flux-text     black-forest-labs/flux.2-flex       (text in images)
  nano          google/gemini-2.5-flash-image-preview (illustrations)
  nano-pro      google/gemini-3-pro-image-preview   (app icons, editing)
  gpt           openai/gpt-5-image                  (complex instructions)
  riverflow     sourceful/riverflow-v2-pro           (perfect text rendering)
  riverflow-fast sourceful/riverflow-v2-fast         (production speed)
  seedream      bytedance-seed/seedream-4.5          (good value, portraits)
`);
    process.exit(0);
  }

  const args = parseArgs(argv);

  const apiKey =
    args.apiKey ??
    process.env.OPENROUTER_API_KEY ??
    (await Bun.secrets.get({ service: "image-gen", name: "OPENROUTER_API_KEY" })) ??
    null;
  if (!apiKey && !args.dryRun) {
    console.error(
      "Error: OPENROUTER_API_KEY not set (or pass --api-key <key>)"
    );
    process.exit(2);
  }

  const resolvedModel = resolveModel(args.model);
  const writeGalleryFlag = args.gallery || args.count > 1;

  if (args.dryRun) {
    console.log("--- dry-run config ---");
    console.log(`prompt:     ${args.prompt || "(none)"}`);
    console.log(`model:      ${args.model} → ${resolvedModel}`);
    console.log(`count:      ${args.count}`);
    console.log(`resolution: ${args.resolution}`);
    console.log(`aspect:     ${args.aspect}`);
    console.log(`inputImage: ${args.inputImage ?? "(none)"}`);
    console.log(`outDir:     ${args.outDir}`);
    console.log(`gallery:    ${writeGalleryFlag}`);
    process.exit(0);
  }

  if (!args.prompt) {
    console.error("Error: --prompt is required");
    process.exit(1);
  }

  await Bun.write(args.outDir + "/.keep", "").catch(() => {});
  // Ensure outDir exists
  const { mkdir } = await import("fs/promises");
  await mkdir(args.outDir, { recursive: true });

  const ts = stamp();
  const baseSlug = slug(args.prompt);
  const items: GalleryItem[] = [];

  for (let i = 1; i <= args.count; i++) {
    const suffix = args.count > 1 ? `-${String(i).padStart(2, "0")}` : "";
    const filename = `${ts}-${baseSlug}${suffix}.png`;
    const outPath = `${args.outDir}/${filename}`;

    process.stdout.write(
      `[${i}/${args.count}] ${resolvedModel} → ${filename} ... `
    );

    const png = await generateImage({
      prompt: args.prompt,
      model: resolvedModel,
      resolution: args.resolution,
      aspect: args.aspect,
      inputImage: args.inputImage,
      apiKey: apiKey!,
    });

    await Bun.write(outPath, png);
    console.log(`done (${(png.length / 1024).toFixed(0)} KB)`);

    items.push({
      file: filename,
      prompt: args.prompt,
      model: resolvedModel,
      aspect: args.aspect,
      resolution: args.resolution,
    });

    if (i < args.count) {
      await Bun.sleep(300);
    }
  }

  if (writeGalleryFlag) {
    writeGallery(args.outDir, items);
  }

  console.log(`\nout_dir=${args.outDir}`);
}

main().catch((err: Error) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
