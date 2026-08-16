CREATE TABLE `community_notification_preferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`reactionAlerts` boolean NOT NULL DEFAULT true,
	`replyAlerts` boolean NOT NULL DEFAULT true,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `community_notification_preferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `community_notification_preferences_user` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `community_notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`actorUserId` int NOT NULL,
	`postId` int NOT NULL,
	`type` enum('reaction','reply') NOT NULL,
	`readAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `community_notifications_id` PRIMARY KEY(`id`)
);
