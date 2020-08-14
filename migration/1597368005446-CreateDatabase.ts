import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateDatabase1597368005446 implements MigrationInterface {
    name = 'CreateDatabase1597368005446'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `problem_location` (`id` int NOT NULL AUTO_INCREMENT, `location` varchar(255) NOT NULL, `target` varchar(255) NOT NULL, `vulnerabilityId` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `resource` (`id` int NOT NULL AUTO_INCREMENT, `description` varchar(255) NOT NULL, `url` varchar(255) NOT NULL, `vulnerabilityId` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `vulnerability` (`id` int NOT NULL AUTO_INCREMENT, `jiraId` varchar(255) NOT NULL, `impact` varchar(255) NOT NULL, `likelihood` varchar(255) NOT NULL, `risk` varchar(255) NOT NULL, `systemic` varchar(255) NOT NULL, `cvssScore` decimal(10,1) NOT NULL, `cvssUrl` varchar(255) NOT NULL, `status` varchar(255) NOT NULL, `description` varchar(4000) NOT NULL, `detailedInfo` varchar(4000) NOT NULL, `remediation` varchar(4000) NOT NULL, `name` varchar(255) NOT NULL, `assessmentId` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `file` (`id` int NOT NULL AUTO_INCREMENT, `fieldName` varchar(255) NOT NULL, `originalname` varchar(255) NOT NULL, `encoding` varchar(255) NOT NULL, `mimetype` varchar(255) NOT NULL, `buffer` mediumblob NOT NULL, `size` int NOT NULL, `vulnerabilityId` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `organization` (`id` int NOT NULL AUTO_INCREMENT, `name` varchar(255) NOT NULL, `status` varchar(255) NOT NULL, `avatarId` int NULL, UNIQUE INDEX `REL_dd300fcfe06b849eca5a2d927c` (`avatarId`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `jira` (`id` int NOT NULL AUTO_INCREMENT, `host` varchar(255) NOT NULL, `apiKey` varchar(255) NOT NULL, `username` varchar(255) NOT NULL, `assetId` int NULL, UNIQUE INDEX `REL_eb833524d95c3e4104d356e1d7` (`assetId`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `asset` (`id` int NOT NULL AUTO_INCREMENT, `name` varchar(255) NOT NULL, `status` varchar(255) NOT NULL, `organizationId` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `user` (`id` int NOT NULL AUTO_INCREMENT, `email` varchar(255) NOT NULL, `password` varchar(255) NOT NULL, `active` tinyint NOT NULL, `uuid` varchar(255) NOT NULL, `firstName` varchar(255) NOT NULL, `lastName` varchar(255) NOT NULL, `title` varchar(255) NOT NULL, UNIQUE INDEX `IDX_e12875dfb3b1d92d7d7c5377e2` (`email`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `assessment` (`id` int NOT NULL AUTO_INCREMENT, `name` varchar(255) NOT NULL, `executiveSummary` varchar(4000) NOT NULL, `jiraId` varchar(255) NOT NULL, `testUrl` varchar(255) NOT NULL, `prodUrl` varchar(255) NOT NULL, `scope` varchar(255) NOT NULL, `tag` varchar(255) NOT NULL, `startDate` datetime NOT NULL, `endDate` datetime NOT NULL, `assetId` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `vuln_dictionary` (`id` int NOT NULL AUTO_INCREMENT, `name` varchar(255) NOT NULL, `description` varchar(255) NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `assessment_testers_user` (`assessmentId` int NOT NULL, `userId` int NOT NULL, INDEX `IDX_0e0fa56ed5788e840dcd216b78` (`assessmentId`), INDEX `IDX_810b6324d8e9d048639bb98c42` (`userId`), PRIMARY KEY (`assessmentId`, `userId`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `problem_location` ADD CONSTRAINT `FK_9d4f3726667711f51102eb03252` FOREIGN KEY (`vulnerabilityId`) REFERENCES `vulnerability`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `resource` ADD CONSTRAINT `FK_750a244397bfd437126ff1ce4fd` FOREIGN KEY (`vulnerabilityId`) REFERENCES `vulnerability`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `vulnerability` ADD CONSTRAINT `FK_35722295c7f652a3029b9106b0a` FOREIGN KEY (`assessmentId`) REFERENCES `assessment`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `file` ADD CONSTRAINT `FK_b7317893c8543a8e3d50a8875ea` FOREIGN KEY (`vulnerabilityId`) REFERENCES `vulnerability`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `organization` ADD CONSTRAINT `FK_dd300fcfe06b849eca5a2d927c7` FOREIGN KEY (`avatarId`) REFERENCES `file`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `jira` ADD CONSTRAINT `FK_eb833524d95c3e4104d356e1d75` FOREIGN KEY (`assetId`) REFERENCES `asset`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `asset` ADD CONSTRAINT `FK_b2de941e08e677441006850d71a` FOREIGN KEY (`organizationId`) REFERENCES `organization`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `assessment` ADD CONSTRAINT `FK_c6471dac616a09c5b4422220107` FOREIGN KEY (`assetId`) REFERENCES `asset`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `assessment_testers_user` ADD CONSTRAINT `FK_0e0fa56ed5788e840dcd216b78d` FOREIGN KEY (`assessmentId`) REFERENCES `assessment`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `assessment_testers_user` ADD CONSTRAINT `FK_810b6324d8e9d048639bb98c429` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `assessment_testers_user` DROP FOREIGN KEY `FK_810b6324d8e9d048639bb98c429`");
        await queryRunner.query("ALTER TABLE `assessment_testers_user` DROP FOREIGN KEY `FK_0e0fa56ed5788e840dcd216b78d`");
        await queryRunner.query("ALTER TABLE `assessment` DROP FOREIGN KEY `FK_c6471dac616a09c5b4422220107`");
        await queryRunner.query("ALTER TABLE `asset` DROP FOREIGN KEY `FK_b2de941e08e677441006850d71a`");
        await queryRunner.query("ALTER TABLE `jira` DROP FOREIGN KEY `FK_eb833524d95c3e4104d356e1d75`");
        await queryRunner.query("ALTER TABLE `organization` DROP FOREIGN KEY `FK_dd300fcfe06b849eca5a2d927c7`");
        await queryRunner.query("ALTER TABLE `file` DROP FOREIGN KEY `FK_b7317893c8543a8e3d50a8875ea`");
        await queryRunner.query("ALTER TABLE `vulnerability` DROP FOREIGN KEY `FK_35722295c7f652a3029b9106b0a`");
        await queryRunner.query("ALTER TABLE `resource` DROP FOREIGN KEY `FK_750a244397bfd437126ff1ce4fd`");
        await queryRunner.query("ALTER TABLE `problem_location` DROP FOREIGN KEY `FK_9d4f3726667711f51102eb03252`");
        await queryRunner.query("DROP INDEX `IDX_810b6324d8e9d048639bb98c42` ON `assessment_testers_user`");
        await queryRunner.query("DROP INDEX `IDX_0e0fa56ed5788e840dcd216b78` ON `assessment_testers_user`");
        await queryRunner.query("DROP TABLE `assessment_testers_user`");
        await queryRunner.query("DROP TABLE `vuln_dictionary`");
        await queryRunner.query("DROP TABLE `assessment`");
        await queryRunner.query("DROP INDEX `IDX_e12875dfb3b1d92d7d7c5377e2` ON `user`");
        await queryRunner.query("DROP TABLE `user`");
        await queryRunner.query("DROP TABLE `asset`");
        await queryRunner.query("DROP INDEX `REL_eb833524d95c3e4104d356e1d7` ON `jira`");
        await queryRunner.query("DROP TABLE `jira`");
        await queryRunner.query("DROP INDEX `REL_dd300fcfe06b849eca5a2d927c` ON `organization`");
        await queryRunner.query("DROP TABLE `organization`");
        await queryRunner.query("DROP TABLE `file`");
        await queryRunner.query("DROP TABLE `vulnerability`");
        await queryRunner.query("DROP TABLE `resource`");
        await queryRunner.query("DROP TABLE `problem_location`");
    }

}
