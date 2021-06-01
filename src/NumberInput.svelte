<script>
	export let props
	export let value
</script>

<input
	type="number"
	{...props}
	bind:value
/>