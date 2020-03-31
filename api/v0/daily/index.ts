import { NowRequest, NowResponse } from '@now/node';
import scrape from 'scrape-it';
import R from 'ramda';
import backup from './_utils/backup';
import { formatProvince, formatDate } from './_utils/formatter';

const URL =
	'https://en.wikipedia.org/wiki/2020_coronavirus_pandemic_in_Argentina';

const hasNumber = x => x.match(/\d+\s+/g);

function buildOutput({ dates, provinces, content }) {
	//content is an array of number entries [1,2,4,5,6,......] we need to know wich nunmbers are for each day
	const numberOfColumns = 25; //provinces and total_infections total_deaths and so on
	let numberEntries = R.splitEvery(numberOfColumns, content); //[[entries for day 1], [entries for day 2]]

	return dates.reduce((acum, d, dateIndex) => {
		const provincesDateData = provinces.reduce((pAcum, pCur, pIndex) => {
			if (pCur !== 'Date' && pCur !== 'Provinces' && pCur !== 'Cases') {
				R.includes(pCur, [
					'total_infections',
					'total_deaths',
					'new_cases',
					'new_deaths',
				])
					? (pAcum[pCur] = numberEntries[dateIndex][pIndex])
					: (pAcum[pCur] = {
							confirmed: numberEntries[dateIndex][pIndex],
					  });
			}
			return pAcum;
		}, {});

		acum[d] = {
			...provincesDateData,
		};

		return acum;
	}, {});
}

async function main(request: NowRequest, response: NowResponse) {
	try {
		const { data } = await scrape(URL, {
			dates: {
				selector: '.wikitable.mw-collapsible tbody tr th',
				convert: x => {
					// data will have provinces colums and date rows
					const data = x.split('\n');

					const rows = data
						.filter(hasNumber)
						.map(formatDate)
						.filter(date => date.length === 10);

					return rows;
				},
			},
			provinces: {
				selector: '.wikitable.mw-collapsible tbody tr:nth-child(2) th',
				convert: provinces => provinces.split('\n').map(formatProvince),
			},
			content: {
				listItem: '.wikitable.mw-collapsible tbody tr td',
				convert: tableCell => {
					const replaceObject = x => (typeof x === 'object' ? '0' : x);
					const replaceNumbersInParents = x => x.replace(/\s*\([0-9]*\)/g, '');
					const replaceNumbersInBrackets = x => x.replace(/\s*\[.*\]/g, '');
					const replaceNull = x => x.replace(/—/g, 0);
					const formatNumber = R.compose(
						Number,
						replaceNull,
						replaceNumbersInParents,
						replaceNumbersInBrackets,
						replaceObject,
					);

					const formatted = formatNumber(tableCell);

					return formatted;
				},
			},
		});

		const output = buildOutput(data);
		response.status(200).send(output);
	} catch (e) {
		console.log(`${e}: Getting data from backup`);
		response.status(200).send(backup);
	}
}

export default main;
