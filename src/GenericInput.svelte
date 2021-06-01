<script>
	import NumberInput from './NumberInput.svelte'
	import ColorInput from './ColorInput.svelte'
	import SelectInput from './SelectInput.svelte'
	
	export let type
	export let props
	export let value
</script>

{#if type === "number"}
	<NumberInput
		{props}
		bind:value
	/>
{:else if type === "color"}
	<ColorInput
		{props}
		bind:value
	/>
{:else if type === "select"}
	<SelectInput
		{props}
		bind:value
	/>
{/if}