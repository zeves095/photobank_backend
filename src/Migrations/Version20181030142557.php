<?php declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20181030142557 extends AbstractMigration
{
    public function up(Schema $schema) : void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE resource CHANGE item_id item_id VARCHAR(11) DEFAULT NULL');
        //$this->addSql('ALTER TABLE catalogue_node_item DROP item_code, CHANGE id id VARCHAR(11) NOT NULL, CHANGE node_id node_id VARCHAR(11) NOT NULL');
        //$this->addSql('ALTER TABLE catalogue_node DROP catalogue_code, CHANGE id id VARCHAR(11) NOT NULL, CHANGE parent_id parent_id VARCHAR(11) DEFAULT NULL');
        $this->addSql('ALTER TABLE upload CHANGE item_id item_id VARCHAR(11) NOT NULL');
    }

    public function down(Schema $schema) : void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE catalogue_node ADD catalogue_code VARCHAR(11) DEFAULT NULL COLLATE utf8mb4_unicode_ci, CHANGE id id INT AUTO_INCREMENT NOT NULL, CHANGE parent_id parent_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE catalogue_node_item ADD item_code VARCHAR(11) NOT NULL COLLATE utf8mb4_unicode_ci, CHANGE id id INT AUTO_INCREMENT NOT NULL, CHANGE node_id node_id INT NOT NULL');
        $this->addSql('ALTER TABLE resource CHANGE item_id item_id INT NOT NULL');
        $this->addSql('ALTER TABLE upload CHANGE item_id item_id BIGINT NOT NULL');
    }
}
