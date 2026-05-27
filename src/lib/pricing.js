/** Pro plan prices (USD) — single source for UI and checkout display */
export const PRO_MONTHLY_PRICE = 14.99;
export const PRO_YEARLY_PRICE = 104;

export const PRO_MONTHLY_DISPLAY = `$${PRO_MONTHLY_PRICE.toFixed(2)}`;
export const PRO_YEARLY_DISPLAY = `$${PRO_YEARLY_PRICE}`;

/** Payment / API amount strings */
export const PRO_MONTHLY_AMOUNT = PRO_MONTHLY_PRICE.toFixed(2);
export const PRO_YEARLY_AMOUNT = `${PRO_YEARLY_PRICE}.00`;
