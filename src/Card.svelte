<style>
	div {
		min-width: calc(25 * var(--base-unit));
		min-height: calc(25 * var(--base-unit));
		border-radius: var(--border-radius);
		padding: calc(1 * var(--base-unit));
		margin: calc(1 * var(--base-unit));
		box-shadow: 0 0 8px 1px var(--primary-color-l3);
	}
</style>

<div>
	<slot/>
</div>