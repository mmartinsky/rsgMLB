import { Handler } from 'aws-lambda';
import { SendTweetV2Params, TwitterApi } from "twitter-api-v2";
import axios from 'axios';
import * as cheerio from 'cheerio';

import * as dotenv from "dotenv";
import { parsePlayerData, PlayerData } from './parsePlayer';
import { loadWarTablePage } from './helpers/getWarTable';

dotenv.config();

interface TweetConfig {
  text: string;
  params: Partial<SendTweetV2Params>;
}

async function generateTweetConfig(playerData: PlayerData): Promise<TweetConfig> {

  const text = `
  Remember ${playerData.name}?\n(${playerData.years}). AVG: ${playerData.average}. HR: ${playerData.hr}. RBI: ${playerData.rbi}. WAR: ${playerData.war}\n${playerData.url}
  `;
  // fetch imageUrl and convert to base64
  if (!playerData.imageUrl) {
    return {
      text: text,
      params: {},
    };
  }
  console.log("Image URL:", playerData.imageUrl);
  const imageUrl = playerData.imageUrl;
  const image = await axios.get(imageUrl);
  const imageBuffer = Buffer.from(image.data, 'binary');
  const base64Image = imageBuffer.toString('base64');

  // console.log("Base64 Image:", base64Image);
  // Upload the image to Twitter
  const client = new TwitterApi(process.env.TWITTER_BEARER_TOKEN as string);
  const mediaId = await client.v1.uploadMedia(Buffer.from(base64Image, 'base64'), { mimeType: 'image/jpeg', target: 'tweet' });
  
  console.log("Media ID:", mediaId);

  return {
    text: text,
    params: {
      media: {
        media_ids: [mediaId]
      }
    },
  };

  return {
    text: text,
    params: {},
  };
}

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
  try {
    const client = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY!,
      appSecret: process.env.TWITTER_API_SECRET!,
      accessToken: process.env.TWITTER_ACCESS_TOKEN!,
      accessSecret: process.env.TWITTER_ACCESS_SECRET!,
    });


    // Call the function before generating the tweet
    const randomPlayerLink = await getRandomPlayerLink();
    console.log(`Random player found: ${randomPlayerLink}`);
    const playerPageHtml = await fetchPlayerPage(randomPlayerLink);
    const playerData = parsePlayerData(playerPageHtml, randomPlayerLink);
    console.log(`Player data: ${JSON.stringify(playerData)}`);
    const tweetConfig = await generateTweetConfig(playerData);
    // const tweetData = await client.v2.tweet(tweetConfig.text, tweetConfig.params);
    return { statusCode: 200, body: JSON.stringify(tweetConfig) };
  } catch (error) {
    console.error('Error:', error);
    return { statusCode: 500, body: JSON.stringify(error) };
  }
};


