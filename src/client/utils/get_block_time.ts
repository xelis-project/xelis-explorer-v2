export const get_block_time_by_height = (height: number) => {
	if (height >= 3282150) {
		return 5000; // 5s
	}

	return 15000; // 15s
}

export const get_block_time_by_version = (version: number) => {
	if (version >= 3) {
		return 5000;
	}

	return 15000; // 15s
}