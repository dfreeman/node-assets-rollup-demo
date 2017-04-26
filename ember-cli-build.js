/* eslint-env node */
const EmberApp = require('ember-cli/lib/broccoli/ember-app');
const MergeTrees = require('broccoli-merge-trees');
const FileCreator = require('broccoli-file-creator');
const Rollup = require('broccoli-rollup');
const commonjs = require('rollup-plugin-commonjs');
const nodeResolve = require('rollup-plugin-node-resolve');

module.exports = function(defaults) {
  var app = new EmberApp(defaults, {
    nodeAssets: {
      lodash: {
        vendor: {
          processTree(input) {
            let modules = ['lodash/mapValues', 'lodash/findIndex'];
            let entry = new FileCreator('entry.js', modules.map(generateShim).join('\n'));

            return new Rollup(new MergeTrees([entry, input]), {
              rollup: {
                entry: 'entry.js',
                dest: 'lodash-subset.js',
                format: 'iife',
                plugins: [
                  nodeResolve({ jsnext: true }),
                  commonjs()
                ]
              }
            });
          }
        }
      }
    }
  });

  app.import('vendor/lodash-subset.js');

  return app.toTree();
};

function generateShim(path, index) {
  return `
    import import${index} from '${path}';
    define('${path}', ['exports'], function(exports) {
      exports.default = import${index};
    });
  `;
}
