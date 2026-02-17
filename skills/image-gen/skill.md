---
name: image-gen
description: Generate/edit images via OpenRouter (multi-model). Use for image create/edit requests. Covers all use cases: app icons, onboarding sets, backgrounds, batch exploration. Supports text-to-image + image-to-image editing; 1K/2K/4K; all aspect ratios.
---

# image-gen

Unified image generation skill powered by OpenRouter. One CLI, every model.

## Setup

```bash
export OPENROUTER_API_KEY=sk-or-...   # set in ~/.zshrc or pass --api-key
```

## Run

```bash
bun run ~/.claude/skills/image-gen/scripts/gen.ts --prompt "..." [options]
```

## Models

### FLUX family (`flux`, `flux-fast`, `flux-max`, `flux-text`)

**Character:** Photorealistic. Strong prompt adherence. Handles complex scenes, lighting, and spatial relationships well. The default choice for anything that should look like a real photograph or high-end render.

**Prompting style:** Photography language works well — focal length, lighting type, film stock, camera settings. Descriptive and specific beats abstract.
```
"product photo of a glass bottle, studio lighting, white background, f/2.8, shallow depth of field"
"aerial view of a coastline at golden hour, 35mm film, warm tones"
```

**Variants:**
- `flux-fast` — small/fast model (4B params). Good enough to evaluate composition and color; noticeably softer detail than `flux`. Use for cheap exploration batches, not finals.
- `flux` — Pro. Best balance of quality and cost. Default for most tasks.
- `flux-max` — highest quality FLUX. Worth the extra cost for hero images or print assets.
- `flux-text` — Flex variant with better support for following detailed compositional instructions. Useful when you're being very precise about layout.

---

### Gemini (`nano`, `nano-pro`)

**Character:** More illustrative and graphic by default. Doesn't try to look like a photo — tends toward clean, stylized output. Great for app-style graphics, icons, and flat design work. Prompts about "illustration style" or "flat design" land better here than on FLUX.

**Prompting style:** Design-language terms work well — "flat design", "minimal", "icon", "illustration", "vector-style". Avoid photography terms.
```
"app icon: abstract soundwave, dark navy background, coral accent, flat design, no text"
"onboarding illustration: two people collaborating, isometric, soft pastel palette"
```

**Variants:**
- `nano` — Flash (cheaper/faster). Good for illustrations and exploration. Output quality is solid for app graphics.
- `nano-pro` — Pro. Better detail and the best editing support of any model here. Preferred for final icon work and image-to-image editing. Understands "keep the subject, change X" instructions reliably.

---

### GPT (`gpt`)

**Character:** Reasoning-enhanced. Use when the prompt involves complex relationships, multi-step logic, or concepts that require understanding rather than just visual pattern matching. E.g. "a diagram showing X causes Y which leads to Z" or a scene with specific spatial/narrative rules.

**Prompting style:** You can write almost like a spec. It reads and reasons over the instruction before generating.
```
"a split-screen: left side shows a messy desk with scattered papers, right side shows the same desk organized with labeled folders. Lighting identical on both sides."
```

**Cost warning:** Token-based pricing. Long prompts cost more. Keep prompts focused.

---

### Riverflow (`riverflow`, `riverflow-fast`)

**Character:** The only model here that renders text reliably. All other models will hallucinate, blur, or corrupt letters — especially beyond a word or two. Use Riverflow whenever the image needs legible text: posters, logos, UI mockups, signage.

**Prompting style:** Be explicit about typography — font weight, capitalization, color, position. It follows typographic instructions precisely.
```
"bold sans-serif 'LAUNCH' centered, white on black, geometric red underline accent"
"storefront sign: 'OPEN' in neon green tubes, dark brick background, night scene"
```

**Variants:**
- `riverflow` — Pro. Use for finals. Best text accuracy.
- `riverflow-fast` — Same model, faster/cheaper tier. Fine for proofing text placement before running `riverflow`.

---

### Seedream (`seedream`)

**Character:** ByteDance's model. Good general-purpose quality at a low price point. Tends to do well with portraits and character-focused images. Worth including in exploration batches as a cheap alternative to `flux`.

**Prompting style:** Similar to FLUX — descriptive works well. No strong stylistic bias.

---

## Model Selection Guide

