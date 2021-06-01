<script>
  export let style
</script>

<style>
	input {
		font-size: var(--font-size);
		outline: none;
		color: var(--text-color-d0);
		background-color: var(--primary-color-l4);
		border-color: var(--primary-color-l3);
		border-radius: var(--border-radius);
    height: calc(var(--size) * var(--base-unit));
    width: 100%;
		transition: all .3s;
	}
	input:hover {
		background-color: var(--primary-color-l3);
		border-color: var(--primary-color-l1);
		box-shadow: 0 0 4px 0 var(--primary-color-l2);
	}
	input:focus {
		background-color: var(--primary-color-l2);
		border-color: var(--primary-color-l0);
		box-shadow: 0 0 8px 0 var(--primary-color-l2);
	}
</style>

<input {style} type="text" value="demo text"/>