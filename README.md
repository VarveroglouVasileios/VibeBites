# 🍽️ VibeBites – Discover, Cook & Share

VibeBites is a premium, modern social recipe platform built with **Nuxt 3**, **Supabase**, and **Tailwind CSS**. It combines a sleek glassmorphism aesthetic with cutting-edge AI features to help you find inspiration in the kitchen, track your nutrition, and share your culinary creations with a vibrant community.

![VibeBites Logo](file:///Users/varveroglouvasileios/Desktop/VibeBites/VibeBites-1/public/og-default.png)

## ✨ Features

### 🤖 AI Fridge Assistant
Input the ingredients you have on hand, and our AI (powered by **Groq & Llama 3**) will generate a complete recipe for you, including full nutritional macros (Protein, Carbs, Fats) and step-by-step instructions.

### 🛒 Smart Ingredient Checklist
Features an interactive checklist with **Grocery Mode**, allowing users to categorize ingredients by department (Pantry, Protein, Produce, etc.) and scale quantities based on serving size.

### 🧪 Modern UI Patterns
- **Skeleton Loaders**: Smooth transition states for content loading across the app.
- **Glassmorphism Design**: Material Design 3 inspired aesthetic with deep blur effects.
- **Vue Sonner**: Rich, non-intrusive toast notifications for user actions.
- **Contact System**: Fully integrated contact form with admin message management.

### 🌸 Dynamic Seasonality
The home page automatically adapts its theme and content based on the current season (Spring, Summer, Autumn, Winter), offering relevant recipe suggestions and a fresh look throughout the year.

### 📱 PWA & Offline Support
Install VibeBites as a standalone app on your mobile device. Thanks to **Workbox** caching strategies, your viewed recipes remain accessible even when you're offline.

### ♿ Accessibility First (WCAG AA)
Designed with inclusivity in mind, featuring:
- Full ARIA labeling for icon-only buttons.
- `aria-hidden` attributes for decorative elements/emojis.
- High-contrast text and keyboard-navigable interfaces.
- "Skip to Content" links for power users.

### ⚡ Performance Optimized
- **@nuxt/image**: Automated WebP conversion and responsive image serving.
- **Lazy Loading**: Components and images are loaded on demand to minimize initial bundle size.
- **Nuxt OG Image**: Dynamic Social Share images for every recipe.

## 🛠️ Tech Stack

- **Framework**: [Nuxt 3](https://nuxt.com/)
- **Database & Auth**: [Supabase](https://supabase.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **State Management**: [Pinia](https://pinia.vuejs.org/)
- **AI Integration**: [Groq API](https://groq.com/)
- **UI Components**: Custom Glassmorphism System & [Vue Sonner](https://github.com/respect-the-sonner/vue-sonner)
- **PWA**: [Vite PWA](https://vite-pwa-org.netlify.app/)

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- A Supabase Project
- A Groq API Key

### Installation

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd VibeBites
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables (`.env`):
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_anon_key
   GROQ_API_KEY=your_groq_api_key
   ADMIN_EMAIL=your_admin_email
   ADMIN_PASSWORD=your_admin_password
   FULL_NAME="Your Name"
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📸 Screenshots

*(Add your screenshots from the `artifacts` directory here)*

---

Φτιαγμένο με 🧡 στην Ελλάδα.
