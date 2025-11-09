/**
 * Postal code formats and examples for different countries
 */

interface PostalCodeFormat {
	format: string;
	example: string;
}

const postalCodeFormats: Record<string, PostalCodeFormat> = {
	"United States": {
		format: "##### or #####-####",
		example: "19603 or 19603-1234",
	},
	Canada: { format: "A#A #A#", example: "K1A 0B1" },
	"United Kingdom": { format: "AA# #AA or AA## #AA", example: "SW1A 1AA" },
	Germany: { format: "#####", example: "10115" },
	France: { format: "#####", example: "75001" },
	Australia: { format: "####", example: "2000" },
	Japan: { format: "###-####", example: "100-0001" },
	China: { format: "######", example: "100000" },
	India: { format: "######", example: "110001" },
	Brazil: { format: "#####-###", example: "01310-100" },
	Mexico: { format: "#####", example: "01000" },
	Netherlands: { format: "#### AA", example: "1012 AB" },
	Spain: { format: "#####", example: "28001" },
	Italy: { format: "#####", example: "00118" },
	Russia: { format: "######", example: "101000" },
	"South Korea": { format: "#####", example: "03187" },
	Switzerland: { format: "####", example: "8001" },
	Sweden: { format: "### ##", example: "100 05" },
	Poland: { format: "##-###", example: "00-950" },
	Belgium: { format: "####", example: "1000" },
	Austria: { format: "####", example: "1010" },
	Norway: { format: "####", example: "0001" },
	Denmark: { format: "####", example: "1000" },
	Finland: { format: "#####", example: "00100" },
	Ireland: { format: "A## ####", example: "D02 AF30" },
	Portugal: { format: "####-###", example: "1000-001" },
	Greece: { format: "### ##", example: "100 01" },
	"Czech Republic": { format: "### ##", example: "100 00" },
	Romania: { format: "######", example: "010001" },
	Hungary: { format: "####", example: "1011" },
	"New Zealand": { format: "####", example: "1010" },
	Singapore: { format: "######", example: "018956" },
	"South Africa": { format: "####", example: "0001" },
	Argentina: { format: "####", example: "1000" },
	Chile: { format: "#######", example: "8320000" },
	Colombia: { format: "######", example: "110111" },
	Peru: { format: "#####", example: "15001" },
	"United Arab Emirates": { format: "No postal code", example: "N/A" },
	"Saudi Arabia": { format: "#####", example: "11564" },
	Israel: { format: "#######", example: "9100001" },
	Turkey: { format: "#####", example: "34000" },
	Thailand: { format: "#####", example: "10100" },
	Vietnam: { format: "######", example: "100000" },
	Philippines: { format: "####", example: "1000" },
	Indonesia: { format: "#####", example: "10110" },
	Malaysia: { format: "#####", example: "50000" },
	Pakistan: { format: "#####", example: "44000" },
	Bangladesh: { format: "####", example: "1000" },
	Egypt: { format: "#####", example: "11511" },
	Nigeria: { format: "######", example: "100001" },
	Kenya: { format: "#####", example: "00100" },
	Ukraine: { format: "#####", example: "01001" },
};

/**
 * Get postal code format information for a country
 */
export function getPostalCodeFormat(country: string): PostalCodeFormat {
	return (
		postalCodeFormats[country] ?? {
			format: "Varies by country",
			example: "Enter postal code",
		}
	);
}
