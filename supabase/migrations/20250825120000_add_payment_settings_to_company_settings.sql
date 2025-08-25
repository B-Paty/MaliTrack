-- Add payment_settings JSONB to company_settings
alter table if exists public.company_settings
add column if not exists payment_settings jsonb;

-- Optional: comment for documentation
comment on column public.company_settings.payment_settings is 'Payment configuration: { bank: {enabled, bankName, accountName, accountNumber, cardImageUrl}, vodacom: {enabled, businessName, lipaNamba, vodacomImageUrl} }';


