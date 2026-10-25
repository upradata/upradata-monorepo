#!/usr/bin/env bash

mkdir -p bin

for f in $(find lib -name '*.command.js'); do
    echo "copy $(basename $f)"
    ln -sf $(realpath $f) bin/$(basename "$f" .command.js)
    chmod +x $f
done

chmod +x -R bin
