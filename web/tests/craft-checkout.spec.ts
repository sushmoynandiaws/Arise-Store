import {test, expect} from "@playwright/test";

const shop = {id:"art-shop", slug:"art-shop",name:"Art shop",kind:"Art & Crafts",commerce_mode:"standard",published:true,payment_methods:["cod"],support:"help@example.test"};
const product = {id:"canvas",shop_id:shop.id,name:"Custom canvas",category:"Art",description:"Personal canvas",image_url:"",currency:"BDT",
  fulfilment_kind:"physical",delivery_mode:"shipping",required_buyer_fields:["name","phone","address","district"],payment_methods:["cod"],sales_enabled:true,checkout_available:true,
  variants:[{id:"small",name:"Small canvas",price:"600",stock:4}],custom_order:{revision:"a".repeat(64),fields:[{id:"printed",label:"Printed name",question:"Which name should be printed?",type:"text",required:true,options:[]}],
    craft:{enabled:true,allow_mixing:false,allow_artwork:true,proof_required:true,designs:[{code:"D1",label:"Floral"},{code:"D2",label:"Geometric"}]}}};

test("mobile custom selection waits for seller proof, approves it and passes source draft to checkout", async ({page}) => {
  let approved = false, saved: any, quote: any;
  const selection = () => ({id:"custom-draft",product_id:product.id,variant_id:"small",quantity:1,unit_price:approved?"725.50":null,ready:approved,reason:approved?"":"Merchant preview and customer proof approval are required",
    proof:{id:"proof-1",url:"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'/%3E",revision:"b".repeat(64),approved}});
  await page.addInitScript(() => localStorage.setItem("arise_lang","en"));
  await page.route("**/api/**", async route => {
    const path = new URL(route.request().url()).pathname;
    if(path === "/api/catalog") return route.fulfill({json:{shops:[shop],products:[product],synced_at:new Date().toISOString()}});
    if(path === "/api/session") return route.fulfill({json:{user:null,csrf:"csrf",demo:false,source_web:""}});
    if(path === "/api/promotions") return route.fulfill({json:{ads:[],settings:{}}});
    if(path === "/api/traffic") return route.fulfill({json:{ok:true}});
    if(path === "/api/craft") {saved=route.request().postDataJSON();return route.fulfill({json:selection()});}
    if(path === "/api/craft/custom-draft") return route.fulfill({json:selection()});
    if(path.endsWith("/approve")) {expect(route.request().postDataJSON()).toEqual({proof_id:"proof-1",revision:"b".repeat(64)});approved=true;return route.fulfill({json:selection()});}
    if(path === "/api/checkout/quote") {quote=route.request().postDataJSON();return route.fulfill({json:{draft_id:"custom-draft",quote_hash:"quote",snapshot:{name:product.name,variant:"Small canvas",quantity:1,total:"670",delivery_charge:"70",advance_amount:"180",buyer:quote.buyer}}});}
    throw new Error(`Unexpected API call ${path}`);
  });
  await page.setViewportSize({width:375,height:812});
  await page.goto("/checkout/canvas?variant=small&quantity=1");
  await expect(page.getByRole("button", {name:"Select all",exact:true})).toHaveCount(0);
  await page.getByRole("button", {name:"Geometric",exact:true}).click();
  await page.getByRole("button", {name:"Floral",exact:true}).click();
  await expect(page.getByRole("button", {name:"Geometric",exact:true})).toHaveAttribute("aria-pressed","false");
  await page.getByLabel("Printed name").fill("Exact spelling");
  await page.getByRole("checkbox").check();
  await page.getByRole("button",{name:"Submit selection",exact:true}).click();
  await expect(page.getByRole("heading",{name:"Seller review and preview"})).toBeVisible();
  expect(saved.answers.printed).toBe("Exact spelling");
  expect(saved.selection).toEqual([{code:"D1",qty:1}]);
  await expect(page.getByRole("button",{name:"Review order",exact:true})).toHaveCount(0);
  await page.getByRole("button",{name:"I approve this preview",exact:true}).click();
  await expect(page.locator(".summary-line").filter({hasText:"Price per item"})).toContainText("725.50");
  await page.getByLabel("Full name",{exact:true}).fill("Craft buyer");
  await page.getByLabel("Phone number",{exact:true}).fill("01712345678");
  await page.getByLabel("Full delivery address",{exact:true}).fill("House 12 Road 4 Mirpur");
  await page.getByLabel("District",{exact:true}).fill("Dhaka");
  await page.getByRole("button",{name:"Review order",exact:true}).click();
  expect(quote.custom_draft_id).toBe("custom-draft");
  expect(quote).not.toHaveProperty("total");
  await expect(page.getByText(/Required advance payment/)).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  await page.screenshot({path:"../artifacts/craft-checkout-mobile.png",fullPage:true});
});

