// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/scss/main.scss'],
  modules: ['@nuxt/eslint', '@pinia/nuxt'],
  typescript: {
    strict: true
  },
  app: {
    head: {
      htmlAttrs: {
        lang: 'ru'
      },
      title: 'Заметки',
      meta: [
        { name: 'description', content: 'Заметки со списками задач' }
      ]
    }
  }
})
