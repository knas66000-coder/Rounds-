CREATE TABLE `rounds_accounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`email` varchar(320) NOT NULL,
	`passwordHash` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `rounds_accounts_id` PRIMARY KEY(`id`),
	CONSTRAINT `rounds_accounts_user` UNIQUE(`userId`),
	CONSTRAINT `rounds_accounts_email` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `rounds_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`tokenHash` varchar(64) NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `rounds_sessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `rounds_sessions_token_hash` UNIQUE(`tokenHash`)
);
