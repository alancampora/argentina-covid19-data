export const formatProvince = province => {
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
		'Total infections': 'total_infections',
		'Total deaths': 'total_deaths',
		'New cases': 'new_cases',
		'New deaths': 'new_deaths',
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
