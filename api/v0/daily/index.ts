import { NowRequest, NowResponse } from '@now/node';
import scrape from 'scrape-it';
import R from 'ramda';

const URL =
	'https://en.wikipedia.org/wiki/2020_coronavirus_pandemic_in_Argentina';

const hasNumber = x => x.match(/\d+\s+/g);

const provincesFormatter = {
	Date: 'fecha',
	'City of Buenos Aires': 'caba',
	'Buenos Aires Province': 'buenos_aires',
	Chaco: 'chaco',
	Córdoba: 'cordoba',
	Corrientes: 'corrientes',
	'Entre Ríos': 'entre_rios',
	Jujuy: 'jujuy',
	'La Pampa': 'la_pampa',
	Mendoza: 'mendoza',
	Misiones: 'misiones',
	Neuquén: 'neuquen',
	'Río Negro': 'rio_negro',
	Salta: 'salta',
	'San Juan': 'san_juan',
	'San Luis': 'san_luis',
	'Santa Cruz': 'santa_cruz',
	'Santa Fe': 'santa_fe',
	'Santiago del Estero': 'sgo_del_stero',
	'Tierra del Fuego': 'tierra_del_fuego',
	Tucumán: 'tucuman',
	'Total infections[a]': 'total_infections',
	'Total deaths': 'total_deaths',
	'New cases[a]': 'new_cases',
	'New deaths': 'new_deaths',
};

async function main(request: NowRequest, response: NowResponse) {
	const { data } = await scrape(URL, {
		table: {
			selector: '.wikitable.mw-collapsible tbody tr th',
			convert: x => {
				// data will have provinces colums and date rows
				const data = x.split('\n');

				//provinces
				let columns = data
					.filter(x => !hasNumber(x))
					.map(c => provincesFormatter[c]);

				const rows = data.filter(hasNumber);

				return [columns, rows];
			},
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

	data.content = R.splitEvery(24, data.content);

	const [provinces, dates] = data.table;

	const formattedData = dates.reduce((acum, d, dateIndex) => {
		const provincesDateData = provinces.reduce((pAcum, pCur, pIndex) => {
			if (pCur !== 'Date') {
				R.includes(pCur, [
					'total_infections',
					'total_deaths',
					'new_cases',
					'new_deaths',
				])
					? (pAcum[pCur] = data.content[dateIndex][pIndex - 1])
					: (pAcum[pCur] = {
							confirmed: data.content[dateIndex][pIndex - 1],
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
}

export default main;