| Use case | Model | Why |
|---|---|---|
| App icon candidates (fast) | `flux-fast` or `nano` | Cheap, iterate quickly |
| App icon final | `nano-pro` | Clean graphic style + best editing |
| Onboarding illustrations | `nano` or `nano-pro` | Illustrative aesthetic fits |
| Backgrounds / hero images | `flux-max` or `flux` | Photorealistic depth |
| Product / photo-style | `flux` or `flux-max` | Photography language, realism |
| Text in image | `riverflow` | Only reliable text renderer |
| Typographic proof | `riverflow-fast` | Check layout before final run |
| Edit existing image | `nano-pro` | Best image-to-image editing |
| Complex multi-part instruction | `gpt` | Reasoning-enhanced generation |
| Cheap exploration batch | `flux-fast` or `seedream` | Lowest cost |

## Flags

```
-p, --prompt <text>          Image prompt (required)
-m, --model <alias|id>       Model alias or full OpenRouter model ID (default: flux)
-n, --count <N>              Generate N images (default: 1)
-r, --resolution <1K|2K|4K>  Resolution (default: 1K)
-a, --aspect <ratio>         1:1 | 16:9 | 9:16 | 4:3 | 3:4 | 21:9 (default: 1:1)
-i, --input-image <path>     For editing: input image path (base64 encoded)
-o, --out-dir <path>         Output directory (default: CWD)
-g, --gallery                Write index.html gallery (auto when --count > 1)
-k, --api-key <key>          Override OPENROUTER_API_KEY env
    --dry-run                Print config, skip API calls
```

## Example Commands

### App icon candidates (fast + cheap)
```bash
bun run ~/.claude/skills/image-gen/scripts/gen.ts \
  --prompt "minimal app icon, dark background, glowing gradient orb, no text" \
  --model flux-fast --count 8 --out-dir ./icons
open ./icons/index.html
```

### App icon final (highest quality)
```bash
bun run ~/.claude/skills/image-gen/scripts/gen.ts \
  --prompt "premium app icon: abstract waveform, midnight blue, electric teal accent" \
  --model nano-pro --resolution 2K --out-dir ./icons-final
```

### Onboarding set (consistent style)
```bash
bun run ~/.claude/skills/image-gen/scripts/gen.ts \
  --prompt "onboarding illustration: person using phone, flat design, warm palette" \
  --model flux --count 5 --aspect 9:16 --out-dir ./onboarding
open ./onboarding/index.html
```

### Background / hero image
```bash
bun run ~/.claude/skills/image-gen/scripts/gen.ts \
  --prompt "abstract gradient mesh, deep space, aurora colors, 4K wallpaper" \
  --model flux-max --resolution 2K --aspect 16:9 --out-dir ./backgrounds
```

### Image editing (edit existing)
```bash
bun run ~/.claude/skills/image-gen/scripts/gen.ts \
  --prompt "make the background completely white, keep the subject" \
  --model nano-pro --input-image ./original.png --out-dir ./edited
```

### Text-in-image (logo / poster)
```bash
bun run ~/.claude/skills/image-gen/scripts/gen.ts \
  --prompt "minimal poster: bold sans-serif LAUNCH in white on black, geometric accent" \
  --model riverflow --out-dir ./posters
```

### Batch exploration (cheapest)
```bash
bun run ~/.claude/skills/image-gen/scripts/gen.ts \
  --prompt "cyberpunk city street, neon rain, ultra detailed" \
  --model flux-fast --count 12 --out-dir ./explore
open ./explore/index.html
```

## Workflow: Draft → Iterate → Final

1. **Draft** — `--model flux-fast --count 8` to get 8 cheap options fast
2. **Iterate** — pick best, refine prompt, `--model flux --count 4`
3. **Final** — `--model flux-max` or `--model nano-pro --resolution 2K` on winner

## Output

- `{YYYY-MM-DD-HHMMSS}-{slug}.png` — single image
- `{YYYY-MM-DD-HHMMSS}-{slug}-NN.png` — batch (with `-NN` index suffix)
- `index.html` — gallery (auto-enabled when `--count > 1` or `--gallery`)

## Common Failures

| Error | Fix |
|---|---|
| `OPENROUTER_API_KEY not set` | `export OPENROUTER_API_KEY=sk-or-...` |
| `HTTP 401` | Check API key validity at openrouter.ai |
| `HTTP 402` | Add credits at openrouter.ai/credits |
| `HTTP 422 / model not found` | Check model string; see openrouter.ai/models |
| No image in response | Model may not support `modalities: ["image"]`; try different model |
| `Input image not found` | Check `--input-image` path; must be local file |

## Note on nano-banana-pro

`nano-banana-pro` skill stays separate — it's optimized for direct Gemini 3 Pro editing workflows with a different UX. Use `image-gen --model nano-pro` for the same model when you want the unified CLI.
