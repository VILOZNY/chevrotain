find $(pwd)/src/ $(pwd)/test/ -name "*.ts" | xargs node_modules/.bin/tsc -w -t ES5 --diagnostics --sourcemap --module commonjs --outDir bin