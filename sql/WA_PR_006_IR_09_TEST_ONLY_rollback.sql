-- TEST DATABASE ONLY. Separate authorization required. Disable the feature and
-- stop relevant traffic/maintenance before execution. Back up counters if needed.
-- This DDL auto-commits and permanently removes the new IP counter history.
DROP TABLE `wapps_test`.`LoginIpRateT`;
