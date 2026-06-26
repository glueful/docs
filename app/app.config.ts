export default defineAppConfig({
  ui: {
    colorMode: false,
    colors: {
      primary: 'raspberry',
      secondary: 'azure-radiance',
      neutral: 'slate'
    },
    footer: {
      slots: {
        root: 'border-t border-default',
        left: 'text-sm text-muted'
      }
    },
    button: {
      slots: {
        base: ['cursor-pointer']
      }
    },
    dropdownMenu: {
      slots: {
        item: ['cursor-pointer']
      }
    }
  },
  seo: {
    siteName: 'Glueful Docs'
  },
  header: {
    title: '',
    to: '/',
    // Current framework version shown next to the logo — bump on each framework release.
    version: '1.63.2',
    logo: {
      alt: '',
      light: '',
      dark: ''
    },
    search: true,
    colorMode: true,
    links: [{
      'icon': 'i-simple-icons-github',
      'to': 'https://github.com/glueful',
      'target': '_blank',
      'aria-label': 'GitHub'
    }]
  },
  footer: {
    credits: `Glueful • © ${new Date().getFullYear()}`,
    colorMode: false,
    links: [
    //   {
    //   'icon': 'i-simple-icons-discord',
    //   'to': 'https://go.nuxt.com/discord',
    //   'target': '_blank',
    //   'aria-label': 'Glueful on Discord'
    // }, {
    //   'icon': 'i-simple-icons-x',
    //   'to': 'https://go.nuxt.com/x',
    //   'target': '_blank',
    //   'aria-label': 'Glueful on X'
    // },
      {
        'icon': 'i-tabler-ad-2',
        'to': 'https://github.com/glueful/framework/releases',
        'target': '_blank',
        'aria-label': 'Glueful releases'
      },
      {
        'icon': 'i-simple-icons-github',
        'to': 'https://github.com/glueful',
        'target': '_blank',
        'aria-label': 'Glueful on GitHub'
      }]
  },
  toc: {
    title: 'On this page',
    bottom: {
      title: 'Community',
      edit: 'https://github.com/glueful/docs/edit/main/content',
      links: [{
        icon: 'i-lucide-star',
        label: 'Star on GitHub',
        to: 'https://github.com/glueful',
        target: '_blank'
      }, {
        icon: 'i-lucide-book-open',
        label: 'Glueful docs',
        to: 'https://glueful.com/getting-started',
        target: '_blank'
      }]
    }
  }
})
