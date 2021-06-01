const hexToDec = hex => parseInt(hex, 16)

const decToHex = dec => Math.round(dec).toString(16).padStart(2, '0')

const getDarkShade = (r, g, b, i) => `${decToHex(i * r)}${decToHex(i * g)}${decToHex(i * b)}`
const getLightShade = (r, g, b, i) => `${decToHex(r + (255 - r) * i)}${decToHex(g + (255 - g) * i)}${decToHex(b + (255 - b) * i)}`

const getShades = (hex, name, occ=5) => {
	console.log('!!')
	// 5 occ from 0.1 to 1
	let r = hexToDec(hex.substring(1, 3))
	let g = hexToDec(hex.substring(3, 5))
	let b = hexToDec(hex.substring(5, 7))
	return Array.from(Array(occ)).map((_, i) => i * 0.9 / (occ - 1) + 0.05)
								 .reverse()
	               .reduce((acc, fact, i) => `${acc} --${name}-d${i}: #${getDarkShade(r, g, b, fact)};--${name}-l${i}: #${getLightShade(r, g, b, 1 - fact /* varies between 0 and 0.9 */)};`, "")
}

export default {hexToDec, decToHex, getDarkShade, getShades}