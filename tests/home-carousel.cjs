// Local unit tests only. No network, credentials, uploads or database writes.
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs"), path = require("node:path"), ts = require("typescript");
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://carousel-fixture.supabase.co";
function loader(overrides = {}) {
  const cache = new Map();
  function load(file) {
    file = path.resolve(file);
    if (cache.has(file)) return cache.get(file).exports;
    const module = { exports: {} }; cache.set(file, module);
    const code = ts.transpileModule(fs.readFileSync(file, "utf8"), { compilerOptions: {
      module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX
    }}).outputText;
    function req(id) {
      if (id in overrides) return overrides[id];
      if (id.startsWith("@/")) return load(id.slice(2) + ".ts");
      if (id.startsWith(".")) return load(path.resolve(path.dirname(file), id) + ".ts");
      return require(id);
    }
    new Function("require", "module", "exports", code)(req, module, module.exports);
    return module.exports;
  }
  return load;
}
const revision = "10000000-0000-4000-8000-000000000001";
const nextRevision = "10000000-0000-4000-8000-000000000002";
const image = i => ({ id: `00000000-0000-4000-8000-${String(i).padStart(12, "0")}`,
  image_url: `https://carousel-fixture.supabase.co/storage/v1/object/public/product-images/carousel-${i}.webp`, active: true });

test("upload preparation is local; invalid files never reach Storage; retries do not overwrite", async () => {
  let uploads = 0, response = { error: null };
  const originalBitmap = global.createImageBitmap;
  global.createImageBitmap = async () => ({ close() {} });
  try {
    const api = loader({ "./products.module.css": {}, "@/lib/supabase/client": { createClient: () => ({ storage: {
      from: () => ({ getPublicUrl: name => ({ data: { publicUrl: `https://carousel-fixture.supabase.co/storage/v1/object/public/product-images/${name}` } }),
        upload: async (_name, _file, options) => { uploads++; assert.equal(options.upsert, false); return response; },
        remove() { assert.fail("Storage files must never be deleted"); }
      })
    } }) } })("app/admin/(protected)/productos/ImageUpload.tsx");
    const file = new File(["fixture"], "photo.png", { type: "image/png" });
    const prepared = await api.prepareImage(file, true);
    assert.equal(uploads, 0);
    assert.equal(prepared.path, (await api.prepareImage(file, true)).path);
    await assert.rejects(api.prepareImage(new File(["x"], "photo.exe", { type: "image/png" }), true));
    await assert.rejects(api.prepareImage(new File([], "photo.png", { type: "image/png" }), true));
    await assert.rejects(api.prepareImage(new File([new Uint8Array(10 * 1024 * 1024 + 1)], "photo.png", { type: "image/png" }), true));
    assert.equal(uploads, 0);
    assert.deepEqual(await api.uploadPreparedImage(prepared), { created: true });
    response = { error: { statusCode: "400", message: "The resource already exists" } };
    assert.deepEqual(await api.uploadPreparedImage(prepared), { created: false });
    response = { error: { statusCode: "403", message: "Access denied" } };
    await assert.rejects(api.uploadPreparedImage(prepared));
  } finally { global.createImageBitmap = originalBitmap; }
});

