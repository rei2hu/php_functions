/*
The ABNF grammar [2] appears as follows:

   file = [header CRLF] record *(CRLF record) [CRLF]
   header = name *(COMMA name)
   record = field *(COMMA field)
   name = field
   field = (escaped / non-escaped)
   escaped = DQUOTE *(TEXTDATA / COMMA / CR / LF / 2DQUOTE) DQUOTE
   non-escaped = *TEXTDATA
   COMMA = %x2C
   CR = %x0D ;as per section 6.1 of RFC 2234 [2]
   DQUOTE =  %x22 ;as per section 6.1 of RFC 2234 [2]
   LF = %x0A ;as per section 6.1 of RFC 2234 [2]
   CRLF = CR LF ;as per section 6.1 of RFC 2234 [2]
   TEXTDATA =  %x20-21 / %x23-2B / %x2D-7E

dsv        -> record dsvrest

dsvrest    -> EOF
            | record dsvrest

record     -> field recordrest

recordrest -> COMMA field recordrest
            | CRLF

field      -> DQUOTE extext
            | TEXT
            | DDQUOTE

extext     -> TEXT extext
            | COMMA extext
            | CR extext
            | LF extext
            | 2DQUOTE extext
            | DQUOTE
*/

const COMMA = "\u002C";
const CR = "\u000D";
const DQUOTE= "\u0022";
const LF = "\u000A";
const TEXTDATA = "TEXTDATA";
const EOF = "EOF";
const CRLF = "\n";
// const CRLF = CR + LF;
const DDQUOTE= DQUOTE + DQUOTE;

let buf = [];
function* token_stream(str) {
	let pos = 0;
	while (pos < str.length) {
		if (buf.length > 0) {
			yield buf.shift();
		}
		let tok1 = str[pos];
		pos++;
		switch (tok1) {
			case COMMA:
			case LF:
				yield {type: tok1, value: tok1};
				break;
			case CR:
				if (str[pos] === LF) {
					pos++;
					yield {type: CRLF, value: CRLF};
				} else {
					yield {type: CR, value: CR};
				}
				break;
			case DQUOTE:
				if (str[pos] === DQUOTE) {
					pos++;
					yield {type: DDQUOTE, value: DDQUOTE};
				} else {
					yield {type: DQUOTE, value: DQUOTE};
				}
				break;
			default:
				let num = tok1.charCodeAt(0);
				// check delim here
				// (num > 0x2b && num < 0x2d) is a check for comma delimiters
				if (tok1 === COMMA || num < 0x20 || (num > 0x21 && num < 0x23) || num > 0x7e) {
					throw new Error("invalid char recieved " + tok1);
				}
				let rstr = tok1;
				if (pos < str.length) {
					tok1 = str[pos];
					num = tok1.charCodeAt(0);
					while (tok1 !== COMMA && !(num < 0x20 || (num > 0x21 && num < 0x23) || num > 0x7e)) {
						pos++;
						rstr += tok1;
						if (pos === str.length) { // ===
							break;
						}
						tok1 = str[pos];
						num = tok1.charCodeAt(0);
					}
				}
				yield {type: TEXTDATA, value: rstr};
		}
	}
	return {type: EOF, value: null};
}

let stream;
let out = [];
let line = [];
function parseRecord() {
	line = [];
	parseField();
	parseRecordRest();
	out.push(line);
}

function parseField() {
	const token = stream.next().value;
	if (token.type === DQUOTE) {
		line.push("");
		parseExtext();
	} else if (token.type === TEXTDATA) {
		line.push(token.value);
		// end
	} else if (token.type === DDQUOTE) {
		// end, a field like ,"",
		line.push(token.value);
	} else {
		throw new Error("invalid token in parseField() " + token.type);
	}
}

function parseExtext() {
	const token = stream.next().value;
	if (token.type === COMMA) {
		line[line.length - 1] += token.value;
		parseExtext();
	} else if (token.type === CR) {
		line[line.length - 1] += token.value;
		parseExtext();
	} else if (token.type === LF) {
		line[line.length - 1] += token.value;
		parseExtext();
	} else if (token.type === DDQUOTE) {
		line[line.length - 1] += token.value;
		parseExtext();
	} else if (token.type === TEXTDATA) {
		line[line.length - 1] += token.value;
		parseExtext();
	} else if (token.type === DQUOTE) {
		// end
	} else {
		throw new Error("invalid token in parseExtext() " + token.type);
	}
}

function parseRecordRest() {
	const token = stream.next().value;
	if (token.type === COMMA) {
		parseField();
		parseRecordRest();
	} else if (token.type === CRLF) {
		// end
	} else if (token.type === EOF) {
		// console.log('EOF reached');
		// end
	} else {
		throw new Error("invalid token in parseRecordRest() " + token.type);
	}
}

function parseCSVRest() {
	const token = stream.next().value;
	if (!token || token.type === EOF) {
		// console.log('EOF reached');
		// end
	} else {
		buf.unshift(token);
		parseRecord();
		parseCSVRest();
	}

}

function parseCSV(str, sep) {
	out = [];
	stream = token_stream(str, sep);
	parseRecord();
	parseCSVRest();
	return out;
}


module.exports = parseCSV;
