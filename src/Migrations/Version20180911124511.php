<?php declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20180911124511 extends AbstractMigration
{
    public function up(Schema $schema) : void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('CREATE TABLE catalogue_node (id INT AUTO_INCREMENT NOT NULL, parent_id INT DEFAULT NULL, name VARCHAR(255) NOT NULL, INDEX IDX_2E4A2E92727ACA70 (parent_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE = InnoDB');
        $this->addSql('CREATE TABLE resource (id INT AUTO_INCREMENT NOT NULL, item_id INT NOT NULL, path VARCHAR(255) NOT NULL, username VARCHAR(255) NOT NULL, preset INT NOT NULL, type INT NOT NULL, chunk_path VARCHAR(255) DEFAULT NULL, created_on VARCHAR(255) NOT NULL, filename VARCHAR(255) NOT NULL, src_filename VARCHAR(255) NOT NULL, INDEX IDX_BC91F416126F525E (item_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE = InnoDB');
        $this->addSql('CREATE TABLE catalogue_node_item (id INT AUTO_INCREMENT NOT NULL, node_id INT NOT NULL, name VARCHAR(255) DEFAULT NULL, item_code VARCHAR(11) NOT NULL, INDEX IDX_DF1FF842460D9FD7 (node_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE = InnoDB');
        $this->addSql('CREATE TABLE upload (id INT AUTO_INCREMENT NOT NULL, username VARCHAR(255) NOT NULL, completed TINYINT(1) NOT NULL, total_chunks BIGINT NOT NULL, completed_chunks BIGINT NOT NULL, file_hash VARCHAR(255) NOT NULL, filename VARCHAR(255) NOT NULL, item_id BIGINT NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE = InnoDB');
        $this->addSql('ALTER TABLE catalogue_node ADD CONSTRAINT FK_2E4A2E92727ACA70 FOREIGN KEY (parent_id) REFERENCES catalogue_node (id)');
        $this->addSql('ALTER TABLE resource ADD CONSTRAINT FK_BC91F416126F525E FOREIGN KEY (item_id) REFERENCES catalogue_node_item (id)');
        $this->addSql('ALTER TABLE catalogue_node_item ADD CONSTRAINT FK_DF1FF842460D9FD7 FOREIGN KEY (node_id) REFERENCES catalogue_node (id)');
    }

    public function down(Schema $schema) : void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE catalogue_node DROP FOREIGN KEY FK_2E4A2E92727ACA70');
        $this->addSql('ALTER TABLE catalogue_node_item DROP FOREIGN KEY FK_DF1FF842460D9FD7');
        $this->addSql('ALTER TABLE resource DROP FOREIGN KEY FK_BC91F416126F525E');
        $this->addSql('DROP TABLE catalogue_node');
        $this->addSql('DROP TABLE resource');
        $this->addSql('DROP TABLE catalogue_node_item');
        $this->addSql('DROP TABLE upload');
    }
}
