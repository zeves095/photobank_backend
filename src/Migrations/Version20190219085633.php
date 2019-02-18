<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20190219085633 extends AbstractMigration
{
    public function getDescription() : string
    {
        return '';
    }

    public function up(Schema $schema) : void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('CREATE TABLE garbage_node (id VARCHAR(255) NOT NULL, parent_id VARCHAR(255) DEFAULT NULL, name VARCHAR(255) NOT NULL, INDEX IDX_227DD573727ACA70 (parent_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE = InnoDB');
        $this->addSql('ALTER TABLE garbage_node ADD CONSTRAINT FK_227DD573727ACA70 FOREIGN KEY (parent_id) REFERENCES garbage_node (id)');
        $this->addSql('ALTER TABLE resource ADD garbage_node_id VARCHAR(255) DEFAULT NULL');
        $this->addSql('ALTER TABLE resource ADD CONSTRAINT FK_BC91F416E20D2FC0 FOREIGN KEY (garbage_node_id) REFERENCES garbage_node (id)');
        $this->addSql('CREATE INDEX IDX_BC91F416E20D2FC0 ON resource (garbage_node_id)');
    }

    public function down(Schema $schema) : void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE garbage_node DROP FOREIGN KEY FK_227DD573727ACA70');
        $this->addSql('ALTER TABLE resource DROP FOREIGN KEY FK_BC91F416E20D2FC0');
        $this->addSql('DROP TABLE garbage_node');
        $this->addSql('DROP INDEX IDX_BC91F416E20D2FC0 ON resource');
        $this->addSql('ALTER TABLE resource DROP garbage_node_id');
    }
}
