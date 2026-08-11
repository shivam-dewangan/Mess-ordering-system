data "aws_caller_identity" "current" {}

data "aws_iam_policy_document" "lambda_assume_role" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }

    actions = [
      "sts:AssumeRole"
    ]
  }
}

resource "aws_iam_role" "lambda" {
  name = "${var.project_name}-lambda-role"

  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role.json
}

resource "aws_iam_role_policy_attachment" "lambda_basic" {
  role       = aws_iam_role.lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

data "archive_file" "lambda" {
  type        = "zip"
  output_path = "${path.module}/lambda.zip"

  source {
    content = <<-EOF
      exports.handler = async (event) => {
        console.log("Mess Ordering Lambda event:", JSON.stringify(event));

        return {
          statusCode: 200,
          body: JSON.stringify({
            message: "Lambda is working",
            project: "mess-ordering-system"
          })
        };
      };
    EOF

    filename = "index.js"
  }
}

resource "aws_lambda_function" "mess" {
  function_name = "${var.project_name}-lambda"

  role = aws_iam_role.lambda.arn

  runtime = var.lambda_runtime
  handler = "index.handler"

  filename         = data.archive_file.lambda.output_path
  source_code_hash = data.archive_file.lambda.output_base64sha256

  timeout     = 30
  memory_size = 128

  environment {
    variables = {
      PROJECT = var.project_name
    }
  }

  tags = {
    Name = "${var.project_name}-lambda"
  }
}

resource "aws_cloudwatch_log_group" "lambda" {
  name              = "/aws/lambda/${aws_lambda_function.mess.function_name}"
  retention_in_days = 7
}

resource "aws_cloudwatch_event_rule" "lambda_schedule" {
  name                = "${var.project_name}-lambda-schedule"
  description         = "Scheduled trigger for Mess Ordering Lambda"
  schedule_expression = "rate(5 minutes)"
}

resource "aws_cloudwatch_event_target" "lambda" {
  rule = aws_cloudwatch_event_rule.lambda_schedule.name

  arn = aws_lambda_function.mess.arn
}

resource "aws_lambda_permission" "eventbridge" {
  statement_id = "AllowEventBridge"

  action = "lambda:InvokeFunction"

  function_name = aws_lambda_function.mess.function_name

  principal = "events.amazonaws.com"

  source_arn = aws_cloudwatch_event_rule.lambda_schedule.arn
}
