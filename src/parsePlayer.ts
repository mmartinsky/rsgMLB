import * as cheerio from 'cheerio';

function extractYearRange($: cheerio.CheerioAPI): string {
    const years = $('tr:not(.minors_table.hidden) th[data-stat="year_ID"]').map((i, el) => $(el).text()).get();
    const firstYear = years[1];
    const lastYear = years[years.length - 1];
  
    return `${firstYear}-${lastYear}`;
  }

export interface PlayerData {
  name: string;
  url: string;
  war: number;
  average: number;
  hr: number;
  rbi: number;
  years: string;
  imageUrl?: string;
}

export function parsePlayerData(html: string, baseUrl: string): PlayerData {
    const $ = cheerio.load(html);
  
    // Find WAR value
    return {
        name: $('#meta h1').first().text().trim(),
        url: baseUrl,
        imageUrl: $('.media-item.multiple img').first().attr('src'),
        war: parseFloat($('.poptip[data-tip*="Wins Above Replacement"] + p').text()),
        average: parseFloat($('.poptip[data-tip*="Hits/At Bats"] + p').text()),
        hr: parseInt($('.poptip[data-tip="Home Runs Hit/Allowed"] + p').text(), 10),
        rbi: parseInt($('.poptip[data-tip="Runs Batted In"] + p').text(), 10),
        years: extractYearRange($),
      };
  }