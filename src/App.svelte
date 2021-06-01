<script>
  import Input from './Input.svelte'
  import Card from './Card.svelte'
  import InputGroup from './InputGroup.svelte'
	
  import inputOptions from './inputOptions.js'
  import mainOptions from './mainOptions.js'
  import colorUtils from './colorUtils.js'
	
	$: style = inputOptions.reduce((acc, option) => {
		let value = option.data.reduce((acc, d) => `${acc} ${d.value}${d.unit || ""} `, "")
		return `${acc}${option.attr}: ${value};`
	}, "")
	
	$: mainTheme = mainOptions.reduce((acc, option) => {
		if (option.data.length === 1 && option.data[0].type === "color") {
			return `${acc}${colorUtils.getShades(option.data[0].value, option.attr)};`
		} else {
			let value = option.data.reduce((acc, d) => `${acc} ${d.value}${d.unit || ""} `, "")
			return `${acc}--${option.attr}: ${value};`
		}
	}, "")
</script>

<style>
	body {
		--base-unit: 8px;
		font-size: var(--font-size);
	}
</style>

<body style={mainTheme}>
	<Card>
		<Input {style}/>
	</Card>
</body>

	<hr/>

	{#each mainOptions as option}
		<InputGroup bind:option/>
	{/each}

	<hr/>

	{#each inputOptions as option}
		<InputGroup bind:option/>
	{/each}