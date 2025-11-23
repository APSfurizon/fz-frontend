export const parameters = {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
        matchers: {
            color: /(background|color)$/i,
            date: /Date$/,
        },
    },
};

export const globalTypes = {};

// Use decorators to inject global styles
export const decorators = [
    (Story) => {
        // Inject styles only once
        if (!document.getElementById('storybook-global-styles')) {
            const styleElement = document.createElement('style');
            styleElement.id = 'storybook-global-styles';
            styleElement.innerHTML = `
        * {
          font-family: 'Arial', 'Inter', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
        }

        .docs-story, .sb-show-main {
          background-color: #11191f;
        }
      `;
            document.head.appendChild(styleElement);
        }
        return Story();
    },
];
