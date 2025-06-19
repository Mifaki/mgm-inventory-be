CREATE TABLE `borrows` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`item_id` text NOT NULL,
	`user_name` text NOT NULL,
	`user_email` text NOT NULL,
	`user_nim` text NOT NULL,
	`user_program_study` text NOT NULL,
	`user_ktm_url` text NOT NULL,
	`reason` text NOT NULL,
	`borrow_date` text NOT NULL,
	`pickup_date` text NOT NULL,
	`return_date` text NOT NULL,
	`status` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`item_id`) REFERENCES `items`(`id`) ON UPDATE no action ON DELETE cascade
);
