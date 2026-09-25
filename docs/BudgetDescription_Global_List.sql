-- Wonderful Apps
-- BudgetDescriptionT global-description administration
-- Date: 2026-09-25
--
-- CURRENT CHANGE:
-- No database-changing SQL is required for this revision.
-- DescriptionID 25 has already been converted to a system/global description,
-- and the Savings row has already been deleted by the administrator.
--
-- The revised HTML forms now take their Description choices from BudgetDescriptionT
-- without front-end additions or exclusions for Savings or Vacation.

-- Verify the current global/system Description rows:
SELECT
    DescriptionID,
    UserID,
    UserDescriptionID,
    InOrOut,
    Description,
    IsSystemDescription,
    Active
FROM BudgetDescriptionT
WHERE UserID IS NULL
  AND IsSystemDescription = 1
ORDER BY InOrOut, Description;

-- FUTURE GLOBAL-DROPDOWN RULE:
-- When adding a NEW global Description, use a database row rather than hard-coding
-- the Description in an HTML form. Replace <InOrOut> and <Description> before use.
--
-- INSERT INTO BudgetDescriptionT
--     (UserID, UserDescriptionID, InOrOut, Description, IsSystemDescription, Active)
-- VALUES
--     (NULL, NULL, '<InOrOut>', '<Description>', 1, 1);

-- To promote an EXISTING user-specific Description to global/system status,
-- replace <DescriptionID> before use:
--
-- UPDATE BudgetDescriptionT
-- SET
--     UserID = NULL,
--     UserDescriptionID = NULL,
--     IsSystemDescription = 1
-- WHERE DescriptionID = <DescriptionID>;
