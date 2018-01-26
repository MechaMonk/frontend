const {series, crossEnv, concurrent, rimraf} = require('nps-utils');

module.exports = {
    scripts: {
        build: {
            before: rimraf('dist'),
            cloud: {
                production: {
                    default: series(
                        'nps build.before',
                        crossEnv('NODE_ENV=production webpack --progress -p --env.stage=production --env.target=cloud --env.extractCss')
                    )
                },
                development: {
                    default: series(
                        'nps build.before',
                        crossEnv('NODE_ENV=production webpack --progress -p --env.stage=development --env.target=cloud --env.extractCss')
                    )
                }
            },
            gateway: {
                production: {
                    default: series(
                        'nps build.before',
                        crossEnv('NODE_ENV=production webpack --progress -p --env.stage=production --env.target=gateway --env.extractCss')
                    )
                },
                development: {
                    default: series(
                        'nps build.before',
                        crossEnv('NODE_ENV=production webpack --progress -p --env.stage=development --env.target=gateway --env.extractCss')
                    )
                }
            }
        },
        debug: {
            cloud: {
                default: `webpack-dev-server -d --inline --env.server --env.stage=development --env.target=cloud`
            },
            gateway: {
                default: `webpack-dev-server -d --inline --env.server --env.stage=development --env.target=gateway`
            }
        }
    }
};
