export default [
	{
		attr: "font-size",
		data: [
			{
				type: "number",
				min: 12,
				max: 24,
				unit: "px",
				step: 1,
				value: 16,
			}
		]
	},
	{
		attr: "size",
		data: [
			{
				type: "number",
				indication: "base unit (8px) multiplier",
				min: 2,
				max: 5,
				step: 1,
				value: 3,
			}
		]
	},
	{
		attr: "border-radius",
		data: [
			{
				type: "number",
				min: 0,
				max: 1,
				step: 0.05,
				unit: "em",
				value: 0.2,
			}
		]
	},
	{
		attr: "text-color",
		data: [
			{
				type: "color",
				value: "#333333",
			}
		]
	},
	{
		attr: "primary-color",
		data: [
			{
				type: "color",
				value: "#8f7cea",
			}
		]
	}
]