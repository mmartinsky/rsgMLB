#!/bin/bash

FUNCTION_NAME="rsg-mlb-bot"
RULE_NAME="${FUNCTION_NAME}-daily-trigger"

# Check if the CloudWatch Events rule exists
aws events describe-rule --name $RULE_NAME > /dev/null 2>&1
if [ $? -ne 0 ]; then
    # Rule doesn't exist, create it
    echo "Creating CloudWatch Events rule..."
    aws events put-rule \
        --name $RULE_NAME \
        --schedule-expression "cron(0 12 * * ? *)" \
        --state ENABLED
        
    RULE_ARN=$(aws events describe-rule --name $RULE_NAME --query 'Arn' --output text)
    echo "Source ARN: $RULE_ARN"

    # Add permission to CloudWatch Events to invoke the Lambda function
    aws lambda add-permission \
        --function-name $FUNCTION_NAME \
        --statement-id "${RULE_NAME}-event" \
        --action 'lambda:InvokeFunction' \
        --principal events.amazonaws.com \
        --source-arn $RULE_ARN

    LAMBDA_ARN=$(aws lambda get-function --function-name $FUNCTION_NAME --query 'Configuration.FunctionArn' --output text)

    # Set the Lambda function as the target for the CloudWatch Events rule
    aws events put-targets \
        --rule $RULE_NAME \
        --targets "Id"="1","Arn"="$LAMBDA_ARN"

    echo "Daily trigger setup completed."
else
    echo "CloudWatch Events rule already exists. Skipping creation."
fi

echo "CloudWatch rule script completed."