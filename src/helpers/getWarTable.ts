import axios from 'axios';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';

const sampleDataPath = path.join(__dirname, '..', 'sample_data', 'war_table.html');

async function getWarTablePage(): Promise<void> {
    const baseUrl = 'https://www.baseball-reference.com/leaders/WAR_career.shtml';
  
    const response = await axios.get(baseUrl);
    const $ = cheerio.load(response.data);

    fs.writeFileSync(sampleDataPath, response.data);
}

export function loadWarTablePage(): cheerio.CheerioAPI {
    const html = fs.readFileSync(sampleDataPath, 'utf8');
    return cheerio.load(html);
}
