// Inside vue.config.js
module.exports = {

    chainWebpack: (config) => {
        const svgRule = config.module.rule('svg');

        svgRule.uses.clear();

        svgRule
            .use('vue-svg-loader')
            .loader('vue-svg-loader');
    },

    css: {
        loaderOptions: {
            less: {
                modifyVars: {
                    'primary-color': '#DD4B4B',
                    'link-color': '#DD4B4B',
                    'border-radius-base': '2px',
                },
                javascriptEnabled: true
            }
        }
    }

}