function draftHarness(initial = [], options = {}) {
  const slots = [], cleanups = []; let cursor = 0, uploads = 0, saves = 0, result = { success: "Carrusel guardado correctamente.", revision: nextRevision };
  const react = {
    useState(initial) { const i = cursor++; slots[i] ??= { value: typeof initial === "function" ? initial() : initial };
      return [slots[i].value, value => { slots[i].value = typeof value === "function" ? value(slots[i].value) : value; }]; },
    useRef(initial) { const i = cursor++; return slots[i] ??= { current: initial }; },
    useEffect(effect) { const i = cursor++; if (!slots[i]) { slots[i] = {}; cleanups.push(effect()); } }
  };
  const prepared = n => ({ file: new File([`fixture-${n}`], `${n}.webp`, { type: "image/webp" }),
    path: `carousel-${n}.webp`, url: image(n).image_url, deduplicate: true });
  const { CarouselImagesForm } = loader({ react, "next/image": { default: "image" }, "./configuracion.module.css": { default: {} }, "./CarouselImagesForm.module.css": { default: {} },
    "../productos/ImageUpload": { ImageUpload: "upload", prepareImage: async file => {
      if (options.invalid === file.name) throw Error("invalid file"); return prepared(Number(file.name.split(".")[0]));
    }, uploadPreparedImage: async file => { uploads++; if (options.failUpload) throw Error("lost response"); return { created: true }; } },
    "./carousel-actions": { saveCarousel: async (_state, form) => { saves++; options.onSave?.(form); if (options.saveThrows) throw new TypeError("network"); return result; } }
  })("app/admin/(protected)/configuracion/CarouselImagesForm.tsx");
  function render() { cursor = 0; return CarouselImagesForm({ initial, initialRevision: revision }); }
  function walk(node, predicate) {
    if (!node || typeof node !== "object") return [];
    if (Array.isArray(node)) return node.flatMap(item => walk(item, predicate));
    return [...(predicate(node) ? [node] : []), ...walk(node.props?.children, predicate)];
  }
  function text(node) { if (node == null || typeof node === "boolean") return "";
    if (Array.isArray(node)) return node.map(text).join(" "); return typeof node === "object" ? text(node.props?.children) : String(node); }
  return {
    render, prepared, text: () => text(render()), find: predicate => walk(render(), predicate),
    select(n) { walk(render(), n => n.type === "upload")[0].props.onSelect(prepared(n)); },
    submit: () => render().props.onSubmit({ preventDefault() {} }),
    setResult(value) { result = { revision: nextRevision, ...value }; }, get uploads() { return uploads; }, get saves() { return saves; },
    close() { cleanups.forEach(fn => fn?.()); }
  };
}

test("draft selection/removal creates no upload; failed save keeps edits and reuses confirmed uploads", async () => {
  const h = draftHarness();
  try {
    h.select(1); assert.equal(h.uploads, 0); assert.match(h.text(), /Cambios sin guardar/);
    h.find(n => n.type === "button" && n.props.children === "Eliminar")[0].props.onClick();
    assert.equal(h.uploads, 0); assert.doesNotMatch(h.text(), /Cambios sin guardar/);
    h.select(2); h.setResult({ error: "No se pudo confirmar el guardado" });
    await h.submit(); assert.equal(h.uploads, 1); assert.equal(h.saves, 1);
    assert.match(h.text(), /Cambios sin guardar/); assert.match(h.text(), /No se pudo confirmar/);
    assert.doesNotMatch(h.text(), /Carrusel guardado correctamente/);
    assert.equal(h.find(n => n.type === "image").length, 1);
    h.setResult({ success: "Carrusel guardado correctamente." }); await h.submit();
    assert.equal(h.uploads, 1); assert.equal(h.saves, 2);
    assert.match(h.text(), /Carrusel guardado correctamente/); assert.doesNotMatch(h.text(), /Cambios sin guardar/);
  } finally { h.close(); }
});

test("each add, order, activation and removal clears stale success", async () => {
  const h = draftHarness([image(1)]);
  try {
    h.select(2); await h.submit();
    const checkDirty = () => { assert.match(h.text(), /Cambios sin guardar/); assert.doesNotMatch(h.text(), /Carrusel guardado correctamente/); };
    h.find(n => n.type === "input" && n.props.type === "checkbox")[0].props.onChange({ target: { checked: false } });
    checkDirty(); await h.submit();
    h.find(n => n.props?.["aria-label"] === "Mover fotografía 1 después")[0].props.onClick();
    checkDirty(); await h.submit();
    h.find(n => n.type === "button" && n.props.children === "Eliminar")[0].props.onClick();
    checkDirty(); await h.submit();
    h.select(3); checkDirty();
  } finally { h.close(); }
});

test("validate all local files before uploading; uncertain upload keeps the draft without saving", async () => {
  const h = draftHarness([], { invalid: "2.webp" });
  try {
    h.select(1); h.select(2); await h.submit(); assert.equal(h.uploads, 0); assert.equal(h.saves, 0);
    assert.match(h.text(), /Cambios sin guardar/);
  } finally { h.close(); }
  const failure = draftHarness([], { failUpload: true });
  try {
    failure.select(1); await failure.submit(); assert.equal(failure.saves, 0);
    assert.match(failure.text(), /estado por comprobar/); assert.match(failure.text(), /Cambios sin guardar/);
    assert.doesNotMatch(failure.text(), /Carrusel guardado correctamente/);
  } finally { failure.close(); }
});

