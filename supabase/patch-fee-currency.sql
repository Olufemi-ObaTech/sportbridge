-- =============================================================================
-- SportBridge — patch-fee-currency.sql
-- Adds fee_currency column to the opportunities table.
-- Run this in Supabase SQL Editor (safe to run multiple times).
-- =============================================================================

alter table public.opportunities
  add column if not exists fee_currency text not null default 'NGN'
    check (fee_currency in ('NGN','USD','GBP','EUR','GHS'));

-- Verify
select column_name, data_type, column_default
from information_schema.columns
where table_schema = 'public' and table_name = 'opportunities'
  and column_name = 'fee_currency';
