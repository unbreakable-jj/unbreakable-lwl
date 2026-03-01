import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { jsPDF } from "https://esm.sh/jspdf@2.5.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Brand colours (RGB)
const ORANGE = [249, 115, 22] as const;
const DARK = [24, 24, 27] as const;
const WHITE = [255, 255, 255] as const;
const GREY = [161, 161, 170] as const;
const LIGHT_ORANGE = [255, 247, 237] as const; // orange-50

const CATEGORY_ORDER = ["Breakfast", "Lunch", "Main", "Snacks", "Desserts", "Shakes", "Other"];

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 18;
const CONTENT_W = PAGE_W - MARGIN * 2;

interface Recipe {
  id: string;
  name: string;
  description?: string;
  instructions?: string;
  prep_time_minutes?: number;
  cook_time_minutes?: number;
  servings: number;
  calories_per_serving?: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
  dietary_tags?: string[];
  pack?: string;
  category?: string;
  image_url?: string;
}

interface Ingredient {
  recipe_id: string;
  name: string;
  quantity?: number;
  unit?: string;
  sort_order?: number;
}

// Fetch image and return base64 data URI, or null on failure
async function fetchImageAsBase64(url: string): Promise<string | null> {
  try {
    const resp = await fetch(url);
    if (!resp.ok) { await resp.text(); return null; }
    const buf = await resp.arrayBuffer();
    const bytes = new Uint8Array(buf);
    let binary = "";
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    const b64 = btoa(binary);
    const contentType = resp.headers.get("content-type") || "image/jpeg";
    const ext = contentType.includes("png") ? "PNG" : "JPEG";
    return `data:${contentType};base64,${b64}|${ext}`;
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(
      authHeader.replace("Bearer ", "")
    );
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    // Fetch recipes
    const { data: recipes, error: recipeErr } = await supabase
      .from("recipes")
      .select("*")
      .eq("is_public", true)
      .order("category", { ascending: true })
      .order("name", { ascending: true });

    if (recipeErr) throw recipeErr;
    if (!recipes || recipes.length === 0) {
      return new Response(JSON.stringify({ error: "No public recipes found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch ingredients
    const recipeIds = recipes.map((r: Recipe) => r.id);
    const allIngredients: Ingredient[] = [];
    for (let i = 0; i < recipeIds.length; i += 100) {
      const batch = recipeIds.slice(i, i + 100);
      const { data: ings, error: ingErr } = await supabase
        .from("recipe_ingredients")
        .select("*")
        .in("recipe_id", batch)
        .order("sort_order", { ascending: true });
      if (ingErr) throw ingErr;
      if (ings) allIngredients.push(...ings);
    }

    const ingredientMap = new Map<string, Ingredient[]>();
    for (const ing of allIngredients) {
      if (!ingredientMap.has(ing.recipe_id)) ingredientMap.set(ing.recipe_id, []);
      ingredientMap.get(ing.recipe_id)!.push(ing);
    }

    // Group by category
    const categoryMap = new Map<string, Recipe[]>();
    for (const recipe of recipes) {
      const cat = recipe.category || "Other";
      const normCat = CATEGORY_ORDER.find(c => c.toLowerCase() === cat.toLowerCase()) || "Other";
      if (!categoryMap.has(normCat)) categoryMap.set(normCat, []);
      categoryMap.get(normCat)!.push(recipe);
    }

    // Pre-fetch all recipe images in parallel (batched)
    console.log(`Fetching images for ${recipes.length} recipes...`);
    const imageCache = new Map<string, string>();
    const imgBatchSize = 20;
    for (let i = 0; i < recipes.length; i += imgBatchSize) {
      const batch = recipes.slice(i, i + imgBatchSize);
      const results = await Promise.allSettled(
        batch.map(async (r: Recipe) => {
          if (r.image_url) {
            const data = await fetchImageAsBase64(r.image_url);
            if (data) imageCache.set(r.id, data);
          }
        })
      );
    }
    console.log(`Cached ${imageCache.size} images`);

    // ========== BUILD PDF ==========
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    // Helper: footer on recipe (white) pages
    const addWhitePageFooter = () => {
      doc.setFontSize(7);
      doc.setTextColor(...GREY);
      doc.text("UNBREAKABLE \u2014 Live Without Limits  \u2022  Fuel Your Results", PAGE_W / 2, PAGE_H - 10, { align: "center" });
      doc.text(`${doc.getNumberOfPages()}`, PAGE_W - MARGIN, PAGE_H - 10, { align: "right" });
    };

    // Helper: footer on dark pages
    const addDarkPageFooter = () => {
      doc.setFontSize(7);
      doc.setTextColor(...GREY);
      doc.text("UNBREAKABLE \u2014 Live Without Limits", PAGE_W / 2, PAGE_H - 10, { align: "center" });
    };

    // ==================== COVER PAGE ====================
    doc.setFillColor(...DARK);
    doc.rect(0, 0, PAGE_W, PAGE_H, "F");

    // Top orange bar
    doc.setFillColor(...ORANGE);
    doc.rect(0, 0, PAGE_W, 4, "F");

    // Title block – centred
    doc.setFontSize(56);
    doc.setTextColor(...ORANGE);
    doc.text("UNBREAKABLE", PAGE_W / 2, 100, { align: "center" });

    doc.setFontSize(10);
    doc.setTextColor(...GREY);
    doc.text("\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014", PAGE_W / 2, 110, { align: "center" });

    doc.setFontSize(28);
    doc.setTextColor(...WHITE);
    doc.text("RECIPE BOOK", PAGE_W / 2, 125, { align: "center" });

    // Sub head
    doc.setFontSize(18);
    doc.setTextColor(...ORANGE);
    doc.text("FUEL YOUR RESULTS", PAGE_W / 2, 148, { align: "center" });

    // Stats
    doc.setFontSize(11);
    doc.setTextColor(...GREY);
    doc.text(`${recipes.length} High-Protein Recipes  \u2022  7 Categories  \u2022  Full Macro Breakdowns`, PAGE_W / 2, 165, { align: "center" });

    // Disclaimer
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 130);
    const disclaimerLines = [
      "All calorie and macro values are reference estimates for guidance.",
      "For bespoke tracking, scan your ingredients via the Store Cupboard",
      "in Fuel Planning for personalised accuracy.",
    ];
    disclaimerLines.forEach((line, i) => {
      doc.text(line, PAGE_W / 2, 195 + i * 5, { align: "center" });
    });

    // Bottom tagline
    doc.setFontSize(16);
    doc.setTextColor(...ORANGE);
    doc.text("KEEP SHOWING UP.", PAGE_W / 2, 235, { align: "center" });

    doc.setFontSize(9);
    doc.setTextColor(...GREY);
    doc.text("LIVE WITHOUT LIMITS", PAGE_W / 2, 244, { align: "center" });

    // Bottom orange bar
    doc.setFillColor(...ORANGE);
    doc.rect(0, PAGE_H - 4, PAGE_W, 4, "F");

    addDarkPageFooter();

    // ==================== TABLE OF CONTENTS ====================
    doc.addPage();
    doc.setFillColor(...DARK);
    doc.rect(0, 0, PAGE_W, PAGE_H, "F");
    doc.setFillColor(...ORANGE);
    doc.rect(0, 0, PAGE_W, 4, "F");

    doc.setFontSize(32);
    doc.setTextColor(...ORANGE);
    doc.text("CONTENTS", PAGE_W / 2, 40, { align: "center" });

    // Decorative line
    doc.setDrawColor(...ORANGE);
    doc.setLineWidth(0.5);
    doc.line(MARGIN + 30, 47, PAGE_W - MARGIN - 30, 47);

    let tocY = 65;
    for (const cat of CATEGORY_ORDER) {
      const catRecipes = categoryMap.get(cat);
      if (!catRecipes || catRecipes.length === 0) continue;

      doc.setFontSize(18);
      doc.setTextColor(...WHITE);
      doc.text(cat.toUpperCase(), MARGIN + 10, tocY);

      doc.setFontSize(13);
      doc.setTextColor(...ORANGE);
      doc.text(`${catRecipes.length} recipes`, PAGE_W - MARGIN - 10, tocY, { align: "right" });

      // Dotted line
      doc.setDrawColor(80, 80, 85);
      doc.setLineWidth(0.2);
      doc.setLineDashPattern([1, 2], 0);
      const textW = doc.getTextWidth(cat.toUpperCase());
      doc.line(MARGIN + 12 + textW + 5, tocY - 1, PAGE_W - MARGIN - 12 - doc.getTextWidth(`${catRecipes.length} recipes`) - 5, tocY - 1);
      doc.setLineDashPattern([], 0);

      tocY += 18;
    }

    addDarkPageFooter();

    // ==================== RECIPE PAGES ====================
    for (const cat of CATEGORY_ORDER) {
      const catRecipes = categoryMap.get(cat);
      if (!catRecipes || catRecipes.length === 0) continue;

      // ---- Category divider (dark page) ----
      doc.addPage();
      doc.setFillColor(...DARK);
      doc.rect(0, 0, PAGE_W, PAGE_H, "F");

      doc.setFillColor(...ORANGE);
      doc.rect(0, 0, PAGE_W, 4, "F");
      doc.rect(0, PAGE_H - 4, PAGE_W, 4, "F");

      // Horizontal orange lines
      doc.setFillColor(...ORANGE);
      doc.rect(MARGIN, PAGE_H / 2 - 28, CONTENT_W, 1.5, "F");
      doc.rect(MARGIN, PAGE_H / 2 + 18, CONTENT_W, 1.5, "F");

      doc.setFontSize(48);
      doc.setTextColor(...ORANGE);
      doc.text(cat.toUpperCase(), PAGE_W / 2, PAGE_H / 2 - 5, { align: "center" });

      doc.setFontSize(14);
      doc.setTextColor(...GREY);
      doc.text(`${catRecipes.length} RECIPES`, PAGE_W / 2, PAGE_H / 2 + 10, { align: "center" });

      doc.setFontSize(10);
      doc.setTextColor(100, 100, 105);
      doc.text("FUEL YOUR RESULTS", PAGE_W / 2, PAGE_H / 2 + 35, { align: "center" });

      addDarkPageFooter();

      // ---- Individual recipe pages (white) ----
      for (const recipe of catRecipes) {
        doc.addPage();
        // White page – no fill needed (default white)

        const ingredients = ingredientMap.get(recipe.id) || [];
        const methodSteps = recipe.instructions
          ? recipe.instructions.split(/\n+/).map((s: string) => s.trim()).filter((s: string) => s.length > 0)
          : [];

        let y = MARGIN;

        // ---- Top orange accent bar ----
        doc.setFillColor(...ORANGE);
        doc.rect(0, 0, PAGE_W, 3, "F");

        y = 12;

        // ---- Recipe name ----
        doc.setFontSize(22);
        doc.setTextColor(...DARK);
        const nameLines = doc.splitTextToSize(recipe.name.toUpperCase(), CONTENT_W - 5);
        doc.text(nameLines, MARGIN, y + 8);
        y += nameLines.length * 9 + 4;

        // ---- Pack badge + dietary tags line ----
        doc.setFontSize(8);
        let badgeLine = "";
        if (recipe.pack) {
          badgeLine = recipe.pack.toUpperCase();
        }
        if (recipe.dietary_tags && recipe.dietary_tags.length > 0) {
          const tags = recipe.dietary_tags.map((t: string) => t.toUpperCase()).join("  \u2022  ");
          badgeLine = badgeLine ? `${badgeLine}  |  ${tags}` : tags;
        }
        if (badgeLine) {
          doc.setTextColor(...ORANGE);
          doc.text(badgeLine, MARGIN, y);
          y += 5;
        }

        // ---- Prep / Cook / Servings ----
        const infoItems: string[] = [];
        if (recipe.prep_time_minutes) infoItems.push(`Prep: ${recipe.prep_time_minutes} min`);
        if (recipe.cook_time_minutes) infoItems.push(`Cook: ${recipe.cook_time_minutes} min`);
        if (recipe.servings) infoItems.push(`Serves: ${recipe.servings}`);
        if (infoItems.length > 0) {
          doc.setFontSize(9);
          doc.setTextColor(...GREY);
          doc.text(infoItems.join("   |   "), MARGIN, y);
          y += 6;
        }

        // ---- Macro card (orange tinted box) ----
        y += 2;
        doc.setFillColor(...LIGHT_ORANGE);
        doc.roundedRect(MARGIN, y, CONTENT_W, 14, 3, 3, "F");
        doc.setDrawColor(...ORANGE);
        doc.setLineWidth(0.3);
        doc.roundedRect(MARGIN, y, CONTENT_W, 14, 3, 3, "S");

        doc.setFontSize(11);
        doc.setTextColor(...DARK);
        const macroEntries = [];
        if (recipe.calories_per_serving) macroEntries.push(`${recipe.calories_per_serving} kcal`);
        if (recipe.protein_g) macroEntries.push(`Protein: ${recipe.protein_g}g`);
        if (recipe.carbs_g) macroEntries.push(`Carbs: ${recipe.carbs_g}g`);
        if (recipe.fat_g) macroEntries.push(`Fat: ${recipe.fat_g}g`);
        doc.text(macroEntries.join("     \u2022     "), MARGIN + 5, y + 9);
        y += 20;

        // ---- Recipe image ----
        const imgData = imageCache.get(recipe.id);
        if (imgData) {
          const [dataUri, ext] = imgData.split("|");
          try {
            const imgW = CONTENT_W;
            const imgH = 55;
            doc.addImage(dataUri, ext || "JPEG", MARGIN, y, imgW, imgH);
            // Rounded corner overlay (orange border)
            doc.setDrawColor(...ORANGE);
            doc.setLineWidth(0.5);
            doc.roundedRect(MARGIN, y, imgW, imgH, 3, 3, "S");
            y += imgH + 6;
          } catch {
            y += 2;
          }
        }

        // ---- Two-column: Ingredients (left) + Method (right) ----
        const colGap = 6;
        const leftColW = (CONTENT_W - colGap) * 0.42;
        const rightColW = (CONTENT_W - colGap) * 0.58;
        const leftX = MARGIN;
        const rightX = MARGIN + leftColW + colGap;

        // Start positions
        const columnsStartY = y;

        // -- INGREDIENTS column --
        let leftY = columnsStartY;

        doc.setFontSize(11);
        doc.setTextColor(...ORANGE);
        doc.text("INGREDIENTS", leftX, leftY);
        leftY += 2;

        // Orange underline
        doc.setDrawColor(...ORANGE);
        doc.setLineWidth(0.4);
        doc.line(leftX, leftY, leftX + leftColW, leftY);
        leftY += 5;

        doc.setFontSize(8);
        doc.setTextColor(...DARK);
        for (const ing of ingredients) {
          if (leftY > PAGE_H - 20) break;
          let ingText = ing.name;
          if (ing.quantity) {
            ingText += `, ${ing.quantity}`;
            if (ing.unit) ingText += ` ${ing.unit}`;
          }
          const ingLines = doc.splitTextToSize(`\u2022  ${ingText}`, leftColW - 3);
          doc.text(ingLines, leftX + 1, leftY);
          leftY += ingLines.length * 4;
        }

        // -- METHOD column --
        let rightY = columnsStartY;

        doc.setFontSize(11);
        doc.setTextColor(...ORANGE);
        doc.text("METHOD", rightX, rightY);
        rightY += 2;

        doc.setDrawColor(...ORANGE);
        doc.setLineWidth(0.4);
        doc.line(rightX, rightY, rightX + rightColW, rightY);
        rightY += 5;

        doc.setFontSize(8);
        doc.setTextColor(...DARK);
        methodSteps.forEach((step: string, idx: number) => {
          if (rightY > PAGE_H - 20) return;
          const stepText = `${idx + 1}. ${step}`;
          const stepLines = doc.splitTextToSize(stepText, rightColW - 3);
          doc.text(stepLines, rightX + 1, rightY);
          rightY += stepLines.length * 4 + 1.5;
        });

        // ---- Bottom orange accent ----
        doc.setFillColor(...ORANGE);
        doc.rect(0, PAGE_H - 3, PAGE_W, 3, "F");

        addWhitePageFooter();
      }
    }

    // ==================== BACK COVER ====================
    doc.addPage();
    doc.setFillColor(...DARK);
    doc.rect(0, 0, PAGE_W, PAGE_H, "F");
    doc.setFillColor(...ORANGE);
    doc.rect(0, 0, PAGE_W, 4, "F");
    doc.rect(0, PAGE_H - 4, PAGE_W, 4, "F");

    doc.setFillColor(...ORANGE);
    doc.rect(MARGIN, PAGE_H / 2 - 32, CONTENT_W, 1.5, "F");
    doc.rect(MARGIN, PAGE_H / 2 + 30, CONTENT_W, 1.5, "F");

    doc.setFontSize(40);
    doc.setTextColor(...ORANGE);
    doc.text("KEEP SHOWING UP.", PAGE_W / 2, PAGE_H / 2 - 8, { align: "center" });

    doc.setFontSize(16);
    doc.setTextColor(...WHITE);
    doc.text("UNBREAKABLE", PAGE_W / 2, PAGE_H / 2 + 8, { align: "center" });

    doc.setFontSize(11);
    doc.setTextColor(...GREY);
    doc.text("Live Without Limits", PAGE_W / 2, PAGE_H / 2 + 18, { align: "center" });

    addDarkPageFooter();

    // ========== Generate & Upload ==========
    const pdfOutput = doc.output("arraybuffer");
    const pdfUint8 = new Uint8Array(pdfOutput);

    const fileName = "unbreakable-recipe-book.pdf";
    const { error: uploadError } = await supabase.storage
      .from("university-downloads")
      .upload(fileName, pdfUint8, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from("university-downloads")
      .getPublicUrl(fileName);

    return new Response(
      JSON.stringify({
        success: true,
        url: urlData.publicUrl,
        recipe_count: recipes.length,
        images_embedded: imageCache.size,
        pages: doc.getNumberOfPages(),
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating recipe ebook:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to generate ebook" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
