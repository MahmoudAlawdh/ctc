import { cheerio } from 'https://deno.land/x/cheerio@1.0.4/mod.ts';
import { MINISTRY_CODES } from './types.ts';
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
