import * as cheerio from 'cheerio';

function extractYearRange($: cheerio.CheerioAPI): string {
    const years = $('tr:not(.minors_table.hidden) th[data-stat="year_ID"]').map((i, el) => $(el).text()).get();
    const firstYear = years[1];
    const lastYear = years[years.length - 1];

    return `${firstYear}-${lastYear}`;
}

 interface BasePlayerData {
    name: string;
    url: string;
    years: string;
    war: number;
    imageUrl?: string;
}

 interface PositionPlayerData extends BasePlayerData {
    average: number;
    hr: number;
    rbi: number;
}

 interface PitcherData extends BasePlayerData {
    wins: number;
    losses: number;
    era: number;
    saves: number;
    strikeouts: number;
}

export type PlayerData = PositionPlayerData | PitcherData;

export function parsePlayerData(html: string, baseUrl: string): PlayerData {
    const $ = cheerio.load(html);

    const baseData: BasePlayerData = {
        name: $('#meta h1').first().text().trim(),
        url: baseUrl,
        imageUrl: $('.media-item.multiple img').first().attr('src'),
        war: parseFloat($('.poptip[data-tip*="Wins Above Replacement"] + p').text()),
        years: extractYearRange($),
    }

    const isPositionPlayer = $('.poptip[data-tip*="Hits/At Bats"]').length > 0;
    if (isPositionPlayer) {
        return {
            ...baseData,
            average: parseFloat($('.poptip[data-tip*="Hits/At Bats"] + p').text()),
            hr: parseInt($('.poptip[data-tip="Home Runs Hit/Allowed"] + p').text(), 10),
            rbi: parseInt($('.poptip[data-tip="Runs Batted In"] + p').text(), 10),
        }
    }
    else {
        return {
            ...baseData,
            wins: parseInt($('.poptip[data-tip="Wins"] + p').text(), 10),
            losses: parseInt($('.poptip[data-tip="Losses"] + p').text(), 10),
            era: parseFloat($('.poptip[data-tip*="ERA"] + p').text()),
            saves: parseInt($('.poptip[data-tip="Saves"] + p').text(), 10),
            strikeouts: parseInt($('.poptip[data-tip="Strikeouts"] + p').text(), 10),
        }
    }
}