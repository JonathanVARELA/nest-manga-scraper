import { Injectable } from '@nestjs/common';
const csv = require('csv-parser');
const fs = require('fs');

@Injectable()
export class CsvService {

  async getSelectorsFromCSVFile(type): Promise<string[]> {
    return await new Promise((resolve, _) => {
      const selectors = []
      fs.createReadStream(`./src/selectors/${type}-selectors.csv`)
        .pipe(csv())
        .on('data', (row) => {
          selectors.push(row.selector.replace(/"/g, '\"').replace(/'/g, '\''));
        })
        .on('end', () => {
          resolve(selectors);
        });
    });
  }
}