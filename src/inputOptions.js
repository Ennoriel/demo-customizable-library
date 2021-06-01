export default [
		
		/*{
			attr: "background-color",
			data: [
				{
					type: "color",
					value: "#33ff33",
				}
			]
		},
		{
			attr: "color",
			data: [
				{
					type: "color",
					value: "#33ffff",
				}
			]
		},
		{
			attr: "border",
			data: [
				{
					attr: "thickness",
					type: "number",
					min: 0,
					max: 5,
					step: 1,
					unit: "px",
					value: 1,
				},
				{
					attr: "format",
					type: "select",
					options: ["none", "hidden", "dotted", "dashed", "solid", "double", "groove", "ridge", "inset", "outset"],
					value: "solid",
				},
				{
					attr: "color",
					type: "color",
					value: "#ff3333",
				}
			]
		}*/
		{
			attr: "border-width",
			data: [
				{
					type: "number",
					min: 0,
					max: 5,
					step: 1,
					unit: "px",
					value: 1,
				}
			]
		},
		{
			attr: "border-style",
			data: [
				{
					type: "select",
					options: ["none", "hidden", "dotted", "dashed", "solid", "double", "groove", "ridge", "inset", "outset"],
					value: "solid",
				}
			]
		}
	]

