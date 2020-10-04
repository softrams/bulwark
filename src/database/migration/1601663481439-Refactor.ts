import { MigrationInterface, QueryRunner } from 'typeorm';

export class Refactor1601663481439 implements MigrationInterface {
  name = 'Refactor1601663481439';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `organization` DROP FOREIGN KEY `FK_dd300fcfe06b849eca5a2d927c7`');
    await queryRunner.query('ALTER TABLE `file` DROP FOREIGN KEY `FK_a12e0709cb2128ae64e1992e4bc`');
    await queryRunner.query('DROP INDEX `REL_dd300fcfe06b849eca5a2d927c` ON `organization`');
    await queryRunner.query('DROP INDEX `IDX_a12e0709cb2128ae64e1992e4b` ON `file`');
    await queryRunner.query('DROP INDEX `REL_a12e0709cb2128ae64e1992e4b` ON `file`');
    await queryRunner.query('ALTER TABLE `organization` DROP COLUMN `avatarId`');
    await queryRunner.query('ALTER TABLE `file` DROP COLUMN `organizationId`');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `file` ADD `organizationId` int NULL');
    await queryRunner.query('ALTER TABLE `organization` ADD `avatarId` int NULL');
    await queryRunner.query('CREATE UNIQUE INDEX `REL_a12e0709cb2128ae64e1992e4b` ON `file` (`organizationId`)');
    await queryRunner.query('CREATE UNIQUE INDEX `IDX_a12e0709cb2128ae64e1992e4b` ON `file` (`organizationId`)');
    await queryRunner.query('CREATE UNIQUE INDEX `REL_dd300fcfe06b849eca5a2d927c` ON `organization` (`avatarId`)');
    await queryRunner.query(
      'ALTER TABLE `file` ADD CONSTRAINT `FK_a12e0709cb2128ae64e1992e4bc` FOREIGN KEY (`organizationId`) REFERENCES `organization`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE `organization` ADD CONSTRAINT `FK_dd300fcfe06b849eca5a2d927c7` FOREIGN KEY (`avatarId`) REFERENCES `file`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
  }
}
