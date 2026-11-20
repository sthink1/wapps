-- DESTRUCTIVE. NOT AUTOMATICALLY EXECUTED. HelioHost wapps_test ONLY.
-- Run ONLY after: (1) a fresh POST-migration DB export has been saved;
-- (2) the preflight confirms the correct DB, 18 subscriptions, expected data, and NO incoming FK;
-- (3) current server uses revised subscriptionService.js with no references to this table;
-- (4) the operator has confirmed the table is no longer needed for rollback.
-- DROP TABLE causes an implicit commit; START TRANSACTION cannot undo it.
-- DO NOT RUN ON wapps_production.
SELECT DATABASE() AS verify_this_is_wapps_test;
-- Execute the following statement separately ONLY after confirming the result above.
DROP TABLE `AdminSubscriptionGrantT`;
