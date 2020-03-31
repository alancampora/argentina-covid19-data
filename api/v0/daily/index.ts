import { NowRequest, NowResponse } from '@now/node';
import scrape from 'scrape-it';
import R from 'ramda';
import backup from './_utils/backup';
import { formatProvince, formatDate } from './_utils/formatter';

const URL =
	'https://en.wikipedia.org/wiki/2020_coronavirus_pandemic_in_Argentina';

const hasNumber = x => x.match(/\d+\s+/g);

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

		// creating one array with cells content for each day
		data.content = R.splitEvery(25, data.content);

		const dates = data.dates;
		const provinces = data.provinces;

		const formattedData = dates.reduce((acum, d, dateIndex) => {
			const provincesDateData = provinces.reduce((pAcum, pCur, pIndex) => {
				if (pCur !== 'Date' && pCur !== 'Provinces' && pCur !== 'Cases') {
					R.includes(pCur, [
						'total_infections',
						'total_deaths',
						'new_cases',
						'new_deaths',
					])
						? (pAcum[pCur] = data.content[dateIndex][pIndex])
						: (pAcum[pCur] = {
								confirmed: data.content[dateIndex][pIndex],
						  });
				}
				return pAcum;
			}, {});

			acum[d] = {
				...provincesDateData,
			};

			return acum;
		}, {});

		response.status(200).send(formattedData);
	} catch (e) {
		console.log(`${e}: Getting data from backup`);
		response.status(200).send(backup);
	}
}

export default main;
