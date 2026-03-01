import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { jsPDF } from "https://esm.sh/jspdf@2.5.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ORANGE = [249, 115, 22] as const; // #F97316
const DARK = [24, 24, 27] as const;     // #18181B
const WHITE = [255, 255, 255] as const;
const GREY = [161, 161, 170] as const;  // #A1A1AA
const LIGHT_GREY = [244, 244, 245] as const;

const CATEGORY_ORDER = [
  "Breakfast",
  "Lunch",
  "Main",
  "Snacks",
  "Desserts",
  "Shakes",
  "Other",
];

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
}

interface Ingredient {
  recipe_id: string;
  name: string;
  quantity?: number;
  unit?: string;
  sort_order?: number;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth check – only dev/coach can trigger
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify user
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(
      authHeader.replace("Bearer ", "")
    );
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use service role for data fetching & upload
    const supabase = createClient(supabaseUrl, serviceKey);

    // Fetch all public recipes
    const { data: recipes, error: recipeErr } = await supabase
      .from("recipes")
      .select("*")
      .eq("is_public", true)
      .order("category", { ascending: true })
      .order("name", { ascending: true });

    if (recipeErr) throw recipeErr;
    if (!recipes || recipes.length === 0) {
      return new Response(
        JSON.stringify({ error: "No public recipes found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch all ingredients for these recipes
    const recipeIds = recipes.map((r: Recipe) => r.id);
    const allIngredients: Ingredient[] = [];
    // Fetch in batches of 100 IDs to avoid query limits
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

    // Group ingredients by recipe_id
    const ingredientMap = new Map<string, Ingredient[]>();
    for (const ing of allIngredients) {
      if (!ingredientMap.has(ing.recipe_id)) {
        ingredientMap.set(ing.recipe_id, []);
      }
      ingredientMap.get(ing.recipe_id)!.push(ing);
    }

    // Group recipes by category
    const categoryMap = new Map<string, Recipe[]>();
    for (const recipe of recipes) {
      const cat = recipe.category || "Other";
      const normCat = CATEGORY_ORDER.find(
        (c) => c.toLowerCase() === cat.toLowerCase()
      ) || "Other";
      if (!categoryMap.has(normCat)) {
        categoryMap.set(normCat, []);
      }
      categoryMap.get(normCat)!.push(recipe);
    }

    // Build PDF
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageW = 210;
    const pageH = 297;
    const margin = 15;
    const contentW = pageW - margin * 2;

    // Helper: add footer to current page
    const addFooter = () => {
      const pageNum = doc.getNumberOfPages();
      doc.setPage(pageNum);
      doc.setFontSize(8);
      doc.setTextColor(...GREY);
      doc.text(
        "UNBREAKABLE \u2014 Live Without Limits",
        pageW / 2,
        pageH - 8,
        { align: "center" }
      );
      doc.text(`${pageNum}`, pageW - margin, pageH - 8, { align: "right" });
    };

    // ========== COVER PAGE ==========
    doc.setFillColor(...DARK);
    doc.rect(0, 0, pageW, pageH, "F");

    // Orange accent bar
    doc.setFillColor(...ORANGE);
    doc.rect(0, 90, pageW, 3, "F");
    doc.rect(0, 195, pageW, 3, "F");

    // Title
    doc.setFontSize(48);
    doc.setTextColor(...ORANGE);
    doc.text("UNBREAKABLE", pageW / 2, 120, { align: "center" });

    doc.setFontSize(24);
    doc.setTextColor(...WHITE);
    doc.text("RECIPE BOOK", pageW / 2, 135, { align: "center" });

    // Subtitle
    doc.setFontSize(18);
    doc.setTextColor(...ORANGE);
    doc.text("FUEL YOUR RESULTS", pageW / 2, 155, { align: "center" });

    // Recipe count
    doc.setFontSize(14);
    doc.setTextColor(...GREY);
    doc.text(`${recipes.length} High-Protein Recipes`, pageW / 2, 170, {
      align: "center",
    });
    doc.text("Full Macro Breakdowns \u2022 Categorised by Meal Type", pageW / 2, 178, {
      align: "center",
    });

    // Disclaimer
    doc.setFontSize(9);
    doc.setTextColor(...GREY);
    const disclaimer = [
      "All calorie and macro values are reference estimates.",
      "For bespoke tracking, scan your ingredients via the Store Cupboard",
      "in Fuel Planning for personalised accuracy.",
    ];
    disclaimer.forEach((line, i) => {
      doc.text(line, pageW / 2, 210 + i * 5, { align: "center" });
    });

    // Tagline
    doc.setFontSize(16);
    doc.setTextColor(...ORANGE);
    doc.text("KEEP SHOWING UP.", pageW / 2, 240, { align: "center" });

    doc.setFontSize(10);
    doc.setTextColor(...GREY);
    doc.text("\u00A9 Unbreakable \u2014 Live Without Limits", pageW / 2, 280, {
      align: "center",
    });

    // ========== TABLE OF CONTENTS ==========
    doc.addPage();
    addFooter();

    doc.setFillColor(...DARK);
    doc.rect(0, 0, pageW, pageH, "F");

    doc.setFontSize(28);
    doc.setTextColor(...ORANGE);
    doc.text("CONTENTS", pageW / 2, 35, { align: "center" });

    doc.setDrawColor(...ORANGE);
    doc.setLineWidth(0.5);
    doc.line(margin, 40, pageW - margin, 40);

    let tocY = 55;
    // We'll track actual page numbers as we build
    const tocEntries: { category: string; count: number }[] = [];
    for (const cat of CATEGORY_ORDER) {
      const catRecipes = categoryMap.get(cat);
      if (catRecipes && catRecipes.length > 0) {
        tocEntries.push({ category: cat, count: catRecipes.length });
      }
    }

    for (const entry of tocEntries) {
      doc.setFontSize(16);
      doc.setTextColor(...WHITE);
      doc.text(entry.category.toUpperCase(), margin, tocY);

      doc.setFontSize(12);
      doc.setTextColor(...GREY);
      doc.text(`${entry.count} recipes`, pageW - margin, tocY, { align: "right" });

      tocY += 12;
    }

    // ========== RECIPE PAGES ==========
    for (const cat of CATEGORY_ORDER) {
      const catRecipes = categoryMap.get(cat);
      if (!catRecipes || catRecipes.length === 0) continue;

      // Category divider page
      doc.addPage();
      addFooter();
      doc.setFillColor(...DARK);
      doc.rect(0, 0, pageW, pageH, "F");

      // Orange accent
      doc.setFillColor(...ORANGE);
      doc.rect(0, pageH / 2 - 20, pageW, 2, "F");
      doc.rect(0, pageH / 2 + 20, pageW, 2, "F");

      doc.setFontSize(42);
      doc.setTextColor(...ORANGE);
      doc.text(cat.toUpperCase(), pageW / 2, pageH / 2, { align: "center" });

      doc.setFontSize(14);
      doc.setTextColor(...GREY);
      doc.text(`${catRecipes.length} RECIPES`, pageW / 2, pageH / 2 + 12, {
        align: "center",
      });

      // Recipes – white background pages
      let y = 0;
      let needNewPage = true;

      for (const recipe of catRecipes) {
        const ingredients = ingredientMap.get(recipe.id) || [];
        const methodSteps = recipe.instructions
          ? recipe.instructions
              .split(/\n+/)
              .map((s: string) => s.trim())
              .filter((s: string) => s.length > 0)
          : [];

        // Estimate height needed
        const ingLines = ingredients.length;
        const methodLines = methodSteps.reduce((acc: number, step: string) => {
          return acc + Math.ceil(step.length / 70);
        }, 0);
        const estimatedHeight = 55 + ingLines * 5 + methodLines * 5 + 15;

        if (needNewPage || y + estimatedHeight > pageH - 25) {
          doc.addPage();
          addFooter();
          y = margin;
          needNewPage = false;
        } else {
          // Separator between recipes
          doc.setDrawColor(...LIGHT_GREY);
          doc.setLineWidth(0.3);
          doc.line(margin, y, pageW - margin, y);
          y += 5;
        }

        // Recipe name
        doc.setFontSize(14);
        doc.setTextColor(...DARK);
        const nameText = recipe.name.toUpperCase();
        doc.text(nameText, margin, y + 6);

        // Pack badge
        if (recipe.pack) {
          const badgeText = recipe.pack.toUpperCase();
          doc.setFontSize(7);
          doc.setTextColor(...ORANGE);
          const nameWidth = doc.getTextWidth(nameText);
          doc.text(badgeText, margin + nameWidth + 4, y + 6);
        }

        // Dietary tags
        if (recipe.dietary_tags && recipe.dietary_tags.length > 0) {
          doc.setFontSize(7);
          doc.setTextColor(...GREY);
          const tags = recipe.dietary_tags
            .map((t: string) => t.toUpperCase())
            .join(" \u2022 ");
          doc.text(tags, pageW - margin, y + 6, { align: "right" });
        }

        y += 12;

        // Prep/cook/servings line
        doc.setFontSize(9);
        doc.setTextColor(...GREY);
        const infoItems: string[] = [];
        if (recipe.prep_time_minutes)
          infoItems.push(`Prep: ${recipe.prep_time_minutes} min`);
        if (recipe.cook_time_minutes)
          infoItems.push(`Cook: ${recipe.cook_time_minutes} min`);
        if (recipe.servings) infoItems.push(`Serves: ${recipe.servings}`);
        if (infoItems.length > 0) {
          doc.text(infoItems.join("  |  "), margin, y);
          y += 6;
        }

        // Macro bar
        doc.setFillColor(255, 247, 237); // orange-50 tint
        doc.roundedRect(margin, y - 2, contentW, 10, 2, 2, "F");

        doc.setFontSize(9);
        const macroX = margin + 3;
        doc.setTextColor(...DARK);
        const macros = [
          recipe.calories_per_serving
            ? `${recipe.calories_per_serving} kcal`
            : null,
          recipe.protein_g ? `P: ${recipe.protein_g}g` : null,
          recipe.carbs_g ? `C: ${recipe.carbs_g}g` : null,
          recipe.fat_g ? `F: ${recipe.fat_g}g` : null,
        ]
          .filter(Boolean)
          .join("   \u2022   ");
        doc.text(macros, macroX, y + 5);
        y += 14;

        // Ingredients
        if (ingredients.length > 0) {
          doc.setFontSize(10);
          doc.setTextColor(...ORANGE);
          doc.text("INGREDIENTS", margin, y);
          y += 5;

          doc.setFontSize(8);
          doc.setTextColor(...DARK);
          for (const ing of ingredients) {
            if (y > pageH - 25) {
              doc.addPage();
              addFooter();
              y = margin;
            }
            let ingText = `\u2022  ${ing.name}`;
            if (ing.quantity) {
              ingText += `, ${ing.quantity}`;
              if (ing.unit) ingText += ` ${ing.unit}`;
            }
            doc.text(ingText, margin + 2, y);
            y += 4.5;
          }
          y += 3;
        }

        // Method
        if (methodSteps.length > 0) {
          doc.setFontSize(10);
          doc.setTextColor(...ORANGE);
          doc.text("METHOD", margin, y);
          y += 5;

          doc.setFontSize(8);
          doc.setTextColor(...DARK);
          methodSteps.forEach((step: string, idx: number) => {
            if (y > pageH - 25) {
              doc.addPage();
              addFooter();
              y = margin;
            }
            const stepText = `${idx + 1}. ${step}`;
            const lines = doc.splitTextToSize(stepText, contentW - 5);
            doc.text(lines, margin + 2, y);
            y += lines.length * 4.5;
          });
          y += 5;
        }

        y += 5;
      }
    }

    // ========== BACK COVER ==========
    doc.addPage();
    doc.setFillColor(...DARK);
    doc.rect(0, 0, pageW, pageH, "F");

    doc.setFillColor(...ORANGE);
    doc.rect(0, pageH / 2 - 30, pageW, 2, "F");
    doc.rect(0, pageH / 2 + 30, pageW, 2, "F");

    doc.setFontSize(36);
    doc.setTextColor(...ORANGE);
    doc.text("KEEP SHOWING UP.", pageW / 2, pageH / 2 - 8, { align: "center" });

    doc.setFontSize(14);
    doc.setTextColor(...WHITE);
    doc.text("UNBREAKABLE", pageW / 2, pageH / 2 + 8, { align: "center" });

    doc.setFontSize(10);
    doc.setTextColor(...GREY);
    doc.text("Live Without Limits", pageW / 2, pageH / 2 + 16, { align: "center" });

    // Add footers to all pages (pages without might have been missed)
    const totalPages = doc.getNumberOfPages();
    for (let p = 2; p <= totalPages; p++) {
      doc.setPage(p);
      doc.setFontSize(8);
      doc.setTextColor(...GREY);
      doc.text(
        "UNBREAKABLE \u2014 Live Without Limits",
        pageW / 2,
        pageH - 8,
        { align: "center" }
      );
      doc.text(`${p}`, pageW - margin, pageH - 8, { align: "right" });
    }

    // Generate PDF as ArrayBuffer
    const pdfOutput = doc.output("arraybuffer");
    const pdfUint8 = new Uint8Array(pdfOutput);

    // Upload to storage
    const fileName = "unbreakable-recipe-book.pdf";
    const { error: uploadError } = await supabase.storage
      .from("university-downloads")
      .upload(fileName, pdfUint8, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("university-downloads")
      .getPublicUrl(fileName);

    return new Response(
      JSON.stringify({
        success: true,
        url: urlData.publicUrl,
        recipe_count: recipes.length,
        pages: totalPages,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error generating recipe ebook:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to generate ebook" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
