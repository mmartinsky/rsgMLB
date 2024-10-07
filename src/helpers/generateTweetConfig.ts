import axios from "axios";
import TwitterApi, { SendTweetV2Params } from "twitter-api-v2";
import { PlayerData } from "./parsePlayer";

interface TweetConfig {
    text: string;
    params: Partial<SendTweetV2Params>;
}

export async function generateTweetConfig(playerData: PlayerData, client: TwitterApi): Promise<TweetConfig> {
    let tweetText: string;

    if ('average' in playerData) {
        // Position player
        tweetText = `
  Remember ${playerData.name}?
  (${playerData.years})
  AVG: ${playerData.average.toFixed(3).slice(1)}
  HR: ${playerData.hr}
  RBI: ${playerData.rbi}
  WAR: ${playerData.war.toFixed(1)}\n
  ${playerData.url}
      `.trim();
    } else {
        // Pitcher
        tweetText = `
  Remember ${playerData.name}?
  (${playerData.years})
  W-L: ${playerData.wins}-${playerData.losses}
  ERA: ${playerData.era.toFixed(2)}
  SO: ${playerData.strikeouts}
  WAR: ${playerData.war.toFixed(1)}\n
  ${playerData.url}
      `.trim();
    }
    tweetText += '\n\n#MLB #Baseball #RememberSomeGuys #Stats'


    // fetch imageUrl and convert to base64
    if (!playerData.imageUrl) {
        return {
            text: tweetText,
            params: {},
        };
    }
    console.log("Image URL:", playerData.imageUrl);
    const imageUrl = playerData.imageUrl;
    const image = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const base64Image = Buffer.from(image.data, 'binary').toString('base64')

    // Upload the image to Twitter
    const b64Image = Buffer.from(base64Image, 'base64');
    const mediaId = await client.v1.uploadMedia(b64Image, { mimeType: 'image/jpeg', target: 'tweet' });

    console.log("Media ID:", mediaId);

    return {
        text: tweetText,
        params: {
            media: {
                media_ids: [mediaId]
            }
        },
    };
}
