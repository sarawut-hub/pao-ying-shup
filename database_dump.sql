-- RPS Royale SQLite Database Dump

CREATE TABLE `adonis_schema` (`id` integer not null primary key autoincrement, `name` varchar(255) not null, `batch` integer not null, `migration_time` datetime default CURRENT_TIMESTAMP);
INSERT INTO "adonis_schema" ("id", "name", "batch", "migration_time") VALUES (1, 'database/migrations/1758943358073_create_users_table', 1, '2026-03-24 01:25:34');
INSERT INTO "adonis_schema" ("id", "name", "batch", "migration_time") VALUES (2, 'database/migrations/1758943358074_create_rooms_table', 1, '2026-03-24 01:25:34');
INSERT INTO "adonis_schema" ("id", "name", "batch", "migration_time") VALUES (3, 'database/migrations/1758943358075_create_room_players_table', 1, '2026-03-24 01:25:34');
INSERT INTO "adonis_schema" ("id", "name", "batch", "migration_time") VALUES (4, 'database/migrations/1758943358076_create_matches_table', 1, '2026-03-24 01:25:34');

CREATE TABLE `adonis_schema_versions` (`version` integer, primary key (`version`));
INSERT INTO "adonis_schema_versions" ("version") VALUES (2);

CREATE TABLE `users` (`id` integer not null primary key autoincrement, `full_name` varchar(255) null, `email` varchar(254) not null, `password` varchar(255) not null, `created_at` datetime not null, `updated_at` datetime null);
INSERT INTO "users" ("id", "full_name", "email", "password", "created_at", "updated_at") VALUES (1, 'Sarawut Onsri', 'sarawut.o@kubota.com', '$scrypt$n=16384,r=8,p=1$ZWKbrZaZTr3R0Nr9htOWDQ$O4wTVSUF49YRumKBrckfGh4pMgtjmnlio4lwwkK9p6eTXA9OilLE735pf/2pX3jqGSt1ksUgiSi1Rnhq+TzYdA', '2026-03-24 01:39:43', '2026-03-24 01:39:43');

CREATE TABLE `rooms` (`id` integer not null primary key autoincrement, `code` varchar(255) not null, `host_id` integer, `status` varchar(255) not null default 'waiting', `current_round` integer not null default '0', `created_at` datetime not null, `updated_at` datetime null, foreign key(`host_id`) references `users`(`id`) on delete CASCADE);
INSERT INTO "rooms" ("id", "code", "host_id", "status", "current_round", "created_at", "updated_at") VALUES (1, '04825F', 1, 'waiting', 0, '2026-03-24 01:39:49', '2026-03-24 01:39:49');

CREATE TABLE `room_players` (`id` integer not null primary key autoincrement, `room_id` integer, `user_id` integer, `score` integer not null default '0', `created_at` datetime not null, `updated_at` datetime null, foreign key(`room_id`) references `rooms`(`id`) on delete CASCADE, foreign key(`user_id`) references `users`(`id`) on delete CASCADE);
INSERT INTO "room_players" ("id", "room_id", "user_id", "score", "created_at", "updated_at") VALUES (1, 1, 1, 0, '2026-03-24 01:39:49', '2026-03-24 01:39:49');

CREATE TABLE `matches` (`id` integer not null primary key autoincrement, `room_id` integer, `round_number` integer not null, `player1_id` integer, `player2_id` integer null, `p1_choice` varchar(255) null, `p2_choice` varchar(255) null, `winner_id` integer null, `created_at` datetime not null, `updated_at` datetime null, foreign key(`room_id`) references `rooms`(`id`) on delete CASCADE, foreign key(`player1_id`) references `users`(`id`) on delete CASCADE, foreign key(`player2_id`) references `users`(`id`) on delete CASCADE, foreign key(`winner_id`) references `users`(`id`) on delete CASCADE);

