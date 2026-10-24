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
const image = i => ({ id: `00000000-0000-4000-8000-${String(i).padStart(12, "0")}`,
  image_url: `https://carousel-fixture.supabase.co/storage/v1/object/public/product-images/carousel-${i}.webp`, active: true });
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
      calls++; assert.equal(name, "admin_save_home_carousel"); assert.deepEqual(args.p_images, [image(1)]);
      return { error: fail ? {} : null };
    } } })
  }})("app/admin/(protected)/configuracion/carousel-actions.ts");
  const form = new FormData(); form.set("images", JSON.stringify(Array.from({ length: 11 }, (_, i) => image(i))));
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
