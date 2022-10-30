import theme from '@jsilva-pt/nuxt-content-theme-blog'
import { footerLinks } from './blog.settings'

const baseUrl = 'https://crazyelectron.io'

const publicRuntimeConfig = {
  baseUrl: 'https://crazyelectron.io',

  logoLight: '/logo-light.png',
  logoDark: '/logo-dark.png',

  githubOwner: 'crazyelectron-io',
  githubRepository: 'crazyelectron-blog',
  githubMainBranch: 'master',

  footerLinks,
}

export default theme({
  feedOptions: {
    title: 'CrazyElectronBlog',
    description: 'CrazyElectron Electronics and Retro Computing Blog',
    link: baseUrl,
  },
  publicRuntimeConfig,
  pwa: {
    manifest: {
      short_name: 'CrazyElectronBlog',
    },
    meta: {
      author: 'Ron Moerman',
      theme_color: '#2C3E50',
      ogHost: baseUrl,
      twitterCard: 'summary_large_image',
      twitterSite: publicRuntimeConfig.twitterUsername,
      twitterCreator: publicRuntimeConfig.twitterUsername,
    },
  },
  i18n: {
    locales: [
      {
        code: 'en',
        iso: 'en-US',
        name: 'English',
      },
    ],
    defaultLocale: 'en',
    vueI18n: {
      fallbackLocale: 'en',
      messages: {
        en: require('./i18n/en-US'),
      },
    },
  },
})
