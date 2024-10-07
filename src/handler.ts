import { Handler } from 'aws-lambda';
import { TwitterApi } from "twitter-api-v2";
import axios from 'axios';
import * as dotenv from "dotenv";
import { parsePlayerData } from './parsePlayer';
import { generateTweetConfig } from './generateTweetConfig';
import { loadWarTablePage } from './helpers/getWarTable';

dotenv.config();

async function fetchPlayerPage(url: string): Promise<string> {
  const response = await axios.get(url);
  return response.data;
}

async function getRandomPlayerLink(): Promise<string> {
  const $ = await loadWarTablePage();

  const playerLinks: string[] = [];

  const rows = $('#leader_standard_WAR tr');

  rows.each((_, row) => {
    const warCell = $(row).find('td:eq(2)');
    const war = parseFloat(warCell.text());

    if (war >= 40 && war <= 70) {
      const nameCell = $(row).find('td:eq(1)');
      const link = nameCell.find('a').attr('href');
      if (link) {
        playerLinks.push(link);
      }
    }
  });

  console.log("Found", playerLinks.length, "players with WAR between 40 and 70");

  if (playerLinks.length === 0) {
    throw new Error('No players found with WAR between 40 and 70');
  }

  const randomIndex = Math.floor(Math.random() * playerLinks.length);
  const randomPlayerLink = playerLinks[randomIndex];

  return "https://www.baseball-reference.com" + randomPlayerLink;
}

// Lambda handler function
export const handler: Handler = async (event, context) => {
  console.log("Starting Execution")
  try {
    const client = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY!,
      appSecret: process.env.TWITTER_API_SECRET!,
      accessToken: process.env.TWITTER_ACCESS_TOKEN!,
      accessSecret: process.env.TWITTER_ACCESS_SECRET!,
    });

    console.log("Fetching random player link")

    const randomPlayerLink = await getRandomPlayerLink();
    console.log(`Random player found: ${randomPlayerLink}`);

    const playerPageHtml = await fetchPlayerPage(randomPlayerLink);
    const playerData = parsePlayerData(playerPageHtml, randomPlayerLink);
    console.log(`Player data: ${JSON.stringify(playerData)}`);

    const tweetConfig = await generateTweetConfig(playerData, client);
    const tweetData = await client.v2.tweet(tweetConfig.text, tweetConfig.params);

    console.log("Tweeted:", tweetData);
    return { statusCode: 200, body: JSON.stringify(tweetData) };
  } catch (error) {
    console.error('Error:', error);
    return { statusCode: 500, body: JSON.stringify(error) };
  }
};


