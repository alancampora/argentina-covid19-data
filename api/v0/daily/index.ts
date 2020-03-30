import { NowRequest, NowResponse } from '@now/node';
import scrape from 'scrape-it';
import R from 'ramda';

const URL =
	'https://en.wikipedia.org/wiki/2020_coronavirus_pandemic_in_Argentina';

const hasNumber = x => x.match(/\d+\s+/g);

const countriesFormatter = {
	Date: 'fecha',
	'City of Buenos Aires': 'caba',
	'Buenos Aires Province': 'buenos_aires',
	Chaco: 'cacho',
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
				const data = x.split('\n');

				let columns = data.filter(x => !hasNumber(x));

				const rows = data.filter(hasNumber);

				console.log({ columns, rows });

				columns = columns.map(c => countriesFormatter[c]);

				return [columns, rows];
			},
		},
		content: {
			listItem: '.wikitable.mw-collapsible tbody tr td',
			convert: x => {
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

				const formatted = formatNumber(x);

				return formatted;
			},
		},
	});

	data.content = R.splitEvery(24, data.content);

	const [countries, dates] = data.table;

	const formattedData = dates.reduce((acum, d, dateIndex) => {
		const countriesDateData = countries.reduce((cAcum, cCur, cIndex) => {
			if (cCur !== 'Date') {
				R.includes(cCur, [
					'total_infections',
					'total_deaths',
					'new_cases',
					'new_deaths',
				])
					? (cAcum[cCur] = data.content[dateIndex][cIndex - 1])
					: (cAcum[cCur] = {
							confirmed: data.content[dateIndex][cIndex - 1],
					  });
			}
			return cAcum;
		}, {});

		acum[d] = {
			...countriesDateData,
		};

		return acum;
	}, {});

	response.status(200).send(formattedData);
}

export default main;
