#!/bin/bash

PYTHON_VERSION=3.13
# This script packages the app and its dependencies into a zip file
# that can be deployed to AWS Lambda.
# It requires Docker to be installed.
# The script assumes that the current working directory is the root of the project.
# It is important that the project is built using the same Python version as the Lambda runtime.
cd "$(dirname "${BASH_SOURCE[0]}")"

sudo rm -rf package
rm lambda_package.zip
docker run --rm -v "$PWD":/var/task \
  --entrypoint "" \
  public.ecr.aws/lambda/python:${PYTHON_VERSION} \
  bash -c "pip install -r requirements.txt --platform manylinux2014_x86_64 --target ./package --only-binary=:all:"

cd package
zip -r ../lambda_package.zip .
cd ..
zip -g lambda_package.zip app.py models.py db.py __init__.py bedrock.py
sudo rm -rf package/