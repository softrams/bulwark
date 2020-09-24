import {MigrationInterface, QueryRunner} from 'typeorm';

export class ConfigEntity1599240538440 implements MigrationInterface {
    name = 'ConfigEntity1599240538440'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query('CREATE TABLE `config` (`id` int NOT NULL AUTO_INCREMENT, `fromEmail` varchar(255) NULL, `fromEmailPassword` varchar(255) NULL, `companyName` varchar(255) NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB', undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query('DROP TABLE `config`', undefined);
    }

}
