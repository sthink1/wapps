-- Wonderful Apps - Budget My Money / My Investments
-- Run against the Wonderful Apps MySQL database before installing the revised files.

CREATE TABLE BudgetMyMoneyT (
    MoneyID INT NOT NULL AUTO_INCREMENT,
    UserID INT NOT NULL,
    UserMoneyID INT NOT NULL,
    AccountPocket VARCHAR(150) NOT NULL,
    BalanceCurrent DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    CreatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME NULL,
    PRIMARY KEY (MoneyID),
    UNIQUE KEY UQ_BudgetMyMoneyT_User_UserMoneyID (UserID, UserMoneyID),
    KEY IX_BudgetMyMoneyT_UserID (UserID),
    CONSTRAINT FK_BudgetMyMoneyT_UsersT
        FOREIGN KEY (UserID) REFERENCES UsersT(UserID)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE BudgetMyInvestmentT (
    InvestmentID INT NOT NULL AUTO_INCREMENT,
    UserID INT NOT NULL,
    UserInvestmentID INT NOT NULL,
    Account VARCHAR(150) NOT NULL,
    BalanceCurrent DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    CreatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME NULL,
    PRIMARY KEY (InvestmentID),
    UNIQUE KEY UQ_BudgetMyInvestmentT_User_UserInvestmentID (UserID, UserInvestmentID),
    KEY IX_BudgetMyInvestmentT_UserID (UserID),
    CONSTRAINT FK_BudgetMyInvestmentT_UsersT
        FOREIGN KEY (UserID) REFERENCES UsersT(UserID)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB;
