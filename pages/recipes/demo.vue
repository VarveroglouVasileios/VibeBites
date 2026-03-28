<script setup lang="ts">
import { demoIngredients, demoRecipe } from '~/data/demoRecipe'

const heroUrl = '/stitch/recipe-detail.png'

useHead({ title: `${demoRecipe.title} · Culinary Curator` })
</script>

<template>
  <RecipeDetail
    :recipe="demoRecipe"
    :ingredients="demoIngredients"
    :hero-image-url="heroUrl"
  />
</template>
