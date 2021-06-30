module.exports = {
    chainWebpack: config => {
        config.module
        // Add another loader
            .rule('glsl')
            .test(/\.(glsl|vs|fs)$/)
            .use('ts-shader-loader')
            .loader('ts-shader-loader')
            .end();
    }
};
