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
	main {
		--base-unit: 8px;
		font-size: var(--font-size);
		line-height: calc(1.5 * var(--font-size));
	}
	p {
		margin: calc(var(--size) * var(--base-unit) / 2	) 0
	}
</style>

<main style={mainTheme}>
	<Card>
		<Input {style}/>

		<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla pharetra efficitur hendrerit. Nunc urna orci, fringilla quis cursus a, scelerisque vel sem. Aenean sed elementum odio, in pretium magna. Nunc quis leo id nisl auctor mattis eget lacinia sem. Nulla libero lectus, imperdiet tempor arcu at, aliquet feugiat est. Sed ac justo nulla. Phasellus eleifend at ex vitae hendrerit. Etiam quis eros vitae ligula dapibus posuere. Sed eu tristique magna, scelerisque lobortis nulla. In et egestas massa, volutpat vestibulum elit.</p>
		<p>Cras rutrum eu nunc non sagittis. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce commodo massa sed justo condimentum lobortis. Nullam eget mauris at sapien blandit elementum. Quisque dignissim ipsum ut nisl sagittis luctus. Ut sed vulputate nisi. Nulla facilisi. Duis non gravida mi. Fusce pellentesque orci feugiat sem sodales cursus. Ut scelerisque nulla non vulputate cursus. In pretium lorem et dolor imperdiet, id cursus ligula malesuada. Duis vitae feugiat purus, at ornare eros. Donec purus mi, congue in tortor sed, rhoncus sagittis nulla.</p>

	</Card>
	</main>

	<hr/>

	{#each mainOptions as option}
		<InputGroup bind:option/>
	{/each}

	<hr/>

	{#each inputOptions as option}
		<InputGroup bind:option/>
	{/each}