test("double submit runs one save and the tenth image removes the picker", async () => {
  const h = draftHarness();
  try {
    h.select(1); await Promise.all([h.submit(), h.submit()]);
    assert.equal(h.uploads, 1); assert.equal(h.saves, 1);
  } finally { h.close(); }
  const full = draftHarness(Array.from({ length: 10 }, (_, i) => image(i)));
  try { assert.equal(full.find(n => n.type === "upload").length, 0); } finally { full.close(); }
});
test("empty, ten images and inactive entries are accepted; eleven rejected", () => {
  const { validateCarousel } = loader()("lib/home-carousel.ts");
  assert.deepEqual(validateCarousel([]), []);
  assert.equal(validateCarousel(Array.from({ length: 10 }, (_, i) => image(i))).length, 10);
  assert.equal(validateCarousel([{ ...image(1), active: false }])[0].active, false);
  assert.equal(validateCarousel(Array.from({ length: 11 }, (_, i) => image(i))), null);
});
test("duplicate URLs, duplicate IDs and invalid data are rejected", () => {
  const { validateCarousel } = loader()("lib/home-carousel.ts");
  for (const value of [null, {}, [image(1), image(1)], [image(1), { ...image(2), image_url: image(1).image_url }],
    [image(1), { ...image(2), id: image(1).id }], [{ ...image(1), active: "true" }], [{ ...image(1), id: "invalid" }]]) {
    assert.equal(validateCarousel(value), null);
  }
});
test("only the configured bucket root and supported image extensions are accepted", () => {
  const { carouselImageUrl } = loader()("lib/home-carousel.ts");
  for (const extension of ["jpg", "jpeg", "png", "webp"]) assert.equal(carouselImageUrl(image(1).image_url.replace("webp", extension)), true);
  for (const value of ["/images/photo.jpg", image(1).image_url.replace("carousel-fixture", "other"),
    image(1).image_url + "?x=1", image(1).image_url.replace("carousel-1", "folder/photo"),
    image(1).image_url.replace("webp", "svg"), image(1).image_url.replace("https:", "http:")]) assert.equal(carouselImageUrl(value), false);
});
test("unauthorized admin action never invokes the save RPC", async () => {
  let calls = 0;
  const { saveCarousel } = loader({ "next/cache": { revalidatePath() {} }, "../productos/access": {
    productAccess: async () => ({ allowed: false, supabase: { rpc() { calls++; } } })
  }})("app/admin/(protected)/configuracion/carousel-actions.ts");
  const result = await saveCarousel({}, new FormData());
  assert.ok(result.error); assert.equal(calls, 0);
});
test("admin save validates payload and sends one atomic RPC; errors remain recoverable", async () => {
  let calls = 0, fail = false;
  const { saveCarousel } = loader({ "next/cache": { revalidatePath() {} }, "../productos/access": {
    productAccess: async () => ({ allowed: true, supabase: { rpc: async (name, args) => {
      calls++; assert.equal(name, "admin_save_home_carousel_v2"); assert.equal(args.p_expected_revision, revision); assert.deepEqual(args.p_images, [image(1)]);
      return { data: nextRevision, error: fail ? {} : null };
    } } })
  }})("app/admin/(protected)/configuracion/carousel-actions.ts");
  const form = new FormData(); form.set("revision", revision); form.set("images", JSON.stringify(Array.from({ length: 11 }, (_, i) => image(i))));
  assert.ok((await saveCarousel({}, form)).error); assert.equal(calls, 0);
  form.set("images", JSON.stringify([image(1)]));
  assert.ok((await saveCarousel({}, form)).success); assert.equal(calls, 1);
  fail = true; assert.ok((await saveCarousel({}, form)).error);
});
test("public section hides on empty/missing table; active ordered query recovers", async () => {
  let result = { error: {}, data: null };
  const db = { from(name) { assert.equal(name, "home_carousel_images"); return this; }, select() { return this; },
    eq(key, value) { assert.equal(key, "active"); assert.equal(value, true); return this; },
    order(key) { assert.equal(key, "sort_order"); return this; }, limit: async n => { assert.equal(n, 10); return result; } };
  const { HomeImageCarousel } = loader({ "@/lib/products/public-client": { publicClient: () => db },
    "./HomeImageCarouselTrack": { HomeImageCarouselTrack: "track" }
  })("components/home/HomeImageCarousel.tsx");
  assert.equal(await HomeImageCarousel(), null);
  result = { error: null, data: [] }; assert.equal(await HomeImageCarousel(), null);
  result = { error: null, data: [image(1)] }; assert.equal((await HomeImageCarousel()).props.images.length, 1);
});


