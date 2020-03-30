import { NowRequest, NowResponse } from '@now/node';
import scrape from 'scrape-it';
import R from 'ramda';

const URL =
	'https://en.wikipedia.org/wiki/2020_coronavirus_pandemic_in_Argentina';

const hasNumber = x => x.match(/\d+\s+/g);

const formatProvince = province => {
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
		'La Rioja': 'la_rioja',
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

	return provincesFormatter[province];
};

const formatDate = date => {
	const formatMonth = month => {
		const monthsMapper = {
			Jan: '01',
			Feb: '02',
			Mar: '03',
			Apr: '04',
			May: '05',
			Jun: '06',
			Aug: '08',
			Sep: '09',
			Oct: '10',
			Nov: '11',
			Dec: '12',
		};
		return monthsMapper[month];
	};

	const formatDay = day => (day < 10 ? `0${day}` : day);
	const [day, month] = date.match(/\w+/g);
	const year = '2020';

	const formattedDay = formatDay(day);
	const formattedMonth = formatMonth(month);

	return `${year}-${formattedMonth}-${formattedDay}`;
};

async function main(request: NowRequest, response: NowResponse) {
	const { data } = await scrape(URL, {
		dates: {
			selector: '.wikitable.mw-collapsible tbody tr th',
			convert: x => {
				// data will have provinces colums and date rows
				const data = x.split('\n');

				const rows = data.filter(hasNumber).map(formatDate).filter(date => date.length===10);

				return rows;
			},
		},
		provinces: {
			selector: '.wikitable.mw-collapsible tbody tr:nth-child(2) th',
			convert: provinces => {
				const data = provinces.split('\n').map(formatProvince);
				return data;
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

	// creating one array with cells content for each day
  console.log(data.content);
	data.content = R.splitEvery(25, data.content);

	const dates = data.dates;
	const provinces = data.provinces;
  console.log({dates,provinces})

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
}

export default main;
