#!/bin/bash

cd "$(dirname "${BASH_SOURCE[0]}")"

#rm -rf package
#mkdir package
#pip install -r requirements.txt --target ./package
#cd package
#zip -r ../lambda_package.zip .
#cd ..
#zip -g lambda_package.zip rdsstop.py
zip lambda_package.zip rdsstop.py
