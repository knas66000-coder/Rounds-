CREATE TABLE `case_chain_approvals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`chainId` varchar(120) NOT NULL,
	`status` enum('draft','approved','needs_revision') NOT NULL DEFAULT 'draft',
	`ownerNote` varchar(500) NOT NULL DEFAULT '',
	`updatedByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `case_chain_approvals_id` PRIMARY KEY(`id`),
	CONSTRAINT `case_chain_approvals_chain` UNIQUE(`chainId`)
);
