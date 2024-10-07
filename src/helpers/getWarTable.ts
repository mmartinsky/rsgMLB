import axios from 'axios';
import * as cheerio from 'cheerio';
    import * as fs from 'fs';

async function getWarTablePage(): Promise<void> {
    const baseUrl = 'https://www.baseball-reference.com/leaders/WAR_career.shtml';
  
    const response = await axios.get(baseUrl);
    const $ = cheerio.load(response.data);

    fs.writeFileSync('src/sample_data/war_table.html', response.data);
  }

  export function loadWarTablePage(): cheerio.CheerioAPI {
    const html = fs.readFileSync('src/sample_data/war_table.html', 'utf8');
    return cheerio.load(html);
  }

  getWarTablePage();