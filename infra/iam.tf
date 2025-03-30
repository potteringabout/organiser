data "aws_iam_policy_document" "policy" {
  statement {
    sid = "1"

    actions = [
      "xray:PutTraceSegments",
      "xray:PutTelemetryRecords"
    ]

    resources = [
      "*"
    ]
  }

  statement {
    sid = "2"

    actions = [
      "dynamodb:GetItem",
      "dynamodb:PutItem",
      "dynamodb:UpdateItem",
      "dynamodb:DeleteItem",
      "dynamodb:Query",
      "dynamodb:Scan",
      "dynamodb:BatchWriteItem",
      "dynamodb:BatchGetItem",
      "bedrock:InvokeModel"
    ]

    resources = [
      "arn:aws:dynamodb:${var.aws_region}:${data.aws_caller_identity.current.account_id}:table/Organiser",
      "arn:aws:dynamodb:${var.aws_region}:${data.aws_caller_identity.current.account_id}:table/Organiser/*",
      "arn:aws:bedrock:${var.aws_region}::foundation-model/meta.llama3-70b-instruct-v1:0",
      "arn:aws:bedrock:${var.aws_region}::foundation-model/mistral.mixtral-8x7b-instruct-v0:1",

    ]
  }
}

resource "aws_iam_policy" "policy" {
  name        = "potteringabout-organiser-lambda"
  description = "Organiser policy for Lambda"
  policy      = data.aws_iam_policy_document.policy.json
}



resource "aws_iam_role" "lambda_exec" {
  name = "potteringabout-organiser-lambda"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_policy_attachment" "test-attach" {
  name       = "potteringabout-organiser-lambda-policy-attach"
  roles      = [aws_iam_role.lambda_exec.name]
  policy_arn = aws_iam_policy.policy.arn

}
