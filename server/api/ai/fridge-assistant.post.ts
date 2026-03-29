import type { AiRecipeResponse } from '~/types'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody<{ ingredients: string[]; isVegan: boolean }>(event)

  // ─── Validate & Sanitize input ──────────────────────
  if (!body.ingredients || !Array.isArray(body.ingredients) || body.ingredients.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Please provide at least one ingredient.',
    })
  }

  // Basic sanitization: strip non-alphanumeric chars (except common ones) and limit length
  // \u0370-\u03FF covers Greek characters
  const sanitizedIngredients = body.ingredients
    .map(i => String(i).replace(/[^\w\s\u0370-\u03FF,.-]/g, '').slice(0, 50))
    .filter(i => i.trim().length > 0)

  if (sanitizedIngredients.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid ingredients provided.',
    })
  }

  if (!config.groqApiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Groq API key is not configured.',
    })
  }

  // ─── Build system prompt ────────────────────────────
  const veganConstraint = body.isVegan
    ? 'Η συνταγή ΠΡΕΠΕΙ να είναι 100% vegan. Απαγορεύεται ΑΥΣΤΗΡΑ η χρήση κρέατος, πουλερικών, ψαριών, γαλακτοκομικών ή αυγών.'
    : ''

  const systemPrompt = `Είσαι ένας κορυφαίος Έλληνας σεφ. Ο χρήστης θα σου δώσει μια λίστα με υλικά που έχει στο ψυγείο του.
ΠΡΕΠΕΙ να απαντήσεις ΑΠΟΚΛΕΙΣΤΙΚΑ με ένα έγκυρο JSON αντικείμενο που να ακολουθεί ΑΚΡΙΒΩΣ αυτό το σχήμα:

{
  "title": "string — Ονομασία της συνταγής (π.χ. 'Ζουμερό Κοτόπουλο με Πατάτες')",
  "description": "string — Μια σύντομη και λαχταριστή περιγραφή 1-2 προτάσεων στα Ελληνικά",
  "ingredients": [
    {
      "name": "string — Όνομα υλικού στα Ελληνικά",
      "quantity": "string — Ποσότητα (π.χ. '2', '1/2')",
      "unit": "string — Μονάδα μέτρησης στα Ελληνικά (π.χ. 'φλιτζάνια', 'κ.σ.', 'τεμάχια', 'γραμμάρια')"
    }
  ],
  "instructions": [
    "string — Βήμα 1: Ξεκίνα με προετοιμασία των υλικών...",
    "string — Βήμα 2: Ζέστανε το τηγάνι..."
  ],
  "macros": {
    "calories": "number — Εκτιμώμενες συνολικές θερμίδες",
    "protein": "number — Γραμμάρια πρωτεΐνης",
    "carbs": "number — Γραμμάρια υδατανθράκων",
    "fat": "number — Γραμμάρια λιπαρών"
  },
  "is_vegan": "boolean — true ΜΟΝΟ αν η συνταγή είναι 100% vegan. Αν περιέχει Κοτόπουλο, Κρέας, Τυρί, Φέτα, Αυγά ή Γάλα, πρέπει να είναι false."
}

${veganConstraint}

Αυστηροί Κανόνες:
- ΑΠΟΚΛΕΙΣΤΙΚΑ ΕΛΛΗΝΙΚΟ ΑΛΦΑΒΗΤΟ: Όλα τα κείμενα μέσα στο JSON (τίτλος, περιγραφή, υλικά, μονάδες, οδηγίες) ΠΡΕΠΕΙ να γράφονται ΜΟΝΟ με ελληνικούς χαρακτήρες (Ελληνικά). Απαγορεύονται αυστηρά τα Greeklish (π.χ. απαγορεύεται το "aromatika", γράψε "αρωματικά"). Απαγορεύονται τα αγγλικά ή τα γερμανικά.
- ΦΥΣΙΚΗ ΓΡΑΜΜΑΤΙΚΗ ΚΟΥΖΙΝΑΣ: Οι ποσότητες και οι μονάδες πρέπει να βγάζουν νόημα στα Ελληνικά:
  * Για κοτόπουλο/κρέας: "γραμμάρια", "μερίδες", ή "στήθος/μπούτι" (ΠΟΤΕ "1 τεμάχια", δεν το λέμε έτσι).
  * Για κρεμμύδι: "μέτριο κρεμμύδι" (ΠΟΤΕ "1 κεφάλι", δεν το λέμε έτσι).
  * Για σκόρδο: "σκελίδες" (π.χ. "2 σκελίδες σκόρδο").
  * Για αλάτι/πιπέρι: γράψε στο amount/quantity "-" και στο unit "όσο χρειάζεται" ή "μια πρέζα" (ΠΟΤΕ "προς γεύση κ.σ.").
  * Η ποσότητα "1" παίρνει τη λέξη στον ενικό. Π.χ. "1 τεμάχιο" (ΟΧΙ "1 τεμάχια").
- ΜΑΓΕΙΡΙΚΗ ΛΟΓΙΚΗ: Οι οδηγίες μαγειρικής πρέπει να έχουν ΑΠΟΛΥΤΗ λογική. Μην γράφεις ποτέ "ψήστε στην κατσαρόλα" (το κρέας βράζεται ή τσιγαρίζεται σε κατσαρόλα). Ποτέ μην βάζεις ωμά μακαρόνια μέσα σε ψητό κρέας, τα μακαρόνια βράζονται σε αλατισμένο νερό ξεχωριστά!
- Χρησιμοποίησε ΜΟΝΟ τα υλικά του χρήστη συν τα βασικά της κουζίνας (αλάτι, πιπέρι, ελαιόλαδο, νερό, μπαχαρικά).
- Απάντησε ΜΟΝΟ με JSON. ΚΑΝΕΝΑ απολύτως κείμενο πριν ή μετά το JSON.`

  const userMessage = `Έχω αυτά τα υλικά στο ψυγείο μου: ${sanitizedIngredients.join(', ')}.
${body.isVegan ? 'Θέλω ΑΥΣΤΗΡΑ μια 100% VEGAN συνταγή.' : 'Φτιάξε μου την καλύτερη δυνατή και πιο νόστιμη συνταγή που μπορείς.'}
Δώσε μου ρεαλιστικές, πρακτικές οδηγίες μαγειρικής σύμφωνα με την Ελληνική κουζίνα.`

  // ─── Call Groq API ──────────────────────────────────
  try {
    const response = await $fetch<{
      choices: Array<{ message: { content: string } }>
    }>('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: {
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 1024,
      },
    })

    const content = response.choices?.[0]?.message?.content
    if (!content) {
      throw createError({
        statusCode: 502,
        statusMessage: 'No response from AI.',
      })
    }

    // Parse and validate JSON
    const recipe: AiRecipeResponse = JSON.parse(content)

    // Basic validation
    if (!recipe.title || !recipe.ingredients || !recipe.instructions || !recipe.macros) {
      throw createError({
        statusCode: 502,
        statusMessage: 'AI returned an incomplete recipe.',
      })
    }

    return recipe
  } catch (error: any) {
    // If it's already an H3 error, re-throw
    if (error.statusCode) throw error

    console.error('Groq API error:', error)
    throw createError({
      statusCode: 502,
      statusMessage: 'Failed to generate recipe. Please try again.',
    })
  }
})
