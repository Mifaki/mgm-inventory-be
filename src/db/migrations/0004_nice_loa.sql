ALTER TABLE `users` ADD `nim` text NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `users_nim_unique` ON `users` (`nim`);