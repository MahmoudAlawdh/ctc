import { ParseHTMLOpeningTenders, ParseHTMLClosingTenders, ParseHTMLClassifications } from './networking.ts';
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
const getAllClosingTenders = async () => {
	return await ParseHTMLClosingTenders();
};
const getAllClassification = async () => {
	return await ParseHTMLClassifications();
};
// let data = await getAllOpeningTenders();
// Deno.writeTextFile('./data.json', JSON.stringify(data));
// let data2 = await getAllClosingTenders();
// Deno.writeTextFile('./ClosingTenderCompanies.json', JSON.stringify(data2.companies));
// Deno.writeTextFile('./ClosingTenderdata.json', JSON.stringify(data2.tenderlist));
let data3 = await getAllClassification();
Deno.writeTextFile('./Classification.json', JSON.stringify(data3));
