import { cheerio, Root, Cheerio } from 'https://deno.land/x/cheerio@1.0.4/mod.ts';
import { MINISTRY_CODES } from './types.ts';
import { ClosingPage } from './ClosingPage.ts';
import { TenderNumber } from './TenderNumber.ts';
const URL = (
	Path: 'opening-tenders' | 'pre-tenders' | 'closing-tenders' | 'winning-bids',
	Page?: number,
	Ministry_code?: MINISTRY_CODES
) =>
	`https://capt.gov.kw/ar/tenders/${Path}/${(Page || Ministry_code) && '?'}${
		Ministry_code && `ministry_code=${Ministry_code}`
	}${Ministry_code && Page ? `&page=${Page}` : `page=${Page}`}`;

export const ParseHTMLOpeningTenders = async (Page: number, Ministry_code: MINISTRY_CODES) => {
	let result: Record<string, string>[] = [];
	let data = await fetch(URL('opening-tenders', Page, Ministry_code));
	let $ = cheerio.load(await data.text());
	let tables = $('.table');
	await tables.each((index, element) => {
		let record: Record<string, string> = {};
		$(element)
			.children('div')
			.each((index, ul) => {
				$(ul)
					.children('ul')
					.each((index, li) => {
						let key = '';
						let value = '';
						$(li)
							.children('li')
							.each((index, d) => {
								if (index === 0) {
									key = $(d).text().replaceAll('\n', ' ').replaceAll('...', '');
								} else {
									value = $(d).text().trim().replaceAll('\n', ' ').replaceAll('...', '');
								}
							});
						if (!key.includes('ملفات')) {
							record[key] = value;
						}
					});
			});
		result.push(record);
	});
	return { data: result, pages: $('.pagination').children().length - 2 };
};
const getTenderNumber = () => {
	let $ = cheerio.load(TenderNumber);
	let record: Record<string, string[]> = {};
	let options = $('.select2 > option').each((index, element) => {
		let id = $(element).attr('data-chained');
		if (id && !record[id]) {
			record[id] = [$(element).text()];
		}
		if (id && record) {
			record[id].push($(element).text());
		}
	});
	return record;
};
const getTenderData = ($: Root & Cheerio, id: number) => {
	let result: Record<string, string> = { id: `${id}` };
	$('.page-width.detail-list.detail-list-2')
		.children('ul')
		.each((index, ul) => {
			let key = '';
			let value = '';
			$(ul)
				.children('li')
				.each((index, li) => {
					if (index === 0) {
						key = $(li).text();
					} else {
						value = $(li).text();
					}
				});
			result[key] = value;
		});
	return result;
};
export const getRow = ($: Root & Cheerio, element: any, id: number) => {
	let record = {
		id: id,
		No: '',
		'Contractor number': '',
		'Contractor name': '',
		Status: '',
		Reason: '',
		'Offer Total': '',
	};

	$(element)
		.children('.table-cell')
		.each((index, element) => {
			switch (index) {
				case 0:
					record.No = $(element).text();
					break;
				case 1:
					record['Contractor number'] = $(element).text();
					break;
				case 2:
					record['Contractor name'] = $(element).text().replaceAll('\n', '').trim();
					break;
				case 3:
					record.Status = $(element).text().replaceAll('\n', '').trim();
					break;
				case 4:
					record.Reason = $(element).text().replaceAll('\n', '').trim();
					break;
				case 5:
					record['Offer Total'] = $(element).text().replaceAll('\n', '').trim();
					break;
			}
		});
	return record;
};
export const ParseHTMLClosingTenders = async () => {
	let data = getTenderNumber();
	let id = 0;
	let tenderlist: any = [];
	let companies: any = [];
	for (let i in data) {
		let ministry_code = i;
		for (let j in data[i]) {
			let tender_no = data[i][j];
			let url = `https://capt.gov.kw/en/tenders/closing-tenders/?ministry_code=${ministry_code}&ministry_code=${ministry_code}&tender_no=${tender_no}&ministry_code=${ministry_code}&tender_no=${tender_no}`;
			console.log(url);
			let request = await fetch(url, {
				headers: {
					accept: '*/*',
					'accept-language': 'en,ar;q=0.9,en-US;q=0.8',
					'x-requested-with': 'XMLHttpRequest',
				},
				method: 'GET',
			});
			let $ = cheerio.load(await request.text());
			tenderlist.push(getTenderData($, id));
			$('.table-row.tbody').each((index, element) => {
				let data = getRow($, element, id);
				companies.push(data);
			});
			id++;
		}
	}

	return { tenderlist, companies };
};
