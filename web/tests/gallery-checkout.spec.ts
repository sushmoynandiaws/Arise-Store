import {test, expect} from "@playwright/test";

for (const {width, legacy} of [{width:375,legacy:false},{width:1280,legacy:true}]) test(`${legacy ? "held" : "new"} catalog gallery selection proceeds to payment choice and order confirmation at ${width}px`, async ({page}) => {
  const shop = {id:"gallery-shop",slug:"gallery-shop",name:"Frame shop",kind:"Art & Crafts",commerce_mode:"standard",published:true,payment_methods:["cod"]};
  const product = {id:"frames",shop_id:shop.id,name:"Gallery frames",category:"Art",description:"Canvas board",currency:"BDT",image_url:"",
    fulfilment_kind:"physical",delivery_mode:"shipping",required_buyer_fields:["name","phone","address","district"],payment_methods:["cod"],sales_enabled:true,checkout_available:true,
    variants:[{id:"single",name:"Canvas",price:"150.00",stock:20,pieces_per_set:1}],
    custom_order:{revision:"a".repeat(64),fields:[],craft:{enabled:true,pricing_mode:"per_piece",allow_mixing:true,allow_artwork:false,proof_required:false,
      designs:[{code:"one",label:"Design 1"},{code:"two",label:"Design 2"},{code:"three",label:"Design 3"}]}}};
  let saved: any, quoted: any, accepted: any, releaseHeld = !legacy;
  const selection = () => ({id:"gallery-draft",product_id:product.id,variant_id:"single",quantity:1,ready:true,reason:"",unit_price:"450.00",proof:null,
    selection:saved?.selection || product.custom_order.craft.designs.map(design => ({code:design.code,qty:1})),summary:["Design 1 × 1","Design 2 × 1","Design 3 × 1"]});
  const order = () => ({id:"gallery-order",ref:"SYNTHETIC-FRAME",shop,name:product.name,quantity:1,total:"510.00",currency:"BDT",payment_status:"unpaid",
    fulfilment_kind:"physical",payment_method:"cod",delivery_status:"pending",delivery_mode:"shipping",created_at:new Date().toISOString(),ready:false,payment:null,
    delivery_charge:"60.00",address:quoted?.buyer.address,district:quoted?.buyer.district,custom_summary:selection().summary});
  await page.addInitScript(() => localStorage.setItem("arise_lang","en"));
  await page.route("**/api/**", async route => {
    const path = new URL(route.request().url()).pathname;
    if (path === "/api/catalog") return route.fulfill({json:{shops:[shop],products:[product],synced_at:new Date().toISOString()}});
    if (path === "/api/session") return route.fulfill({json:{user:null,csrf:"synthetic",demo:false,source_web:""}});
    if (path === "/api/promotions") return route.fulfill({json:{ads:[],settings:{}}});
    if (path === "/api/traffic") return route.fulfill({json:{ok:true}});
    if (path === "/api/craft") {saved=route.request().postDataJSON();return route.fulfill({json:selection()});}
    if (path === "/api/craft/gallery-draft") return route.fulfill({json:!releaseHeld
      ? {...selection(),ready:false,unit_price:null,reason:"Seller must verify the selected frame count and package"} : selection()});
    if (path === "/api/checkout/quote") {
      quoted=route.request().postDataJSON();
      return route.fulfill({json:{draft_id:"quote-draft",quote_hash:"source-quote",snapshot:{name:product.name,variant:"Canvas",quantity:1,
        unit_price:"450.00",subtotal:"450.00",delivery_charge:"60.00",advance_amount:"0",total:"510.00",fulfilment_kind:"physical",buyer:quoted.buyer}}});
    }
    if (path === "/api/checkout/accept") {accepted=route.request().postDataJSON();return route.fulfill({json:order()});}
    if (path === "/api/orders/gallery-order") return route.fulfill({json:order()});
    throw new Error(`Unexpected API call ${path}`);
  });
  await page.setViewportSize({width,height:900});
  await page.goto(`/checkout/frames?variant=single&quantity=1${legacy ? "&craft=gallery-draft" : ""}`);
  if (legacy) {
    await expect(page.getByRole("heading",{name:"Seller review and preview",exact:true})).toBeVisible();
    releaseHeld = true;
    await page.getByRole("button",{name:"Check for updates",exact:true}).click();
  } else {
    await page.getByRole("button",{name:"Select all",exact:true}).click();
    await expect(page.getByTestId("craft-product-total")).toContainText("450.00");
    await expect(page.getByText(/Confirm your selection to continue to checkout/)).toBeVisible();
    await page.getByRole("checkbox").check();
    await page.getByRole("button",{name:"Submit selection",exact:true}).click();
  }
  await expect(page.getByRole("heading",{name:"Seller review and preview",exact:true})).toHaveCount(0);
  await expect(page.getByRole("heading",{name:"Checkout",exact:true})).toBeVisible();
  await expect(page.getByRole("group",{name:"Payment method",exact:true})).toBeVisible();
  await expect(page.locator(".summary-line").filter({hasText:"Price per item"})).toContainText("450.00");
  await page.reload();
  await expect(page.getByRole("heading",{name:"Checkout",exact:true})).toBeVisible();
  await page.getByLabel("Full name",{exact:true}).fill("Synthetic buyer");
  await page.getByLabel("Phone number",{exact:true}).fill("01712345678");
  await page.getByLabel("Full delivery address",{exact:true}).fill("House 12 Road 4 Mirpur");
  await page.getByLabel("District",{exact:true}).fill("Dhaka");
  await page.getByRole("button",{name:"Review order",exact:true}).click();
  expect(quoted.custom_draft_id).toBe("gallery-draft");
  expect(quoted.provider).toBe("cod");
  expect(quoted).not.toHaveProperty("total");
  expect(quoted).not.toHaveProperty("unit_price");
  await expect(page.locator(".summary-total strong")).toContainText("510.00");
  await expect(page.getByRole("button",{name:"Confirm order",exact:true})).toBeDisabled();
  await page.getByRole("checkbox").check();
  await page.evaluate(() => {if (document.activeElement instanceof HTMLElement) document.activeElement.blur(); window.scrollTo(0,0);});
  await page.screenshot({path:`../artifacts/gallery-checkout-${width}.png`,fullPage:true});
  await page.getByRole("button",{name:"Confirm order",exact:true}).click();
  await expect(page).toHaveURL(/\/purchases\/gallery-order$/);
  await expect(page.getByText("SYNTHETIC-FRAME",{exact:false})).toBeVisible();
  expect(accepted).toMatchObject({draft_id:"quote-draft",quote_hash:"source-quote",provider:"cod",accepted:true});
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
});
