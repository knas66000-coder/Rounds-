CREATE TABLE `community_posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`kind` enum('study_win','study_tip','encouragement') NOT NULL,
	`content` varchar(600) NOT NULL,
	`status` enum('active','deleted') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `community_posts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `community_reactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`postId` int NOT NULL,
	`userId` int NOT NULL,
	`type` enum('encourage') NOT NULL DEFAULT 'encourage',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `community_reactions_id` PRIMARY KEY(`id`),
	CONSTRAINT `community_reaction_user_post` UNIQUE(`postId`,`userId`)
);
--> statement-breakpoint
CREATE TABLE `community_replies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`postId` int NOT NULL,
	`userId` int NOT NULL,
	`content` varchar(400) NOT NULL,
	`status` enum('active','deleted') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `community_replies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `community_reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reporterId` int NOT NULL,
	`targetType` enum('post','reply') NOT NULL,
	`targetId` int NOT NULL,
	`reason` enum('privacy','harassment','exam_content','solicitation','other') NOT NULL,
	`status` enum('open','resolved') NOT NULL DEFAULT 'open',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `community_reports_id` PRIMARY KEY(`id`)
);
