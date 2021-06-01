<script>
  import GenericInput from './GenericInput.svelte'
	
	export let option
</script>


{#if option.data.length == 1}
	<label for={option.attr}>
		{option.attr} ({option.data[0].unit || option.data[0].indication || ""})
	</label>
	<GenericInput
		type={option.data[0].type}
		props={{...option.data[0], name: option.attr}}
		bind:value={option.data[0].value}
	/>
	<hr/>
{:else}
	{#each option.data as d}
		<label for={`${option.attr}_${d.attr}`}>
			{option.attr} {d.attr} ({d.unit || d.indication || ""})
		</label>
		<GenericInput
			type={d.type}
			props={{...d, name:`${option.attr}_${d.attr}`}}
			bind:value={d.value}
		/>
		<hr/>
	{/each}
{/if}