test("gallery allows multiple designs and select all beyond a one-piece package, pending seller review", async ({page}) => {
  let saved: any;
  const image = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='160'%3E%3Crect width='120' height='160' fill='%236336d6'/%3E%3C/svg%3E";
  const gallery = {...product, variants: [
    {id:"single",name:"Canvas Single",price:"50",stock:4,pieces_per_set:1,size:"8×6 inch",color:"Canvas board"},
    {id:"triple",name:"Canvas Triple",price:"150",stock:4,pieces_per_set:3,size:"8×6 inch",color:"Canvas board"},
    {id:"large",name:"Large Triple",price:"300",stock:4,pieces_per_set:3,size:"12×8 inch",color:"Canvas board"},
  ], custom_order:{...product.custom_order,fields:[{id:"finish",label:"Finish",question:"Choose a finish",type:"select",required:false,options:[{label:"Gloss",extra_price:"25.00"}]}],craft:{...product.custom_order.craft,pricing_mode:"per_piece",allow_mixing:true,allow_artwork:false,designs:[
    {code:"messi",label:"Messi 10",image_url:image}, {code:"neymar",label:"Neymar 11",image_url:image},
    {code:"generated",label:"Messenger_creation_84853978-C513-45FF-ACBE-BAFB0A6DFF83",image_url:image},
    ...Array.from({length:8},(_,index) => ({code:`extra-${index}`,label:`Gallery choice ${index + 4}`,image_url:image})),
  ]}}};
  await page.addInitScript(() => localStorage.setItem("arise_lang","en"));
  await page.route("**/api/**", async route => {
    const path = new URL(route.request().url()).pathname;
    if(path === "/api/catalog") return route.fulfill({json:{shops:[shop],products:[gallery],synced_at:new Date().toISOString()}});
    if(path === "/api/session") return route.fulfill({json:{user:null,csrf:"csrf",demo:false,source_web:""}});
    if(path === "/api/promotions") return route.fulfill({json:{ads:[],settings:{}}});
    if(path === "/api/traffic") return route.fulfill({json:{ok:true}});
    if(path === "/api/craft") {saved=route.request().postDataJSON();return route.fulfill({json:{id:"gallery-draft",product_id:gallery.id,variant_id:saved.variant_id,quantity:2,ready:false,reason:"Seller review required",proof:null,summary:["Messi 10 × 2", "Neymar 11 × 1"]}});}
    if(path === "/api/craft/gallery-draft") return route.fulfill({json:{id:"gallery-draft",product_id:gallery.id,variant_id:saved.variant_id,quantity:2,ready:false,reason:"Seller review required",proof:null}});
    throw new Error(`Unexpected API call ${path}`);
  });
  await page.setViewportSize({width:375,height:812});
  await page.goto("/checkout/canvas?variant=triple&quantity=2");
  await expect(page.locator(".craft-selection-count")).toHaveText(/Selected: 0.*Package includes 3/);
  await expect(page.getByTestId("craft-product-total")).toContainText("0.00");
  await expect(page.getByText("Messenger_creation",{exact:false})).toHaveCount(0);
  await expect(page.getByRole("button",{name:"Design 3",exact:true})).toBeVisible();
  await page.getByRole("button",{name:"Messi 10",exact:true}).click();
  await expect(page.getByTestId("craft-product-total")).toContainText("100.00");
  await page.getByRole("button",{name:"Increase Messi 10",exact:true}).click();
  await expect(page.getByTestId("craft-product-total")).toContainText("200.00");
  await page.getByRole("button",{name:"Neymar 11",exact:true}).click();
  await expect(page.locator(".craft-selection-count")).toHaveText(/Selected: 3.*Package includes 3/);
  await page.getByRole("checkbox").check();
  await expect(page.getByRole("button",{name:"Design 3",exact:true})).toBeEnabled();
  await page.getByLabel("Package",{exact:true}).selectOption("single");
  await expect(page.getByRole("checkbox")).not.toBeChecked();
  await expect(page.getByRole("button",{name:"Submit selection",exact:true})).toBeDisabled();
  await expect(page.locator(".craft-selection-count")).toHaveText(/Selected: 3.*Package includes 1/);
  await expect(page.getByTestId("craft-product-total")).toContainText("300.00");
  await expect(page.getByText(/The price updates automatically for your selected pieces\./)).toBeVisible();
  await page.getByRole("checkbox").check();
  await expect(page.getByRole("button",{name:"Submit selection",exact:true})).toBeEnabled();
  await page.getByLabel("Package",{exact:true}).selectOption("large");
  await expect(page.getByTestId("craft-product-total")).toContainText("600.00");
  await page.getByLabel("Package",{exact:true}).selectOption("triple");
  await page.getByLabel("Finish").selectOption("Gloss");
  await expect(page.getByTestId("craft-product-total")).toContainText("350.00");
  await page.getByRole("checkbox").check();
  await page.getByRole("button",{name:"Submit selection",exact:true}).click();
  await expect(page.getByRole("heading",{name:"Seller review and preview"})).toBeVisible();
  expect(saved.quantity).toBe(2);
  expect(saved.selection).toEqual([{code:"messi",qty:2},{code:"neymar",qty:1}]);
  expect(saved.config_revision).toBe(gallery.custom_order.revision);
  expect(saved).not.toHaveProperty("price");
  await page.getByRole("button",{name:"Change selection",exact:true}).click();
  await expect(page.locator(".craft-selection-count")).toHaveText(/Selected: 3.*Package includes 3/);
  await page.getByRole("button",{name:"Neymar 11",exact:true}).click();
  await expect(page.getByTestId("craft-product-total")).toContainText("250.00");
  await page.getByRole("button",{name:"Design 3",exact:true}).click();
  await expect(page.getByRole("button",{name:"Design 3",exact:true})).toHaveAttribute("aria-pressed","true");
  await page.getByLabel("Package",{exact:true}).selectOption("single");
  await page.getByRole("checkbox").check();
  await page.getByRole("button",{name:"Select all",exact:true}).click();
  await expect(page.getByRole("checkbox")).not.toBeChecked();
  await expect(page.locator(".craft-selection-count")).toHaveText(/Selected: 12.*Package includes 1/);
  await expect(page.getByTestId("craft-product-total")).toContainText("1,250.00");
  await expect(page.locator('.craft-design-choice[aria-pressed="true"]')).toHaveCount(11);
  await expect(page.getByLabel("Messi 10 quantity",{exact:true})).toHaveText("2");
  await expect(page.getByRole("button",{name:"Select all",exact:true})).toBeDisabled();
  await page.getByRole("button",{name:"Clear designs",exact:true}).click();
  await expect(page.locator('.craft-design-choice[aria-pressed="true"]')).toHaveCount(0);
  await expect(page.getByTestId("craft-product-total")).toContainText("0.00");
  await page.getByRole("checkbox").check();
  await expect(page.getByRole("button",{name:"Submit selection",exact:true})).toBeDisabled();
  await page.getByRole("button",{name:"Select all",exact:true}).click();
  await expect(page.getByTestId("craft-product-total")).toContainText("1,150.00");
  await page.getByRole("checkbox").check();
  await page.getByRole("button",{name:"Submit selection",exact:true}).click();
  await expect(page.getByRole("heading",{name:"Seller review and preview"})).toBeVisible();
  await expect(page.getByRole("button",{name:"Review order",exact:true})).toHaveCount(0);
  expect(saved.variant_id).toBe("single");
  expect(saved.selection).toEqual(gallery.custom_order.craft.designs.map(design => ({code:design.code,qty:1})));
  expect(saved).not.toHaveProperty("price");
  await page.getByRole("button",{name:"Change selection",exact:true}).click();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  await page.evaluate(() => window.scrollTo(0,0));
  await page.screenshot({path:"../artifacts/craft-picker-mobile.png",fullPage:true});
  await page.setViewportSize({width:1280,height:900});
  await expect(page.locator(".craft-design-grid")).toHaveCSS("grid-template-columns",/\d.* \d.* \d/);
  await page.evaluate(() => window.scrollTo(0,0));
  await page.screenshot({path:"../artifacts/craft-picker-desktop.png",fullPage:true});
});

