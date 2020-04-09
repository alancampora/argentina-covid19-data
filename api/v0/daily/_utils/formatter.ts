export const formatProvince = province => {
	const provincesFormatter = {
		Date: 'fecha',
		'BA (C)': 'caba',
		'BA (P)': 'buenos_aires',
		CH: 'chaco',
    CA: 'catamarca',
    CB: 'chubut',
		CD: 'cordoba',
		CR: 'corrientes',
		ER: 'entre_rios',
    FO: 'formosa',
		JJ: 'jujuy',
		LP: 'la_pampa',
		LR: 'la_rioja',
		MD: 'mendoza',
		MI: 'misiones',
		NE: 'neuquen',
		RN: 'rio_negro',
		SA: 'salta',
		SJ: 'san_juan',
		SL: 'san_luis',
		SC: 'santa_cruz',
		SF: 'santa_fe',
		SE: 'sgo_del_stero',
		TF: 'tierra_del_fuego',
		TU: 'tucuman',
		Total: 'total_infections',
		D: 'total_deaths',
		NC: 'new_cases',
		ND: 'new_deaths',
	};

	const formattedProvince = province.replace(/\s*\[.*\]/g, '');

	return provincesFormatter[formattedProvince];
};

export const formatDate = date => {
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
