<script>
	export let props
	export let value
</script>

<select
	{...props}
	bind:value
>
	{#each props.options as option}
		<option value={option}>{option}</option>
	{/each}
</select>