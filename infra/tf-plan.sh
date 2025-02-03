 #!/usr/bin/bash 
 
 #terraform init \
 #         -backend-config="region=eu-west-2" \
 #         -backend-config="bucket=potteringabout-build" \
 #         -backend-config="key=github.com/potteringabout/organiser/dev/terraform.tfstate" \
 #         -backend-config="dynamodb_table=tflocks" \
 #         -backend-config="encrypt=true"

terraform init

terraform plan -var-file="input.tfvars.json" -var "deployment_repo=github.com/potteringabout/organiser"  -detailed-exitcode -no-color