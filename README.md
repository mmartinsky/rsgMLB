# rsgMLB
### Code powering @rsgMLB Twitter Bot. 

![rsgMLB](https://i.imgur.com/ltkGprY.png)

## Overview

This repository contains the code for the @rsgMLB Twitter Bot, an automated system that posts interesting baseball statistics and facts. The bot is designed to run as an AWS Lambda function, periodically fetching data from Baseball-Reference.com and posting updates to Twitter.

## Features

- Scrapes player data from Baseball-Reference.com
- Parses HTML to extract relevant statistics
- Supports both position players and pitchers
- Generates engaging tweets based on player statistics
- Runs serverless on AWS Lambda

## Tech Stack

- TypeScript
- Node.js
- AWS Lambda
- Twitter API (via twitter-api-v2 and twitter-api-sdk)
- Cheerio for HTML parsing
- Axios for HTTP requests
- Jest for testing

## Project Structure

- `src/`: Contains the source TypeScript files
  - `handler.ts`: Main Lambda function handler
  - `parsePlayer.ts`: Logic for parsing player data from HTML
  - `parsePlayer.test.ts`: Unit tests for the parsing logic
  - `local.ts`: Script for running the bot locally
- `dist/`: Compiled JavaScript files
- `sample_data/`: HTML samples for testing

## Setup and Deployment

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (Twitter API keys, AWS credentials)
4. Build the project: `npm run build`
5. Deploy to AWS Lambda (refer to AWS documentation for deployment steps)

## Local Development

- Run tests: `npm test`
- Watch tests: `npm run test:watch`
- Start locally: `npm start`


