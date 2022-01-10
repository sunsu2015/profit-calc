const path = require('path');
const config = {
  projectName: 'profit-calc',
  date: '2022-1-7',
  designWidth: 750,
  deviceRatio: {
    '640': 2.34 / 2,
    '750': 1,
    '828': 1.81 / 2
  },
  sourceRoot: 'src',
  outputRoot: 'dist',
  plugins: [],
  defineConstants: {
  },
  alias: {
    '@vant': path.resolve(__dirname, '../src/components/vant-weapp/dist')
  },
  copy: {
    patterns: [
      { from: 'sitemap.json', to: 'dist/sitemap.json' },
      { from: 'src/components/vant-weapp/dist/common', to: 'dist/components/vant-weapp/dist/common' },
      { from: 'src/components/vant-weapp/dist/wxs', to: 'dist/components/vant-weapp/dist/wxs' },
      { from: 'src/components/vant-weapp/dist/sticky/index.wxs', to: 'dist/components/vant-weapp/dist/sticky/index.wxs' },
      { from: 'src/components/vant-weapp/dist/slider/index.wxs', to: 'dist/components/vant-weapp/dist/slider/index.wxs' },
      { from: 'src/components/vant-weapp/dist/picker', to: 'dist/components/vant-weapp/dist/picker' },
      { from: 'src/components/vant-weapp/dist/picker-column', to: 'dist/components/vant-weapp/dist/picker-column' },
      { from: 'src/components/vant-weapp/dist/notify', to: 'dist/components/vant-weapp/dist/notify' },
      { from: 'src/components/vant-weapp/dist/field/index.wxs', to: 'dist/components/vant-weapp/dist/field/index.wxs' },
    ],
    options: {
    }
  },
  framework: 'vue',
  mini: {
    postcss: {
      pxtransform: {
        enable: true,
        config: {
          selectorBlackList: [/van-/]
        }
      },
      url: {
        enable: true,
        config: {
          limit: 1024 // 设定转换尺寸上限
        }
      },
      cssModules: {
        enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
        config: {
          namingPattern: 'module', // 转换模式，取值为 global/module
          generateScopedName: '[name]__[local]___[hash:base64:5]'
        }
      }
    }
  },
  h5: {
    publicPath: '/',
    staticDirectory: 'static',
    postcss: {
      autoprefixer: {
        enable: true,
        config: {
        }
      },
      cssModules: {
        enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
        config: {
          namingPattern: 'module', // 转换模式，取值为 global/module
          generateScopedName: '[name]__[local]___[hash:base64:5]'
        }
      }
    }
  }
}

module.exports = function (merge) {
  if (process.env.NODE_ENV === 'development') {
    return merge({}, config, require('./dev'))
  }
  return merge({}, config, require('./prod'))
}
