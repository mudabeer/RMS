export const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value)

export const shortId = (value: string) => `${value.slice(0, 6)}...${value.slice(-4)}`
