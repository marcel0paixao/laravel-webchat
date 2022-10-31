const defaultTheme = require('tailwindcss/defaultTheme');
const plugin = require("tailwindcss/plugin");

module.exports = {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './vendor/laravel/jetstream/**/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.tsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                'TBL_BACKGROUND': '#FBFBFB',
                'TBL_PRIMARY': '#FF5100',
                'TBL_SECONDARY': '#611199',
                'TBL_TERTIARY': '#9AA0A6',
                'TBL_ICONS': '#9C999E',
                'TBL_BORDERS': '#DFE1E5',
                'TBL_MENU_BORDER': '#C4C4C4',
                'TBL_MENU_COLOR': '#2F2A33',
                'TBL_INPUT_BG': '#DFE1E533',
                'TBL_TEXT_PRIMARY': '#170424',
                'TBL_TEXT_SECONDARY': '#9C999E',
                'TBL_TEXT_PLACEHOLDER': '#60676E',
                'TBL_ADDRESS_SECONDARY': '#7D7D7D',
                'TBL_BLUE_LINK': '#3880F3',
                'TBL_WARNING_BORDER': '#F6BA50',
                'TBL_WARNING_BG': '#FFFCE6',
                'TBL_PROFILE_HEADER_L': '#563996',
                'TBL_PROFILE_HEADER_R': '#9856AC',
                'TBL_DASHBOARD_BUTTON_ACTIVE': '#61119999',
                'TBL_DASHBOARD_BUTTON_INACTIVE': '#C9CFE17F',
                'TBL_DASHBOARD_HEADER_BTN_BG': '#C9CFE119',
                'TBL_ROUND_OVERLAY_BG': '#3333337F',
                'TBL_SUCCESS': '#B3EFCB',
                'TBL_TEXT_SUCCESS': '#00C851',
                'TBL_ERROR': '#FFB5B5',
                'TBL_TEXT_ERROR': '#962828',
                'TBL_WARNING': '#FFD37A',
                'TBL_TEXT_WARNING': '#2B2009',
                'TBL_NOTICE': '#FFFFFF',
                'TBL_TEXT_NOTICE': '#2F2A33',
                'TBL_BORDER_NOTICE': '#9AA0A6',
                'TBL_STARS': '#FFBB33',
                'TBL_DANGER': '#FF4444',
                'TBL_TEXT_GRAY': '#49444C'
            },
            spacing: {
                15: '3.75rem',
                18: '4.5rem',
                19: '4.75rem',
                22: '5.5rem',
                26: '6.5rem',
                27: '6.75rem',
                30: '7.5rem',
                42: '10.5rem',
                54: '13.5rem',
                76: '19rem',
            },
            fontSize: {
                '2xs': ['0.625rem', { lineHeight: '0.75rem' }],
                '3xs': ['0.5rem', { lineHeight: '0.625rem' }],
            },
            screens: {
                '2xs': '320px',
                xs: '480px',
            },
            maxWidth: {
                32: '48rem'
            },
            transitionDuration: {
                '0': '0ms',
                '2000': '2000ms',
                '3000': '3000ms',
            }
        },
    },

    plugins: [
        require('@tailwindcss/forms'),
        require('@tailwindcss/typography'),
        require('tailwindcss-textshadow'),
        plugin(function ({ addComponents, theme }) {
            const screens = theme("screens", {});
            addComponents([
                {
                    ".container": { width: "100%" },
                },
                {
                    [`@media (min-width: ${screens.sm})`]: {
                        ".container": {
                            "max-width": "640px",
                        },
                    },
                },
                {
                    [`@media (min-width: ${screens.md})`]: {
                        ".container": {
                            "max-width": "768px",
                        },
                    },
                },
                {
                    [`@media (min-width: ${screens.lg})`]: {
                        ".container": {
                            "max-width": "1024px",
                        },
                    },
                },
                {
                    [`@media (min-width: ${screens.xl})`]: {
                        ".container": {
                            "max-width": "1280px",
                        },
                    },
                },
                {
                    [`@media (min-width: ${screens["2xl"]})`]: {
                        ".container": {
                            "max-width": "1280px",
                        },
                    },
                },
            ]);
        }),
    ],
};
