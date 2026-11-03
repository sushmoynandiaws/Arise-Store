import {test, expect, type Page} from "@playwright/test";

async function catalog(page: Page) {
  const shops = ["one", "two"].map(id => ({id,slug:id,name:`Shop ${id}`,description:"Saved profile",support:"help@example.test",logo_url:"",cover_url:"",published:true,kind:"Art & Crafts",payment_methods:["cod"]}));
  const state = {price:"150.00",fail:false,reads:0,hold:false,pending:false,released:false,release:()=>{}};
  const held = new Promise<void>(resolve => state.release=resolve);
  const products = (id: string) => [1,2].map(n => ({id:`${id}-${n}`,shop_id:id,name:`Complete frame set ${id}-${n}`,category:"Frames",description:"Canvas frames",image_url:"",currency:"BDT",
    fulfilment_kind:"physical",delivery_mode:"shipping",payment_methods:["cod"],sales_enabled:true,checkout_available:true,selected:true,
    variants:[{id:`variant-${id}-${n}`,name:"Complete set",price:state.price,stock:20,pieces_per_set:3}]}));
  await page.addInitScript(() => localStorage.setItem("arise_lang","en"));
  await page.route("**/api/**", async route => {
    const path = new URL(route.request().url()).pathname;
    if (path === "/api/session") return route.fulfill({json:{user:{id:"owner",name:"Owner",email:"owner@example.test"},csrf:"test",demo:false,source_web:"https://example.test"}});
    if (path === "/api/catalog") return route.fulfill({json:{shops,products:shops.flatMap(s => products(s.id)),synced_at:new Date().toISOString()}});
    if (path === "/api/seller") return route.fulfill({json:{shops}});
    if (path === "/api/promotions") return route.fulfill({json:{ads:[],settings:{}}});
    if (path === "/api/traffic") return route.fulfill({json:{ok:true}});
    if (path.endsWith("/questions")) return route.fulfill({json:{questions:[],has_more:false}});
    if (path.endsWith("/offers")) return route.fulfill({json:{offers:[],revision:"a".repeat(64)}});
    const match = path.match(/^\/api\/seller\/stores\/(one|two)\/catalog$/);
    if (match) {
      state.reads++;
      if (state.fail) return route.fulfill({status:503,json:{error:"Source catalog unavailable"}});
      const response = {shop:shops.find(s => s.id===match[1]),products:products(match[1]),payment_methods:["cod"],active:true};
      if (state.hold && match[1] === "one") {state.pending=true;await held;}
      await route.fulfill({json:response});
      if (state.pending && match[1] === "one") state.released=true;
      return;
    }
    throw new Error(`Unexpected API call ${path}`);
  });
  return state;
}

test("seller set prices refresh on focus, interval and manual refresh without discarding edits", async ({page}) => {
  await page.clock.install();
  const source = await catalog(page);
  await page.goto("/seller");
  const first = page.locator(".seller-product").filter({hasText:"Complete frame set one-1"});
  const second = page.locator(".seller-product").filter({hasText:"Complete frame set one-2"}).getByRole("checkbox");
  await expect(first).toContainText("150.00");
  await second.uncheck();
  source.price="900.00";
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await expect(first).toContainText("900.00");
  await expect(second).not.toBeChecked();
  source.price="1200.00";
  await page.clock.fastForward(30001);
  await expect(first).toContainText("1,200.00");
  await expect(second).not.toBeChecked();
  source.price="1300.00";
  await page.getByRole("button",{name:"Refresh from AriseSell",exact:true}).click();
  await expect(first).toContainText("1,300.00");
  await expect(second).not.toBeChecked();
  await page.goto("/settings");
  await page.getByLabel("Shop name",{exact:true}).fill("Unsaved shop name");
  const before=source.reads;
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await expect.poll(() => source.reads).toBeGreaterThan(before);
  await expect(page.getByLabel("Shop name",{exact:true})).toHaveValue("Unsaved shop name");
});

test("failed seller refresh retains the last price with an error and can recover", async ({page}) => {
  const source = await catalog(page);
  await page.goto("/seller");
  const first = page.locator(".seller-product").first();
  await expect(first).toContainText("150.00");
  source.fail=true;source.price="900.00";
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await expect(page.getByText("Source catalog unavailable",{exact:true})).toBeVisible();
  await expect(first).toContainText("150.00");
  source.fail=false;
  await page.getByRole("button",{name:"Refresh from AriseSell",exact:true}).click();
  await expect(first).toContainText("900.00");
  await expect(page.getByText("Source catalog unavailable",{exact:true})).toHaveCount(0);
});

test("late refresh from another shop cannot replace the selected shop", async ({page}) => {
  const source = await catalog(page);
  await page.goto("/seller");
  await expect(page.locator(".seller-product").first()).toContainText("one-1");
  source.hold=true;
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await expect.poll(() => source.pending).toBe(true);
  await page.getByLabel("Choose your AriseSell shop").selectOption("two");
  await expect(page.locator(".seller-product").first()).toContainText("two-1");
  source.release();
  await expect.poll(() => source.released).toBe(true);
  await expect(page.locator(".seller-product").first()).toContainText("two-1");
  await expect(page.locator(".seller-product").filter({hasText:"one-1"})).toHaveCount(0);
});

test("published cards replace the complete set price when returning from AriseSell", async ({page}) => {
  const source = await catalog(page);
  await page.goto("/products");
  const card = page.locator(".product-card").filter({hasText:"Complete frame set one-1"});
  await expect(card).toContainText("150.00");
  source.price="900.00";
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await expect(card).toContainText("900.00");
});
