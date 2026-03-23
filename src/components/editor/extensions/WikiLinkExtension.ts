import { Node, mergeAttributes } from '@tiptap/core';

export const WikiLink = Node.create({
  name: 'wikiLink',
  group: 'inline',
  inline: true,
  selectable: true,
  atom: true,

  addAttributes() {
    return {
      title: {
        default: null,
        parseHTML: element => element.getAttribute('data-title'),
        renderHTML: attributes => ({
          'data-title': attributes.title,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-wiki-link]',
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        'data-wiki-link': '',
        class: 'wiki-link bg-primary/10 text-primary px-1 rounded cursor-pointer hover:bg-primary/20 transition-colors',
      }),
      `[[${node.attrs.title}]]`,
    ];
  },

  addInputRules() {
    return [
      {
        find: /\[\[([^\]]+)\]\]$/,
        handler: ({ state, range, match }) => {
          const { tr } = state;
          const start = range.from;
          const end = range.to;

          if (match[1]) {
            tr.replaceWith(
              start,
              end,
              this.type.create({
                title: match[1],
              })
            );
          }
        },
      } as any,
    ];
  },
});
