export const parse_atomic = (atomic_amount: number, decimals: number) => {
    return atomic_amount / (10 ** decimals);
}