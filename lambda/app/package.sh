#!/bin/bash

cd "$(dirname "${BASH_SOURCE[0]}")"

rm -rf package
docker run --rm -v "$PWD":/var/task \
  --entrypoint "" \
  public.ecr.aws/lambda/python:3.11 \
  bash -c "pip install -r requirements.txt --platform manylinux2014_x86_64 --target ./package --only-binary=:all:"

cd package
zip -r ../lambda_package.zip .
cd ..
zip -g lambda_package.zip app.py models.py db.py __init__.py bedrock.py