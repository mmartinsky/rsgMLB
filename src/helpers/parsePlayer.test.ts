import { parsePlayerData } from './parsePlayer';
import fs from 'fs';
import path from 'path';

describe('parsePlayerData', () => {
  it('should correctly parse position player data from HTML', () => {
    const html = fs.readFileSync(path.join(__dirname, '..', 'sample_data', 'casey_blake.html'), 'utf-8');
    const baseUrl = 'https://www.baseball-reference.com/players/b/blakeca01.shtml';
    
    const result = parsePlayerData(html, baseUrl);

    expect(result).toEqual({
      name: 'Casey Blake',
      url: 'https://www.baseball-reference.com/players/b/blakeca01.shtml',
      war: 24.8,
      average: 0.264,
      hr: 167,
      rbi: 616,
      years: '1999-2011',
      imageUrl: 'https://www.baseball-reference.com/req/202408150/images/headshots/1/198ad835_sabr.jpg',
    });
  });
  it('should correctly parse pitcher data from HTML', () => {
    const html = fs.readFileSync(path.join(__dirname, '..', 'sample_data', 'ron_guidry.html'), 'utf-8');
    const baseUrl = 'https://www.baseball-reference.com/players/g/guidrror01.shtml';
    
    const result = parsePlayerData(html, baseUrl);

    expect(result).toEqual({
      name: 'Ron Guidry',
      url: 'https://www.baseball-reference.com/players/g/guidrror01.shtml',
      war: 47.8,
      years: '1975-1988',
      imageUrl: 'https://www.baseball-reference.com/req/202408150/images/headshots/b/b7165247_sabr.jpg',
      era: 3.29,
      wins: 170,
      losses: 91,
      saves: 4,
      strikeouts: 1778,
    });
  });
});
