CREATE TABLE `academic_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`institutionName` varchar(120) NOT NULL,
	`program` varchar(64) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `academic_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `academic_profiles_user` UNIQUE(`userId`)
);
