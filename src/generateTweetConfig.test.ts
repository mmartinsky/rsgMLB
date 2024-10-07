import { generateTweetConfig } from '../src/generateTweetConfig';
import { PlayerData } from '../src/parsePlayer';
import TwitterApi from 'twitter-api-v2';
import axios from 'axios';

// Mock axios and TwitterApi
jest.mock('axios');
jest.mock('twitter-api-v2');

describe('generateTweetConfig', () => {
  // Mock TwitterApi client
  const mockClient = {
    v1: {
      uploadMedia: jest.fn().mockResolvedValue('mock-media-id'),
    },
  } as unknown as TwitterApi;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('generates correct config for a position player', async () => {
    const playerData: PlayerData = {
      name: 'John Doe',
      years: '2000-2010',
      average: 0.300,
      hr: 200,
      rbi: 800,
      war: 30.5,
      url: 'http://example.com/johndoe',
      imageUrl: 'http://example.com/johndoe.jpg',
    };

    (axios.get as jest.Mock).mockResolvedValue({ data: Buffer.from('mock-image-data') });

    const result = await generateTweetConfig(playerData, mockClient);

    expect(result.text).toContain('Remember John Doe?');
    expect(result.text).toContain('AVG: .300');
    expect(result.text).toContain('HR: 200');
    expect(result.text).toContain('RBI: 800');
    expect(result.text).toContain('WAR: 30.5');
    expect(result.text).toContain('#MLB #Baseball #RememberSomeGuys #Stats');
    expect(result.params.media?.media_ids).toEqual(['mock-media-id']);
  });

  test('generates correct config for a pitcher', async () => {
    const playerData: PlayerData = {
      name: 'Jane Smith',
      years: '2005-2015',
      wins: 150,
      losses: 100,
      era: 3.50,
      strikeouts: 2000,
      saves: 10,
      war: 40.2,
      url: 'http://example.com/janesmith',
      imageUrl: 'http://example.com/janesmith.jpg',
    };

    (axios.get as jest.Mock).mockResolvedValue({ data: Buffer.from('mock-image-data') });

    const result = await generateTweetConfig(playerData, mockClient);

    expect(result.text).toContain('Remember Jane Smith?');
    expect(result.text).toContain('W-L: 150-100');
    expect(result.text).toContain('ERA: 3.50');
    expect(result.text).toContain('SO: 2000');
    expect(result.text).toContain('WAR: 40.2');
    expect(result.text).toContain('#MLB #Baseball #RememberSomeGuys #Stats');
    expect(result.params.media?.media_ids).toEqual(['mock-media-id']);
  });

  test('handles player data without image URL', async () => {
    const playerData: PlayerData = {
      name: 'No Image Player',
      years: '2010-2020',
      average: 0.250,
      hr: 100,
      rbi: 500,
      war: 20.0,
      url: 'http://example.com/noimageplayer',
    };

    const result = await generateTweetConfig(playerData, mockClient);

    expect(result.text).toContain('Remember No Image Player?');
    expect(result.params).toEqual({});
    expect(axios.get).not.toHaveBeenCalled();
    expect(mockClient.v1.uploadMedia).not.toHaveBeenCalled();
  });

  test('handles image fetch error', async () => {
    const playerData: PlayerData = {
      name: 'Error Player',
      years: '2015-2022',
      average: 0.280,
      hr: 150,
      rbi: 600,
      war: 25.5,
      url: 'http://example.com/errorplayer',
      imageUrl: 'http://example.com/errorplayer.jpg',
    };

    (axios.get as jest.Mock).mockRejectedValue(new Error('Image fetch failed'));

    await expect(generateTweetConfig(playerData, mockClient)).rejects.toThrow('Image fetch failed');
  });
});