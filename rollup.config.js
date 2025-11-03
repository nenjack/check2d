import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'

export default {
  input: 'src/index.ts',
  output: {
    file: 'esm/index.js',
    format: 'esm',
    sourcemap: true
  },
  plugins: [
    resolve(),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.esm.json',
      sourceMap: true,
      declaration: false
    })
  ]
}
