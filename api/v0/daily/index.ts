import { NowRequest, NowResponse } from '@now/node';
import scrape from 'scrape-it';
import R from 'ramda';

const URL =
	'https://en.wikipedia.org/wiki/2020_coronavirus_pandemic_in_Argentina';

//async function main(request: NowRequest, response: NowResponse) {
//const browser = await puppeteer.launch({
//args: chromium.args,
//executablePath: await chromium.executablePath,
//headless: false,
//});

//const page = await browser.newPage();
//await page.goto(URL);
//await page.evaluate(() => {
//const table = document.querySelector(
//'.wikitable.mw-collapsible.mw-made-collapsible',
//);
//console.log({ table });
//});

//const { name = 'World' } = request.query;
//response.status(200).send(`Hello ${name}!`);
//}

const hasNumber = x => x.match(/\d+\s+/g);

async function newMain(request: NowRequest, response: NowResponse) {
	// Promise interface
	const { data } = await scrape(URL, {
		table: {
			selector: '.wikitable.mw-collapsible tbody tr th',
			convert: x => {
				const data = x.split('\n');

				const columns = data.filter(x => !hasNumber(x));

				const rows = data.filter(hasNumber);

				return [columns, rows];
			},
		},
		content: {
			listItem: '.wikitable.mw-collapsible tbody tr td',
		},
		title: '.firstHeading',
	});

	data.content = R.splitEvery(24, data.content);

	const [countries, dates] = data.table;

	const formattedData = dates.reduce((acum, d, dateIndex) => {
		const countriesDateData = countries.reduce((cAcum, cCur, cIndex) => {
			if (cCur !== 'Date') {
				cAcum[cCur] = {
					confirmed: data.content[dateIndex][cIndex - 1],
				};
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

export default newMain;