test("diagnostics redact arbitrary exception content and classify known codes", () => {
  const { carouselFailure } = loader()("app/admin/(protected)/configuracion/carousel-errors.ts");
  const logs = [], original = console.error;
  console.error = (...args) => logs.push(args);
  try {
    for (const [code, pattern] of [["42501", /permisos/], ["PGRST202", /configuración/], ["NETWORK_ERROR", /conexión/], ["secret-token", /guardar|guardado/]]) {
      const message = carouselFailure("save", { code, message: "secret-token", details: "private", session: "private" });
      assert.match(message, pattern); assert.match(message, /Incidencia:/);
      assert.doesNotMatch(message, /secret-token|private/);
    }
    assert.doesNotMatch(JSON.stringify(logs), /secret-token|private/);
    for (const [, entry] of logs) assert.deepEqual(Object.keys(entry).sort(), ["code", "incident", "operation"]);
  } finally { console.error = original; }
});

test("confirmed persistence survives cache failure, while RPC exceptions stay recoverable", async () => {
  let failSave = false, calls = 0;
  const { saveCarousel } = loader({ "next/cache": { revalidatePath() { throw Error("cache failed"); } },
    "../productos/access": { productAccess: async () => ({ allowed: true, supabase: { rpc: async () => {
      calls++; if (failSave) throw new TypeError("network failed"); return { data: nextRevision, error: null };
    } } }) }
  })("app/admin/(protected)/configuracion/carousel-actions.ts");
  const form = new FormData(); form.set("revision", revision); form.set("images", JSON.stringify([image(1)]));
  const result = await saveCarousel({}, form);
  assert.ok(result.success); assert.ok(result.warning); assert.equal(result.error, undefined); assert.equal(calls, 1);
  failSave = true;
  const failure = await saveCarousel({}, form); assert.ok(failure.error); assert.equal(failure.success, undefined);
});

test("authentication redirects propagate unchanged instead of becoming incidents", async () => {
  const { redirect } = require("next/navigation");
  const { saveCarousel } = loader({ "../productos/access": { productAccess: async () => redirect("/admin/login") } })("app/admin/(protected)/configuracion/carousel-actions.ts");
  await assert.rejects(saveCarousel({}, new FormData()), error => error.digest.startsWith("NEXT_REDIRECT;"));
});

test("saved draft with refresh warning is clean and does not upload again", async () => {
  const h = draftHarness();
  try {
    h.select(1); h.setResult({ success: "Carrusel guardado correctamente.", warning: "Guardado; recarga para actualizar." });
    await h.submit(); assert.match(h.text(), /Guardado; recarga/); assert.doesNotMatch(h.text(), /Cambios sin guardar/);
    await h.submit(); assert.equal(h.uploads, 1); assert.equal(h.saves, 1);
  } finally { h.close(); }
});


test("client save exception preserves draft and confirmed upload on retry", async () => {
 const options = { saveThrows: true }; const h = draftHarness([], options);
 try {
  h.select(1); await h.submit(); assert.match(h.text(), /Incidencia:/); assert.match(h.text(), /Cambios sin guardar/);
  options.saveThrows = false; await h.submit(); assert.equal(h.uploads, 1); assert.equal(h.saves, 2);
  assert.match(h.text(), /Carrusel guardado correctamente/);
 } finally { h.close(); }
});

test("authorization exceptions receive safe incidents", async () => {
 const { saveCarousel } = loader({ "../productos/access": { productAccess: async () => { throw new TypeError("private connection details"); } } })("app/admin/(protected)/configuracion/carousel-actions.ts");
 const result = await saveCarousel({}, new FormData()); assert.match(result.error, /Incidencia:/); assert.doesNotMatch(result.error, /private/);
});


