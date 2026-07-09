/** Pro plan prices (USD) - single source for UI and checkout display */
export const PRO_MONTHLY_PRICE = 22.99;
export const PRO_YEARLY_PRICE = 228.99;

export const PRO_MONTHLY_DISPLAY = `$${PRO_MONTHLY_PRICE.toFixed(2)}`;
export const PRO_YEARLY_DISPLAY = `$${PRO_YEARLY_PRICE.toFixed(2)}`;

/** Yearly plan derived values */
export const PRO_YEARLY_MONTHLY = (PRO_YEARLY_PRICE / 12).toFixed(2);
export const PRO_YEARLY_MONTHLY_DISPLAY = `$${PRO_YEARLY_MONTHLY}`;
export const PRO_YEARLY_SAVINGS = ((PRO_MONTHLY_PRICE * 12) - PRO_YEARLY_PRICE).toFixed(0);

/** Payment / API amount strings */
export const PRO_MONTHLY_AMOUNT = PRO_MONTHLY_PRICE.toFixed(2);
export const PRO_YEARLY_AMOUNT = PRO_YEARLY_PRICE.toFixed(2);

