import { ParseHTMLOpeningTenders, ParseHTMLClosingTenders } from './networking.ts';
import { ministryCodesValues } from './types.ts';

const getAllOpeningTenders = async () => {
	let result: Record<string, string>[] = [];
	for (let i of ministryCodesValues) {
		let tmp = await ParseHTMLOpeningTenders(1, i);
		result = [...result, ...tmp.data];
		for (let j = 2; j <= tmp.pages; j++) {
			let data = await ParseHTMLOpeningTenders(j, i);
			result = [...result, ...data.data];
		}
	}
	return result;
};
// let data = await getAllOpeningTenders();
// Deno.writeTextFile('./data.json', JSON.stringify(data));
let data2 = await ParseHTMLClosingTenders();
Deno.writeTextFile('./ClosingTenderCompanies.json', JSON.stringify(data2.companies));
Deno.writeTextFile('./ClosingTenderdata.json', JSON.stringify(data2.tenderlist));
