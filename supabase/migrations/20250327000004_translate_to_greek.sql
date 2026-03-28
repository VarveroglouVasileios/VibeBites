-- ══════════════════════════════════════════════════════
-- VibeBites – TRANSLATE SEEDED DATA TO GREEK & FIX IMAGES
-- ══════════════════════════════════════════════════════

DO $$
DECLARE
  v_id UUID;
BEGIN
  -- 1. Translate Mediterranean Harvest Bowl
  SELECT id INTO v_id FROM public.recipes WHERE slug = 'mediterranean-harvest-bowl';
  IF v_id IS NOT NULL THEN
    UPDATE public.recipes SET
      title = 'Μεσογειακό Μπολ Συγκομιδής',
      description = 'Ζήστε τη συμφωνία των φρέσκων βοτάνων του κήπου και των λαχανικών που έχουν λιαστεί στον ήλιο. Ιδανικό για ένα υγιεινό γεύμα.',
      instructions = '["Ψήστε τα ρεβίθια με ελαιόλαδο και μπαχαρικά για 20 λεπτά στους 200°C.", "Χτυπήστε το ταχίνι, το χυμό λεμονιού και λίγο νερό για το ντρέσινγκ.", "Στρώστε τα χόρτα, το ψιλοκομμένο αγγούρι, τις ντομάτες και τα ζεστά ρεβίθια.", "Περιχύστε με το ντρέσινγκ και τελειώστε με φρέσκα βότανα και λίγο αλάτι."]'
    WHERE id = v_id;

    UPDATE public.ingredients SET name = 'Ρεβίθια (μαγειρεμένα)' WHERE recipe_id = v_id AND name = 'Chickpeas (cooked)';
    UPDATE public.ingredients SET name = 'Σπανάκι baby' WHERE recipe_id = v_id AND name = 'Baby spinach';
    UPDATE public.ingredients SET name = 'Ντοματίνια' WHERE recipe_id = v_id AND name = 'Cherry tomatoes';
    UPDATE public.ingredients SET name = 'Ταχίνι' WHERE recipe_id = v_id AND name = 'Tahini';
    UPDATE public.ingredients SET name = 'Χυμός λεμονιού' WHERE recipe_id = v_id AND name = 'Lemon juice';
  END IF;

  -- 2. Translate Blueberry Cloud Flapjacks & Fix Image
  SELECT id INTO v_id FROM public.recipes WHERE slug = 'blueberry-cloud-flapjacks';
  IF v_id IS NOT NULL THEN
    UPDATE public.recipes SET
      title = 'Αφράτα Pancakes με Μύρτιλα',
      description = 'Ελαφριές και αφράτες τηγανίτες γεμάτες με φρέσκα μύρτιλα, σερβιρισμένες με σιρόπι σφενδάμου.',
      instructions = '["Ανακατέψτε το αλεύρι, το μπέικιν πάουντερ και μια πρέζα αλάτι.", "Σε άλλο μπολ, αναμίξτε το γάλα αμυγδάλου και το εκχύλισμα βανίλιας.", "Ενώστε τα υγρά με τα στερεά υλικά και μετά προσθέστε τα μύρτιλα.", "Ψήστε σε αντικολλητικό τηγάνι μέχρι να εμφανιστούν φυσαλίδες και μετά γυρίστε τα."]',
      media_urls = '{"https://images.unsplash.com/photo-1567620905732-2d1ec7bb7445?auto=format&fit=crop&q=80&w=1000"}',
      og_image_url = 'https://images.unsplash.com/photo-1567620905732-2d1ec7bb7445?auto=format&fit=crop&q=80&w=1000'
    WHERE id = v_id;

    UPDATE public.ingredients SET name = 'Αλεύρι', unit = 'φλιτζάνια' WHERE recipe_id = v_id AND name = 'Flour';
    UPDATE public.ingredients SET name = 'Γάλα αμυγδάλου', unit = 'φλιτζάνι' WHERE recipe_id = v_id AND name = 'Almond milk';
    UPDATE public.ingredients SET name = 'Μύρτιλα', unit = 'φλιτζάνι' WHERE recipe_id = v_id AND name = 'Blueberries';
    UPDATE public.ingredients SET name = 'Σιρόπι σφενδάμου', unit = 'κ.σ.' WHERE recipe_id = v_id AND name = 'Maple syrup';
  END IF;

  -- 3. Translate Wild Salmon Zen Bowl
  SELECT id INTO v_id FROM public.recipes WHERE slug = 'wild-salmon-zen-bowl';
  IF v_id IS NOT NULL THEN
    UPDATE public.recipes SET
      title = 'Zen Μπολ με Άγριο Σολομό',
      description = 'Τέλεια ψημένος άγριος σολομός πάνω σε κινόα, αβοκάντο και πίκλες τζίντζερ.',
      instructions = '["Μαγειρέψτε την κινόα σύμφωνα με τις οδηγίες της συσκευασίας.", "Σοτάρετε τα φιλέτα σολομού σε ζεστό τηγάνι για 4 λεπτά από κάθε πλευρά.", "Τοποθετήστε την κινόα, το αβοκάντο και το σολομό σε μπολ.", "Γαρνίρετε με πίκλες τζίντζερ, σουσάμι και σάλτσα σόγιας."]'
    WHERE id = v_id;

    UPDATE public.ingredients SET name = 'Φιλέτα άγριου σολομού', unit = 'τεμάχια' WHERE recipe_id = v_id AND name = 'Wild salmon fillets';
    UPDATE public.ingredients SET name = 'Κινόα', unit = 'φλιτζάνι' WHERE recipe_id = v_id AND name = 'Quinoa';
    UPDATE public.ingredients SET name = 'Αβοκάντο', unit = 'τεμάχιο' WHERE recipe_id = v_id AND name = 'Avocado';
    UPDATE public.ingredients SET name = 'Πίκλες τζίντζερ', unit = 'κ.σ.' WHERE recipe_id = v_id AND name = 'Pickled ginger';
  END IF;

END $$;
