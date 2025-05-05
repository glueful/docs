// Import package exports
import { createMarkdownParser, rehypeHighlight, createShikiHighlighter } from '@nuxtjs/mdc/runtime'
// Import desired Shiki themes and languages
import MaterialThemePalenight from '@shikijs/themes/material-theme-palenight'
import HtmlLang from '@shikijs/langs/html'
import MdcLang from '@shikijs/langs/mdc'
import TsLang from '@shikijs/langs/typescript'
import VueLang from '@shikijs/langs/vue'
import ScssLang from '@shikijs/langs/scss'
import YamlLang from '@shikijs/langs/yaml'
// Import transformers from your project
import { transformContent } from '@/components/content/transformers'
import { createSingleton } from '@/components/content/transformers/utils'

export default function useMarkdownParser() {
  // Create a singleton instance of the parser
  const getParser = createSingleton(async () => {
    return await createMarkdownParser({
      rehype: {
        plugins: {
          highlight: {
            instance: rehypeHighlight,
            options: {
              // Pass in your desired theme(s)
              theme: 'material-theme-palenight',
              // Create the Shiki highlighter
              highlighter: createShikiHighlighter({
                bundledThemes: {
                  'material-theme-palenight': MaterialThemePalenight,
                },
                // Configure the bundled languages
                bundledLangs: {
                  html: HtmlLang,
                  mdc: MdcLang,
                  vue: VueLang,
                  yml: YamlLang,
                  scss: ScssLang,
                  ts: TsLang,
                  typescript: TsLang,
                },
              }),
            },
          },
        },
      },
    })
  })

  // Main parse function that uses MDC parser
  const parse = async (content: string) => {
    try {
      // First preprocess the markdown to fix common MDC syntax issues
      const processedContent = preprocessMarkdown(content)

      // Get the parser instance and parse the content
      const parser = await getParser()
      return await parser(processedContent)
    } catch (error) {
      console.error('Error in markdown parser:', error)
      // Return a minimal valid result structure to prevent rendering errors
      return {
        body: [],
        data: {},
        excerpt: { text: '', html: '' },
        html: `<div class="markdown-error">Error parsing markdown: ${error instanceof Error ? error.message : String(error)}</div>`,
        text: content,
      }
    }
  }

  // Alternative function that uses the content transformer system
  const parseWithTransformers = async (content: string, id = 'inline-content.md') => {
    try {
      // First preprocess the content
      const processedContent = preprocessMarkdown(content)

      // Use the transformContent function from your transformers system
      const result: any = await transformContent(id, processedContent, {
        markdown: {
          // Pass any markdown-specific options here
          remarkPlugins: {},
          rehypePlugins: {},
          highlight: {
            theme: 'material-theme-palenight',
          },
        },
      })

      return {
        body: result.body,
        data: result,
        excerpt: result.excerpt || { text: '', html: '' },
        html: result.html || '',
        text: content,
      }
    } catch (error) {
      console.error('Error using content transformer system:', error)
      // Fall back to the regular parser
      return parse(content)
    }
  }

  // Helper function to preprocess markdown and fix common MDC component nesting issues
  const preprocessMarkdown = (content: string): string => {
    try {
      // Simple preprocessing to normalize component tags and spacing
      const processedContent = content
        // Fix space issues around component openings
        .replace(/^(:{2,3}[a-zA-Z0-9-]+)(\{[^}]*\})?$/gm, '$1$2\n')

        // Fix component blocks inside components - ensure proper spacing before closing tags
        .replace(/(\n\S[^\n]+)\n(:{2,3})\s*$/gm, '$1\n\n$2')

        // Add newlines around section markers
        .replace(/^(#[a-zA-Z-]+)$/gm, '\n$1\n')

        // Fix nested components
        .replace(/(:{3}[^\n]+\n)\n*(:{3}[^\n]+)/gm, '$1\n$2')

        // Fix closing tags to ensure they're on their own lines
        .replace(/([^\n])(:{2,3})$/gm, '$1\n$2')

        // Make sure component containers have proper closing tags
        .replace(/(:{2,3}[a-zA-Z0-9-]+[^\n]*\n[\s\S]*?)(?!\1)(?=^:{2,3}\s*$)/gm, (match, group) => {
          const openingTag = group.match(/^(:{2,3})/m)
          if (openingTag) {
            // Make sure there's appropriate spacing
            return group + (group.endsWith('\n\n') ? '' : '\n')
          }
          return match
        })

        // Clean up excessive whitespace
        .replace(/\n{3,}/g, '\n\n')

      return processedContent
    } catch (err) {
      console.warn('Error preprocessing markdown:', err)
      return content // Return original content if preprocessing fails
    }
  }

  // Return both parse functions
  return {
    parse,
    parseWithTransformers,
  }
}
