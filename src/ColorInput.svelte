<script>
	export let props
	export let value
</script>

<input
	type="color"
	{...props}
	bind:value
/>