test("reloaded selection restores exact designs, answers and retained media before re-review", async ({page}) => {
  let saved: any;
  const restoredProduct = {...product,variants:[{...product.variants[0],pieces_per_set:2}],custom_order:{...product.custom_order,fields:[
    ...product.custom_order.fields,{id:"photo",label:"Reference photo",question:"Upload your photo",type:"image",required:true,options:[]},
  ]}};
  const restored = {id:"saved-draft",product_id:product.id,variant_id:"small",quantity:1,ready:false,reason:"Seller review required",proof:null,
    selection:[{code:"D1",qty:1}],answers:{printed:"Keep exact spelling",photo:{kind:"image",message_id:"saved-photo"}},
    artwork:{kind:"image",message_id:"saved-artwork"}};
  await page.addInitScript(() => localStorage.setItem("arise_lang","en"));
  await page.route("**/api/**", async route => {
    const path = new URL(route.request().url()).pathname;
    if(path === "/api/catalog") return route.fulfill({json:{shops:[shop],products:[restoredProduct],synced_at:new Date().toISOString()}});
    if(path === "/api/session") return route.fulfill({json:{user:null,csrf:"csrf",demo:false,source_web:""}});
    if(path === "/api/promotions") return route.fulfill({json:{ads:[],settings:{}}});
    if(path === "/api/traffic") return route.fulfill({json:{ok:true}});
    if(path === "/api/craft/saved-draft") return route.fulfill({json:restored});
    if(path === "/api/craft") {saved=route.request().postDataJSON();return route.fulfill({json:{...restored,id:"edited-draft",proof:null}});}
    if(path === "/api/craft/edited-draft") return route.fulfill({json:{...restored,id:"edited-draft",proof:null}});
    throw new Error(`Unexpected API call ${path}`);
  });
  await page.goto("/checkout/canvas?variant=small&quantity=1&craft=saved-draft");
  await page.getByRole("button",{name:"Change selection",exact:true}).click();
  await expect(page.getByRole("button",{name:"Floral",exact:true})).toHaveAttribute("aria-pressed","true");
  await expect(page.getByLabel("Printed name")).toHaveValue("Keep exact spelling");
  await expect(page.locator(".craft-selection-count")).toHaveText(/Selected: 2.*Package includes 2/);
  await expect(page.getByText("Your saved image is kept. A new upload replaces it.")).toBeVisible();
  await expect(page.getByText("Your saved artwork is kept. A new upload replaces it.")).toBeVisible();
  await page.getByRole("button",{name:"Remove saved artwork",exact:true}).click();
  await expect(page.getByRole("button",{name:"Submit selection",exact:true})).toBeDisabled();
  await page.getByRole("button",{name:"Increase Floral",exact:true}).click();
  await page.getByRole("checkbox").check();
  await page.getByRole("button",{name:"Submit selection",exact:true}).click();
  await expect(page.getByRole("heading",{name:"Seller review and preview"})).toBeVisible();
  expect(saved.previous_draft_id).toBe("saved-draft");
  expect(saved.keep_artwork).toBe(false);
  expect(saved.keep_image_answers).toEqual(["photo"]);
  expect(saved.selection).toEqual([{code:"D1",qty:2}]);
  expect(saved.answers.printed).toBe("Keep exact spelling");
  expect(saved.answers).not.toHaveProperty("photo");
  expect(saved).not.toHaveProperty("proof");
  await expect(page.getByRole("button",{name:"I approve this preview",exact:true})).toHaveCount(0);
});
