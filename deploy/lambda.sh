#!/bin/bash

FUNCTION_NAME="rsg-mlb-bot"
RUNTIME="nodejs20.x"
ROLE="arn:aws:iam::016670670970:role/LambdaTwitterBotRole"
HANDLER="handler.handler"

# Build the project
echo "Building the project..."
npm run build

# Check if the build was successful
if [ $? -ne 0 ]; then
    echo "Build failed. Exiting."
    exit 1
fi

# Create a deployment package
echo "Creating deployment package..."
zip -r deployment.zip dist node_modules

# Check if the Lambda function exists
aws lambda get-function --function-name $FUNCTION_NAME > /dev/null 2>&1
if [ $? -eq 0 ]; then
    # Function exists, update it
    echo "Updating existing Lambda function..."
    aws lambda update-function-code \
        --function-name $FUNCTION_NAME \
        --zip-file fileb://deployment.zip

    # Update the function configuration
    aws lambda update-function-configuration \
        --function-name $FUNCTION_NAME \
        --runtime $RUNTIME \
        --handler $HANDLER \
        --role $ROLE
else
    # Function doesn't exist, create it
    echo "Creating new Lambda function..."
    aws lambda create-function \
        --function-name $FUNCTION_NAME \
        --runtime $RUNTIME \
        --role $ROLE \
        --handler $HANDLER \
        --zip-file fileb://deployment.zip
fi

# Check if the deployment was successful
if [ $? -eq 0 ]; then
    echo "Deployment successful!"
else
    echo "Deployment failed."
    exit 1
fi

# Clean up
echo "Cleaning up..."
rm deployment.zip

echo "Script completed."