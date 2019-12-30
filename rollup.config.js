import babel from 'rollup-plugin-babel';
import nodeResolve from 'rollup-plugin-node-resolve';
import pkg from './package.json';

const extensions = ['.js', '.ts'];

const plugins = [
  babel({
    extensions,
    include: ['./src/**/*']
  }),
  nodeResolve({
    extensions,
    browser: true
  })
];

export default {
  input: './src/index.ts',
  plugins: plugins,
  output: [
    {
      format: 'cjs',
      file: pkg.main
    },
    {
      format: 'esm',
      file: pkg.module
    }
  ]
};
