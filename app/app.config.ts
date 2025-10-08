export default defineAppConfig({
  ui: {
    colors: {
      primary: 'raspberry',
      secondary: 'shakespeare',
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
        'icon': 'i-simple-icons-github',
        'to': 'https://github.com/glueful',
        'target': '_blank',
        'aria-label': 'Glueful on GitHub'
      }]
  },
  toc: {
    title: 'Table of Contents',
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
        to: 'https://glueful.com/docs',
        target: '_blank'
      }]
    }
  }
})
