#!/bin/bash

git pull
npm run build
# ossutil64 cp -f -r build/asset oss://bbxweb/asset
ossutil64 cp -f -r build/asset oss://bbx-static/asset
# cp -f build/index.html public/index.html
