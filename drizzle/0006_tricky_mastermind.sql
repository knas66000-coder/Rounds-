CREATE TABLE `study_material_sections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`materialId` int NOT NULL,
	`position` int NOT NULL,
	`heading` varchar(180) NOT NULL,
	`content` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `study_material_sections_id` PRIMARY KEY(`id`),
	CONSTRAINT `study_material_sections_position` UNIQUE(`materialId`,`position`)
);