test("admin carousel query exceptions show an unavailable form, not an empty editable carousel", async () => {
 const db = { rpc: async () => { throw new TypeError("network failed"); }, from(table) {
  if (table === "store_settings") return { select: () => ({ limit: () => ({ maybeSingle: async () => ({ data: { id: "fixture" }, error: null }) }) }) };
  return { select: () => ({ order: async () => { throw new TypeError("network failed"); } }) };
 } };
 const page = loader({ "../productos/access": { productAccess: async () => ({ allowed: true, supabase: db }) },
  "./SettingsForm": { SettingsForm: "settings" }, "./BannerImagesForm": { BannerImagesForm: "banners" },
  "./HeroImageForm": { HeroImageForm: "hero" }, "./CarouselImagesForm": { CarouselImagesForm: "carousel" },
  "./configuracion.module.css": { default: {} }
 })("app/admin/(protected)/configuracion/page.tsx");
 const tree = await page.default();
 const form = tree.props.children.find(child => child?.type === "carousel");
 assert.match(form.props.unavailable, /Incidencia:/); assert.deepEqual(form.props.initial, []);
});


test("revision: stale RPC response keeps the draft and never adopts a newer revision", async () => {
 const revisions = []; const h = draftHarness([image(1)], { onSave: form => revisions.push(form.get("revision")) });
 try {
  h.select(2); h.setResult({ error: "CAROUSEL_CONFLICT: otra pesta\u00f1a", revision: nextRevision });
  await h.submit(); await h.submit();
  assert.deepEqual(revisions, [revision, revision]); assert.equal(h.uploads, 1);
  assert.match(h.text(), /CAROUSEL_CONFLICT/); assert.match(h.text(), /Cambios sin guardar/);
  assert.equal(h.find(n => n.type === "image").length, 2);
 } finally { h.close(); }
});

test("revision: successful save adopts returned revision for empty, order and active changes", async () => {
 const revisions = [], payloads = [];
 const h = draftHarness([image(1), image(2)], { onSave: form => { revisions.push(form.get("revision")); payloads.push(JSON.parse(form.get("images"))); } });
 try {
  h.find(n => n.props?.["aria-label"] === "Mover fotograf\u00eda 1 despu\u00e9s")[0].props.onClick();
  await h.submit();
  h.find(n => n.type === "input" && n.props.type === "checkbox")[0].props.onChange({ target: { checked: false } });
  await h.submit();
  while (h.find(n => n.type === "button" && n.props.children === "Eliminar").length) h.find(n => n.type === "button" && n.props.children === "Eliminar")[0].props.onClick();
  await h.submit();
  assert.deepEqual(revisions, [revision, nextRevision, nextRevision]);
  assert.equal(payloads[0][0].id, image(2).id); assert.equal(payloads[1][0].active, false); assert.deepEqual(payloads[2], []);
 } finally { h.close(); }
});

test("revision: action requires revision and passes CAROUSEL_CONFLICT without success or revalidation", async () => {
 let calls = 0;
 const { saveCarousel } = loader({ "next/cache": { revalidatePath() { assert.fail("conflict must not revalidate"); } },
  "../productos/access": { productAccess: async () => ({ allowed: true, supabase: { rpc: async (name, args) => {
   calls++; assert.equal(name, "admin_save_home_carousel_v2"); assert.equal(args.p_expected_revision, revision);
   return { error: { code: "P0001", message: "CAROUSEL_CONFLICT" }, data: null };
  } } }) }
 })("app/admin/(protected)/configuracion/carousel-actions.ts");
 const form = new FormData(); form.set("images", "[]");
 assert.ok((await saveCarousel({}, form)).error); assert.equal(calls, 0);
 form.set("revision", revision); const result = await saveCarousel({}, form);
 assert.match(result.error, /otra pesta/); assert.equal(result.success, undefined); assert.equal(result.revision, undefined); assert.equal(calls, 1);
});

test("revision: incremental SQL compares under lock before invoking private original save", () => {
 const sql = fs.readFileSync("supabase/proposals/home-carousel-revision.sql", "utf8");
 const body = sql.slice(sql.indexOf("create function public.admin_save_home_carousel_v2"));
 assert.ok(body.indexOf("lock table") < body.indexOf("p_expected_revision is distinct from"));
 assert.ok(body.indexOf("CAROUSEL_CONFLICT") < body.indexOf("perform public.admin_save_home_carousel"));
 assert.match(sql, /before insert or update or delete or truncate/);
 assert.match(sql, /revoke all on function public.admin_save_home_carousel\(jsonb\)/);
 assert.doesNotMatch(sql, /create table public.home_carousel_images/);
 assert.match(sql, /coalesce\(\(select jsonb_agg/);
});
